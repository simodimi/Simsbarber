const messagesService = require("../services/messages.service");

exports.mine = async (req, res, next) => {
  try {
    res.json(await messagesService.obtenirMesMessages(req.user.sub));
  } catch (err) {
    next(err);
  }
};

exports.send = async (req, res, next) => {
  try {
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
    const message = await messagesService.envoyerMessageUser(req.user.sub, {
      content: req.body.content,
      imageUrl,
    });
    const io = req.app.get("io");
    if (io) io.to("admins").emit("message:new", message);
    res.status(201).json(message);
  } catch (err) {
    next(err);
  }
};

exports.adminConversations = async (req, res, next) => {
  try {
    res.json(await messagesService.listerConversationsAdmin());
  } catch (err) {
    next(err);
  }
};

exports.adminMessagesForUser = async (req, res, next) => {
  try {
    res.json(
      await messagesService.obtenirMessagesAdmin(
        req.params.userId,
        req.user.sub,
      ),
    );
  } catch (err) {
    next(err);
  }
};

exports.adminSend = async (req, res, next) => {
  try {
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
    const message = await messagesService.envoyerMessageAdmin(
      req.params.userId,
      req.user.sub,
      {
        content: req.body.content,
        imageUrl,
      },
    );
    const io = req.app.get("io");
    if (io) io.to(`user:${req.params.userId}`).emit("message:new", message);
    res.status(201).json(message);
  } catch (err) {
    next(err);
  }
};

exports.broadcast = async (req, res, next) => {
  try {
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
    const messages = await messagesService.envoyerBroadcast(req.user.sub, {
      content: req.body.content,
      imageUrl,
    });
    const io = req.app.get("io");
    if (io) io.emit("message:broadcast", messages);
    res.status(201).json(messages);
  } catch (err) {
    next(err);
  }
};
exports.adminBroadcastHistory = async (req, res, next) => {
  try {
    res.json(await messagesService.obtenirBroadcastsAdmin());
  } catch (err) {
    next(err);
  }
};
