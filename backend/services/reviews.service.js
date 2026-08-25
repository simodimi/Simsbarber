const { Op } = require("sequelize");
const { Review, User, Reservation, Prestation } = require("../models");
const { ErreurMetier } = require("./auth.service");

/*async function creer(userId, data) {
  return Review.create({ ...data, userId });
}*/
async function creer(userId, { note, commentaire, reservationId }) {
  // Vérifier que la réservation existe et appartient à l'utilisateur
  const reservation = await Reservation.findByPk(reservationId);
  if (!reservation) throw new ErreurMetier("Réservation introuvable", 404);
  if (reservation.status !== "TERMINE") {
    throw new ErreurMetier(
      "Vous ne pouvez laisser un avis que sur une prestation confirmée",
      403,
    );
  }
  if (reservation.userId !== userId) {
    throw new ErreurMetier(
      "Vous ne pouvez pas laisser un avis sur cette réservation",
      403,
    );
  }

  // Vérifier qu'il n'y a pas déjà un avis
  const existing = await Review.findOne({ where: { reservationId } });
  if (existing)
    throw new ErreurMetier("Un avis existe déjà pour cette réservation", 409);

  return Review.create({ note, commentaire, reservationId, userId });
}
async function modifier(id, userId, data) {
  const review = await Review.findOne({ where: { id, userId } });
  if (!review) throw new ErreurMetier("Avis introuvable", 404);
  await review.update(data);
  return review;
}

async function supprimer(id, userId) {
  const review = await Review.findOne({ where: { id, userId } });
  if (!review) throw new ErreurMetier("Avis introuvable", 404);
  await review.destroy();
}

async function listerPourAdmin({ email, nom, note }) {
  const where = {};
  if (note) where.note = note;

  return Review.findAll({
    where,
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "nameUser", "mailUser", "photoUser"],
        where: {
          ...(email ? { mailUser: { [Op.like]: `%${email}%` } } : {}),
          ...(nom ? { nameUser: { [Op.like]: `%${nom}%` } } : {}),
        },
      },
    ],
    order: [["createdAt", "DESC"]],
  });
}
async function trouverParReservation(reservationId, userId) {
  // Vérifier que la réservation appartient à l'utilisateur
  const reservation = await Reservation.findByPk(reservationId);
  if (!reservation) throw new ErreurMetier("Réservation introuvable", 404);
  if (reservation.userId !== userId) {
    throw new ErreurMetier("Accès non autorisé", 403);
  }

  const review = await Review.findOne({
    where: { reservationId },
    include: [
      { model: User, as: "user", attributes: ["nameUser", "photoUser"] },
    ],
  });
  if (!review) throw new ErreurMetier("Aucun avis pour cette réservation", 404);
  return review;
}
async function lister({ minNote }) {
  const where = {};
  if (minNote && !isNaN(minNote)) {
    where.note = { [Op.gte]: Number(minNote) };
  }
  return Review.findAll({
    where,
    include: [
      {
        model: User,
        as: "user",
        attributes: ["nameUser", "photoUser"],
      },
    ],
    order: [["createdAt", "DESC"]],
  });
}

async function listerParPrestation(prestationId, minNote) {
  // 1. Récupérer les IDs des réservations qui contiennent cette prestation
  const reservationsWithPrestation = await Reservation.findAll({
    include: [
      {
        model: Prestation,
        as: "prestations",
        where: { id: prestationId },
        through: { attributes: [] }, // on ne récupère que les réservations
      },
    ],
    attributes: ["id"], // on ne veut que l'ID
  });

  const reservationIds = reservationsWithPrestation.map((r) => r.id);

  if (reservationIds.length === 0) {
    return []; // Aucune réservation, donc aucun avis
  }

  // 2. Récupérer les avis liés à ces réservations
  const where = {
    reservationId: { [Op.in]: reservationIds },
  };
  if (minNote && !isNaN(minNote)) {
    where.note = { [Op.gte]: Number(minNote) };
  }

  return Review.findAll({
    where,
    include: [
      {
        model: User,
        as: "user",
        attributes: ["nameUser", "photoUser"],
      },
    ],
    order: [["createdAt", "DESC"]],
  });
}
module.exports = {
  creer,
  modifier,
  supprimer,
  listerPourAdmin,
  trouverParReservation,
  lister,
  listerParPrestation,
};
