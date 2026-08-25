const router = require("express").Router();
const controller = require("../controllers/notifications.controller");
const authUser = require("../middlewares/authUser");

router.get("/me", authUser, controller.mine);
router.get("/unread-count", authUser, controller.unreadCount);
router.patch("/:id/read", authUser, controller.markRead);

module.exports = router;
