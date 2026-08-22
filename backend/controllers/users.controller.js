const usersService = require("../services/users.service");

exports.getMe = async (req, res, next) => {
  try {
    const user = await usersService.getProfile(req.user.sub);
    res.json(user);
  } catch (err) {
    next(err);
  }
};

exports.updateMe = async (req, res, next) => {
  try {
    const user = await usersService.updateProfile(req.user.sub, req.body);
    res.json(user);
  } catch (err) {
    next(err);
  }
};

exports.uploadPhoto = async (req, res, next) => {
  try {
    if (!req.file)
      return res.status(400).json({ error: "Aucun fichier envoyé" });
    const photoUrl = `/uploads/${req.file.filename}`;
    const user = await usersService.updatePhoto(req.user.sub, photoUrl);
    res.json(user);
  } catch (err) {
    next(err);
  }
};

exports.updateChatBackground = async (req, res, next) => {
  try {
    const user = await usersService.updateChatBackground(
      req.user.sub,
      req.body.chatBackgroundUrl,
    );
    res.json(user);
  } catch (err) {
    next(err);
  }
};

exports.deleteMe = async (req, res, next) => {
  try {
    await usersService.deleteAccount(req.user.sub);
    res.json({ message: "Compte supprimé" });
  } catch (err) {
    next(err);
  }
};
// Récupérer tous les users

exports.getAllUsers = async (req, res, next) => {
  try {
    const { search = "" } = req.query;
    const users = await usersService.getAllUsers(search);

    // Retourner toujours un tableau, même vide
    res.json(users);
  } catch (err) {
    // Utiliser next(err) pour que l'erreur passe par votre middleware errorHandler
    next(err);
  }
};
