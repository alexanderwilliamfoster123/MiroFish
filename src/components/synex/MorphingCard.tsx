import { motion, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const FONT = '"Inter Tight", Inter, system-ui, sans-serif';

function ArrowRight({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <img
      src="https://qclay.design/lovable/synex/arrow-down.svg"
      alt=""
      className={className}
      style={{ transform: "rotate(-90deg)" }}
    />
  );
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

/**
 * Single morphing card. Visually lives in WealthIntelligence middle column
 * (tracking #morph-anchor) at p=0, then morphs to a centered 423×532 card with
 * new content during the CapitalSignals scroll range.
 *
 * Anchors required in the page:
 *   #morph-anchor             — invisible spacer in WI middle column (aspect-[4/3])
 *   #morph-scroll-target      — the CapitalSignals tall scroll section
 */
export default function MorphingCard() {
  const [anchor, setAnchor] = useState<Rect | null>(null);
  const [viewport, setViewport] = useState({ w: 0, h: 0 });
  const sectionBottomRef = useRef(0);

  // Track anchor rect (in viewport coords) and viewport size, rAF-throttled
  useEffect(() => {
    let rafId = 0;
    let pending = false;
    const apply = () => {
      pending = false;
      const el = document.getElementById("morph-anchor");
      if (el) {
        const r = el.getBoundingClientRect();
        setAnchor((prev) => {
          if (
            prev &&
            Math.abs(prev.top - r.top) < 0.5 &&
            Math.abs(prev.left - r.left) < 0.5 &&
            Math.abs(prev.width - r.width) < 0.5 &&
            Math.abs(prev.height - r.height) < 0.5
          )
            return prev;
          return { top: r.top, left: r.left, width: r.width, height: r.height };
        });
      }
      const sec = document.getElementById("morph-scroll-target");
      if (sec) {
        sectionBottomRef.current = sec.getBoundingClientRect().bottom;
      }
      setViewport((prev) => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        if (prev.w === w && prev.h === h) return prev;
        return { w, h };
      });
    };
    const update = () => {
      if (pending) return;
      pending = true;
      rafId = requestAnimationFrame(apply);
    };
    apply();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    const ro = new ResizeObserver(update);
    const el = document.getElementById("morph-anchor");
    if (el) ro.observe(el);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      ro.disconnect();
    };
  }, []);

  // Scroll progress across the CapitalSignals tall section
  const scrollTargetRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    scrollTargetRef.current = document.getElementById(
      "morph-scroll-target",
    ) as HTMLElement | null;
  }, []);

  const { scrollYProgress } = useScroll({
    target: scrollTargetRef as React.RefObject<HTMLElement>,
    offset: ["start end", "end end"],
  });
  const p = useSpring(scrollYProgress, { stiffness: 60, damping: 28, mass: 0.5 });

  // Morph progress 0→1 across phase (scaled for 115vh section)
  const morph = useTransform(p, [0.026, 0.248], [0, 1]);
  const cardVisibility = useTransform(p, (v) => (v > 0.001 ? 1 : 0));

  // Hide the source green card in section 2 the moment the morph card appears
  useEffect(() => {
    const anchorEl = document.getElementById("morph-anchor");
    if (!anchorEl) return;
    const unsub = cardVisibility.on("change", (v) => {
      anchorEl.style.opacity = v > 0.5 ? "0" : "1";
      anchorEl.style.transition = "opacity 80ms linear";
    });
    return () => {
      unsub();
      anchorEl.style.opacity = "";
    };
  }, [cardVisibility]);
  const oldOverlayOpacity = useTransform(p, [0.0, 0.065, 0.339], [0, 1, 0]);
  const contentOpacity = useTransform(p, [0.274, 0.443], [0, 1]);
  const tooltipOpacity = useTransform(p, [0.391, 0.535], [0, 1]);
  const tooltipLeftX = useTransform(p, [0.391, 0.535], [-30, 0]);
  const tooltipRightX = useTransform(p, [0.391, 0.535], [30, 0]);
  // Pointer-driven 3D tilt
  const rxRaw = useMotionValue(0);
  const ryRaw = useMotionValue(0);
  const rotateX = useSpring(rxRaw, { stiffness: 140, damping: 18, mass: 0.4 });
  const rotateY = useSpring(ryRaw, { stiffness: 140, damping: 18, mass: 0.4 });
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handle = (e: PointerEvent) => {
      const el = cardRef.current;
      if (!el) return;
      // Only react once the morph is fully complete (card lives in section 3)
      if (morph.get() < 0.98) {
        rxRaw.set(0);
        ryRaw.set(0);
        return;
      }
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = (e.clientX - cx) / (r.width / 2);
      const dy = (e.clientY - cy) / (r.height / 2);
      if (Math.abs(dx) > 1.4 || Math.abs(dy) > 1.4) {
        rxRaw.set(0);
        ryRaw.set(0);
        return;
      }
      rxRaw.set(-dy * 12);
      ryRaw.set(dx * 14);
    };
    const leave = () => {
      rxRaw.set(0);
      ryRaw.set(0);
    };
    window.addEventListener("pointermove", handle);
    window.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", handle);
      window.removeEventListener("pointerleave", leave);
    };
  }, [rxRaw, ryRaw, morph]);

  // Compute size/position by interpolating between anchor rect and centered big card
  const BIG_W = 423;
  const BIG_H = 532;

  const width = useTransform(morph, (m) => {
    if (!anchor) return BIG_W;
    return anchor.width + (BIG_W - anchor.width) * m;
  });
  const height = useTransform(morph, (m) => {
    if (!anchor) return BIG_H;
    return anchor.height + (BIG_H - anchor.height) * m;
  });
  const top = useTransform(p, (pv) => {
    if (!anchor) return viewport.h / 2 - BIG_H / 2;
    const m = Math.min(1, Math.max(0, (pv - 0.026) / (0.248 - 0.026)));
    // Once the section has scrolled past the morph endpoint, follow it so the
    // card stays anchored to the third section instead of sticking to viewport.
    const scrollPast = Math.max(0, viewport.h - sectionBottomRef.current);
    const targetTop = viewport.h / 2 - BIG_H / 2 - scrollPast;
    return anchor.top + (targetTop - anchor.top) * m;
  });
  const left = useTransform(morph, (m) => {
    if (!anchor) return viewport.w / 2 - BIG_W / 2;
    const targetLeft = viewport.w / 2 - BIG_W / 2;
    return anchor.left + (targetLeft - anchor.left) * m;
  });
  const borderRadius = useTransform(morph, [0, 1], [16, 24]);

  // Hide entirely if we don't yet know the anchor (prevents flash at 0,0)
  if (!anchor) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[1]"
      style={{ perspective: 1600 }}
    >
      <motion.div
        ref={cardRef}
        style={{
          rotateX,
          rotateY,
          scale: viewport.w < 640 ? 0.58 : 1,
          opacity: cardVisibility,
          transformStyle: "preserve-3d",
          transformPerspective: 1600,
          position: "absolute",
          top,
          left,
          width,
          height,
        }}
        className="flex items-center justify-center"
      >
        {/* Morphing card */}
        <motion.div
          style={{
            width: "100%",
            height: "100%",
            borderRadius,
            transformStyle: "preserve-3d",
          }}
          className="relative overflow-hidden"
        >
          <img
            src="https://qclay.design/lovable/synex/greenCard.png"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: "none", boxShadow: "none" }}
            draggable={false}
          />
          {/* OLD source overlay — dark vertical gradient, fades out */}
          <motion.div
            style={{
              opacity: oldOverlayOpacity,
              background:
                "linear-gradient(to top, rgb(0,0,0) 0%, rgb(0,0,0) 30%, rgba(0,0,0,0.8) 55%, transparent 100%)",
            }}
            className="absolute inset-0 pointer-events-none"
          />
          {/* NEW left-to-right black fade */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              opacity: contentOpacity,
              background:
                "linear-gradient(270deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.85) 100%)",
            }}
          />

          {/* New content */}
          <motion.div
            style={{ opacity: contentOpacity }}
            className="relative w-full h-full text-white"
          >
            <div className="absolute left-1/2 -translate-x-1/2 bottom-[184px] w-[85%] flex flex-col items-stretch gap-[20px]">
              <div
                className="flex items-center gap-[10px] w-full"
                style={{ transform: "translateY(45px)" }}
              >
                <span
                  className="block rounded-full shrink-0"
                  style={{ width: 10, height: 10, background: "#EAFF62" }}
                />
                <span
                  className="text-white"
                  style={{ fontFamily: FONT, fontWeight: 500, fontSize: 16 }}
                >
                  Portfolio signal strength
                </span>
                <img
                  src="https://qclay.design/lovable/synex/info-circle.svg"
                  alt=""
                  className="w-5 h-5 opacity-70 ml-auto"
                  style={{ filter: "brightness(0) invert(1)" }}
                />
              </div>
              <img src="https://qclay.design/lovable/synex/group87.svg" alt="" className="w-full h-auto" />
            </div>
            <div className="absolute left-[22px] right-[22px] bottom-[24px]">
              {[
                "High volitatity",
                "Rebalance exposure",
                "Captured opportunity",
                "Increase position in high-growth assets",
              ].map((label, i) => (
                <div key={label}>
                  <div className="flex items-center gap-3 py-[2px]">
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span
                      className="text-white text-[14px] leading-4"
                      style={{ fontFamily: FONT, fontWeight: 500 }}
                    >
                      {label}
                    </span>
                  </div>
                  {i < 3 && (
                    <div
                      className="border-t border-dashed border-white/25"
                      style={{ marginTop: 6, marginBottom: 6 }}
                    />
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Floating "+$12,840" tooltip */}
        <motion.div
          style={{
            opacity: tooltipOpacity,
            x: tooltipLeftX,
            width: 250,
            height: 137,
            left: "calc(50% - 305px)",
            top: "calc(50% - 200px)",
          }}
          className="absolute z-20 rounded-2xl bg-white/70 backdrop-blur-2xl outline outline-1 outline-white/40 overflow-hidden shadow-[0_20px_50px_-20px_rgba(0,0,0,0.25)]"
        >
          <CapturedOpportunityCard />
        </motion.div>

        {/* Floating "Risk alert" tooltip */}
        <motion.div
          style={{
            opacity: tooltipOpacity,
            x: tooltipRightX,
            width: 208,
            height: 100,
            left: "calc(50% + 170px)",
            top: "calc(50% + 80px)",
          }}
          className="absolute z-20 rounded-2xl bg-zinc-400/80 backdrop-blur-xl outline outline-1 outline-white/20 overflow-hidden p-[5px] pt-2 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.35)]"
        >
          <div className="px-3 mb-1.5">
            <span
              className="text-white text-[14px]"
              style={{ fontFamily: FONT, fontWeight: 500 }}
            >
              Risk alert
            </span>
          </div>
          <div className="bg-white rounded-2xl px-4 py-2">
            <p
              className="text-black/70 text-[12px] leading-4"
              style={{ fontFamily: FONT, fontWeight: 500 }}
            >
              High volitatity detected in emerging markets
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

function CapturedOpportunityCard() {
  return (
    <div className="relative p-3.5 pb-3">
      <div className="flex items-start justify-between">
        <span
          className="text-black text-[28px] leading-none"
          style={{ fontFamily: FONT, fontWeight: 500 }}
        >
          +$12,840
        </span>
        <img src="https://qclay.design/lovable/synex/info-circle.svg" alt="" className="w-5 h-5" />
      </div>
      <div
        className="text-black/50 text-[14px] mt-2"
        style={{ fontFamily: FONT, fontWeight: 400 }}
      >
        Captured opportunity
      </div>
      <button
        type="button"
        className="mt-3 w-full h-10 px-4 bg-black rounded-full flex items-center justify-between"
      >
        <span
          className="text-white text-[13px]"
          style={{ fontFamily: FONT, fontWeight: 500 }}
        >
          View insight
        </span>
        <div className="flex items-center gap-2">
          <span className="block w-px h-4 bg-white/20" />
          <img
            src="https://qclay.design/lovable/synex/arrow-down.svg"
            alt=""
            className="w-3.5 h-3.5"
            style={{ transform: "rotate(-90deg)" }}
          />
        </div>
      </button>
    </div>
  );
}
