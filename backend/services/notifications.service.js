const { Notification } = require("../models");

async function creerNotification({
  recipientType,
  userId,
  adminId,
  type,
  content,
  link,
}) {
  const notif = await Notification.create({
    recipientType,
    userId,
    adminId,
    type,
    content,
    link,
  });
  return notif;
}

async function listerPourUser(userId) {
  return Notification.findAll({
    where: { recipientType: "USER", userId },
    order: [["createdAt", "DESC"]],
  });
}

async function listerPourAdmin(adminId) {
  return Notification.findAll({
    where: { recipientType: "ADMIN", adminId },
    order: [["createdAt", "DESC"]],
  });
}

async function marquerCommeLue(id) {
  await Notification.update({ read: true }, { where: { id } });
}

module.exports = {
  creerNotification,
  listerPourUser,
  listerPourAdmin,
  marquerCommeLue,
};
