// Fey-style list interaction: a column of large dimmed rows. Hovering one
// brightens it and dims the rest, while a preview card glides after the
// cursor describing the destination. Click goes through.

import { motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowUpRight, type LucideIcon } from "lucide-react";
import { useRef, useState } from "react";

export interface RevealItem {
  title: string;
  handle: string; // small line under the title in the preview, e.g. @alexfoster
  description: string; // what this place is about
  href: string;
  icon?: LucideIcon;
}

const SPRING = { stiffness: 220, damping: 24, mass: 0.6 };

export function HoverRevealList({ items }: { items: RevealItem[] }) {
  const [active, setActive] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const cardX = useSpring(mouseX, SPRING);
  const cardY = useSpring(mouseY, SPRING);

  const handleMove = (e: React.MouseEvent) => {
    mouseX.set(e.clientX + 28);
    mouseY.set(e.clientY - 60);
  };

  const item = active === null ? null : items[active];

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMove}
      onMouseLeave={() => setActive(null)}
      className="relative w-full"
    >
      <div className="flex w-full flex-col">
        {items.map((entry, index) => (
          <a
            key={entry.title}
            href={entry.href}
            target="_blank"
            rel="noreferrer"
            onMouseEnter={() => setActive(index)}
            className="group flex items-baseline gap-5 border-b border-white/[0.07] py-6 transition-colors duration-300 sm:py-7"
            style={{
              opacity: active === null ? 1 : active === index ? 1 : 0.28,
              transition: "opacity 0.35s ease",
            }}
          >
            <span className="font-mono text-[11px] text-faint tabular-nums">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span
              className={
                "text-3xl font-medium tracking-tight transition-colors duration-300 sm:text-[44px] " +
                (active === index ? "text-foreground" : "text-neutral-500")
              }
            >
              {entry.title}
            </span>
            <span className="ml-auto flex items-center gap-2 text-[12px] text-faint opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              open
              <ArrowUpRight size={13} />
            </span>
          </a>
        ))}
      </div>

      {/* cursor-following preview — pointer devices only */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[60] hidden w-[240px] [@media(hover:hover)]:block"
        style={{ x: cardX, y: cardY }}
        animate={{ opacity: item ? 1 : 0, scale: item ? 1 : 0.92 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      >
        {item && (
          <div
            className="rounded-xl border border-white/10 p-5"
            style={{
              background: "rgba(12, 12, 13, 0.92)",
              boxShadow: "0 24px 60px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)",
              backdropFilter: "blur(12px)",
            }}
          >
            {item.icon && (
              <item.icon size={18} strokeWidth={1.5} className="text-neutral-300" />
            )}
            <p className="mt-3 text-[14px] font-medium text-foreground">
              {item.title}
            </p>
            <p className="mt-0.5 font-mono text-[11px] text-faint">{item.handle}</p>
            <p className="mt-3 text-[12.5px] leading-relaxed font-light text-muted-foreground">
              {item.description}
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
