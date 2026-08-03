import FadeUp from "./FadeUp";
import { openCheckout } from "@/lib/checkout";

const FEATURES = [
  "Every strategy and flagship portfolio, live capital",
  "Politician portfolio trackers included",
  "Unlimited allocation changes",
  "Real-time execution alerts",
  "Automated tax-lot reporting",
  "US CPA-audited performance",
  "Priority support",
];

const Check = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M20 6 9 17l-5-5"
      stroke="#A3B18A"
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
            Pricing
          </p>
          <h2
            className="text-[32px] sm:text-[40px] md:text-[52px]"
            style={{ fontWeight: 500, letterSpacing: "-1.2px", lineHeight: 1.05 }}
          >
            <span className="block" style={{ color: "rgba(0, 0, 0, 0.20)" }}>
              One Simple Fee,
            </span>
            <span className="block" style={{ color: "#05050C" }}>
              Every Strategy
            </span>
          </h2>
          <p
            className="mx-auto mt-4 md:mt-5 text-[14px] sm:text-[16px]"
            style={{ fontWeight: 500, color: "rgba(0, 0, 0, 0.40)", maxWidth: "480px" }}
          >
            No tiers, no seats, no surprises — one transparent price to join,
            and every fee disclosed.
          </p>
        </FadeUp>

        <FadeUp delay={0.1}>
          <article
            className="relative mx-auto mt-14 flex w-full max-w-[560px] flex-col"
            style={{
              backgroundColor: "#05050C",
              borderRadius: "20px",
              padding: "40px 36px",
            }}
          >
            <span
              className="absolute right-7 top-7 text-[11px]"
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
              All access
            </span>

            <h3
              className="text-[16px]"
              style={{ fontWeight: 600, color: "rgba(255,255,255,0.85)" }}
            >
              QSigma
            </h3>
            <div className="mt-4 flex items-baseline gap-2">
              <span
                className="text-[56px]"
                style={{
                  fontWeight: 500,
                  letterSpacing: "-2px",
                  lineHeight: 1,
                  color: "#FFFFFF",
                }}
              >
                $2,497
              </span>
              <span
                className="text-[15px]"
                style={{ fontWeight: 500, color: "rgba(255,255,255,0.45)" }}
              >
                once — lifetime access
              </span>
            </div>
            <p
              className="mt-3 text-[13px]"
              style={{ fontWeight: 500, color: "rgba(255,255,255,0.45)" }}
            >
              One transparent onboarding fee, then a light 0.50% of AUM per
              month billed on average assets. Every fee disclosed — nothing
              hidden.
            </p>

            <ul className="mt-7 flex flex-col gap-3">
              {FEATURES.map((f) => (
                <li
                  key={f}
                  className="flex items-center gap-2.5 text-[14px]"
                  style={{ fontWeight: 500, color: "rgba(255,255,255,0.75)" }}
                >
                  <Check />
                  {f}
                </li>
              ))}
            </ul>

            <button
              onClick={() => openCheckout("QSigma All Access")}
              className="mt-9 w-full transition-colors duration-200 hover:bg-[#E8E8E4]"
              style={{
                backgroundColor: "#FFFFFF",
                color: "#05050C",
                fontFamily: "inherit",
                fontWeight: 600,
                fontSize: "13px",
                borderRadius: "9999px",
                border: "none",
                padding: "13px 20px",
                cursor: "pointer",
              }}
            >
              Get started
            </button>
            <p
              className="mt-4 text-center text-[12px]"
              style={{ fontWeight: 500, color: "rgba(255,255,255,0.35)" }}
            >
              No lock-ups. Withdraw anytime.
            </p>
          </article>
        </FadeUp>
      </div>
    </section>
  );
};

export default Pricing;
