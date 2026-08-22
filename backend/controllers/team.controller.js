const chatbotService = require("../services/chatbot.service");
const teamService = require("../services/team.service");

function emitUpdate(req) {
  const io = req.app.get("io");
  if (io) io.emit("team:updated");
  chatbotService
    .reindexerCatalogue()
    .catch((err) => console.error("Erreur reindexation chatbot:", err));
}

exports.list = async (req, res, next) => {
  try {
    res.json(await teamService.lister());
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      photo: req.file ? `/uploads/${req.file.filename}` : undefined,
    };

    const membre = await teamService.creer(data);
    emitUpdate(req);
    res.status(201).json(membre);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
    };

    if (req.file) {
      data.photo = `/uploads/${req.file.filename}`;
    }

    const membre = await teamService.modifier(req.params.id, data);
    emitUpdate(req);
    res.json(membre);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await teamService.supprimer(req.params.id);
    emitUpdate(req);
    res.json({ message: "Membre supprimé" });
  } catch (err) {
    next(err);
  }
};
