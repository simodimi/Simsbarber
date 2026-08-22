// Logger minimaliste, sans dépendance externe (pas besoin de winston/pino
// pour la taille de votre projet). Ajoute systématiquement un horodatage,
// ce que console.log seul ne fait pas.
function horodatage() {
  return new Date().toISOString();
}

module.exports = {
  info: (...args) => console.log(`[INFO ${horodatage()}]`, ...args),
  warn: (...args) => console.warn(`[WARN ${horodatage()}]`, ...args),
  error: (...args) => console.error(`[ERROR ${horodatage()}]`, ...args),
};
