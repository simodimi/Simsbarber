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
async function compterNonLues({ recipientType, userId, adminId, type }) {
  return Notification.count({
    where: {
      recipientType,
      ...(userId ? { userId } : {}),
      ...(adminId ? { adminId } : {}),
      ...(type ? { type } : {}),
      read: false,
    },
  });
}

async function marquerNotificationsMessagesLues(userId) {
  await Notification.update(
    { read: true },
    {
      where: {
        recipientType: "USER",
        userId,
        type: "NOUVEAU_MESSAGE",
        read: false,
      },
    },
  );
}
async function marquerNotificationsAdminLues(adminId, userId) {
  await Notification.update(
    { read: true },
    {
      where: {
        recipientType: "ADMIN",
        adminId,
        type: "NOUVEAU_MESSAGE",
        link: `/admin/message?userId=${userId}`,
        read: false,
      },
    },
  );
}
module.exports = {
  creerNotification,
  listerPourUser,
  listerPourAdmin,
  marquerCommeLue,
  compterNonLues,
  marquerNotificationsMessagesLues,
  marquerNotificationsAdminLues,
};
