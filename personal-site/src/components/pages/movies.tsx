import { PageShell } from "@/components/pages/page-shell";
import { Play } from "lucide-react";

const MOVIES = [
  {
    title: "Building a prediction engine from scratch",
    duration: "18:42",
    href: "https://youtube.com",
    thumbnail:
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1200&auto=format&fit=crop",
  },
  {
    title: "A week of quiet work",
    duration: "09:15",
    href: "https://youtube.com",
    thumbnail:
      "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?q=80&w=1200&auto=format&fit=crop",
  },
  {
    title: "Why I design in black and white first",
    duration: "12:03",
    href: "https://youtube.com",
    thumbnail:
      "https://images.unsplash.com/photo-1481487196290-c152efe083f5?q=80&w=1200&auto=format&fit=crop",
  },
  {
    title: "Walking, thinking, filming",
    duration: "07:56",
    href: "https://youtube.com",
    thumbnail:
      "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=1200&auto=format&fit=crop",
  },
] as const;

export function MoviesPage() {
  return (
    <PageShell
      eyebrow="Movies"
      title="Moving pictures"
      intro="Films and videos I make when words aren't enough."
    >
      <div className="grid gap-6 sm:grid-cols-2">
        {MOVIES.map((movie) => (
          <a
            key={movie.title}
            href={movie.href}
            target="_blank"
            rel="noreferrer"
            className="group"
          >
            <div className="relative overflow-hidden rounded-2xl border border-line">
              <img
                src={movie.thumbnail}
                alt={movie.title}
                loading="lazy"
                className="aspect-video w-full object-cover opacity-80 grayscale transition-all duration-700 group-hover:scale-[1.03] group-hover:opacity-100"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/20">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 opacity-0 shadow-lg transition-all duration-300 group-hover:opacity-100">
                  <Play size={16} className="ml-0.5 text-neutral-800" />
                </span>
              </div>
              <span className="absolute right-3 bottom-3 rounded-md bg-black/60 px-1.5 py-0.5 text-[11px] text-white backdrop-blur-sm">
                {movie.duration}
              </span>
            </div>
            <h2 className="mt-3 text-sm font-light transition-colors duration-300 group-hover:text-foreground">
              {movie.title}
            </h2>
          </a>
        ))}
      </div>
    </PageShell>
  );
}
