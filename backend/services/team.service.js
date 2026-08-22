const { TeamMenber } = require("../models");
const { ErreurMetier } = require("./auth.service");

async function lister() {
  return TeamMenber.findAll({ order: [["createdAt", "ASC"]] });
}

async function creer(data) {
  return TeamMenber.create(data);
}

async function modifier(id, data) {
  const membre = await TeamMenber.findByPk(id);
  if (!membre) throw new ErreurMetier("Membre introuvable", 404);
  await membre.update(data);
  return membre;
}

async function supprimer(id) {
  const membre = await TeamMenber.findByPk(id);
  if (!membre) throw new ErreurMetier("Membre introuvable", 404);
  await membre.destroy();
}

module.exports = { lister, creer, modifier, supprimer };
