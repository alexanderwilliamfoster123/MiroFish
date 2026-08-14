import { FloatingDock } from "@/components/ui/floating-dock";
import { LinkFolder, type FolderLink } from "@/components/ui/link-folder";
import { SpiralAnimation } from "@/components/ui/spiral-animation";
import { WordReveal } from "@/components/ui/word-reveal";
import { LETTERS } from "@/lib/letters";
import {
  Apple,
  ArrowRight,
  AtSign,
  Briefcase,
  Camera,
  Feather,
  Home,
  Mail,
  Newspaper,
  Search,
  Wifi,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Room = "writing" | "socials" | "companies" | "contact";

// the wheels of companies, in order around each circle
const FOUNDED = ["vertus", "vanquish", "paktos", "tootski", "omera"];
// placeholder names — swap for the real portfolio
const INVESTED = ["aurora", "atlas", "solace", "ember", "northwind"];

// one row per place — swap hrefs/handles/descriptions for the real ones
const SOCIAL_CARDS: FolderLink[] = [
  {
    title: "the world",
    handle: "@alexanderfoster",
    icon: Instagram,
    href: "https://instagram.com/",
    description:
      "an instagram of places and days — the outside of a life, kept honestly.",
  },
  {
    title: "the mind",
    handle: "@alexanderfoster",
    icon: Instagram,
    href: "https://instagram.com/",
    description:
      "an instagram of ideas — diagrams, notes, things worth thinking twice about.",
  },
  {
    title: "the soul",
    handle: "@alexanderfoster",
    icon: Instagram,
    href: "https://instagram.com/",
    description:
      "an instagram of the quiet parts — what the building is actually for.",
  },
  {
    title: "linkedin",
    handle: "alexander foster",
    icon: Linkedin,
    href: "https://linkedin.com/",
    description: "the professional record — companies, roles, the long game.",
  },
  {
    title: "youtube",
    handle: "@alexanderfoster",
    icon: Youtube,
    href: "https://youtube.com/",
    description: "the moving pictures — films about building and thinking.",
  },
  {
    title: "x",
    handle: "@alexfoster",
    icon: Twitter,
    href: "https://x.com/",
    description: "thoughts as they happen. building in public, quietly.",
  },
];

const FRAMES_CARDS: FolderLink[] = [
  {
    title: "frames",
    handle: "photographs",
    icon: Camera,
    soon: true,
    description: "photographs in frames — still being developed. literally.",
  },
];

// small monochrome covers for the letter rows — swap for real imagery
const letterCover = (stops: string, extra: string) =>
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='640' height='360'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>${stops}</linearGradient></defs><rect width='640' height='360' fill='url(#g)'/>${extra}</svg>`,
  );

const LETTER_COVERS = [
  letterCover(
    "<stop offset='0' stop-color='#2a2a28'/><stop offset='1' stop-color='#0a0a0a'/>",
    "<polygon points='0,360 180,210 340,300 480,190 640,280 640,360' fill='#050505'/>",
  ),
  letterCover(
    "<stop offset='0' stop-color='#3c3b38'/><stop offset='1' stop-color='#0c0c0b'/>",
    "<circle cx='470' cy='110' r='36' fill='rgba(235,233,228,0.5)'/>",
  ),
  letterCover(
    "<stop offset='0' stop-color='#232322'/><stop offset='1' stop-color='#070707'/>",
    "<rect y='218' width='640' height='3' fill='rgba(235,233,228,0.28)'/>",
  ),
  letterCover(
    "<stop offset='0' stop-color='#31302d'/><stop offset='1' stop-color='#090908'/>",
    "<rect x='120' width='14' height='360' fill='rgba(10,10,9,0.6)'/><rect x='300' width='22' height='360' fill='rgba(10,10,9,0.7)'/><rect x='470' width='10' height='360' fill='rgba(10,10,9,0.5)'/>",
  ),
];

const DOCK_ITEMS: Array<{ room: Room; title: string; icon: typeof Feather }> = [
  { room: "companies", title: "companies", icon: Briefcase },
  { room: "socials", title: "socials", icon: AtSign },
  { room: "contact", title: "contact", icon: Mail },
];

const companyCards =
  (companies: string[]) => (hoveredIndex: number | null) =>
    companies.map((company, index) => {
      const isActive = hoveredIndex === index;
      return (
        <div
          key={company}
          className={
            "flex h-[196px] w-[142px] flex-col justify-between rounded-xl border p-5 transition-all duration-500 sm:h-[250px] sm:w-[180px] " +
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
    });

// every page title sits exactly where the landing copy sits
function RoomTitle({ children }: { children: React.ReactNode }) {
  return (
    <h1
      className="animate-fade-up absolute top-[16%] right-0 left-0 z-10 text-center text-[13px] font-medium tracking-tight"
      style={{ animationDelay: "0.1s" }}
    >
      {children}
    </h1>
  );
}

export function World() {
  const [room, setRoomState] = useState<Room | null>(null);
  const [letter, setLetter] = useState<number | null>(null);
  const [contactSent, setContactSent] = useState(false);
  const [warping, setWarping] = useState(false);
  const [message, setMessage] = useState("");
  const [openFolder, setOpenFolder] = useState<string | null>(null);
  const [hoverFolder, setHoverFolder] = useState<string | null>(null);
  const [screenEl, setScreenEl] = useState<HTMLDivElement | null>(null);
  const screenRef = useRef<HTMLDivElement | null>(null);

  const setRoom = (next: Room | null) => {
    setLetter(null);
    setOpenFolder(null);
    setHoverFolder(null);
    setContactSent(false);
    setMessage("");
    setRoomState(next);
  };

  const sendEmail = () => {
    const name = localStorage.getItem("gate:name") ?? "";
    const email = localStorage.getItem("gate:email") ?? "";
    const subject = name ? `hello from ${name}` : "hello";
    const body = `${message}\n\n— ${name} (${email})`;
    // gmail's compose screen opens right in the browser; fall back to the
    // system mail app when the popup is blocked
    const gmail =
      "https://mail.google.com/mail/?view=cm&fs=1&to=alex@vertus.ai" +
      `&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    const opened = window.open(gmail, "_blank", "noopener,noreferrer");
    if (!opened) {
      window.location.href =
        `mailto:alex@vertus.ai?subject=${encodeURIComponent(subject)}` +
        `&body=${encodeURIComponent(body)}`;
    }
    setContactSent(true);
    setWarping(true);
    window.setTimeout(() => {
      setRoomState(null);
      setMessage("");
      setContactSent(false);
      setWarping(false);
    }, 4600);
  };

  // typing anywhere writes the note (the textarea handles itself)
  useEffect(() => {
    if (room !== "contact" || contactSent) return;
    (document.activeElement as HTMLElement | null)?.blur?.();
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement | null)?.tagName === "TEXTAREA") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "Backspace") {
        e.preventDefault();
        setMessage((current) => current.slice(0, -1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        setMessage((current) => current + "\n");
      } else if (e.key.length === 1) {
        e.preventDefault();
        setMessage((current) => current + e.key);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [room, contactSent]);

  // esc steps back: folder -> letter -> home
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpenFolder((currentFolder) => {
        if (currentFolder !== null) return null;
        setLetter((currentLetter) => {
          if (currentLetter !== null) return null;
          setRoomState(null);
          return null;
        });
        return null;
      });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const path =
    room === null
      ? "home"
      : room === "companies"
        ? "founded"
        : room === "socials"
          ? "digital-real-estate"
          : room === "writing"
            ? "writing"
            : "connect";

  const now = new Date();

  return (
    <main className="flex min-h-dvh w-full flex-col items-center justify-center overflow-hidden px-2 py-2 sm:px-8 sm:py-6">
      {/* the machine — everything lives on its screen */}
      <div className="w-full sm:w-[min(1240px,94vw)]">
        {/* bezel */}
        <div className="rounded-xl bg-linear-to-b from-[#e9e9e7] to-[#d4d4d1] p-[6px] shadow-[0_30px_90px_rgba(0,0,0,0.55)] sm:rounded-[20px] sm:p-[12px] sm:pb-[26px]">
          <div
            ref={(node) => {
              screenRef.current = node;
              setScreenEl(node);
            }}
            className="desk-screen relative w-full overflow-hidden rounded-lg sm:rounded-[10px]"
            style={{ height: "min(86dvh, 780px)" }}
          >
            {/* menu bar */}
            <div className="flex h-6 items-center justify-between bg-white/[0.06] px-3 text-[10px] text-neutral-300 backdrop-blur">
              <div className="flex items-center gap-3">
                <Apple size={11} className="fill-neutral-200 text-neutral-200" />
                <span className="font-semibold text-neutral-100">safari</span>
                {["file", "edit", "view", "history", "window", "help"].map((menu) => (
                  <span key={menu} className="hidden text-neutral-400 sm:inline">
                    {menu}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2.5 text-neutral-400">
                <Wifi size={11} />
                <Search size={10} />
                <span className="text-neutral-300">
                  {now
                    .toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })
                    .replace(",", "")}{" "}
                  {now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>

            {/* the browser */}
            <div className="absolute inset-x-[2%] top-[38px] bottom-[64px] flex flex-col overflow-hidden rounded-lg border border-white/10 bg-background shadow-[0_24px_70px_rgba(0,0,0,0.6)] sm:inset-x-[3%]">
              {/* chrome */}
              <div className="flex shrink-0 items-center gap-3 border-b border-white/[0.07] bg-white/[0.03] px-3 py-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                </div>
                <div className="mx-auto flex h-5 w-[62%] items-center justify-center overflow-hidden rounded-md bg-white/[0.05] px-2">
                  <span className="truncate font-mono text-[9px] whitespace-nowrap text-neutral-500">
                    alexanderfoster.com/{path}
                  </span>
                </div>
                <div className="w-10" />
              </div>

              {/* the page */}
              <div className="relative flex-1 overflow-x-hidden overflow-y-auto">
                {room === null && (
                  <div className="animate-fade-in absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
                    <div>
                      <WordReveal
                        lead="by design."
                        paragraphs={[
                          "",
                          "in the act of building, don\u2019t forget the art of living.",
                        ]}
                        paragraphGap="mt-1.5"
                        className="text-[13px] leading-normal text-neutral-500"
                      />
                      <p
                        className="animate-fade-in mt-7 font-serif text-[14px] italic text-neutral-600"
                        style={{ animationDelay: "1s", animationDuration: "0.8s" }}
                      >
                        alexander
                      </p>
                    </div>
                  </div>
                )}

                {room === "companies" && (
                  <section key="companies" className="animate-fade-in relative min-h-full px-6 pt-24 pb-16">
                    <h1 className="animate-fade-up text-center text-[13px] font-medium tracking-tight" style={{ animationDelay: "0.1s" }}>
                      founded.
                    </h1>
                    <div className="animate-fade-up mx-auto mt-10 flex max-w-5xl flex-wrap justify-center gap-2 sm:gap-3" style={{ animationDelay: "0.25s" }}>
                      {companyCards(FOUNDED)(null)}
                    </div>
                    <h1 className="mt-16 text-center text-[13px] font-medium tracking-tight">
                      invested.
                    </h1>
                    <div className="mx-auto mt-10 flex max-w-5xl flex-wrap justify-center gap-2 sm:gap-3">
                      {companyCards(INVESTED)(null)}
                    </div>
                  </section>
                )}

                {room === "socials" && (
                  <section key="socials" className="animate-fade-in relative flex min-h-full flex-col items-center justify-center px-4 py-16">
                    <RoomTitle>digital real estate.</RoomTitle>
                    <div className="folder-shelf animate-fade-up mt-14 flex items-end justify-center gap-3" style={{ animationDelay: "0.25s" }}>
                      <LinkFolder
                        name="social media"
                        links={SOCIAL_CARDS}
                        open={openFolder === "social"}
                        onOpen={() => setOpenFolder("social")}
                        onClose={() => setOpenFolder(null)}
                        dimmed={openFolder !== null && openFolder !== "social"}
                        hovered={hoverFolder === "social"}
                        onHover={(hovering) => setHoverFolder(hovering ? "social" : null)}
                        overlayTo={screenEl}
                      />
                      <LinkFolder
                        name="writing"
                        links={[
                          {
                            title: "newsletter",
                            handle: "letters",
                            icon: Feather,
                            onSelect: () => setRoom("writing"),
                            description:
                              "letters, sent occasionally — read them right here on the site.",
                          },
                          {
                            title: "forbes column",
                            handle: "forbes",
                            icon: Newspaper,
                            href: "https://www.forbes.com/",
                            description: "the column — on building and simulation.",
                          },
                        ]}
                        open={openFolder === "writing"}
                        onOpen={() => setOpenFolder("writing")}
                        onClose={() => setOpenFolder(null)}
                        dimmed={openFolder !== null && openFolder !== "writing"}
                        hovered={hoverFolder === "writing"}
                        onHover={(hovering) => setHoverFolder(hovering ? "writing" : null)}
                        overlayTo={screenEl}
                      />
                      <LinkFolder
                        name="frames"
                        links={FRAMES_CARDS}
                        open={openFolder === "frames"}
                        onOpen={() => setOpenFolder("frames")}
                        onClose={() => setOpenFolder(null)}
                        dimmed={openFolder !== null && openFolder !== "frames"}
                        hovered={hoverFolder === "frames"}
                        onHover={(hovering) => setHoverFolder(hovering ? "frames" : null)}
                        overlayTo={screenEl}
                      />
                    </div>
                  </section>
                )}

                {room === "writing" && letter === null && (
                  <section key="writing-list" className="animate-fade-in relative mx-auto min-h-full w-full max-w-2xl px-6 pt-24 pb-16">
                    <h1 className="animate-fade-up text-center text-[13px] font-medium tracking-tight" style={{ animationDelay: "0.1s" }}>
                      writing.
                    </h1>
                    <div className="mt-10 flex flex-col gap-9">
                      {LETTERS.map((entry, index) => (
                        <div
                          key={entry.num}
                          className="animate-fade-in grid items-center gap-4 sm:grid-cols-10 sm:gap-8"
                          style={{ animationDelay: `${0.25 + index * 0.08}s`, animationDuration: "0.6s" }}
                        >
                          <div className="sm:col-span-6">
                            <p className="text-[9px] tracking-[0.2em] text-faint">
                              letter {entry.num} &middot; {entry.date}
                            </p>
                            <button
                              type="button"
                              onClick={() => setLetter(index)}
                              className="mt-1.5 cursor-pointer text-left text-[13px] font-medium tracking-tight text-neutral-300 transition-colors duration-300 hover:text-foreground"
                            >
                              {entry.title}
                            </button>
                            <p className="mt-1.5 line-clamp-2 text-[11px] leading-[1.6] text-neutral-500">
                              {entry.paragraphs[0]}
                            </p>
                            <button
                              type="button"
                              onClick={() => setLetter(index)}
                              className="group mt-2.5 inline-flex cursor-pointer items-center gap-1 text-[10px] text-neutral-500 transition-colors duration-300 hover:text-foreground"
                            >
                              read
                              <ArrowRight size={10} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => setLetter(index)}
                            className="order-first cursor-pointer sm:order-none sm:col-span-4"
                          >
                            <div className="aspect-video overflow-hidden rounded-md border border-white/10">
                              <img
                                src={LETTER_COVERS[index % LETTER_COVERS.length]}
                                alt={entry.title}
                                className="h-full w-full object-cover opacity-80 transition-opacity duration-300 hover:opacity-100"
                              />
                            </div>
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {room === "writing" && letter !== null && (
                  <section key={`letter-${letter}`} className="animate-fade-in relative mx-auto min-h-full w-full max-w-xl px-6 pt-16 pb-16">
                    <button
                      type="button"
                      onClick={() => setLetter(null)}
                      className="animate-fade-in absolute top-5 left-6 cursor-pointer text-[11px] tracking-[0.2em] text-faint transition-colors duration-300 hover:text-foreground"
                    >
                      &larr; back
                    </button>
                    <WordReveal
                      lead={`${LETTERS[letter].title}.`}
                      paragraphs={LETTERS[letter].paragraphs}
                      total={1.3}
                      className="mt-8 text-[13px] leading-[1.8] text-neutral-400"
                    />
                    <p
                      className="animate-fade-in mt-10 font-serif text-[15px] italic text-neutral-500"
                      style={{ animationDelay: "1.4s", animationDuration: "0.8s" }}
                    >
                      alexander
                    </p>
                    <p className="animate-fade-in mt-1 font-mono text-[10px] text-faint" style={{ animationDelay: "1.5s" }}>
                      {LETTERS[letter].date}
                    </p>
                  </section>
                )}

                {room === "contact" && (
                  <section key="contact" className="animate-fade-in relative flex min-h-full flex-col items-center justify-center px-4 py-14">
                    <RoomTitle>connect with me.</RoomTitle>
                    <div className="animate-fade-up mt-12 flex w-full max-w-md flex-col" style={{ animationDelay: "0.2s" }}>
                      <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0b0b0b] shadow-[0_24px_70px_rgba(0,0,0,0.5)]">
                        <div className="flex items-center justify-between border-b border-white/[0.07] bg-white/[0.03] px-4 py-2.5">
                          <div className="flex items-center gap-1.5">
                            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                          </div>
                          <span className="text-[10px] text-neutral-500">new message</span>
                          {!contactSent ? (
                            <button
                              type="button"
                              onClick={sendEmail}
                              disabled={!message.trim()}
                              className="cursor-pointer text-[11px] font-medium text-neutral-500 transition-colors duration-300 hover:text-foreground disabled:cursor-default disabled:opacity-40"
                            >
                              send &rarr;
                            </button>
                          ) : (
                            <div className="w-4" />
                          )}
                        </div>
                        {contactSent ? (
                          <div className="flex min-h-[220px] items-center justify-center">
                            <p className="text-[12px] text-neutral-500">
                              sent &mdash; thank you. i&rsquo;ll read it soon.
                            </p>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-baseline gap-2 border-b border-white/[0.06] px-4 py-2 text-[12px]">
                              <span className="text-neutral-500">to:</span>
                              <span className="text-neutral-200">alex@vertus.ai</span>
                            </div>
                            <div className="flex items-baseline gap-2 border-b border-white/[0.06] px-4 py-2 text-[12px]">
                              <span className="text-neutral-500">subject:</span>
                              <span className="text-neutral-200">
                                hello from {localStorage.getItem("gate:name") ?? "you"}
                              </span>
                            </div>
                            <textarea
                              value={message}
                              onChange={(event) => setMessage(event.target.value)}
                              rows={7}
                              autoFocus
                              placeholder="what&rsquo;s on your mind"
                              className="w-full resize-none bg-transparent px-4 py-3 text-[13px] leading-relaxed text-neutral-200 outline-none placeholder:text-faint"
                            />
                          </>
                        )}
                      </div>
                    </div>
                  </section>
                )}
              </div>
            </div>

            {/* the dock, living on the screen */}
            <div className="absolute bottom-2.5 left-1/2 z-30 -translate-x-1/2">
              <FloatingDock
                desktopClassName="border border-white/10 bg-neutral-950/80 shadow-[0_8px_30px_rgba(0,0,0,0.6)] backdrop-blur-md"
                items={[
                  {
                    title: "home",
                    active: room === null,
                    onClick: () => setRoom(null),
                    icon: (
                      <Home
                        className={
                          "h-full w-full " +
                          (room === null ? "text-foreground" : "text-neutral-400")
                        }
                      />
                    ),
                  },
                  ...DOCK_ITEMS.map((item) => ({
                    title: item.title,
                    active:
                      room === item.room ||
                      (item.room === "socials" && room === "writing"),
                    onClick: () => setRoom(room === item.room ? null : item.room),
                    icon: (
                      <item.icon
                        className={
                          "h-full w-full " +
                          (room === item.room ? "text-foreground" : "text-neutral-400")
                        }
                      />
                    ),
                  })),
                ]}
              />
            </div>
          </div>
        </div>

        {/* the stand */}
        <div className="mx-auto hidden h-20 w-32 bg-linear-to-b from-[#d9d9d6] via-[#efefec] to-[#c9c9c6] sm:block" />
        <div className="mx-auto hidden h-[7px] w-44 rounded-[3px] bg-linear-to-b from-[#e6e6e3] to-[#bfbfbc] sm:block" />
      </div>

      {/* after send: the spiral swells out of the computer screen, then home */}
      {warping && (
        <div className="spiral-swell fixed inset-0 z-[90] overflow-hidden bg-black">
          <SpiralAnimation />
        </div>
      )}
    </main>
  );
}
