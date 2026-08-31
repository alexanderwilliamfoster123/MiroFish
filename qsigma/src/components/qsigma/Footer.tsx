import { motion } from "framer-motion";
import Logo from "./Logo";

const FONT = '"Satoshi", "Satoshi", "Inter Tight", system-ui, sans-serif';

export default function Footer() {
  return (
    <footer
      className="relative w-full bg-white overflow-hidden"
      style={{ fontFamily: FONT }}
    >
      <div className="relative max-w-[1432px] mx-auto px-6 md:px-10 pt-10 pb-0">
        {/* Top grid: 3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] gap-12 md:gap-16 pb-24">
          {/* Left — heading */}
          <div className="md:col-span-1">
            <h2
              className="text-black font-medium"
              style={{
                fontSize: "clamp(36px, 4vw, 52px)",
                lineHeight: 1.05,
                letterSpacing: "-0.02em",
              }}
            >
              {"We’d love to".split(" ").map((w, i) => (
                <RevealWord key={`h1-${i}`} text={w} delay={i * 0.08} />
              ))}
              <br />
              {"hear from you".split(" ").map((w, i) => (
                <RevealWord key={`h2-${i}`} text={w} delay={(3 + i) * 0.08} />
              ))}
            </h2>
            <p className="mt-6 text-black/40 text-base font-medium leading-relaxed max-w-xs">
              {"We’re always open to new ideas, partnerships, and opportunities."
                .split(" ")
                .map((w, i) => (
                  <RevealWord key={`d-${i}`} text={w} delay={0.5 + i * 0.05} />
                ))}
            </p>
          </div>

          {/* Mail us */}
          <motion.div
            initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col justify-between min-h-[180px] md:border-l md:border-black/10 md:pl-5"
          >
            <div>
              <h3 className="text-black text-lg font-medium">Mail us</h3>
              <p className="mt-2 text-black/40 text-base font-medium">
                Don&apos;t like the forms? Drop us a line via email
              </p>
            </div>
            <a
              href="mailto:info@squaredq.com"
              className="mt-8 inline-flex items-center gap-2 text-black text-base font-normal hover:opacity-80 transition"
            >
              <span>
                info@squaredq.com
              </span>
              <img src="https://qclay.design/lovable/synex/RedArrow.svg" alt="" className="w-4 h-4" />
            </a>
          </motion.div>

          {/* Book a call */}
          <motion.div
            initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, delay: 1.15, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col justify-between min-h-[180px] md:border-l md:border-black/10 md:pl-5"
          >
            <div>
              <h3 className="text-black text-lg font-medium">Book a call</h3>
              <p className="mt-2 text-black/40 text-base font-medium">
                Let&apos;s discuss your needs and KPI&apos;s in detail.
                <br />
                Speak soon!
              </p>
            </div>
            <a
              href="mailto:info@squaredq.com?subject=Book%20a%20call"
              className="mt-8 inline-flex items-center gap-2 text-black text-base font-normal hover:opacity-80 transition"
            >
              <span>Let&apos;s talk</span>
              <img src="https://qclay.design/lovable/synex/RedArrow.svg" alt="" className="w-4 h-4" />
            </a>
          </motion.div>
        </div>

        {/* Legal small print */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-8 border-t border-black/10 pt-6">
          <div className="flex items-center gap-3">
            <Logo markSize={22} textSize={17} />
            <p className="text-black/30 text-xs font-medium">
              © 2026 Squared³. All rights reserved.
            </p>
          </div>
          <p className="text-black/30 text-xs font-medium md:max-w-[560px] md:text-right leading-relaxed">
            Investing involves risk, including possible loss of principal. Past
            performance does not guarantee future results. Strategy returns
            shown are illustrative.
          </p>
        </div>
      </div>

      {/* Background image — full bleed, zooms out on reveal */}
      <div className="relative w-full mt-0 overflow-hidden">
        <motion.img
          src="https://qclay.design/lovable/synex/FooterBG.png"
          alt=""
          aria-hidden="true"
          className="w-full h-auto object-contain block select-none pointer-events-none"
          style={{ transformOrigin: "center center" }}
          initial={{ scale: 1.35 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </footer>
  );
}

function RevealWord({ text, delay = 0 }: { text: string; delay?: number }) {
  return (
    <span style={{ display: "inline-block", overflow: "hidden", paddingBottom: "0.15em" }}>
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
