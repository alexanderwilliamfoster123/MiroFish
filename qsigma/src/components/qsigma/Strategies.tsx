import { useState } from "react";
import FadeUp from "./FadeUp";
import FactsheetModal, { FactsheetData } from "./FactsheetModal";
import PortfolioCard from "@/components/ui/portfolio-card";
import StrategyTicker, { StrategyTickerProps } from "@/components/ui/strategy-ticker";
import { openCheckout } from "@/lib/checkout";

type PortfolioData = FactsheetData;

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
    // Full factsheet detail (Portfolio Research, as of 30 Jul 2026)
    asOf: "30 Jul 2026",
    period: "14 May 2013 – 30 Jul 2026",
    sessions: "3,321",
    assets: "50",
    minInvestment: "$2,100",
    totalReturn: "4,344.20%",
    avgMonth: "+2.54%",
    winningMonths: "69.2%",
    sortino: "2.63",
    targetOrders: "10,931",
    ordersPerMonth: "68.7",
    avgHolding: "44.0 days",
    turnover: "50.2x",
    beta: "0.69",
    correlation: "0.81",
    var95: "-1.70%",
    cvar95: "-2.51%",
    calmar: "1.75",
    alpha: "16.41%",
    infoRatio: "0.83",
    bestDay: "+9.86%",
    worstDay: "-7.48%",
    thesis:
      "Master Max applies a bounded capital-efficiency overlay rather than a new return forecast. The 1.90x NAV multiplier preserves Master's risk-on, defensive, and cash states instead of forcing every book to full gross. Marginable equities consume 50% outside-session initial margin and BTC consumes 100%, so the multiplier is reduced whenever the instrument mix would exceed the 95% ceiling.",
    role:
      "An aggressive companion to Master Portfolio for accounts that explicitly prioritize maximum deployment and can tolerate materially larger drawdowns and margin usage.",
    construction:
      "Dynamic equal weights across available children, netted at ticker level and multiplied by no more than 1.90x. Child cash remains cash; embedded leverage or non-marginable BTC can force a lower multiplier.",
    signals:
      "Build Master's revision-aware active-child set and equal-weight ticker lookthrough, net duplicate symbols, apply the 1.90x NAV multiplier, then reduce it only if any session event breaches the outside or regular-session margin ceiling.",
    execution:
      "Net child targets, cap the NAV multiplier at 1.90x, and reduce it whenever the 95% margin ceiling binds.",
    risks:
      "Margin amplifies child drawdowns, financing drag, liquidity demand, and correlated stress. Broker house margin, hard-to-borrow treatment, or instrument eligibility can be stricter than the research envelope.",
    monthly: [
      { year: "2013", months: [null, null, null, null, "-0.2%", "-0.4%", "+0.2%", "-3.8%", "+1.5%", "+6.1%", "+2.8%", "+3.1%"], total: "+9.5%" },
      { year: "2014", months: ["-2.3%", "+3.2%", "+0.9%", "-0.2%", "+1.0%", "+1.6%", "-4.9%", "+5.6%", "-0.6%", "+10.2%", "+4.0%", "-1.6%"], total: "+17.4%" },
      { year: "2015", months: ["-0.0%", "+4.4%", "-3.3%", "+1.4%", "+0.6%", "-1.8%", "+1.5%", "-6.7%", "-2.9%", "+17.2%", "-1.0%", "-3.3%"], total: "+4.4%" },
      { year: "2016", months: ["-3.8%", "+3.4%", "+9.5%", "+2.0%", "+3.4%", "-0.3%", "+5.3%", "+0.9%", "+4.0%", "-0.2%", "+8.6%", "+4.3%"], total: "+43.1%" },
      { year: "2017", months: ["+4.2%", "+5.2%", "-0.4%", "+1.3%", "+2.3%", "-0.2%", "+3.1%", "+1.6%", "+0.5%", "+2.9%", "+2.1%", "+3.3%"], total: "+28.8%" },
      { year: "2018", months: ["+9.0%", "-2.9%", "-2.2%", "+1.1%", "+1.9%", "+1.3%", "+4.2%", "+2.7%", "+0.3%", "-3.9%", "+2.8%", "-6.6%"], total: "+7.0%" },
      { year: "2019", months: ["+9.9%", "+3.2%", "+4.0%", "+3.5%", "-7.9%", "+10.5%", "+3.2%", "+4.1%", "+1.6%", "+3.1%", "+2.2%", "+6.5%"], total: "+52.1%" },
      { year: "2020", months: ["-1.0%", "-2.9%", "+1.5%", "+18.1%", "+9.1%", "+7.7%", "+11.1%", "+8.7%", "-3.2%", "-4.3%", "+20.2%", "+7.2%"], total: "+95.2%" },
      { year: "2021", months: ["+1.4%", "+3.5%", "+6.1%", "+3.6%", "+3.1%", "+1.2%", "+2.8%", "+3.0%", "-3.7%", "+10.0%", "-1.2%", "+3.9%"], total: "+38.8%" },
      { year: "2022", months: ["-4.9%", "-1.8%", "+5.1%", "-4.7%", "+2.2%", "-3.0%", "+7.7%", "-2.9%", "-10.2%", "+10.5%", "+7.5%", "-1.0%"], total: "+2.7%" },
      { year: "2023", months: ["+8.9%", "-2.8%", "+6.9%", "+0.6%", "+0.9%", "+4.6%", "+3.4%", "-2.5%", "-4.2%", "+1.4%", "+9.8%", "+9.3%"], total: "+41.4%" },
      { year: "2024", months: ["-0.7%", "+8.7%", "+5.9%", "-4.6%", "+5.4%", "+0.3%", "+7.2%", "+3.2%", "+7.7%", "-0.7%", "+12.8%", "-4.8%"], total: "+46.3%" },
      { year: "2025", months: ["+5.5%", "-1.0%", "+0.1%", "+3.7%", "+7.5%", "+5.7%", "+3.8%", "+2.4%", "+10.3%", "+7.6%", "+2.0%", "+1.8%"], total: "+61.3%" },
      { year: "2026", months: ["+11.1%", "+9.0%", "-11.4%", "+9.6%", "+2.8%", "-0.1%", "-1.6%", null, null, null, null, null], total: "+19.0%" },
    ],
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
        className="font-display whitespace-nowrap text-[22px] sm:text-[26px]"
        style={{ fontWeight: 600, letterSpacing: "-0.5px", color: "#05050C" }}
      >
        {children}
      </h3>
      <div className="h-px w-full" style={{ backgroundColor: "rgba(0,0,0,0.10)" }} />
    </FadeUp>
  );
}

