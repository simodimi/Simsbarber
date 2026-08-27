module.exports = (err, req, res, next) => {
  console.error(err);

  // Erreurs de validation Sequelize
  if (err.name === "SequelizeValidationError") {
    return res.status(400).json({ error: err.errors[0].message });
  }
  if (err.name === "SequelizeUniqueConstraintError") {
    return res.status(409).json({ error: "Cette valeur existe déjà" });
  }

  // Erreur "normale" avec un code HTTP volontairement défini quelque part
  const status = err.statusCode || 500;
  res.status(status).json({ error: err.message || "Erreur serveur" });
};
