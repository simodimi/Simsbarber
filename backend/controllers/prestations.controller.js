const chatbotService = require("../services/chatbot.service");
const prestationsService = require("../services/prestations.service");
const { getImageUrl } = require("../utils/Imagehelpers");

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
    // Utiliser les trois champs distincts
    const galerie = [
      getImageUrl(req.files?.galerie1?.[0]) || "",
      getImageUrl(req.files?.galerie2?.[0]) || "",
      getImageUrl(req.files?.galerie3?.[0]) || "",
    ];

    const prestation = await prestationsService.creer({
      ...req.body,
      image,
      galerie,
    });
    emitUpdate(req);
    res.status(201).json(prestation);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const data = { ...req.body };

    // ---- Gestion de l'image principale ----
    if (req.files?.image?.[0]) {
      data.image = getImageUrl(req.files.image[0]);
    } else if (req.body.removeImage === "true") {
      data.image = null; // ou "" selon votre modèle
    }

    // ---- Gestion de la galerie ----
    const galerieChangee = !!(
      req.files?.galerie1?.[0] ||
      req.files?.galerie2?.[0] ||
      req.files?.galerie3?.[0] ||
      req.body.removeGalerie1 === "true" ||
      req.body.removeGalerie2 === "true" ||
      req.body.removeGalerie3 === "true"
    );

    if (galerieChangee) {
      const actuelle = await prestationsService.getGalerieActuelle(
        req.params.id,
      );
      data.galerie = [1, 2, 3].map((n, index) => {
        const field = `galerie${n}`;
        if (req.files?.[field]?.[0]) {
          return getImageUrl(req.files[field][0]);
        } else if (req.body[`removeGalerie${n}`] === "true") {
          return ""; // supprimer ce slot
        } else {
          return actuelle[index] || "";
        }
      });
    }

    // Nettoyer les flags de req.body pour ne pas les passer au service
    [
      "removeImage",
      "removeGalerie1",
      "removeGalerie2",
      "removeGalerie3",
    ].forEach((key) => delete data[key]);

    const prestation = await prestationsService.modifier(req.params.id, data);
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
