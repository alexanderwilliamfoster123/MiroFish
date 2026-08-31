import { motion } from "framer-motion";
import StoneReveal from "./StoneReveal";
import { openCheckout } from "@/lib/checkout";
import { scrollToId } from "@/lib/nav";

const ASSETS = {
  star: "https://qclay.design/lovable/synex/star.svg",
  stoneLeft: "https://qclay.design/lovable/synex/stone-left.png",
  stoneGrassLeft: "https://qclay.design/lovable/synex/stone-g-left.png",
  stoneRight: "https://qclay.design/lovable/synex/stone-right.png",
  stoneGrassRight: "https://qclay.design/lovable/synex/stone-g-right.png",
  dashboard: "https://qclay.design/lovable/synex/Dashboard.png",
};

const blurUp = (delay: number, yOffset: number, blur: number, duration: number) => ({
  initial: { opacity: 0, y: yOffset, filter: `blur(${blur}px)` },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  transition: { duration, delay, ease: "easeOut" as const },
});

const Hero = () => {
  return (
    <section
      className="relative h-full overflow-hidden"
      style={{ minHeight: "100vh", backgroundColor: "#F2F2F0" }}
    >
      {/* Background radial halo */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 30%, rgba(220, 220, 215, 0.6) 0%, transparent 70%)",
        }}
      />

      {/* Text content */}
      <div
        className="relative z-[2] flex flex-col items-center text-center px-6 pt-[90px] sm:pt-[110px] md:pt-[140px]"
      >
        <motion.p
          {...blurUp(0.1, 16, 8, 0.6)}
          className="text-[12px] sm:text-[13px] md:text-[14px] mb-3 md:mb-4"
          style={{ fontWeight: 500, color: "rgba(0, 0, 0, 0.50)" }}
        >
          Finance Reimagined
        </motion.p>

        <h2
          className="text-[34px] sm:text-[44px] md:text-[56px] lg:text-[68px]"
          style={{
            fontWeight: 500,
            letterSpacing: "-1.36px",
            lineHeight: 1.05,
          }}
        >
          <motion.span
            {...blurUp(0.2, 24, 12, 0.7)}
            className="block"
            style={{ color: "rgba(0, 0, 0, 0.20)" }}
          >
            A New Standard
          </motion.span>
          <motion.span
            {...blurUp(0.32, 24, 12, 0.7)}
            className="block"
            style={{ color: "#05050C" }}
          >
            in Algorithmic Trading
          </motion.span>
        </h2>

        <motion.p
          {...blurUp(0.45, 20, 8, 0.7)}
          className="text-[14px] sm:text-[16px] md:text-[18px] mt-4 md:mt-5"
          style={{
            fontWeight: 500,
            color: "rgba(0, 0, 0, 0.20)",
            maxWidth: "460px",
          }}
        >
          Take full control of your assets with a unified platform for
          investing, tracking, and growing your portfolio in real time.
        </motion.p>

        {/* Above-the-fold CTAs */}
        <motion.div
          {...blurUp(0.55, 20, 8, 0.7)}
          className="mt-6 flex flex-wrap items-center justify-center gap-3 pointer-events-auto"
        >
          <button
            type="button"
            onClick={() => openCheckout("Squared³ All Access")}
            className="h-11 px-7 rounded-full bg-black text-white text-[14px] font-semibold hover:bg-zinc-800 transition-colors"
            style={{ cursor: "pointer", border: "none" }}
          >
            Get started
          </button>
          <a
            href="#/"
            onClick={(e) => { e.preventDefault(); scrollToId("strategies"); }}
            className="h-11 px-6 rounded-full inline-flex items-center text-[14px] font-semibold text-black/70 hover:text-black transition-colors"
            style={{ border: "1px solid rgba(0,0,0,0.15)", textDecoration: "none" }}
          >
            See audited performance
          </a>
        </motion.div>
        <motion.p
          {...blurUp(0.68, 16, 6, 0.7)}
          className="mt-4 text-[12px] sm:text-[13px]"
          style={{ fontWeight: 500, color: "rgba(0, 0, 0, 0.35)" }}
        >
          US CPA-audited · Funds stay in your own brokerage · No lock-ups
        </motion.p>
      </div>

      <StoneReveal
        side="left"
        stoneSrc={ASSETS.stoneLeft}
        grassSrc={ASSETS.stoneGrassLeft}
        zBase={1}
        zGrass={2}
      />

      {/* Dashboard image */}
      <div
        className="absolute bottom-0 left-0 right-0 flex justify-center pointer-events-none"
        style={{ zIndex: 3 }}
      >
        <motion.div
          className="w-[92vw] sm:w-[72vw] md:w-[60vw] lg:w-[54vw]"
          style={{ maxWidth: "944px" }}
          initial={{ opacity: 0, y: 80, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.0, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <img
            src={ASSETS.dashboard}
            alt="Squared³ algorithmic trading dashboard"
            className="w-full h-auto object-contain"
            style={{
              borderRadius: "12px 12px 0 0",
              boxShadow:
                "0 -8px 80px rgba(0, 0, 0, 0.12), 0 40px 120px rgba(0, 0, 0, 0.10)",
            }}
          />
        </motion.div>
      </div>

      <StoneReveal
        side="right"
        stoneSrc={ASSETS.stoneRight}
        grassSrc={ASSETS.stoneGrassRight}
        zBase={4}
        zGrass={5}
      />

      {/* Bottom dark fade */}
      <div
        aria-hidden
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{
          height: "220px",
          zIndex: 6,
          background:
            "linear-gradient(to top, rgba(5, 5, 12, 0.85) 0%, rgba(5, 5, 12, 0.5) 40%, transparent 100%)",
        }}
      />

      {/* Scroll indicator */}
      <motion.div
        className="absolute left-0 right-0 mx-auto w-fit flex items-center"
        style={{ bottom: "10px", zIndex: 20, gap: "8px" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, -4, 0] }}
        transition={{
          opacity: { duration: 0.6, delay: 1.2 },
          y: {
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.2,
          },
        }}
      >
        <motion.img
          src={ASSETS.star}
          alt=""
          style={{ width: "14px", height: "14px" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <span
          className="text-[14px]"
          style={{
            fontWeight: 500,
            letterSpacing: "-0.28px",
            color: "#FFFFFF",
          }}
        >
          Scroll to explore
        </span>
      </motion.div>
    </section>
  );
};

export default Hero;