const Strategies = () => {
  const [sheet, setSheet] = useState<PortfolioData | null>(null);

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
            Every Squared³ strategy is researched, executed, and rebalanced
            end-to-end by our AI engine. Pick the ones that fit your goals and
            subscribe in one tap.
          </p>
        </FadeUp>

        {/* Flagship portfolios */}
        <GroupTitle>Flagship portfolios</GroupTitle>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {FLAGSHIPS.map((p, i) => (
            <FadeUp key={p.name} delay={i * 0.08}>
              <PortfolioCard {...p} onOpenFactsheet={() => setSheet(p)} onSubscribe={() => openCheckout(p.name)} />
            </FadeUp>
          ))}
        </div>

        {/* Strategy portfolios */}
        <GroupTitle>Strategy portfolios</GroupTitle>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {PORTFOLIOS.map((p, i) => (
            <FadeUp key={p.name} delay={(i % 3) * 0.08}>
              <PortfolioCard {...p} onOpenFactsheet={() => setSheet(p)} onSubscribe={() => openCheckout(p.name)} />
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
            className="font-display text-[28px] sm:text-[34px] md:text-[44px]"
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
              <StrategyTicker {...p} onSubscribe={() => openCheckout(p.name)} />
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

      <FactsheetModal
        portfolio={sheet}
        onClose={() => setSheet(null)}
        onSubscribe={() => {
          const name = sheet?.name;
          setSheet(null);
          if (name) openCheckout(name);
        }}
      />
    </section>
  );
};

export default Strategies;
