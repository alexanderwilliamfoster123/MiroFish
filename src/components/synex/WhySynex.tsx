import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const FONT = '"Inter Tight", Inter, system-ui, sans-serif';

const ROWS = [
  { label: "Multi-asset portfol", other: "absent" as const },
  { label: "Real-time data & synchronizatio", other: "check" as const },
  { label: "Al-driven insights & optimizatio", other: "absent" as const },
  { label: "Unified dashboard across all system", other: "check" as const },
  { label: "Unified dashboard across all system", other: "absent" as const },
];

const ROW_H_DESKTOP = 56;
const ROW_H_MOBILE = 88;

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return isMobile;
}

function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="18"
      height="14"
      viewBox="0 0 18 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M15.3604 0.542969C15.9414 -0.0477178 16.8829 -0.0479217 17.4639 0.542969C18.0458 1.13484 18.0457 2.09556 17.4639 2.6875L6.875 13.457C6.29392 14.0477 5.35245 14.0479 4.77148 13.457L0.536133 9.14941C-0.0457785 8.55756 -0.0456284 7.59684 0.536133 7.00488C1.11716 6.41393 2.05858 6.41401 2.63965 7.00488L5.75195 10.1699L5.82324 10.2432L5.89453 10.1699L15.3604 0.542969Z"
        fill="currentColor"
      />
    </svg>
  );
}

function SynexLogo() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M4.40072 0V4.40072H0C0 1.97299 1.97299 0 4.40072 0Z" fill="#0A0A0A" />
      <path d="M4.40072 4.40137H0V8.80209H4.40072V4.40137Z" fill="#0A0A0A" />
      <path d="M4.40112 0.000642776V4.40137H8.80185V0.000642776H4.40112Z" fill="#0A0A0A" />
      <path d="M13.2031 8.80176H8.80237V13.2025C11.2301 13.2025 13.2031 11.2295 13.2031 8.80176Z" fill="#0A0A0A" />
      <path d="M4.40112 8.8024L4.40112 13.2031L8.80185 13.2031L8.80185 8.8024L4.40112 8.8024Z" fill="#0A0A0A" />
      <path d="M13.2031 4.40137H8.80237V8.80209H13.2031V4.40137Z" fill="#0A0A0A" />
    </svg>
  );
}

