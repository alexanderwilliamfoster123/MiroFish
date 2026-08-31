import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo } from "react";
import { X } from "lucide-react";
import type { PortfolioCardProps } from "@/components/ui/portfolio-card";

const FONT = '"Satoshi", "Satoshi", "Inter Tight", system-ui, sans-serif';
const DD_COLOR = "#A85C50";

export interface FactsheetData extends Omit<PortfolioCardProps, "onSubscribe" | "cta"> {
  asOf?: string;
  period?: string;
  sessions?: string;
  assets?: string;
  minInvestment?: string;
  totalReturn?: string;
  avgMonth?: string;
  winningMonths?: string;
  sortino?: string;
  targetOrders?: string;
  ordersPerMonth?: string;
  avgHolding?: string;
  turnover?: string;
  thesis?: string;
  role?: string;
  construction?: string;
  signals?: string;
  execution?: string;
  risks?: string;
  beta?: string;
  correlation?: string;
  var95?: string;
  cvar95?: string;
  calmar?: string;
  alpha?: string;
  infoRatio?: string;
  bestDay?: string;
  worstDay?: string;
  monthly?: { year: string; months: (string | null)[]; total: string }[];
}

interface FactsheetModalProps {
  portfolio: FactsheetData | null;
  onClose: () => void;
  onSubscribe?: () => void;
}

const N = 170;

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

function toPath(data: number[], w: number, h: number, min: number, max: number) {
  return data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / (max - min || 1)) * h;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

function SectionLabel({ children }: { children: string }) {
  return (
    <div
      className="text-[11px] font-semibold uppercase tracking-[0.12em]"
      style={{ color: "rgba(0,0,0,0.40)" }}
    >
      {children}
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "rgba(0,0,0,0.40)" }}>
        {label}
      </div>
      <div className="mt-0.5 text-[17px] font-bold tabular-nums" style={{ color: accent ?? "#05050C", letterSpacing: "-0.3px" }}>
        {value}
      </div>
    </div>
  );
}

