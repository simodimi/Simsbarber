const chatbotService = require("../services/chatbot.service");
const categoriesService = require("../services/categories.service");
const { getImageUrl } = require("../utils/Imagehelpers");

function emitUpdate(req) {
  const io = req.app.get("io");
  if (io) io.emit("categories:updated");
  chatbotService
    .reindexerCatalogue()
    .catch((err) => console.error("Erreur reindexation chatbot:", err));
}

exports.list = async (req, res, next) => {
  try {
    res.json(await categoriesService.lister());
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const imageUrl = getImageUrl(req.file);
    if (!imageUrl) {
      return res.status(400).json({ error: "Image manquante" });
    }
    const category = await categoriesService.creer({
      nom: req.body.nom,
      description: req.body.description,
      image: imageUrl,
    });
    emitUpdate(req);
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const imageUrl = getImageUrl(req.file);
    const data = {
      nom: req.body.nom,
      description: req.body.description,
    };
    if (imageUrl) {
      data.image = imageUrl;
    }
    const category = await categoriesService.modifier(req.params.id, data);
    emitUpdate(req);
    res.json(category);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await categoriesService.supprimer(req.params.id);
    emitUpdate(req);
    res.json({ message: "Catégorie supprimée" });
  } catch (err) {
    next(err);
  }
};
