const adminAuthService = require("../services/adminAuth.service");
const { Admin } = require("../models");

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

exports.login = async (req, res, next) => {
  try {
    const { admin, accessToken, refreshToken } =
      await adminAuthService.connecterAdmin(req.body);
    res.cookie("refreshTokenAdmin", refreshToken, COOKIE_OPTIONS);
    res.status(200).json({
      accessToken,
      admin: {
        id: admin.id,
        nameAdmin: admin.nameAdmin,
        emailAdmin: admin.emailAdmin,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const refreshTokenValue = req.cookies.refreshTokenAdmin;
    const { accessToken, refreshToken, admin } =
      await adminAuthService.rafraichirTokenAdmin(refreshTokenValue);
    res.cookie("refreshTokenAdmin", refreshToken, COOKIE_OPTIONS);
    res.status(200).json({
      accessToken,
      admin: {
        id: admin.id,
        nameAdmin: admin.nameAdmin,
        emailAdmin: admin.emailAdmin,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.logout = (req, res) => {
  res.clearCookie("refreshTokenAdmin", COOKIE_OPTIONS);
  res.status(200).json({ message: "Déconnecté" });
};

exports.checkAccessRequestStatus = async (req, res, next) => {
  try {
    const result = await adminAuthService.obtenirStatutDemande(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    await adminAuthService.demanderResetPasswordAdmin(req.body.emailAdmin);
    res.status(200).json({
      message: "Si ce compte existe, un code de vérification a été envoyé",
    });
  } catch (err) {
    next(err);
  }
};

exports.verifyCode = async (req, res, next) => {
  try {
    await adminAuthService.verifierCodeAdmin(
      req.body.emailAdmin,
      req.body.code,
    );
    res.status(200).json({ message: "Code valide" });
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    await adminAuthService.reinitialiserPasswordAdmin(
      req.body.emailAdmin,
      req.body.code,
      req.body.nouveauPassword,
    );
    res.status(200).json({ message: "Mot de passe réinitialisé avec succès" });
  } catch (err) {
    next(err);
  }
};

exports.handleEmailAction = async (req, res, next) => {
  try {
    const result = await adminAuthService.traiterActionDepuisEmail(
      req.query.token,
    );

    // On répond directement en HTML (pas en JSON) : ce lien est ouvert dans
    // un navigateur depuis un client mail, pas appelé par votre front React
    // - un simple message de confirmation lisible suffit.
    const message =
      result.action === "approve"
        ? `<h1>Compte approuvé</h1><p>Le compte de ${result.admin.nameAdmin} a bien été créé.</p>`
        : `<h1>Demande refusée</h1><p>La demande a été refusée.</p>`;

    res.send(`
      <html>
        <body style="font-family: sans-serif; text-align: center; padding: 60px;">
          ${message}
        </body>
      </html>
    `);
  } catch (err) {
    // Réponse HTML aussi en cas d'erreur (lien expiré, déjà traité...),
    // pour éviter un JSON brut illisible dans le navigateur.
    res.status(err.statusCode || 500).send(`
      <html>
        <body style="font-family: sans-serif; text-align: center; padding: 60px;">
          <h1>Impossible de traiter cette demande</h1>
          <p>${err.message}</p>
        </body>
      </html>
    `);
  }
};

exports.requestAccess = async (req, res, next) => {
  try {
    const request = await adminAuthService.demanderAccesAdmin(req.body);
    res.status(201).json({
      message: "Demande envoyée, en attente de validation",
      requestId: request.id,
    });
  } catch (err) {
    next(err);
  }
};

exports.listAccessRequests = async (req, res, next) => {
  try {
    const requests = await adminAuthService.listerDemandes(req.query.status);
    res.json(requests);
  } catch (err) {
    next(err);
  }
};

exports.approveAccessRequest = async (req, res, next) => {
  try {
    const admin = await adminAuthService.approuverDemande(
      req.params.id,
      req.user.sub,
    );
    const io = req.app.get("io");
    if (io)
      io.to("admins").emit("access-request:approved", { id: req.params.id });
    res.json({
      message: "Compte admin créé",
      admin: { id: admin.id, nameAdmin: admin.nameAdmin },
    });
  } catch (err) {
    next(err);
  }
};

exports.rejectAccessRequest = async (req, res, next) => {
  try {
    await adminAuthService.refuserDemande(req.params.id, req.user.sub);
    res.json({ message: "Demande refusée" });
  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res, next) => {
  try {
    const admin = await Admin.findByPk(req.user.sub, {
      attributes: { exclude: ["passwordAdmin"] },
    });
    if (!admin) return res.status(404).json({ error: "Introuvable" });
    res.json(admin);
  } catch (err) {
    next(err);
  }
};
