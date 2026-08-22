import SplineScene from "../ui/SplineScene";
import "../styles/error.css";
import Button from "../ui/Button";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import connect from "../services/Util";
import { toast } from "react-toastify";

const InscriptionAfter = () => {
  const navigate = useNavigate();
  const lightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animationId = 0;
    let mouseX = 0;
    let mouseY = 0;

    const move = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      cancelAnimationFrame(animationId);

      animationId = requestAnimationFrame(() => {
        if (lightRef.current) {
          lightRef.current.style.transform = `translate(${mouseX - 175}px, ${mouseY - 175}px)`;
        }
      });
    };

    window.addEventListener("mousemove", move);

    return () => {
      window.removeEventListener("mousemove", move);
      cancelAnimationFrame(animationId);
    };
  }, []);
  const local = useLocation();
  const from = local.state?.from;
  // Récupéré depuis navigate("/attente-validation", { state: { requestId } })
  // dans InscriptionAdmin.tsx.
  const requestId = local.state?.requestId;
  useEffect(() => {
    if (!requestId) return; // sécurité si la page est ouverte sans venir de l'inscription

    const interval = setInterval(async () => {
      try {
        const res = await connect.get(
          `/api/admin/auth/access-requests/${requestId}/status`,
        );
        const status = res.data.status;

        if (status === "APPROUVE") {
          clearInterval(interval);
          toast.success(
            "Votre compte a été approuvé ! Vous pouvez maintenant vous connecter.",
          );
          navigate("/admin/");
        }

        if (status === "REFUSE") {
          clearInterval(interval);
          toast.error("Votre demande de compte administrateur a été refusée.");
          navigate("/admin/inscription");
        }
        // si status === "ATTENTE", on ne fait rien, on continue d'attendre.
      } catch (error) {
        // en cas d'erreur réseau ponctuelle, on ne casse pas le polling,
        // on retentera simplement au prochain intervalle.
        console.error(error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [requestId, navigate]);
  const handlenavigate = () => {
    if (from?.startsWith("/admin")) {
      navigate("/admin/");
    } else {
      navigate("/");
    }
  };
  return (
    <div className="ErrorHome">
      <div className="ErrorButton">
        <Button onClick={() => navigate(-1)} className="succes">
          Retour
        </Button>
      </div>

      <div className="Errortexts">
        <h1 className="">
          Veuillez attendre une validation de l'admministrateur
        </h1>
      </div>
      <div
        ref={lightRef}
        style={{
          position: "fixed",
          width: 150,
          height: 150,
          borderRadius: "50%",
          background: "white",
          filter: "blur(60px)",
          pointerEvents: "none",
          willChange: "transform",
          zIndex: 999,
          cursor: "pointer",
        }}
      />
      <div />
      {/* Right content */}
      <div className="splineIcon">
        <SplineScene
          scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
          className="SplineCartoon"
        />
      </div>
    </div>
  );
};

export default InscriptionAfter;
