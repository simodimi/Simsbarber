const { Prestation, Category, Review } = require("../models");
const { genererSlugUnique } = require("../utils/slugify");
const { ErreurMetier } = require("./auth.service");

async function lister(categoryId) {
  const where = categoryId ? { categoryId } : {};
  return Prestation.findAll({
    where,
    include: [{ model: Category, as: "category" }],
  });
}

async function getBySlug(slug) {
  const prestation = await Prestation.findOne({
    where: { slug },
    include: [{ model: Category, as: "category" }],
  });
  if (!prestation) throw new ErreurMetier("Prestation introuvable", 404);

  const stats = await Review.findOne({
    where: { prestationId: prestation.id },
    attributes: [
      [Review.sequelize.fn("AVG", Review.sequelize.col("note")), "moyenne"],
      [Review.sequelize.fn("COUNT", Review.sequelize.col("id")), "total"],
    ],
    raw: true,
  });

  return {
    ...prestation.toJSON(),
    avgNote: stats.moyenne,
    totalAvis: stats.total,
  };
}

async function creer(data) {
  const slug = await genererSlugUnique(data.nom);
  return Prestation.create({ ...data, slug });
}

async function modifier(id, data) {
  const prestation = await Prestation.findByPk(id);
  if (!prestation) throw new ErreurMetier("Prestation introuvable", 404);
  if (data.nom && data.nom !== prestation.nom) {
    data.slug = await genererSlugUnique(data.nom);
  }
  await prestation.update(data);
  return prestation;
}

async function supprimer(id) {
  const prestation = await Prestation.findByPk(id);
  if (!prestation) throw new ErreurMetier("Prestation introuvable", 404);
  await prestation.destroy();
}

module.exports = { lister, getBySlug, creer, modifier, supprimer };
