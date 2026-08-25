const dayjs = require("dayjs");
const {
  sequelize,
  Reservation,
  Prestation,
  User,
  Category,
} = require("../models");
const { validerCreneau } = require("./reservations.rules");
const { ErreurMetier } = require("./auth.service");
const notificationsService = require("./notifications.service");
const { Op } = require("sequelize");
const DELAI_ANNULATION_HEURES = 24;

async function _construireReservation({
  userId,
  createdByAdminId,
  start,
  prestationIds,
  description,
  pictureUrl,
}) {
  const prestations = await Prestation.findAll({
    where: { id: prestationIds },
  });
  if (prestations.length !== prestationIds.length) {
    throw new ErreurMetier(
      "Une ou plusieurs prestations sont introuvables",
      404,
    );
  }

  const prixTotal = prestations.reduce((sum, p) => sum + p.prix, 0);
  const dureeTotal = prestations.reduce((sum, p) => sum + p.duree, 0);
  const { start: startDate, end: endDate } = await validerCreneau({
    start,
    dureeTotal,
    userId,
  });

  const t = await sequelize.transaction();
  try {
    const reservation = await Reservation.create(
      {
        userId,
        createdByAdminId,
        start: startDate,
        end: endDate,
        description,
        pictureUrl,
        prixTotal,
        dureeTotal,
        titre: prestations.map((p) => p.nom).join(" + "),
        descriptionComplete: prestations
          .map((p) => p.descriptionCourte)
          .join(" / "),
        categoriesSelectionnees: prestations.map((p) => p.categoryId),
        status: "CONFIRME",
      },
      { transaction: t },
    );

    for (const p of prestations) {
      await reservation.addPrestation(p, {
        through: { prixSnapshot: p.prix },
        transaction: t,
      });
    }

    await t.commit();
    return reservation;
  } catch (err) {
    await t.rollback();
    throw err;
  }
}

async function creerReservation(data, userId) {
  return _construireReservation({ ...data, userId });
}

async function creerReservationAdmin(data, adminId) {
  return _construireReservation({
    ...data,
    userId: data.userId,
    createdByAdminId: adminId,
  });
}

// Annulation par l'administrateur : possible à tout moment, sur n'importe
// quelle réservation.
async function annulerReservation(id) {
  const reservation = await Reservation.findByPk(id);
  if (!reservation) throw new ErreurMetier("Réservation introuvable", 404);

  reservation.status = "ANNULE";
  await reservation.save();

  await notificationsService.creerNotification({
    recipientType: "USER",
    userId: reservation.userId,
    type: "RESERVATION_ANNULEE",
    content: "Votre réservation a été annulée par le salon",
    link: "/calendrier",
  });

  return reservation;
}

// Annulation par le client lui-même : uniquement sur SES réservations, et
// uniquement si on est à plus de 24h du début. En dessous de ce délai, seul
// l'administrateur peut annuler (cf. annulerReservation ci-dessus).
async function annulerReservationUtilisateur(id, userId) {
  const reservation = await Reservation.findByPk(id);
  if (!reservation) throw new ErreurMetier("Réservation introuvable", 404);

  if (reservation.userId !== userId) {
    throw new ErreurMetier(
      "Vous n'êtes pas autorisé à annuler cette réservation",
      403,
    );
  }
  if (reservation.status === "ANNULE") {
    throw new ErreurMetier("Cette réservation est déjà annulée", 400);
  }
  if (reservation.status === "TERMINE") {
    throw new ErreurMetier(
      "Impossible d'annuler une prestation déjà terminée",
      400,
    );
  }

  const heuresAvantDebut = dayjs(reservation.start).diff(dayjs(), "hour", true);
  if (heuresAvantDebut < DELAI_ANNULATION_HEURES) {
    throw new ErreurMetier(
      `Impossible d'annuler à moins de ${DELAI_ANNULATION_HEURES}h du rendez-vous. Merci de contacter directement le salon.`,
      403,
    );
  }

  reservation.status = "ANNULE";
  await reservation.save();

  // ⚠️ à vérifier selon votre implémentation de notificationsService :
  // ici on notifie le salon (et non le client) puisque c'est lui qui a
  // annulé. Adaptez recipientType si "ADMIN" n'existe pas tel quel.
  await notificationsService.creerNotification({
    recipientType: "ADMIN",
    type: "RESERVATION_ANNULEE_PAR_CLIENT",
    content: `Une réservation (${reservation.titre}) a été annulée par le client`,
    link: "/admin/calendrier",
  });

  return reservation;
}

