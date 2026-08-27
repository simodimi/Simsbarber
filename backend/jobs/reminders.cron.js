const cron = require("node-cron");
const dayjs = require("dayjs");
require("dayjs/locale/fr");
dayjs.locale("fr");
const { Op } = require("sequelize");
const { Reservation, User, Prestation, Category } = require("../models");
const { envoyerEmail } = require("../config/mailer");
const notificationsService = require("../services/notifications.service");
const logger = require("../utils/logger");

async function envoyerRappels() {
  const debutDemain = dayjs().add(1, "day").startOf("day").toDate();
  const finDemain = dayjs().add(1, "day").endOf("day").toDate();
  const debutAujourdhui = dayjs().startOf("day").toDate();
  const finAujourdhui = dayjs().endOf("day").toDate();

  // Requête pour les réservations de demain avec prestations et catégories
  const reservationsDemain = await Reservation.findAll({
    where: {
      start: { [Op.between]: [debutDemain, finDemain] },
      status: "CONFIRME",
    },
    include: [
      { model: User, as: "user" },
      {
        model: Prestation,
        as: "prestations",
        include: [{ model: Category, as: "category" }],
      },
    ],
  });

  // Requête pour les réservations d'aujourd'hui
  const reservationsAujourdhui = await Reservation.findAll({
    where: {
      start: { [Op.between]: [debutAujourdhui, finAujourdhui] },
      status: "CONFIRME",
    },
    include: [
      { model: User, as: "user" },
      {
        model: Prestation,
        as: "prestations",
        include: [{ model: Category, as: "category" }],
      },
    ],
  });

  // Fonction utilitaire pour construire le corps de l'email
  function construireHtml(reservation, jour) {
    const prestations = reservation.prestations || [];
    const categories = prestations
      .map((p) => p.category?.nom)
      .filter(Boolean)
      .join(", ");
    const descriptions = prestations
      .map((p) => p.descriptionCourte || p.descriptionComplete)
      .filter(Boolean)
      .join(" / ");
    const dateFormatted = dayjs(reservation.start).format(
      "dddd D MMMM YYYY à HH:mm",
    );

    return `
     <div style="text-align: center; margin-bottom: 20px;">
      <img src="http://localhost:5000/logo2.png" alt="Sim'sBarber Logo" style="max-width: 200px; height: auto;" />
    </div>
      <p>Bonjour ${reservation.user.nameUser},</p>
      <p>Rappel : vous avez rendez-vous <strong>${jour}</strong> le <strong>${dateFormatted}</strong> pour <strong>${reservation.titre}</strong>.</p>
      ${categories ? `<p>Catégories : ${categories}</p>` : ""}
      ${descriptions ? `<p>Description : ${descriptions}</p>` : ""}
      ${reservation.description ? `<p>Note supplémentaire : ${reservation.description}</p>` : ""}
      <p>À très vite !</p>
    `;
  }

  // Envoi pour les réservations de demain (J-1)
  for (const r of reservationsDemain) {
    try {
      await notificationsService.creerNotification({
        recipientType: "USER",
        userId: r.userId,
        type: "RESERVATION_RAPPEL_J1",
        content: `Rappel : vous avez rendez-vous demain à ${dayjs(r.start).format("HH:mm")} (${r.titre})`,
        link: "/profil/reservation",
      });

      await envoyerEmail({
        to: r.user.mailUser,
        subject: "Rappel de votre rendez-vous demain",
        html: construireHtml(r, "demain"),
      });
    } catch (err) {
      logger.error(`Erreur pour la réservation ${r.id} (J-1):`, err);
    }
  }

  // Envoi pour les réservations d'aujourd'hui (jour J)
  for (const r of reservationsAujourdhui) {
    try {
      await notificationsService.creerNotification({
        recipientType: "USER",
        userId: r.userId,
        type: "RESERVATION_RAPPEL_JOURJ",
        content: `Rappel : votre rendez-vous est aujourd'hui à ${dayjs(r.start).format("HH:mm")} (${r.titre})`,
        link: "/profil/reservation",
      });

      await envoyerEmail({
        to: r.user.mailUser,
        subject: "Votre rendez-vous est aujourd'hui",
        html: construireHtml(r, "aujourd'hui"),
      });
    } catch (err) {
      logger.error(`Erreur pour la réservation ${r.id} (jour J):`, err);
    }
  }

  logger.info(
    `Rappels envoyés : ${reservationsDemain.length} (J-1), ${reservationsAujourdhui.length} (jour J)`,
  );
}

function startReminderCron() {
  // tous les jours à 08:00
  cron.schedule("0 8 * * *", () => {
    envoyerRappels().catch((err) => logger.error("Erreur envoi rappels:", err));
  });
  logger.info(
    "Cron des rappels de réservation démarré (tous les jours à 08:00)",
  );
}

module.exports = { startReminderCron, envoyerRappels };
//if (process.env.NODE_ENV !== "production") envoyerRappels();
