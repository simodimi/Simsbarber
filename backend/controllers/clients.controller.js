const clientsService = require("../services/clients.service");

exports.list = async (req, res, next) => {
  try {
    const clients = await clientsService.listerClients({
      email: req.query.email,
      nom: req.query.nom,
    });
    res.json(clients);
  } catch (err) {
    next(err);
  }
};

exports.toggleStatus = async (req, res, next) => {
  try {
    const client = await clientsService.toggleStatus(req.params.id);
    res.json(client);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await clientsService.supprimerClient(req.params.id);
    res.json({ message: "Client supprimé" });
  } catch (err) {
    next(err);
  }
};
