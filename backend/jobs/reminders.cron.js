const cron = require("node-cron");
const dayjs = require("dayjs");
const { Op } = require("sequelize");
const { Reservation, User } = require("../models");
const { envoyerEmail } = require("../config/mailer");
const notificationsService = require("../services/notifications.service");
const logger = require("../utils/logger");

async function envoyerRappels() {
  const debutDemain = dayjs().add(1, "day").startOf("day").toDate();
  const finDemain = dayjs().add(1, "day").endOf("day").toDate();
  const debutAujourdhui = dayjs().startOf("day").toDate();
  const finAujourdhui = dayjs().endOf("day").toDate();

  const reservationsDemain = await Reservation.findAll({
    where: {
      start: { [Op.between]: [debutDemain, finDemain] },
      status: "CONFIRME",
    },
    include: [{ model: User, as: "user" }],
  });

  const reservationsAujourdhui = await Reservation.findAll({
    where: {
      start: { [Op.between]: [debutAujourdhui, finAujourdhui] },
      status: "CONFIRME",
    },
    include: [{ model: User, as: "user" }],
  });

  for (const r of reservationsDemain) {
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
      html: `<p>Bonjour ${r.user.nameUser},</p><p>Petit rappel : vous avez rendez-vous demain à ${dayjs(r.start).format("HH:mm")} pour ${r.titre}.</p>`,
    });
  }

  for (const r of reservationsAujourdhui) {
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
      html: `<p>Bonjour ${r.user.nameUser},</p><p>Rappel : vous avez rendez-vous aujourd'hui à ${dayjs(r.start).format("HH:mm")} pour ${r.titre}.</p>`,
    });
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
