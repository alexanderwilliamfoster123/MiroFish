import { Dock, DockIcon, DockItem, DockLabel } from "@/components/ui/dock";
import {
  HoverRevealList,
  type RevealItem,
} from "@/components/ui/hover-reveal-list";
import { RadialScrollGallery } from "@/components/ui/portfolio-and-image-gallery";
import {
  AtSign,
  Briefcase,
  Camera,
  Feather,
  Github,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
} from "lucide-react";
import { useEffect, useState } from "react";

type Room = "writing" | "pictures" | "socials" | "companies";

// the wheel of investments, in order around the circle
const COMPANIES = ["vertus", "vanquish", "paktos", "tootski", "omera"];

const POSTS = [
  {
    title: "on building quietly",
    summary:
      "the best work i've done never announced itself. why shipping softly beats launching loudly.",
    published: "jul 2026",
    url: "#",
  },
  {
    title: "simulation as a way of seeing",
    summary:
      "what building mirofish taught me about crowds, prediction, and the limits of asking people what they think.",
    published: "may 2026",
    url: "#",
  },
  {
    title: "interfaces that stay out of the way",
    summary:
      "a short argument for software that disappears — and the discipline it takes to leave things out.",
    published: "feb 2026",
    url: "#",
  },
  {
    title: "notes to a younger builder",
    summary:
      "everything i wish someone had told me before i wrote my first line of production code.",
    published: "nov 2025",
    url: "#",
  },
];

// one row per place — swap hrefs/handles/descriptions for the real ones
const SOCIALS: RevealItem[] = [
  {
    title: "instagram",
    handle: "@alexanderfoster",
    description: "photographs and fragments — the world in monochrome, mostly.",
    href: "https://instagram.com/",
    icon: Instagram,
  },
  {
    title: "x",
    handle: "@alexfoster",
    description: "thoughts as they happen. building in public, quietly.",
    href: "https://x.com/",
    icon: Twitter,
  },
  {
    title: "linkedin",
    handle: "alexander foster",
    description: "the professional record — companies, roles, the long game.",
    href: "https://linkedin.com/",
    icon: Linkedin,
  },
  {
    title: "youtube",
    handle: "@alexanderfoster",
    description: "the moving pictures — films about building and thinking.",
    href: "https://youtube.com/",
    icon: Youtube,
  },
  {
    title: "github",
    handle: "@alexanderwilliamfoster123",
    description: "the code itself. everything i ship starts here.",
    href: "https://github.com/alexanderwilliamfoster123",
    icon: Github,
  },
];

const DOCK_ITEMS: Array<{ room: Room; title: string; icon: typeof Feather }> = [
  { room: "companies", title: "companies", icon: Briefcase },
  { room: "writing", title: "writing", icon: Feather },
  { room: "pictures", title: "pictures", icon: Camera },
  { room: "socials", title: "socials", icon: AtSign },
];

interface WorldProps {
  onLeave: () => void;
}

