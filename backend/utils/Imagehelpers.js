// ─────────────────────────────────────────────────────────────────────────
// Centralise TOUTE la logique de construction d'URL d'image à partir de ce
// que multer dépose dans req.file / req.files. Sans ce fichier, la même
// petite fonction aurait dû être copiée-collée dans categories.controller,
// prestations.controller, team.controller, users.controller... — et le
// jour où vous changeriez, par exemple, le préfixe "/uploads/" pour un vrai
// CDN, il aurait fallu le modifier à N endroits différents au lieu d'un
// seul.
// ─────────────────────────────────────────────────────────────────────────

/**
 * Pour un upload.single("champ") : req.file est UN SEUL objet fichier.
 * Renvoie undefined si aucun fichier n'a été envoyé (permet aux
 * controllers de garder l'ancienne image en cas de modification sans
 * nouveau fichier).
 */
function getImageUrl(file) {
  return file ? `/uploads/${file.filename}` : undefined;
}

/**
 * Pour un upload.array("champ") ou upload.fields([...]) avec plusieurs
 * fichiers pour un même champ (ex: la "galerie" d'une prestation, plusieurs
 * photos à la fois). Renvoie toujours un tableau (vide si rien envoyé),
 * jamais undefined, pour que le code appelant puisse faire
 * `.length > 0` sans vérification supplémentaire.
 */
function getImageUrls(files) {
  if (!files || files.length === 0) return [];
  return files.map((file) => `/uploads/${file.filename}`);
}

module.exports = { getImageUrl, getImageUrls };
