const router = require("express").Router();

router.use("/auth", require("./auth.routes"));
router.use("/admin/auth", require("./adminAuth.routes"));
router.use("/users", require("./users.routes"));
router.use("/clients", require("./clients.routes"));
router.use("/categories", require("./categories.routes"));
router.use("/prestations", require("./prestations.routes"));
router.use("/team", require("./team.routes"));
router.use("/reservations", require("./reservations.routes"));
router.use("/reviews", require("./reviews.routes"));
router.use("/messages", require("./messages.routes"));
router.use("/notifications", require("./notifications.routes"));
router.use("/chatbot", require("./chatbot.routes"));

module.exports = router;
