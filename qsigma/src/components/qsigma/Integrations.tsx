import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const FONT = '"Satoshi", "Satoshi", "Inter Tight", system-ui, sans-serif';
import { PublicMark, AlpacaMark, IbkrMark, PublicLogo, AlpacaLogo, IbkrLogo } from "./BrokerLogos";
import { scrollToId } from "@/lib/nav";

type Item = { id: string; brand: "public" | "alpaca" | "ibkr" | "core" };

// Arc carousel cycles the offered brokerages: Public.com, Alpaca, Interactive Brokers
const INITIAL_ITEMS: Item[] = [
  { id: "alpaca-1", brand: "alpaca" },
  { id: "public-1", brand: "public" },
  { id: "ibkr-1", brand: "ibkr" },
  { id: "alpaca-2", brand: "alpaca" },
  { id: "core", brand: "core" }, // CENTER
  { id: "public-2", brand: "public" },
  { id: "ibkr-2", brand: "ibkr" },
  { id: "alpaca-3", brand: "alpaca" },
  { id: "public-3", brand: "public" },
];

// Indices 0..8 map to slot positions -4..+4 relative to center (index 4).
// y is tuned to sit on the EllipseBorder arc.
const SLOTS = [
  { x: -531, y: 100, w: 50, h: 50, opacity: 1 },  // -4
  { x: -451, y: 55, w: 50, h: 50, opacity: 1 },   // -3
  { x: -361, y: 30, w: 58, h: 58, opacity: 1 },   // -2
  { x: -252, y: 10, w: 74, h: 74, opacity: 1 },   // -1
  { x: 0,    y: -10, w: 320, h: 80, opacity: 1 }, //  0 CENTER
  { x: 252,  y: 10, w: 74, h: 74, opacity: 1 },   // +1
  { x: 361,  y: 30, w: 58, h: 58, opacity: 1 },   // +2
  { x: 451,  y: 55, w: 50, h: 50, opacity: 1 },   // +3
  { x: 531,  y: 100, w: 50, h: 50, opacity: 1 },  // +4
];

const CENTER = 4;

