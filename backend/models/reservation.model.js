const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Reservation = sequelize.define("Reservation", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: "idreservation",
  },
  createdByAdminId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  start: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  end: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  pictureUrl: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  color: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  prixTotal: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  dureeTotal: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  titre: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  descriptionComplete: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  categoriesSelectionnees: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("CONFIRME", "ANNULE", "TERMINE"),
    defaultValue: "CONFIRME",
  },

  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});
module.exports = Reservation;
