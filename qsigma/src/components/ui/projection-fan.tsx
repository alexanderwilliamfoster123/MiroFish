import { useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

/** Projection fan — backtest history walks to "now", three projections fan
 *  out to conservative / expected / aggressive 12-month targets. Scrub the
 *  history or hover a target and a small card flips in beside the point.
 *  Adapted to the QSigma dark panel palette. */

const EASE = [0.16, 1, 0.3, 1] as const;

export interface FanTarget {
  key: string;
  value: number;
  color: string;
  sub: string;
}

interface ProjectionFanProps {
  /** Balance history ending exactly at `current` */
  history: number[];
  current: number;
  /** Sorted high → low; first and last bound the band */
  targets: FanTarget[];
  startLabel: string;
  endLabel: string;
  fmt: (v: number) => string;
}

const W = 760;
const H = 280;
const PAD = { l: 10, r: 148, t: 16, b: 26 };
const CARD_W = 148;

export default function ProjectionFan({
  history,
  current,
  targets,
  startLabel,
  endLabel,
  fmt,
}: ProjectionFanProps) {
  const reduced = useReducedMotion();
  const svgRef = useRef<SVGSVGElement>(null);
  const [scrub, setScrub] = useState<number | null>(null);
  const [hotT, setHotT] = useState<number | null>(null);

  const geo = useMemo(() => {
    const vals = [...history, ...targets.map((t) => t.value)];
    const yMin = Math.min(...vals) * 0.97;
    const yMax = Math.max(...vals) * 1.03;
    const y = (v: number) => PAD.t + (1 - (v - yMin) / (yMax - yMin || 1)) * (H - PAD.t - PAD.b);
    const histW = (W - PAD.l - PAD.r) * 0.58;
    const hx = (i: number) => PAD.l + (i / (history.length - 1)) * histW;
    const nowX = hx(history.length - 1);
    const nowY = y(current);
    const endX = W - PAD.r;
    const line = history.map((v, i) => `${i === 0 ? "M" : "L"}${hx(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
    const proj = targets.map((t) => {
      const ty = y(t.value);
      const cx = nowX + (endX - nowX) * 0.5;
      const cy = nowY + (ty - nowY) * 0.15;
      return { ...t, ty, d: `M${nowX},${nowY} Q${cx},${cy} ${endX},${ty}`, cx, cy };
    });
    const hi = proj[0];
    const lo = proj[proj.length - 1];
    const band = `M${nowX},${nowY} Q${hi.cx},${hi.cy} ${endX},${hi.ty} L${endX},${lo.ty} Q${lo.cx},${lo.cy} ${nowX},${nowY} Z`;
    return { y, hx, nowX, nowY, endX, line, proj, band };
  }, [history, current, targets]);

  const onMove = (e: React.PointerEvent) => {
    const el = svgRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    if (px > geo.nowX + 6) {
      setScrub(null);
      return;
    }
    const histW = geo.nowX - PAD.l;
    setScrub(Math.max(0, Math.min(history.length - 1, Math.round(((px - PAD.l) / histW) * (history.length - 1)))));
  };

  const overlay = (() => {
    if (hotT !== null) {
      const p = geo.proj[hotT];
      return { px: geo.endX, py: p.ty, value: fmt(p.value), context: `${p.key} · ${p.sub}`, color: p.color };
    }
    if (scrub !== null) {
      const ago = history.length - 1 - scrub;
      return {
        px: geo.hx(scrub),
        py: geo.y(history[scrub]),
        value: fmt(history[scrub]),
        context: ago === 0 ? "today" : `${ago} mo ago`,
        color: undefined as string | undefined,
      };
    }
    return null;
  })();

  return (
    <div className="relative w-full">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="block h-auto w-full cursor-crosshair touch-none"
        onPointerMove={onMove}
        onPointerLeave={() => setScrub(null)}
      >
        {/* gridlines */}
        {[0.22, 0.48, 0.74].map((t) => (
          <line key={t} x1={PAD.l} y1={H * t} x2={geo.endX} y2={H * t} stroke="rgba(255,255,255,0.06)" strokeDasharray="2 5" />
        ))}

        {/* time axis */}
        {[
          { x: geo.hx(0), t: startLabel, a: "start" as const },
          { x: geo.nowX, t: "Today", a: "middle" as const },
          { x: geo.endX, t: endLabel, a: "middle" as const },
        ].map((d) => (
          <text key={d.t} x={d.x} y={H - 6} textAnchor={d.a} fontSize={9} fill="rgba(255,255,255,0.35)">
            {d.t}
          </text>
        ))}

        {/* projection band */}
        <motion.path
          d={geo.band}
          fill="rgba(163,177,138,0.07)"
          initial={{ opacity: reduced ? 1 : 0 }}
          animate={{ opacity: hotT === null ? 1 : 0.25 }}
          transition={reduced ? { duration: 0 } : { duration: 0.5, ease: EASE, delay: 0.9 }}
        />

        {/* now marker */}
        <line x1={geo.nowX} y1={PAD.t} x2={geo.nowX} y2={H - PAD.b} stroke="rgba(255,255,255,0.14)" strokeWidth={1} strokeDasharray="3 3" />

        {/* history */}
        <motion.path
          d={geo.line}
          fill="none"
          stroke="rgba(255,255,255,0.80)"
          strokeWidth={1.6}
          vectorEffect="non-scaling-stroke"
          initial={{ opacity: reduced ? 1 : 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={reduced ? { duration: 0 } : { duration: 0.8, ease: EASE }}
        />

        {/* projections + labels */}
        {geo.proj.map((p, i) => {
          const on = hotT === i;
          const dim = hotT !== null && !on;
          return (
            <motion.g
              key={p.key}
              initial={{ opacity: reduced ? 1 : 0 }}
              whileInView={{ opacity: dim ? 0.26 : 1 }}
              viewport={{ once: true, amount: 0.4 }}
              animate={{ opacity: dim ? 0.26 : 1 }}
              transition={reduced ? { duration: 0 } : { duration: 0.5, ease: EASE, delay: 0.9 + i * 0.12 }}
              onMouseEnter={() => setHotT(i)}
              onMouseLeave={() => setHotT(null)}
              style={{ cursor: "default" }}
            >
              <path d={p.d} fill="none" stroke="transparent" strokeWidth={16} />
              <path
                d={p.d}
                fill="none"
                stroke={p.color}
                strokeWidth={on ? 2.2 : 1.4}
                strokeOpacity={on ? 1 : 0.75}
                strokeDasharray="2 4"
                vectorEffect="non-scaling-stroke"
              />
              <circle cx={geo.endX} cy={p.ty} r={on ? 4 : 3.2} fill="#05050C" stroke={p.color} strokeWidth={1.6} />
              <text x={geo.endX + 10} y={p.ty - 3} fontSize={8.5} fill="rgba(255,255,255,0.45)">
                {p.key}
              </text>
              <text x={geo.endX + 10} y={p.ty + 9} fontSize={11} fontWeight={600} fill={p.color} className="tabular-nums">
                {fmt(p.value)}
              </text>
            </motion.g>
          );
        })}

        {/* now dot */}
        <motion.circle
          cx={geo.nowX}
          cy={geo.nowY}
          r={3.4}
          fill="#FFFFFF"
          initial={{ opacity: reduced ? 1 : 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={reduced ? { duration: 0 } : { delay: 0.85 }}
        />

        {/* scrub crosshair */}
        {scrub !== null && (
          <g pointerEvents="none">
            <line x1={geo.hx(scrub)} y1={PAD.t} x2={geo.hx(scrub)} y2={H - PAD.b} stroke="rgba(255,255,255,0.25)" strokeWidth={1} />
            <circle cx={geo.hx(scrub)} cy={geo.y(history[scrub])} r={3.2} fill="#FFFFFF" stroke="#05050C" strokeWidth={1.5} />
          </g>
        )}
      </svg>

      {/* overlay card — value big, context muted */}
      {overlay && (
        <div
          className="pointer-events-none absolute z-10 rounded-lg px-2.5 py-1.5"
          style={{
            width: CARD_W,
            left: `${(Math.max(4, Math.min(W - CARD_W - 4, overlay.px < W / 2 ? overlay.px + 14 : overlay.px - CARD_W - 14)) / W) * 100}%`,
            top: `${(Math.max(2, Math.min(H - 48, overlay.py - 20)) / H) * 100}%`,
            background: "#101018",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 12px 32px rgba(0,0,0,0.45)",
          }}
        >
          <div className="text-[13px] font-semibold tabular-nums" style={{ color: overlay.color ?? "#FFFFFF" }}>
            {overlay.value}
          </div>
          <div className="mt-0.5 text-[10px] font-medium" style={{ color: "rgba(255,255,255,0.45)" }}>
            {overlay.context}
          </div>
        </div>
      )}
    </div>
  );
}
