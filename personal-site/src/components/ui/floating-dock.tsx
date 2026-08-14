"use client";
// Aceternity floating dock, adapted for this site: framer-motion instead of
// the motion package, lucide instead of tabler, buttons (room clicks) instead
// of hrefs, and monochrome token colors that hold in dark and light.
import { cn } from "@/lib/utils";
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";

export interface FloatingDockItem {
  title: string;
  icon: React.ReactNode;
  onClick?: () => void;
  href?: string;
  active?: boolean;
}

export const FloatingDock = ({
  items,
  desktopClassName,
}: {
  items: FloatingDockItem[];
  desktopClassName?: string;
}) => {
  return <FloatingDockDesktop items={items} className={desktopClassName} />;
};

const FloatingDockDesktop = ({
  items,
  className,
}: {
  items: FloatingDockItem[];
  className?: string;
}) => {
  const mouseX = useMotionValue(Infinity);
  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        "mx-auto flex h-11 items-end gap-2 rounded-xl px-2.5 pb-2",
        className,
      )}
    >
      {items.map((item) => (
        <IconContainer mouseX={mouseX} key={item.title} {...item} />
      ))}
    </motion.div>
  );
};

function IconContainer({
  mouseX,
  title,
  icon,
  onClick,
  active,
}: FloatingDockItem & { mouseX: MotionValue }) {
  const ref = useRef<HTMLDivElement>(null);

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthTransform = useTransform(distance, [-150, 0, 150], [28, 50, 28]);
  const heightTransform = useTransform(distance, [-150, 0, 150], [28, 50, 28]);
  const widthTransformIcon = useTransform(distance, [-150, 0, 150], [13, 23, 13]);
  const heightTransformIcon = useTransform(distance, [-150, 0, 150], [13, 23, 13]);

  const spring = { mass: 0.1, stiffness: 150, damping: 12 };
  const width = useSpring(widthTransform, spring);
  const height = useSpring(heightTransform, spring);
  const widthIcon = useSpring(widthTransformIcon, spring);
  const heightIcon = useSpring(heightTransformIcon, spring);

  const [hovered, setHovered] = useState(false);

  // monochrome lamp: the glow answers the cursor from anywhere on the page
  const glow = useMotionValue(0);
  useEffect(() => {
    const onMove = (e: globalThis.MouseEvent) => {
      const bounds = ref.current?.getBoundingClientRect();
      if (!bounds) return;
      const dx = e.clientX - (bounds.x + bounds.width / 2);
      const dy = e.clientY - (bounds.y + bounds.height / 2);
      glow.set(Math.max(0, 1 - Math.hypot(dx, dy) / 480));
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [glow]);
  const glowSpring = useSpring(glow, { stiffness: 140, damping: 22 });
  const glowInner = useTransform(glowSpring, (v) => v * 0.28);
  const glowOuter = useTransform(glowSpring, (v) => v * 0.14);
  const glowShadow = useMotionTemplate`0 0 10px rgba(255,255,255,${glowInner}), 0 0 26px rgba(255,255,255,${glowOuter})`;

  return (
    <button type="button" onClick={onClick} className="cursor-pointer outline-none">
      <motion.div
        ref={ref}
        style={{ width, height, boxShadow: glowShadow }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={cn(
          "relative flex aspect-square items-center justify-center rounded-full",
          active ? "bg-white/15" : "bg-white/[0.06]",
        )}
      >
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 10, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: 2, x: "-50%" }}
              className="absolute -top-8 left-1/2 w-fit rounded-md border border-white/10 bg-neutral-900 px-2 py-0.5 text-xs whitespace-pre text-neutral-200"
            >
              {title}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          style={{ width: widthIcon, height: heightIcon }}
          className="flex items-center justify-center"
        >
          {icon}
        </motion.div>
      </motion.div>
    </button>
  );
}

export default FloatingDock;
