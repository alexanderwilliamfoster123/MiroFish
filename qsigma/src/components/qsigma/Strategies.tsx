import FadeUp from "./FadeUp";

interface Strategy {
  name: string;
  category: string;
  risk: "Conservative" | "Balanced" | "Aggressive" | "Market-neutral";
  annualReturn: string;
  vsBenchmark: string;
  sharpe: string;
  minimum: string;
  spark: number[];
}

const STRATEGIES: Strategy[] = [
  {
    name: "Momentum Alpha",
    category: "US Equities",
    risk: "Aggressive",
    annualReturn: "+34.2%",
    vsBenchmark: "vs S&P 500 +11.8%",
    sharpe: "1.9",
    minimum: "$1,000",
    spark: [10, 14, 12, 18, 16, 24, 22, 30, 27, 36, 34, 44],
  },
  {
    name: "Global Macro AI",
    category: "Multi-asset",
    risk: "Balanced",
    annualReturn: "+21.7%",
    vsBenchmark: "vs 60/40 +8.9%",
    sharpe: "1.6",
    minimum: "$1,000",
    spark: [10, 12, 15, 13, 17, 16, 20, 22, 21, 25, 27, 30],
  },
  {
    name: "Volatility Harvest",
    category: "Index Options",
    risk: "Market-neutral",
    annualReturn: "+18.9%",
    vsBenchmark: "vs T-bills +14.1%",
    sharpe: "2.1",
    minimum: "$5,000",
    spark: [10, 11, 13, 14, 14, 16, 17, 17, 19, 20, 22, 23],
  },
  {
    name: "Blue-Chip Compounder",
    category: "US Equities",
    risk: "Conservative",
    annualReturn: "+16.4%",
    vsBenchmark: "vs S&P 500 +4.6%",
    sharpe: "1.4",
    minimum: "$500",
    spark: [10, 11, 12, 12, 14, 15, 15, 17, 18, 19, 21, 22],
  },
  {
    name: "Digital Assets Quant",
    category: "Crypto",
    risk: "Aggressive",
    annualReturn: "+52.8%",
    vsBenchmark: "vs BTC +19.3%",
    sharpe: "1.3",
    minimum: "$1,000",
    spark: [10, 16, 13, 22, 18, 30, 25, 38, 32, 48, 42, 58],
  },
  {
    name: "Rates & Arbitrage",
    category: "Fixed Income",
    risk: "Conservative",
    annualReturn: "+12.6%",
    vsBenchmark: "vs Agg +7.2%",
    sharpe: "2.4",
    minimum: "$500",
    spark: [10, 10.8, 11.5, 12, 12.8, 13.2, 14, 14.6, 15.1, 15.9, 16.4, 17.2],
  },
];

const Sparkline = ({ data }: { data: number[] }) => {
  const w = 120;
  const h = 36;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const pts = data
    .map(
      (v, i) =>
        `${((i / (data.length - 1)) * w).toFixed(1)},${(
          h - 2 - ((v - min) / (max - min || 1)) * (h - 4)
        ).toFixed(1)}`
    )
    .join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none" aria-hidden>
      <polyline
        points={pts}
        stroke="#5F7052"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const Strategies = () => {
  return (
    <section
      id="strategies"
      style={{ backgroundColor: "#F2F2F0", padding: "120px 24px" }}
    >
      <div className="mx-auto max-w-[1100px]">
        <FadeUp className="text-center">
          <p
            className="text-[12px] sm:text-[13px] md:text-[14px] mb-3 md:mb-4"
            style={{ fontWeight: 500, color: "rgba(0, 0, 0, 0.50)" }}
          >
            Strategies
          </p>
          <h2
            className="text-[32px] sm:text-[40px] md:text-[52px]"
            style={{ fontWeight: 500, letterSpacing: "-1.2px", lineHeight: 1.05 }}
          >
            <span className="block" style={{ color: "rgba(0, 0, 0, 0.20)" }}>
              Subscribe to
            </span>
            <span className="block" style={{ color: "#05050C" }}>
              Market-Beating Intelligence
            </span>
          </h2>
          <p
            className="mx-auto mt-4 md:mt-5 text-[14px] sm:text-[16px]"
            style={{ fontWeight: 500, color: "rgba(0, 0, 0, 0.40)", maxWidth: "520px" }}
          >
            Every QSigma strategy is researched, executed, and rebalanced
            end-to-end by our AI engine. Pick the ones that fit your goals and
            subscribe in one tap.
          </p>
        </FadeUp>

        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {STRATEGIES.map((s, i) => (
            <FadeUp key={s.name} delay={(i % 3) * 0.08}>
              <article
                className="group flex h-full flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(5,5,12,0.10)]"
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid rgba(0, 0, 0, 0.07)",
                  borderRadius: "16px",
                  padding: "28px",
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3
                      className="text-[18px]"
                      style={{ fontWeight: 600, color: "#05050C" }}
                    >
                      {s.name}
                    </h3>
                    <p
                      className="mt-1 text-[13px]"
                      style={{ fontWeight: 500, color: "rgba(0, 0, 0, 0.45)" }}
                    >
                      {s.category}
                    </p>
                  </div>
                  <span
                    className="whitespace-nowrap text-[11px]"
                    style={{
                      fontWeight: 600,
                      letterSpacing: "0.5px",
                      textTransform: "uppercase",
                      color: "rgba(0, 0, 0, 0.55)",
                      border: "1px solid rgba(0, 0, 0, 0.12)",
                      borderRadius: "9999px",
                      padding: "5px 10px",
                    }}
                  >
                    {s.risk}
                  </span>
                </div>

                <div className="mt-6 flex items-end justify-between gap-4">
                  <div>
                    <div
                      className="text-[32px]"
                      style={{
                        fontWeight: 500,
                        letterSpacing: "-0.8px",
                        lineHeight: 1,
                        color: "#5F7052",
                      }}
                    >
                      {s.annualReturn}
                    </div>
                    <div
                      className="mt-1.5 text-[12px]"
                      style={{ fontWeight: 500, color: "rgba(0, 0, 0, 0.40)" }}
                    >
                      annualized · {s.vsBenchmark}
                    </div>
                  </div>
                  <Sparkline data={s.spark} />
                </div>

                <div
                  className="mt-6 flex items-center justify-between text-[13px]"
                  style={{
                    fontWeight: 500,
                    color: "rgba(0, 0, 0, 0.45)",
                    borderTop: "1px solid rgba(0, 0, 0, 0.07)",
                    paddingTop: "16px",
                  }}
                >
                  <span>Sharpe {s.sharpe}</span>
                  <span>From {s.minimum}</span>
                </div>

                <button
                  className="mt-5 w-full transition-colors duration-200 hover:bg-[#333333]"
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
            </FadeUp>
          ))}
        </div>

        <FadeUp className="mt-10 text-center">
          <p className="text-[13px]" style={{ fontWeight: 500, color: "rgba(0, 0, 0, 0.35)" }}>
            Returns shown are illustrative, net of fees, since strategy
            inception. Past performance does not guarantee future results.
          </p>
        </FadeUp>
      </div>
    </section>
  );
};

export default Strategies;
