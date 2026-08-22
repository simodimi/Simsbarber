const reservationsService = require("../services/reservations.service");
const { getImageUrl } = require("../utils/Imagehelpers");

exports.create = async (req, res, next) => {
  try {
    const pictureUrl = req.file ? getImageUrl(req.file) : null;
    const reservationData = { ...req.body, pictureUrl };

    const reservation = await reservationsService.creerReservation(
      reservationData,
      req.user.sub,
    );
    const io = req.app.get("io");
    if (io) io.to("admins").emit("reservation:created", reservation);
    res.status(201).json(reservation);
  } catch (err) {
    next(err);
  }
};

exports.createAdmin = async (req, res, next) => {
  try {
    const pictureUrl = req.file ? getImageUrl(req.file) : null;
    const reservationData = { ...req.body, pictureUrl };

    const reservation = await reservationsService.creerReservationAdmin(
      reservationData,
      req.user.sub,
    );
    const io = req.app.get("io");
    if (io) {
      io.to(`user:${req.body.userId}`).emit("reservation:created", reservation);
      io.to("admins").emit("reservation:created", reservation);
    }
    res.status(201).json(reservation);
  } catch (err) {
    next(err);
  }
};

// Annulation par l'administrateur : sans restriction de délai.
exports.cancel = async (req, res, next) => {
  try {
    const reservation = await reservationsService.annulerReservation(
      req.params.id,
    );
    const io = req.app.get("io");
    if (io) {
      io.to(`user:${reservation.userId}`).emit(
        "reservation:cancelled",
        reservation,
      );
      io.to("admins").emit("reservation:updated", reservation);
    }
    res.json(reservation);
  } catch (err) {
    next(err);
  }
};

// Annulation par le client sur SA PROPRE réservation : refusée à moins de
// 24h du début (voir reservations.service.js -> annulerReservationUtilisateur).
exports.cancelMine = async (req, res, next) => {
  try {
    const reservation = await reservationsService.annulerReservationUtilisateur(
      req.params.id,
      req.user.sub,
    );
    const io = req.app.get("io");
    if (io) {
      io.to(`user:${reservation.userId}`).emit(
        "reservation:cancelled",
        reservation,
      );
      io.to("admins").emit("reservation:updated", reservation);
    }
    res.json(reservation);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const pictureUrl = req.file ? getImageUrl(req.file) : null;
    const reservationData = { ...req.body, pictureUrl };

    const reservation = await reservationsService.modifierReservation(
      req.params.id,
      reservationData,
    );
    const io = req.app.get("io");
    if (io) {
      io.to(`user:${reservation.userId}`).emit(
        "reservation:updated",
        reservation,
      );
      io.to("admins").emit("reservation:updated", reservation);
    }
    res.json(reservation);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await reservationsService.supprimerReservation(req.params.id);
    res.json({ message: "Réservation supprimée" });
  } catch (err) {
    next(err);
  }
};

/*exports.mine = async (req, res, next) => {
  try {
    const data = await reservationsService.listerMesReservations(req.user.sub, {
      page: Number(req.query.page) || 1,
      itemsParPage: Number(req.query.itemsParPage) || 3,
    });
    res.json(data);
  } catch (err) {
    next(err);
  }
};*/
exports.mine = async (req, res, next) => {
  try {
    const type = req.query.type || "all"; // past, upcoming, all
    const page = Number(req.query.page) || 1;
    const itemsParPage = Number(req.query.itemsParPage) || 3;
    const data = await reservationsService.listerMesReservations(req.user.sub, {
      type,
      page,
      itemsParPage,
    });
    res.json(data);
  } catch (err) {
    next(err);
  }
};
exports.all = async (req, res, next) => {
  try {
    res.json(await reservationsService.listerToutes(req.query.userId));
  } catch (err) {
    next(err);
  }
};
exports.complete = async (req, res, next) => {
  try {
    const reservation = await reservationsService.marquerTerminee(
      req.params.id,
    );
    const io = req.app.get("io");
    if (io) io.to("admins").emit("reservation:updated", reservation);
    res.json(reservation);
  } catch (err) {
    next(err);
  }
};
exports.reopen = async (req, res, next) => {
  try {
    const reservation = await reservationsService.demarquerTerminee(
      req.params.id,
    );
    const io = req.app.get("io");
    if (io) io.to("admins").emit("reservation:updated", reservation);
    res.json(reservation);
  } catch (err) {
    next(err);
  }
};
