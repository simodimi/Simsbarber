const router = require("express").Router();
const controller = require("../controllers/prestations.controller");
const authUser = require("../middlewares/authUser");
const authAdmin = require("../middlewares/authAdmin");
const validate = require("../middlewares/validate");
const { prestationSchema } = require("../validators/prestations.validators");
const upload = require("../middlewares/upload");
router.get("/", controller.list);
router.get("/:slug", controller.getBySlug);
router.post(
  "/",
  authUser,
  authAdmin,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "galerie", maxCount: 3 },
  ]),
  validate(prestationSchema),
  controller.create,
);
router.put("/:id", authUser, authAdmin, controller.update);
router.delete("/:id", authUser, authAdmin, controller.remove);

module.exports = router;
