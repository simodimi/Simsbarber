const { Ollama } = require("ollama");

const ollama = new Ollama({ host: process.env.OLLAMA_URL });

const CHAT_MODEL = process.env.OLLAMA_MODEL; // ex: "llama3.2:3b"
const EMBED_MODEL = process.env.OLLAMA_EMBED_MODEL; // ex: "nomic-embed-text"

async function genererReponse(prompt) {
  const response = await ollama.generate({
    model: CHAT_MODEL,
    prompt,
    stream: false,
  });
  return response.response;
}

async function genererEmbedding(texte) {
  const response = await ollama.embeddings({
    model: EMBED_MODEL,
    prompt: texte,
  });
  return response.embedding;
}

module.exports = {
  ollama,
  genererReponse,
  genererEmbedding,
  CHAT_MODEL,
  EMBED_MODEL,
};
