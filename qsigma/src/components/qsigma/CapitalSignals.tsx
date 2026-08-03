import TreeReveal from "./TreeReveal";

/**
 * CapitalSignals is a tall scroll-spacer section.
 * The morphing visual is rendered by <MorphingCard /> (fixed),
 * which uses #morph-scroll-target (this section) for its scroll progress.
 */
export default function CapitalSignals() {
  return (
    <section
      id="morph-scroll-target"
      className="relative bg-white overflow-hidden"
      style={{ height: "115vh" }}
    >
      <TreeReveal className="absolute bottom-0 left-0 right-0 w-full" />
    </section>
  );
}
