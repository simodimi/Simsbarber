const router = require("express").Router();
const controller = require("../controllers/reviews.controller");
const authUser = require("../middlewares/authUser");
const authAdmin = require("../middlewares/authAdmin");
const validate = require("../middlewares/validate");
const {
  createReviewSchema,
  updateReviewSchema,
} = require("../validators/reviews.validators");

router.post("/", authUser, validate(createReviewSchema), controller.create);
router.put("/:id", authUser, validate(updateReviewSchema), controller.update);
router.delete("/:id", authUser, controller.remove);

router.get("/admin", authUser, authAdmin, controller.listForAdmin);

router.get(
  "/by-reservation/:reservationId",
  authUser,
  controller.getByReservation,
);
router.get("/", authUser, controller.list);
router.get(
  "/by-prestation/:prestationId",
  authUser,
  controller.listByPrestation,
);
module.exports = router;
