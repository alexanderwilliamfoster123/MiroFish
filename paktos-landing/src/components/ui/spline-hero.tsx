import * as React from "react";
import { lazy, Suspense } from "react";
import booleanWasmUrl from "@splinetool/boolean-wasm/build/boolean.wasm?url";

// Loaded lazily so the 3D runtime stays out of the critical path.
const Spline = lazy(() => import("@splinetool/react-spline"));

// The Spline runtime fetches helper wasm modules from unpkg at runtime.
// Serve our bundled copy instead so the page works fully offline /
// self-contained (and behind strict CSPs).
let fetchPatched = false;
function patchSplineWasmFetch() {
  if (fetchPatched || typeof window === "undefined") return;
  fetchPatched = true;
  const origFetch = window.fetch.bind(window);
  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof Request
          ? input.url
          : String(input);
    if (url.includes("@splinetool/boolean-wasm") && url.endsWith(".wasm")) {
      return origFetch(booleanWasmUrl, init);
    }
    return origFetch(input, init);
  };
}

// The 3D scene must never take the page down with it: if WebGL or wasm is
// unavailable (old device, strict CSP), we simply render nothing.
class SplineErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

interface SplineHeroProps {
  /** Scene URL — a bundled .splinecode asset or a prod.spline.design export */
  scene: string;
  className?: string;
}

// 3D Spline scene wrapper for the waitlist page. Renders nothing until a
// real scene URL is provided, and degrades silently if 3D can't run.
export function SplineHero({ scene, className }: SplineHeroProps) {
  if (!scene || scene === "loading...") return null;
  patchSplineWasmFetch();
  return (
    <SplineErrorBoundary>
      <div className={className}>
        <Suspense fallback={null}>
          <Spline scene={scene} />
        </Suspense>
      </div>
    </SplineErrorBoundary>
  );
}
