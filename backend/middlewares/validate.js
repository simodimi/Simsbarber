// Un middleware "générique" : au lieu d'écrire un middleware différent pour
// chaque route (validateReservation, validateUser, validateReview...)
/*module.exports = (schema) => (req, res, next) => {
  // safeParse (plutôt que parse) ne lève pas d'exception : il renvoie un
  // objet { success: true/false, ... } qu'on peut tester tranquillement,
  // sans avoir besoin d'un try/catch ici.
  const result = schema.safeParse(req.body);

  if (!result.success) {
    // On ne renvoie que la PREMIÈRE erreur trouvée, pour un message clair
    // et simple à afficher côté front (plutôt que de tout lister d'un coup).
    return res.status(400).json({ error: result.error.issues[0].message });
  }
  req.body = result.data;
  next();
};*/
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