export default function Integrations() {
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [wrappedId, setWrappedId] = useState<string | null>(null);
  const [exitingId, setExitingId] = useState<string | null>(null);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  useEffect(() => {
    const id = setInterval(() => {
      // Phase 1: start exit animation for the leftmost item
      setExitingId(itemsRef.current[0].id);
      // Phase 2: after exit completes, rotate (wrapped item teleports to right and slides in)
      setTimeout(() => {
        setItems((prev) => {
          const wrapped = prev[0];
          setWrappedId(wrapped.id);
          setExitingId(null);
          return [...prev.slice(1), wrapped];
        });
      }, 800);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative w-full bg-white overflow-hidden">
      {/* Bottom fade to #BCBCBC — short, solid at very bottom, fully transparent shortly above */}
      <div
        className="absolute inset-x-0 bottom-0 h-32 pointer-events-none z-30"
        aria-hidden="true"
        style={{
          background:
            "linear-gradient(to top, rgba(188,188,188,0.86) 0%, rgba(188,188,188,0.7) 25%, rgba(188,188,188,0) 100%)",
        }}
      />
      <div
        className="relative max-w-[1366px] mx-auto px-6 md:px-12 pt-20 md:pt-28 pb-24"
        style={{ fontFamily: FONT }}
      >
        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <motion.div
            className="px-3 py-1.5 rounded-md border border-black/20 bg-white"
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="text-black/50 text-sm font-medium">INTEGRATIONS</span>
          </motion.div>
          <h2 className="mt-[25px] text-4xl md:text-5xl font-medium leading-[1.15] text-black">
            {"Trade from the brokerage".split(" ").map((w, i) => (
              <RevealWord key={`h1-${i}`} text={w} delay={0.15 + i * 0.08} />
            ))}
            <br />
            {"you already use".split(" ").map((w, i) => (
              <RevealWord key={`h2-${i}`} text={w} delay={0.15 + (3 + i) * 0.08} />
            ))}
          </h2>
        </div>

        {/* Arc slider — center oval sits 70px below heading */}
        <div className="relative w-full max-w-[1200px] mx-auto h-[260px] mt-[70px] flex items-center justify-center">
          {/* Static arc background — top edge aligned to oval center line */}
          <img
            src="https://qclay.design/lovable/synex/EllipseShadow.png"
            alt=""
            aria-hidden="true"
            className="absolute left-0 right-0 top-1/2 w-full h-auto object-contain pointer-events-none z-0"
            style={{ transform: "translateY(-10px)" }}
          />
          <img
            src="https://qclay.design/lovable/synex/EllipseBorder.png"
            alt=""
            aria-hidden="true"
            className="absolute left-0 right-0 top-1/2 w-full h-auto object-contain pointer-events-none z-0"
            style={{ transform: "translateY(-10px)" }}
          />

          {/* Nodes — key MUST be item.id, NEVER index, so Framer Motion tracks movement */}
          {items.map((item, i) => {
            const slot = SLOTS[i];
            const isCenter = i === CENTER;
            const isWrapping = item.id === wrappedId;
            const isExiting = item.id === exitingId;
            return (
              <motion.div
                key={item.id}
                animate={
                  isExiting
                    ? {
                        x: slot.x - 120,
                        y: slot.y,
                        width: slot.w,
                        height: slot.h,
                        opacity: 0,
                        borderRadius: 9999,
                      }
                    : isWrapping
                    ? {
                        x: [slot.x + 120, slot.x],
                        opacity: [0, 1],
                        y: slot.y,
                        width: slot.w,
                        height: slot.h,
                        borderRadius: 9999,
                      }
                    : {
                        x: slot.x,
                        y: slot.y,
                        width: slot.w,
                        height: slot.h,
                        opacity: slot.opacity,
                        borderRadius: isCenter ? 40 : 9999,
                      }
                }
                transition={
                  isExiting
                    ? { duration: 0.8, ease: "easeIn" }
                    : isWrapping
                    ? {
                        // Snap size/position-Y instantly, slide X and fade in
                        y: { duration: 0 },
                        width: { duration: 0 },
                        height: { duration: 0 },
                        borderRadius: { duration: 0 },
                        x: { duration: 0.8, ease: "easeOut" },
                        opacity: { duration: 0.8, ease: "easeOut" },
                      }
                    : { duration: 0.8, ease: "easeInOut" }
                }
                className="absolute flex items-center justify-center overflow-hidden shadow-md bg-white pointer-events-none"
                style={{ zIndex: isCenter ? 20 : 10 }}
              >
                {/* Brokerage monogram — fades out when slot becomes center */}
                <motion.span
                  animate={{ opacity: isCenter ? 0 : 1 }}
                  transition={
                    isWrapping
                      ? { duration: 0 }
                      : { duration: 0.5, ease: "easeInOut" }
                  }
                  className="absolute inset-0 flex items-center justify-center"
                >
                  {item.brand === "public" ? (
                    <PublicMark size={26} />
                  ) : item.brand === "alpaca" ? (
                    <AlpacaMark size={30} />
                  ) : item.brand === "ibkr" ? (
                    <IbkrMark size={28} />
                  ) : null}
                </motion.span>
                {/* Core background layer — fades in when slot becomes center */}
                <motion.img
                  src="https://qclay.design/lovable/synex/coreBG.png"
                  alt=""
                  animate={{ opacity: isCenter ? 1 : 0 }}
                  transition={
                    isWrapping
                      ? { duration: 0 }
                      : { duration: 0.5, ease: "easeInOut" }
                  }
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </motion.div>
            );
          })}
        </div>

        {/* Offered brokerages */}
        <div className="mt-[50px] flex flex-wrap items-center justify-center gap-4" aria-label="Supported brokerages">
          <span className="flex items-center whitespace-nowrap rounded-full border border-black/10 bg-white px-7 py-3.5 shadow-sm">
            <PublicLogo height={26} />
          </span>
          <span className="flex items-center whitespace-nowrap rounded-full border border-black/10 bg-white px-7 py-3.5 shadow-sm">
            <AlpacaLogo height={26} />
          </span>
          <span className="flex items-center whitespace-nowrap rounded-full border border-black/10 bg-white px-7 py-3.5 shadow-sm">
            <IbkrLogo height={26} />
          </span>
        </div>

        {/* Bottom text */}
        <div className="mt-[50px] flex flex-col items-center text-center">
          <p className="text-black text-lg font-medium">
            {"Three trusted brokerages. Real-time sync. Zero fragmentation."
              .split(" ")
              .map((w, i) => (
                <RevealWord key={`b1-${i}`} text={w} delay={i * 0.06} />
              ))}
          </p>
          <p className="mt-[15px] max-w-[475px] text-black/30 text-lg font-medium">
            {"Connect Public.com, Alpaca, or Interactive Brokers. Every trade executes in your own brokerage account — synchronized in real time, never pooled."
              .split(" ")
              .map((w, i) => (
                <RevealWord key={`b2-${i}`} text={w} delay={0.2 + i * 0.04} />
              ))}
          </p>
          <motion.a
            href="#/"
            onClick={(e) => { e.preventDefault(); scrollToId("pricing"); }}
            className="relative z-40 mt-8 inline-block rounded-full bg-black px-6 py-3 text-[13px] font-semibold text-white transition-colors duration-200 hover:bg-zinc-800"
            style={{ fontFamily: FONT, textDecoration: "none" }}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            Connect your brokerage
          </motion.a>
        </div>
      </div>
    </section>
  );
}

function RevealWord({ text, delay = 0 }: { text: string; delay?: number }) {
  return (
    <span style={{ display: "inline-block", overflow: "hidden", paddingTop: "0.08em", paddingBottom: "0.15em" }}>
      <motion.span
        style={{ display: "inline-block", willChange: "transform, filter, opacity" }}
        initial={{ opacity: 0, filter: "blur(12px)", y: "0.4em" }}
        whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      >
        {text}&nbsp;
      </motion.span>
    </span>
  );
}
