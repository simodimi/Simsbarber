module.exports = (schema) => (req, res, next) => {
  // Avec multipart/form-data, categories arrive sous forme de chaîne.
  // On la reconvertit en tableau avant de passer dans Zod.
  if (typeof req.body.categories === "string") {
    try {
      req.body.categories = JSON.parse(req.body.categories);
    } catch {
      return res.status(400).json({
        error: "Le format des catégories est invalide.",
      });
    }
  }

  const result = schema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: result.error.issues[0].message,
    });
  }

  req.body = result.data;
  next();
};
