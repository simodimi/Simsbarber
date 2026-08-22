import c1 from "../assets/photos/categorie/barbe.jpg";
import c2 from "../assets/photos/categorie/coupe.jpg";
import c3 from "../assets/photos/categorie/couleur.jpg";
import c5 from "../assets/photos/categorie/soins.jpg";

import avatar1 from "../assets/avatar/A1.jpg";
import avatar2 from "../assets/avatar/A2.jpg";
import avatar3 from "../assets/avatar/A3.jpg";
import avatar4 from "../assets/avatar/A4.jpg";
import avatar5 from "../assets/avatar/A5.jpg";
import avatar6 from "../assets/avatar/A6.jpg";
import avatar7 from "../assets/avatar/A7.jpg";
import avatar8 from "../assets/avatar/A8.jpg";
import avatar9 from "../assets/avatar/A9.jpg";
import avatar10 from "../assets/avatar/A10.jpg";
import avatar11 from "../assets/avatar/A11.jpg";
import avatar12 from "../assets/avatar/A12.jpg";
import avatar13 from "../assets/avatar/A13.jpg";
import avatar14 from "../assets/avatar/A14.jpg";
import avatar15 from "../assets/avatar/A15.jpg";
import avatar16 from "../assets/avatar/A16.jpg";
import avatar17 from "../assets/avatar/A17.jpg";
import avatar18 from "../assets/avatar/A18.jpg";

