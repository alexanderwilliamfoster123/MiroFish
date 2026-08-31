import { motion } from "framer-motion";
import { openCheckout } from "@/lib/checkout";

const FONT = '"Satoshi", "Satoshi", "Inter Tight", system-ui, sans-serif';

export default function TakeControl({ onRequestAccess }: { onRequestAccess?: () => void }) {
  return (
    <section
      className="relative w-full bg-white"
      style={{
        fontFamily: FONT,
        backgroundImage:
          "radial-gradient(ellipse at 50% 40%, rgba(0,0,0,0.04) 0%, rgba(255,255,255,0) 60%)",
      }}
    >
      <div className="max-w-[1432px] mx-auto px-6 md:px-10 pt-24 pb-12 flex flex-col items-center">
        {/* Eyebrow */}
        <motion.p
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-black/50 text-sm font-medium uppercase tracking-wide text-center"
        >
          Finance reimagined
        </motion.p>

        {/* Heading */}
        <h2
          className="mt-6 text-center font-medium text-black"
          style={{
            fontSize: "clamp(40px, 6vw, 76px)",
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
          }}
        >
          <span className="text-black/30">
            {"Take control".split(" ").map((w, i) => (
              <RevealWord key={`h1a-${i}`} text={w} delay={0.1 + i * 0.08} />
            ))}
          </span>
          <motion.img
            src="https://qclay.design/lovable/synex/firstTree.png"
            alt=""
            aria-hidden="true"
            className="inline-block mx-3 md:mx-4 rounded-full object-cover shadow-inner"
            style={{ height: "0.85em", width: "1.85em", verticalAlign: "middle", marginBottom: "0.45em" }}
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          />
          <span className="text-black/30">
            {"of your capital.".split(" ").map((w, i) => (
              <RevealWord key={`h1b-${i}`} text={w} delay={0.4 + i * 0.08} />
            ))}
          </span>
          <br />
          <span>
            {"Operate at a new level".split(" ").map((w, i) => (
              <RevealWord key={`h2-${i}`} text={w} delay={0.65 + i * 0.08} />
            ))}
          </span>
          <motion.img
            src="https://qclay.design/lovable/synex/SecondTree.png"
            alt=""
            aria-hidden="true"
            className="inline-block mx-3 md:mx-4 rounded-full object-cover shadow-inner"
            style={{ height: "0.85em", width: "1.85em", verticalAlign: "middle", marginBottom: "0.45em" }}
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, delay: 1.0, ease: [0.22, 1, 0.36, 1] }}
          />
        </h2>

        {/* Description */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
          className="mt-8 max-w-2xl mx-auto text-center text-black/30 text-lg font-medium leading-relaxed"
        >
          Squared³ brings together your assets, data, and execution into one
          intelligent system — giving you clarity, speed, and control across
          every layer of your portfolio.
        </motion.p>

        {/* CTAs */}
        <div className="mt-10 flex justify-center gap-3">
          <motion.button
            type="button"
            onClick={onRequestAccess}
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.5, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="h-10 px-5 rounded-full bg-zinc-100 hover:bg-zinc-200 transition text-black text-sm font-medium"
          >
            Request access
          </motion.button>
          <motion.button
            type="button"
            onClick={() => openCheckout("Squared³ All Access")}
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.5, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="h-10 pl-2 pr-5 rounded-full bg-black hover:bg-zinc-800 transition text-white text-sm font-medium flex items-center gap-3"
          >
            <img
              src="https://qclay.design/lovable/synex/arrow-down.svg"
              alt=""
              aria-hidden="true"
              className="w-6 h-6"
            />
            <span className="w-px h-8 bg-white/20" />
            Get started
          </motion.button>
        </div>

        <div className="mt-24 w-full border-t border-zinc-300" />
      </div>
    </section>
  );
}

function RevealWord({ text, delay = 0 }: { text: string; delay?: number }) {
  return (
    <span style={{ display: "inline-block", overflow: "hidden", paddingTop: "0.08em", paddingBottom: "0.15em" }}>
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
