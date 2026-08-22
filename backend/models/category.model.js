const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Category = sequelize.define("Category", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: "idcategory",
  },
  nom: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },
  image: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

module.exports = Category;
