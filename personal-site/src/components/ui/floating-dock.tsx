"use client";
// Aceternity floating dock, adapted for this site: framer-motion instead of
// the motion package, lucide instead of tabler, buttons (room clicks) instead
// of hrefs, and monochrome token colors that hold in dark and light.
import { cn } from "@/lib/utils";
import { LayoutGrid } from "lucide-react";
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
  mobileClassName,
}: {
  items: FloatingDockItem[];
  desktopClassName?: string;
  mobileClassName?: string;
}) => {
  return (
    <>
      <FloatingDockDesktop items={items} className={desktopClassName} />
      <FloatingDockMobile items={items} className={mobileClassName} />
    </>
  );
};

const FloatingDockMobile = ({
  items,
  className,
}: {
  items: FloatingDockItem[];
  className?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={cn("relative block md:hidden", className)}>
      <AnimatePresence>
        {open && (
          <motion.div
            layoutId="nav"
            className="absolute inset-x-0 bottom-full mb-2 flex flex-col gap-2"
          >
            {items.map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{
                  opacity: 0,
                  y: 10,
                  transition: { delay: idx * 0.05 },
                }}
                transition={{ delay: (items.length - 1 - idx) * 0.05 }}
              >
                <button
                  type="button"
                  onClick={() => {
                    item.onClick?.();
                    setOpen(false);
                  }}
                  className={cn(
                    "flex h-10 w-10 cursor-pointer items-center justify-center rounded-full outline-none",
                    item.active ? "bg-white/15" : "bg-neutral-900",
                  )}
                >
                  <div className="h-4 w-4">{item.icon}</div>
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-neutral-900 outline-none"
      >
        <LayoutGrid size={18} className="text-neutral-400" />
      </button>
    </div>
  );
};

const FloatingDockDesktop = ({
  items,
  className,
}: {
  items: FloatingDockItem[];
  className?: string;
}) => {
  const mouseX = useMotionValue(Infinity);
  const panelRef = useRef<HTMLDivElement>(null);

  // skeuomorphic panel shadow — cast away from wherever the lamp is
  const shadowX = useMotionValue(0);
  const shadowY = useMotionValue(-1);
  useEffect(() => {
    const onMove = (e: globalThis.MouseEvent) => {
      const bounds = panelRef.current?.getBoundingClientRect();
      if (!bounds) return;
      const dx = e.clientX - (bounds.x + bounds.width / 2);
      const dy = e.clientY - (bounds.y + bounds.height / 2);
      const angle = Math.atan2(dy, dx);
      const distance = Math.min(3, (Math.hypot(dx, dy) / (bounds.width * 2)) * 3);
      shadowX.set(-Math.cos(angle) * distance);
      shadowY.set(-Math.sin(angle) * distance);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [shadowX, shadowY]);
  const panelShadow = useMotionTemplate`
    calc(${shadowX} * 3px) calc(${shadowY} * 3px) 4px rgba(0, 0, 0, 0.16),
    calc(${shadowX} * 10px) calc(${shadowY} * 10px) 12px rgba(0, 0, 0, 0.22),
    calc(${shadowX} * 26px) calc(${shadowY} * 26px) 34px rgba(0, 0, 0, 0.3),
    calc(${shadowX} * 60px) calc(${shadowY} * 60px) 80px rgba(0, 0, 0, 0.35)`;

  return (
    <motion.div
      ref={panelRef}
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      style={{ boxShadow: panelShadow }}
      className={cn(
        "mx-auto hidden h-11 items-end gap-2 rounded-xl px-2.5 pb-2 md:flex",
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
  const glowInner = useTransform(glowSpring, (v) => v * 0.24);
  const glowOuter = useTransform(glowSpring, (v) => v * 0.12);
  const glowShadow = useMotionTemplate`inset 0 1px 0 rgba(255,255,255,0.09), inset 0 -2px 5px rgba(0,0,0,0.5), 0 4px 10px rgba(0,0,0,0.45), 0 0 10px rgba(255,255,255,${glowInner}), 0 0 26px rgba(255,255,255,${glowOuter})`;

  // the lit edge swings to face the lamp
  const edgeAngle = useMotionValue(0);
  useEffect(() => {
    const onMove = (e: globalThis.MouseEvent) => {
      const bounds = ref.current?.getBoundingClientRect();
      if (!bounds) return;
      const dx = e.clientX - (bounds.x + bounds.width / 2);
      const dy = e.clientY - (bounds.y + bounds.height / 2);
      edgeAngle.set((Math.atan2(dy, dx) * 180) / Math.PI + 90);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [edgeAngle]);
  const edgeRotate = useMotionTemplate`rotate(${edgeAngle}deg)`;

  return (
    <button type="button" onClick={onClick} className="cursor-pointer outline-none">
      <motion.div
        ref={ref}
        style={{ width, height, boxShadow: glowShadow }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={cn(
          "dock-key relative flex aspect-square items-center justify-center overflow-hidden rounded-[11px] active:translate-y-[1px]",
          active && "dock-key-active",
        )}
      >
        {/* edge light, always facing the cursor */}
        <motion.div
          className="pointer-events-none absolute inset-0"
          style={{ transform: edgeRotate, opacity: glowSpring }}
        >
          <div
            className="h-full w-full"
            style={{
              background:
                "linear-gradient(to bottom, rgba(255,255,255,0.13), transparent 52%)",
            }}
          />
        </motion.div>
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
