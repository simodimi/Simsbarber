const { Conversation, Message, User } = require("../models");
const { ErreurMetier } = require("./auth.service");
const notificationsService = require("./notifications.service");
const crypto = require("crypto");

async function obtenirOuCreerConversation(userId) {
  const [conversation] = await Conversation.findOrCreate({ where: { userId } });
  return conversation;
}

async function envoyerMessageUser(userId, { content, imageUrl }) {
  const conversation = await obtenirOuCreerConversation(userId);

  const message = await Message.create({
    conversationId: conversation.id,
    senderType: "USER",
    content,
    imageUrl,
  });

  conversation.lastMessageAt = new Date();
  await conversation.save();

  const { Admin } = require("../models");
  const admins = await Admin.findAll();
  await Promise.all(
    admins.map((admin) =>
      notificationsService.creerNotification({
        recipientType: "ADMIN",
        adminId: admin.id,
        type: "NOUVEAU_MESSAGE",
        content: "Nouveau message reçu",
        link: `/admin/message?userId=${userId}`,
      }),
    ),
  );

  return message;
}

async function envoyerMessageAdmin(userId, adminId, { content, imageUrl }) {
  const conversation = await obtenirOuCreerConversation(userId);

  const message = await Message.create({
    conversationId: conversation.id,
    senderType: "ADMIN",
    senderAdminId: adminId,
    content,
    imageUrl,
  });

  conversation.lastMessageAt = new Date();
  await conversation.save();

  await notificationsService.creerNotification({
    recipientType: "USER",
    userId,
    type: "NOUVEAU_MESSAGE",
    content: "Nouveau message du salon",
    link: "/profil/message",
  });

  return message;
}

/*async function envoyerBroadcast(adminId, { content, imageUrl }) {
  const users = await User.findAll({ attributes: ["id"] });

  const messages = await Promise.all(
    users.map(async (user) => {
      const conversation = await obtenirOuCreerConversation(user.id);
      const message = await Message.create({
        conversationId: conversation.id,
        senderType: "ADMIN",
        senderAdminId: adminId,
        content,
        imageUrl,
        isBroadcast: true,
      });
      conversation.lastMessageAt = new Date();
      await conversation.save();

      await notificationsService.creerNotification({
        recipientType: "USER",
        userId: user.id,
        type: "NOUVEAU_MESSAGE",
        content: "Nouvelle annonce du salon",
        link: "/profil/message",
      });

      return message;
    }),
  );

  return messages;
}*/
async function envoyerBroadcast(adminId, { content, imageUrl }) {
  const users = await User.findAll({ attributes: ["id"] });
  const broadcastGroupId = crypto.randomUUID();

  return Promise.all(
    users.map(async (user) => {
      const conversation = await obtenirOuCreerConversation(user.id);
      const message = await Message.create({
        conversationId: conversation.id,
        senderType: "ADMIN",
        senderAdminId: adminId,
        content,
        imageUrl,
        isBroadcast: true,
        broadcastGroupId,
      });
      conversation.lastMessageAt = new Date();
      await conversation.save();

      await notificationsService.creerNotification({
        recipientType: "USER",
        userId: user.id,
        type: "NOUVEAU_MESSAGE",
        content: "Nouvelle annonce du salon",
        link: "/profil/message",
      });
      return message;
    }),
  );
}
async function obtenirMesMessages(userId) {
  const conversation = await obtenirOuCreerConversation(userId);
  // Marquer les messages de l'admin comme lus
  await Message.update(
    { readAt: new Date() },
    {
      where: {
        conversationId: conversation.id,
        senderType: "ADMIN",
        readAt: null,
      },
    },
  );
  await notificationsService.marquerNotificationsMessagesLues(userId);
  return Message.findAll({
    where: { conversationId: conversation.id },
    order: [["createdAt", "ASC"]],
  });
}

async function obtenirMessagesAdmin(userId, adminId) {
  const conversation = await Conversation.findOne({ where: { userId } });
  if (!conversation) return [];

  await Message.update(
    { readAt: new Date() },
    {
      where: {
        conversationId: conversation.id,
        senderType: "USER",
        readAt: null,
      },
    },
  );
  await notificationsService.marquerNotificationsAdminLues(adminId, userId);
  return Message.findAll({
    where: { conversationId: conversation.id },
    order: [["createdAt", "ASC"]],
  });
}