export default function WhySynex() {
  const isMobile = useIsMobile();
  const ROW_H = isMobile ? ROW_H_MOBILE : ROW_H_DESKTOP;
  const SYNEX_H = 25 + 34 + ROW_H * ROWS.length + 60;
  const SYNEX_TOP = -31;
  const SYNEX_WIDTH = isMobile ? "108%" : "115%";
  const SYNEX_PAD_X = isMobile ? 18 : 55;
  return (
    <section className="relative w-full overflow-hidden" style={{ fontFamily: FONT }}>
      {/* Background */}
      <img
        src="https://qclay.design/lovable/synex/StoneBG.png"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Top fade in — matches StoneBG top color (#C4C4C4). 100% solid at very top, fades out shortly below */}
      <div
        className="absolute inset-x-0 top-0 h-40 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "linear-gradient(to bottom, #C4C4C4 0%, rgba(196,196,196,0.85) 15%, rgba(196,196,196,0) 100%)",
        }}
      />

      <div className="relative max-w-[1366px] mx-auto px-6 md:px-12 pt-28 md:pt-36 pb-32">
        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <motion.div
            className="px-3 py-1.5 rounded-md border border-white/20 bg-transparent"
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="text-white/60 text-sm font-medium">WHY SYNEX</span>
          </motion.div>
          <h2 className="mt-6 text-4xl md:text-5xl font-medium leading-[1.15] text-white">
            {"Built for modern capital.".split(" ").map((w, i) => (
              <RevealWord key={`h1-${i}`} text={w} delay={0.15 + i * 0.08} />
            ))}
            <br />
            {"Not legacy systems".split(" ").map((w, i) => (
              <RevealWord key={`h2-${i}`} text={w} delay={0.15 + (3 + i) * 0.08} />
            ))}
          </h2>
          <p className="mt-6 max-w-[475px] text-white/75 text-lg font-medium">
            {"Connect exchanges, custodians, on-chain wallets, and data providers — all synchronized in one unified system for real-time visibility and control."
              .split(" ")
              .map((w, i) => (
                <RevealWord key={`d-${i}`} text={w} delay={i * 0.04} />
              ))}
          </p>
        </div>


        {/* Comparison table */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative w-full max-w-[1000px] mx-auto mt-20"
        >
          {/* Column headers */}
          <div className="grid grid-cols-[3fr_1fr_1fr] items-end mb-3 px-1">
            <div className="text-white/75 text-sm font-medium pl-7">
              Core capabilities
            </div>
            <div />
            <div className="text-white/75 text-sm font-medium text-center">
              Other platform
            </div>
          </div>

          {/* Row container — left + right glass plate, with center column overlapping */}
          <div className="relative">
            {/* Left + right glass plate (single block) */}
            <div className="grid grid-cols-[3fr_1fr_1fr] bg-black/25 backdrop-blur-2xl rounded-2xl border border-white/20 overflow-hidden">
              {/* Left column — labels */}
              <div className="flex flex-col py-7 px-3 sm:px-7">
                {ROWS.map((r, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
                    whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.6, delay: 0.4 + i * 0.14, ease: [0.22, 1, 0.36, 1] }}
                    className={`flex items-center text-white text-[13px] leading-tight sm:text-base font-normal pr-2 ${
                      i < ROWS.length - 1 ? "border-b border-dashed border-white/20" : ""
                    }`}
                    style={{ height: ROW_H }}
                  >
                    {r.label}
                  </motion.div>
                ))}
              </div>

              {/* Middle spacer column */}
              <div className="flex flex-col py-7">
                {ROWS.map((_, i) => (
                  <div key={i} style={{ height: ROW_H }} />
                ))}
              </div>

              {/* Right column — Other platform */}
              <div className="flex flex-col py-7 px-2 sm:px-[60px]">
                {ROWS.map((r, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
                    whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.6, delay: 0.4 + i * 0.14, ease: [0.22, 1, 0.36, 1] }}
                    className="flex items-center justify-center"
                    style={{ height: ROW_H }}
                  >
                    {r.other === "absent" ? (
                      <span className="text-white/70 text-xs font-normal capitalize">
                        absent
                      </span>
                    ) : (
                      <CheckIcon className="text-white" />
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Center SYNEX column — overlaps top & bottom of plate */}
            <div
              className="absolute left-0 top-0 w-full h-full grid grid-cols-[3fr_1fr_1fr] pointer-events-none"
              aria-hidden="false"
            >
              <div />
              <div className="relative">
                <div
                  className="absolute left-1/2 -translate-x-1/2 bg-[#E9EAC8] rounded-2xl shadow-2xl shadow-black/30 flex flex-col items-center"
                  style={{
                    top: SYNEX_TOP,
                    height: SYNEX_H,
                    width: SYNEX_WIDTH,
                    paddingTop: 25,
                    paddingLeft: SYNEX_PAD_X,
                    paddingRight: SYNEX_PAD_X,
                    paddingBottom: 60,
                  }}
                >
                  {/* Logo header */}
                  <div className="flex items-center justify-center gap-2 h-[34px] w-full">
                    <SynexLogo />
                    <span className="text-black text-lg font-bold lowercase leading-none">
                      synex
                    </span>
                  </div>
                  {/* Checks aligned to left row heights */}
                  <div className="flex flex-col w-full">
                    {ROWS.map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.4 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.5, delay: 0.4 + i * 0.14, ease: [0.22, 1, 0.36, 1] }}
                        className="flex items-center justify-center"
                        style={{ height: ROW_H }}
                      >
                        <CheckIcon className="text-black" />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
              <div />
            </div>
          </div>

          {/* Footer prices — staggered after table rows */}
          <div className="grid grid-cols-[3fr_1fr_1fr] mt-10 px-1 items-start">
            {(() => {
              const baseDelay = 0.4 + ROWS.length * 0.14;
              return (
                <>
                  <motion.div
                    className="pl-7"
                    initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
                    whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.6, delay: baseDelay, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="text-white text-sm font-medium">Total operational cost:</div>
                    <div className="text-white/60 text-xs font-medium mt-1">
                      Based on typical multi-platform setups.
                    </div>
                  </motion.div>
                  <motion.div
                    className="text-center text-white text-sm font-medium"
                    initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
                    whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.6, delay: baseDelay + 0.14, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <span>$499</span>
                    <span className="text-white/90"> / month</span>
                  </motion.div>
                  <motion.div
                    className="text-center text-white text-sm font-medium"
                    initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
                    whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.6, delay: baseDelay + 0.28, ease: [0.22, 1, 0.36, 1] }}
                  >
                    $1,700 / month
                  </motion.div>
                </>
              );
            })()}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function RevealWord({ text, delay = 0 }: { text: string; delay?: number }) {
  return (
    <span style={{ display: "inline-block", overflow: "hidden" }}>
      <motion.span
        style={{ display: "inline-block", willChange: "transform, filter, opacity" }}
        initial={{ opacity: 0, filter: "blur(12px)", y: "0.4em" }}
        whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      >
        {text}&nbsp;
      </motion.span>
    </span>
  );
}
