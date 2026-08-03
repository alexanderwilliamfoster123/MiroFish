import FadeUp from "./FadeUp";

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
