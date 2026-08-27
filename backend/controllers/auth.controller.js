const authService = require("../services/auth.service");

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

exports.register = async (req, res, next) => {
  try {
    const { user, accessToken, refreshToken } = await authService.inscrireUser(
      req.body,
    );
    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
    res.status(201).json({
      accessToken,
      user: { id: user.id, nameUser: user.nameUser, mailUser: user.mailUser },
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { user, accessToken, refreshToken } = await authService.connecterUser(
      req.body,
    );
    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
    res.status(200).json({
      accessToken,
      user: { id: user.id, nameUser: user.nameUser, mailUser: user.mailUser },
    });
  } catch (err) {
    next(err);
  }
};

// ── NOUVEAU : rafraîchissement du token ──
exports.refreshToken = async (req, res, next) => {
  try {
    // req.cookies existe grâce à cookie-parser
    const refreshTokenValue = req.cookies.refreshToken;
    const { accessToken, refreshToken, user } =
      await authService.rafraichirToken(refreshTokenValue);

    // rotation : on remplace le cookie par le nouveau refreshToken généré
    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);

    res.status(200).json({
      accessToken,
      user: { id: user.id, nameUser: user.nameUser, mailUser: user.mailUser },
    });
  } catch (err) {
    next(err);
  }
};

exports.logout = (req, res) => {
  res.clearCookie("refreshToken", COOKIE_OPTIONS);
  res.status(200).json({ message: "Déconnecté" });
};

exports.forgotPassword = async (req, res, next) => {
  try {
    await authService.demanderResetPassword(req.body.mailUser);
    res.status(200).json({
      message: "Si ce compte existe, un code de vérification a été envoyé",
    });
  } catch (err) {
    next(err);
  }
};

exports.verifyCode = async (req, res, next) => {
  try {
    await authService.verifierCode(req.body.mailUser, req.body.code);
    res.status(200).json({ message: "Code valide" });
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    await authService.reinitialiserPassword(
      req.body.mailUser,
      req.body.code,
      req.body.nouveauPassword,
    );
    res.status(200).json({ message: "Mot de passe réinitialisé avec succès" });
  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res, next) => {
  try {
    const { User } = require("../models");
    const user = await User.findByPk(req.user.sub, {
      attributes: { exclude: ["passwordUser"] },
    });
    if (!user)
      return res.status(404).json({ error: "Utilisateur introuvable" });
    res.json(user);
  } catch (err) {
    next(err);
  }
};
