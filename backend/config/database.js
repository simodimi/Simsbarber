const { Sequelize } = require("sequelize");
require("dotenv").config();

//définition des constances

const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_HOST = process.env.DB_HOST;
const DB_PORT = process.env.DB_PORT;

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  logging: false,
  dialect: "mysql",
  port: DB_PORT,
});
//connexion à la base de données
sequelize
  .authenticate()
  .then(() => console.log("connexion à la base de données réussi"))
  .catch((error) => {
    console.log("erreur lors de la connexion à la base de données", error);
  });

module.exports = { sequelize };
