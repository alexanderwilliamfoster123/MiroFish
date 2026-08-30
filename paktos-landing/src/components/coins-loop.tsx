import * as React from "react";
import { cn } from "@/lib/utils";
import coinsMp4 from "@/assets/coins-loop.mp4";
import coinsWebm from "@/assets/coins-loop.webm";

// Looping render of the shiny Paktos coins scene, composited over white.
// A plain video needs no WebGL/WebAssembly, so it plays everywhere the 3D
// runtime can't. Dual sources: VP9 webm (Chrome/Firefox/Edge) and H.264
// mp4 (Safari/iOS).
export function CoinsLoop({ className }: { className?: string }) {
  const ref = React.useRef<HTMLVideoElement | null>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.pause();
      return;
    }
    // React sets `muted` as a property only, so the attribute is missing
    // when the browser evaluates its autoplay policy and playback can be
    // blocked. Force it and start playback ourselves; if the policy still
    // refuses, retry on the first interaction.
    el.muted = true;
    const tryPlay = () => {
      el.play().catch(() => {});
    };
    tryPlay();
    window.addEventListener("pointerdown", tryPlay, { once: true });
    window.addEventListener("keydown", tryPlay, { once: true });
    return () => {
      window.removeEventListener("pointerdown", tryPlay);
      window.removeEventListener("keydown", tryPlay);
    };
  }, []);

  return (
    <video
      ref={ref}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden="true"
      className={cn("pointer-events-none w-full object-cover", className)}
    >
      <source src={coinsWebm} type="video/webm" />
      <source src={coinsMp4} type="video/mp4" />
    </video>
  );
}
