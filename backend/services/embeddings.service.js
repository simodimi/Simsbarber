const { genererEmbedding, EMBED_MODEL } = require("../config/ollama");

// Taille du vecteur produit par nomic-embed-text = 768 dimensions.

const VECTOR_SIZE = 768;

async function embed(texte) {
  return genererEmbedding(texte);
}

module.exports = { embed, VECTOR_SIZE, EMBED_MODEL };
