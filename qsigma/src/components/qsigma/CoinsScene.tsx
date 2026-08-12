import { Component, lazy, Suspense, useEffect, useRef, useState, type ReactNode } from "react";

/** If the Spline runtime or scene fails to load, render nothing rather than crash. */
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

// Spline runtime is heavy — load it only when the scene approaches the viewport.
const Spline = lazy(() => import("@splinetool/react-spline"));

const SCENE = "https://prod.spline.design/axM-a3i4zLUUEn54/scene.splinecode";

export default function CoinsScene({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShow(true);
          io.disconnect();
        }
      },
      { rootMargin: "400px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={className} aria-hidden="true">
      {show && (
        <SceneBoundary>
          <Suspense fallback={null}>
            <Spline scene={SCENE} style={{ width: "100%", height: "100%" }} />
          </Suspense>
        </SceneBoundary>
      )}
    </div>
  );
}
