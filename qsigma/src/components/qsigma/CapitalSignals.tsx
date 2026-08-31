import { motion } from "framer-motion";
import TreeReveal from "./TreeReveal";
import { PublicLogo, AlpacaLogo, IbkrLogo } from "./BrokerLogos";

const FONT = '"Satoshi", "Inter Tight", system-ui, sans-serif';

/**
 * CapitalSignals is a tall scroll-spacer section.
 * The morphing visual is rendered by <MorphingCard /> (fixed),
 * which uses #morph-scroll-target (this section) for its scroll progress.
 *
 * The broker capsule below sits over the tree artwork, replacing the
 * "Core — best choice" pill that is baked into the source image.
 */
export default function CapitalSignals() {
  return (
    <section
      id="morph-scroll-target"
      className="relative bg-white overflow-hidden"
      style={{ height: "115vh", fontFamily: FONT }}
    >
      <div className="absolute bottom-0 left-0 right-0">
        <TreeReveal className="w-full" />

        {/* Broker highlight capsule */}
        <div
          className="pointer-events-none absolute inset-x-0 flex justify-center px-4"
          style={{ top: "26%" }}
        >
          <motion.div
            initial={{ opacity: 0, y: 26, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center gap-4 rounded-[40px] px-7 py-6 sm:px-10"
            style={{
              backgroundColor: "rgba(11, 16, 11, 0.92)",
              border: "1px solid rgba(255,255,255,0.18)",
              boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
            }}
          >
            <span
              className="text-center text-[13px] sm:text-[14px]"
              style={{ fontWeight: 500, color: "rgba(255,255,255,0.75)", letterSpacing: "0.02em" }}
            >
              Executes in your own account at
            </span>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <span className="flex items-center whitespace-nowrap rounded-full bg-white px-6 py-3">
                <PublicLogo height={22} />
              </span>
              <span className="flex items-center whitespace-nowrap rounded-full bg-white px-6 py-3">
                <AlpacaLogo height={22} />
              </span>
              <span className="flex items-center whitespace-nowrap rounded-full bg-white px-6 py-3">
                <IbkrLogo height={22} />
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
