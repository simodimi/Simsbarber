const AVATARS = [
  "../public/avatars/A1.jpg",
  "../public/avatars/A2.jpg",
  "../public/avatars/A3.jpg",
  "../public/avatars/A4.jpg",
  "../public/avatars/A5.jpg",
  "../public/avatars/A6.jpg",
  "../public/avatars/A7.jpg",
  "../public/avatars/A8.jpg",
  "../public/avatars/A9.jpg",
  "../public/avatars/A10.jpg",
  "../public/avatars/A11.jpg",
  "../public/avatars/A12.jpg",
  "../public/avatars/A13.jpg",
  "../public/avatars/A14.jpg",
  "../public/avatars/A15.jpg",
  "../public/avatars/A16.jpg",
  "../public/avatars/A17.jpg",
  "../public/avatars/A18.jpg",
  "../public/avatars/A19.jpg",
  "../public/avatars/A20.jpg",
];
const BACKGROUNDS = [
  "../public/background/arbre.jpg",
  "../public/background/bateau.jpg",
  "../public/background/board.jpeg",
  "../public/background/cascade.jpg",
  "../public/background/galaxie.jpeg",
  "../public/background/mountains.jpg",
  "../public/background/neige.jpg",
  "../public/background/pink.jpg",
  "../public/background/water.jpg",
];

const COULEURS_RESERVATION = [
  { id: 1, label: "Confirmé", hex: "#27ae60" },
  { id: 2, label: "En attente", hex: "#f1c40f" },
  { id: 3, label: "Annulé", hex: "#e74c3c" }, // celle qui doit s'afficher automatiquement quand l'admin annule
];

module.exports = { AVATARS, BACKGROUNDS, COULEURS_RESERVATION };
