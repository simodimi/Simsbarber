const bcrypt = require("bcrypt");
const { User, PasswordResetCode } = require("../models");
const {
  genererAccessToken,
  genererRefreshToken,
  verifierRefreshToken,
} = require("../utils/tokens");
const { envoyerEmail } = require("../config/mailer");

class ErreurMetier extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

async function inscrireUser({ nameUser, mailUser, passwordUser }) {
  const existe = await User.findOne({ where: { mailUser } });
  if (existe)
    throw new ErreurMetier("Un compte existe déjà avec cet email", 409);

  const user = await User.create({ nameUser, mailUser, passwordUser });

  const accessToken = genererAccessToken({ sub: user.id, role: "user" });
  const refreshToken = genererRefreshToken({ sub: user.id, role: "user" });

  return { user, accessToken, refreshToken };
}

async function connecterUser({ mailUser, passwordUser }) {
  const user = await User.findOne({ where: { mailUser } });
  if (!user) throw new ErreurMetier("Identifiants incorrects", 401);
  if (user.status === "BLOQUE")
    throw new ErreurMetier("Ce compte a été bloqué, contactez le salon", 403);

  const motDePasseValide = await bcrypt.compare(
    passwordUser,
    user.passwordUser,
  );
  if (!motDePasseValide) throw new ErreurMetier("Identifiants incorrects", 401);

  const accessToken = genererAccessToken({ sub: user.id, role: "user" });
  const refreshToken = genererRefreshToken({ sub: user.id, role: "user" });

  return { user, accessToken, refreshToken };
}

// ── RAFRAÎCHISSEMENT DU TOKEN ──
// Reçoit le refreshToken (7 jours) lu depuis le cookie httpOnly, et renvoie
// un accessToken TOUT NEUF (15 minutes), sans redemander le mot de passe.
async function rafraichirToken(refreshTokenValue) {
  if (!refreshTokenValue) {
    throw new ErreurMetier("Refresh token manquant", 401);
  }

  let payload;
  try {
    payload = verifierRefreshToken(refreshTokenValue);
  } catch (err) {
    // Si le refresh token lui-même est expiré (après 7 jours) ou invalide,
    // il n'y a plus de session possible : l'utilisateur doit vraiment se
    // reconnecter avec son mot de passe.
    throw new ErreurMetier("Session expirée, veuillez vous reconnecter", 401);
  }

  const user = await User.findByPk(payload.sub);
  if (!user) throw new ErreurMetier("Utilisateur introuvable", 404);
  if (user.status === "BLOQUE")
    throw new ErreurMetier("Ce compte a été bloqué", 403);

  const nouvelAccessToken = genererAccessToken({ sub: user.id, role: "user" });
  // On régénère AUSSI un nouveau refreshToken à chaque rafraîchissement
  // ("rotation" du refresh token) : bonne pratique de sécurité — si un
  // refresh token volé est utilisé puis "roulé", l'ancien devient caduc,
  // ce qui limite la fenêtre d'exploitation en cas de vol.
  const nouveauRefreshToken = genererRefreshToken({
    sub: user.id,
    role: "user",
  });

  return {
    accessToken: nouvelAccessToken,
    refreshToken: nouveauRefreshToken,
    user,
  };
}

async function demanderResetPassword(mailUser) {
  const user = await User.findOne({ where: { mailUser } });
  if (!user) return;

  const code = Math.floor(10000 + Math.random() * 90000).toString();

  await PasswordResetCode.create({
    email: mailUser,
    code,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
  });

  await envoyerEmail({
    to: mailUser,
    subject: "Code de vérification Sim'sBarber",
    html: `<p>Votre code de vérification est : <strong>${code}</strong></p><p>Il expire dans 5 minutes.</p>`,
  });
}

async function verifierCode(mailUser, code) {
  const entry = await PasswordResetCode.findOne({
    where: { email: mailUser, code, used: false },
    order: [["createdAt", "DESC"]],
  });

  if (!entry) throw new ErreurMetier("Code de vérification incorrect", 400);
  if (entry.expiresAt < new Date())
    throw new ErreurMetier("Code expiré, veuillez recommencer", 400);

  return true;
}

async function reinitialiserPassword(mailUser, code, nouveauPassword) {
  await verifierCode(mailUser, code);

  const user = await User.findOne({ where: { mailUser } });
  if (!user) throw new ErreurMetier("Utilisateur introuvable", 404);

  user.passwordUser = nouveauPassword;
  await user.save();

  await PasswordResetCode.update(
    { used: true },
    { where: { email: mailUser, code } },
  );
}

module.exports = {
  ErreurMetier,
  inscrireUser,
  connecterUser,
  rafraichirToken,
  demanderResetPassword,
  verifierCode,
  reinitialiserPassword,
};
