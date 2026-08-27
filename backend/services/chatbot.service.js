const { qdrant, COLLECTION_NAME } = require("../config/qdrant");
const { genererReponse } = require("../config/ollama");
const { embed, VECTOR_SIZE } = require("./embeddings.service");
const { Prestation, Category, TeamMenber } = require("../models");

const HORAIRES =
  "Le salon est ouvert du lundi au samedi de 9h à 19h, fermé le dimanche.";

async function recreerCollection() {
  await qdrant.deleteCollection(COLLECTION_NAME).catch(() => {
    // ignore l'erreur si la collection n'existait simplement pas encore
  });
  await qdrant.createCollection(COLLECTION_NAME, {
    vectors: { size: VECTOR_SIZE, distance: "Cosine" },
  });
}

async function reindexerCatalogue() {
  await recreerCollection();

  const prestations = await Prestation.findAll({
    include: [{ model: Category, as: "category" }],
  });
  const membres = await TeamMenber.findAll();

  const points = [];
  let pointId = 1;

  for (const p of prestations) {
    const texte = [
      `Prestation : ${p.nom}`,
      `Catégorie : ${p.category?.nom || ""}`,
      p.descriptionCourte,
      p.descriptionComplete,
      `Prix : ${p.prix} euros`,
      `Durée : ${p.duree} minutes`,
      p.produitsUtilises ? `Produits utilisés : ${p.produitsUtilises}` : "",
    ]
      .filter(Boolean)
      .join(". ");

    points.push({
      id: pointId++,
      vector: await embed(texte),
      payload: { type: "prestation", id: p.id, texte },
    });
  }
  const parCategorie = {};
  for (const p of prestations) {
    const cat = p.category?.nom || "Autre";
    (parCategorie[cat] ||= []).push(p.nom);
  }
  for (const [cat, noms] of Object.entries(parCategorie)) {
    const texte = `La catégorie ${cat} comprend ${noms.length} prestation(s) : ${noms.join(", ")}.`;
    points.push({
      id: pointId++,
      vector: await embed(texte),
      payload: { type: "categorie", texte },
    });
  }
  points.push({
    id: pointId++,
    vector: await embed(
      `Le salon propose ${Object.keys(parCategorie).length} catégories : ${Object.keys(parCategorie).join(", ")}.`,
    ),
    payload: { type: "categorie", texte: "liste des catégories" },
  });
  for (const m of membres) {
    const texte = [
      `Membre de l'équipe : ${m.prenom} ${m.nom}`,
      `Titre : ${m.titre}`,
      m.description,
      `Expérience : ${m.experience}`,
      `Spécialités : ${(m.categories || []).join(", ")}`,
    ]
      .filter(Boolean)
      .join(". ");

    points.push({
      id: pointId++,
      vector: await embed(texte),
      payload: { type: "team", id: m.id, texte },
    });
  }

  const INFOS_STATIQUES = [
    "Le salon est ouvert du lundi au samedi de 9h à 19h, fermé le dimanche.",
    "Pour prendre rendez-vous, le client clique sur 'Réserver maintenant' sur la page d'accueil, ou va sur la page Calendrier (/calendrier) : il choisit une catégorie, une sous-catégorie, une date et une heure.",
    "Le client consulte ses réservations passées et à venir dans son espace Profil, rubrique Réservations.",
    "Le client peut annuler sa propre réservation depuis le Calendrier, uniquement si elle a lieu dans plus de 24h ; en dessous, il doit contacter le salon.",
    "Une réservation peut aussi être annulée par l'administrateur ; le client en est alors notifié.",
    "Pour toute autre question, un client peut écrire au salon via la messagerie de l'application.",
    "Le paiement se fait sur place, au salon, au moment de la prestation.",
    "Pour changer sa photo de profil : Profil > Mes Paramètres > 'Changer photo de profil' — le client peut soit uploader sa propre image, soit choisir un avatar prédéfini dans la liste proposée.",
    "Le client peut aussi, dans Mes Paramètres, changer son mot de passe, changer le fond d'écran de sa messagerie, consulter les infos de son compte, ou supprimer son compte.",
    "Pour envoyer un message au salon : Profil > Mes Messages, avec possibilité de joindre une photo.",
  ];

  for (const texte of INFOS_STATIQUES) {
    points.push({
      id: pointId++,
      vector: await embed(texte),
      payload: {
        type: "info",
        texte,
      },
    });
  }

  if (points.length > 0) {
    await qdrant.upsert(COLLECTION_NAME, { points });
  }

  return { indexes: points.length };
}

async function rechercherContexte(question, topK = 8) {
  const vector = await embed(question);
  const resultats = await qdrant.search(COLLECTION_NAME, {
    vector,
    limit: topK,
  });
  return resultats.map((r) => r.payload.texte);
}

async function repondre(message) {
  const contextes = await rechercherContexte(message);

  const prompt = `Tu es l'assistant virtuel du salon de coiffure/barbier Sim'sBarber.
Réponds à la question du client UNIQUEMENT à partir des informations ci-dessous.
Si l'information demandée n'y figure pas, réponds que tu ne sais pas et invite
le client à contacter directement le salon via la messagerie.
Reste bref, poli et professionnel.

Informations disponibles :
${contextes.map((c, i) => `${i + 1}. ${c}`).join("\n")}

Question du client : ${message}

Réponse :`;

  return genererReponse(prompt);
}

module.exports = { reindexerCatalogue, repondre };
