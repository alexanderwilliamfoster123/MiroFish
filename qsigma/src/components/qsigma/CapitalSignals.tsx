import { motion } from "framer-motion";
import TreeReveal from "./TreeReveal";
import { PublicLogo, AlpacaLogo, IbkrLogo } from "./BrokerLogos";

const BROKERS = [
  { Logo: PublicLogo, rotate: -4, delay: 0 },
  { Logo: AlpacaLogo, rotate: 3, delay: 0.14 },
  { Logo: IbkrLogo, rotate: -2, delay: 0.28 },
];

/**
 * CapitalSignals is a tall scroll-spacer section.
 * The morphing visual is rendered by <MorphingCard /> (fixed),
 * which uses #morph-scroll-target (this section) for its scroll progress.
 *
 * A white fade at the base of the tree artwork hides the capsule graphic
 * baked into the source image; the broker logos pop up over it on scroll.
 */
export default function CapitalSignals() {
  return (
    <section
      id="morph-scroll-target"
      className="relative bg-white overflow-hidden"
      style={{ height: "115vh" }}
    >
      <div className="absolute bottom-0 left-0 right-0">
        <TreeReveal className="w-full" />

        {/* White fog over the lower artwork — covers the baked-in pill */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0"
          style={{
            height: "68%",
            background:
              "linear-gradient(to top, #FFFFFF 0%, #FFFFFF 42%, rgba(255,255,255,0.88) 66%, rgba(255,255,255,0) 100%)",
          }}
        />

        {/* Brokers pop up on scroll */}
        <div
          className="pointer-events-none absolute inset-x-0 flex flex-wrap items-center justify-center gap-3 px-4 sm:gap-4"
          style={{ bottom: "16%" }}
        >
          {BROKERS.map(({ Logo, rotate, delay }, i) => (
            <motion.span
              key={i}
              initial={{ scale: 0, opacity: 0, y: 26, rotate }}
              whileInView={{ scale: 1, opacity: 1, y: 0, rotate: 0 }}
              viewport={{ once: true, amount: 0.8 }}
              transition={{ type: "spring", stiffness: 260, damping: 17, delay }}
              className="flex items-center whitespace-nowrap rounded-full border border-black/10 bg-white px-6 py-3.5 sm:px-7"
              style={{ boxShadow: "0 18px 40px rgba(5,5,12,0.14)" }}
            >
              <Logo height={24} />
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  );
}
