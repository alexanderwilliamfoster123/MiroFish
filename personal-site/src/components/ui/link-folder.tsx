"use client";
// the interactive folder gallery, repurposed: each folder holds link cards
// instead of photographs. hover peeks the cards, click fans them out, and
// tapping a card takes you where it goes. drag a card down to close.
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";

export interface FolderLink {
  title: string;
  handle?: string;
  icon?: LucideIcon;
  href?: string;
  onSelect?: () => void;
  soon?: boolean;
}

export interface LinkFolderProps {
  name: string;
  links: FolderLink[];
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  dimmed?: boolean; // another folder is open
  fanShift?: number; // px to slide the open fan so it centres on the page
  hovered: boolean;
  onHover: (hovering: boolean) => void;
}

export function LinkFolder({
  name,
  links,
  open,
  onOpen,
  onClose,
  dimmed,
  fanShift = 0,
  hovered,
  onHover,
}: LinkFolderProps) {
  const center = (links.length - 1) / 2;

  return (
    <div
      className="relative flex h-[330px] w-[280px] justify-center transition-opacity duration-500"
      style={{
        opacity: dimmed ? 0.14 : 1,
        pointerEvents: dimmed ? "none" : "auto",
        zIndex: open ? 40 : 10,
      }}
    >
      {/* folder back */}
      <motion.div
        className="pointer-events-none absolute bottom-5 h-40 w-60 drop-shadow-2xl"
        animate={{ opacity: open ? 0 : 1, scale: open ? 0.9 : 1 }}
      >
        <div className="absolute top-0 left-0 h-8 w-24 rounded-t-xl border-t border-r border-l border-white/10 bg-linear-to-t from-[#1e1e1e] to-[#2a2a2a]" />
        <div className="absolute top-6 right-0 bottom-0 left-0 rounded-b-xl rounded-tr-xl border border-white/10 bg-linear-to-b from-[#1e1e1e] to-[#0a0a0a] shadow-[inset_0_0_40px_rgba(0,0,0,0.8)]" />
        <div className="pointer-events-none absolute top-8 right-2 bottom-2 left-2 rounded-lg bg-black shadow-inner" />
      </motion.div>

      {/* the cards */}
      <div className="absolute bottom-8 z-10 flex justify-center">
        {links.map((link, index) => {
          const offset = index - center;
          const stackY = hovered && !open ? offset * -8 - 34 : offset * -4;
          const stackX = hovered && !open ? offset * 22 : offset * 3;
          const stackRotate = hovered && !open ? offset * 7 : offset * 3;
          const stackScale = 1 - Math.abs(offset) * 0.03;

          const Icon = link.icon;
          const activate = () => {
            if (link.soon) return;
            if (link.onSelect) link.onSelect();
            else if (link.href) window.open(link.href, "_blank", "noopener");
          };

          return (
            <motion.div
              key={link.title}
              drag={open}
              dragSnapToOrigin
              onDragEnd={(_, info) => {
                if (info.offset.y > 90 && open) onClose();
              }}
              onTap={open ? activate : undefined}
              className={`group absolute bottom-0 h-[190px] w-[148px] origin-bottom overflow-hidden rounded-xl border border-white/15 shadow-[0_20px_40px_rgba(0,0,0,0.5)] ${
                open
                  ? link.soon
                    ? "pointer-events-auto cursor-grab active:cursor-grabbing"
                    : "pointer-events-auto cursor-pointer active:cursor-grabbing"
                  : "pointer-events-none"
              }`}
              animate={
                !open
                  ? {
                      y: stackY,
                      x: stackX,
                      rotate: stackRotate,
                      scale: stackScale,
                      zIndex: index + 10,
                    }
                  : {
                      y: -118,
                      x: offset * 158 + fanShift,
                      rotate: 0,
                      scale: 1.05,
                      zIndex: 50,
                    }
              }
              whileHover={open ? { scale: 1.1, zIndex: 100 } : {}}
              whileDrag={open ? { scale: 1.15, rotate: 5, zIndex: 150 } : {}}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
            >
              <div className="flex h-full w-full flex-col justify-between bg-linear-to-b from-[#191919] to-[#0c0c0c] p-4">
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
                    <p className="mt-0.5 font-mono text-[9px] text-faint">
                      {link.handle}
                    </p>
                  )}
                  {link.soon ? (
                    <p className="mt-2 text-[10px] text-faint">coming soon</p>
                  ) : (
                    <p className="mt-2 flex items-center gap-1 text-[10px] text-neutral-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      open <ArrowUpRight size={10} />
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* folder front */}
      <motion.div
        className="pointer-events-auto absolute bottom-0 z-20 h-[122px] w-[254px] cursor-pointer drop-shadow-[0_-20px_40px_rgba(0,0,0,0.8)]"
        style={{ transformOrigin: "bottom" }}
        animate={{
          opacity: open ? 0 : 1,
          rotateX: hovered && !open ? -25 : 0,
          y: hovered && !open ? 8 : 0,
          pointerEvents: open ? "none" : "auto",
        }}
        onMouseEnter={() => onHover(true)}
        onMouseLeave={() => onHover(false)}
        onClick={onOpen}
      >
        <div className="relative flex h-full w-full items-end justify-center overflow-hidden rounded-2xl border border-white/15 bg-linear-to-b from-[#262626] to-[#101010] pb-5 shadow-[inset_0_2px_10px_rgba(255,255,255,0.08)]">
          <div className="absolute top-0 right-0 left-0 h-px bg-linear-to-r from-transparent via-white/40 to-transparent" />
          <div className="flex items-center justify-center rounded-lg border border-black/80 bg-black px-4 py-2 shadow-inner">
            <span className="text-[12px] font-medium tracking-wide text-white/90">
              {name}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
