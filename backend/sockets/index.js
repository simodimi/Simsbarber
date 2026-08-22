const { Server } = require("socket.io");
const { verifierAccessToken } = require("../utils/tokens");

function initSocket(server) {
  const io = new Server(server, {
    cors: { origin: process.env.FRONT_URL, credentials: true },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("unauthorized"));
    try {
      const payload = verifierAccessToken(token);
      socket.user = payload; // { sub, role: "user" | "admin" }
      next();
    } catch {
      next(new Error("unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    if (socket.user.role === "user") {
      socket.join(`user:${socket.user.sub}`);
    }
    if (socket.user.role === "admin") {
      socket.join("admins");
    }

    socket.on("disconnect", () => {
      // rien de spécial à faire ici pour l'instant, Socket.io nettoie
      // automatiquement les rooms à la déconnexion.
    });
  });

  return io;
}

module.exports = { initSocket };
