import FadeUp from "./FadeUp";

/**
 * Press coverage. Outlets are real placements — drop each article's URL
 * into `href` as they go live; rows without an href render as plain text.
 */
export type PressItem = {
  outlet: string;
  headline: string;
  date: string;
  serif?: boolean;
  href?: string;
};

export const PRESS: PressItem[] = [
  {
    outlet: "Fortune",
    headline: "The AI wealth startup betting that transparency beats hidden fees",
    date: "Aug 2026",
    serif: true,
  },
  {
    outlet: "USA Today",
    headline: "Retail investors can now run hedge-fund-style strategies without giving up custody",
    date: "Aug 2026",
  },
  {
    outlet: "Business Insider",
    headline: "This AI trading platform executes in your own brokerage account — and shows the audits to prove it",
    date: "Aug 2026",
  },
  {
    outlet: "Investing.com",
    headline: "Squared³ launches lifetime-access platform bringing audited algorithmic strategies to retail brokerages",
    date: "Jul 2026",
  },
  {
    outlet: "The Street",
    headline: "One fee, every strategy: inside Squared³'s pricing gambit",
    date: "Jul 2026",
  },
  {
    outlet: "Benzinga",
    headline: "Squared³ opens flagship Master Max strategy to Public.com and Alpaca accounts",
    date: "Jul 2026",
  },
  {
    outlet: "Chicago Tribune",
    headline: "New trading platform pitches audited returns to everyday investors",
    date: "Jul 2026",
    serif: true,
  },
  {
    outlet: "HackerNoon",
    headline: "How Squared³ fuses 11,000 signal streams into microsecond trading decisions",
    date: "Jun 2026",
  },
  {
    outlet: "Global Banking & Finance",
    headline: "Self-evolving AI meets regulated US brokerages in Squared³ launch",
    date: "Jun 2026",
  },
  {
    outlet: "BizJournals National",
    headline: "Fintech startup Squared³ debuts lifetime-access trading membership",
    date: "Jun 2026",
  },
  {
    outlet: "NY Daily News",
    headline: "AI trading comes to your brokerage app — no transfer required",
    date: "Jun 2026",
    serif: true,
  },
  {
    outlet: "Miami Herald",
    headline: "Squared³ brings politician-tracker portfolios and audited algos to retail",
    date: "Jun 2026",
    serif: true,
  },
  {
    outlet: "Digital Journal",
    headline: "Squared³ announces CPA-audited strategy marketplace for self-custody investors",
    date: "Jun 2026",
  },
];

const Press = () => {
  return (
    <section
      id="press"
      style={{
        backgroundColor: "#FFFFFF",
        padding: "110px 24px",
        borderTop: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <div className="mx-auto max-w-[1100px]">
        <FadeUp className="text-center">
          <p
            className="text-[12px] sm:text-[13px] md:text-[14px] mb-3 md:mb-4"
            style={{ fontWeight: 500, color: "rgba(0, 0, 0, 0.50)" }}
          >
            Press
          </p>
          <h2
            className="text-[32px] sm:text-[40px] md:text-[48px]"
            style={{ fontWeight: 500, letterSpacing: "-1px", lineHeight: 1.05, color: "#05050C" }}
          >
            <span className="block" style={{ color: "rgba(0,0,0,0.20)" }}>
              Don't take
            </span>
            <span className="block">our word for it</span>
          </h2>
        </FadeUp>

        <FadeUp delay={0.1} className="mt-14">
          <div
            className="grid grid-cols-1 md:grid-cols-2"
            style={{ borderTop: "1px solid rgba(0,0,0,0.10)" }}
          >
            {PRESS.map((p) => {
              const inner = (
                <>
                  <div className="flex items-baseline justify-between gap-4">
                    <span
                      className="text-[12px] uppercase"
                      style={{
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        color: "#05050C",
                        fontFamily: p.serif
                          ? 'Georgia, "Times New Roman", serif'
                          : "inherit",
                      }}
                    >
                      {p.outlet}
                    </span>
                    <span
                      className="shrink-0 text-[12px]"
                      style={{ fontWeight: 500, color: "rgba(0,0,0,0.35)" }}
                    >
                      {p.date}
                    </span>
                  </div>
                  <p
                    className="mt-2 text-[15px]"
                    style={{
                      fontWeight: 500,
                      color: "rgba(0,0,0,0.60)",
                      lineHeight: 1.5,
                      margin: "8px 0 0",
                    }}
                  >
                    {p.headline}
                  </p>
                </>
              );
              const cellClass = "py-6 pr-8 md:odd:pr-10 md:even:pl-10 block";
              const cellStyle = {
                borderBottom: "1px solid rgba(0,0,0,0.10)",
                textDecoration: "none",
              };
              return p.href ? (
                <a key={p.outlet} href={p.href} target="_blank" rel="noopener noreferrer" className={cellClass} style={cellStyle}>
                  {inner}
                </a>
              ) : (
                <div key={p.outlet} className={cellClass} style={cellStyle}>
                  {inner}
                </div>
              );
            })}
          </div>
        </FadeUp>
      </div>
    </section>
  );
};

export default Press;
