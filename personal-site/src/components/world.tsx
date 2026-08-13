import { Dock, DockIcon, DockItem, DockLabel } from "@/components/ui/dock";
import {
  HoverRevealList,
  type RevealItem,
} from "@/components/ui/hover-reveal-list";
import { Blog8 } from "@/components/ui/blog8";
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

// self-contained monochrome covers so the posts render anywhere
const cover = (a: string, b: string, n: string) =>
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='450'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='${a}'/><stop offset='1' stop-color='${b}'/></linearGradient></defs><rect width='800' height='450' fill='url(%23g)'/><text x='40' y='400' font-family='monospace' font-size='28' fill='rgba(235,233,228,0.35)'>${n}</text></svg>`,
  );

const POSTS = [
  {
    id: "post-1",
    title: "on building quietly",
    summary:
      "the best work i've done never announced itself. why shipping softly beats launching loudly.",
    label: "essay",
    author: "alexander foster",
    published: "jul 2026",
    url: "#",
    image: cover("#1c1c1f", "#0c0c0e", "no.01"),
    tags: ["essay", "building"],
  },
  {
    id: "post-2",
    title: "simulation as a way of seeing",
    summary:
      "what building mirofish taught me about crowds, prediction, and the limits of asking people what they think.",
    label: "essay",
    author: "alexander foster",
    published: "may 2026",
    url: "#",
    image: cover("#232326", "#101012", "no.02"),
    tags: ["essay", "simulation"],
  },
  {
    id: "post-3",
    title: "interfaces that stay out of the way",
    summary:
      "a short argument for software that disappears — and the discipline it takes to leave things out.",
    label: "essay",
    author: "alexander foster",
    published: "feb 2026",
    url: "#",
    image: cover("#18181b", "#0a0a0c", "no.03"),
    tags: ["essay", "design"],
  },
  {
    id: "post-4",
    title: "notes to a younger builder",
    summary:
      "everything i wish someone had told me before i wrote my first line of production code.",
    label: "letter",
    author: "alexander foster",
    published: "nov 2025",
    url: "#",
    image: cover("#202023", "#0e0e10", "no.04"),
    tags: ["letter"],
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
          className="animate-fade-in mx-auto flex min-h-dvh w-full max-w-3xl flex-col justify-center px-6 pt-16 pb-36"
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
              invested in.
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
        <section key="writing" className="animate-fade-in w-full pb-24">
          <Blog8
            heading="writing."
            description="letters and essays — on building, thinking, and paying attention."
            posts={POSTS}
          />
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
