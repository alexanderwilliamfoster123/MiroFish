import FadeUp from "./FadeUp";

interface Tier {
  name: string;
  price: string;
  period: string;
  blurb: string;
  features: string[];
  highlighted?: boolean;
  cta: string;
}

const TIERS: Tier[] = [
  {
    name: "Core",
    price: "$0",
    period: "/month",
    blurb: "Learn the platform with zero commitment.",
    features: [
      "Paper-trade every strategy",
      "Live performance tracking",
      "Weekly AI market brief",
      "Community insights",
    ],
    cta: "Start free",
  },
  {
    name: "Plus",
    price: "$29",
    period: "/month",
    blurb: "Full access to every live strategy.",
    features: [
      "All 12 strategies, live capital",
      "Unlimited allocation changes",
      "Real-time execution alerts",
      "Automated tax-lot reporting",
      "Priority support",
    ],
    highlighted: true,
    cta: "Get Plus",
  },
  {
    name: "Private",
    price: "0.75%",
    period: "/year AUM",
    blurb: "For portfolios above $250,000.",
    features: [
      "Everything in Plus",
      "Custom AI mandates",
      "Tax-loss harvesting",
      "Dedicated advisor",
    ],
    cta: "Talk to us",
  },
];

const Check = ({ dark }: { dark?: boolean }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M20 6 9 17l-5-5"
      stroke={dark ? "#A3B18A" : "#5F7052"}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Pricing = () => {
  return (
    <section
      id="pricing"
      style={{ backgroundColor: "#F2F2F0", padding: "120px 24px" }}
    >
      <div className="mx-auto max-w-[1100px]">
        <FadeUp className="text-center">
          <p
            className="text-[12px] sm:text-[13px] md:text-[14px] mb-3 md:mb-4"
            style={{ fontWeight: 500, color: "rgba(0, 0, 0, 0.50)" }}
          >
            Membership
          </p>
          <h2
            className="text-[32px] sm:text-[40px] md:text-[52px]"
            style={{ fontWeight: 500, letterSpacing: "-1.2px", lineHeight: 1.05 }}
          >
            <span className="block" style={{ color: "rgba(0, 0, 0, 0.20)" }}>
              One Subscription,
            </span>
            <span className="block" style={{ color: "#05050C" }}>
              Every Strategy
            </span>
          </h2>
        </FadeUp>

        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
          {TIERS.map((tier, i) => {
            const dark = tier.highlighted;
            return (
              <FadeUp key={tier.name} delay={i * 0.08}>
                <article
                  className="relative flex h-full flex-col"
                  style={{
                    backgroundColor: dark ? "#05050C" : "#FFFFFF",
                    border: dark ? "1px solid #05050C" : "1px solid rgba(0, 0, 0, 0.07)",
                    borderRadius: "16px",
                    padding: "32px 28px",
                  }}
                >
                  {dark && (
                    <span
                      className="absolute right-6 top-6 text-[11px]"
                      style={{
                        fontWeight: 600,
                        letterSpacing: "0.5px",
                        textTransform: "uppercase",
                        color: "#A3B18A",
                        border: "1px solid rgba(163, 177, 138, 0.4)",
                        borderRadius: "9999px",
                        padding: "5px 10px",
                      }}
                    >
                      Most popular
                    </span>
                  )}
                  <h3
                    className="text-[16px]"
                    style={{
                      fontWeight: 600,
                      color: dark ? "rgba(255,255,255,0.85)" : "#05050C",
                    }}
                  >
                    {tier.name}
                  </h3>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span
                      className="text-[44px]"
                      style={{
                        fontWeight: 500,
                        letterSpacing: "-1.5px",
                        lineHeight: 1,
                        color: dark ? "#FFFFFF" : "#05050C",
                      }}
                    >
                      {tier.price}
                    </span>
                    <span
                      className="text-[14px]"
                      style={{
                        fontWeight: 500,
                        color: dark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.40)",
                      }}
                    >
                      {tier.period}
                    </span>
                  </div>
                  <p
                    className="mt-3 text-[14px]"
                    style={{
                      fontWeight: 500,
                      color: dark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.45)",
                    }}
                  >
                    {tier.blurb}
                  </p>

                  <ul className="mt-6 flex flex-col gap-3">
                    {tier.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-center gap-2.5 text-[14px]"
                        style={{
                          fontWeight: 500,
                          color: dark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.60)",
                        }}
                      >
                        <Check dark={dark} />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <button
                    className={`mt-8 w-full transition-colors duration-200 ${
                      dark ? "hover:bg-[#E8E8E4]" : "hover:bg-[#333333]"
                    }`}
                    style={{
                      backgroundColor: dark ? "#FFFFFF" : "#111111",
                      color: dark ? "#05050C" : "#FFFFFF",
                      fontFamily: "inherit",
                      fontWeight: 600,
                      fontSize: "13px",
                      borderRadius: "9999px",
                      border: "none",
                      padding: "12px 20px",
                      cursor: "pointer",
                      marginTop: "auto",
                    }}
                  >
                    {tier.cta}
                  </button>
                </article>
              </FadeUp>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
