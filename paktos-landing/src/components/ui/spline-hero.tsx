import * as React from "react";
import { lazy, Suspense } from "react";
import booleanWasmUrl from "@splinetool/boolean-wasm/build/boolean.wasm?url";
import modellingWasmUrl from "@splinetool/modelling-wasm/build/process.wasm?url";

// Loaded lazily so the 3D runtime stays out of the critical path.
const Spline = lazy(() => import("@splinetool/react-spline"));

// The Spline runtime fetches helper wasm modules from unpkg at runtime.
// Serve our bundled copies instead so the page works fully offline /
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
    if (url.includes("@splinetool/modelling-wasm") && url.endsWith(".wasm")) {
      return origFetch(modellingWasmUrl, init);
    }
    return origFetch(input, init);
  };
}

// The 3D scene must never take the page down with it.
class SplineErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

interface SplineHeroProps {
  /** Scene URL — a bundled .splinecode asset or a prod.spline.design export */
  scene: string;
  className?: string;
  /** Rendered instead of the scene when WebGL/wasm can't run here */
  fallback?: React.ReactNode;
  /**
   * The canvas size the scene's camera was framed for. The scene renders
   * at this size and is CSS-scaled to the container, so a fixed-zoom
   * camera shows the whole composition at any container width instead of
   * cropping it.
   */
  designWidth?: number;
  designHeight?: number;
}

// Interactive 3D Spline scene. Probes for working WebAssembly + WebGL
// before mounting the runtime; hosts that block either (sandboxed
// previews, old devices) get the fallback instead of a blank box.
export function SplineHero({
  scene,
  className,
  fallback = null,
  designWidth = 896,
  designHeight = 425,
}: SplineHeroProps) {
  const [mode, setMode] = React.useState<"probing" | "3d" | "fallback">(
    "probing"
  );
  const wrapRef = React.useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = React.useState(0);

  React.useEffect(() => {
    const el = wrapRef.current;
    if (!el || mode !== "3d") return;
    const measure = () => setScale(el.clientWidth / designWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [mode, designWidth]);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (typeof WebAssembly === "undefined") throw new Error("no wasm");
        // smallest valid module — throws where CSP blocks wasm compilation
        await WebAssembly.compile(
          new Uint8Array([0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00])
        );
        const probe = document.createElement("canvas");
        if (!probe.getContext("webgl2") && !probe.getContext("webgl")) {
          throw new Error("no webgl");
        }
        if (alive) setMode("3d");
      } catch {
        if (alive) setMode("fallback");
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  if (!scene || mode === "probing") return <div className={className} />;
  if (mode === "fallback") return <>{fallback}</>;
  patchSplineWasmFetch();
  return (
    <SplineErrorBoundary fallback={fallback}>
      <div
        ref={wrapRef}
        className={className ? `${className} overflow-hidden` : "overflow-hidden"}
      >
        {scale > 0 && (
          <div
            style={{
              width: designWidth,
              height: designHeight,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
          >
            <Suspense fallback={null}>
              <Spline
                scene={scene}
                className="!h-full !w-full"
                onLoad={(app: unknown) => {
                  // the export drew its white ground from page CSS; force
                  // the scene background so the canvas matches the page
                  try {
                    (
                      app as { setBackgroundColor?: (color: string) => void }
                    ).setBackgroundColor?.("#ffffff");
                  } catch {
                    /* cosmetic only */
                  }
                }}
              />
            </Suspense>
          </div>
        )}
      </div>
    </SplineErrorBoundary>
  );
}
