import FadeUp from "./FadeUp";
import StrategyTicker, { StrategyTickerProps } from "@/components/ui/strategy-ticker";

const STRATEGIES: Omit<StrategyTickerProps, "onSubscribe">[] = [
  {
    name: "Momentum Alpha",
    category: "US Equities",
    risk: "Aggressive",
    annualReturn: "+34.2%",
    vsBenchmark: "vs S&P 500 +11.8%",
    sharpe: "1.9",
    minimum: "$1,000",
    aum: "$412M",
    flow30d: "+$18.4M",
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
    aum: "$688M",
    flow30d: "+$24.1M",
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
    aum: "$296M",
    flow30d: "+$9.7M",
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
    aum: "$534M",
    flow30d: "+$12.2M",
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
    aum: "$188M",
    flow30d: "+$31.6M",
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
    aum: "$362M",
    flow30d: "+$6.3M",
    seed: 149,
    drift: 0.0035,
    vol: 0.012,
  },
];

// Politician portfolio trackers — rebuilt from public STOCK Act disclosures
const POLITICIANS: (Omit<StrategyTickerProps, "onSubscribe"> & { avatarColor: string; cta: string })[] = [
  {
    name: "Pelosi Tracker",
    category: "D — California · House",
    risk: "Most followed",
    annualReturn: "+46.9%",
    vsBenchmark: "vs S&P 500 +24.5%",
    sharpe: "1.5",
    minimum: "$100",
    aum: "$823M",
    flow30d: "+$92.4M",
    seed: 517,
    drift: 0.0095,
    vol: 0.05,
    avatarColor: "linear-gradient(135deg, #4A6FA5 0%, #2E4A78 100%)",
    cta: "Follow",
  },
  {
    name: "Crenshaw Tracker",
    category: "R — Texas · House",
    risk: "Trending",
    annualReturn: "+38.7%",
    vsBenchmark: "vs S&P 500 +16.3%",
    sharpe: "1.4",
    minimum: "$100",
    aum: "$214M",
    flow30d: "+$18.9M",
    seed: 839,
    drift: 0.0085,
    vol: 0.045,
    avatarColor: "linear-gradient(135deg, #A55555 0%, #78302E 100%)",
    cta: "Follow",
  },
  {
    name: "Greene Tracker",
    category: "R — Georgia · House",
    risk: "New",
    annualReturn: "+27.4%",
    vsBenchmark: "vs S&P 500 +5.0%",
    sharpe: "1.2",
    minimum: "$100",
    aum: "$96M",
    flow30d: "+$7.1M",
    seed: 293,
    drift: 0.007,
    vol: 0.04,
    avatarColor: "linear-gradient(135deg, #A55555 0%, #78302E 100%)",
    cta: "Follow",
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
              <StrategyTicker {...s} />
            </FadeUp>
          ))}
        </div>

        {/* Politician portfolio trackers */}
        <FadeUp className="mt-24 text-center">
          <p
            className="text-[12px] sm:text-[13px] md:text-[14px] mb-3 md:mb-4"
            style={{ fontWeight: 500, color: "rgba(0, 0, 0, 0.50)" }}
          >
            Politician Portfolios
          </p>
          <h3
            className="text-[28px] sm:text-[34px] md:text-[44px]"
            style={{ fontWeight: 500, letterSpacing: "-1px", lineHeight: 1.05 }}
          >
            <span className="block" style={{ color: "rgba(0, 0, 0, 0.20)" }}>
              Follow the Smart Money
            </span>
            <span className="block" style={{ color: "#05050C" }}>
              in Washington
            </span>
          </h3>
          <p
            className="mx-auto mt-4 text-[14px] sm:text-[16px]"
            style={{ fontWeight: 500, color: "rgba(0, 0, 0, 0.40)", maxWidth: "540px" }}
          >
            Mirror the personal portfolios of Congress's most-watched traders —
            rebuilt from public STOCK Act disclosures the moment they're filed,
            and executed automatically in your account.
          </p>
        </FadeUp>

        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {POLITICIANS.map((p, i) => (
            <FadeUp key={p.name} delay={(i % 3) * 0.08}>
              <StrategyTicker {...p} />
            </FadeUp>
          ))}
        </div>

        <FadeUp className="mt-10 text-center">
          <p className="text-[13px]" style={{ fontWeight: 500, color: "rgba(0, 0, 0, 0.35)" }}>
            Live tickers show simulated NAV series. Returns shown are
            illustrative, net of fees, since inception. Politician portfolios
            are constructed from public congressional disclosure filings and
            are not affiliated with or endorsed by any individual named. Past
            performance does not guarantee future results.
          </p>
        </FadeUp>
      </div>
    </section>
  );
};

export default Strategies;
