import { useState } from "react";
import FadeUp from "./FadeUp";
import { openCheckout } from "@/lib/checkout";

/**
 * Objection-handling FAQ. Order mirrors the real objection funnel:
 * how it works → custody/safety → cost → proof → exit risk → choice paralysis.
 */
const FAQS = [
  {
    q: "How does Squared³ actually work?",
    a: "You subscribe once, connect the brokerage you already use — Public.com or Alpaca — and choose your strategies. Every trade executes directly in your own account and you can watch each position in real time. There is nothing to transfer and no new account to fund.",
  },
  {
    q: "Does Squared³ ever hold my money?",
    a: "Never. Your capital stays in your own regulated US brokerage account at all times. Squared³ sends execution instructions to your account — we have no ability to withdraw, and you can disconnect us with one click. You always keep custody.",
  },
  {
    q: "What does it cost — exactly?",
    a: "One $2,497 onboarding fee for lifetime access to every strategy, then 0.50% of assets under management per month, billed on average assets. No performance fees, no per-trade fees, no hidden brokerage spreads. Every fee is disclosed before you pay anything.",
  },
  {
    q: "Are the returns real?",
    a: "Every portfolio has run in our backtesting environment since January 2013, and live performance is audited by a US CPA. Each strategy's factsheet carries an independent audit link so you can verify the numbers yourself before subscribing.",
  },
  {
    q: "What if I want out?",
    a: "There are no lock-ups and no exit fees. Your money never left your brokerage, so leaving means disconnecting — your positions and cash are already yours, exactly where they have always been.",
  },
  {
    q: "Which strategy should I start with?",
    a: "Most members start with a flagship — Master Max for growth or Master Portfolio for a smoother ride — and use the calculator to compare. One fee covers every strategy, and you can change allocations as often as you like, so the first pick is never a commitment.",
  },
];

const Faq = () => {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section
      id="faq"
      style={{
        backgroundColor: "#F2F2F0",
        padding: "110px 24px",
        borderTop: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <div className="mx-auto max-w-[780px]">
        <FadeUp className="text-center">
          <p
            className="text-[12px] sm:text-[13px] md:text-[14px] mb-3 md:mb-4"
            style={{ fontWeight: 500, color: "rgba(0, 0, 0, 0.50)" }}
          >
            FAQ
          </p>
          <h2
            className="text-[32px] sm:text-[40px] md:text-[48px]"
            style={{ fontWeight: 500, letterSpacing: "-1px", lineHeight: 1.05, color: "#05050C" }}
          >
            Before you ask
          </h2>
        </FadeUp>

        <FadeUp delay={0.1} className="mt-12">
          <div style={{ borderTop: "1px solid rgba(0,0,0,0.10)" }}>
            {FAQS.map((f, i) => {
              const isOpen = open === i;
              return (
                <div key={f.q} style={{ borderBottom: "1px solid rgba(0,0,0,0.10)" }}>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-6 py-6 text-left"
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    <span
                      className="text-[16px] sm:text-[18px]"
                      style={{ fontWeight: 600, color: "#05050C" }}
                    >
                      {f.q}
                    </span>
                    <span
                      aria-hidden="true"
                      className="shrink-0 text-[22px] leading-none transition-transform duration-200"
                      style={{
                        color: "rgba(0,0,0,0.40)",
                        transform: isOpen ? "rotate(45deg)" : "none",
                      }}
                    >
                      +
                    </span>
                  </button>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateRows: isOpen ? "1fr" : "0fr",
                      transition: "grid-template-rows 0.28s cubic-bezier(0.22, 1, 0.36, 1)",
                    }}
                  >
                    <div style={{ overflow: "hidden" }}>
                      <p
                        className="pb-6 pr-10 text-[14px] sm:text-[15px]"
                        style={{
                          fontWeight: 500,
                          color: "rgba(0,0,0,0.55)",
                          lineHeight: 1.65,
                          margin: 0,
                        }}
                      >
                        {f.a}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </FadeUp>

        <FadeUp delay={0.15} className="mt-10 flex flex-col items-center gap-3 text-center">
          <button
            type="button"
            onClick={() => openCheckout("Squared³ All Access")}
            className="h-11 px-7 rounded-full bg-black text-white text-[14px] font-semibold transition-colors hover:bg-zinc-800"
            style={{ cursor: "pointer", border: "none" }}
          >
            Get started
          </button>
          <p className="text-[13px]" style={{ fontWeight: 500, color: "rgba(0,0,0,0.40)" }}>
            Something else on your mind?{" "}
            <a href="mailto:info@squaredq.com" style={{ color: "rgba(0,0,0,0.70)" }}>
              info@squaredq.com
            </a>
          </p>
        </FadeUp>
      </div>
    </section>
  );
};

export default Faq;
