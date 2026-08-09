import { PageShell } from "@/components/pages/page-shell";
import { VhsTape } from "@/components/ui/vhs-tape";

const MOVIES = [
  {
    title: "building a prediction engine",
    duration: "18:42",
    href: "https://youtube.com",
  },
  {
    title: "a week of quiet work",
    duration: "09:15",
    href: "https://youtube.com",
  },
  {
    title: "why i design in black and white",
    duration: "12:03",
    href: "https://youtube.com",
  },
  {
    title: "walking, thinking, filming",
    duration: "07:56",
    href: "https://youtube.com",
  },
] as const;

export function MoviesPage() {
  return (
    <PageShell
      eyebrow="Movies"
      title="The tape shelf"
      intro="Films and videos, shelved on cassette. Select a tape to watch."
    >
      <div className="flex flex-wrap items-end justify-center gap-x-10 gap-y-12">
        {MOVIES.map((movie, index) => (
          <div
            key={movie.title}
            className="animate-fade-up"
            style={{ animationDelay: `${0.15 + index * 0.1}s` }}
          >
            <VhsTape
              title={movie.title}
              duration={movie.duration}
              url={movie.href}
              index={index}
            />
          </div>
        ))}
      </div>
      {/* the shelf */}
      <div
        className="mx-auto mt-10 h-[3px] w-full max-w-xl rounded-full"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(235,233,228,0.16) 15%, rgba(235,233,228,0.16) 85%, transparent)",
        }}
      />
      <p className="mt-8 text-center text-[11px] tracking-[0.18em] text-faint lowercase">
        {MOVIES.length} tapes · select a tape to watch
      </p>
    </PageShell>
  );
}
