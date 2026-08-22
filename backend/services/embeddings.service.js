const { genererEmbedding, EMBED_MODEL } = require("../config/ollama");

// Taille du vecteur produit par nomic-embed-text = 768 dimensions.
// Si vous changez de modèle d'embedding plus tard, cette valeur doit être
// mise à jour ET la collection Qdrant recréée (une collection est liée à
// une taille de vecteur fixe).
const VECTOR_SIZE = 768;

async function embed(texte) {
  return genererEmbedding(texte);
}

module.exports = { embed, VECTOR_SIZE, EMBED_MODEL };
