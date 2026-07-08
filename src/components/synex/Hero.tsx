import { motion } from "framer-motion";
import StoneReveal from "./StoneReveal";

const EXPO_OUT = [0.22, 1, 0.36, 1] as const;

export default function Hero() {
  return (
    <section
      className="relative w-full h-full overflow-hidden bg-[#f4f1ea] text-[#05050c]"
    >
      {/* Text */}
      <div className="relative z-10 px-6 text-center" style={{ paddingTop: "calc(72px + 50px - 90px + 140px - 40px + 20px)" }}>
        <motion.p
          initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="uppercase"
          style={{
            fontFamily: '"HelveticaNeueCyr", "Helvetica Neue", Helvetica, Arial, sans-serif',
            fontSize: 14,
            fontWeight: 500,
            color: "rgba(0,0,0,0.5)",
          }}
        >
          Finance Reimagined
        </motion.p>

        <h2
          className="text-[44px] sm:text-[68px]"
          style={{
            fontFamily: '"Inter Tight", Inter, system-ui, sans-serif',
            fontWeight: 500,
            lineHeight: 1.02,
            letterSpacing: "-0.03em",
            marginTop: 15,
          }}
        >
          <motion.span
            initial={{ opacity: 0, y: 24, filter: "blur(12px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="block"
            style={{ color: "rgba(0,0,0,0.2)" }}
          >
            A New Standard
          </motion.span>
          <motion.span
            initial={{ opacity: 0, y: 24, filter: "blur(12px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.7, delay: 0.32, ease: "easeOut" }}
            className="block"
            style={{ color: "#000000" }}
          >
            in Wealth Management
          </motion.span>
        </h2>

        <motion.p
          initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.7, delay: 0.45, ease: "easeOut" }}
          className="mx-auto max-w-xl"
          style={{
            marginTop: 20,
            fontFamily: '"Inter Tight", Inter, system-ui, sans-serif',
            fontSize: 18,
            fontWeight: 500,
            lineHeight: 1.5,
            color: "rgba(0,0,0,0.2)",
          }}
        >
          Take full control of your assets with a unified platform for investing, tracking, and growing your portfolio in real time.
        </motion.p>
      </div>

      {/* Stones */}
      <StoneReveal
        side="left"
        flipX
        baseSrc="https://qclay.design/lovable/synex/stone-right.png"
        mossSrc="https://qclay.design/lovable/synex/stone-g-right.png"
        alt=""
        className="absolute left-[-3vw] bottom-[8%] sm:bottom-0 z-[2] w-[48vw] max-w-[580px]"
      />
      <StoneReveal
        side="right"
        flipX
        baseSrc="https://qclay.design/lovable/synex/stone-left.png"
        mossSrc="https://qclay.design/lovable/synex/stone-g-left.png"
        alt=""
        className="absolute right-[-4vw] bottom-[8%] sm:bottom-0 z-[5] w-[58vw] max-w-[720px]"
      />



      {/* Dashboard */}
      <div className="absolute bottom-[80px] left-0 right-0 z-[4] flex justify-center pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 80, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.0, delay: 0.6, ease: EXPO_OUT }}
          className="w-[92vw] sm:w-[72vw] md:w-[60vw] lg:w-[54vw] max-w-[944px]"
        >
          <img
            src="https://qclay.design/lovable/synex/Dashboard.png"
            alt="Synex dashboard"
            className="block w-full h-auto object-contain"
            style={{
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
              boxShadow:
                "0 -8px 80px rgba(0,0,0,0.12), 0 40px 120px rgba(0,0,0,0.10)",
            }}
          />
        </motion.div>
      </div>

      {/* Bottom dark fade */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 right-0 h-[220px] z-[6] pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, rgba(5,5,12,0.85) 0%, rgba(5,5,12,0.5) 40%, transparent 100%)",
        }}
      />

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, -4, 0] }}
        transition={{
          opacity: { duration: 0.6, delay: 1.2, ease: "easeOut" },
          y: { duration: 2.5, delay: 1.2, repeat: Infinity, ease: "easeInOut" },
        }}
        className="absolute bottom-[10px] left-0 right-0 mx-auto w-fit z-20 flex items-center gap-2"
      >
        <motion.img
          src="https://qclay.design/lovable/synex/star.svg"
          alt=""
          aria-hidden="true"
          width={14}
          height={14}
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <span
          style={{
            fontFamily: '"Inter Tight", Inter, system-ui, sans-serif',
            fontWeight: 500,
            fontSize: 14,
            letterSpacing: "-0.28px",
            color: "#FFF",
          }}
        >
          Scroll to explore
        </span>
      </motion.div>
    </section>
  );
}
