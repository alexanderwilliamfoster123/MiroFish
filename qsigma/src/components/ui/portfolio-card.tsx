import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

/** Portfolio card — accent-typed header, description, live ticking area
 *  chart, CAGR/volatility/max-drawdown metric bars, and a Sharpe /
 *  benchmark / history row. QSigma light palette. */

const FONT = '"Inter Tight", Inter, system-ui, sans-serif';
const DD_COLOR = "#A85C50";
const VOL_COLOR = "#9A9A97";

const N = 90;
const W = 400;
const H = 130;
const PAD = { top: 10, right: 10, bottom: 8, left: 40 };

// Bar normalization ceilings (so relative lengths read like the reference)
const CAGR_MAX = 35;
const VOL_MAX = 20;
const DD_MAX = 22;

export interface PortfolioCardProps {
  name: string;
  kind: string;
  description: string;
  accent: string;
  cagr: number;
  volatility: number;
  maxDrawdown: number;
  sharpe: string;
  benchmark: string;
  history: string;
  seed: number;
  drift: number;
  vol: number;
  cta?: string;
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

function MetricBar({
  label,
  value,
  display,
  max,
  color,
}: {
  label: string;
  value: number;
  display: string;
  max: number;
  color: string;
}) {
  const pct = Math.min(100, (Math.abs(value) / max) * 100);
  return (
    <div className="grid items-center gap-3" style={{ gridTemplateColumns: "92px 1fr 64px" }}>
      <div
        className="text-[10px] font-semibold uppercase leading-tight tracking-wide"
        style={{ color: "rgba(0,0,0,0.40)" }}
      >
        {label}
      </div>
      <div className="h-[5px] w-full overflow-hidden rounded-full" style={{ backgroundColor: "rgba(0,0,0,0.07)" }}>
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        />
      </div>
      <div className="text-right text-[13px] font-bold tabular-nums" style={{ color: "#05050C" }}>
        {display}
      </div>
    </div>
  );
}

export default function PortfolioCard({
  name,
  kind,
  description,
  accent,
  cagr,
  volatility,
  maxDrawdown,
  sharpe,
  benchmark,
  history,
  seed,
  drift,
  vol,
  cta = "Subscribe",
  onSubscribe,
}: PortfolioCardProps) {
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
  const gradId = `pf-grad-${seed}`;

  const onMove = (e: React.PointerEvent) => {
    const r = svgRef.current?.getBoundingClientRect();
    if (!r) return;
    const px = ((e.clientX - r.left) / r.width) * W;
    const innerW = W - PAD.left - PAD.right;
    const idx = Math.round(((px - PAD.left) / innerW) * (N - 1));
    setHover(idx >= 0 && idx <= N - 1 ? idx : null);
  };

  return (
    <article
      className="group flex h-full flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(5,5,12,0.10)]"
      style={{
        fontFamily: FONT,
        backgroundColor: "#FFFFFF",
        border: "1px solid rgba(0, 0, 0, 0.07)",
        borderRadius: "16px",
        padding: "24px",
      }}
    >
      {/* Type + live NAV */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: accent }} />
          <span className="text-[13px] font-medium" style={{ color: "rgba(0,0,0,0.50)" }}>
            {kind}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="relative flex h-2 w-2">
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
              style={{ backgroundColor: accent }}
            />
            <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: accent }} />
          </span>
          <span className="text-[12px] font-bold tabular-nums" style={{ color: "#05050C" }}>
            {fmt(last)}
          </span>
        </div>
      </div>

      <h3 className="mt-2 text-[22px]" style={{ fontWeight: 600, color: "#05050C", letterSpacing: "-0.4px" }}>
        {name}
      </h3>

      <p
        className="mt-2 text-[14px] leading-[1.55]"
        style={{ fontWeight: 500, color: "rgba(0,0,0,0.45)" }}
      >
        {description}
      </p>

      {/* Live chart */}
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
              <stop offset="0%" stopColor={accent} stopOpacity="0.28" />
              <stop offset="60%" stopColor={accent} stopOpacity="0.07" />
              <stop offset="100%" stopColor={accent} stopOpacity="0" />
            </linearGradient>
          </defs>
          {[maxV, (maxV + minV) / 2, minV].map((gv, i) => {
            const y = PAD.top + (1 - (gv - minV) / (maxV - minV || 1)) * (H - PAD.top - PAD.bottom);
            return (
              <g key={i}>
                <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y} stroke="rgba(0,0,0,0.05)" strokeDasharray="2 4" />
                <text x={PAD.left - 7} y={y + 3} textAnchor="end" fontSize={8} fill="rgba(0,0,0,0.35)">
                  {gv.toFixed(0)}
                </text>
              </g>
            );
          })}
          <path d={`${dPath} L ${W - PAD.right} ${H - PAD.bottom} L ${PAD.left} ${H - PAD.bottom} Z`} fill={`url(#${gradId})`} />
          <path d={dPath} fill="none" stroke={accent} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
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
              <circle cx={points[hover][0]} cy={points[hover][1]} r={4} fill="#FFFFFF" stroke={accent} strokeWidth={2.5} />
            </g>
          )}
        </svg>
        {hover != null && (
          <div
            className="pointer-events-none absolute z-10 rounded-md px-2 py-1 text-[11px] font-bold tabular-nums"
            style={{
              top: 6,
              left: `${Math.max(14, Math.min(80, (points[hover][0] / W) * 100))}%`,
              transform: "translateX(-50%)",
              background: "#FFFFFF",
              border: "1px solid rgba(0,0,0,0.07)",
              boxShadow: "0 8px 24px rgba(5,5,12,0.14)",
              color: "#05050C",
            }}
            role="status"
          >
            {fmt(data[hover])}
          </div>
        )}
      </div>

      {/* Metric bars */}
      <div className="mt-5 flex flex-col gap-3" style={{ borderTop: "1px solid rgba(0,0,0,0.07)", paddingTop: "16px" }}>
        <MetricBar label="CAGR" value={cagr} display={`${cagr.toFixed(1)}%`} max={CAGR_MAX} color={accent} />
        <MetricBar label="Volatility" value={volatility} display={`${volatility.toFixed(1)}%`} max={VOL_MAX} color={VOL_COLOR} />
        <MetricBar label="Max drawdown" value={maxDrawdown} display={`${maxDrawdown.toFixed(1)}%`} max={DD_MAX} color={DD_COLOR} />
      </div>

      {/* Sharpe / benchmark / history */}
      <div
        className="mt-4 grid grid-cols-3 gap-3"
        style={{ borderTop: "1px solid rgba(0,0,0,0.07)", paddingTop: "14px" }}
      >
        {[
          { l: "Sharpe", v: sharpe },
          { l: "Benchmark", v: benchmark },
          { l: "History", v: history },
        ].map((m) => (
          <div key={m.l}>
            <div className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "rgba(0,0,0,0.40)" }}>
              {m.l}
            </div>
            <div className="mt-0.5 text-[13px] font-bold tabular-nums" style={{ color: "#05050C" }}>
              {m.v}
            </div>
          </div>
        ))}
      </div>

      <div className="h-5" style={{ marginTop: "auto" }} />
      <button
        onClick={onSubscribe}
        className="w-full transition-colors duration-200 hover:bg-[#333333]"
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
        {cta}
      </button>
    </article>
  );
}
