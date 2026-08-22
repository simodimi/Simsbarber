const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

//prixSnapshot : on "capture" le
// prix de la prestation AU MOMENT de la réservation. Pourquoi c'est
// important : si dans 6 mois vous changez le prix d'une "Coupe Classique"
// de 25€ à 30€, une ancienne réservation déjà passée ne doit PAS afficher
// rétroactivement le nouveau prix — l'historique doit rester figé tel qu'il
// était réellement au moment de la prestation.
const ReservationPrestation = sequelize.define("ReservationPrestation", {
  prixSnapshot: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
});

module.exports = ReservationPrestation;