async function modifierReservation(id, data) {
  const reservation = await Reservation.findByPk(id);
  if (!reservation) throw new ErreurMetier("Réservation introuvable", 404);

  if (data.start || data.prestationIds) {
    const prestationIds = data.prestationIds
      ? data.prestationIds
      : (await reservation.getPrestations()).map((p) => p.id);
    const prestations = await Prestation.findAll({
      where: { id: prestationIds },
    });
    const dureeTotal = prestations.reduce((sum, p) => sum + p.duree, 0);
    const startValue = data.start || reservation.start;

    const { start, end } = await validerCreneau(
      { start: startValue, dureeTotal, userId: reservation.userId },
      id,
    ); // 2e argument = exclure CETTE réservation du contrôle de chevauchement/quota
    data.start = start;
    data.end = end;
    data.dureeTotal = dureeTotal;
    data.prixTotal = prestations.reduce((sum, p) => sum + p.prix, 0);

    if (data.prestationIds) {
      await reservation.setPrestations([]); // on vide la relation existante
      for (const p of prestations) {
        await reservation.addPrestation(p, {
          through: { prixSnapshot: p.prix },
        });
      }
    }
  }

  await reservation.update(data);
  return reservation;
}

async function supprimerReservation(id) {
  const reservation = await Reservation.findByPk(id);
  if (!reservation) throw new ErreurMetier("Réservation introuvable", 404);
  await reservation.destroy();
}

/*async function listerMesReservations(
  userId,
  { page = 1, itemsParPage = 3 } = {},
) {
  const offset = (page - 1) * itemsParPage;

  const { rows: passees, count: totalPassees } =
    await Reservation.findAndCountAll({
      where: { userId, start: { [require("sequelize").Op.lt]: new Date() } },
      include: [{ model: Prestation, as: "prestations" }],
      order: [["start", "DESC"]],
      limit: itemsParPage,
      offset,
    });

  const { rows: aVenir, count: totalAVenir } =
    await Reservation.findAndCountAll({
      where: { userId, start: { [require("sequelize").Op.gte]: new Date() } },
      include: [{ model: Prestation, as: "prestations" }],
      order: [["start", "ASC"]],
      limit: itemsParPage,
      offset,
    });

  return { passees, totalPassees, aVenir, totalAVenir };
}*/
async function listerMesReservations(
  userId,
  { type = "all", page = 1, itemsParPage = 3 } = {},
) {
  const offset = (page - 1) * itemsParPage;
  const where = { userId };

  if (type === "past") {
    where.start = { [Op.lt]: new Date() };
  } else if (type === "upcoming") {
    where.start = { [Op.gte]: new Date() };
  }
  // sinon "all" – pas de filtre sur la date (mais on va plutôt renvoyer les deux séparément comme avant pour ne pas casser)

  // On ne garde que le type pour la pagination, car on veut deux listes distinctes.
  // On peut donc simplement réutiliser la même fonction avec un paramètre type.
  const { rows, count } = await Reservation.findAndCountAll({
    where,
    include: [
      {
        model: Prestation,
        as: "prestations",
        include: [{ model: Category, as: "category" }],
      },
    ],
    order: [["start", type === "past" ? "DESC" : "ASC"]],
    limit: itemsParPage,
    offset,
  });

  return { data: rows, total: count };
}
async function listerToutes(userId) {
  return Reservation.findAll({
    where: userId ? { userId } : {},
    include: [
      { model: User, as: "user", attributes: ["id", "nameUser", "mailUser"] },
      {
        model: Prestation,
        as: "prestations",
        include: [{ model: Category, as: "category" }],
      },
    ],
    order: [["start", "ASC"]],
  });
}
async function marquerTerminee(id) {
  const reservation = await Reservation.findByPk(id);
  if (!reservation) throw new ErreurMetier("Réservation introuvable", 404);
  reservation.status = "TERMINE";
  await reservation.save();
  return reservation;
}
async function demarquerTerminee(id) {
  const reservation = await Reservation.findByPk(id);
  if (!reservation) throw new ErreurMetier("Réservation introuvable", 404);
  reservation.status = "CONFIRME";
  await reservation.save();
  return reservation;
}
module.exports = {
  creerReservation,
  creerReservationAdmin,
  annulerReservation,
  annulerReservationUtilisateur,
  modifierReservation,
  supprimerReservation,
  listerMesReservations,
  listerToutes,
  marquerTerminee,
  demarquerTerminee,
};
