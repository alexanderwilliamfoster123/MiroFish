import { motion, motionValue, type MotionValue, useAnimationFrame } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";

const FONT = '"Inter Tight", Inter, system-ui, sans-serif';

// Node positions as % of container (x, y), with float amplitudes in px and phase
type NodeDef = {
  id: string;
  x: number; // %
  y: number; // %
  ampX: number; // px
  ampY: number; // px
  phase: number;
  speed: number;
};

const NODES: NodeDef[] = [
  { id: "core", x: 50, y: 50, ampX: 12, ampY: 12, phase: 0, speed: 0.6 },
  { id: "ai", x: 14, y: 55, ampX: 16, ampY: 18, phase: 1.2, speed: 0.5 },
  { id: "web3", x: 82, y: 18, ampX: 18, ampY: 16, phase: 2.4, speed: 0.55 },
  { id: "data", x: 87, y: 78, ampX: 16, ampY: 20, phase: 3.1, speed: 0.45 },
  { id: "trad", x: 24, y: 86, ampX: 16, ampY: 16, phase: 4.0, speed: 0.5 },
  // empty anchor cubes
  { id: "a1", x: 19, y: 32, ampX: 14, ampY: 14, phase: 0.8, speed: 0.7 }, // above AI
  { id: "a2", x: 65, y: 10, ampX: 14, ampY: 14, phase: 2.0, speed: 0.6 }, // left+above Web3
  { id: "a3", x: 75, y: 96, ampX: 14, ampY: 14, phase: 3.5, speed: 0.65 }, // below+left of Data
];

// Edges as per spec
const EDGES: { a: string; b: string; dashed?: boolean }[] = [
  // solid
  { a: "core", b: "ai" },
  { a: "core", b: "web3" },
  { a: "core", b: "data" },
  { a: "web3", b: "data" },
  { a: "data", b: "trad" },
  // dashed
  { a: "core", b: "trad", dashed: true },
  { a: "ai", b: "trad", dashed: true },
  { a: "ai", b: "a1", dashed: true },
  { a: "web3", b: "a2", dashed: true },
  { a: "data", b: "a3", dashed: true },
];

