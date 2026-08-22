// pages/AdminAuthContext.tsx
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import connect, { setAccessToken } from "../services/Util";
import { useNavigate } from "react-router-dom";

interface Admin {
  id: string | number;
  nameAdmin: string;
  emailAdmin: string;
  photoAdmin: string;
  role: string;
}

interface AdminAuthContextType {
  admin: Admin | null;
  loading: boolean;
  login: (emailAdmin: string, passwordAdmin: string) => Promise<Admin>;
  logout: () => Promise<void>;
  setAdmin: React.Dispatch<React.SetStateAction<Admin | null>>;
  isAuthenticated: boolean;
}

interface AdminAuthProviderProps {
  children: React.ReactNode;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(
  undefined,
);

export const useAdminAuth = (): AdminAuthContextType => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within a AdminAuthProvider");
  }
  return context;
};

export const AuthProviderAdmin = ({ children }: AdminAuthProviderProps) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const hasFetched = useRef<boolean>(false);
  const navigate = useNavigate();

  const fetchAdmin = async () => {
    try {
      // 1. Essayer de rafraîchir le token via le cookie refreshToken
      const refreshRes = await connect.post("/api/admin/auth/refresh-token");
      setAccessToken(refreshRes.data.accessToken);

      // 2. Récupérer les données de l'admin
      const res = await connect.get("/api/admin/auth/me");
      if (res.data && res.data.id) {
        setAdmin(res.data);
      }
    } catch (error) {
      // Pas de refreshToken valide, on reste déconnecté
      setAdmin(null);
      setAccessToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchAdmin();
  }, []);

  const login = async (
    emailAdmin: string,
    passwordAdmin: string,
  ): Promise<Admin> => {
    try {
      const res = await connect.post("/api/admin/auth/login", {
        emailAdmin,
        passwordAdmin,
      });

      const { accessToken, admin: adminData } = res.data;

      if (adminData && adminData.id) {
        setAccessToken(accessToken);
        setAdmin(adminData);
        toast.success(`Connexion réussie ${adminData.nameAdmin}`);
        return adminData;
      } else {
        throw new Error("Données administrateur manquantes");
      }
    } catch (error) {
      toast.error("Erreur de connexion");
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await connect.post("/api/admin/auth/logout");
    } catch (error) {
      console.error(error);
    } finally {
      setAccessToken(null);
      setAdmin(null);
      navigate("/admin");
    }
  };

  const contextValue: AdminAuthContextType = {
    admin,
    loading,
    login,
    logout,
    setAdmin,
    isAuthenticated: !!admin,
  };

  return (
    <AdminAuthContext.Provider value={contextValue}>
      {!loading && children}
    </AdminAuthContext.Provider>
  );
};
