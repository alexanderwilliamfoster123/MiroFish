import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const FONT = '"Inter Tight", Inter, system-ui, sans-serif';

type Item = { id: string; icon: string };

const INITIAL_ITEMS: Item[] = [
  { id: "pointpay", icon: "https://qclay.design/lovable/synex/pointpay.svg" },
  { id: "binance", icon: "https://qclay.design/lovable/synex/binance.svg" },
  { id: "fox", icon: "https://qclay.design/lovable/synex/fox.svg" },
  { id: "shield", icon: "https://qclay.design/lovable/synex/shield.svg" },
  { id: "core", icon: "https://qclay.design/lovable/synex/coreBG.png" }, // CENTER
  { id: "kukoin", icon: "https://qclay.design/lovable/synex/kukoin.svg" },
  { id: "71", icon: "https://qclay.design/lovable/synex/71.svg" },
  { id: "S", icon: "https://qclay.design/lovable/synex/S.svg" },
  { id: "bitcoinshield", icon: "https://qclay.design/lovable/synex/bitcoinshield.svg" },
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
            {"Seamlessly connected".split(" ").map((w, i) => (
              <RevealWord key={`h1-${i}`} text={w} delay={0.15 + i * 0.08} />
            ))}
            <br />
            {"to your financial ecosystem".split(" ").map((w, i) => (
              <RevealWord key={`h2-${i}`} text={w} delay={0.15 + (2 + i) * 0.08} />
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
                {/* Icon layer — fades out when slot becomes center */}
                <motion.img
                  src={item.icon}
                  alt={item.id}
                  animate={{ opacity: isCenter ? 0 : 1 }}
                  transition={
                    isWrapping
                      ? { duration: 0 }
                      : { duration: 0.5, ease: "easeInOut" }
                  }
                  className="absolute inset-0 m-auto w-1/2 h-1/2 object-contain"
                />
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

        {/* Bottom text */}
        <div className="mt-[60px] flex flex-col items-center text-center">
          <p className="text-black text-lg font-medium">
            {"30+ integrations. Real-time sync. Zero fragmentation."
              .split(" ")
              .map((w, i) => (
                <RevealWord key={`b1-${i}`} text={w} delay={i * 0.06} />
              ))}
          </p>
          <p className="mt-[15px] max-w-[475px] text-black/30 text-lg font-medium">
            {"Connect exchanges, custodians, on-chain wallets, and data providers — all synchronized in one unified system for real-time visibility and control."
              .split(" ")
              .map((w, i) => (
                <RevealWord key={`b2-${i}`} text={w} delay={0.2 + i * 0.04} />
              ))}
          </p>
        </div>
      </div>
    </section>
  );
}

function RevealWord({ text, delay = 0 }: { text: string; delay?: number }) {
  return (
    <span style={{ display: "inline-block", overflow: "hidden" }}>
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
