const router = require("express").Router();
const controller = require("../controllers/messages.controller");
const authUser = require("../middlewares/authUser");
const authAdmin = require("../middlewares/authAdmin");
const validate = require("../middlewares/validate");
const upload = require("../middlewares/upload");
const { sendMessageSchema } = require("../validators/messages.validators");

router.get("/me", authUser, controller.mine);
router.post(
  "/",
  authUser,
  upload.single("image"),
  validate(sendMessageSchema),
  controller.send,
);

router.get(
  "/admin/conversations",
  authUser,
  authAdmin,
  controller.adminConversations,
);
router.get(
  "/admin/conversations",
  authUser,
  authAdmin,
  controller.adminConversations,
);
router.get(
  "/admin/broadcast",
  authUser,
  authAdmin,
  controller.adminBroadcastHistory,
); // nouveau, avant :userId
router.get(
  "/admin/:userId",
  authUser,
  authAdmin,
  controller.adminMessagesForUser,
);
router.post(
  "/admin/broadcast",
  authUser,
  authAdmin,
  upload.single("image"),
  validate(sendMessageSchema),
  controller.broadcast,
);
router.post(
  "/admin/:userId",
  authUser,
  authAdmin,
  upload.single("image"),
  validate(sendMessageSchema),
  controller.adminSend,
);

module.exports = router;
