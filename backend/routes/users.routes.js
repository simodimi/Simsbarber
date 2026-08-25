const router = require("express").Router();
const controller = require("../controllers/users.controller");
const authUser = require("../middlewares/authUser");
const validate = require("../middlewares/validate");
const upload = require("../middlewares/upload");
const authAdmin = require("../middlewares/authAdmin");
const {
  updateProfileSchema,
  updateChatBackgroundSchema,
} = require("../validators/users.validators");

router.get("/me", authUser, controller.getMe);
router.put("/me", authUser, validate(updateProfileSchema), controller.updateMe);
router.post(
  "/me/photo",
  authUser,
  upload.single("photo"),
  controller.uploadPhoto,
);
router.put(
  "/me/chat-background",
  authUser,
  validate(updateChatBackgroundSchema),
  controller.updateChatBackground,
);
router.delete("/me", authUser, controller.deleteMe);
//Récupérer tous les utilisateurs (admin uniquement)
router.get("/", authUser, authAdmin, controller.getAllUsers);
router.post(
  "/me/chat-background",
  authUser,
  upload.single("background"),
  controller.uploadChatBackground,
);
module.exports = router;
