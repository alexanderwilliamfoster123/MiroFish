import FadeUp from "./FadeUp";

const ROWS = [
  { label: "Upfront fees", q: "None", c: "$10,000–$20,000" },
  { label: "Brokerage", q: "Regulated US brokers", c: "Offshore, unregulated" },
  { label: "Audited returns", q: "US CPA-audited", c: "None" },
  { label: "The “AI”", q: "Real — self-evolving models", c: "Set-and-forget marketing" },
];

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle cx="12" cy="12" r="10" stroke="#A3B18A" strokeWidth="1.8" />
    <path
      d="m8.5 12.5 2.3 2.3 4.7-5.3"
      stroke="#A3B18A"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M6 6l12 12M18 6 6 18"
      stroke="rgba(255,255,255,0.30)"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const cellPad = "22px 24px";

const Comparison = () => {
  return (
    <section
      id="compare"
      className="dark"
      style={{
        backgroundColor: "#05050C",
        padding: "120px 24px",
        borderTop: "1px solid rgba(255, 255, 255, 0.07)",
      }}
    >
      <div className="mx-auto max-w-[1100px]">
        <FadeUp className="text-center">
          <p
            className="text-[12px] sm:text-[13px] md:text-[14px] mb-3 md:mb-4"
            style={{ fontWeight: 500, color: "rgba(255, 255, 255, 0.50)" }}
          >
            Why QSigma
          </p>
          <h2
            className="text-[32px] sm:text-[40px] md:text-[52px]"
            style={{ fontWeight: 500, letterSpacing: "-1.2px", lineHeight: 1.05 }}
          >
            <span className="block" style={{ color: "rgba(255, 255, 255, 0.25)" }}>
              Same Category,
            </span>
            <span className="block" style={{ color: "#FFFFFF" }}>
              Different League
            </span>
          </h2>
        </FadeUp>

        <FadeUp delay={0.1}>
          <div className="mt-14 overflow-x-auto">
            <table
              className="w-full"
              style={{
                minWidth: "640px",
                borderCollapse: "collapse",
                border: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
                  <th style={{ padding: cellPad, width: "34%" }} />
                  <th
                    className="text-[16px]"
                    style={{
                      padding: cellPad,
                      fontWeight: 700,
                      letterSpacing: "-0.4px",
                      color: "#FFFFFF",
                      textAlign: "center",
                      width: "33%",
                      borderLeft: "1px solid rgba(255, 255, 255, 0.08)",
                    }}
                  >
                    QSigma
                  </th>
                  <th
                    className="text-[14px]"
                    style={{
                      padding: cellPad,
                      fontWeight: 500,
                      color: "rgba(255, 255, 255, 0.40)",
                      textAlign: "center",
                      width: "33%",
                      borderLeft: "1px solid rgba(255, 255, 255, 0.08)",
                    }}
                  >
                    Typical Competitors
                  </th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row) => (
                  <tr
                    key={row.label}
                    style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}
                  >
                    <td
                      className="text-[15px]"
                      style={{
                        padding: cellPad,
                        fontWeight: 500,
                        color: "rgba(255, 255, 255, 0.85)",
                      }}
                    >
                      {row.label}
                    </td>
                    <td
                      style={{
                        padding: cellPad,
                        borderLeft: "1px solid rgba(255, 255, 255, 0.08)",
                      }}
                    >
                      <span
                        className="flex items-center justify-center gap-2.5 text-center text-[14px]"
                        style={{ fontWeight: 500, color: "#FFFFFF" }}
                      >
                        <CheckIcon />
                        {row.q}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: cellPad,
                        borderLeft: "1px solid rgba(255, 255, 255, 0.08)",
                      }}
                    >
                      <span
                        className="flex items-center justify-center gap-2.5 text-center text-[14px]"
                        style={{ fontWeight: 500, color: "rgba(255, 255, 255, 0.40)" }}
                      >
                        <XIcon />
                        {row.c}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </FadeUp>
      </div>
    </section>
  );
};

export default Comparison;
