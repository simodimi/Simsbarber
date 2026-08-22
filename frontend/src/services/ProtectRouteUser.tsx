import { useEffect } from "react";
import { useAuth } from "../pages/AuthContext";
import { toast } from "react-toastify";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import SplineScene from "../ui/SplineScene";

const ProtectRouteUser = () => {
  const { loading, isAuthenticated } = useAuth();
  const location = useLocation();
  useEffect(() => {
    //si le chargement est terminé et que l'user n'est pas authentifié
    if (!loading && !isAuthenticated) {
      toast.error("Veuillez vous connecter pour continuer", {
        toastId: "auth-error",
      });
    }
  }, [loading, isAuthenticated]);

  if (loading) {
    return (
      <div className="ErrorHome">
        <div className="Errortext">
          <h1 className="">Vérification de la session...</h1>
        </div>

        <div className="splineIcon">
          <SplineScene
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="SplineCartoon"
          />
        </div>
      </div>
    );
  }
  if (!isAuthenticated) {
    //replace:empêche le retour
    //state={{}} memorise la page demandée,et redirige après le login
    return <Navigate to="/" state={{ from: location.pathname }} replace />;
  }
  return <Outlet />;
};

export default ProtectRouteUser;
