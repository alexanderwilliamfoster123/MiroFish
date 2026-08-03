import { useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

/** SMA Chart — moving-average view: one price line with its fast and slow
 *  moving averages overlaid, right-edge price ticks, crosshair scrubbing
 *  with a three-series tooltip, and the summary row underneath — price left,
 *  signed change chip right. Adapted to the QSigma light palette. */

const EASE = [0.16, 1, 0.3, 1] as const;
const MOSS = "#5F7052";
const AMBER = "#C9A25E";
const GREEN = "#34a06a";
const RED = "#cf5f5f";
const INK = "rgba(5, 5, 12, 0.8)";
const SURFACE = "#FFFFFF";

const N = 120;
const W = 400;
const H = 190;
const PAD = { r: 48 };

interface SmaChartProps {
  /** Deterministic seed so every strategy gets its own distinct series */
  seed?: number;
  /** Per-bar upward drift (sets how strongly the series trends up) */
  drift?: number;
  /** Per-bar volatility */
  vol?: number;
  /** Ticker-style label + subtitle for the header row */
  label?: string;
  sublabel?: string;
}

function buildSeries(seed: number, drift: number, vol: number) {
  let s = seed;
  let v = 100;
  const out: number[] = [];
  for (let i = 0; i < N; i++) {
    s = (s * 16807) % 2147483647;
    v = Math.max(40, v * (1 + drift + (s / 2147483647 - 0.5) * vol));
    out.push(v);
  }
  return out;
}

const smaOf = (price: number[], win: number) =>
  price.map((_, i) => {
    const from = Math.max(0, i - win + 1);
    const slice = price.slice(from, i + 1);
    return slice.reduce((a, b) => a + b, 0) / slice.length;
  });

export default function SmaChart({
  seed = 61,
  drift = 0.006,
  vol = 0.03,
  label,
  sublabel,
}: SmaChartProps) {
  const reduced = useReducedMotion();
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  const { PRICE, SMA_FAST, SMA_SLOW, MIN, MAX } = useMemo(() => {
    const PRICE = buildSeries(seed, drift, vol);
    const SMA_FAST = smaOf(PRICE, 14);
    const SMA_SLOW = smaOf(PRICE, 45);
    const all = [...PRICE, ...SMA_FAST, ...SMA_SLOW];
    return { PRICE, SMA_FAST, SMA_SLOW, MIN: Math.min(...all), MAX: Math.max(...all) };
  }, [seed, drift, vol]);

  const x = (i: number) => (i / (N - 1)) * (W - PAD.r);
  const y = (v: number) => 8 + (1 - (v - MIN) / (MAX - MIN)) * (H - 16);
  const path = (d: number[]) =>
    d.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");

  const last = PRICE[N - 1];
  const change = last - PRICE[N - 30];
  const pct = (change / PRICE[N - 30]) * 100;
  const up = change >= 0;
  const hue = up ? GREEN : RED;

  const onMove = (e: React.PointerEvent) => {
    const r = svgRef.current?.getBoundingClientRect();
    if (!r) return;
    const px = ((e.clientX - r.left) / r.width) * W;
    setHover(Math.max(0, Math.min(N - 1, Math.round((px / (W - PAD.r)) * (N - 1)))));
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <span>
          {label && <span className="text-[12.5px] font-semibold" style={{ color: "rgba(5,5,12,0.9)" }}>{label}</span>}
          {sublabel && <span className="ml-2 text-[11px]" style={{ color: "rgba(0,0,0,0.40)" }}>{sublabel}</span>}
        </span>
        <span className="flex items-center gap-3 text-[10px]" style={{ color: "rgba(0,0,0,0.45)" }}>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: MOSS }} /> 60 SMA
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: AMBER }} /> 200 SMA
          </span>
        </span>
      </div>

      <div className="relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="mt-2 block w-full h-auto cursor-crosshair touch-none"
          onPointerMove={onMove}
          onPointerLeave={() => setHover(null)}
        >
          {/* right-edge price ticks */}
          {[MAX, MAX - (MAX - MIN) * 0.25, MAX - (MAX - MIN) * 0.5, MAX - (MAX - MIN) * 0.75, MIN].map((v, i) => (
            <g key={i}>
              <line x1={0} y1={y(v)} x2={W - PAD.r} y2={y(v)} stroke="rgba(0,0,0,0.05)" />
              <text x={W - PAD.r + 8} y={y(v) + 3} fontSize={8.5} fill="rgba(0,0,0,0.35)">
                {v.toFixed(2)}
              </text>
            </g>
          ))}

          {/* overlays first, price on top */}
          <motion.path
            d={path(SMA_SLOW)}
            fill="none"
            stroke={AMBER}
            strokeOpacity={0.75}
            strokeWidth={1.1}
            initial={{ pathLength: reduced ? 1 : 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={reduced ? { duration: 0 } : { duration: 1, ease: EASE, delay: 0.25 }}
          />
          <motion.path
            d={path(SMA_FAST)}
            fill="none"
            stroke={MOSS}
            strokeOpacity={0.8}
            strokeWidth={1.1}
            initial={{ pathLength: reduced ? 1 : 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={reduced ? { duration: 0 } : { duration: 1, ease: EASE, delay: 0.15 }}
          />
          <motion.path
            d={path(PRICE)}
            fill="none"
            stroke={INK}
            strokeWidth={1.2}
            initial={{ pathLength: reduced ? 1 : 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={reduced ? { duration: 0 } : { duration: 1, ease: EASE }}
          />
          {/* crosshair + series dots */}
          {hover != null && (
            <g pointerEvents="none">
              <line x1={x(hover)} y1={8} x2={x(hover)} y2={H - 8} stroke="rgba(0,0,0,0.16)" strokeWidth={1} />
              <circle cx={x(hover)} cy={y(PRICE[hover])} r={2.8} fill="#05050C" stroke={SURFACE} strokeWidth={1.4} />
              <circle cx={x(hover)} cy={y(SMA_FAST[hover])} r={2.4} fill={MOSS} stroke={SURFACE} strokeWidth={1.2} />
              <circle cx={x(hover)} cy={y(SMA_SLOW[hover])} r={2.4} fill={AMBER} stroke={SURFACE} strokeWidth={1.2} />
            </g>
          )}
        </svg>

        {/* tooltip — price + both averages at the hovered bar */}
        {hover != null && (
          <div
            className="pointer-events-none absolute top-3 z-10 min-w-[132px] rounded-lg px-2.5 py-1.5"
            style={{
              left: `${Math.max(18, Math.min(74, (x(hover) / W) * 100))}%`,
              transform: "translateX(-50%)",
              background: SURFACE,
              border: "1px solid rgba(0,0,0,0.07)",
              boxShadow: "0 8px 24px rgba(5, 5, 12, 0.14)",
            }}
            role="status"
          >
            <div className="text-[9px] tabular-nums" style={{ color: "rgba(0,0,0,0.35)" }}>
              bar {hover + 1} / {N}
            </div>
            <div className="mt-1 flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-[3px] rounded-full" style={{ background: "rgba(5,5,12,0.7)" }} />
                <span className="text-[10px]" style={{ color: "rgba(0,0,0,0.55)" }}>Price</span>
              </span>
              <span className="tabular-nums text-[10px]" style={{ color: "rgba(5,5,12,0.85)" }}>${PRICE[hover].toFixed(2)}</span>
            </div>
            <div className="mt-0.5 flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-[3px] rounded-full" style={{ background: MOSS }} />
                <span className="text-[10px]" style={{ color: "rgba(0,0,0,0.55)" }}>60 SMA</span>
              </span>
              <span className="tabular-nums text-[10px]" style={{ color: "rgba(5,5,12,0.85)" }}>${SMA_FAST[hover].toFixed(2)}</span>
            </div>
            <div className="mt-0.5 flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-[3px] rounded-full" style={{ background: AMBER }} />
                <span className="text-[10px]" style={{ color: "rgba(0,0,0,0.55)" }}>200 SMA</span>
              </span>
              <span className="tabular-nums text-[10px]" style={{ color: "rgba(5,5,12,0.85)" }}>${SMA_SLOW[hover].toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>

      {/* summary row */}
      <div className="mt-2 flex items-center justify-between pt-2.5" style={{ borderTop: "1px solid rgba(0,0,0,0.05)" }}>
        <span className="text-[13px] font-semibold tabular-nums" style={{ color: "rgba(5,5,12,0.9)" }}>
          ${last.toFixed(2)}
        </span>
        <span className="flex items-center gap-2">
          <span className="text-[11px] tabular-nums" style={{ color: hue }}>
            {up ? "+" : "−"}${Math.abs(change).toFixed(2)}
          </span>
          <span
            className="rounded-md px-2 py-0.5 text-[10.5px] tabular-nums"
            style={{ color: hue, background: up ? "rgba(52,160,106,0.12)" : "rgba(207,95,95,0.12)" }}
          >
            {up ? "+" : "−"}
            {Math.abs(pct).toFixed(2)}%
          </span>
        </span>
      </div>
    </div>
  );
}

export { SmaChart as Component };
