const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Review = sequelize.define("Review", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: "idreview",
  },
  note: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 5 },
  },
  reservationId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: "reservation_id",
    references: {
      model: "reservations",
      key: "idreservation",
    },
    onDelete: "CASCADE",
  },
  commentaire: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});
module.exports = Review;
