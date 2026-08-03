import FadeUp from "./FadeUp";
import SmaChart from "@/components/ui/sma-chart";

interface Strategy {
  name: string;
  category: string;
  risk: "Conservative" | "Balanced" | "Aggressive" | "Market-neutral";
  annualReturn: string;
  vsBenchmark: string;
  sharpe: string;
  minimum: string;
  seed: number;
  drift: number;
  vol: number;
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
    seed: 61,
    drift: 0.008,
    vol: 0.045,
  },
  {
    name: "Global Macro AI",
    category: "Multi-asset",
    risk: "Balanced",
    annualReturn: "+21.7%",
    vsBenchmark: "vs 60/40 +8.9%",
    sharpe: "1.6",
    minimum: "$1,000",
    seed: 733,
    drift: 0.006,
    vol: 0.032,
  },
  {
    name: "Volatility Harvest",
    category: "Index Options",
    risk: "Market-neutral",
    annualReturn: "+18.9%",
    vsBenchmark: "vs T-bills +14.1%",
    sharpe: "2.1",
    minimum: "$5,000",
    seed: 421,
    drift: 0.005,
    vol: 0.018,
  },
  {
    name: "Blue-Chip Compounder",
    category: "US Equities",
    risk: "Conservative",
    annualReturn: "+16.4%",
    vsBenchmark: "vs S&P 500 +4.6%",
    sharpe: "1.4",
    minimum: "$500",
    seed: 277,
    drift: 0.0045,
    vol: 0.022,
  },
  {
    name: "Digital Assets Quant",
    category: "Crypto",
    risk: "Aggressive",
    annualReturn: "+52.8%",
    vsBenchmark: "vs BTC +19.3%",
    sharpe: "1.3",
    minimum: "$1,000",
    seed: 907,
    drift: 0.012,
    vol: 0.07,
  },
  {
    name: "Rates & Arbitrage",
    category: "Fixed Income",
    risk: "Conservative",
    annualReturn: "+12.6%",
    vsBenchmark: "vs Agg +7.2%",
    sharpe: "2.4",
    minimum: "$500",
    seed: 149,
    drift: 0.0035,
    vol: 0.012,
  },
];

const Strategies = () => {
  return (
    <section
      id="strategies"
      style={{ backgroundColor: "#F2F2F0", padding: "120px 24px" }}
    >
      <div className="mx-auto max-w-[1180px]">
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

        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {STRATEGIES.map((s, i) => (
            <FadeUp key={s.name} delay={(i % 3) * 0.08}>
              <article
                className="group flex h-full flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(5,5,12,0.10)]"
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid rgba(0, 0, 0, 0.07)",
                  borderRadius: "16px",
                  padding: "24px",
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

                <div className="mt-5">
                  <SmaChart seed={s.seed} drift={s.drift} vol={s.vol} />
                </div>

                <div
                  className="mt-5 flex items-center justify-between text-[13px]"
                  style={{
                    fontWeight: 500,
                    color: "rgba(0, 0, 0, 0.45)",
                    borderTop: "1px solid rgba(0, 0, 0, 0.07)",
                    paddingTop: "14px",
                  }}
                >
                  <span
                    className="rounded-md px-2 py-0.5"
                    style={{
                      fontWeight: 600,
                      color: "#5F7052",
                      background: "rgba(95, 112, 82, 0.10)",
                    }}
                  >
                    {s.annualReturn} annualized
                  </span>
                  <span>{s.vsBenchmark}</span>
                </div>
                <div
                  className="mt-3 flex items-center justify-between text-[13px]"
                  style={{ fontWeight: 500, color: "rgba(0, 0, 0, 0.45)" }}
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
            Charts show simulated strategy price series with 60- and 200-period
            moving averages. Returns shown are illustrative, net of fees, since
            strategy inception. Past performance does not guarantee future results.
          </p>
        </FadeUp>
      </div>
    </section>
  );
};

export default Strategies;
