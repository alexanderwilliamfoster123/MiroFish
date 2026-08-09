import { PageShell } from "@/components/pages/page-shell";
import { VhsSpine, VhsTape } from "@/components/ui/vhs-tape";
import { Play } from "lucide-react";
import { useState } from "react";

const MOVIES = [
  {
    title: "building a prediction engine",
    duration: "18:42",
    href: "https://youtube.com",
    blurb:
      "How MiroFish came together — a thousand small agents, a world for them to want things in, and what their behaviour revealed about real crowds.",
  },
  {
    title: "a week of quiet work",
    duration: "09:15",
    href: "https://youtube.com",
    blurb:
      "Seven unglamorous days, filmed honestly. No launches, no milestones — just the texture of building something slowly.",
  },
  {
    title: "why i design in black and white",
    duration: "12:03",
    href: "https://youtube.com",
    blurb:
      "The case for taking colour away: what monochrome forces you to get right, and what it quietly makes impossible.",
  },
  {
    title: "walking, thinking, filming",
    duration: "07:56",
    href: "https://youtube.com",
    blurb:
      "A camera, a long road, and the ideas that only arrive on foot. The closest thing I have to a method.",
  },
] as const;

export function MoviesPage() {
  const [selected, setSelected] = useState<number | null>(null);
  const movie = selected === null ? null : MOVIES[selected];

  return (
    <PageShell
      eyebrow="Movies"
      title="The tape rack"
      intro="Films and videos, racked on cassette. Pull one out."
    >
      {/* the rack */}
      <div className="flex items-end justify-center gap-2">
        {MOVIES.map((m, index) => (
          <div
            key={m.title}
            className="animate-fade-up"
            style={{ animationDelay: `${0.15 + index * 0.07}s` }}
          >
            <VhsSpine
              title={m.title}
              index={index}
              selected={selected === index}
              onClick={() => setSelected(selected === index ? null : index)}
            />
          </div>
        ))}
      </div>
      {/* the shelf */}
      <div
        className="mx-auto mt-[3px] h-[3px] w-full max-w-md rounded-full"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(235,233,228,0.16) 15%, rgba(235,233,228,0.16) 85%, transparent)",
        }}
      />

      {/* the pulled-out tape */}
      {movie ? (
        <div
          key={movie.title}
          className="animate-fade-up mx-auto mt-14 flex max-w-2xl flex-col items-center gap-8 sm:flex-row sm:items-center"
        >
          <VhsTape
            title={movie.title}
            duration={movie.duration}
            index={selected as number}
          />
          <div className="max-w-xs text-center sm:text-left">
            <h2 className="font-serif text-xl font-light lowercase">
              {movie.title}
            </h2>
            <p className="mt-1 font-mono text-[11px] tracking-[0.16em] text-faint uppercase">
              {movie.duration} · vhs rip
            </p>
            <p className="mt-4 text-[13.5px] font-light leading-relaxed text-muted-foreground">
              {movie.blurb}
            </p>
            <div className="mt-6 flex items-center justify-center gap-4 sm:justify-start">
              <a
                href={movie.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-85"
              >
                <Play size={13} className="fill-current" />
                watch on youtube
              </a>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="cursor-pointer text-[11px] tracking-[0.18em] text-faint lowercase transition-colors hover:text-foreground"
              >
                put it back
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p className="mt-10 text-center text-[11px] tracking-[0.18em] text-faint lowercase">
          {MOVIES.length} tapes racked · pull one out
        </p>
      )}
    </PageShell>
  );
}
