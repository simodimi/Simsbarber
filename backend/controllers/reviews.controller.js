const reviewsService = require("../services/reviews.service");

exports.create = async (req, res, next) => {
  try {
    const review = await reviewsService.creer(req.user.sub, req.body);
    res.status(201).json(review);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const review = await reviewsService.modifier(
      req.params.id,
      req.user.sub,
      req.body,
    );
    res.json(review);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await reviewsService.supprimer(req.params.id, req.user.sub);
    res.json({ message: "Avis supprimé" });
  } catch (err) {
    next(err);
  }
};

exports.listForAdmin = async (req, res, next) => {
  try {
    const reviews = await reviewsService.listerPourAdmin({
      email: req.query.email,
      nom: req.query.nom,
      note: req.query.note,
    });
    res.json(reviews);
  } catch (err) {
    next(err);
  }
};
exports.getByReservation = async (req, res, next) => {
  try {
    const review = await reviewsService.trouverParReservation(
      req.params.reservationId,
      req.user.sub,
    );
    res.json(review);
  } catch (err) {
    next(err);
  }
};
exports.list = async (req, res, next) => {
  try {
    const { minNote } = req.query;
    const reviews = await reviewsService.lister({ minNote });
    res.json(reviews);
  } catch (err) {
    next(err);
  }
};
exports.listByPrestation = async (req, res, next) => {
  try {
    const { prestationId } = req.params;
    const { minNote } = req.query;
    const reviews = await reviewsService.listerParPrestation(
      prestationId,
      minNote,
    );
    res.json(reviews);
  } catch (err) {
    next(err);
  }
};
