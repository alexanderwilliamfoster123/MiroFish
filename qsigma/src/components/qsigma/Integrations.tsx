import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const FONT = '"Inter Tight", Inter, system-ui, sans-serif';

// SnapTrade brokerage integrations (https://snaptrade.com/brokerage-integrations)
// name + brand-colored logo mark (glyph)
const SNAPTRADE_BROKERAGES = [
  { name: "AJ Bell", color: "#C8102E", glyph: "AJ" },
  { name: "Alpaca", color: "#F2C218", glyph: "A" },
  { name: "Binance", color: "#F3BA2F", glyph: "B" },
  { name: "BUX", color: "#111111", glyph: "BX" },
  { name: "Chase", color: "#117ACA", glyph: "Ch" },
  { name: "Citi", color: "#1D66DD", glyph: "C" },
  { name: "Coinbase", color: "#0052FF", glyph: "C" },
  { name: "Commsec", color: "#E3B505", glyph: "CS" },
  { name: "DEGIRO", color: "#009EE2", glyph: "D" },
  { name: "E*TRADE", color: "#6633CC", glyph: "E" },
  { name: "Edward Jones", color: "#D9A400", glyph: "EJ" },
  { name: "Empower", color: "#C8102E", glyph: "Em" },
  { name: "eToro", color: "#13C636", glyph: "e" },
  { name: "Fidelity", color: "#568203", glyph: "F" },
  { name: "Interactive Brokers", color: "#D91222", glyph: "IB" },
  { name: "Kraken", color: "#5741D9", glyph: "K" },
  { name: "Moomoo", color: "#FF6907", glyph: "M" },
  { name: "PNC", color: "#F58025", glyph: "P" },
  { name: "Public", color: "#3D3DF5", glyph: "Pb" },
  { name: "Questrade", color: "#00A950", glyph: "Q" },
  { name: "Robinhood", color: "#00C805", glyph: "R" },
  { name: "Schwab", color: "#009CDE", glyph: "S" },
  { name: "Stake AUS", color: "#111111", glyph: "St" },
  { name: "tastytrade", color: "#E31837", glyph: "t" },
  { name: "TD Direct Investing", color: "#54B948", glyph: "TD" },
  { name: "TIAA", color: "#005EB8", glyph: "T" },
  { name: "TradeStation", color: "#0075E2", glyph: "TS" },
  { name: "Tradier", color: "#7A4CE0", glyph: "Tr" },
  { name: "Trading 212", color: "#00A7E1", glyph: "T2" },
  { name: "Transamerica", color: "#E4002B", glyph: "Ta" },
  { name: "Vanguard", color: "#96151D", glyph: "V" },
  { name: "Wealthsimple", color: "#111111", glyph: "W" },
  { name: "Webull", color: "#0B7CFF", glyph: "Wb" },
];

type Item = { id: string; short: string; color: string };

// Arc carousel cycles through the major SnapTrade brokerages
const INITIAL_ITEMS: Item[] = [
  { id: "robinhood", short: "R", color: "#00C805" },
  { id: "fidelity", short: "F", color: "#568203" },
  { id: "schwab", short: "S", color: "#009CDE" },
  { id: "ibkr", short: "IB", color: "#D91222" },
  { id: "core", short: "", color: "" }, // CENTER
  { id: "chase", short: "Ch", color: "#117ACA" },
  { id: "coinbase", short: "C", color: "#0052FF" },
  { id: "binance", short: "B", color: "#F3BA2F" },
  { id: "etrade", short: "E", color: "#6633CC" },
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
                  className="absolute inset-0 flex items-center justify-center font-bold"
                  style={{
                    fontFamily: FONT,
                    fontSize: 18,
                    letterSpacing: "-0.5px",
                    color: item.color || "#111",
                  }}
                >
                  {item.short}
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

        {/* Full SnapTrade brokerage marquee */}
        <div className="relative mt-[50px] overflow-hidden" aria-label="Supported brokerages">
          <div
            className="pointer-events-none absolute inset-y-0 left-0 w-24 z-10"
            style={{ background: "linear-gradient(to right, #FFFFFF, rgba(255,255,255,0))" }}
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-24 z-10"
            style={{ background: "linear-gradient(to left, #FFFFFF, rgba(255,255,255,0))" }}
          />
          <div className="marquee-track flex w-max items-center gap-3">
            {[...SNAPTRADE_BROKERAGES, ...SNAPTRADE_BROKERAGES].map((b, i) => (
              <span
                key={`${b.name}-${i}`}
                className="flex items-center gap-2.5 whitespace-nowrap rounded-full border border-black/10 bg-white py-1.5 pl-1.5 pr-4 text-[13px] font-medium text-black/70 shadow-sm"
                style={{ fontFamily: FONT }}
              >
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-bold text-white"
                  style={{ backgroundColor: b.color }}
                >
                  {b.glyph}
                </span>
                {b.name}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom text */}
        <div className="mt-[50px] flex flex-col items-center text-center">
          <p className="text-black text-lg font-medium">
            {"30+ brokerages. Real-time sync. Zero fragmentation."
              .split(" ")
              .map((w, i) => (
                <RevealWord key={`b1-${i}`} text={w} delay={i * 0.06} />
              ))}
          </p>
          <p className="mt-[15px] max-w-[475px] text-black/30 text-lg font-medium">
            {"Connect Robinhood, Fidelity, Schwab, Chase, Citi, Interactive Brokers, Coinbase, and every other major brokerage. Trades execute in your own account — synchronized in real time."
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
