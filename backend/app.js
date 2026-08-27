const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const path = require("path");
require("./config/database");

const app = express();

app.use(cors({ origin: process.env.FRONT_URL, credentials: true }));
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, //PERMET LES IMAGES
    crossOriginEmbedderPolicy: false, // DÉSACTIVE LA POLITIQUE STRICTE
  }),
);
app.use(cookieParser());
app.use(express.json());

// avatars/backgrounds statiques (dossier public/avatars, public/background)
app.use(express.static(path.join(__dirname, "public")));
// fichiers uploadés dynamiquement (photos de profil, images de messages...)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api", require("./routes"));

// TOUJOURS en dernier
app.use(require("./middlewares/errorHandler"));

module.exports = app;
