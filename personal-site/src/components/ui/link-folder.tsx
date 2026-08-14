"use client";
// the interactive folder gallery, repurposed: each folder holds link cards
// instead of photographs. hover peeks the cards, click fans them out, and
// tapping a card takes you where it goes. drag a card down to close.
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { createPortal } from "react-dom";
import { CardCarousel } from "@/components/ui/card-carousel";

export interface FolderLink {
  title: string;
  handle?: string;
  icon?: LucideIcon;
  href?: string;
  onSelect?: () => void;
  soon?: boolean;
  description?: string; // what it actually is — shown on the sticker
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
  overlayTo?: Element | null; // where the open-carousel overlay mounts (defaults to body)
}

export function LinkFolder({
  name,
  links,
  open,
  onOpen,
  onClose,
  dimmed,
  hovered,
  onHover,
  overlayTo,
}: LinkFolderProps) {
  const center = (links.length - 1) / 2;

  const activate = (link: FolderLink) => {
    if (link.soon) return;
    if (link.onSelect) {
      onClose();
      link.onSelect();
    } else if (link.href) {
      window.open(link.href, "_blank", "noopener");
    }
  };

  return (
    <div
      className="relative flex h-[230px] w-[196px] justify-center transition-opacity duration-500"
      style={{
        opacity: dimmed ? 0.14 : 1,
        pointerEvents: dimmed ? "none" : "auto",
        zIndex: open ? 40 : 10,
      }}
    >
      {/* folder back */}
      <motion.div
        className="pointer-events-none absolute bottom-4 h-28 w-[168px] drop-shadow-2xl"
        animate={{ opacity: open ? 0 : 1, scale: open ? 0.9 : 1 }}
      >
        <div className="lf-tab absolute top-0 left-0 h-6 w-16 rounded-t-lg border-t border-r border-l border-white/10 bg-linear-to-t from-[#1e1e1e] to-[#2a2a2a]" />
        <div className="lf-body absolute top-5 right-0 bottom-0 left-0 rounded-b-lg rounded-tr-lg border border-white/10 bg-linear-to-b from-[#1e1e1e] to-[#0a0a0a] shadow-[inset_0_0_40px_rgba(0,0,0,0.8)]" />
        <div className="lf-inner pointer-events-none absolute top-6 right-1.5 bottom-1.5 left-1.5 rounded-md bg-black shadow-inner" />
      </motion.div>

      {/* the cards peeking from the folder */}
      <div className="absolute bottom-6 z-10 flex justify-center">
        {links.map((link, index) => {
          const offset = index - center;
          const stackY = hovered && !open ? offset * -6 - 24 : offset * -3;
          const stackX = hovered && !open ? offset * 15 : offset * 2;
          const stackRotate = hovered && !open ? offset * 6 : offset * 2.5;
          const stackScale = 1 - Math.abs(offset) * 0.03;
          const Icon = link.icon;

          return (
            <motion.div
              key={link.title}
              className="lf-cardframe pointer-events-none absolute bottom-0 h-[132px] w-[104px] origin-bottom overflow-hidden rounded-lg border border-white/15 shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
              animate={{
                y: stackY,
                x: stackX,
                rotate: stackRotate,
                scale: stackScale,
                zIndex: index + 10,
                opacity: open ? 0 : 1,
              }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
            >
              <div className="lf-card flex h-full w-full flex-col justify-between bg-linear-to-b from-[#191919] to-[#0c0c0c] p-3">
                {Icon ? (
                  <Icon size={14} strokeWidth={1.5} className="text-neutral-300" />
                ) : (
                  <span />
                )}
                <div>
                  <p className="text-[11px] font-medium tracking-tight text-foreground">
                    {link.title}
                  </p>
                  {link.handle && (
                    <p className="mt-0.5 font-mono text-[8px] text-faint">
                      {link.handle}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* open: the cards become a stacked carousel over the page */}
      {open &&
        createPortal(
          <div
            className={`animate-fade-in ${overlayTo ? "absolute" : "fixed"} inset-0 z-[70] flex flex-col items-center justify-center gap-3 bg-background/92 px-4 backdrop-blur-sm`}
            style={{ animationDuration: "0.3s" }}
            onClick={onClose}
          >
            <p className="text-[13px] font-medium tracking-tight text-foreground">
              {name}
            </p>
            <div className="w-full" onClick={(event) => event.stopPropagation()}>
              <CardCarousel links={links} onActivate={activate} />
            </div>
            <p className="text-[10px] text-faint">
              drag to browse &mdash; tap the front card to open &mdash; tap outside to close
            </p>
          </div>,
          overlayTo ?? document.body,
        )}

      {/* folder front */}
      <motion.div
        className="lf-front pointer-events-auto absolute bottom-0 z-20 h-[84px] w-[178px] cursor-pointer drop-shadow-[0_-20px_40px_rgba(0,0,0,0.8)]"
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
        <div className="lf-panel relative flex h-full w-full items-end justify-center overflow-hidden rounded-xl border border-white/15 bg-linear-to-b from-[#262626] to-[#101010] pb-3.5 shadow-[inset_0_2px_10px_rgba(255,255,255,0.08)]">
          <div className="absolute top-0 right-0 left-0 h-px bg-linear-to-r from-transparent via-white/40 to-transparent" />
          <div className="lf-chip flex items-center justify-center px-3 py-1.5">
            <span className="text-[10px] font-medium tracking-wide text-white/90">
              {name}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
