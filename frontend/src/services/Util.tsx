import axios from "axios";

const connect = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: true, // nécessaire pour que le cookie refreshToken parte bien avec chaque requête
});

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

connect.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});
// Décode juste le payload du JWT (sans vérifier la signature — inutile

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
      }
    }
    return Promise.reject(error);
  },
);
export default connect;
