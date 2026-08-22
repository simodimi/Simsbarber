// STUB : ce fichier n'a actuellement rien à faire.
//
// À l'origine, l'idée était de recalculer périodiquement des colonnes
// dénormalisées "popularite" / "nombreAvis" / "nombreReservations" sur
// Prestation, pour ne pas avoir à faire un calcul d'agrégation à chaque
// affichage. MAIS vous avez volontairement simplifié votre modèle
// Prestation et retiré ces colonnes.
//
// Résultat actuel : prestations.service.js (fonction getBySlug) calcule
// déjà la moyenne des notes et le nombre d'avis À LA VOLÉE avec une requête
// Review.findOne({ ... AVG/COUNT ... }) à chaque consultation d'une
// prestation précise — donc ce cron n'est pas nécessaire pour l'instant.
//
// Si un jour votre volume de données grossit et que ce calcul à la volée
// devient trop lent sur la page de LISTE de toutes les prestations (calculé
// pour chacune à chaque chargement), on pourra réintroduire des colonnes
// dénormalisées et ce cron reprendra alors tout son sens.
function startPopularityCron() {
  // volontairement vide pour l'instant.
}

module.exports = { startPopularityCron };
