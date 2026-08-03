import FadeUp from "./FadeUp";

const STEPS = [
  {
    number: "01",
    title: "Fund your account",
    body: "Connect a bank or transfer an existing portfolio in minutes. Your capital stays in your name, held with regulated custodians.",
  },
  {
    number: "02",
    title: "Subscribe to strategies",
    body: "Browse live performance, risk profiles, and holdings. Allocate to any mix of strategies with a single tap — and switch anytime.",
  },
  {
    number: "03",
    title: "Let the AI compound",
    body: "QSigma's engine trades, hedges, and rebalances around the clock. You watch your portfolio grow in real time.",
  },
];

const HowItWorks = () => {
  return (
    <section
      id="platform"
      style={{ backgroundColor: "#ECECEA", padding: "120px 24px" }}
    >
      <div className="mx-auto max-w-[1100px]">
        <FadeUp className="text-center">
          <p
            className="text-[12px] sm:text-[13px] md:text-[14px] mb-3 md:mb-4"
            style={{ fontWeight: 500, color: "rgba(0, 0, 0, 0.50)" }}
          >
            How It Works
          </p>
          <h2
            className="text-[32px] sm:text-[40px] md:text-[52px]"
            style={{ fontWeight: 500, letterSpacing: "-1.2px", lineHeight: 1.05 }}
          >
            <span className="block" style={{ color: "rgba(0, 0, 0, 0.20)" }}>
              Three Steps to
            </span>
            <span className="block" style={{ color: "#05050C" }}>
              Autonomous Investing
            </span>
          </h2>
        </FadeUp>

        <div className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8">
          {STEPS.map((step, i) => (
            <FadeUp key={step.number} delay={i * 0.1}>
              <div
                className="text-[64px] md:text-[80px]"
                style={{
                  fontWeight: 500,
                  letterSpacing: "-2px",
                  lineHeight: 1,
                  color: "rgba(0, 0, 0, 0.12)",
                }}
              >
                {step.number}
              </div>
              <h3
                className="mt-4 text-[20px]"
                style={{ fontWeight: 600, color: "#05050C" }}
              >
                {step.title}
              </h3>
              <p
                className="mt-3 text-[14px] sm:text-[15px]"
                style={{
                  fontWeight: 500,
                  color: "rgba(0, 0, 0, 0.45)",
                  lineHeight: 1.6,
                  maxWidth: "340px",
                }}
              >
                {step.body}
              </p>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
