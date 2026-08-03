import { Globe } from "lucide-react";

const NAV_LINKS = ["DASHBOARD", "ASSETS", "ANALYTICS", "MARKETS"];

const Navbar = () => {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 grid grid-cols-3 items-center"
      style={{
        backgroundColor: "rgba(242, 242, 240, 0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        padding: "16px 40px",
      }}
    >
      <div className="justify-self-start">
        <a
          href="/"
          aria-label="QSigma home"
          className="flex items-center"
          style={{
            fontWeight: 700,
            fontSize: "22px",
            letterSpacing: "-0.5px",
            color: "#05050C",
            lineHeight: "28px",
            textDecoration: "none",
          }}
        >
          QSigma
        </a>
      </div>

      <div className="justify-self-center hidden md:flex">
        {NAV_LINKS.map((link) => (
          <a
            key={link}
            href="#"
            className="transition-opacity duration-200 hover:opacity-55"
            style={{
              fontWeight: 600,
              fontSize: "13px",
              letterSpacing: "1.5px",
              color: "#111111",
              padding: "8px 14px",
              textDecoration: "none",
            }}
          >
            {link}
          </a>
        ))}
      </div>

      <div className="justify-self-end flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2">
          <Globe size={16} color="#111111" strokeWidth={2} />
          <span style={{ fontWeight: 400, fontSize: "13px", color: "#111111" }}>
            English
          </span>
        </div>
        <button
          className="flex items-center gap-2 transition-colors duration-200 hover:bg-[#333333]"
          style={{
            backgroundColor: "#111111",
            borderRadius: "9999px",
            padding: "10px 20px",
            border: "none",
            cursor: "pointer",
          }}
        >
          <span
            className="flex items-center justify-center"
            style={{
              width: "18px",
              height: "18px",
              borderRadius: "9999px",
              backgroundColor: "rgba(255, 255, 255, 0.20)",
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "9999px",
                backgroundColor: "#FFFFFF",
              }}
            />
          </span>
          <span style={{ fontWeight: 600, fontSize: "13px", color: "#FFFFFF" }}>
            Launch app
          </span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
