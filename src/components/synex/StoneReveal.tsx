import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, type CSSProperties } from "react";

interface StoneRevealProps {
  baseSrc: string;
  mossSrc: string;
  side: "left" | "right";
  className?: string;
  style?: CSSProperties;
  alt?: string;
  flipX?: boolean;
}


export default function StoneReveal({
  baseSrc,
  mossSrc,
  side,
  className,
  style,
  alt = "",
  flipX = false,
}: StoneRevealProps) {

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const radiusRaw = useMotionValue(0);
  const radius = useSpring(radiusRaw, { stiffness: 200, damping: 25 });

  const mask = useTransform(
    [x, y, radius],
    ([xv, yv, rv]) =>
      `radial-gradient(circle ${rv}px at ${xv}px ${yv}px, black 0%, black 40%, transparent 100%)`
  );

  const offset = side === "left" ? -40 : 40;

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (!rect) return;
    const localX = e.clientX - rect.left;
    x.set(flipX ? rect.width - localX : localX);
    y.set(e.clientY - rect.top);
  }

  return (
    <motion.div
      ref={wrapperRef}
      className={className}
      style={{
        ...style,
        transformOrigin: flipX ? "center bottom" : style?.transformOrigin,
        scaleX: flipX ? -1 : 1,
      }}
      initial={{ opacity: 0, x: offset }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.9, delay: 0.5, ease: "easeOut" }}
      onMouseEnter={() => radiusRaw.set(120)}
      onMouseLeave={() => radiusRaw.set(0)}
      onMouseMove={handleMove}
    >

      <img
        src={baseSrc}
        alt={alt}
        className="block w-full h-auto select-none pointer-events-none"
        draggable={false}
      />
      <motion.img
        src={mossSrc}
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
    </motion.div>
  );
}
