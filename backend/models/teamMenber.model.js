const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const TeamMenber = sequelize.define("TeamMenber", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: "idteamMenber",
  },
  nom: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  prenom: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  photo: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  titre: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  experience: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  categories: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  citation: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});
module.exports = TeamMenber;