const MONTH_HEADS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function FactsheetModal({ portfolio: p, onClose, onSubscribe }: FactsheetModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (p) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [p]);

  const charts = useMemo(() => {
    if (!p) return null;
    const series = buildSeries(p.seed, p.drift, p.vol);
    const bench = buildSeries(p.seed + 7, p.drift * 0.45, p.vol * 0.8);
    const min = Math.min(...series, ...bench);
    const max = Math.max(...series, ...bench);
    // Underwater: drawdown from running high-water mark
    let hwm = 0;
    const dd = series.map((v) => {
      hwm = Math.max(hwm, v);
      return (v / hwm - 1) * 100;
    });
    const ddMin = Math.min(...dd, -1);
    return { series, bench, min, max, dd, ddMin };
  }, [p]);

  return (
    <AnimatePresence>
      {p && charts && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto p-4 md:p-8"
          style={{ fontFamily: FONT }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          role="dialog"
          aria-modal="true"
          aria-label={`${p.name} factsheet`}
        >
          <div className="fixed inset-0" style={{ background: "rgba(5,5,12,0.55)", backdropFilter: "blur(6px)" }} onClick={onClose} />

          <motion.div
            className="relative w-full max-w-[880px] overflow-hidden rounded-2xl"
            style={{ backgroundColor: "#F7F7F5", boxShadow: "0 40px 120px rgba(5,5,12,0.4)" }}
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Top bar */}
            <div
              className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 md:px-10"
              style={{ backgroundColor: "rgba(247,247,245,0.92)", backdropFilter: "blur(10px)", borderBottom: "1px solid rgba(0,0,0,0.07)" }}
            >
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: "rgba(0,0,0,0.45)" }}>
                  Portfolio Research
                </span>
                {p.asOf && (
                  <span className="text-[11px] font-medium" style={{ color: "rgba(0,0,0,0.35)" }}>
                    · As of {p.asOf}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close factsheet"
                className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-black/5"
                style={{ color: "#05050C" }}
              >
                <X size={16} />
              </button>
            </div>

            <div className="px-6 pb-8 pt-6 md:px-10">
              {/* Header */}
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.accent }} />
                <span className="text-[13px] font-medium uppercase tracking-wide" style={{ color: "rgba(0,0,0,0.50)" }}>
                  {p.kind}
                </span>
              </div>
              <h2 className="mt-2 text-[34px] md:text-[42px]" style={{ fontWeight: 500, letterSpacing: "-1px", lineHeight: 1.05, color: "#05050C" }}>
                {p.name}
              </h2>
              <p className="mt-3 max-w-[640px] text-[15px] leading-[1.55]" style={{ fontWeight: 500, color: "rgba(0,0,0,0.50)" }}>
                {p.description}
              </p>

              {/* Key facts strip */}
              {(p.period || p.sessions || p.assets || p.minInvestment) && (
                <div
                  className="mt-6 grid grid-cols-2 gap-4 rounded-xl p-5 md:grid-cols-4"
                  style={{ backgroundColor: "#FFFFFF", border: "1px solid rgba(0,0,0,0.07)" }}
                >
                  {p.period && <Stat label="Period" value={p.period} />}
                  {p.sessions && <Stat label="Sessions" value={p.sessions} />}
                  {p.assets && <Stat label="Assets" value={p.assets} />}
                  {p.minInvestment && <Stat label="Min investment" value={p.minInvestment} />}
                </div>
              )}

              {/* Stat groups */}
              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-xl p-5" style={{ backgroundColor: "#FFFFFF", border: "1px solid rgba(0,0,0,0.07)" }}>
                  <SectionLabel>Return</SectionLabel>
                  <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3">
                    <Stat label="CAGR" value={`${p.cagr.toFixed(2)}%`} accent="#5F7052" />
                    {p.totalReturn && <Stat label="Total return" value={p.totalReturn} />}
                    {p.avgMonth && <Stat label="Avg. month" value={p.avgMonth} />}
                    {p.winningMonths && <Stat label="Winning months" value={p.winningMonths} />}
                  </div>
                </div>
                <div className="rounded-xl p-5" style={{ backgroundColor: "#FFFFFF", border: "1px solid rgba(0,0,0,0.07)" }}>
                  <SectionLabel>Risk</SectionLabel>
                  <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3">
                    <Stat label="Volatility" value={`${p.volatility.toFixed(2)}%`} />
                    <Stat label="Max drawdown" value={`${p.maxDrawdown.toFixed(2)}%`} accent={DD_COLOR} />
                    <Stat label="Sharpe" value={p.sharpe} />
                    {p.sortino && <Stat label="Sortino" value={p.sortino} />}
                  </div>
                </div>
                <div className="rounded-xl p-5" style={{ backgroundColor: "#FFFFFF", border: "1px solid rgba(0,0,0,0.07)" }}>
                  <SectionLabel>{p.targetOrders ? "Trading" : "Profile"}</SectionLabel>
                  <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3">
                    {p.targetOrders ? (
                      <>
                        <Stat label="Target orders" value={p.targetOrders} />
                        <Stat label="Orders / month" value={p.ordersPerMonth ?? "—"} />
                        <Stat label="Avg. holding" value={p.avgHolding ?? "—"} />
                        <Stat label="Turnover" value={p.turnover ?? "—"} />
                      </>
                    ) : (
                      <>
                        <Stat label="Benchmark" value={p.benchmark} />
                        <Stat label="History" value={p.history} />
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Growth chart */}
              <div className="mt-6 rounded-xl p-5" style={{ backgroundColor: "#FFFFFF", border: "1px solid rgba(0,0,0,0.07)" }}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <SectionLabel>Growth of $1,000,000</SectionLabel>
                  <div className="flex items-center gap-4 text-[12px] font-medium">
                    <span className="flex items-center gap-1.5" style={{ color: "rgba(0,0,0,0.70)" }}>
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.accent }} /> {p.name}
                    </span>
                    <span className="flex items-center gap-1.5" style={{ color: "rgba(0,0,0,0.40)" }}>
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "rgba(0,0,0,0.30)" }} /> {p.benchmark}
                    </span>
                  </div>
                </div>
                <svg viewBox="0 0 760 240" className="mt-3 block h-auto w-full" aria-label={`Growth chart for ${p.name} against ${p.benchmark}`}>
                  <defs>
                    <linearGradient id={`fs-grad-${p.seed}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={p.accent} stopOpacity="0.22" />
                      <stop offset="100%" stopColor={p.accent} stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {[0.25, 0.5, 0.75].map((t) => (
                    <line key={t} x1="0" x2="760" y1={240 * t} y2={240 * t} stroke="rgba(0,0,0,0.05)" strokeDasharray="2 4" />
                  ))}
                  <path d={`${toPath(charts.series, 760, 240, charts.min, charts.max)} L 760 240 L 0 240 Z`} fill={`url(#fs-grad-${p.seed})`} />
                  <path d={toPath(charts.bench, 760, 240, charts.min, charts.max)} fill="none" stroke="rgba(0,0,0,0.28)" strokeWidth="1.8" strokeLinecap="round" />
                  <path d={toPath(charts.series, 760, 240, charts.min, charts.max)} fill="none" stroke={p.accent} strokeWidth="2.2" strokeLinecap="round" />
                </svg>
                <div className="mt-1 flex justify-between text-[11px] font-medium" style={{ color: "rgba(0,0,0,0.35)" }}>
                  <span>{p.history.split("–")[0]?.trim()}</span>
                  <span>{p.history.split("–")[1]?.trim()}</span>
                </div>
              </div>

              {/* Underwater chart */}
              <div className="mt-4 rounded-xl p-5" style={{ backgroundColor: "#FFFFFF", border: "1px solid rgba(0,0,0,0.07)" }}>
                <SectionLabel>Underwater profile</SectionLabel>
                <svg viewBox="0 0 760 110" className="mt-3 block h-auto w-full" aria-label={`Drawdown chart for ${p.name}`}>
                  <line x1="0" x2="760" y1="4" y2="4" stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
                  <path
                    d={`${charts.dd
                      .map((v, i) => {
                        const x = (i / (charts.dd.length - 1)) * 760;
                        const y = 4 + (v / charts.ddMin) * 100;
                        return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
                      })
                      .join(" ")} L 760 4 L 0 4 Z`}
                    fill="rgba(168,92,80,0.18)"
                  />
                  <path
                    d={charts.dd
                      .map((v, i) => {
                        const x = (i / (charts.dd.length - 1)) * 760;
                        const y = 4 + (v / charts.ddMin) * 100;
                        return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
                      })
                      .join(" ")}
                    fill="none"
                    stroke={DD_COLOR}
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* Monthly returns */}
              {p.monthly && (
                <div className="mt-4 rounded-xl p-5" style={{ backgroundColor: "#FFFFFF", border: "1px solid rgba(0,0,0,0.07)" }}>
                  <SectionLabel>Monthly returns</SectionLabel>
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full" style={{ minWidth: "720px", borderCollapse: "collapse" }}>
                      <thead>
                        <tr>
                          <th className="py-1.5 pr-2 text-left text-[10px] font-semibold uppercase tracking-wide" style={{ color: "rgba(0,0,0,0.40)" }}>
                            Year
                          </th>
                          {MONTH_HEADS.map((m) => (
                            <th key={m} className="px-1 py-1.5 text-right text-[10px] font-semibold uppercase tracking-wide" style={{ color: "rgba(0,0,0,0.40)" }}>
                              {m}
                            </th>
                          ))}
                          <th className="py-1.5 pl-2 text-right text-[10px] font-semibold uppercase tracking-wide" style={{ color: "rgba(0,0,0,0.40)" }}>
                            Year
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {p.monthly.map((row) => (
                          <tr key={row.year} style={{ borderTop: "1px solid rgba(0,0,0,0.05)" }}>
                            <td className="py-1.5 pr-2 text-[12px] font-semibold tabular-nums" style={{ color: "#05050C" }}>
                              {row.year}
                            </td>
                            {row.months.map((m, i) => (
                              <td
                                key={i}
                                className="px-1 py-1.5 text-right text-[11.5px] font-medium tabular-nums"
                                style={{
                                  color:
                                    m == null
                                      ? "rgba(0,0,0,0.25)"
                                      : m.startsWith("-")
                                      ? DD_COLOR
                                      : "#5F7052",
                                }}
                              >
                                {m ?? "—"}
                              </td>
                            ))}
                            <td
                              className="py-1.5 pl-2 text-right text-[12px] font-bold tabular-nums"
                              style={{ color: row.total.startsWith("-") ? DD_COLOR : "#05050C" }}
                            >
                              {row.total}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Thesis + role */}
              {(p.thesis || p.role) && (
                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-[3fr_2fr]">
                  {p.thesis && (
                    <div>
                      <SectionLabel>Economic thesis</SectionLabel>
                      <p className="mt-2 text-[14px] leading-[1.6]" style={{ fontWeight: 500, color: "rgba(0,0,0,0.55)" }}>
                        {p.thesis}
                      </p>
                    </div>
                  )}
                  {p.role && (
                    <div>
                      <SectionLabel>Portfolio role</SectionLabel>
                      <p className="mt-2 text-[14px] leading-[1.6]" style={{ fontWeight: 500, color: "rgba(0,0,0,0.55)" }}>
                        {p.role}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {(p.construction || p.signals || p.execution || p.risks) && (
                <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
                  {p.construction && (
                    <div>
                      <SectionLabel>Construction</SectionLabel>
                      <p className="mt-2 text-[13px] leading-[1.6]" style={{ fontWeight: 500, color: "rgba(0,0,0,0.50)" }}>
                        {p.construction}
                      </p>
                    </div>
                  )}
                  {p.signals && (
                    <div>
                      <SectionLabel>Signal architecture</SectionLabel>
                      <p className="mt-2 text-[13px] leading-[1.6]" style={{ fontWeight: 500, color: "rgba(0,0,0,0.50)" }}>
                        {p.signals}
                      </p>
                    </div>
                  )}
                  {p.execution && (
                    <div>
                      <SectionLabel>Execution</SectionLabel>
                      <p className="mt-2 text-[13px] leading-[1.6]" style={{ fontWeight: 500, color: "rgba(0,0,0,0.50)" }}>
                        {p.execution}
                      </p>
                    </div>
                  )}
                  {p.risks && (
                    <div>
                      <SectionLabel>Principal risks</SectionLabel>
                      <p className="mt-2 text-[13px] leading-[1.6]" style={{ fontWeight: 500, color: "rgba(0,0,0,0.50)" }}>
                        {p.risks}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Extended metrics */}
              {(p.beta || p.calmar) && (
                <div
                  className="mt-6 grid grid-cols-3 gap-x-4 gap-y-4 rounded-xl p-5 md:grid-cols-5"
                  style={{ backgroundColor: "#FFFFFF", border: "1px solid rgba(0,0,0,0.07)" }}
                >
                  {p.beta && <Stat label={`Beta vs ${p.benchmark}`} value={p.beta} />}
                  {p.correlation && <Stat label="Correlation" value={p.correlation} />}
                  {p.alpha && <Stat label="Alpha" value={p.alpha} accent="#5F7052" />}
                  {p.infoRatio && <Stat label="Info ratio" value={p.infoRatio} />}
                  {p.calmar && <Stat label="Calmar" value={p.calmar} />}
                  {p.var95 && <Stat label="Daily VaR 95%" value={p.var95} />}
                  {p.cvar95 && <Stat label="Daily CVaR 95%" value={p.cvar95} />}
                  {p.bestDay && <Stat label="Best day" value={p.bestDay} accent="#5F7052" />}
                  {p.worstDay && <Stat label="Worst day" value={p.worstDay} accent={DD_COLOR} />}
                </div>
              )}

              {/* Footer */}
              <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <p className="max-w-[520px] text-[11px] leading-[1.6]" style={{ fontWeight: 500, color: "rgba(0,0,0,0.35)" }}>
                  Backtested performance over the stated period, net of fees.
                  Figures are illustrative and have inherent limitations. Past
                  performance does not guarantee future results. Investing
                  involves risk, including possible loss of principal.
                </p>
                <div className="flex shrink-0 items-center gap-2">
                  <a
                    href="https://alphaledger.ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors duration-200 hover:bg-black/5"
                    style={{
                      color: "#05050C",
                      fontFamily: "inherit",
                      fontWeight: 600,
                      fontSize: "13px",
                      borderRadius: "9999px",
                      border: "1px solid rgba(0,0,0,0.15)",
                      padding: "12px 24px",
                      textDecoration: "none",
                    }}
                  >
                    Audit
                  </a>
                  <button
                    type="button"
                    onClick={onSubscribe}
                    className="transition-colors duration-200 hover:bg-[#333333]"
                    style={{
                      backgroundColor: "#111111",
                      color: "#FFFFFF",
                      fontFamily: "inherit",
                      fontWeight: 600,
                      fontSize: "13px",
                      borderRadius: "9999px",
                      border: "none",
                      padding: "12px 28px",
                      cursor: "pointer",
                    }}
                  >
                    Subscribe to {p.name}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
