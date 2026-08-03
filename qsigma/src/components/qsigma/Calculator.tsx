import { CSSProperties, useMemo, useState } from "react";
import FadeUp from "./FadeUp";

// Average monthly rates derived from each strategy's backtested annualized return
const STRATS = [
  { name: "Momentum Alpha", monthly: 0.0248 },
  { name: "Global Macro AI", monthly: 0.0165 },
  { name: "Volatility Harvest", monthly: 0.0145 },
  { name: "Blue-Chip Compounder", monthly: 0.0127 },
  { name: "Digital Assets Quant", monthly: 0.0359 },
  { name: "Rates & Arbitrage", monthly: 0.0099 },
];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const BENCH_MONTHLY = 0.0083; // S&P 500 total return, ~10.4% annualized
const START_YEAR = 2013; // strategies began in the backtesting environment

const W = 760;
const H = 300;
const PAD = 8;

const inputBox: CSSProperties = {
  fontFamily: "inherit",
  fontWeight: 500,
  fontSize: "16px",
  color: "#FFFFFF",
  backgroundColor: "rgba(255, 255, 255, 0.05)",
  border: "1px solid rgba(255, 255, 255, 0.14)",
  borderRadius: "10px",
  padding: "10px 14px",
  outline: "none",
};

const outputBox: CSSProperties = {
  display: "inline-block",
  fontWeight: 500,
  fontSize: "16px",
  color: "#A3B18A",
  border: "1px solid rgba(163, 177, 138, 0.45)",
  borderRadius: "10px",
  padding: "10px 14px",
  whiteSpace: "nowrap",
};

const fmtUsd = (v: number) => "$" + Math.round(v).toLocaleString("en-US");

