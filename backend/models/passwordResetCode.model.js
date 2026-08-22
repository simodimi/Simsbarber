const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const PasswordResetCode = sequelize.define("PasswordResetCode", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: "idpasswordresetcode",
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: { isEmail: true },
  },
  code: {
    type: DataTypes.STRING(10),
    allowNull: false,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  used: {
    // Empêche qu'un même code soit réutilisé plusieurs fois une fois validé.
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

module.exports = PasswordResetCode;
