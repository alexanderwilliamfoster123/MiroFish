"use client";
// carousel-07 (stacked drag deck), reshaped for this site: framer-motion
// instead of the motion package, monochrome link cards instead of photo
// slides, no badge. drag to cycle; tap the front card to open it.
import * as React from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  type PanInfo,
  type MotionValue,
} from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FolderLink } from "@/components/ui/link-folder";

interface CarouselConfig {
  distanceDivisor: number;
  velocityDivisor: number;
  sensitivity: number;
  xMultiplier: number;
  yMultiplier: number;
  rotationMultiplier: number;
  scaleReduction: number;
}

const getCarouselConfig = (width: number): CarouselConfig => {
  if (width < 640) {
    return {
      distanceDivisor: 120,
      velocityDivisor: 500,
      sensitivity: 180,
      xMultiplier: 90,
      yMultiplier: 20,
      rotationMultiplier: 8,
      scaleReduction: 0.06,
    };
  }
  if (width < 1024) {
    return {
      distanceDivisor: 160,
      velocityDivisor: 650,
      sensitivity: 220,
      xMultiplier: 130,
      yMultiplier: 30,
      rotationMultiplier: 10,
      scaleReduction: 0.09,
    };
  }
  return {
    distanceDivisor: 200,
    velocityDivisor: 800,
    sensitivity: 250,
    xMultiplier: 170,
    yMultiplier: 40,
    rotationMultiplier: 12,
    scaleReduction: 0.12,
  };
};

export function CardCarousel({
  links,
  onActivate,
}: {
  links: FolderLink[];
  onActivate: (link: FolderLink) => void;
}) {
  const scrollProgress = useMotionValue(0);
  const startProgress = React.useRef(0);
  const [windowWidth, setWindowWidth] = React.useState(0);

  const total = links.length;

  React.useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const config = React.useMemo(
    () => getCarouselConfig(windowWidth),
    [windowWidth],
  );

  const handleDragStart = () => {
    startProgress.current = scrollProgress.get();
  };

  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    const dragDistance = info.offset.x;
    const velocity = info.velocity.x;

    const distanceShift = -dragDistance / config.distanceDivisor;
    const velocityShift = -velocity / config.velocityDivisor;

    let totalShift = Math.round(distanceShift + velocityShift);
    totalShift = Math.max(-3, Math.min(3, totalShift));

    const target = Math.round(startProgress.current) + totalShift;

    animate(scrollProgress, target, {
      type: "spring",
      stiffness: 200,
      damping: 30,
      mass: 1,
    });
  };

  const activateFront = () => {
    const front =
      ((Math.round(scrollProgress.get()) % total) + total) % total;
    onActivate(links[front]);
  };

  return (
    <div className="flex w-full flex-col items-center justify-center overflow-hidden py-6 select-none">
      <div className="relative flex h-64 w-full max-w-5xl items-center justify-center sm:h-80">
        {/* transparent drag surface; a still tap opens the front card */}
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragStart={handleDragStart}
          onDrag={(_, info) => {
            const delta = -info.delta.x / config.sensitivity;
            scrollProgress.set(scrollProgress.get() + delta);
          }}
          onDragEnd={handleDragEnd}
          onTap={activateFront}
          className="absolute inset-0 z-50 cursor-grab active:cursor-grabbing"
        />

        {links.map((link, index) => (
          <Card
            key={link.title}
            link={link}
            index={index}
            total={total}
            progress={scrollProgress}
            config={config}
          />
        ))}
      </div>
    </div>
  );
}

interface CardProps {
  link: FolderLink;
  index: number;
  total: number;
  progress: MotionValue<number>;
  config: CarouselConfig;
}

const Card = ({ link, index, total, progress, config }: CardProps) => {
  const offset = useTransform(progress, (p) => {
    let diff = (index - p) % total;
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;
    return diff;
  });

  const x = useTransform(offset, (o) => o * config.xMultiplier);
  const rotate = useTransform(offset, (o) => {
    if (Math.abs(o) < 0.05) return 0;
    return o * config.rotationMultiplier;
  });
  const y = useTransform(offset, (o) => {
    if (Math.abs(o) < 0.05) return 0;
    return Math.abs(o) * config.yMultiplier;
  });
  const scale = useTransform(
    offset,
    (o) => 1 - Math.abs(o) * config.scaleReduction,
  );
  const opacity = useTransform(
    offset,
    [-total / 2, -total / 2 + 0.5, 0, total / 2 - 0.5, total / 2],
    total > 2 ? [0, 1, 1, 1, 0] : [1, 1, 1, 1, 1],
  );
  const zIndex = useTransform(offset, (o) =>
    Math.round(100 - Math.abs(o) * 10),
  );
  const frontHint = useTransform(offset, [-0.5, 0, 0.5], [0, 1, 0]);

  const Icon = link.icon;

  return (
    <motion.div
      style={{ x, rotate, y, scale, opacity, zIndex }}
      className={cn(
        "lf-cardframe pointer-events-none absolute overflow-hidden rounded-xl border border-white/15 shadow-[0_20px_40px_rgba(0,0,0,0.5)]",
        "h-56 w-44 sm:h-64 sm:w-52",
      )}
    >
      <div className="lf-card flex h-full w-full flex-col justify-between bg-linear-to-b from-[#191919] to-[#0c0c0c] p-4">
        {Icon ? (
          <Icon size={18} strokeWidth={1.5} className="text-neutral-300" />
        ) : (
          <span />
        )}
        <div>
          <p className="text-[13px] font-medium tracking-tight text-foreground">
            {link.title}
          </p>
          {link.handle && (
            <p className="mt-0.5 font-mono text-[9px] text-faint">{link.handle}</p>
          )}
          {link.soon ? (
            <p className="mt-2 text-[10px] text-faint">coming soon</p>
          ) : (
            <motion.p
              style={{ opacity: frontHint }}
              className="mt-2 flex items-center gap-1 text-[10px] text-neutral-500"
            >
              tap to open <ArrowUpRight size={10} />
            </motion.p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CardCarousel;
