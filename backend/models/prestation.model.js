const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Prestation = sequelize.define("Prestation", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: "idprestation",
  },
  slug: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },
  nom: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  descriptionCourte: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  descriptionComplete: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  galerie: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  duree: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  prix: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  ancienPrix: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  produitsUtilises: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});
module.exports = Prestation;