export function World({ onLeave }: WorldProps) {
  const [room, setRoom] = useState<Room | null>(null);

  // esc steps back: room -> home
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setRoom(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <main className="relative min-h-dvh w-full">
      <button
        type="button"
        onClick={onLeave}
        className="fixed top-5 right-6 z-50 cursor-pointer text-[11px] tracking-[0.2em] text-faint transition-colors duration-300 hover:text-foreground"
      >
        leave
      </button>

      {room === null && (
        <div className="animate-fade-in flex min-h-dvh items-center justify-center">
          <p className="text-[12px] tracking-[0.3em] text-faint">
            alexander foster
          </p>
        </div>
      )}

      {room === "socials" && (
        <section
          key="socials"
          className="animate-fade-in mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-6 pt-16 pb-36"
        >
          <p
            className="animate-fade-up text-[11px] tracking-[0.25em] text-faint"
            style={{ animationDelay: "0.05s" }}
          >
            socials
          </p>
          <h1
            className="animate-fade-up mt-3 text-[19px] font-medium tracking-tight sm:text-[21px]"
            style={{ animationDelay: "0.15s" }}
          >
            find me everywhere.
          </h1>
          <div
            className="animate-fade-up mt-10"
            style={{ animationDelay: "0.3s" }}
          >
            <HoverRevealList items={SOCIALS} />
          </div>
        </section>
      )}

      {room === "companies" && (
        <section key="companies" className="animate-fade-in w-full">
          <div className="flex h-[46vh] flex-col items-center justify-end px-6 text-center">
            <p
              className="animate-fade-up text-[11px] tracking-[0.25em] text-faint"
              style={{ animationDelay: "0.05s" }}
            >
              companies
            </p>
            <h1
              className="animate-fade-up mt-3 text-[19px] font-medium tracking-tight sm:text-[21px]"
              style={{ animationDelay: "0.15s" }}
            >
              founded.
            </h1>
            <p
              className="animate-fade-up mt-2 text-[12px] text-faint"
              style={{ animationDelay: "0.25s" }}
            >
              scroll to turn the wheel
            </p>
          </div>
          <RadialScrollGallery
            className="!min-h-[64vh]"
            baseRadius={430}
            mobileRadius={210}
            scrollDuration={1600}
            visiblePercentage={42}
            startTrigger="top 35%"
          >
            {(hoveredIndex) =>
              COMPANIES.map((company, index) => {
                const isActive = hoveredIndex === index;
                return (
                  <div
                    key={company}
                    className={
                      "flex h-[210px] w-[150px] flex-col justify-between rounded-xl border p-5 transition-all duration-500 sm:h-[250px] sm:w-[180px] " +
                      (isActive
                        ? "border-white/40 bg-neutral-900 shadow-2xl"
                        : "border-white/10 bg-[#0d0d0f] opacity-70")
                    }
                  >
                    <span
                      className={
                        "font-mono text-[11px] tabular-nums " +
                        (isActive ? "text-neutral-300" : "text-faint")
                      }
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3
                        className={
                          "text-xl font-medium tracking-tight " +
                          (isActive ? "text-foreground" : "text-neutral-400")
                        }
                      >
                        {company}
                      </h3>
                    </div>
                  </div>
                );
              })
            }
          </RadialScrollGallery>
          <div className="h-[26vh]" />
        </section>
      )}

      {room === "writing" && (
        <section
          key="writing"
          className="animate-fade-in mx-auto flex min-h-dvh w-full max-w-xl flex-col justify-center px-6 pt-16 pb-36"
        >
          <p
            className="animate-fade-up text-[11px] tracking-[0.25em] text-faint"
            style={{ animationDelay: "0.05s" }}
          >
            writing
          </p>
          <h1
            className="animate-fade-up mt-3 text-[19px] font-medium tracking-tight sm:text-[21px]"
            style={{ animationDelay: "0.15s" }}
          >
            letters and essays.
          </h1>
          <div
            className="animate-fade-up mt-10"
            style={{ animationDelay: "0.3s" }}
          >
            {POSTS.map((post) => (
              <a
                key={post.title}
                href={post.url}
                className="group block border-b border-white/[0.07] py-7 transition-colors duration-300"
              >
                <div className="flex items-baseline justify-between gap-6">
                  <h3 className="text-[16px] font-medium tracking-tight text-neutral-300 transition-colors duration-300 group-hover:text-foreground">
                    {post.title}
                  </h3>
                  <span className="shrink-0 font-mono text-[11px] text-faint">
                    {post.published}
                  </span>
                </div>
                <p className="mt-2 max-w-md text-[13px] font-light leading-relaxed text-muted-foreground">
                  {post.summary}
                </p>
              </a>
            ))}
          </div>
        </section>
      )}

      {room === "pictures" && (
        <div
          key="pictures"
          className="animate-fade-in flex min-h-dvh flex-col items-center justify-center gap-3"
        >
          <p className="text-[19px] font-medium tracking-tight">pictures.</p>
          <p className="text-[12px] text-faint">soon.</p>
        </div>
      )}

      {/* the dock — small and quiet */}
      <div className="fixed bottom-4 left-1/2 z-50 max-w-full -translate-x-1/2">
        <Dock
          panelHeight={52}
          magnification={60}
          distance={110}
          className="items-end gap-2 rounded-xl border border-white/10 bg-neutral-950/80 px-2.5 pb-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.6)] backdrop-blur-md"
        >
          {DOCK_ITEMS.map((item) => (
            <DockItem
              key={item.room}
              onClick={() => setRoom(room === item.room ? null : item.room)}
              className={
                "aspect-square rounded-full border bg-neutral-900 " +
                (room === item.room ? "border-white/30" : "border-white/10")
              }
            >
              <DockLabel className="border-white/10 bg-neutral-900 text-neutral-200">
                {item.title}
              </DockLabel>
              <DockIcon>
                <item.icon
                  className={
                    "h-full w-full " +
                    (room === item.room ? "text-neutral-100" : "text-neutral-400")
                  }
                />
              </DockIcon>
            </DockItem>
          ))}
        </Dock>
      </div>
    </main>
  );
}