/*async function listerConversationsAdmin() {
  const users = await User.findAll({
    attributes: ["id", "nameUser", "photoUser"],
    order: [["nameUser", "ASC"]],
  });

  const conversations = await Conversation.findAll();
  const convParUser = Object.fromEntries(
    conversations.map((c) => [c.userId, c]),
  );

  const nonLus = await Message.findAll({
    where: { senderType: "USER", readAt: null },
    attributes: [
      "conversationId",
      [
        Message.sequelize.fn("COUNT", Message.sequelize.col("idmessage")),
        "count",
      ],
    ],
    group: ["conversationId"],
    raw: true,
  });

  const convIdToUserId = Object.fromEntries(
    conversations.map((c) => [c.id, c.userId]),
  );
  const nonLusParUser = {};
  nonLus.forEach((row) => {
    const uid = convIdToUserId[row.conversationId];
    if (uid) nonLusParUser[uid] = Number(row.count);
  });

  return users
    .map((u) => ({
      userId: u.id,
      nameUser: u.nameUser,
      photoUser: u.photoUser,
      lastMessageAt: convParUser[u.id]?.lastMessageAt || null,
      unreadCount: nonLusParUser[u.id] || 0,
    }))
    .sort((a, b) => {
      if (!a.lastMessageAt && !b.lastMessageAt) return 0;
      if (!a.lastMessageAt) return 1;
      if (!b.lastMessageAt) return -1;
      return (
        new Date(b.lastMessageAt).getTime() -
        new Date(a.lastMessageAt).getTime()
      );
    });
}*/
async function listerConversationsAdmin() {
  const users = await User.findAll({
    attributes: ["id", "nameUser", "photoUser"],
    order: [["nameUser", "ASC"]],
  });

  const conversations = await Conversation.findAll();
  const convParUser = Object.fromEntries(
    conversations.map((c) => [c.userId, c]),
  );
  const convIdToUserId = Object.fromEntries(
    conversations.map((c) => [c.id, c.userId]),
  );

  const nonLus = await Message.findAll({
    where: { senderType: "USER", readAt: null },
    attributes: [
      "conversationId",
      [
        Message.sequelize.fn("COUNT", Message.sequelize.col("idmessage")),
        "count",
      ],
    ],
    group: ["conversationId"],
    raw: true,
  });
  const nonLusParUser = {};
  nonLus.forEach((row) => {
    const uid = convIdToUserId[row.conversationId];
    if (uid) nonLusParUser[uid] = Number(row.count);
  });

  // Dernier message par conversation
  const convIds = conversations.map((c) => c.id);
  const dernierMessages = await Message.findAll({
    where: { conversationId: convIds },
    order: [["createdAt", "DESC"]],
  });
  const lastMsgParConv = {};
  dernierMessages.forEach((m) => {
    if (!lastMsgParConv[m.conversationId]) lastMsgParConv[m.conversationId] = m;
  });

  return users
    .map((u) => {
      const conv = convParUser[u.id];
      const lastMsg = conv ? lastMsgParConv[conv.id] : null;
      return {
        userId: u.id,
        nameUser: u.nameUser,
        photoUser: u.photoUser,
        lastMessageAt: conv?.lastMessageAt || null,
        lastMessageContent: lastMsg?.content || null,
        lastMessageHasImage: !!lastMsg?.imageUrl,
        unreadCount: nonLusParUser[u.id] || 0,
      };
    })
    .sort((a, b) => {
      if (!a.lastMessageAt && !b.lastMessageAt) return 0;
      if (!a.lastMessageAt) return 1;
      if (!b.lastMessageAt) return -1;
      return (
        new Date(b.lastMessageAt).getTime() -
        new Date(a.lastMessageAt).getTime()
      );
    });
}
async function obtenirBroadcastsAdmin() {
  const messages = await Message.findAll({
    where: { isBroadcast: true },
    order: [["createdAt", "ASC"]],
  });
  const vus = new Set();
  return messages.filter((m) => {
    const cle = m.broadcastGroupId || m.id;
    if (vus.has(cle)) return false;
    vus.add(cle);
    return true;
  });
}
module.exports = {
  obtenirOuCreerConversation,
  envoyerMessageUser,
  envoyerMessageAdmin,
  envoyerBroadcast,
  obtenirMesMessages,
  obtenirMessagesAdmin,
  listerConversationsAdmin,
  obtenirBroadcastsAdmin,
};
