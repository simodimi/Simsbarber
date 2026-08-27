import { io, Socket } from "socket.io-client";
import { getAccessToken } from "./Util";

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
  s.auth = { token: getAccessToken() };
  if (!s.connected) s.connect();
  return s;
}

export function disconnectSocket() {
  if (socket?.connected) socket.disconnect();
}
