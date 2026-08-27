const chatbotService = require("../services/chatbot.service");

exports.ask = async (req, res, next) => {
  try {
    const reponse = await chatbotService.repondre(req.body.message);
    res.json({ reponse });
  } catch (err) {
    next(err);
  }
};

exports.reindex = async (req, res, next) => {
  try {
    const result = await chatbotService.reindexerCatalogue();
    res.json({ message: "Index reconstruit", ...result });
  } catch (err) {
    next(err);
  }
};
