// a quiet monochrome lamp that follows the pointer — the codepen
// skeuomorphic-nav idea reduced to this site's language: no green, no
// external textures, just a soft white radial that surfaces respond to.

import { useEffect, useRef } from "react";

export function CursorLight() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const lamp = ref.current;
    if (!lamp) return;
    const onMove = (e: MouseEvent) => {
      lamp.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      lamp.style.opacity = "1";
    };
    const onLeave = () => {
      lamp.style.opacity = "0";
    };
    window.addEventListener("mousemove", onMove);
    document.documentElement.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="cursor-lamp pointer-events-none fixed top-0 left-0 z-[45] hidden opacity-0 transition-opacity duration-500 [@media(hover:hover)]:block"
      style={{ willChange: "transform" }}
    >
      <div
        className="h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.018) 35%, transparent 70%)",
        }}
      />
    </div>
  );
}
