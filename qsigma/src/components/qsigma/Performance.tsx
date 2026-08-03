import { motion } from "framer-motion";
import FadeUp from "./FadeUp";

// Indexed to 100, quarterly since 2022
const QSIGMA = [100, 108, 118, 115, 132, 150, 146, 170, 192, 188, 214, 240, 236, 268, 290, 314];
const SP500 = [100, 104, 99, 110, 118, 112, 124, 131, 127, 138, 150, 146, 158, 171, 178, 187];

const W = 760;
const H = 300;
const PAD = 8;

const toPath = (data: number[], min: number, max: number) =>
  data
    .map((v, i) => {
      const x = PAD + (i / (data.length - 1)) * (W - PAD * 2);
      const y = H - PAD - ((v - min) / (max - min)) * (H - PAD * 2);
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

const KEY_STATS = [
  { value: "+214%", label: "Cumulative return", sub: "vs S&P 500 +87%", accent: true },
  { value: "-9.8%", label: "Max drawdown", sub: "vs S&P 500 -25.4%" },
  { value: "1.8", label: "Composite Sharpe", sub: "since inception" },
];

const Performance = () => {
  const min = Math.min(...SP500, ...QSIGMA);
  const max = Math.max(...SP500, ...QSIGMA);
  const qPath = toPath(QSIGMA, min, max);
  const sPath = toPath(SP500, min, max);
  const areaPath = `${qPath} L ${W - PAD} ${H - PAD} L ${PAD} ${H - PAD} Z`;

  return (
    <section
      id="performance"
      style={{ backgroundColor: "#05050C", padding: "120px 24px" }}
    >
      <div className="mx-auto max-w-[1100px]">
        <FadeUp className="text-center">
          <p
            className="text-[12px] sm:text-[13px] md:text-[14px] mb-3 md:mb-4"
            style={{ fontWeight: 500, color: "rgba(255, 255, 255, 0.50)" }}
          >
            Track Record
          </p>
          <h2
            className="text-[32px] sm:text-[40px] md:text-[52px]"
            style={{ fontWeight: 500, letterSpacing: "-1.2px", lineHeight: 1.05 }}
          >
            <span className="block" style={{ color: "rgba(255, 255, 255, 0.25)" }}>
              Numbers That
            </span>
            <span className="block" style={{ color: "#FFFFFF" }}>
              Speak for Themselves
            </span>
          </h2>
        </FadeUp>

        <FadeUp className="mt-14" delay={0.1}>
          <div
            style={{
              border: "1px solid rgba(255, 255, 255, 0.10)",
              borderRadius: "16px",
              padding: "28px 24px 20px",
              background: "rgba(255, 255, 255, 0.02)",
            }}
          >
            <div className="mb-5 flex flex-wrap items-center gap-x-6 gap-y-2 px-1">
              <span className="flex items-center gap-2 text-[13px]" style={{ fontWeight: 500, color: "rgba(255,255,255,0.85)" }}>
                <span style={{ width: 8, height: 8, borderRadius: 9999, backgroundColor: "#A3B18A", display: "inline-block" }} />
                QSigma Composite
              </span>
              <span className="flex items-center gap-2 text-[13px]" style={{ fontWeight: 500, color: "rgba(255,255,255,0.45)" }}>
                <span style={{ width: 8, height: 8, borderRadius: 9999, backgroundColor: "rgba(255,255,255,0.30)", display: "inline-block" }} />
                S&amp;P 500
              </span>
              <span className="ml-auto text-[12px]" style={{ fontWeight: 500, color: "rgba(255,255,255,0.35)" }}>
                Growth of $100 · since 2022
              </span>
            </div>

            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="h-auto w-full"
              fill="none"
              role="img"
              aria-label="Chart comparing QSigma composite growth to the S&P 500"
            >
              <defs>
                <linearGradient id="qsigma-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(163, 177, 138, 0.22)" />
                  <stop offset="100%" stopColor="rgba(163, 177, 138, 0)" />
                </linearGradient>
              </defs>
              {[0.25, 0.5, 0.75].map((t) => (
                <line
                  key={t}
                  x1={PAD}
                  x2={W - PAD}
                  y1={H * t}
                  y2={H * t}
                  stroke="rgba(255, 255, 255, 0.06)"
                  strokeWidth="1"
                />
              ))}
              <path d={areaPath} fill="url(#qsigma-area)" />
              <motion.path
                d={sPath}
                stroke="rgba(255, 255, 255, 0.30)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.4, ease: "easeOut" }}
              />
              <motion.path
                d={qPath}
                stroke="#A3B18A"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.6, ease: "easeOut", delay: 0.15 }}
              />
            </svg>
          </div>
        </FadeUp>

        <div className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-3">
          {KEY_STATS.map((stat, i) => (
            <FadeUp key={stat.label} delay={i * 0.08} className="text-center">
              <div
                className="text-[36px] md:text-[44px]"
                style={{
                  fontWeight: 500,
                  letterSpacing: "-1px",
                  lineHeight: 1.1,
                  color: stat.accent ? "#A3B18A" : "#FFFFFF",
                }}
              >
                {stat.value}
              </div>
              <div className="mt-1.5 text-[14px]" style={{ fontWeight: 500, color: "rgba(255,255,255,0.60)" }}>
                {stat.label}
              </div>
              <div className="mt-0.5 text-[12px]" style={{ fontWeight: 500, color: "rgba(255,255,255,0.35)" }}>
                {stat.sub}
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Performance;
