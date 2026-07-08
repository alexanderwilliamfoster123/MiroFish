import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";

const boldTree = "https://qclay.design/lovable/synex/boldTree.png";
const grassTree = "https://qclay.design/lovable/synex/GrassTree.png";

export default function TreeReveal({ className }: { className?: string }) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const radiusRaw = useMotionValue(0);
  const radius = useSpring(radiusRaw, { stiffness: 200, damping: 25 });

  const mask = useTransform(
    [x, y, radius],
    ([xv, yv, rv]) => `radial-gradient(circle ${rv}px at ${xv}px ${yv}px, black 0%, black 40%, transparent 100%)`,
  );

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (!rect) return;
    x.set(e.clientX - rect.left);
    y.set(e.clientY - rect.top);
  }

  return (
    <div
      ref={wrapperRef}
      className={className}
      onMouseEnter={() => radiusRaw.set(180)}
      onMouseLeave={() => radiusRaw.set(0)}
      onMouseMove={handleMove}
      style={{ position: "relative" }}
    >
      <img
        src={boldTree}
        alt=""
        aria-hidden="true"
        draggable={false}
        className="block w-full h-auto select-none pointer-events-none"
      />
      <motion.img
        src={grassTree}
        alt=""
        aria-hidden="true"
        draggable={false}
        className="absolute inset-0 w-full h-full select-none pointer-events-none"
        style={{
          maskImage: mask,
          WebkitMaskImage: mask,
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
        }}
      />
    </div>
  );
}
