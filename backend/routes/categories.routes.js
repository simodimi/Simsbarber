const router = require("express").Router();
const controller = require("../controllers/categories.controller");
const authUser = require("../middlewares/authUser");
const authAdmin = require("../middlewares/authAdmin");
const validate = require("../middlewares/validate");
const { categorySchema } = require("../validators/categories.validators");
const upload = require("../middlewares/upload");
router.get("/", controller.list); // public, lu par le front user
router.post(
  "/",
  authUser,
  authAdmin,
  upload.single("image"),
  validate(categorySchema),
  controller.create,
);
router.put(
  "/:id",
  authUser,
  authAdmin,
  upload.single("image"),
  validate(categorySchema),
  controller.update,
);
router.delete("/:id", authUser, authAdmin, controller.remove);

module.exports = router;
