const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const bcrypt = require("bcrypt");
const Admin = sequelize.define("Admin", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: "idadmin",
  },
  nameAdmin: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  emailAdmin: {
    type: DataTypes.STRING(255),
    unique: true,
    allowNull: false,
    validate: { isEmail: true },
  },
  passwordAdmin: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
});
//hashage
Admin.beforeCreate(async (admin) => {
  admin.passwordAdmin = await bcrypt.hash(admin.passwordAdmin, 12);
});
Admin.beforeUpdate(async (admin) => {
  if (admin.changed("passwordAdmin")) {
    admin.passwordAdmin = await bcrypt.hash(admin.passwordAdmin, 12);
  }
});
module.exports = Admin;
