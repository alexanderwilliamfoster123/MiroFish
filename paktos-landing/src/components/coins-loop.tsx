import { cn } from "@/lib/utils";
import coinsMp4 from "@/assets/coins-loop.mp4";
import coinsWebm from "@/assets/coins-loop.webm";

// Looping render of the shiny Paktos coins scene, composited over white.
// A plain video needs no WebGL/WebAssembly, so it plays everywhere the 3D
// runtime can't. Dual sources: VP9 webm (Chrome/Firefox/Edge) and H.264
// mp4 (Safari/iOS).
export function CoinsLoop({ className }: { className?: string }) {
  return (
    <video
      autoPlay
      muted
      loop
      playsInline
      aria-hidden="true"
      className={cn("pointer-events-none w-full object-cover", className)}
    >
      <source src={coinsWebm} type="video/webm" />
      <source src={coinsMp4} type="video/mp4" />
    </video>
  );
}
