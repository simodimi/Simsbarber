function horodatage() {
  return new Date().toISOString();
}

module.exports = {
  info: (...args) => console.log(`[INFO ${horodatage()}]`, ...args),
  warn: (...args) => console.warn(`[WARN ${horodatage()}]`, ...args),
  error: (...args) => console.error(`[ERROR ${horodatage()}]`, ...args),
};
