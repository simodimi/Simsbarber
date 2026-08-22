const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const bcrypt = require("bcrypt");
const User = sequelize.define("User", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: "iduser",
  },
  nameUser: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  mailUser: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  passwordUser: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  photoUser: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  chatBackgroundUrl: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM("ACTIF", "BLOQUE"),
    defaultValue: "ACTIF",
  },
  validationToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});
//cryptage du mot de passe avant création
User.beforeCreate(async (user) => {
  user.passwordUser = await bcrypt.hash(user.passwordUser, 12);
});
//mis à jour
User.beforeUpdate(async (user) => {
  if (user.changed("passwordUser")) {
    user.passwordUser = await bcrypt.hash(user.passwordUser, 12);
  }
});
module.exports = User;