export default function IntelligenceLayers() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [startedAt, setStartedAt] = useState<number | null>(null);

  // One pair of motion values per node (in px, relative to container) + opacity
  const mvs = useRef(
    NODES.map(() => ({ x: motionValue(0), y: motionValue(0), o: motionValue(0) })),
  ).current;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      setSize({ w: r.width, h: r.height });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Trigger the "fly out from center" entrance once the graph scrolls into view
  useEffect(() => {
    const el = containerRef.current;
    if (!el || startedAt !== null) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setStartedAt(performance.now());
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [startedAt]);

  useAnimationFrame((t) => {
    const { w, h } = size;
    if (!w || !h) return;
    const sec = t / 1000;
    const cx = w / 2;
    const cy = h / 2;
    const ENTRY_DUR = 0.9; // seconds per node
    const STAGGER = 0.08;
    NODES.forEach((n, i) => {
      const baseX = (n.x / 100) * w;
      const baseY = (n.y / 100) * h;
      const floatX = baseX + Math.sin(sec * n.speed + n.phase) * n.ampX;
      const floatY = baseY + Math.cos(sec * n.speed + n.phase * 0.7) * n.ampY;

      let p = 0;
      if (startedAt !== null) {
        const elapsed = (performance.now() - startedAt) / 1000 - i * STAGGER;
        const raw = Math.max(0, Math.min(1, elapsed / ENTRY_DUR));
        p = 1 - Math.pow(1 - raw, 3); // easeOutCubic
      }

      mvs[i].x.set(cx + (floatX - cx) * p);
      mvs[i].y.set(cy + (floatY - cy) * p);
      mvs[i].o.set(p);
    });
  });

  const idIndex = Object.fromEntries(NODES.map((n, i) => [n.id, i]));

  return (
    <section className="relative w-full bg-white overflow-hidden">
      {/* Grid overlay with fading mask */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "url(https://qclay.design/lovable/synex/UnionNet.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 20%, transparent 70%)",
          maskImage:
            "radial-gradient(ellipse at center, black 20%, transparent 70%)",
        }}
      />

      <div className="relative max-w-[1366px] mx-auto px-6 md:px-12 pt-20 md:pt-28 pb-24">
        {/* Heading with green glow attached to the title */}
        <div
          className="relative"
          style={{ fontFamily: FONT, fontWeight: 400 }}
        >
          {/* Geoid-shaped green cloud behind the title */}
          <div
            aria-hidden="true"
            className="absolute pointer-events-none"
            style={{
              top: "-260px",
              left: "-360px",
              width: 1400,
              height: 900,
              zIndex: 0,
              opacity: 0.4,
              background:
                "radial-gradient(ellipse 50% 45% at 50% 50%, rgba(106,231,116,0.55) 0%, rgba(106,231,116,0.35) 35%, rgba(106,231,116,0.15) 60%, rgba(106,231,116,0) 80%)",
              filter: "blur(20px)",
            }}
          />
          <h2 className="relative z-10 text-4xl md:text-5xl leading-[1.15]">
            <span className="text-black/20">
              {"One platform.".split(" ").map((w, i) => (
                <RevealWord key={`a-${i}`} text={w} delay={i * 0.08} />
              ))}
            </span>
            <br />
            <span className="text-black">
              {"Multiple intelligence layers.".split(" ").map((w, i) => (
                <RevealWord key={`b-${i}`} text={w} delay={(2 + i) * 0.08} />
              ))}
            </span>
          </h2>
        </div>

        {/* Graph — flat, no perspective/tilt; life comes from float only */}
        <div className="relative mt-10 md:mt-12">
          <motion.div
            ref={containerRef}
            className="relative w-full"
            style={{ height: "min(70vw, 620px)" }}
          >
            {/* SVG lines */}
            {size.w > 0 && (
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                width={size.w}
                height={size.h}
              >
                {EDGES.map((e, i) => {
                  const ia = idIndex[e.a];
                  const ib = idIndex[e.b];
                  return (
                    <motion.line
                      key={i}
                      x1={mvs[ia].x}
                      y1={mvs[ia].y}
                      x2={mvs[ib].x}
                      y2={mvs[ib].y}
                      stroke="rgba(0,0,0,0.2)"
                      strokeWidth={1}
                      strokeDasharray={e.dashed ? "4 4" : undefined}
                    />
                  );
                })}
              </svg>
            )}

            {/* Nodes — each NodeWrap's origin is exactly (x,y); children
                position themselves relative to that origin. */}

            {/* Core */}
            <NodeWrap mv={mvs[idIndex.core]}>
              {/* focus.png frame, centered on origin (decorative, behind) */}
              <img
                src="https://qclay.design/lovable/synex/focus.png"
                alt=""
                className="absolute opacity-80 pointer-events-none max-w-none"
                style={{
                  width: 140,
                  height: 140,
                  left: -70,
                  top: -70,
                }}
              />
              {/* Ellipse with logo — geometric center sits exactly on origin */}
              <div
                className="absolute max-w-none"
                style={{ width: 36, height: 36, left: -18, top: -18 }}
              >
                <img
                  src="https://qclay.design/lovable/synex/Ellipse.svg"
                  alt=""
                  className="absolute inset-0 w-full h-full"
                />
                <img
                  src="https://qclay.design/lovable/synex/EllipseLogo.svg"
                  alt=""
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                  style={{ width: 14, height: 14 }}
                />
              </div>
              {/* QSIGMA CORE label above */}
              <span
                className="absolute -translate-x-1/2 whitespace-nowrap text-black text-[13px] tracking-wide"
                style={{
                  fontFamily: FONT,
                  fontWeight: 500,
                  left: 0,
                  top: -64,
                }}
              >
                QSIGMA CORE
              </span>
              {/* Description below */}
              <div
                className="absolute -translate-x-1/2 text-center whitespace-nowrap text-black/30 text-[12px] leading-[16px]"
                style={{ fontFamily: FONT, fontWeight: 500, left: 0, top: 50 }}
              >
                Unified capital system
                <br />
                AI-powered orchestration
                <br />
                Central intelligence layer
              </div>
            </NodeWrap>

            {/* AI Intelligence */}
            <NodeWrap mv={mvs[idIndex.ai]}>
              <img
                src="https://qclay.design/lovable/synex/AI.svg"
                alt=""
                className="absolute max-w-none"
                style={{ width: 23, height: 22, left: -11.5, top: -11 }}
              />
              <div
                className="absolute -translate-x-1/2 text-black/60 text-[13px] uppercase text-center leading-tight"
                style={{ fontFamily: FONT, fontWeight: 500, left: 0, top: 22 }}
              >
                AI
                <br />
                Intelligence
              </div>
            </NodeWrap>

            {/* Web3 */}
            <NodeWrap mv={mvs[idIndex.web3]}>
              <div
                className="absolute rounded-full"
                style={{
                  width: 22,
                  height: 22,
                  left: -11,
                  top: -11,
                  background: "linear-gradient(to bottom, #A8B3A0, #6B7558)",
                }}
              />
              <div
                className="absolute -translate-x-1/2 text-black/60 text-[13px] uppercase text-center leading-tight"
                style={{ fontFamily: FONT, fontWeight: 500, left: 0, top: 22 }}
              >
                Web3
                <br />
                Layer
              </div>
            </NodeWrap>

            {/* Data Infrastructure */}
            <NodeWrap mv={mvs[idIndex.data]}>
              <img
                src="https://qclay.design/lovable/synex/GreyWheel.svg"
                alt=""
                className="absolute max-w-none"
                style={{ width: 20, height: 20, left: -10, top: -10 }}
              />
              <div
                className="absolute -translate-x-1/2 text-black/60 text-[13px] uppercase text-center leading-tight"
                style={{ fontFamily: FONT, fontWeight: 500, left: 0, top: 20 }}
              >
                Data
                <br />
                Infrastructure
              </div>
            </NodeWrap>

            {/* Traditional Markets */}
            <NodeWrap mv={mvs[idIndex.trad]}>
              <img
                src="https://qclay.design/lovable/synex/cub.svg"
                alt=""
                className="absolute max-w-none"
                style={{ width: 26, height: 26, left: -13, top: -13 }}
              />
              <div
                className="absolute -translate-x-1/2 text-black/60 text-[13px] uppercase text-center leading-tight"
                style={{ fontFamily: FONT, fontWeight: 500, left: 0, top: 22 }}
              >
                Traditional
                <br />
                Markets
              </div>
            </NodeWrap>

            {/* Anchor cubes (empty endpoints for dashed lines) */}
            {(["a1", "a2", "a3"] as const).map((id) => (
              <NodeWrap key={id} mv={mvs[idIndex[id]]}>
                <img
                  src="https://qclay.design/lovable/synex/cub.svg"
                  alt=""
                  className="absolute max-w-none"
                  style={{
                    width: 16,
                    height: 16,
                    left: -8,
                    top: -8,
                    opacity: 0.6,
                  }}
                />
              </NodeWrap>
            ))}
          </motion.div>
        </div>

        {/* Core Capabilities — under the graph */}
        <div
          className="relative z-10 mt-24 grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-20 items-start"
          style={{ fontFamily: FONT }}
        >
          <div className="flex flex-col gap-4 max-w-md lg:col-span-2">
            <motion.div
              className="px-3 py-1.5 rounded-md border border-black/20 inline-flex w-fit"
              style={{ transformOrigin: "left center" }}
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="text-black/50 text-sm font-medium">CORE CAPABILITIES</span>
            </motion.div>
            <h3 className="text-black/75 text-4xl font-normal leading-[1.02]" style={{ fontFamily: FONT }}>
              {["Powering", "every"].map((w, i) => (
                <RevealWord key={`p1-${i}`} text={w} delay={i * 0.08} />
              ))}
              <br />
              {["layer", "of", "your", "capital"].map((w, i) => (
                <RevealWord key={`p2-${i}`} text={w} delay={(2 + i) * 0.08} />
              ))}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-7 border-l border-black/10 lg:col-span-3">
            {[
              {
                icon: "https://qclay.design/lovable/synex/global.svg",
                title: "Unified infrastructure",
                desc: "All financial layers connected into one structured system",
              },
              {
                icon: "https://qclay.design/lovable/synex/chart-2.svg",
                title: "Cross-market intelligence",
                desc: "Analyze and operate across Web3, traditional finance, and data systems",
              },
              {
                icon: "https://qclay.design/lovable/synex/zap-1.svg",
                title: "Seamless execution",
                desc: "From insight to action — everything happens in one environment.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                className={`flex flex-col gap-4 pl-7 ${i === 0 ? "" : "border-l border-black/10"}`}
                initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7, delay: i * 0.18, ease: [0.22, 1, 0.36, 1] }}
              >
                <img src={item.icon} alt="" className="w-5 h-5 max-w-none" />
                <div className="flex flex-col gap-3">
                  <div className="text-black text-lg font-semibold">{item.title}</div>
                  <p className="text-black/30 text-base font-medium">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function NodeWrap({
  mv,
  children,
}: {
  mv: { x: MotionValue<number>; y: MotionValue<number>; o: MotionValue<number> };
  children: ReactNode;
}) {
  return (
    <motion.div
      className="absolute top-0 left-0"
      style={{ x: mv.x, y: mv.y, opacity: mv.o, width: 0, height: 0 }}
    >
      {children}
    </motion.div>
  );
}

function RevealWord({ text, delay = 0 }: { text: string; delay?: number }) {
  return (
    <span style={{ display: "inline-block", overflow: "hidden", paddingBottom: "0.15em", paddingTop: "0.05em" }}>
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
