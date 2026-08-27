const bcrypt = require("bcrypt");
const { Admin, AdminAccessRequest, PasswordResetCode } = require("../models");
const {
  genererAccessToken,
  genererRefreshToken,
  verifierRefreshToken,
  genererActionToken,
  verifierActionToken,
} = require("../utils/tokens");
const { envoyerEmail } = require("../config/mailer");
const notificationsService = require("./notifications.service");
const { ErreurMetier } = require("./auth.service");

async function connecterAdmin({ emailAdmin, passwordAdmin }) {
  const admin = await Admin.findOne({ where: { emailAdmin } });
  if (!admin) throw new ErreurMetier("Identifiants incorrects", 401);

  const valide = await bcrypt.compare(passwordAdmin, admin.passwordAdmin);
  if (!valide) throw new ErreurMetier("Identifiants incorrects", 401);

  const accessToken = genererAccessToken({ sub: admin.id, role: "admin" });
  const refreshToken = genererRefreshToken({ sub: admin.id, role: "admin" });
  return { admin, accessToken, refreshToken };
}

// RAFRAÎCHISSEMENT DU TOKEN ADMIN
async function rafraichirTokenAdmin(refreshTokenValue) {
  if (!refreshTokenValue) throw new ErreurMetier("Refresh token manquant", 401);

  let payload;
  try {
    payload = verifierRefreshToken(refreshTokenValue);
  } catch {
    throw new ErreurMetier("Session expirée, veuillez vous reconnecter", 401);
  }

  const admin = await Admin.findByPk(payload.sub);
  if (!admin) throw new ErreurMetier("Administrateur introuvable", 404);

  const accessToken = genererAccessToken({ sub: admin.id, role: "admin" });
  const refreshToken = genererRefreshToken({ sub: admin.id, role: "admin" });

  return { accessToken, refreshToken, admin };
}

async function obtenirStatutDemande(requestId) {
  const request = await AdminAccessRequest.findByPk(requestId);
  if (!request) throw new ErreurMetier("Demande introuvable", 404);
  // On ne renvoie QUE le statut, jamais le reste (email, mot de passe
  // hashé...)
  return { status: request.status };
}

async function demanderResetPasswordAdmin(emailAdmin) {
  const admin = await Admin.findOne({ where: { emailAdmin } });
  if (!admin) return;

  const code = Math.floor(10000 + Math.random() * 90000).toString();

  await PasswordResetCode.create({
    email: emailAdmin,
    code,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
  });

  await envoyerEmail({
    to: emailAdmin,
    subject: "Code de vérification Sim'sBarber (administrateur)",
    html: `<p>Votre code de vérification est : <strong>${code}</strong></p><p>Il expire dans 5 minutes.</p>`,
  });
}

async function verifierCodeAdmin(emailAdmin, code) {
  const entry = await PasswordResetCode.findOne({
    where: { email: emailAdmin, code, used: false },
    order: [["createdAt", "DESC"]],
  });

  if (!entry) throw new ErreurMetier("Code de vérification incorrect", 400);
  if (entry.expiresAt < new Date())
    throw new ErreurMetier("Code expiré, veuillez recommencer", 400);

  return true;
}

async function reinitialiserPasswordAdmin(emailAdmin, code, nouveauPassword) {
  await verifierCodeAdmin(emailAdmin, code);

  const admin = await Admin.findOne({ where: { emailAdmin } });
  if (!admin) throw new ErreurMetier("Administrateur introuvable", 404);

  // Le hook beforeUpdate() du modèle Admin hash automatiquement (voir
  // admin.model.js), pas besoin de le faire ici.
  admin.passwordAdmin = nouveauPassword;
  await admin.save();

  await PasswordResetCode.update(
    { used: true },
    { where: { email: emailAdmin, code } },
  );
}

