import { Dock, DockIcon, DockItem, DockLabel } from "@/components/ui/dock";
import {
  HoverRevealList,
  type RevealItem,
} from "@/components/ui/hover-reveal-list";
import { RadialScrollGallery } from "@/components/ui/portfolio-and-image-gallery";
import {
  CoverflowCarousel,
  type CoverflowSlide,
} from "@/components/ui/coverflow-carousel";
import { WordReveal } from "@/components/ui/word-reveal";
import { LETTERS } from "@/lib/letters";
import {
  AtSign,
  Briefcase,
  Camera,
  Feather,
  Mail,
  Github,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

type Room = "writing" | "pictures" | "socials" | "companies" | "contact";

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

// monochrome placeholder photographs for the coverflow — swap for real ones
const photo = (stops: string, extra: string) =>
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='640' height='640'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>${stops}</linearGradient><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2'/><feColorMatrix type='matrix' values='0 0 0 0 0.85  0 0 0 0 0.85  0 0 0 0 0.83  0 0 0 0.05 0'/><feComposite operator='over' in2='SourceGraphic'/></filter></defs><g filter='url(%23n)'><rect width='640' height='640' fill='url(%23g)'/>${extra}</g></svg>`,
  );

const PHOTOS: CoverflowSlide[] = [
  {
    src: photo(
      "<stop offset='0' stop-color='#cfccc5'/><stop offset='1' stop-color='#3a3936'/>",
      "<polygon points='0,640 150,390 330,510 480,340 640,470 640,640' fill='#232220'/>",
    ),
    alt: "ridge line in monochrome",
    title: "portra 400",
    subtitle: "35mm",
  },
  {
    src: photo(
      "<stop offset='0' stop-color='#8f8c86'/><stop offset='1' stop-color='#1c1b19'/>",
      "<rect y='395' width='640' height='4' fill='rgba(235,233,228,0.35)'/>",
    ),
    alt: "a horizon, nothing else",
    title: "tri-x 400",
    subtitle: "35mm",
  },
  {
    src: photo(
      "<stop offset='0' stop-color='#3a3936'/><stop offset='1' stop-color='#050505'/>",
      "<circle cx='450' cy='170' r='52' fill='rgba(235,233,228,0.75)'/>",
    ),
    alt: "moon over a dark field",
    title: "cinestill 800t",
    subtitle: "50mm",
  },
  {
    src: photo(
      "<stop offset='0' stop-color='#e3e0d9'/><stop offset='1' stop-color='#57544f'/>",
      "<rect x='80' width='18' height='640' fill='rgba(20,19,18,0.5)'/><rect x='230' width='30' height='640' fill='rgba(20,19,18,0.65)'/><rect x='430' width='14' height='640' fill='rgba(20,19,18,0.45)'/>",
    ),
    alt: "trees against winter light",
    title: "ektar 100",
    subtitle: "28mm",
  },
  {
    src: photo(
      "<stop offset='0' stop-color='#6e6b66'/><stop offset='1' stop-color='#141312'/>",
      "<polygon points='0,640 250,270 430,430 640,230 640,640' fill='#111010'/>",
    ),
    alt: "mountains before rain",
    title: "portra 800",
    subtitle: "35mm",
  },
];

const DOCK_ITEMS: Array<{ room: Room; title: string; icon: typeof Feather }> = [
  { room: "companies", title: "companies", icon: Briefcase },
  { room: "writing", title: "writing", icon: Feather },
  { room: "pictures", title: "pictures", icon: Camera },
  { room: "socials", title: "socials", icon: AtSign },
  { room: "contact", title: "contact", icon: Mail },
];

interface WorldProps {
  onLeave: () => void;
}

export function World({ onLeave }: WorldProps) {
  const [room, setRoomState] = useState<Room | null>(null);
  const [letter, setLetter] = useState<number | null>(null);
  const [contactSent, setContactSent] = useState(false);

  const setRoom = (next: Room | null) => {
    setLetter(null);
    setContactSent(false);
    setRoomState(next);
  };

  const handleContact = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();
    const subject = encodeURIComponent(name ? `hello from ${name}` : "hello");
    const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
    window.location.href = `mailto:alex@vertus.ai?subject=${subject}&body=${body}`;
    setContactSent(true);
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
        <div className="mx-auto flex min-h-dvh w-full max-w-2xl items-center px-6 pb-28">
          <div>
            <WordReveal
              lead="i built vertus."
              paragraphs={[
                "",
                "now i'm building vanquish, paktos, tootski and omera.",
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
        <section
          key="pictures"
          className="animate-fade-in mx-auto flex min-h-dvh w-full max-w-5xl flex-col justify-center overflow-hidden px-0 pt-16 pb-32"
        >
          <h1
            className="animate-fade-up text-center text-[19px] font-medium tracking-tight sm:text-[21px]"
            style={{ animationDelay: "0.1s" }}
          >
            frames.
          </h1>
          <div className="animate-fade-up mt-2" style={{ animationDelay: "0.25s" }}>
            <CoverflowCarousel
              slides={PHOTOS}
              showCaption
              label="frames"
              cardClassName="rounded-lg border border-white/10"
            />
          </div>
        </section>
      )}

      {room === "contact" && (
        <section
          key="contact"
          className="animate-fade-in mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-6 pt-16 pb-36"
        >
          <h1
            className="animate-fade-up text-[19px] font-medium tracking-tight sm:text-[21px]"
            style={{ animationDelay: "0.1s" }}
          >
            say hello.
          </h1>
          {contactSent ? (
            <p className="animate-fade-up mt-8 text-[15px] text-neutral-400">
              thank you — i&rsquo;ll read it soon.
            </p>
          ) : (
            <form
              className="animate-fade-up mt-8 flex flex-col gap-6"
              style={{ animationDelay: "0.2s" }}
              onSubmit={handleContact}
            >
              <input
                name="name"
                autoComplete="name"
                placeholder="your name"
                defaultValue={localStorage.getItem("gate:name") ?? ""}
                className="w-full border-b border-white/10 bg-transparent py-2 text-[15px] text-foreground outline-none transition-colors duration-300 placeholder:text-faint focus:border-white/40"
              />
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="your email"
                defaultValue={localStorage.getItem("gate:email") ?? ""}
                className="w-full border-b border-white/10 bg-transparent py-2 text-[15px] text-foreground outline-none transition-colors duration-300 placeholder:text-faint focus:border-white/40"
              />
              <textarea
                name="message"
                required
                rows={4}
                placeholder="what&rsquo;s on your mind"
                className="w-full resize-none border-b border-white/10 bg-transparent py-2 text-[15px] text-foreground outline-none transition-colors duration-300 placeholder:text-faint focus:border-white/40"
              />
              <button
                type="submit"
                className="cursor-pointer self-start text-[13px] text-neutral-500 transition-colors duration-300 hover:text-foreground"
              >
                send &rarr;
              </button>
            </form>
          )}
        </section>
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
