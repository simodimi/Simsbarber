const router = require("express").Router();
const controller = require("../controllers/chatbot.controller");
const authUser = require("../middlewares/authUser");
const authAdmin = require("../middlewares/authAdmin");
const validate = require("../middlewares/validate");
const { askSchema } = require("../validators/chatbot.validators");

router.post("/ask", validate(askSchema), controller.ask);
router.post("/reindex", authUser, authAdmin, controller.reindex);

module.exports = router;
