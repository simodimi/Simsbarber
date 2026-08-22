const router = require("express").Router();
const controller = require("../controllers/clients.controller");
const authUser = require("../middlewares/authUser");
const authAdmin = require("../middlewares/authAdmin");

router.get("/", authUser, authAdmin, controller.list);
router.patch(
  "/:id/toggle-status",
  authUser,
  authAdmin,
  controller.toggleStatus,
);
router.delete("/:id", authUser, authAdmin, controller.remove);

module.exports = router;
