const { Op } = require("sequelize");
const { User } = require("../models");
const { ErreurMetier } = require("./auth.service");

async function listerClients({ email, nom }) {
  const where = {};
  if (email) where.mailUser = { [Op.like]: `%${email}%` };
  if (nom) where.nameUser = { [Op.like]: `%${nom}%` };
  return User.findAll({
    where,
    attributes: { exclude: ["passwordUser"] },
    order: [["createdAt", "DESC"]],
  });
}

async function toggleStatus(userId) {
  const user = await User.findByPk(userId);
  if (!user) throw new ErreurMetier("Client introuvable", 404);
  user.status = user.status === "ACTIF" ? "BLOQUE" : "ACTIF";
  await user.save();
  return user;
}

async function supprimerClient(userId) {
  const user = await User.findByPk(userId);
  if (!user) throw new ErreurMetier("Client introuvable", 404);
  await user.destroy();
}

module.exports = { listerClients, toggleStatus, supprimerClient };
