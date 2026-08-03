import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

/** Strategy ticker card — the crypto-dashboard card pattern restyled for
 *  QSigma: live NAV with signed 24h chip, interactive area chart with
 *  gradient fill, glow, crosshair + tooltip, and a stats grid underneath.
 *  Series tick forward on an interval so the cards feel live. */

const MOSS = "#5F7052";
const CLAY = "#C25E5E";
const FONT = '"Inter Tight", Inter, system-ui, sans-serif';

const N = 90;
const W = 400;
const H = 150;
const PAD = { top: 12, right: 12, bottom: 10, left: 44 };

export interface StrategyTickerProps {
  name: string;
  category: string;
  risk: string;
  annualReturn: string;
  vsBenchmark: string;
  sharpe: string;
  minimum: string;
  aum: string;
  flow30d: string;
  seed: number;
  drift: number;
  vol: number;
  onSubscribe?: () => void;
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

const fmt = (v: number) =>
  v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function StrategyTicker({
  name,
  category,
  risk,
  annualReturn,
  vsBenchmark,
  sharpe,
  minimum,
  aum,
  flow30d,
  seed,
  drift,
  vol,
  onSubscribe,
}: StrategyTickerProps) {
  const [data, setData] = useState<number[]>(() => buildSeries(seed, drift, vol));
  const [hover, setHover] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Live tick — advance the series a step every few seconds
  useEffect(() => {
    const id = setInterval(() => {
      setData((prev) => {
        const last = prev[prev.length - 1];
        const next = Math.max(40, last * (1 + drift + (Math.random() - 0.5) * vol));
        return [...prev.slice(1), next];
      });
    }, 2500);
    return () => clearInterval(id);
  }, [drift, vol]);

  const { minV, maxV, points, dPath } = useMemo(() => {
    const minV = Math.min(...data);
    const maxV = Math.max(...data);
    const range = maxV - minV || 1;
    const innerW = W - PAD.left - PAD.right;
    const innerH = H - PAD.top - PAD.bottom;
    const points = data.map(
      (v, i) =>
        [
          PAD.left + (i / (N - 1)) * innerW,
          PAD.top + (1 - (v - minV) / range) * innerH,
        ] as const
    );
    const dPath = points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`)
      .join(" ");
    return { minV, maxV, points, dPath };
  }, [data]);

  const last = data[N - 1];
  const prior = data[N - 24];
  const change = last - prior;
  const pct = (change / prior) * 100;
  const up = change >= 0;
  const hue = up ? MOSS : CLAY;
  const gradId = `tick-grad-${seed}`;

  const onMove = (e: React.PointerEvent) => {
    const r = svgRef.current?.getBoundingClientRect();
    if (!r) return;
    const px = ((e.clientX - r.left) / r.width) * W;
    const innerW = W - PAD.left - PAD.right;
    const idx = Math.round(((px - PAD.left) / innerW) * (N - 1));
    setHover(idx >= 0 && idx <= N - 1 ? idx : null);
  };

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");

  const gridVals = [maxV, (maxV + minV) / 2, minV];

  return (
    <article
      className="group flex h-full flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(5,5,12,0.10)]"
      style={{
        fontFamily: FONT,
        backgroundColor: "#FFFFFF",
        border: "1px solid rgba(0, 0, 0, 0.07)",
        borderRadius: "16px",
        padding: "22px",
      }}
    >
      {/* Header: identity left, NAV right */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[13px] font-bold text-white"
            style={{
              background: "linear-gradient(135deg, #7A8B68 0%, #4C5A40 100%)",
              letterSpacing: "0.5px",
            }}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-[16px] font-semibold" style={{ color: "#05050C" }}>
              {name}
            </h3>
            <p className="mt-0.5 flex items-center gap-2 text-[12px] font-medium" style={{ color: "rgba(0,0,0,0.45)" }}>
              {category}
              <span
                className="rounded-full border px-2 py-[2px] text-[10px] font-semibold uppercase tracking-wide"
                style={{ borderColor: "rgba(0,0,0,0.12)", color: "rgba(0,0,0,0.55)" }}
              >
                {risk}
              </span>
            </p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="flex items-center justify-end gap-1.5">
            <span className="relative flex h-2 w-2">
              <span
                className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
                style={{ backgroundColor: MOSS }}
              />
              <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: MOSS }} />
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "rgba(0,0,0,0.40)" }}>
              Live NAV
            </span>
          </div>
          <div className="mt-0.5 text-[18px] font-bold tabular-nums" style={{ color: "#05050C" }}>
            {fmt(last)}
          </div>
          <div className="mt-0.5 flex items-center justify-end gap-1 text-[12px] font-semibold tabular-nums" style={{ color: hue }}>
            <span>{up ? "↗" : "↘"}</span>
            {up ? "+" : ""}
            {pct.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Chart */}
      <div
        className="relative mt-4 overflow-hidden rounded-lg"
        style={{ border: "1px solid rgba(0,0,0,0.05)", background: "linear-gradient(180deg, #FCFCFB 0%, #FFFFFF 100%)" }}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="block w-full h-auto cursor-crosshair touch-none"
          onPointerMove={onMove}
          onPointerLeave={() => setHover(null)}
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={hue} stopOpacity="0.28" />
              <stop offset="55%" stopColor={hue} stopOpacity="0.08" />
              <stop offset="100%" stopColor={hue} stopOpacity="0" />
            </linearGradient>
            <filter id={`glow-${seed}`}>
              <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {gridVals.map((gv, i) => {
            const y = PAD.top + (1 - (gv - minV) / (maxV - minV || 1)) * (H - PAD.top - PAD.bottom);
            return (
              <g key={i}>
                <line
                  x1={PAD.left}
                  x2={W - PAD.right}
                  y1={y}
                  y2={y}
                  stroke="rgba(0,0,0,0.05)"
                  strokeDasharray="2 4"
                />
                <text
                  x={PAD.left - 8}
                  y={y + 3}
                  textAnchor="end"
                  fontSize={8.5}
                  fill="rgba(0,0,0,0.35)"
                >
                  {gv.toFixed(0)}
                </text>
              </g>
            );
          })}

          <path d={`${dPath} L ${W - PAD.right} ${H - PAD.bottom} L ${PAD.left} ${H - PAD.bottom} Z`} fill={`url(#${gradId})`} />
          <path d={dPath} fill="none" stroke={hue} strokeWidth={2.2} filter={`url(#glow-${seed})`} strokeLinecap="round" strokeLinejoin="round" />

          {hover != null && points[hover] && (
            <g pointerEvents="none">
              <line
                x1={points[hover][0]}
                y1={PAD.top}
                x2={points[hover][0]}
                y2={H - PAD.bottom}
                stroke="rgba(0,0,0,0.20)"
                strokeDasharray="4 4"
              />
              <circle cx={points[hover][0]} cy={points[hover][1]} r={4.5} fill="#FFFFFF" stroke={hue} strokeWidth={2.5} />
            </g>
          )}
        </svg>

        {hover != null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            className="pointer-events-none absolute z-10 min-w-[110px] rounded-lg px-2.5 py-1.5"
            style={{
              top: 8,
              left: `${Math.max(16, Math.min(72, (points[hover][0] / W) * 100))}%`,
              transform: "translateX(-50%)",
              background: "#FFFFFF",
              border: "1px solid rgba(0,0,0,0.07)",
              boxShadow: "0 8px 24px rgba(5,5,12,0.14)",
            }}
            role="status"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-[10px] font-medium" style={{ color: "rgba(0,0,0,0.50)" }}>NAV</span>
              <span className="text-[11px] font-bold tabular-nums" style={{ color: "#05050C" }}>{fmt(data[hover])}</span>
            </div>
            <div className="mt-0.5 flex items-center justify-between gap-3">
              <span className="text-[10px] font-medium" style={{ color: "rgba(0,0,0,0.50)" }}>Bar</span>
              <span className="text-[10px] tabular-nums" style={{ color: "rgba(0,0,0,0.60)" }}>{hover + 1}/{N}</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Stats grid */}
      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
        {[
          { l: "Annualized", v: annualReturn, accent: true },
          { l: "Sharpe", v: sharpe },
          { l: "AUM", v: aum },
          { l: "30d net flow", v: flow30d },
        ].map((m) => (
          <div key={m.l}>
            <div className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "rgba(0,0,0,0.40)" }}>
              {m.l}
            </div>
            <div
              className="mt-0.5 text-[13px] font-bold tabular-nums"
              style={{ color: m.accent ? MOSS : "#05050C" }}
            >
              {m.v}
            </div>
          </div>
        ))}
      </div>

      <div
        className="mt-4 flex items-center justify-between pt-3 text-[12px] font-medium"
        style={{ borderTop: "1px solid rgba(0,0,0,0.07)", color: "rgba(0,0,0,0.45)" }}
      >
        <span>{vsBenchmark}</span>
        <span>From {minimum}</span>
      </div>

      <button
        onClick={onSubscribe}
        className="mt-4 w-full transition-colors duration-200 hover:bg-[#333333]"
        style={{
          backgroundColor: "#111111",
          color: "#FFFFFF",
          fontFamily: "inherit",
          fontWeight: 600,
          fontSize: "13px",
          borderRadius: "9999px",
          border: "none",
          padding: "12px 20px",
          cursor: "pointer",
        }}
      >
        Subscribe
      </button>
    </article>
  );
}