import B1 from "../assets/background/arbre.jpg";
import B2 from "../assets/background/bateau.jpg";
import B3 from "../assets/background/board.jpeg";
import B4 from "../assets/background/cascade.jpg";
import B5 from "../assets/background/galaxie.jpeg";
import B6 from "../assets/background/mountains.jpg";
import B7 from "../assets/background/neige.jpg";
import B8 from "../assets/background/pink.jpeg";
import B9 from "../assets/background/water.jpg";
export interface data {
  id: number;
  slug: string;
  categorie: string;
  nom: string;
  descriptionCourte: string;
  descriptionComplete: string;
  image: string;
  galerie: string[];
  duree: number;
  prix: number;
  ancienPrix: number;
  badge: string;
  popularite: number;
  nombreAvis: number;
  nombreReservations: number;
  produitsUtilises: string[];
  outilsUtilises: string[];
  etapes: string[];
  inclus: string[];
  options: { nom: string; prix: number }[];
  conseilsAvant: string;
  conseilsApres: string;
  frequenceRecommandee: string;
  typeCheveux: string[];
  typePeau: string[];
  tags: string[];
}
export interface datacategories {
  id: number;
  nom: string;
  picture: string;
  description: string;
}
export interface avatar {
  id: number;
  image: string;
}
export interface BackgroundType {
  id: number;
  background: string;
}
export interface reservation {
  id: number;
  image: string;
  customerName: string;
  service: string;
  date: string;
  time: string;
  duration: number;
  price: number;
  barber: string;
  comment: string;
  status: string;
  bookingMethod: string;
}
export const services: data[] = [
  {
    id: 1,
    slug: "coupe-classique",
    categorie: "Coupe",
    nom: "Coupe Classique",
    descriptionCourte: "Prestation professionnelle de coupe.",
    descriptionComplete:
      "Cette prestation Coupe Classique comprend un diagnostic personnalisé, une préparation, une réalisation soignée, des finitions et des conseils d'entretien adaptés.",
    image: c1,
    galerie: [c1, c2],
    duree: 20,
    prix: 20,
    ancienPrix: 25,
    badge: "Best Seller",
    popularite: 4.5,
    nombreAvis: 120,
    nombreReservations: 700,
    produitsUtilises: ["Shampooing professionnel", "Huile", "Cire coiffante"],
    outilsUtilises: ["Tondeuse", "Ciseaux", "Rasoir"],
    etapes: [
      "Diagnostic",
      "Préparation",
      "Réalisation",
      "Finitions",
      "Conseils",
    ],
    inclus: ["Diagnostic", "Produits professionnels", "Conseils"],
    options: [
      { nom: "Massage", prix: 10 },
      { nom: "Soin Premium", prix: 15 },
    ],
    conseilsAvant: "Arriver quelques minutes avant le rendez-vous.",
    conseilsApres:
      "Utiliser les produits recommandés et revenir pour l'entretien.",
    frequenceRecommandee: "Toutes les 3 à 4 semaines.",
    typeCheveux: ["Tous"],
    typePeau: ["Toutes"],
    tags: ["Coupe", "Professionnel", "Barbershop"],
  },
  {
    id: 2,
    slug: "skin-fade",
    categorie: "Coupe",
    nom: "Skin Fade",
    descriptionCourte: "Prestation professionnelle de coupe.",
    descriptionComplete:
      "Cette prestation Skin Fade comprend un diagnostic personnalisé, une préparation, une réalisation soignée, des finitions et des conseils d'entretien adaptés.",
    image: c1,
    galerie: [c1, c2],
    duree: 30,
    prix: 25,
    ancienPrix: 30,
    badge: "Populaire",
    popularite: 4.6,
    nombreAvis: 155,
    nombreReservations: 880,
    produitsUtilises: ["Shampooing professionnel", "Huile", "Cire coiffante"],
    outilsUtilises: ["Tondeuse", "Ciseaux", "Rasoir"],
    etapes: [
      "Diagnostic",
      "Préparation",
      "Réalisation",
      "Finitions",
      "Conseils",
    ],
    inclus: ["Diagnostic", "Produits professionnels", "Conseils"],
    options: [
      { nom: "Massage", prix: 10 },
      { nom: "Soin Premium", prix: 15 },
    ],
    conseilsAvant: "Arriver quelques minutes avant le rendez-vous.",
    conseilsApres:
      "Utiliser les produits recommandés et revenir pour l'entretien.",
    frequenceRecommandee: "Toutes les 3 à 4 semaines.",
    typeCheveux: ["Tous"],
    typePeau: ["Toutes"],
    tags: ["Coupe", "Professionnel", "Barbershop"],
  },
  {
    id: 3,
    slug: "buzz-cut",
    categorie: "Coupe",
    nom: "Buzz Cut",
    descriptionCourte: "Prestation professionnelle de coupe.",
    descriptionComplete:
      "Cette prestation Buzz Cut comprend un diagnostic personnalisé, une préparation, une réalisation soignée, des finitions et des conseils d'entretien adaptés.",
    image: c1,
    galerie: [c1, c2],
    duree: 40,
    prix: 30,
    ancienPrix: 35,
    badge: "Populaire",
    popularite: 4.7,
    nombreAvis: 190,
    nombreReservations: 1060,
    produitsUtilises: ["Shampooing professionnel", "Huile", "Cire coiffante"],
    outilsUtilises: ["Tondeuse", "Ciseaux", "Rasoir"],
    etapes: [
      "Diagnostic",
      "Préparation",
      "Réalisation",
      "Finitions",
      "Conseils",
    ],
    inclus: ["Diagnostic", "Produits professionnels", "Conseils"],
    options: [
      { nom: "Massage", prix: 10 },
      { nom: "Soin Premium", prix: 15 },
    ],
    conseilsAvant: "Arriver quelques minutes avant le rendez-vous.",
    conseilsApres:
      "Utiliser les produits recommandés et revenir pour l'entretien.",
    frequenceRecommandee: "Toutes les 3 à 4 semaines.",
    typeCheveux: ["Tous"],
    typePeau: ["Toutes"],
    tags: ["Coupe", "Professionnel", "Barbershop"],
  },
  {
    id: 4,
    slug: "coupe-premium",
    categorie: "Coupe",
    nom: "Coupe Premium",
    descriptionCourte: "Prestation professionnelle de coupe.",
    descriptionComplete:
      "Cette prestation Coupe Premium comprend un diagnostic personnalisé, une préparation, une réalisation soignée, des finitions et des conseils d'entretien adaptés.",

    image: c1,
    galerie: [c1, c2],
    duree: 50,
    prix: 35,
    ancienPrix: 40,
    badge: "Populaire",
    popularite: 4.8,
    nombreAvis: 225,
    nombreReservations: 1240,
    produitsUtilises: ["Shampooing professionnel", "Huile", "Cire coiffante"],
    outilsUtilises: ["Tondeuse", "Ciseaux", "Rasoir"],
    etapes: [
      "Diagnostic",
      "Préparation",
      "Réalisation",
      "Finitions",
      "Conseils",
    ],
    inclus: ["Diagnostic", "Produits professionnels", "Conseils"],
    options: [
      { nom: "Massage", prix: 10 },
      { nom: "Soin Premium", prix: 15 },
    ],
    conseilsAvant: "Arriver quelques minutes avant le rendez-vous.",
    conseilsApres:
      "Utiliser les produits recommandés et revenir pour l'entretien.",
    frequenceRecommandee: "Toutes les 3 à 4 semaines.",
    typeCheveux: ["Tous"],
    typePeau: ["Toutes"],
    tags: ["Coupe", "Professionnel", "Barbershop"],
  },
  {
    id: 5,
    slug: "coupe-enfant",
    categorie: "Coupe",
    nom: "Coupe Enfant",
    descriptionCourte: "Prestation professionnelle de coupe.",
    descriptionComplete:
      "Cette prestation Coupe Enfant comprend un diagnostic personnalisé, une préparation, une réalisation soignée, des finitions et des conseils d'entretien adaptés.",
    image: c1,
    galerie: [c1, c2],
    duree: 60,
    prix: 40,
    ancienPrix: 45,
    badge: "Premium",
    popularite: 4.9,
    nombreAvis: 260,
    nombreReservations: 1420,
    produitsUtilises: ["Shampooing professionnel", "Huile", "Cire coiffante"],
    outilsUtilises: ["Tondeuse", "Ciseaux", "Rasoir"],
    etapes: [
      "Diagnostic",
      "Préparation",
      "Réalisation",
      "Finitions",
      "Conseils",
    ],
    inclus: ["Diagnostic", "Produits professionnels", "Conseils"],
    options: [
      { nom: "Massage", prix: 10 },
      { nom: "Soin Premium", prix: 15 },
    ],
    conseilsAvant: "Arriver quelques minutes avant le rendez-vous.",
    conseilsApres:
      "Utiliser les produits recommandés et revenir pour l'entretien.",
    frequenceRecommandee: "Toutes les 3 à 4 semaines.",
    typeCheveux: ["Tous"],
    typePeau: ["Toutes"],
    tags: ["Coupe", "Professionnel", "Barbershop"],
  },
  {
    id: 6,
    slug: "taille-de-barbe",
    categorie: "Barbe",
    nom: "Taille de Barbe",
    descriptionCourte: "Prestation professionnelle de barbe.",
    descriptionComplete:
      "Cette prestation Taille de Barbe comprend un diagnostic personnalisé, une préparation, une réalisation soignée, des finitions et des conseils d'entretien adaptés.",
    image: c1,
    galerie: [c1, c2],
    duree: 20,
    prix: 20,
    ancienPrix: 25,
    badge: "Best Seller",
    popularite: 4.5,
    nombreAvis: 120,
    nombreReservations: 700,
    produitsUtilises: ["Shampooing professionnel", "Huile", "Cire coiffante"],
    outilsUtilises: ["Tondeuse", "Ciseaux", "Rasoir"],
    etapes: [
      "Diagnostic",
      "Préparation",
      "Réalisation",
      "Finitions",
      "Conseils",
    ],
    inclus: ["Diagnostic", "Produits professionnels", "Conseils"],
    options: [
      { nom: "Massage", prix: 10 },
      { nom: "Soin Premium", prix: 15 },
    ],
    conseilsAvant: "Arriver quelques minutes avant le rendez-vous.",
    conseilsApres:
      "Utiliser les produits recommandés et revenir pour l'entretien.",
    frequenceRecommandee: "Toutes les 3 à 4 semaines.",
    typeCheveux: ["Tous"],
    typePeau: ["Toutes"],
    tags: ["Barbe", "Professionnel", "Barbershop"],
  },
  {
    id: 7,
    slug: "rasage-traditionnel",
    categorie: "Barbe",
    nom: "Rasage Traditionnel",
    descriptionCourte: "Prestation professionnelle de barbe.",
    descriptionComplete:
      "Cette prestation Rasage Traditionnel comprend un diagnostic personnalisé, une préparation, une réalisation soignée, des finitions et des conseils d'entretien adaptés.",
    image: c1,
    galerie: [c1, c2],
    duree: 30,
    prix: 25,
    ancienPrix: 30,
    badge: "Populaire",
    popularite: 4.6,
    nombreAvis: 155,
    nombreReservations: 880,
    produitsUtilises: ["Shampooing professionnel", "Huile", "Cire coiffante"],
    outilsUtilises: ["Tondeuse", "Ciseaux", "Rasoir"],
    etapes: [
      "Diagnostic",
      "Préparation",
      "Réalisation",
      "Finitions",
      "Conseils",
    ],
    inclus: ["Diagnostic", "Produits professionnels", "Conseils"],
    options: [
      { nom: "Massage", prix: 10 },
      { nom: "Soin Premium", prix: 15 },
    ],
    conseilsAvant: "Arriver quelques minutes avant le rendez-vous.",
    conseilsApres:
      "Utiliser les produits recommandés et revenir pour l'entretien.",
    frequenceRecommandee: "Toutes les 3 à 4 semaines.",
    typeCheveux: ["Tous"],
    typePeau: ["Toutes"],
    tags: ["Barbe", "Professionnel", "Barbershop"],
  },
  {
    id: 8,
    slug: "barbe-premium",
    categorie: "Barbe",
    nom: "Barbe Premium",
    descriptionCourte: "Prestation professionnelle de barbe.",
    descriptionComplete:
      "Cette prestation Barbe Premium comprend un diagnostic personnalisé, une préparation, une réalisation soignée, des finitions et des conseils d'entretien adaptés.",
    image: c1,
    galerie: [c1, c2],
    duree: 40,
    prix: 30,
    ancienPrix: 35,
    badge: "Populaire",
    popularite: 4.7,
    nombreAvis: 190,
    nombreReservations: 1060,
    produitsUtilises: ["Shampooing professionnel", "Huile", "Cire coiffante"],
    outilsUtilises: ["Tondeuse", "Ciseaux", "Rasoir"],
    etapes: [
      "Diagnostic",
      "Préparation",
      "Réalisation",
      "Finitions",
      "Conseils",
    ],
    inclus: ["Diagnostic", "Produits professionnels", "Conseils"],
    options: [
      { nom: "Massage", prix: 10 },
      { nom: "Soin Premium", prix: 15 },
    ],
    conseilsAvant: "Arriver quelques minutes avant le rendez-vous.",
    conseilsApres:
      "Utiliser les produits recommandés et revenir pour l'entretien.",
    frequenceRecommandee: "Toutes les 3 à 4 semaines.",
    typeCheveux: ["Tous"],
    typePeau: ["Toutes"],
    tags: ["Barbe", "Professionnel", "Barbershop"],
  },
  {
    id: 9,
    slug: "contours-barbe",
    categorie: "Barbe",
    nom: "Contours Barbe",
    descriptionCourte: "Prestation professionnelle de barbe.",
    descriptionComplete:
      "Cette prestation Contours Barbe comprend un diagnostic personnalisé, une préparation, une réalisation soignée, des finitions et des conseils d'entretien adaptés.",
    image: c1,
    galerie: [c1, c2],
    duree: 50,
    prix: 35,
    ancienPrix: 40,
    badge: "Populaire",
    popularite: 4.8,
    nombreAvis: 225,
    nombreReservations: 1240,
    produitsUtilises: ["Shampooing professionnel", "Huile", "Cire coiffante"],
    outilsUtilises: ["Tondeuse", "Ciseaux", "Rasoir"],
    etapes: [
      "Diagnostic",
      "Préparation",
      "Réalisation",
      "Finitions",
      "Conseils",
    ],
    inclus: ["Diagnostic", "Produits professionnels", "Conseils"],
    options: [
      { nom: "Massage", prix: 10 },
      { nom: "Soin Premium", prix: 15 },
    ],
    conseilsAvant: "Arriver quelques minutes avant le rendez-vous.",
    conseilsApres:
      "Utiliser les produits recommandés et revenir pour l'entretien.",
    frequenceRecommandee: "Toutes les 3 à 4 semaines.",
    typeCheveux: ["Tous"],
    typePeau: ["Toutes"],
    tags: ["Barbe", "Professionnel", "Barbershop"],
  },
  {
    id: 10,
    slug: "soin-complet-barbe",
    categorie: "Barbe",
    nom: "Soin Complet Barbe",
    descriptionCourte: "Prestation professionnelle de barbe.",
    descriptionComplete:
      "Cette prestation Soin Complet Barbe comprend un diagnostic personnalisé, une préparation, une réalisation soignée, des finitions et des conseils d'entretien adaptés.",
    image: "/images/services/10.jpg",
    galerie: ["/images/services/10-1.jpg", "/images/services/10-2.jpg"],
    duree: 60,
    prix: 40,
    ancienPrix: 45,
    badge: "Premium",
    popularite: 4.9,
    nombreAvis: 260,
    nombreReservations: 1420,
    produitsUtilises: ["Shampooing professionnel", "Huile", "Cire coiffante"],
    outilsUtilises: ["Tondeuse", "Ciseaux", "Rasoir"],
    etapes: [
      "Diagnostic",
      "Préparation",
      "Réalisation",
      "Finitions",
      "Conseils",
    ],
    inclus: ["Diagnostic", "Produits professionnels", "Conseils"],
    options: [
      { nom: "Massage", prix: 10 },
      { nom: "Soin Premium", prix: 15 },
    ],
    conseilsAvant: "Arriver quelques minutes avant le rendez-vous.",
    conseilsApres:
      "Utiliser les produits recommandés et revenir pour l'entretien.",
    frequenceRecommandee: "Toutes les 3 à 4 semaines.",
    typeCheveux: ["Tous"],
    typePeau: ["Toutes"],
    tags: ["Barbe", "Professionnel", "Barbershop"],
  },
  {
    id: 11,
    slug: "coloration-classique",
    categorie: "Coloration",
    nom: "Coloration Classique",
    descriptionCourte: "Prestation professionnelle de coloration.",
    descriptionComplete:
      "Cette prestation Coloration Classique comprend un diagnostic personnalisé, une préparation, une réalisation soignée, des finitions et des conseils d'entretien adaptés.",
    image: "/images/services/11.jpg",
    galerie: ["/images/services/11-1.jpg", "/images/services/11-2.jpg"],
    duree: 20,
    prix: 20,
    ancienPrix: 25,
    badge: "Best Seller",
    popularite: 4.5,
    nombreAvis: 120,
    nombreReservations: 700,
    produitsUtilises: ["Shampooing professionnel", "Huile", "Cire coiffante"],
    outilsUtilises: ["Tondeuse", "Ciseaux", "Rasoir"],
    etapes: [
      "Diagnostic",
      "Préparation",
      "Réalisation",
      "Finitions",
      "Conseils",
    ],
    inclus: ["Diagnostic", "Produits professionnels", "Conseils"],
    options: [
      { nom: "Massage", prix: 10 },
      { nom: "Soin Premium", prix: 15 },
    ],
    conseilsAvant: "Arriver quelques minutes avant le rendez-vous.",
    conseilsApres:
      "Utiliser les produits recommandés et revenir pour l'entretien.",
    frequenceRecommandee: "Toutes les 3 à 4 semaines.",
    typeCheveux: ["Tous"],
    typePeau: ["Toutes"],
    tags: ["Coloration", "Professionnel", "Barbershop"],
  },
  {
    id: 12,
    slug: "camouflage-cheveux-blancs",
    categorie: "Coloration",
    nom: "Camouflage Cheveux Blancs",
    descriptionCourte: "Prestation professionnelle de coloration.",
    descriptionComplete:
      "Cette prestation Camouflage Cheveux Blancs comprend un diagnostic personnalisé, une préparation, une réalisation soignée, des finitions et des conseils d'entretien adaptés.",
    image: "/images/services/12.jpg",
    galerie: ["/images/services/12-1.jpg", "/images/services/12-2.jpg"],
    duree: 30,
    prix: 25,
    ancienPrix: 30,
    badge: "Populaire",
    popularite: 4.6,
    nombreAvis: 155,
    nombreReservations: 880,
    produitsUtilises: ["Shampooing professionnel", "Huile", "Cire coiffante"],
    outilsUtilises: ["Tondeuse", "Ciseaux", "Rasoir"],
    etapes: [
      "Diagnostic",
      "Préparation",
      "Réalisation",
      "Finitions",
      "Conseils",
    ],
    inclus: ["Diagnostic", "Produits professionnels", "Conseils"],
    options: [
      { nom: "Massage", prix: 10 },
      { nom: "Soin Premium", prix: 15 },
    ],
    conseilsAvant: "Arriver quelques minutes avant le rendez-vous.",
    conseilsApres:
      "Utiliser les produits recommandés et revenir pour l'entretien.",
    frequenceRecommandee: "Toutes les 3 à 4 semaines.",
    typeCheveux: ["Tous"],
    typePeau: ["Toutes"],
    tags: ["Coloration", "Professionnel", "Barbershop"],
  },
  {
    id: 13,
    slug: "coloration-barbe",
    categorie: "Coloration",
    nom: "Coloration Barbe",
    descriptionCourte: "Prestation professionnelle de coloration.",
    descriptionComplete:
      "Cette prestation Coloration Barbe comprend un diagnostic personnalisé, une préparation, une réalisation soignée, des finitions et des conseils d'entretien adaptés.",
    image: "/images/services/13.jpg",
    galerie: ["/images/services/13-1.jpg", "/images/services/13-2.jpg"],
    duree: 40,
    prix: 30,
    ancienPrix: 35,
    badge: "Populaire",
    popularite: 4.7,
    nombreAvis: 190,
    nombreReservations: 1060,
    produitsUtilises: ["Shampooing professionnel", "Huile", "Cire coiffante"],
    outilsUtilises: ["Tondeuse", "Ciseaux", "Rasoir"],
    etapes: [
      "Diagnostic",
      "Préparation",
      "Réalisation",
      "Finitions",
      "Conseils",
    ],
    inclus: ["Diagnostic", "Produits professionnels", "Conseils"],
    options: [
      { nom: "Massage", prix: 10 },
      { nom: "Soin Premium", prix: 15 },
    ],
    conseilsAvant: "Arriver quelques minutes avant le rendez-vous.",
    conseilsApres:
      "Utiliser les produits recommandés et revenir pour l'entretien.",
    frequenceRecommandee: "Toutes les 3 à 4 semaines.",
    typeCheveux: ["Tous"],
    typePeau: ["Toutes"],
    tags: ["Coloration", "Professionnel", "Barbershop"],
  },
  {
    id: 14,
    slug: "décoloration",
    categorie: "Coloration",
    nom: "Décoloration",
    descriptionCourte: "Prestation professionnelle de coloration.",
    descriptionComplete:
      "Cette prestation Décoloration comprend un diagnostic personnalisé, une préparation, une réalisation soignée, des finitions et des conseils d'entretien adaptés.",
    image: "/images/services/14.jpg",
    galerie: ["/images/services/14-1.jpg", "/images/services/14-2.jpg"],
    duree: 50,
    prix: 35,
    ancienPrix: 40,
    badge: "Populaire",
    popularite: 4.8,
    nombreAvis: 225,
    nombreReservations: 1240,
    produitsUtilises: ["Shampooing professionnel", "Huile", "Cire coiffante"],
    outilsUtilises: ["Tondeuse", "Ciseaux", "Rasoir"],
    etapes: [
      "Diagnostic",
      "Préparation",
      "Réalisation",
      "Finitions",
      "Conseils",
    ],
    inclus: ["Diagnostic", "Produits professionnels", "Conseils"],
    options: [
      { nom: "Massage", prix: 10 },
      { nom: "Soin Premium", prix: 15 },
    ],
    conseilsAvant: "Arriver quelques minutes avant le rendez-vous.",
    conseilsApres:
      "Utiliser les produits recommandés et revenir pour l'entretien.",
    frequenceRecommandee: "Toutes les 3 à 4 semaines.",
    typeCheveux: ["Tous"],
    typePeau: ["Toutes"],
    tags: ["Coloration", "Professionnel", "Barbershop"],
  },
  {
    id: 15,
    slug: "mèches-homme",
    categorie: "Coloration",
    nom: "Mèches Homme",
    descriptionCourte: "Prestation professionnelle de coloration.",
    descriptionComplete:
      "Cette prestation Mèches Homme comprend un diagnostic personnalisé, une préparation, une réalisation soignée, des finitions et des conseils d'entretien adaptés.",
    image: "/images/services/15.jpg",
    galerie: ["/images/services/15-1.jpg", "/images/services/15-2.jpg"],
    duree: 60,
    prix: 40,
    ancienPrix: 45,
    badge: "Premium",
    popularite: 4.9,
    nombreAvis: 260,
    nombreReservations: 1420,
    produitsUtilises: ["Shampooing professionnel", "Huile", "Cire coiffante"],
    outilsUtilises: ["Tondeuse", "Ciseaux", "Rasoir"],
    etapes: [
      "Diagnostic",
      "Préparation",
      "Réalisation",
      "Finitions",
      "Conseils",
    ],
    inclus: ["Diagnostic", "Produits professionnels", "Conseils"],
    options: [
      { nom: "Massage", prix: 10 },
      { nom: "Soin Premium", prix: 15 },
    ],
    conseilsAvant: "Arriver quelques minutes avant le rendez-vous.",
    conseilsApres:
      "Utiliser les produits recommandés et revenir pour l'entretien.",
    frequenceRecommandee: "Toutes les 3 à 4 semaines.",
    typeCheveux: ["Tous"],
    typePeau: ["Toutes"],
    tags: ["Coloration", "Professionnel", "Barbershop"],
  },
  {
    id: 16,
    slug: "massage-crânien",
    categorie: "Soins",
    nom: "Massage Crânien",
    descriptionCourte: "Prestation professionnelle de soins.",
    descriptionComplete:
      "Cette prestation Massage Crânien comprend un diagnostic personnalisé, une préparation, une réalisation soignée, des finitions et des conseils d'entretien adaptés.",
    image: "/images/services/16.jpg",
    galerie: ["/images/services/16-1.jpg", "/images/services/16-2.jpg"],
    duree: 20,
    prix: 20,
    ancienPrix: 25,
    badge: "Best Seller",
    popularite: 4.5,
    nombreAvis: 120,
    nombreReservations: 700,
    produitsUtilises: ["Shampooing professionnel", "Huile", "Cire coiffante"],
    outilsUtilises: ["Tondeuse", "Ciseaux", "Rasoir"],
    etapes: [
      "Diagnostic",
      "Préparation",
      "Réalisation",
      "Finitions",
      "Conseils",
    ],
    inclus: ["Diagnostic", "Produits professionnels", "Conseils"],
    options: [
      { nom: "Massage", prix: 10 },
      { nom: "Soin Premium", prix: 15 },
    ],
    conseilsAvant: "Arriver quelques minutes avant le rendez-vous.",
    conseilsApres:
      "Utiliser les produits recommandés et revenir pour l'entretien.",
    frequenceRecommandee: "Toutes les 3 à 4 semaines.",
    typeCheveux: ["Tous"],
    typePeau: ["Toutes"],
    tags: ["Soins", "Professionnel", "Barbershop"],
  },
  {
    id: 17,
    slug: "soin-hydratant",
    categorie: "Soins",
    nom: "Soin Hydratant",
    descriptionCourte: "Prestation professionnelle de soins.",
    descriptionComplete:
      "Cette prestation Soin Hydratant comprend un diagnostic personnalisé, une préparation, une réalisation soignée, des finitions et des conseils d'entretien adaptés.",
    image: "/images/services/17.jpg",
    galerie: ["/images/services/17-1.jpg", "/images/services/17-2.jpg"],
    duree: 30,
    prix: 25,
    ancienPrix: 30,
    badge: "Populaire",
    popularite: 4.6,
    nombreAvis: 155,
    nombreReservations: 880,
    produitsUtilises: ["Shampooing professionnel", "Huile", "Cire coiffante"],
    outilsUtilises: ["Tondeuse", "Ciseaux", "Rasoir"],
    etapes: [
      "Diagnostic",
      "Préparation",
      "Réalisation",
      "Finitions",
      "Conseils",
    ],
    inclus: ["Diagnostic", "Produits professionnels", "Conseils"],
    options: [
      { nom: "Massage", prix: 10 },
      { nom: "Soin Premium", prix: 15 },
    ],
    conseilsAvant: "Arriver quelques minutes avant le rendez-vous.",
    conseilsApres:
      "Utiliser les produits recommandés et revenir pour l'entretien.",
    frequenceRecommandee: "Toutes les 3 à 4 semaines.",
    typeCheveux: ["Tous"],
    typePeau: ["Toutes"],
    tags: ["Soins", "Professionnel", "Barbershop"],
  },
  {
    id: 18,
    slug: "black-mask",
    categorie: "Soins",
    nom: "Black Mask",
    descriptionCourte: "Prestation professionnelle de soins.",
    descriptionComplete:
      "Cette prestation Black Mask comprend un diagnostic personnalisé, une préparation, une réalisation soignée, des finitions et des conseils d'entretien adaptés.",
    image: "/images/services/18.jpg",
    galerie: ["/images/services/18-1.jpg", "/images/services/18-2.jpg"],
    duree: 40,
    prix: 30,
    ancienPrix: 35,
    badge: "Populaire",
    popularite: 4.7,
    nombreAvis: 190,
    nombreReservations: 1060,
    produitsUtilises: ["Shampooing professionnel", "Huile", "Cire coiffante"],
    outilsUtilises: ["Tondeuse", "Ciseaux", "Rasoir"],
    etapes: [
      "Diagnostic",
      "Préparation",
      "Réalisation",
      "Finitions",
      "Conseils",
    ],
    inclus: ["Diagnostic", "Produits professionnels", "Conseils"],
    options: [
      { nom: "Massage", prix: 10 },
      { nom: "Soin Premium", prix: 15 },
    ],
    conseilsAvant: "Arriver quelques minutes avant le rendez-vous.",
    conseilsApres:
      "Utiliser les produits recommandés et revenir pour l'entretien.",
    frequenceRecommandee: "Toutes les 3 à 4 semaines.",
    typeCheveux: ["Tous"],
    typePeau: ["Toutes"],
    tags: ["Soins", "Professionnel", "Barbershop"],
  },
  {
    id: 19,
    slug: "soin-anti-pelliculaire",
    categorie: "Soins",
    nom: "Soin Anti-pelliculaire",
    descriptionCourte: "Prestation professionnelle de soins.",
    descriptionComplete:
      "Cette prestation Soin Anti-pelliculaire comprend un diagnostic personnalisé, une préparation, une réalisation soignée, des finitions et des conseils d'entretien adaptés.",
    image: "/images/services/19.jpg",
    galerie: ["/images/services/19-1.jpg", "/images/services/19-2.jpg"],
    duree: 50,
    prix: 35,
    ancienPrix: 40,
    badge: "Populaire",
    popularite: 4.8,
    nombreAvis: 225,
    nombreReservations: 1240,
    produitsUtilises: ["Shampooing professionnel", "Huile", "Cire coiffante"],
    outilsUtilises: ["Tondeuse", "Ciseaux", "Rasoir"],
    etapes: [
      "Diagnostic",
      "Préparation",
      "Réalisation",
      "Finitions",
      "Conseils",
    ],
    inclus: ["Diagnostic", "Produits professionnels", "Conseils"],
    options: [
      { nom: "Massage", prix: 10 },
      { nom: "Soin Premium", prix: 15 },
    ],
    conseilsAvant: "Arriver quelques minutes avant le rendez-vous.",
    conseilsApres:
      "Utiliser les produits recommandés et revenir pour l'entretien.",
    frequenceRecommandee: "Toutes les 3 à 4 semaines.",
    typeCheveux: ["Tous"],
    typePeau: ["Toutes"],
    tags: ["Soins", "Professionnel", "Barbershop"],
  },
  {
    id: 20,
    slug: "soin-premium",
    categorie: "Soins",
    nom: "Soin Premium",
    descriptionCourte: "Prestation professionnelle de soins.",
    descriptionComplete:
      "Cette prestation Soin Premium comprend un diagnostic personnalisé, une préparation, une réalisation soignée, des finitions et des conseils d'entretien adaptés.",
    image: "/images/services/20.jpg",
    galerie: ["/images/services/20-1.jpg", "/images/services/20-2.jpg"],
    duree: 60,
    prix: 40,
    ancienPrix: 45,
    badge: "Premium",
    popularite: 4.9,
    nombreAvis: 260,
    nombreReservations: 1420,
    produitsUtilises: ["Shampooing professionnel", "Huile", "Cire coiffante"],
    outilsUtilises: ["Tondeuse", "Ciseaux", "Rasoir"],
    etapes: [
      "Diagnostic",
      "Préparation",
      "Réalisation",
      "Finitions",
      "Conseils",
    ],
    inclus: ["Diagnostic", "Produits professionnels", "Conseils"],
    options: [
      { nom: "Massage", prix: 10 },
      { nom: "Soin Premium", prix: 15 },
    ],
    conseilsAvant: "Arriver quelques minutes avant le rendez-vous.",
    conseilsApres:
      "Utiliser les produits recommandés et revenir pour l'entretien.",
    frequenceRecommandee: "Toutes les 3 à 4 semaines.",
    typeCheveux: ["Tous"],
    typePeau: ["Toutes"],
    tags: ["Soins", "Professionnel", "Barbershop"],
  },
];
export const categories: datacategories[] = [
  {
    id: 1,
    nom: "Coupe",
    picture: c2,
    description:
      "Des coupes modernes, classiques ou personnalisées réalisées avec précision pour mettre en valeur votre style et votre personnalité.",
  },
  {
    id: 2,
    nom: "Barbe",
    picture: c1,
    description:
      "Taille, rasage et entretien de la barbe avec des techniques professionnelles pour une finition nette, élégante et soignée.",
  },
  {
    id: 3,
    nom: "Coloration",
    picture: c3,
    description:
      "Des prestations de coloration et de camouflage adaptées à vos envies pour sublimer vos cheveux ou votre barbe avec un résultat naturel.",
  },
  {
    id: 4,
    nom: "Soins",
    picture: c5,
    description:
      "Des soins capillaires et du visage conçus pour hydrater, revitaliser et préserver la santé de vos cheveux, de votre barbe et de votre peau.",
  },
];
export interface datateam {
  id: number;
  nom: string;
  prenom: string;
  photo: string;
  titre: string;
  description: string;
  experience: string;
  categories: string[];
  citation: string;
}
export const teamMembers: datateam[] = [
  {
    id: 1,
    nom: "Martinez",
    prenom: "Hugo",
    photo: c1,
    titre: "Maître Barbier & Fondateur",
    description:
      "Le pilier du salon. Hugo a voyagé à travers l'Europe pour parfaire ses techniques de coupe au ciseau et de rasage à l'ancienne. Il est le garant de la qualité et de l'ambiance 'speakeasy' du shop.",
    experience: "12 ans",
    categories: ["coupes", "barbe"],
    citation: '"Une coupe parfaite est une œuvre d\'art."',
  },
  {
    id: 2,
    nom: "Dubois",
    prenom: "Lucas",
    photo: c1,
    titre: "Artiste de la Coloration",
    description:
      "Passionné par les dégradés de couleurs et les techniques modernes, Lucas est le roi du 'balayage' et de la coloration végétale. Il sait sublimer les cheveux tout en les respectant.",
    experience: "8 ans",
    categories: ["coupes", "coloration"],
    citation: '"La couleur est l\'âme de la coupe."',
  },
  {
    id: 3,
    nom: "Bernard",
    prenom: "Thomas",
    photo: c1,
    titre: "Expert en Soins & Traitements",
    description:
      "Thomas est le 'Docteur' du cheveu. Spécialiste des cuirs chevelus sensibles et des soins réparateurs, il diagnostique et traite chaque problème avec des produits naturels et de la passion.",
    experience: "6 ans",
    categories: ["coupes", "soins"],
    citation: '"Un cuir chevelu sain pour des cheveux forts."',
  },
  {
    id: 4,
    nom: "Lefevre",
    prenom: "Nicolas",
    photo: c1,
    titre: "Le Spécialiste de la Barbe",
    description:
      "Nicolas est un véritable sculpteur. Il maîtrise l'art du tracé au millimètre, du dégradé parfait et de l'entretien de la barbe. Il est aussi formé aux huiles essentielles pour un soin complet.",
    experience: "5 ans",
    categories: ["barbe", "soins"],
    citation: '"Une barbe bien taillée est un costume pour l\'homme."',
  },
  {
    id: 5,
    nom: "Morel",
    prenom: "Antoine",
    photo: c1,
    titre: "Le Tendance & Créatif",
    description:
      "Toujours à l'affût des nouvelles tendances (fade, undercut, design), Antoine est le barbier des audacieux. Il excelle dans la coupe moderne et la coloration créative (mèches, découpes).",
    experience: "4 ans",
    categories: ["coupes", "barbe", "coloration"],
    citation: '"L\'audace est la clé du style."',
  },
  {
    id: 6,
    nom: "Petit",
    prenom: "David",
    photo: c1,
    titre: "Le Thérapeute Capillaire",
    description:
      "David a une approche holistique. Il combine la coupe avec des soins profonds (masques, bains d'huile) et des massages du cuir chevelu. Idéal pour une parenthèse détente.",
    experience: "7 ans",
    categories: ["coupes", "soins"],
    citation: '"Couper, soigner, révéler."',
  },
  {
    id: 7,
    nom: "Roux",
    prenom: "Sophie",
    photo: c1,
    titre: "Coloriste & Barbière",
    description:
      "Femme barbière (un atout rare !), Sophie apporte une touche de douceur et de précision. Elle est spécialiste des colorations naturelles, des coupes classiques et des finitions au rasoir.",
    experience: "4 ans",
    categories: ["barbe", "coloration"],
    citation: '"La précision est une question de main et de cœur."',
  },
];
export const dataAvatar: avatar[] = [
  {
    id: 1,
    image: avatar1,
  },
  {
    id: 2,
    image: avatar2,
  },
  {
    id: 3,
    image: avatar3,
  },
  {
    id: 4,
    image: avatar4,
  },
  {
    id: 5,
    image: avatar5,
  },
  {
    id: 6,
    image: avatar6,
  },
  {
    id: 7,
    image: avatar7,
  },
  {
    id: 8,
    image: avatar8,
  },
  {
    id: 9,
    image: avatar9,
  },
  {
    id: 10,
    image: avatar10,
  },
  {
    id: 11,
    image: avatar11,
  },
  {
    id: 12,
    image: avatar12,
  },
  {
    id: 13,
    image: avatar13,
  },
  {
    id: 14,
    image: avatar14,
  },
  {
    id: 15,
    image: avatar15,
  },
  {
    id: 16,
    image: avatar16,
  },
  {
    id: 17,
    image: avatar17,
  },
  {
    id: 18,
    image: avatar18,
  },
];
export const Background: BackgroundType[] = [
  { id: 1, background: B1 },
  { id: 2, background: B2 },
  { id: 3, background: B3 },
  { id: 4, background: B4 },
  { id: 5, background: B5 },
  { id: 6, background: B6 },
  { id: 7, background: B7 },
  { id: 8, background: B8 },
  { id: 9, background: B9 },
];
export const appointments: reservation[] = [
  {
    id: 1,
    image: avatar1,
    customerName: "Thomas Martin",
    service: "Coupe classique",
    date: "2026-09-08",
    time: "09:00",
    duration: 30,
    price: 25,
    barber: "Lucas",
    comment:
      "Dégradé bas, garder un peu de longueur sur le dessus. Pas trop court sur les côtés.",
    status: "Confirmé",
    bookingMethod: "Application",
  },
  {
    id: 2,
    image: avatar1,
    customerName: "Julien Robert",
    service: "Taille de barbe",
    date: "2026-09-18",
    time: "09:45",
    duration: 20,
    price: 15,
    barber: "Yanis",
    comment:
      "Barbe bien dessinée, conserver la moustache légèrement plus longue.",
    status: "Confirmé",
    bookingMethod: "Téléphone",
  },
  {
    id: 3,
    customerName: "Nicolas Bernard",
    image: avatar1,
    service: "Coupe + barbe",
    date: "2026-01-08",
    time: "10:30",
    duration: 50,
    price: 38,
    barber: "Lucas",
    comment: "Dégradé américain avec contours nets et barbe courte.",
    status: "Terminé",
    bookingMethod: "Site Web",
  },
  {
    id: 4,
    image: avatar1,
    customerName: "Maxime Dubois",
    service: "Rasage traditionnel",
    date: "2026-01-09",
    time: "11:15",
    duration: 30,
    price: 22,
    barber: "Mehdi",
    comment: "Peau sensible, utiliser les produits adaptés.",
    status: "Terminé",
    bookingMethod: "Application",
  },
  {
    id: 5,
    image: avatar1,
    customerName: "Alexandre Petit",
    service: "Coupe + barbe Premium",
    date: "2026-01-10",
    time: "14:00",
    duration: 60,
    price: 48,
    barber: "Lucas",
    comment:
      "Préparation pour un mariage. Finition très soignée et coiffage inclus.",
    status: "Confirmé",
    bookingMethod: "Application",
  },
  {
    id: 6,
    image: avatar1,
    customerName: "Hugo Moreau",
    service: "Coupe classique",
    date: "2026-01-11",
    time: "09:30",
    duration: 30,
    price: 25,
    barber: "Yanis",
    comment: "Dégradé à blanc, dessus texturé avec effet naturel.",
    status: "Confirmé",
    bookingMethod: "Site Web",
  },
  {
    id: 7,
    image: avatar1,
    customerName: "Lucas Garnier",
    service: "Coloration barbe",
    date: "2026-01-11",
    time: "10:45",
    duration: 40,
    price: 28,
    barber: "Mehdi",
    comment: "Couvrir les poils blancs sans que la couleur soit trop foncée.",
    status: "Confirmé",
    bookingMethod: "Téléphone",
  },
  {
    id: 8,
    image: avatar1,
    customerName: "Benjamin Roux",
    service: "Coupe + barbe",
    date: "2026-01-12",
    time: "13:30",
    duration: 45,
    price: 38,
    barber: "Lucas",
    comment: "Style moderne avec contours marqués et barbe bien alignée.",
    status: "Annulé",
    bookingMethod: "Application",
  },
  {
    id: 9,
    image: avatar1,
    customerName: "Antoine Leroy",
    service: "Taille de barbe",
    date: "2026-01-13",
    time: "16:00",
    duration: 20,
    price: 15,
    barber: "Yanis",
    comment: "Uniformiser la longueur à 5 mm et nettoyer le cou.",
    status: "Confirmé",
    bookingMethod: "Site Web",
  },
  {
    id: 10,
    image: avatar1,
    customerName: "Clément Fontaine",
    service: "Coupe classique",
    date: "2026-01-14",
    time: "17:15",
    duration: 30,
    price: 25,
    barber: "Mehdi",
    comment: "Même coupe que la dernière fois. Garder un rendu naturel.",
    status: "Confirmé",
    bookingMethod: "Application",
  },
];
