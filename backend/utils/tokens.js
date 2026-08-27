const jwt = require("jsonwebtoken");

function genererAccessToken(payload) {
  // durée de vie COURTE : si ce token est volé, la fenêtre d'exploitation
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
