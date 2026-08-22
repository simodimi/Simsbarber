const { Category } = require("../models");
const { ErreurMetier } = require("./auth.service");

async function lister() {
  return Category.findAll({ order: [["nom", "ASC"]] });
}

async function creer(data) {
  return Category.create(data);
}

async function modifier(id, data) {
  const category = await Category.findByPk(id);
  if (!category) throw new ErreurMetier("Catégorie introuvable", 404);
  await category.update(data);
  return category;
}

async function supprimer(id) {
  const category = await Category.findByPk(id);
  if (!category) throw new ErreurMetier("Catégorie introuvable", 404);
  await category.destroy();
}

module.exports = { lister, creer, modifier, supprimer };
