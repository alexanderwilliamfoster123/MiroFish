import { motion } from "framer-motion";

const navItems = ["Dashboard", "Assets", "Analytics", "Markets"];

interface NavbarProps {
  dark?: boolean;
}

export default function Navbar({ dark = false }: NavbarProps) {
  const textColor = dark ? "#FFFFFF" : "#000000";
  const fontFamily = "HelveticaNeueCyr, Helvetica, Arial, sans-serif";

  return (
    <motion.nav
      initial={{ opacity: 0, y: -12 }}
      animate={{
        opacity: 1,
        y: 0,
        backgroundColor: dark ? "rgba(0,0,0,1)" : "rgba(0,0,0,0)",
      }}
      transition={{
        opacity: { duration: 0.7, ease: "easeOut" },
        y: { duration: 0.7, ease: "easeOut" },
        backgroundColor: { duration: 0.25, ease: "easeOut" },
      }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-6"
    >
      <img
        src="https://qclay.design/lovable/synex/logo.svg"
        alt="Synex"
        className="h-5 md:h-6 w-auto transition-[filter] duration-200"
        style={{ filter: dark ? "brightness(0) invert(1)" : "none" }}
      />
      <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-8 text-[13px] tracking-tight">
        {navItems.map((label) => (
          <a
            key={label}
            href="#"
            style={{ fontFamily, fontWeight: 500, color: textColor, textTransform: "uppercase" }}
            className="hover:opacity-70 transition-all duration-200"
          >
            {label}
          </a>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="hidden md:flex items-center gap-2 text-[14px] transition-colors duration-200"
          style={{ fontFamily, fontWeight: 400, color: textColor }}
        >
          <img
            src="https://qclay.design/lovable/synex/global.svg"
            alt=""
            className="h-[18px] w-[18px] transition-[filter] duration-200"
            style={{ filter: dark ? "brightness(0) invert(1)" : "none", opacity: dark ? 0 : 1 }}
          />
          <span style={{ opacity: dark ? 0 : 1 }}>English</span>
        </button>

        {dark && (
          <motion.button
            type="button"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="hidden md:flex items-center rounded-full px-5 py-2 text-[14px] text-white"
            style={{ fontFamily, fontWeight: 400, backgroundColor: "rgba(255,255,255,0.1)" }}
          >
            Request access
          </motion.button>
        )}

        <button
          type="button"
          className="flex items-center rounded-full pl-2 pr-5 py-2 gap-3 transition-colors duration-200"
          style={{
            fontFamily,
            fontWeight: 400,
            backgroundColor: dark ? "#FFFFFF" : "#000000",
            color: dark ? "#000000" : "#FFFFFF",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="8" cy="8" r="6.6667" fill={dark ? "#000000" : "#FFFFFF"} />
            <path d="M10.3534 8.68665L8.35337 10.6866C8.25337 10.7866 8.12671 10.8333 8.00004 10.8333C7.87337 10.8333 7.74671 10.7866 7.64671 10.6866L5.64671 8.68665C5.45337 8.49331 5.45337 8.17331 5.64671 7.97998C5.84004 7.78665 6.16004 7.78665 6.35337 7.97998L7.50004 9.12665V5.66665C7.50004 5.39331 7.72671 5.16665 8.00004 5.16665C8.27337 5.16665 8.50004 5.39331 8.50004 5.66665V9.12665L9.64671 7.97998C9.84004 7.78665 10.16 7.78665 10.3534 7.97998C10.5467 8.17331 10.5467 8.49331 10.3534 8.68665Z" fill={dark ? "#FFFFFF" : "#000000"} />
          </svg>
          <span
            className="w-px self-stretch -my-2"
            style={{ backgroundColor: dark ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.4)" }}
          />
          <span className="text-[14px]">Launch app</span>
        </button>
      </div>
    </motion.nav>
  );
}
