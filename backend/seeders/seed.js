// au tout début, il n'existe justement AUCUN admin pour approuver qui que
// ce soit — c'est le classique problème de "l'œuf et la poule". Ce script
// crée donc le TOUT PREMIER compte admin directement en base, une seule
// fois, à la main.

require("dotenv").config();
const { sequelize, Admin, Category } = require("../models");

async function seed() {
  await sequelize.authenticate();

  const [admin, cree] = await Admin.findOrCreate({
    where: { emailAdmin: "simodimitri08@gmail.com" },
    defaults: {
      nameAdmin: "Admin Principal",
      // Mot de passe en clair ici : le hook beforeCreate du modèle Admin le
      // hash automatiquement à l'insertion.
      passwordAdmin: "ChangezMoi123!",
    },
  });
  console.log(
    cree ? "Compte admin créé :" : "Compte admin déjà existant :",
    admin.emailAdmin,
  );

  const categoriesDeBase = [
    { nom: "Coupe", description: "Toutes nos coupes homme et enfant" },
    { nom: "Barbe", description: "Taille, rasage et soins de la barbe" },
  ];
  for (const c of categoriesDeBase) {
    await Category.findOrCreate({ where: { nom: c.nom }, defaults: c });
  }
  console.log("Catégories de base vérifiées/créées");

  await sequelize.close();
}

seed().catch((err) => {
  console.error("Erreur pendant le seed :", err);
  process.exit(1);
});
