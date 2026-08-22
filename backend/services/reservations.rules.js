const dayjs = require("dayjs");
const { Op } = require("sequelize");
const { Reservation } = require("../models");
const { ErreurMetier } = require("./auth.service");

const HEURE_OUVERTURE = 9;
const HEURE_FERMETURE = 19;
const MAX_RESERVATIONS_PAR_JOUR = 2;

async function validerCreneau(
  { start, dureeTotal, userId },
  excludeReservationId = null,
) {
  const startDate = dayjs(start);

  if (startDate.isBefore(dayjs())) {
    throw new ErreurMetier("Impossible de réserver dans le passé", 400);
  }
  if (startDate.day() === 0) {
    throw new ErreurMetier("Le salon est fermé le dimanche", 400);
  }
  if (
    startDate.hour() < HEURE_OUVERTURE ||
    startDate.hour() >= HEURE_FERMETURE
  ) {
    throw new ErreurMetier(
      "Horaire en dehors des heures d'ouverture (9h-19h)",
      400,
    );
  }

  // Maximum 2 réservations par jour et par utilisateur (règle côté client).
  // On applique le contrôle dès qu'un userId est fourni (création utilisateur
  // OU création admin pour le compte d'un utilisateur), pour éviter qu'elle
  // soit contournable via la route admin.
  if (userId) {
    const debutJournee = startDate.startOf("day").toDate();
    const finJournee = startDate.endOf("day").toDate();
    const whereJour = {
      userId,
      status: { [Op.ne]: "ANNULE" },
      start: { [Op.gte]: debutJournee, [Op.lte]: finJournee },
    };
    if (excludeReservationId) whereJour.id = { [Op.ne]: excludeReservationId };

    const nombreReservationsJour = await Reservation.count({
      where: whereJour,
    });
    if (nombreReservationsJour >= MAX_RESERVATIONS_PAR_JOUR) {
      throw new ErreurMetier(
        `Vous avez déjà ${MAX_RESERVATIONS_PAR_JOUR} réservations ce jour-là (maximum autorisé)`,
        409,
      );
    }
  }

  const endDate = startDate.add(dureeTotal, "minute");
  const where = {
    status: { [Op.ne]: "ANNULE" },
    start: { [Op.lt]: endDate.toDate() },
    end: { [Op.gt]: startDate.toDate() },
  };
  if (excludeReservationId) where.id = { [Op.ne]: excludeReservationId };
  const chevauchement = await Reservation.findOne({ where });
  if (chevauchement) {
    throw new ErreurMetier(
      "Ce créneau chevauche une réservation existante",
      409,
    );
  }

  return { start: startDate.toDate(), end: endDate.toDate() };
}

module.exports = { validerCreneau, MAX_RESERVATIONS_PAR_JOUR };
