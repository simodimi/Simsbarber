const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Notification = sequelize.define("Notification", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: "idnotification",
  },
  recipientType: {
    type: DataTypes.ENUM("USER", "ADMIN"),
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  adminId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  type: {
    type: DataTypes.ENUM(
      "RESERVATION_RAPPEL_J1",
      "RESERVATION_RAPPEL_JOURJ",
      "RESERVATION_ANNULEE",
      "NOUVELLE_DEMANDE_ADMIN",
      "NOUVEAU_MESSAGE",
      "COMPTE_APPROUVE",
    ),
    allowNull: false,
  },
  content: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  link: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  read: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});
module.exports = Notification;
