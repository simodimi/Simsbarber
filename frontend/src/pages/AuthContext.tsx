import { createContext, useContext, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import connect, { setAccessToken } from "../services/Util";
import { useNavigate } from "react-router-dom";

interface User {
  id: string | number;
  nameUser: string;
  mailUser: string;
  photoUser: string;
  statut: string;
  chatBackgroundUrl: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (mailUser: string, passwordUser: string) => Promise<User>;
  logout: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isAuthenticated: boolean;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within a AuthProvider");
  }
  return context;
};

export const AuthProviderUser = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const hasFetched = useRef<boolean>(false);

  const navigate = useNavigate();

  // Au chargement de l'app, on n'a plus d'accessToken en mémoire (perdu au
  // refresh de la page). On tente donc D'ABORD un /refresh-token : le
  // cookie refreshToken (httpOnly, 7 jours) est envoyé automatiquement par
  // le navigateur, et s'il est valide, le serveur nous redonne un
  // accessToken frais SANS redemander le mot de passe. Ce n'est qu'ensuite
  // qu'on peut appeler /api/users/me (qui exige ce token).
  const fetchMe = async () => {
    try {
      const refreshRes = await connect.post("/api/auth/refresh-token");
      setAccessToken(refreshRes.data.accessToken);

      const res = await connect.get("/api/users/me");
      if (res.data && res.data.id) {
        setUser(res.data);
      }
    } catch (error) {
      // Pas de refreshToken valide (jamais connecté, ou expiré après 7
      // jours) : c'est un cas normal, pas une vraie erreur à afficher à
      // l'utilisateur, on le laisse simplement déconnecté.
      setUser(null);
      setAccessToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    if (window.location.pathname.startsWith("/admin")) {
      setLoading(false);
      return;
    }
    fetchMe();
  }, []);

  const login = async (
    mailUser: string,
    passwordUser: string,
  ): Promise<User> => {
    try {
      const res = await connect.post("/api/auth/login", {
        mailUser,
        passwordUser,
      });
      // les champs de l'utilisateur à la racine de res.data.
      const { accessToken, user: userData } = res.data;

      if (userData && userData.id) {
        setAccessToken(accessToken);
        setUser(userData);
        toast.success(`Connexion réussie ${userData.nameUser}`);
        return userData;
      } else {
        throw new Error("Données utilisateur manquantes");
      }
    } catch (error) {
      toast.error("Erreur de connexion");
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // CORRIGÉ : la route backend est un POST, pas un GET
      // (router.post("/logout", ...) dans auth.routes.js).
      await connect.post("/api/auth/logout");
    } catch (error) {
      console.error(error);
    } finally {
      setAccessToken(null);
      setUser(null);
      navigate("/");
    }
  };

  const contextValue: AuthContextType = {
    user,
    loading,
    login,
    logout,
    setUser,
    isAuthenticated: !!user,
  };
  return (
    <AuthContext.Provider value={contextValue}>
      {!loading && children}{" "}
    </AuthContext.Provider>
  );
};
