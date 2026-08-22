import SplineScene from "../ui/SplineScene";
import "../styles/error.css";
import Button from "../ui/Button";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
const ErrorPage = () => {
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
  return (
    <div className="ErrorHome">
      <div className="ErrorButton">
        <Button onClick={() => navigate(-1)} className="succes">
          Retour
        </Button>
      </div>

      <div className="Errortext">
        <h1 className="">Erreur 404</h1>
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

export default ErrorPage;
