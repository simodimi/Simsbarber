const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Message = sequelize.define("Message", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: "idmessage",
  },
  senderType: {
    type: DataTypes.ENUM("USER", "ADMIN"),
    allowNull: false,
  },
  senderAdminId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  imageUrl: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  //diffuser un message à plusieurs personnes à la fois
  isBroadcast: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  broadcastGroupId: {
    type: DataTypes.STRING(36),
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  readAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
});
module.exports = Message;
