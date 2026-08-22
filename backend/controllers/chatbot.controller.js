const chatbotService = require("../services/chatbot.service");

// Route publique : utilisée par le widget du chatbot côté user (Accueil.tsx)
// ET peut être appelée pareillement depuis le front admin si vous voulez un
// assistant interne (même endpoint, aucune différence de traitement — la
// réponse est basée sur les mêmes données de catalogue dans les deux cas).
exports.ask = async (req, res, next) => {
  try {
    const reponse = await chatbotService.repondre(req.body.message);
    res.json({ reponse });
  } catch (err) {
    next(err);
  }
};

// Route protégée admin : reconstruit l'index Qdrant à la demande (utile
// juste après avoir ajouté/modifié plusieurs prestations d'un coup).
exports.reindex = async (req, res, next) => {
  try {
    const result = await chatbotService.reindexerCatalogue();
    res.json({ message: "Index reconstruit", ...result });
  } catch (err) {
    next(err);
  }
};
