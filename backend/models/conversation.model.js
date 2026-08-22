const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

//Une conversation représente le fil de discussion
// entre UN user précis et l'équipe admin (comme dans Message.tsx côté user
const Conversation = sequelize.define("Conversation", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: "idconversation",
  },
  // Permet de trier la liste des contacts côté admin (MessageAdmin.tsx) par
  // activité la plus récente, sans avoir à recalculer ça à chaque affichage
  // en cherchant le dernier message de chaque conversation un par un.
  lastMessageAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

module.exports = Conversation;
