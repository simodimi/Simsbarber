const { QdrantClient } = require("@qdrant/js-client-rest");

const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
});

const COLLECTION_NAME = "simsbarber";

module.exports = { qdrant, COLLECTION_NAME };
