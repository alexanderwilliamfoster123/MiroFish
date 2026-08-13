import { Dock, DockIcon, DockItem, DockLabel } from "@/components/ui/dock";
import {
  HoverRevealList,
  type RevealItem,
} from "@/components/ui/hover-reveal-list";
import { RadialScrollGallery } from "@/components/ui/portfolio-and-image-gallery";
import IntroAnimation from "@/components/ui/scroll-morph-hero";
import { WordReveal } from "@/components/ui/word-reveal";
import { LETTERS } from "@/lib/letters";
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

// monochrome placeholder photographs for the stack — swap for real ones
const photo = (stops: string, extra: string) =>
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='500' height='700'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>${stops}</linearGradient><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2'/><feColorMatrix type='matrix' values='0 0 0 0 0.85  0 0 0 0 0.85  0 0 0 0 0.83  0 0 0 0.05 0'/><feComposite operator='over' in2='SourceGraphic'/></filter></defs><g filter='url(%23n)'><rect width='500' height='700' fill='url(%23g)'/>${extra}</g></svg>`,
  );

const PHOTOS = [
  photo(
    "<stop offset='0' stop-color='#cfccc5'/><stop offset='1' stop-color='#3a3936'/>",
    "<polygon points='0,700 120,430 260,560 380,380 500,520 500,700' fill='#232220'/>",
  ),
  photo(
    "<stop offset='0' stop-color='#8f8c86'/><stop offset='1' stop-color='#1c1b19'/>",
    "<rect y='430' width='500' height='4' fill='rgba(235,233,228,0.35)'/>",
  ),
  photo(
    "<stop offset='0' stop-color='#3a3936'/><stop offset='1' stop-color='#050505'/>",
    "<circle cx='360' cy='170' r='46' fill='rgba(235,233,228,0.75)'/>",
  ),
  photo(
    "<stop offset='0' stop-color='#e3e0d9'/><stop offset='1' stop-color='#57544f'/>",
    "<rect x='60' width='16' height='700' fill='rgba(20,19,18,0.5)'/><rect x='180' width='26' height='700' fill='rgba(20,19,18,0.65)'/><rect x='340' width='12' height='700' fill='rgba(20,19,18,0.45)'/>",
  ),
  photo(
    "<stop offset='0' stop-color='#6e6b66'/><stop offset='1' stop-color='#141312'/>",
    "<polygon points='0,700 200,300 340,470 500,260 500,700' fill='#111010'/>",
  ),
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
  const [room, setRoomState] = useState<Room | null>(null);
  const [letter, setLetter] = useState<number | null>(null);

  const setRoom = (next: Room | null) => {
    setLetter(null);
    setRoomState(next);
  };

  // esc steps back: letter -> writing -> home
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setLetter((currentLetter) => {
        if (currentLetter !== null) return null;
        setRoomState(null);
        return null;
      });
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
        <div className="mx-auto flex min-h-dvh w-full max-w-4xl items-center px-6 pb-28">
          <div className="grid w-full gap-12 sm:grid-cols-[150px_1fr] sm:gap-16">
            {/* side links, fey-style */}
            <nav className="flex flex-row flex-wrap gap-x-5 gap-y-2 sm:flex-col sm:gap-3 sm:pt-1.5">
              {DOCK_ITEMS.map((item, index) => (
                <button
                  key={item.room}
                  type="button"
                  onClick={() => setRoom(item.room)}
                  className="animate-fade-in cursor-pointer text-left text-[13px] text-neutral-500 transition-colors duration-300 hover:text-foreground"
                  style={{ animationDelay: `${0.3 + index * 0.08}s`, animationDuration: "0.6s" }}
                >
                  {item.title}
                </button>
              ))}
            </nav>

            {/* the statement */}
            <div>
              <WordReveal
                lead="every world has a key — you used yours."
                paragraphs={[
                  "this is where i keep what i make: the companies i've founded, the letters i write, the pictures i take, and the places you can find me. all of it built quietly, most of it still being carved.",
                  "take the dock below, or the doors on the left. stay as long as you like.",
                ]}
                className="text-[19px] leading-[1.6] font-light text-neutral-400 sm:text-[21px]"
              />
              <p
                className="animate-fade-in mt-10 font-serif text-2xl italic text-neutral-500"
                style={{ animationDelay: "1s", animationDuration: "0.8s" }}
              >
                alexander
              </p>
            </div>
          </div>
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
            <h1
              className="animate-fade-up text-[19px] font-medium tracking-tight sm:text-[21px]"
              style={{ animationDelay: "0.1s" }}
            >
              founded.
            </h1>
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

      {room === "writing" && letter === null && (
        <section
          key="writing-list"
          className="animate-fade-in mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-6 pt-16 pb-36"
        >
          <h1
            className="animate-fade-up text-[19px] font-medium tracking-tight sm:text-[21px]"
            style={{ animationDelay: "0.1s" }}
          >
            writing.
          </h1>
          <div className="mt-8 flex flex-col">
            {LETTERS.map((entry, index) => (
              <button
                key={entry.num}
                type="button"
                onClick={() => setLetter(index)}
                className="animate-fade-in group flex cursor-pointer items-baseline justify-between gap-6 border-b border-white/[0.07] py-4 text-left"
                style={{ animationDelay: `${0.25 + index * 0.08}s`, animationDuration: "0.6s" }}
              >
                <span className="text-[15px] font-medium tracking-tight text-neutral-500 transition-colors duration-300 group-hover:text-foreground">
                  {entry.title}
                </span>
                <span className="shrink-0 font-mono text-[10px] text-faint">
                  {entry.date}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {room === "writing" && letter !== null && (
        <section
          key={`letter-${letter}`}
          className="animate-fade-in mx-auto flex min-h-dvh w-full max-w-xl flex-col justify-center px-6 pt-20 pb-36"
        >
          <button
            type="button"
            onClick={() => setLetter(null)}
            className="animate-fade-in fixed top-5 left-6 z-50 cursor-pointer text-[11px] tracking-[0.2em] text-faint transition-colors duration-300 hover:text-foreground"
          >
            ← back
          </button>
          <WordReveal
            lead={LETTERS[letter].title + "."}
            paragraphs={LETTERS[letter].paragraphs}
            total={1.3}
            className="text-[16px] leading-[1.75] font-light text-neutral-400 sm:text-[17px]"
          />
          <p
            className="animate-fade-in mt-10 font-serif text-xl italic text-neutral-500"
            style={{ animationDelay: "1.5s", animationDuration: "0.8s" }}
          >
            alexander
            <span className="ml-3 font-sans text-[11px] not-italic text-faint">
              {LETTERS[letter].date}
            </span>
          </p>
        </section>
      )}

      {room === "pictures" && (
        <div key="pictures" className="animate-fade-in h-dvh w-full overflow-hidden">
          <IntroAnimation images={[...PHOTOS, ...PHOTOS, ...PHOTOS, ...PHOTOS]} />
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
