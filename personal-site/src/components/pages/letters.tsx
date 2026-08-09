import { PageShell } from "@/components/pages/page-shell";

const LETTERS = [
  {
    title: "On building quietly",
    date: "Jul 2026",
    excerpt:
      "The best work I've done never announced itself. Some thoughts on why shipping softly beats launching loudly.",
  },
  {
    title: "Simulation as a way of seeing",
    date: "May 2026",
    excerpt:
      "What building MiroFish taught me about crowds, prediction, and the limits of asking people what they think.",
  },
  {
    title: "Interfaces that stay out of the way",
    date: "Feb 2026",
    excerpt:
      "A short argument for software that disappears — and the discipline it takes to leave things out.",
  },
  {
    title: "Notes to a younger builder",
    date: "Nov 2025",
    excerpt:
      "Everything I wish someone had told me before I wrote my first line of production code.",
  },
] as const;

export function LettersPage() {
  return (
    <PageShell
      eyebrow="Letters"
      title="Writing & thoughts"
      intro="Occasional letters — on building, thinking, and paying attention."
    >
      <div className="border-t border-line">
        {LETTERS.map((letter) => (
          <a
            key={letter.title}
            href="#"
            className="group block border-b border-line py-6 transition-colors duration-300 hover:border-foreground/30"
          >
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="font-serif text-xl font-light transition-colors duration-300 group-hover:text-foreground">
                {letter.title}
              </h2>
              <span className="shrink-0 text-[11px] tracking-wide text-faint uppercase">
                {letter.date}
              </span>
            </div>
            <p className="mt-2 max-w-lg text-[13px] font-light leading-relaxed text-muted-foreground">
              {letter.excerpt}
            </p>
          </a>
        ))}
      </div>
    </PageShell>
  );
}
