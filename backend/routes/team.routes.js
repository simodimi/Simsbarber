const router = require("express").Router();
const controller = require("../controllers/team.controller");
const authUser = require("../middlewares/authUser");
const authAdmin = require("../middlewares/authAdmin");
const validate = require("../middlewares/validate");
const { teamMemberSchema } = require("../validators/team.validators");
const upload = require("../middlewares/upload");
router.get("/", controller.list);
router.post(
  "/",
  authUser,
  authAdmin,
  upload.single("photo"),
  validate(teamMemberSchema),
  controller.create,
);
router.put(
  "/:id",
  authUser,
  authAdmin,
  upload.single("photo"),
  validate(teamMemberSchema),
  controller.update,
);
router.delete("/:id", authUser, authAdmin, controller.remove);

module.exports = router;
