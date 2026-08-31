import MorphingCard from "./MorphingCard";
import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

/** Fade/slide in once when scrolled into view. */
function FadeIn({
  children,
  delay = 0,
  duration = 0.6,
  y = 8,
  className,
  style,
  as: As = "div",
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
  y?: number;
  className?: string;
  style?: CSSProperties;
  as?: any;
}) {
  const MotionTag = (motion as any)[As] ?? motion.div;
  return (
    <MotionTag
      className={className}
      style={style}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </MotionTag>
  );
}

/** Animate a numeric value once when it enters viewport.
 *  Preserves prefix (e.g. "$ ", "+", "-") and suffix (e.g. "%", " USD"). */
function CountUp({
  value,
  duration = 1.4,
  delay = 0,
  className,
  style,
}: {
  value: string;
  duration?: number;
  delay?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const [display, setDisplay] = useState("");

  const match = value.match(/^(\D*)([\d,.\s]+)(.*)$/);
  const prefix = match?.[1] ?? "";
  const numRaw = match?.[2] ?? "0";
  const suffix = match?.[3] ?? "";
  const target = parseFloat(numRaw.replace(/[\s,]/g, ""));
  const decimals = (numRaw.split(".")[1] || "").length;
  const hasComma = /,/.test(numRaw);

  const format = (n: number) => {
    const fixed = n.toFixed(decimals);
    if (!hasComma) return fixed;
    const [intPart, decPart] = fixed.split(".");
    const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return decPart ? `${withCommas}.${decPart}` : withCommas;
  };

  useEffect(() => {
    if (!inView || isNaN(target)) {
      if (isNaN(target)) setDisplay(value);
      return;
    }
    let raf = 0;
    let start = 0;
    const startTime = performance.now() + delay * 1000;
    const tick = (now: number) => {
      if (now < startTime) {
        setDisplay(`${prefix}${format(0)}${suffix}`);
        raf = requestAnimationFrame(tick);
        return;
      }
      if (!start) start = now;
      const t = Math.min(1, (now - startTime) / (duration * 1000));
      const eased = 1 - Math.pow(1 - t, 3);
      const current = target * eased;
      setDisplay(`${prefix}${format(current)}${suffix}`);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, target, duration, delay]);

  return (
    <span ref={ref} className={className} style={style}>
      {display || `${prefix}${format(0)}${suffix}`}
    </span>
  );
}

function WordsReveal({
  text,
  className,
  style,
  delay = 0,
  stagger = 0.06,
}: {
  text: string;
  className?: string;
  style?: CSSProperties;
  delay?: number;
  stagger?: number;
}) {
  const words = text.split(" ");
  return (
    <span className={className} style={style}>
      {words.map((w, i) => (
        <span key={i} style={{ display: "inline-block", overflow: "hidden", paddingTop: "0.08em", paddingBottom: "0.15em" }}>
          <motion.span
            style={{ display: "inline-block", willChange: "transform, filter, opacity" }}
            initial={{ opacity: 0, filter: "blur(12px)", y: "0.4em" }}
            whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, delay: delay + i * stagger, ease: [0.22, 1, 0.36, 1] }}
          >
            {w}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

const FONT = '"Satoshi", "Satoshi", "Inter Tight", system-ui, sans-serif';

interface CardProps {
  image: string;
  gradient: string;
  children: ReactNode;
  /** If set, the image area becomes an invisible anchor with this DOM id (used by MorphingCard) */
  imageAnchorId?: string;
  /** Top offset of the UI overlay card as a percentage string (default "28%") */
  overlayTop?: string;
  hideOverlayTopBorder?: boolean;
}

function Card({ image, gradient, children, imageAnchorId, overlayTop = "28%", hideOverlayTopBorder = false }: CardProps) {
  return (
    <div className="relative w-full">
      {/* Layer 1: square background image — slightly wider than UI card */}
      <div
        id={imageAnchorId}
        className={`relative w-full aspect-[4/3] rounded-2xl overflow-hidden ${imageAnchorId ? "" : "border border-black/10"}`}
      >
        <img src={image} alt="" className="absolute inset-0 w-full h-full object-cover" />
      </div>
      {/* Layer 2: rectangular UI card overlay — narrower, pushed down, overflows bottom by ~25% */}
      <div
        className={`absolute left-1/2 -translate-x-1/2 rounded-2xl overflow-hidden z-[20] ${
          hideOverlayTopBorder
            ? "w-[88%] h-[410px] backdrop-blur-sm border-x border-b border-white/15 shadow-[0_110px_90px_-30px_rgba(0,0,0,0.75)]"
            : "w-[90%] h-[420px] backdrop-blur-xl border border-white/15 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.45)]"
        }`}
        style={{
          background: gradient,
          top: overlayTop,
          borderTopWidth: hideOverlayTopBorder ? 0 : undefined,
        }}
      >
        {children}
      </div>
      {/* Spacer so the overflowing UI card contributes to layout height */}
      <div style={{ height: "28%" }} />
    </div>
  );
}

function CardHeader({
  icon,
  title,
  right,
  iconClassName,
}: {
  icon: string;
  title: string;
  right?: ReactNode;
  iconClassName?: string;
}) {
  return (
    <div className="flex items-center justify-between px-5 pt-5">
      <div className="flex items-center gap-2">
        <img src={icon} alt="" className={iconClassName ?? "w-[18px] h-[18px] opacity-60"} />
        <span
          className="text-white text-[15px]"
          style={{ fontFamily: FONT, fontWeight: 500 }}
        >
          {title}
        </span>
      </div>
      {right}
    </div>
  );
}

export default function WealthIntelligence() {
  return (
    <section
      className="relative z-10 bg-white text-black"
      style={{ fontFamily: FONT }}
    >
      <div className="mx-auto pt-24 pb-32" style={{ paddingLeft: 50, paddingRight: 50 }}>
        {/* Eyebrow */}
        <div style={{ marginBottom: 20 }}>
          <motion.span
            className="inline-block rounded-md border border-black/15 px-3 py-1.5 text-[11px] tracking-[0.12em] uppercase text-black/60"
            style={{ fontFamily: FONT, fontWeight: 500, transformOrigin: "left center" }}
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            Wealth Intelligence
          </motion.span>
        </div>

        <div className="border-t border-black/10" />

        {/* Title + description */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20" style={{ marginTop: 30 }}>
          <h2
            className="lg:col-span-8"
            style={{
              fontFamily: FONT,
              fontWeight: 500,
              fontSize: "clamp(36px, 4.5vw, 64px)",
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
            }}
          >
            <WordsReveal
              text="Clarity and control for"
              style={{ color: "rgba(0,0,0,0.2)" }}
            />{" "}
            <WordsReveal
              className="block"
              text="every part of your portfolio"
              delay={0.3}
            />
          </h2>
          <p
            className="lg:col-span-4 lg:pl-8 text-[15px] leading-[1.5]"
            style={{ fontFamily: FONT, fontWeight: 400, color: "rgba(0,0,0,0.2)", marginTop: 70 }}
          >
            <WordsReveal
              text="Get a clear, structured view of your capital — from asset allocation to performance insights and future opportunities."
              stagger={0.04}
            />
          </p>
        </div>

        {/* 3 columns text */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10" style={{ marginBottom: 40 }}>
          {[
            {
              n: "[ 1 ]",
              t: "Total asset visibility",
              d: "Every position, every movement — clearly structured in one system. Get a unified view of your entire portfolio across all assets and accounts.",
            },
            {
              n: "[ 2 ]",
              t: "Precision performance tracking",
              d: "Advanced analytics to monitor growth, volatility, and efficiency. Analyze performance with deeper insights across timeframes.",
            },
            {
              n: "[ 3 ]",
              t: "Global allocation intelligence",
              d: "Real-time global capital distribution and opportunity mapping. Track flows, regional exposure, and emerging opportunities — all in one structured view.",
            },
          ].map((c, idx) => (
            <motion.div
              key={c.n}
              initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, delay: idx * 0.18, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="text-[12px] text-black/60" style={{ fontFamily: FONT, fontWeight: 500, marginBottom: 20 }}>
                {c.n}
              </div>
              <h3
                className="text-[16px] mb-3"
                style={{ fontFamily: FONT, fontWeight: 500 }}
              >
                {c.t}
              </h3>
              <p
                className="text-[14px] leading-[1.5]"
                style={{ fontFamily: FONT, fontWeight: 400, color: "rgba(0,0,0,0.2)" }}
              >
                {c.d}
              </p>
            </motion.div>
          ))}
        </div>

        {/* 3 visual cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-72 md:gap-6 items-start">
          {/* Card 1: Portfolio Overview */}
          <Card
            image="https://qclay.design/lovable/synex/blueCard.png"
            gradient="linear-gradient(180deg, rgba(134,151,189,0.55) 0%, rgba(0,22,70,0.65) 50%, rgba(134,151,189,0.55) 100%)"
          >
            <CardHeader
              icon="https://qclay.design/lovable/synex/candle.svg"
              title="Portfolio Overview"
              right={<img src="https://qclay.design/lovable/synex/groupDot.svg" alt="" className="h-2 w-auto opacity-90" />}
            />
            {/* dashed divider — 20px below header text */}
            <div className="mx-5 border-t border-dashed border-white/20" style={{ marginTop: 20 }} />

            {/* metrics — 20px below divider */}
            <div className="px-5 flex items-center justify-between text-white" style={{ marginTop: 20 }}>
              {[
                { l: "Total Value", v: "$35,200" },
                { l: "Portfolio Change", v: "+3,567.99" },
                { l: "Total Accounts", v: "28" },
              ].map((m, i) => (
                <div key={m.l} className="flex items-center flex-1">
                  {i > 0 && <span className="w-px h-6 bg-white/20 mr-3" />}
                  <FadeIn delay={0.1 + i * 0.08}>
                    <div className="text-[10px] text-white/60" style={{ fontFamily: FONT }}>
                      {m.l}
                    </div>
                    <CountUp
                      value={m.v}
                      delay={0.2 + i * 0.08}
                      className="text-[14px] mt-0.5 block"
                      style={{ fontFamily: FONT, fontWeight: 500 }}
                    />
                  </FadeIn>
                </div>
              ))}
            </div>

            {/* chart */}
            <div className="px-5 mt-4 h-[140px] flex items-center justify-center overflow-hidden">
              <img src="https://qclay.design/lovable/synex/FirstCardGroup.svg" alt="" className="w-full h-full object-contain" />
            </div>

            {/* bottom list — dashed dividers between rows only */}
            <div
              className="absolute left-5 right-5 bottom-4 text-white text-[12px]"
              style={{ fontFamily: FONT }}
            >
              {[
                { l: "Stock", v: "$105.00 USD" },
                { l: "Crypto", v: "$53.00 USD" },
                { l: "Cash", v: "$23.00 USD" },
              ].map((r, i) => (
                <FadeIn
                  key={r.l}
                  delay={0.5 + i * 0.1}
                  as="div"
                  className={
                    i > 0
                      ? "flex justify-between border-t border-dashed border-white/20"
                      : "flex justify-between"
                  }
                  style={{
                    paddingTop: i > 0 ? 10 : 0,
                    paddingBottom: i < 2 ? 10 : 0,
                  }}
                >
                  <span className="text-white/70">{r.l}</span>
                  <CountUp value={r.v} delay={0.6 + i * 0.1} />
                </FadeIn>
              ))}
            </div>
          </Card>

          {/* Card 2: Performance — middle column (the greenCard.png here is the visual "source" for the morph in CapitalSignals) */}
          <Card
            image="https://qclay.design/lovable/synex/greenCard.png"
            gradient="linear-gradient(to top, rgb(0,0,0) 0%, rgb(0,0,0) 30%, rgba(0,0,0,0.8) 55%, transparent 100%)"
            imageAnchorId="morph-anchor"
            overlayTop="28%"
            hideOverlayTopBorder
          >
            <CardHeader
              icon="https://qclay.design/lovable/synex/zap-1.svg"
              iconClassName="w-[18px] h-[18px] opacity-60 invert"
              title="Performance"
              right={
                <div className="flex items-center gap-2">
                  <button
                    className="flex items-center gap-1.5 rounded-full bg-transparent border border-white/25 text-white text-[11px]"
                    style={{
                      fontFamily: FONT,
                      fontWeight: 500,
                      padding: "8px 10px",
                    }}
                  >
                    Last Week
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                      <polygon
                        points="0,1 8,1 4,7"
                        fill="currentColor"
                        strokeLinejoin="round"
                        stroke="currentColor"
                        strokeWidth="1"
                      />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="rounded-full bg-transparent border border-white/25 flex items-center justify-center text-white p-2"
                    aria-label="More"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="5" r="1" />
                      <circle cx="12" cy="12" r="1" />
                      <circle cx="12" cy="19" r="1" />
                    </svg>
                  </button>
                </div>
              }
            />

            {/* Bottom-anchored block: 27.4% and everything below */}
            <div className="absolute left-0 right-0 bottom-5">
              <div className="px-5 flex items-baseline gap-2 text-white">
                <CountUp
                  value="27.4%"
                  delay={0.1}
                  duration={1.6}
                  style={{ fontFamily: FONT, fontWeight: 500, fontSize: 54, letterSpacing: "-0.03em", lineHeight: 1 }}
                />
                <img src="https://qclay.design/lovable/synex/Stroke.svg" alt="" className="w-5 h-3" />
              </div>

              <FadeIn delay={0.3} className="px-5 text-white" style={{ marginTop: 20 }}>
                <div className="text-[14px]" style={{ fontFamily: FONT, fontWeight: 500 }}>
                  Precision Data Insights
                </div>
                <div className="text-[11px] text-white/60 mt-1 leading-[1.5]" style={{ fontFamily: FONT }}>
                  Evaluate market volatility and performance drivers with deep-dive analytics across any selected period.
                </div>
              </FadeIn>

              <div className="mx-5 border-t border-dashed border-white/30" style={{ marginTop: 20 }} />

              <div className="px-5 grid grid-cols-3 gap-2 text-white" style={{ marginTop: 20 }}>
                {[
                  { l: "Growth", v: "+12%", filter: undefined },
                  { l: "Volatility Index", v: "-3.1", filter: "brown" as const },
                  { l: "Efficiency Ratio", v: "+8%", filter: undefined },
                ].map((m, i) => (
                  <FadeIn key={m.l} delay={0.55 + i * 0.1}>
                    <div className="text-[10px] text-white/50" style={{ fontFamily: FONT }}>
                      {m.l}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <CountUp
                        value={m.v}
                        delay={0.65 + i * 0.1}
                        className="text-[14px]"
                        style={{ fontFamily: FONT, fontWeight: 500 }}
                      />
                      <img
                        src="https://qclay.design/lovable/synex/Stroke.svg"
                        alt=""
                        className="w-3.5 h-2"
                        style={
                          m.filter === "brown"
                            ? {
                                filter:
                                  "brightness(0) saturate(100%) invert(45%) sepia(58%) saturate(900%) hue-rotate(5deg) brightness(95%) contrast(90%)",
                              }
                            : undefined
                        }
                      />
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>
          </Card>

          {/* Card 3: Global Capital Flow */}
          <Card
            image="https://qclay.design/lovable/synex/brownCard.png"
            gradient="linear-gradient(180deg, rgba(135,117,93,0.55) 0%, rgba(69,52,30,0.7) 50%, rgba(135,117,93,0.55) 100%)"
          >
            <CardHeader
              icon="https://qclay.design/lovable/synex/global.svg"
              iconClassName="w-[18px] h-[18px] brightness-0 invert opacity-60"
              title="Global capital flow"
              right={<img src="https://qclay.design/lovable/synex/groupDot.svg" alt="" className="h-2 w-auto opacity-90" />}
            />
            <div className="px-5 mt-5 text-white relative z-10 flex flex-col">
              <CountUp
                value="$ 52,480,000"
                delay={0.1}
                duration={1.8}
                className="block whitespace-nowrap"
                style={{
                  fontFamily: FONT,
                  fontWeight: 500,
                  fontSize: 28,
                  lineHeight: "38px",
                  letterSpacing: "-0.02em",
                }}
              />
              {/* solid divider under price */}
              <div className="border-t border-white/25" style={{ marginTop: 14 }} />
              {/* label — 10px below divider */}
              <FadeIn delay={0.45} className="flex items-center gap-2" style={{ marginTop: 10 }}>
                <span
                  className="inline-block w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: "#FF8E3D" }}
                />
                <span className="text-[11px] text-white/70 uppercase tracking-wider whitespace-nowrap" style={{ fontFamily: FONT }}>
                  Total allocated capital
                </span>
              </FadeIn>
            </div>

            {/* Map anchored low, capped so it can never ride up into the price block */}
            <div
              className="absolute inset-x-0 flex justify-center pointer-events-none px-5 z-0"
              style={{ bottom: 24, maxHeight: "52%", overflow: "hidden", alignItems: "flex-end" }}
            >
              <img src="https://qclay.design/lovable/synex/Union.svg" alt="" className="w-full opacity-90" />
            </div>
          </Card>
        </div>
      </div>

      {/* Morphing card lives inside WI's z-10 stacking context so it can be
          sandwiched between the empty image anchor and the Performance overlay (z-20) */}
      <MorphingCard />
    </section>
  );
}
