const router = require("express").Router();
const controller = require("../controllers/reservations.controller");
const authUser = require("../middlewares/authUser");
const authAdmin = require("../middlewares/authAdmin");
const validate = require("../middlewares/validate");
const {
  createReservationSchema,
  createAdminReservationSchema,
} = require("../validators/reservations.validators");
const upload = require("../middlewares/upload");

router.post(
  "/",
  authUser,
  upload.single("picture"),
  validate(createReservationSchema),
  controller.create,
);
router.put("/:id", authUser, upload.single("picture"), controller.update);
router.post(
  "/admin",
  authUser,
  authAdmin,
  upload.single("picture"),
  validate(createAdminReservationSchema),
  controller.createAdmin,
);

router.get("/me", authUser, controller.mine);

router.get("/", authUser, authAdmin, controller.all);

// Le client annule sa propre réservation (règle des 24h appliquée côté service).
router.patch("/:id/cancel-mine", authUser, controller.cancelMine);

router.patch("/:id/cancel", authUser, authAdmin, controller.cancel);
router.delete("/:id", authUser, authAdmin, controller.remove);
router.patch("/:id/complete", authUser, authAdmin, controller.complete);
router.patch("/:id/reopen", authUser, authAdmin, controller.reopen);
module.exports = router;
