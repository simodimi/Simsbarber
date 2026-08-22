const chatbotService = require("../services/chatbot.service");
const prestationsService = require("../services/prestations.service");
const { getImageUrl, getImageUrls } = require("../utils/Imagehelpers");
function emitUpdate(req) {
  const io = req.app.get("io");
  if (io) io.emit("prestations:updated");
  chatbotService
    .reindexerCatalogue()
    .catch((err) => console.error("Erreur reindexation chatbot:", err));
}

exports.list = async (req, res, next) => {
  try {
    res.json(await prestationsService.lister(req.query.categoryId));
  } catch (err) {
    next(err);
  }
};

exports.getBySlug = async (req, res, next) => {
  try {
    res.json(await prestationsService.getBySlug(req.params.slug));
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const image = getImageUrl(req.files?.image?.[0]);

    const galerie = getImageUrls(req.files?.galerie);

    const prestation = await prestationsService.creer({
      ...req.body,
      image,
      galerie,
    });
    //const prestation = await prestationsService.creer(req.body);
    emitUpdate(req);
    res.status(201).json(prestation);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const prestation = await prestationsService.modifier(
      req.params.id,
      req.body,
    );
    emitUpdate(req);
    res.json(prestation);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await prestationsService.supprimer(req.params.id);
    emitUpdate(req);
    res.json({ message: "Prestation supprimée" });
  } catch (err) {
    next(err);
  }
};
