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
  // rows with sublinks open a small drop-down instead of navigating
  sublinks?: { title: string; href: string }[];
  onSelect?: () => void; // in-app row: click runs this instead of following href
  soon?: boolean; // not yet open — row is quiet and unclickable
}

const SPRING = { stiffness: 220, damping: 24, mass: 0.6 };

export function HoverRevealList({ items }: { items: RevealItem[] }) {
  const [active, setActive] = useState<number | null>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
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
        {items.map((entry, index) => {
          const isOpen = openIndex === index;
          const rowStyle = {
            opacity: active === null ? 1 : active === index ? 1 : 0.28,
            transition: "opacity 0.35s ease",
          };
          const rowInner = (
            <>
              <span className="font-mono text-[10px] text-faint tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span
                className={
                  "text-[15px] font-medium tracking-tight transition-colors duration-300 " +
                  (active === index ? "text-foreground" : "text-neutral-500")
                }
              >
                {entry.title}
              </span>
              <span className="ml-auto flex items-center gap-1.5 text-[11px] text-faint opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                {entry.sublinks ? (isOpen ? "close" : "open") : "open"}
                {!entry.sublinks && <ArrowUpRight size={12} />}
              </span>
            </>
          );

          if (entry.soon) {
            return (
              <div
                key={entry.title}
                onMouseEnter={() => setActive(index)}
                className="group flex items-baseline gap-4 border-b border-white/[0.07] py-3.5"
                style={rowStyle}
              >
                <span className="font-mono text-[10px] text-faint tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-[15px] font-medium tracking-tight text-neutral-600">
                  {entry.title}
                </span>
                <span className="ml-auto text-[11px] text-faint opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  coming soon
                </span>
              </div>
            );
          }

          if (entry.onSelect) {
            return (
              <button
                key={entry.title}
                type="button"
                onClick={entry.onSelect}
                onMouseEnter={() => setActive(index)}
                className="group flex w-full cursor-pointer items-baseline gap-4 border-b border-white/[0.07] py-3.5 text-left transition-colors duration-300"
                style={rowStyle}
              >
                {rowInner}
              </button>
            );
          }

          if (entry.sublinks) {
            return (
              <div key={entry.title} className="border-b border-white/[0.07]">
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  onMouseEnter={() => setActive(index)}
                  className="group flex w-full cursor-pointer items-baseline gap-4 py-3.5 text-left transition-colors duration-300"
                  style={rowStyle}
                >
                  {rowInner}
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-col pb-4">
                    {entry.sublinks.map((sublink) => (
                      <a
                        key={sublink.title}
                        href={sublink.href}
                        target="_blank"
                        rel="noreferrer"
                        className="group/sub flex items-center gap-2.5 py-2 pl-10 text-[13px] text-neutral-500 transition-colors duration-300 hover:text-foreground"
                      >
                        <span className="text-faint">&mdash;</span>
                        {sublink.title}
                        <ArrowUpRight
                          size={11}
                          className="opacity-0 transition-opacity duration-300 group-hover/sub:opacity-100"
                        />
                      </a>
                    ))}
                  </div>
                </motion.div>
              </div>
            );
          }

          return (
            <a
              key={entry.title}
              href={entry.href}
              target="_blank"
              rel="noreferrer"
              onMouseEnter={() => setActive(index)}
              className="group flex items-baseline gap-4 border-b border-white/[0.07] py-3.5 transition-colors duration-300"
              style={rowStyle}
            >
              {rowInner}
            </a>
          );
        })}
      </div>

      {/* cursor-following preview — pointer devices only */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[60] hidden w-[240px] [@media(hover:hover)]:block"
        style={{ x: cardX, y: cardY }}
        animate={{ opacity: item ? 1 : 0, scale: item ? 1 : 0.92 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      >
        {item && (
          <div className="hover-card rounded-xl border border-white/10 p-5">
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
