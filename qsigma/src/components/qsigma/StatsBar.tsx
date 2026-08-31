import FadeUp from "./FadeUp";

const SEEN_IN = [
  { name: "Fortune", serif: true },
  { name: "USA Today" },
  { name: "Business Insider" },
  { name: "Investing.com" },
  { name: "The Street" },
  { name: "Benzinga" },
  { name: "Chicago Tribune", serif: true },
];

const STATS = [
  { value: "$2.4B", label: "Assets under strategy" },
  { value: "31,000+", label: "Active subscribers" },
  { value: "12", label: "Live AI strategies" },
  { value: "+33.27%", label: "Avg. annual return", accent: true },
];

const StatsBar = () => {
  return (
    <section
      id="stats"
      style={{ backgroundColor: "#05050C", padding: "96px 24px" }}
    >
      {/* As seen in — press strip */}
      <FadeUp className="mx-auto mb-16 max-w-[1100px]">
        <p
          className="text-center text-[11px] uppercase"
          style={{ fontWeight: 600, letterSpacing: "0.16em", color: "rgba(255,255,255,0.35)" }}
        >
          As seen in
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          {SEEN_IN.map((o) => (
            <span
              key={o.name}
              className="whitespace-nowrap text-[15px] sm:text-[17px]"
              style={{
                fontWeight: o.serif ? 600 : 700,
                letterSpacing: o.serif ? "0.01em" : "-0.02em",
                color: "rgba(255,255,255,0.42)",
                fontFamily: o.serif ? 'Georgia, "Times New Roman", serif' : "inherit",
              }}
            >
              {o.name}
            </span>
          ))}
          <a
            href="#press"
            className="whitespace-nowrap text-[13px] transition-colors duration-200"
            style={{ fontWeight: 600, color: "rgba(255,255,255,0.55)", textDecoration: "none" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#FFFFFF")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}
          >
            + 6 more →
          </a>
        </div>
      </FadeUp>

      <div className="mx-auto grid max-w-[1100px] grid-cols-2 gap-y-12 lg:grid-cols-4"
      >
        {STATS.map((stat, i) => (
          <FadeUp key={stat.label} delay={i * 0.08} className="text-center">
            <div
              className="text-[36px] sm:text-[44px] md:text-[52px]"
              style={{
                fontWeight: 500,
                letterSpacing: "-1px",
                lineHeight: 1.1,
                color: stat.accent ? "#A3B18A" : "#FFFFFF",
              }}
            >
              {stat.value}
            </div>
            <div
              className="mt-2 text-[13px] md:text-[14px]"
              style={{ fontWeight: 500, color: "rgba(255, 255, 255, 0.45)" }}
            >
              {stat.label}
            </div>
          </FadeUp>
        ))}
      </div>
      <FadeUp className="mt-14 text-center" delay={0.3}>
        <a
          href="#strategies"
          className="text-[13px] transition-colors duration-200"
          style={{
            fontWeight: 500,
            letterSpacing: "0.5px",
            color: "rgba(255,255,255,0.50)",
            textDecoration: "none",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#FFFFFF")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.50)")}
        >
          See the strategies behind the numbers →
        </a>
      </FadeUp>
    </section>
  );
};

export default StatsBar;
