const { verifierAccessToken } = require("../utils/tokens");

module.exports = (req, res, next) => {
  // Le front doit envoyer le token dans le header HTTP "Authorization",
  // sous la forme : "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  // "Bearer" est juste un mot-clé standard indiquant le TYPE d'authentification.
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentification requise" });
  }
  //UNiquement le headers sans bearer
  const token = authHeader.split(" ")[1];

  try {
    const payload = verifierAccessToken(token);
    req.user = payload; //req.user(id,role etc)
    next(); //le middleware est terminé
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ error: "Session expirée", code: "TOKEN_EXPIRED" });
    }
    return res.status(401).json({ error: "Token invalide" });
  }
};
