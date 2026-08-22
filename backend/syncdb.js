// À utiliser en développement UNIQUEMENT, tant que vous n'avez pas encore
// mis en place de vraies migrations Sequelize CLI. sync({ alter: true })
// compare vos modèles à l'état réel des tables MySQL et ajuste
// automatiquement les colonnes manquantes/différentes.
//
// Utilisation : node scripts/syncDb.js
//
// ATTENTION : à ne PAS utiliser tel quel en production (alter peut, dans
// certains cas de renommage de colonne, faire perdre des données — en
// production on préfère toujours des migrations écrites et relues à la
// main). Pour l'instant, en phase de développement actif où le schéma
// bouge encore beaucoup, c'est la option la plus simple.

require("dotenv").config();
const { sequelize } = require("./models");

sequelize
  .sync() //{ alter: true }
  .then(() => {
    console.log("Base de données synchronisée avec les modèles");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Erreur de synchronisation :", err);
    process.exit(1);
  });
