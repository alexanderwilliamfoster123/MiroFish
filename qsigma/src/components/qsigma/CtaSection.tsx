import { FormEvent, useState } from "react";
import FadeUp from "./FadeUp";

const CtaSection = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section
      className="relative overflow-hidden"
      style={{ backgroundColor: "#F2F2F0", padding: "140px 24px" }}
    >
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(220, 220, 215, 0.7) 0%, transparent 70%)",
        }}
      />
      <div className="relative mx-auto max-w-[720px] text-center">
        <FadeUp>
          <p
            className="text-[12px] sm:text-[13px] md:text-[14px] mb-3 md:mb-4"
            style={{ fontWeight: 500, color: "rgba(0, 0, 0, 0.50)" }}
          >
            Get Started
          </p>
          <h2
            className="text-[32px] sm:text-[40px] md:text-[52px]"
            style={{ fontWeight: 500, letterSpacing: "-1.2px", lineHeight: 1.05 }}
          >
            <span className="block" style={{ color: "rgba(0, 0, 0, 0.20)" }}>
              Your Money,
            </span>
            <span className="block" style={{ color: "#05050C" }}>
              Managed by Intelligence
            </span>
          </h2>
        </FadeUp>

        <FadeUp delay={0.15}>
          {submitted ? (
            <p
              className="mt-8 text-[15px]"
              style={{ fontWeight: 500, color: "#5F7052" }}
            >
              You're on the list — we'll be in touch shortly.
            </p>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mx-auto mt-8 flex w-full max-w-[440px] flex-col gap-3 sm:flex-row"
            >
              <input
                type="email"
                required
                placeholder="Your email"
                aria-label="Email address"
                className="flex-1"
                style={{
                  fontFamily: "inherit",
                  fontWeight: 500,
                  fontSize: "14px",
                  color: "#05050C",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid rgba(0, 0, 0, 0.12)",
                  borderRadius: "9999px",
                  padding: "13px 22px",
                  outline: "none",
                }}
              />
              <button
                type="submit"
                className="transition-colors duration-200 hover:bg-[#333333]"
                style={{
                  backgroundColor: "#111111",
                  color: "#FFFFFF",
                  fontFamily: "inherit",
                  fontWeight: 600,
                  fontSize: "13px",
                  borderRadius: "9999px",
                  border: "none",
                  padding: "13px 26px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                Request access
              </button>
            </form>
          )}
          <p
            className="mt-4 text-[13px]"
            style={{ fontWeight: 500, color: "rgba(0, 0, 0, 0.35)" }}
          >
            No lock-ups. Withdraw anytime.
          </p>
        </FadeUp>
      </div>
    </section>
  );
};

export default CtaSection;
