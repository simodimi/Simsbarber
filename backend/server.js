require("dotenv").config();
const http = require("http");
const app = require("./app");
const { initSocket } = require("./sockets");
const { startReminderCron } = require("./jobs/reminders.cron");
const logger = require("./utils/logger");

const server = http.createServer(app);

const io = initSocket(server);
// rend "io" accessible depuis n'importe quel controller via req.app.get("io")
app.set("io", io);

startReminderCron();

const PORT = process.env.SERVER_PORT;
server.listen(PORT, () => {
  logger.info(`Connexion au serveur par le port ${PORT} réussie`);
});
