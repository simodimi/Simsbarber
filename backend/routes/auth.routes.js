/*const router = require("express").Router();
const controller = require("../controllers/auth.controller");
const authUser = require("../middlewares/authUser");
const validate = require("../middlewares/validate");
const rateLimit = require("express-rate-limit");
const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  verifyCodeSchema,
  resetPasswordSchema,
} = require("../validators/auth.validators");

// Limite spécifique sur la connexion
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: "Trop de tentatives, réessayez dans 15 minutes" },
});

// Même principe pour forgot-password, sinon un attaquant pourrait spammer
// de codes de vérification par email vers une victime, ou épuiser votre
// quota d'envoi d'emails Gmail.
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: { error: "Trop de demandes, réessayez plus tard" },
});

router.post("/register", validate(registerSchema), controller.register);
router.post("/login", loginLimiter, validate(loginSchema), controller.login);
router.post(
  "/forgot-password",
  forgotPasswordLimiter,
  validate(forgotPasswordSchema),
  controller.forgotPassword,
);
router.post("/verify-code", validate(verifyCodeSchema), controller.verifyCode);
router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  controller.resetPassword,
);

// Route protégée : authUser doit passer AVANT controller.me, sinon
// n'importe qui pourrait appeler /me sans être connecté.
router.get("/me", authUser, controller.me);

module.exports = router;*/
const router = require("express").Router();
const controller = require("../controllers/auth.controller");
const authUser = require("../middlewares/authUser");
const validate = require("../middlewares/validate");
const rateLimit = require("express-rate-limit");
const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  verifyCodeSchema,
  resetPasswordSchema,
} = require("../validators/auth.validators");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: "Trop de tentatives, réessayez dans 15 minutes" },
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: { error: "Trop de demandes, réessayez plus tard" },
});

router.post("/register", validate(registerSchema), controller.register);
router.post("/login", loginLimiter, validate(loginSchema), controller.login);
router.post("/refresh-token", controller.refreshToken); // pas d'authUser ici : justement, l'accessToken est expiré à ce stade
router.post("/logout", controller.logout);
router.post(
  "/forgot-password",
  forgotPasswordLimiter,
  validate(forgotPasswordSchema),
  controller.forgotPassword,
);
router.post("/verify-code", validate(verifyCodeSchema), controller.verifyCode);
router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  controller.resetPassword,
);

router.get("/me", authUser, controller.me);

module.exports = router;