const Calculator = () => {
  const [amount, setAmount] = useState(5000);
  const [strat, setStrat] = useState(0);
  const [month, setMonth] = useState(0);
  const [year, setYear] = useState(START_YEAR);

  const now = new Date();
  const years = useMemo(() => {
    const list = [];
    for (let y = START_YEAR; y <= now.getFullYear(); y++) list.push(y);
    return list;
  }, [now]);

  const calc = useMemo(() => {
    const safeAmount = Math.max(amount, 0);
    const n = Math.max(
      (now.getFullYear() - year) * 12 + (now.getMonth() - month),
      1
    );
    const r = STRATS[strat].monthly;
    const series: number[] = [];
    const bench: number[] = [];
    for (let i = 0; i <= n; i++) {
      series.push(safeAmount * Math.pow(1 + r, i));
      bench.push(safeAmount * Math.pow(1 + BENCH_MONTHLY, i));
    }
    const maxVal = series[series.length - 1] || 1;
    const toPath = (data: number[]) =>
      data
        .map((v, i) => {
          const x = PAD + (i / n) * (W - PAD * 2);
          const y = H - PAD - (v / maxVal) * (H - PAD * 2);
          return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
        })
        .join(" ");
    const qPath = toPath(series);
    const bPath = toPath(bench);
    const areaPath = `${qPath} L ${W - PAD} ${H - PAD} L ${PAD} ${H - PAD} Z`;
    const balance = series[series.length - 1];
    const profit = balance - safeAmount;
    const pct = safeAmount > 0 ? (profit / safeAmount) * 100 : 0;
    const ticks = [0, 1 / 3, 2 / 3, 1].map((k) => {
      const idx = Math.round(n * k);
      const m = (month + idx) % 12;
      const y = year + Math.floor((month + idx) / 12);
      return `${MONTHS[m].slice(0, 3)} ${y}`;
    });
    return { qPath, bPath, areaPath, balance, profit, pct, ticks };
  }, [amount, strat, month, year, now]);

  return (
    <section
      id="calculator"
      className="dark"
      style={{
        backgroundColor: "#05050C",
        padding: "120px 24px",
        borderTop: "1px solid rgba(255, 255, 255, 0.07)",
      }}
    >
      <div className="mx-auto max-w-[1100px]">
        <FadeUp className="text-center">
          <p
            className="text-[12px] sm:text-[13px] md:text-[14px] mb-3 md:mb-4"
            style={{ fontWeight: 500, color: "rgba(255, 255, 255, 0.50)" }}
          >
            Backtested Since 2013
          </p>
          <h2
            className="text-[32px] sm:text-[40px] md:text-[52px]"
            style={{ fontWeight: 500, letterSpacing: "-1.2px", lineHeight: 1.05 }}
          >
            <span className="block" style={{ color: "rgba(255, 255, 255, 0.25)" }}>
              Rewind the Clock,
            </span>
            <span className="block" style={{ color: "#FFFFFF" }}>
              Run the Numbers
            </span>
          </h2>
          <p
            className="mx-auto mt-4 md:mt-5 text-[14px] sm:text-[16px]"
            style={{
              fontWeight: 500,
              color: "rgba(255, 255, 255, 0.40)",
              maxWidth: "540px",
            }}
          >
            Every QSigma strategy has been running in our backtesting
            environment since January 2013. Choose one, pick your starting
            point, and see what disciplined compounding would have done.
          </p>
        </FadeUp>

        <FadeUp delay={0.1}>
          <div
            className="mt-14"
            style={{
              border: "1px solid rgba(255, 255, 255, 0.10)",
              borderRadius: "16px",
              padding: "36px 28px 24px",
              background: "rgba(255, 255, 255, 0.02)",
            }}
          >
            <p
              className="flex flex-wrap items-center gap-x-3 gap-y-3 text-[16px] sm:text-[18px]"
              style={{
                fontWeight: 500,
                color: "rgba(255, 255, 255, 0.55)",
                lineHeight: 1.6,
              }}
            >
              <span>If you had deployed</span>
              <span className="inline-flex items-center" style={{ ...inputBox, padding: 0 }}>
                <span style={{ paddingLeft: 14, color: "rgba(255,255,255,0.45)" }}>$</span>
                <input
                  type="number"
                  min={0}
                  step={500}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value) || 0)}
                  aria-label="Amount deployed"
                  style={{
                    fontFamily: "inherit",
                    fontWeight: 500,
                    fontSize: "16px",
                    color: "#FFFFFF",
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    padding: "10px 14px 10px 6px",
                    width: "110px",
                  }}
                />
              </span>
              <span>in</span>
              <select
                value={strat}
                onChange={(e) => setStrat(Number(e.target.value))}
                aria-label="Strategy"
                style={{ ...inputBox, cursor: "pointer" }}
              >
                {STRATS.map((s, i) => (
                  <option key={s.name} value={i} style={{ color: "#05050C" }}>
                    {s.name}
                  </option>
                ))}
              </select>
              <span>in</span>
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                aria-label="Start month"
                style={{ ...inputBox, cursor: "pointer" }}
              >
                {MONTHS.map((m, i) => (
                  <option key={m} value={i} style={{ color: "#05050C" }}>
                    {m}
                  </option>
                ))}
              </select>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                aria-label="Start year"
                style={{ ...inputBox, cursor: "pointer" }}
              >
                {years.map((y) => (
                  <option key={y} value={y} style={{ color: "#05050C" }}>
                    {y}
                  </option>
                ))}
              </select>
              <span>your balance today would be</span>
              <span style={outputBox}>{fmtUsd(calc.balance)}</span>
              <span>— a profit of</span>
              <span style={outputBox}>{fmtUsd(calc.profit)}</span>
              <span style={outputBox}>
                +{calc.pct.toLocaleString("en-US", { maximumFractionDigits: 1 })}%
              </span>
            </p>

            <div className="mt-8 mb-4 flex flex-wrap items-center gap-x-6 gap-y-2 px-1">
              <span
                className="flex items-center gap-2 text-[13px]"
                style={{ fontWeight: 500, color: "rgba(255,255,255,0.85)" }}
              >
                <span style={{ width: 8, height: 8, borderRadius: 9999, backgroundColor: "#A3B18A", display: "inline-block" }} />
                {STRATS[strat].name}
              </span>
              <span
                className="flex items-center gap-2 text-[13px]"
                style={{ fontWeight: 500, color: "rgba(255,255,255,0.45)" }}
              >
                <span style={{ width: 8, height: 8, borderRadius: 9999, backgroundColor: "rgba(255,255,255,0.30)", display: "inline-block" }} />
                S&amp;P 500
              </span>
            </div>

            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="h-auto w-full"
              fill="none"
              role="img"
              aria-label="Hypothetical growth of the selected strategy versus the S&P 500"
            >
              <defs>
                <linearGradient id="calc-area" x1="0" y1="0" x2="0" y2="1">
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
              <path d={calc.areaPath} fill="url(#calc-area)" />
              <path
                d={calc.bPath}
                stroke="rgba(255, 255, 255, 0.30)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d={calc.qPath}
                stroke="#A3B18A"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <div
              className="mt-2 flex justify-between text-[12px]"
              style={{ fontWeight: 500, color: "rgba(255, 255, 255, 0.35)" }}
            >
              {calc.ticks.map((t, i) => (
                <span key={`${t}-${i}`}>{t}</span>
              ))}
            </div>

            <p
              className="mt-6 text-[12px]"
              style={{
                fontWeight: 500,
                color: "rgba(255, 255, 255, 0.30)",
                lineHeight: 1.6,
              }}
            >
              Hypothetical growth assuming monthly compounding at each
              strategy's average backtested rate, benchmarked against S&amp;P
              500 total return. Backtested performance has inherent limitations
              and does not represent actual trading or future results.
            </p>
          </div>
        </FadeUp>
      </div>
    </section>
  );
};

export default Calculator;
