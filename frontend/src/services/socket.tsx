import { io, Socket } from "socket.io-client";
import { getAccessToken } from "./Util";

// ─────────────────────────────────────────────────────────────────────────
// Instance UNIQUE de socket, partagée par toute l'app (messages,
// réservations, catalogue...) — pas une nouvelle connexion par composant,
// sinon vous ouvririez une connexion WebSocket différente à chaque fois
// qu'un composant qui l'utilise se monte.
// ─────────────────────────────────────────────────────────────────────────
let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io("http://localhost:5000", {
      auth: { token: getAccessToken() },
      autoConnect: false,
    });
  }
  return socket;
}

// À appeler après une connexion réussie (login) ou au chargement de l'app
// si un token est déjà en mémoire (après fetchMe()).
export function connectSocket(): Socket {
  const s = getSocket();
  // On reconstruit "auth" avec le token le plus À JOUR à chaque connexion,
  // au cas où il aurait été rafraîchi entre-temps (le middleware socket
  // côté serveur lit ce champ au moment du handshake).
  s.auth = { token: getAccessToken() };
  if (!s.connected) s.connect();
  return s;
}

export function disconnectSocket() {
  if (socket?.connected) socket.disconnect();
}
