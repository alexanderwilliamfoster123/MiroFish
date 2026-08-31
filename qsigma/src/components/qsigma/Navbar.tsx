import { motion } from "framer-motion";
import { Globe } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Logo from "./Logo";
import { scrollToId } from "@/lib/nav";

const NAV_LINKS = [
  { label: "PLATFORM", id: "platform" },
  { label: "STRATEGIES", id: "strategies" },
  { label: "CALCULATOR", id: "calculator" },
  { label: "PRICING", id: "pricing" },
];

interface NavbarProps {
  /** True once the page has scrolled past the hero — switches to the solid white header */
  dark?: boolean;
  onLaunch?: () => void;
}

const Navbar = ({ dark: scrolled = false, onLaunch }: NavbarProps) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const goToSection = (id: string) => {
    if (pathname === "/") scrollToId(id);
    else navigate("/", { state: { scrollTo: id } });
  };
  return (
    <motion.nav
      initial={{ opacity: 0, y: -12 }}
      animate={{
        opacity: 1,
        y: 0,
        backgroundColor: scrolled ? "rgba(255,255,255,1)" : "rgba(255,255,255,0)",
        boxShadow: scrolled
          ? "0 1px 0 rgba(0,0,0,0.06), 0 8px 24px rgba(5,5,12,0.04)"
          : "0 0 0 rgba(0,0,0,0)",
      }}
      transition={{
        opacity: { duration: 0.7, ease: "easeOut" },
        y: { duration: 0.7, ease: "easeOut" },
        backgroundColor: { duration: 0.25, ease: "easeOut" },
        boxShadow: { duration: 0.25, ease: "easeOut" },
      }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-5"
    >
      <Link to="/" aria-label="Squared³ home" style={{ textDecoration: "none" }}>
        <Logo />
      </Link>

      <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-8 text-[13px] tracking-tight">
        {NAV_LINKS.map((link) => (
          <button
            key={link.label}
            type="button"
            onClick={() => goToSection(link.id)}
            style={{
              fontWeight: 500,
              color: "#111111",
              textTransform: "uppercase",
              letterSpacing: "1.5px",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: "inherit",
              padding: 0,
            }}
            className="hover:opacity-60 transition-opacity duration-200"
          >
            {link.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="hidden md:flex items-center gap-2 text-[14px]"
          style={{ fontWeight: 400, color: "#111111" }}
        >
          <Globe size={18} color="#111111" />
          <span>English</span>
        </button>

        {scrolled && (
          <motion.button
            type="button"
            onClick={onLaunch}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="hidden md:flex items-center rounded-full px-5 py-2 text-[14px] transition-colors duration-200 hover:bg-zinc-200"
            style={{ fontWeight: 400, color: "#111111", backgroundColor: "#F1F1F0" }}
          >
            Request access
          </motion.button>
        )}

        <button
          type="button"
          onClick={onLaunch}
          className="flex items-center rounded-full pl-2 pr-5 py-2 gap-3 transition-colors duration-200 hover:bg-[#333333]"
          style={{ fontWeight: 400, backgroundColor: "#111111", color: "#FFFFFF" }}
        >
          <svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="8" cy="8" r="6.6667" fill="#FFFFFF" />
            <path d="M10.3534 8.68665L8.35337 10.6866C8.25337 10.7866 8.12671 10.8333 8.00004 10.8333C7.87337 10.8333 7.74671 10.7866 7.64671 10.6866L5.64671 8.68665C5.45337 8.49331 5.45337 8.17331 5.64671 7.97998C5.84004 7.78665 6.16004 7.78665 6.35337 7.97998L7.50004 9.12665V5.66665C7.50004 5.39331 7.72671 5.16665 8.00004 5.16665C8.27337 5.16665 8.50004 5.39331 8.50004 5.66665V9.12665L9.64671 7.97998C9.84004 7.78665 10.16 7.78665 10.3534 7.97998C10.5467 8.17331 10.5467 8.49331 10.3534 8.68665Z" fill="#111111" />
          </svg>
          <span
            className="w-px self-stretch -my-2"
            style={{ backgroundColor: "rgba(255,255,255,0.4)" }}
          />
          <span className="text-[14px]">Launch app</span>
        </button>
      </div>
    </motion.nav>
  );
};

export default Navbar;
