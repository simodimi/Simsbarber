import axios from "axios";

const connect = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: true, // nécessaire pour que le cookie refreshToken parte bien avec chaque requête
});

// L'accessToken vit en mémoire (variable de module), pas en localStorage :
// un accessToken volé via une faille XSS serait exploitable s'il traînait
// en localStorage, alors qu'une simple variable JS est un peu plus difficile
// à exfiltrer. Il se perd au rechargement de la page, mais c'est voulu :
// AuthContext le régénère automatiquement via /refresh-token au chargement
// (voir fetchMe, qu'on ajuste aussi).
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

// Intercepteur : attache automatiquement le header Authorization sur CHAQUE
// requête sortante, si on a un token en mémoire. Évite d'avoir à l'ajouter
// manuellement à chaque appel connect.get/post dans toute l'app.
connect.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});
// Décode juste le payload du JWT (sans vérifier la signature — inutile
// côté front, on ne fait que LIRE le rôle pour savoir quelle route de
// refresh appeler, la vraie vérification se fait côté serveur).
function getRoleFromToken(): "user" | "admin" | null {
  const token = getAccessToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role;
  } catch {
    return null;
  }
}

connect.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      error.response?.data?.code === "TOKEN_EXPIRED" &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        const role = getRoleFromToken();
        const refreshUrl =
          role === "admin"
            ? "/api/admin/auth/refresh-token"
            : "/api/auth/refresh-token";
        const res = await connect.post(refreshUrl);
        setAccessToken(res.data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
        return connect(originalRequest);
      } catch {
        setAccessToken(null);
        // ici, redirigez vers /admin ou / selon le cas si vous voulez un
        // vrai retour automatique à l'écran de connexion
      }
    }
    return Promise.reject(error);
  },
);
export default connect;
