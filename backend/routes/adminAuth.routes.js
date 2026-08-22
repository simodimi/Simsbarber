const router = require("express").Router();
const controller = require("../controllers/adminAuth.controller");
const authUser = require("../middlewares/authUser");
const authAdmin = require("../middlewares/authAdmin");
const validate = require("../middlewares/validate");
const rateLimit = require("express-rate-limit");
const {
  loginAdminSchema,
  requestAccessSchema,
  forgotPasswordAdminSchema,
  verifyCodeAdminSchema,
  resetPasswordAdminSchema,
} = require("../validators/adminAuth.validators");

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5 });

router.post(
  "/login",
  loginLimiter,
  validate(loginAdminSchema),
  controller.login,
);
router.post("/refresh-token", controller.refreshToken);
router.post("/logout", controller.logout);
router.post(
  "/request-access",
  validate(requestAccessSchema),
  controller.requestAccess,
);
router.post(
  "/forgot-password",
  validate(forgotPasswordAdminSchema),
  controller.forgotPassword,
);
router.post(
  "/verify-code",
  validate(verifyCodeAdminSchema),
  controller.verifyCode,
);
router.post(
  "/reset-password",
  validate(resetPasswordAdminSchema),
  controller.resetPassword,
);
// PUBLIQUE volontairement : le candidat n'a pas encore de compte/token à ce stade.
router.get("/access-requests/:id/status", controller.checkAccessRequestStatus);
// PUBLIQUE volontairement : ouverte depuis un client mail, pas depuis le front React.
router.get("/access-requests/action", controller.handleEmailAction);

router.get("/me", authUser, authAdmin, controller.me);
router.get(
  "/access-requests",
  authUser,
  authAdmin,
  controller.listAccessRequests,
);
router.patch(
  "/access-requests/:id/approve",
  authUser,
  authAdmin,
  controller.approveAccessRequest,
);
router.patch(
  "/access-requests/:id/reject",
  authUser,
  authAdmin,
  controller.rejectAccessRequest,
);

module.exports = router;
