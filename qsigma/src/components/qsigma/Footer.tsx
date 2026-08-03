const COLUMNS = [
  {
    title: "Platform",
    links: ["Strategies", "Performance", "Pricing", "Security"],
  },
  {
    title: "Company",
    links: ["About", "Careers", "Press", "Contact"],
  },
  {
    title: "Legal",
    links: ["Terms", "Privacy", "Disclosures", "Licenses"],
  },
];

const Footer = () => {
  return (
    <footer style={{ backgroundColor: "#05050C", padding: "72px 40px 40px" }}>
      <div className="mx-auto max-w-[1100px]">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2">
            <span
              style={{
                fontWeight: 700,
                fontSize: "22px",
                letterSpacing: "-0.5px",
                color: "#FFFFFF",
              }}
            >
              QSigma
            </span>
            <p
              className="mt-3 text-[13px]"
              style={{
                fontWeight: 500,
                color: "rgba(255, 255, 255, 0.40)",
                maxWidth: "280px",
                lineHeight: 1.6,
              }}
            >
              AI-run wealth management. Subscribe to strategies, let the engine
              do the rest.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3
                className="text-[12px]"
                style={{
                  fontWeight: 600,
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  color: "rgba(255, 255, 255, 0.35)",
                }}
              >
                {col.title}
              </h3>
              <ul className="mt-4 flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-[14px] transition-opacity duration-200 hover:opacity-60"
                      style={{
                        fontWeight: 500,
                        color: "rgba(255, 255, 255, 0.75)",
                        textDecoration: "none",
                      }}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="mt-16 flex flex-col gap-4 pt-6 md:flex-row md:items-center md:justify-between"
          style={{ borderTop: "1px solid rgba(255, 255, 255, 0.08)" }}
        >
          <p className="text-[12px]" style={{ fontWeight: 500, color: "rgba(255, 255, 255, 0.30)" }}>
            © 2026 QSigma. All rights reserved.
          </p>
          <p
            className="text-[12px] md:max-w-[560px] md:text-right"
            style={{ fontWeight: 500, color: "rgba(255, 255, 255, 0.30)", lineHeight: 1.6 }}
          >
            Investing involves risk, including possible loss of principal. Past
            performance does not guarantee future results. Strategy returns
            shown are illustrative.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