async function demanderAccesAdmin({ nameAdmin, emailAdmin, passwordAdmin }) {
  const dejaAdmin = await Admin.findOne({ where: { emailAdmin } });
  if (dejaAdmin)
    throw new ErreurMetier("Un compte admin existe déjà avec cet email", 409);

  const dejaEnAttente = await AdminAccessRequest.findOne({
    where: { emailAdmin, status: "ATTENTE" },
  });
  if (dejaEnAttente)
    throw new ErreurMetier(
      "Une demande est déjà en attente pour cet email",
      409,
    );

  const request = await AdminAccessRequest.create({
    nameAdmin,
    emailAdmin,
    passwordAdmin,
  });

  const admins = await Admin.findAll();

  // Notification en base (pour un futur écran de notifications côté admin)
  await Promise.all(
    admins.map((admin) =>
      notificationsService.creerNotification({
        recipientType: "ADMIN",
        adminId: admin.id,
        type: "NOUVELLE_DEMANDE_ADMIN",
        content: `${nameAdmin} (${emailAdmin}) demande la création d'un compte admin`,
        link: "/admin/access-requests",
      }),
    ),
  );

  const backendUrl =
    process.env.BACKEND_URL || `http://localhost:${process.env.SERVER_PORT}`;

  await Promise.all(
    admins.map((admin) => {
      const approveToken = genererActionToken({
        requestId: request.id,
        adminId: admin.id,
        action: "approve",
      });
      const rejectToken = genererActionToken({
        requestId: request.id,
        adminId: admin.id,
        action: "reject",
      });

      const approveUrl = `${backendUrl}/api/admin/auth/access-requests/action?token=${approveToken}`;
      const rejectUrl = `${backendUrl}/api/admin/auth/access-requests/action?token=${rejectToken}`;

      return envoyerEmail({
        to: admin.emailAdmin,
        subject: "Nouvelle demande de compte administrateur",
        html: `<p>Bonjour ${admin.nameAdmin},</p>
<p><strong>${nameAdmin}</strong> (${emailAdmin}) demande la création d'un compte administrateur sur Sim'sBarber.</p>
<p style="margin-top:20px;">
  <a href="${approveUrl}" style="background:#27ae60;color:#fff;padding:10px 20px;text-decoration:none;border-radius:6px;margin-right:10px;">Approuver</a>
  <a href="${rejectUrl}" style="background:#e74c3c;color:#fff;padding:10px 20px;text-decoration:none;border-radius:6px;">Refuser</a>
</p>
<p style="margin-top:20px;font-size:12px;color:#888;">Ce lien est valable 3 jours. Passé ce délai, connectez-vous à votre espace admin pour traiter la demande.</p>`,
      });
    }),
  );

  return request;
}

// ── Traite une décision cliquée directement depuis l'email ──
async function traiterActionDepuisEmail(token) {
  let payload;
  try {
    payload = verifierActionToken(token);
  } catch {
    throw new ErreurMetier("Ce lien est invalide ou a expiré", 400);
  }

  const { requestId, adminId, action } = payload;

  if (action === "approve") {
    const admin = await approuverDemande(requestId, adminId);
    return { action: "approve", admin };
  }
  if (action === "reject") {
    await refuserDemande(requestId, adminId);
    return { action: "reject" };
  }
  throw new ErreurMetier("Action inconnue", 400);
}

async function listerDemandes(status) {
  return AdminAccessRequest.findAll({
    where: status ? { status } : {},
    order: [["requestedAt", "DESC"]],
  });
}

async function approuverDemande(requestId, decidedByAdminId) {
  const request = await AdminAccessRequest.findByPk(requestId);
  if (!request) throw new ErreurMetier("Demande introuvable", 404);
  if (request.status !== "ATTENTE")
    throw new ErreurMetier("Cette demande a déjà été traitée", 409);

  const nouvelAdmin = Admin.build({
    nameAdmin: request.nameAdmin,
    emailAdmin: request.emailAdmin,
    passwordAdmin: request.passwordAdmin,
  });
  await nouvelAdmin.save({ hooks: false });

  request.status = "APPROUVE";
  request.decidedAt = new Date();
  request.decidedByAdminId = decidedByAdminId;
  await request.save();

  await notificationsService.creerNotification({
    recipientType: "ADMIN",
    adminId: nouvelAdmin.id,
    type: "COMPTE_APPROUVE",
    content: "Votre compte administrateur a été approuvé",
  });

  await envoyerEmail({
    to: request.emailAdmin,
    subject: "Votre compte Sim'sBarber a été approuvé",
    html: `<p>Bonjour ${request.nameAdmin},</p><p>Votre demande de compte administrateur a été approuvée. Vous pouvez maintenant vous connecter.</p>`,
  });

  return nouvelAdmin;
}

async function refuserDemande(requestId, decidedByAdminId) {
  const request = await AdminAccessRequest.findByPk(requestId);
  if (!request) throw new ErreurMetier("Demande introuvable", 404);
  if (request.status !== "ATTENTE")
    throw new ErreurMetier("Cette demande a déjà été traitée", 409);

  request.status = "REFUSE";
  request.decidedAt = new Date();
  request.decidedByAdminId = decidedByAdminId;
  await request.save();

  await envoyerEmail({
    to: request.emailAdmin,
    subject: "Votre demande de compte Sim'sBarber",
    html: `<p>Bonjour ${request.nameAdmin},</p><p>Votre demande de compte administrateur n'a pas été retenue.</p>`,
  });

  return request;
}

module.exports = {
  connecterAdmin,
  traiterActionDepuisEmail,
  demanderResetPasswordAdmin,
  verifierCodeAdmin,
  reinitialiserPasswordAdmin,
  obtenirStatutDemande,
  rafraichirTokenAdmin,
  demanderAccesAdmin,
  listerDemandes,
  approuverDemande,
  refuserDemande,
};
