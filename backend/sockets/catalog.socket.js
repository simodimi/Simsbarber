// Petits helpers pour centraliser le NOM des événements catalogue à un
// seul endroit. Les controllers (categories/prestations/team) appellent
// aujourd'hui io.emit(...) directement — ces fonctions existent pour que
// vous puissiez, si vous le souhaitez, les utiliser à la place afin d'avoir
// un seul endroit à modifier si un nom d'événement change un jour.
function emitCategoriesUpdated(io) {
  io.emit("categories:updated");
}
function emitPrestationsUpdated(io) {
  io.emit("prestations:updated");
}
function emitTeamUpdated(io) {
  io.emit("team:updated");
}

module.exports = {
  emitCategoriesUpdated,
  emitPrestationsUpdated,
  emitTeamUpdated,
};
