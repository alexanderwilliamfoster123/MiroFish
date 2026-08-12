import { lazy, Suspense } from "react";

// Loaded lazily so the 3D runtime is only fetched when a scene is configured.
const Spline = lazy(() => import("@splinetool/react-spline"));

interface SplineHeroProps {
  /** Full URL of a Spline scene export, e.g. https://prod.spline.design/xxxx/scene.splinecode */
  scene: string;
  className?: string;
}

// 3D Spline scene wrapper for the waitlist page. Renders nothing until a
// real scene URL is provided.
export function SplineHero({ scene, className }: SplineHeroProps) {
  if (!scene || scene === "loading...") return null;
  return (
    <div className={className}>
      <Suspense fallback={null}>
        <Spline scene={scene} />
      </Suspense>
    </div>
  );
}
