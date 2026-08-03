import FadeUp from "./FadeUp";
import PortfolioCard, { PortfolioCardProps } from "@/components/ui/portfolio-card";
import StrategyTicker, { StrategyTickerProps } from "@/components/ui/strategy-ticker";

type PortfolioData = Omit<PortfolioCardProps, "onSubscribe">;

const FLAGSHIPS: PortfolioData[] = [
  {
    name: "Master Max",
    kind: "Max-leverage multi-strategy",
    description:
      "The dynamic equal-weight Master Portfolio multiplied by up to 1.90x NAV. A 95% Alpaca initial-margin ceiling can only reduce that multiplier, preserving intentional cash and defensive allocations.",
    accent: "#E8927C",
    cagr: 33.3,
    volatility: 17.9,
    maxDrawdown: -19.0,
    sharpe: "1.70",
    benchmark: "QQQ",
    history: "2013–2026",
    seed: 641,
    drift: 0.0075,
    vol: 0.045,
  },
  {
    name: "Master Portfolio",
    kind: "Equal-weight multi-strategy",
    description:
      "A dynamic equal-weight blend of all seven underlying strategy portfolios. It begins with the earliest child history and redistributes capital equally whenever another strategy becomes available.",
    accent: "#7FD4B4",
    cagr: 17.5,
    volatility: 9.7,
    maxDrawdown: -10.4,
    sharpe: "1.71",
    benchmark: "SPY",
    history: "2013–2026",
    seed: 389,
    drift: 0.0045,
    vol: 0.023,
  },
];

const PORTFOLIOS: PortfolioData[] = [
  {
    name: "Overnight",
    kind: "Close-to-open equity basket",
    description:
      "An equally weighted Capacity11 basket designed to isolate close-to-open returns across liquid US equities and ETFs. The account is invested overnight and exits after the following cash-market open.",
    accent: "#6FA8F5",
    cagr: 30.4,
    volatility: 13.2,
    maxDrawdown: -19.7,
    sharpe: "2.08",
    benchmark: "SPY",
    history: "2016–2026",
    seed: 173,
    drift: 0.007,
    vol: 0.033,
  },
  {
    name: "Top-Pick",
    kind: "Levered long/flat ETF signals",
    description:
      "Five independently researched long/flat ETF sleeves convert slow macro, liquidity, energy, and global-risk signals into broad equity, dividend, technology, defensive-consumer, and semiconductor exposure.",
    accent: "#E3C05B",
    cagr: 25.2,
    volatility: 16.9,
    maxDrawdown: -20.7,
    sharpe: "1.42",
    benchmark: "SPY",
    history: "2013–2026",
    seed: 947,
    drift: 0.006,
    vol: 0.042,
  },
  {
    name: "ORB",
    kind: "Tactical equity / session-aware",
    description:
      "A session-aware tactical equity portfolio led by QQQ, with smaller EEM and XLI diversifiers. It combines intraday opening-range trades, a passive equity anchor, and a one-session tactical overlay.",
    accent: "#8FD49B",
    cagr: 22.1,
    volatility: 14.6,
    maxDrawdown: -16.1,
    sharpe: "1.44",
    benchmark: "SPY",
    history: "2016–2026",
    seed: 311,
    drift: 0.0055,
    vol: 0.036,
  },
  {
    name: "GLD/BTC Core",
    kind: "Dual momentum / volatility capped",
    description:
      "A two-asset weekly strategy trading only GLD and BTC/USD. Three momentum horizons vote independently for gold, bitcoin, or cash, while a volatility cap scales each accepted vote.",
    accent: "#C79BF2",
    cagr: 18.1,
    volatility: 16.0,
    maxDrawdown: -17.7,
    sharpe: "1.13",
    benchmark: "BTC/USD B+H",
    history: "2021–2026",
    seed: 587,
    drift: 0.0045,
    vol: 0.04,
  },
  {
    name: "Coherent Economic",
    kind: "Macro-conditioned ETF allocation",
    description:
      "A 1.9x portfolio of four economically interpretable ETF sleeves spanning industrials, blue-chip equities, gold, and small caps. Each sleeve links a distinct economic channel to a long/flat allocation state.",
    accent: "#F2A65A",
    cagr: 13.6,
    volatility: 13.9,
    maxDrawdown: -20.0,
    sharpe: "0.99",
    benchmark: "60/40 SPY/TLT",
    history: "2013–2026",
    seed: 719,
    drift: 0.0035,
    vol: 0.035,
  },
  {
    name: "Macro Defensive",
    kind: "Multi-sleeve macro defensive",
    description:
      "A current-lookthrough blend of five true out-of-sample macro sleeves spanning household credit, consumer supply chains, housing renovation, broad human stress, and healthcare utilization.",
    accent: "#57C7B8",
    cagr: 10.1,
    volatility: 7.9,
    maxDrawdown: -13.8,
    sharpe: "1.26",
    benchmark: "60/40 SPY/TLT",
    history: "2017–2026",
    seed: 233,
    drift: 0.0027,
    vol: 0.02,
  },
  {
    name: "Defensive Momentum",
    kind: "Multi-model defensive momentum",
    description:
      "An equal-weight ensemble of HAA, VAA, DAA, GPM, and return-only protective-allocation variants. It rotates across global risk assets, rates, credit, real assets, and cash-like ETFs at completed month-ends.",
    accent: "#A8ABF0",
    cagr: 8.1,
    volatility: 8.5,
    maxDrawdown: -14.3,
    sharpe: "0.95",
    benchmark: "60/40 SPY/TLT",
    history: "2016–2026",
    seed: 461,
    drift: 0.0022,
    vol: 0.021,
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

function GroupTitle({ children }: { children: string }) {
  return (
    <FadeUp className="mt-16 mb-6 flex items-center gap-5">
      <h3
        className="whitespace-nowrap text-[22px] sm:text-[26px]"
        style={{ fontWeight: 600, letterSpacing: "-0.5px", color: "#05050C" }}
      >
        {children}
      </h3>
      <div className="h-px w-full" style={{ backgroundColor: "rgba(0,0,0,0.10)" }} />
    </FadeUp>
  );
}

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

        {/* Flagship portfolios */}
        <GroupTitle>Flagship portfolios</GroupTitle>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {FLAGSHIPS.map((p, i) => (
            <FadeUp key={p.name} delay={i * 0.08}>
              <PortfolioCard {...p} />
            </FadeUp>
          ))}
        </div>

        {/* Strategy portfolios */}
        <GroupTitle>Strategy portfolios</GroupTitle>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {PORTFOLIOS.map((p, i) => (
            <FadeUp key={p.name} delay={(i % 3) * 0.08}>
              <PortfolioCard {...p} />
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
            Live tickers show simulated NAV series. CAGR, volatility, drawdown,
            and Sharpe figures reflect backtested history over each portfolio's
            stated period, net of fees. Politician portfolios are constructed
            from public congressional disclosure filings and are not affiliated
            with or endorsed by any individual named. Past performance does not
            guarantee future results.
          </p>
        </FadeUp>
      </div>
    </section>
  );
};

export default Strategies;
