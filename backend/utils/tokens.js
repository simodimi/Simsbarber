const jwt = require("jsonwebtoken");

// ─────────────────────────────────────────────────────────────────────────
// Centraliser la génération/vérification des tokens ICI, plutôt que
// d'appeler jwt.sign()/jwt.verify() directement dans chaque controller,
// pour deux raisons :
// 1. Si vous changez un jour la durée de vie des tokens ou leur contenu,
//    vous modifiez UN SEUL endroit, pas dix controllers différents.
// 2. Ça évite les fautes de frappe/incohérences (un controller qui mettrait
//    "1h" et un autre "60m" pour la même chose, par exemple).
// ─────────────────────────────────────────────────────────────────────────

// payload = les infos qu'on veut retrouver plus tard en décodant le token.
// "sub" (= "subject") est un nom de champ STANDARD en JWT pour désigner
// l'identifiant de la personne concernée par le token — pas obligatoire de
// l'appeler comme ça, mais c'est la convention.
function genererAccessToken(payload) {
  // durée de vie COURTE : si ce token est volé, la fenêtre d'exploitation
  // pour l'attaquant est minimale (voir le document "Comprendre son
  // Backend" pour le détail du raisonnement).
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "15m" });
}

function genererRefreshToken(payload) {
  // durée plus longue : sert uniquement à obtenir un nouvel access token
  // sans redemander le mot de passe, stocké en cookie httpOnly (donc
  // inaccessible en JavaScript côté front, ce qui limite les risques de vol
  // via une faille XSS).
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
}

function verifierAccessToken(token) {
  // jwt.verify() lève une erreur automatiquement si le token est invalide,
  // falsifié, ou expiré — pas besoin de vérifier ça vous-même à la main.
  return jwt.verify(token, process.env.JWT_SECRET);
}

function verifierRefreshToken(token) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
}

// ─────────────────────────────────────────────────────────────────────────
// TOKENS D'ACTION PAR EMAIL — différents des access/refresh tokens :
// - Signés avec un secret dédié (ACTION_TOKEN_SECRET), pour qu'un access
//   token classique volé ne puisse jamais être détourné pour usurper une
//   action d'approbation, et inversement.
// - Contiennent directement l'action à effectuer (requestId, adminId,
//   action), pas juste une identité : le lien EST l'autorisation.
// - Durée de vie courte (3 jours) : au-delà, l'admin devra se rendre sur
//   le vrai tableau de bord.
// ─────────────────────────────────────────────────────────────────────────
function genererActionToken(payload) {
  return jwt.sign(payload, process.env.ACTION_TOKEN_SECRET, {
    expiresIn: "3d",
  });
}

function verifierActionToken(token) {
  return jwt.verify(token, process.env.ACTION_TOKEN_SECRET);
}

module.exports = {
  genererActionToken,
  verifierActionToken,
  genererAccessToken,
  genererRefreshToken,
  verifierAccessToken,
  verifierRefreshToken,
};
