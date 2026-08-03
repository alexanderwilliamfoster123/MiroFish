import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useMotionTemplate,
} from "framer-motion";

interface StoneRevealProps {
  side: "left" | "right";
  stoneSrc: string;
  grassSrc: string;
  zBase: number;
  zGrass: number;
}

const StoneReveal = ({
  side,
  stoneSrc,
  grassSrc,
  zBase,
  zGrass,
}: StoneRevealProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const radiusRaw = useMotionValue(0);
  const radius = useSpring(radiusRaw, { stiffness: 200, damping: 25 });

  const mask = useMotionTemplate`radial-gradient(circle ${radius}px at ${x}px ${y}px, black 0%, black 40%, transparent 100%)`;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (!rect) return;
    x.set(e.clientX - rect.left);
    y.set(e.clientY - rect.top);
  };

  const isLeft = side === "left";

  return (
    <div
      ref={wrapperRef}
      className="absolute bottom-0 w-fit cursor-crosshair"
      style={{ [isLeft ? "left" : "right"]: 0 }}
      onMouseEnter={() => radiusRaw.set(120)}
      onMouseLeave={() => radiusRaw.set(0)}
      onMouseMove={handleMouseMove}
    >
      <motion.img
        src={stoneSrc}
        alt=""
        draggable={false}
        className="h-[280px] sm:h-[380px] md:h-[500px] lg:h-[600px] xl:h-[680px] w-auto select-none"
        style={{
          objectFit: "contain",
          objectPosition: isLeft ? "left bottom" : "right bottom",
          zIndex: zBase,
          position: "relative",
        }}
        initial={{ opacity: 0, x: isLeft ? -40 : 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.9, ease: "easeOut", delay: 0.5 }}
      />
      <motion.img
        src={grassSrc}
        alt=""
        draggable={false}
        className="absolute inset-0 h-[280px] sm:h-[380px] md:h-[500px] lg:h-[600px] xl:h-[680px] w-auto select-none pointer-events-none"
        style={{
          objectFit: "contain",
          objectPosition: isLeft ? "left bottom" : "right bottom",
          zIndex: zGrass,
          maskImage: mask,
          WebkitMaskImage: mask,
        }}
      />
    </div>
  );
};

export default StoneReveal;
