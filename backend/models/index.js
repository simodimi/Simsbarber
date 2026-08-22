const { sequelize } = require("../config/database");

// import des modèles
const User = require("./user.model");
const Prestation = require("./prestation.model");
const Category = require("./category.model");
const PasswordResetCode = require("./passwordResetCode.model");
const Conversation = require("./conversation.model");
const ReservationPrestation = require("./reservationPrestation.model");
const Review = require("./review.model");
const Message = require("./message.model");
const Notification = require("./notification.model");
const Admin = require("./admin.model");
const AdminAccessRequest = require("./adminAccessRequest.model");
const TeamMenber = require("./teamMenber.model");
const Reservation = require("./reservation.model");

// ASSOCIATIONS

// Category Prestation (1-n)

Category.hasMany(Prestation, {
  foreignKey: "categoryId", //la clé categoryId devient clé étrangère dans prestation
  as: "prestations", //manipulation Category.prestations
  onDelete: "CASCADE", // si on supprime une catégorie, ses prestations partent avec (à discuter si vous préférez les garder orphelines)
});
Prestation.belongsTo(Category, {
  foreignKey: "categoryId",
  as: "category",
});

// User Reservation (1-n)
User.hasMany(Reservation, {
  foreignKey: "userId",
  as: "reservations",
  onDelete: "CASCADE",
});
Reservation.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

//  Admin Reservation (1-n, optionnel)puisque createdByAdminId fait parti de ma table reservation
Admin.hasMany(Reservation, {
  foreignKey: "createdByAdminId",
  as: "reservationsCreees",
});
Reservation.belongsTo(Admin, {
  foreignKey: "createdByAdminId",
  as: "creePar",
});

// Reservation Prestation (plusieurs-à-plusieurs)
Reservation.belongsToMany(Prestation, {
  through: ReservationPrestation, //on crée une table intermédiaire
  foreignKey: "reservationId",
  otherKey: "prestationId",
  as: "prestations",
});
Prestation.belongsToMany(Reservation, {
  through: ReservationPrestation,
  foreignKey: "prestationId",
  otherKey: "reservationId",
  as: "reservations",
});

// User Notification (1-n)
User.hasMany(Notification, {
  foreignKey: "userId",
  as: "notifications",
  onDelete: "CASCADE",
});
Notification.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

// Admin Notification (1-n)
Admin.hasMany(Notification, {
  foreignKey: "adminId",
  as: "notifications",
  onDelete: "CASCADE",
});
Notification.belongsTo(Admin, {
  foreignKey: "adminId",
  as: "admin",
});

// User Conversation (1-1)
User.hasOne(Conversation, {
  foreignKey: "userId",
  as: "conversation",
  onDelete: "CASCADE",
});
Conversation.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

// Conversation ↔ Message (1-n)
Conversation.hasMany(Message, {
  foreignKey: "conversationId",
  as: "messages",
  onDelete: "CASCADE",
});
Message.belongsTo(Conversation, {
  foreignKey: "conversationId",
  as: "conversation",
});

// Admin Message (n-1, optionnel)
// Sert uniquement à savoir QUEL admin précisément a écrit un message donné

Admin.hasMany(Message, {
  foreignKey: "senderAdminId",
  as: "messagesEnvoyes",
});
Message.belongsTo(Admin, {
  foreignKey: "senderAdminId",
  as: "admin",
});

// Prestation Review (1-n)
Prestation.hasMany(Review, {
  foreignKey: "prestationId",
  as: "reviews",
  onDelete: "CASCADE",
});
Review.belongsTo(Prestation, {
  foreignKey: "prestationId",
  as: "prestation",
});

// User Review (1-n)
User.hasMany(Review, {
  foreignKey: "userId",
  as: "reviews",
  onDelete: "CASCADE",
});
Review.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

// Reservation  Review (1-1, optionnel)
// Permet de savoir exactement quelle réservation a
// motivé un avis précis, comme dans le formulaire de notation de
Reservation.hasOne(Review, {
  foreignKey: "reservationId",
  as: "review",
});
Review.belongsTo(Reservation, {
  foreignKey: "reservationId",
  as: "reservation",
});

// Admin AdminAccessRequest (n-1, optionnel)
// quel admin EXISTANT a validé ou
// refusé la demande (rempli uniquement une fois la décision prise, d'où
// allowNull: true).
Admin.hasMany(AdminAccessRequest, {
  foreignKey: "decidedByAdminId",
  as: "demandesTraitees",
});
AdminAccessRequest.belongsTo(Admin, {
  foreignKey: { name: "decidedByAdminId", allowNull: true },
  as: "decidePar",
});

module.exports = {
  sequelize,
  User,
  Prestation,
  Category,
  PasswordResetCode,
  Conversation,
  ReservationPrestation,
  Review,
  Message,
  Notification,
  Admin,
  AdminAccessRequest,
  TeamMenber,
  Reservation,
};
