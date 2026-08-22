//validation manuelle des nouveaux comptes admin
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const bcrypt = require("bcrypt");
const AdminAccessRequest = sequelize.define("AdminAccessRequest", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: "idadminaccessrequest",
  },
  nameAdmin: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  emailAdmin: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: { isEmail: true },
  },
  passwordAdmin: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("ATTENTE", "APPROUVE", "REFUSE"),
    defaultValue: "ATTENTE",
  },
  requestedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  decidedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null,
  },
});
AdminAccessRequest.beforeCreate(async (request) => {
  request.passwordAdmin = await bcrypt.hash(request.passwordAdmin, 12);
});
module.exports = AdminAccessRequest;
