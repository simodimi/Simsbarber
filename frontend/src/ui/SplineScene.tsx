import { Suspense, lazy } from "react";

const Spline = lazy(() => import("@splinetool/react-spline"));

interface SplineSceneProps {
  scene: string;
  className?: string;
}

const Loader = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
      height: "100%",
      color: "white",
    }}
  >
    Chargement...
  </div>
);

export default function SplineScene({ scene, className }: SplineSceneProps) {
  return (
    <Suspense fallback={<Loader />}>
      <Spline scene={scene} className={className} />
    </Suspense>
  );
}
