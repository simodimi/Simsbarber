const notificationsService = require("../services/notifications.service");

exports.mine = async (req, res, next) => {
  try {
    const notifs =
      req.user.role === "admin"
        ? await notificationsService.listerPourAdmin(req.user.sub)
        : await notificationsService.listerPourUser(req.user.sub);
    res.json(notifs);
  } catch (err) {
    next(err);
  }
};

exports.markRead = async (req, res, next) => {
  try {
    await notificationsService.marquerCommeLue(req.params.id);
    res.json({ message: "Notification marquée comme lue" });
  } catch (err) {
    next(err);
  }
};
