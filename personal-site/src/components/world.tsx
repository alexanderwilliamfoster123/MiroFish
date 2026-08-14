import { FloatingDock } from "@/components/ui/floating-dock";
import { LinkFolder, type FolderLink } from "@/components/ui/link-folder";
import { RadialScrollGallery } from "@/components/ui/portfolio-and-image-gallery";
import { Mac } from "@/components/ui/mac";
import Keyboard from "@/components/ui/magic-keyboard-component";
import { WordReveal } from "@/components/ui/word-reveal";
import { LETTERS } from "@/lib/letters";
import {
  Apple,
  ArrowRight,
  AtSign,
  Briefcase,
  Camera,
  ChevronDown,
  CirclePlus,
  Feather,
  Folder,
  Home,
  Images,
  Mail,
  Newspaper,
  Paperclip,
  PenLine,
  Search,
  Send,
  Smile,
  Type,
  Undo2,
  Wifi,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
} from "lucide-react";
import { useEffect, useState, type MouseEvent } from "react";

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
    });

// every page title sits exactly where the landing copy sits
function RoomTitle({ children }: { children: React.ReactNode }) {
  return (
    <h1
      className="animate-fade-up absolute top-[24vh] right-0 left-0 z-10 text-center text-[13px] font-medium tracking-tight"
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
  const [message, setMessage] = useState("");
  const [openFolder, setOpenFolder] = useState<string | null>(null);
  const [hoverFolder, setHoverFolder] = useState<string | null>(null);
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 640px)");
    const update = () => setIsMobileView(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

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
    const mailto =
      `mailto:alex@vertus.ai?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`;
    // both attempts open in a separate tab; the site itself never
    // navigates away (a blocked popup must not blank the page)
    const opened = window.open(gmail, "_blank", "noopener,noreferrer");
    if (!opened) {
      const link = document.createElement("a");
      link.href = mailto;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
    // the window flips to its sent state, rests a moment, then goes home
    setContactSent(true);
    window.setTimeout(() => {
      setRoomState(null);
      setMessage("");
      setContactSent(false);
    }, 3000);
  };


  useEffect(() => {
    if (room !== "contact" || contactSent) return;
    // the clicked dock item keeps focus — space/enter would re-trigger it
    (document.activeElement as HTMLElement | null)?.blur?.();
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement | null)?.tagName === "TEXTAREA") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "Backspace") {
        e.preventDefault();
        setMessage((current) => current.slice(0, -1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        // return sends; shift+return makes a new line
        if (e.shiftKey) setMessage((current) => current + "\n");
        else if (message.trim()) sendEmail();
      } else if (e.key.length === 1) {
        e.preventDefault();
        setMessage((current) => current + e.key);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room, contactSent, message]);

  // the magic keyboard is markup-only — read whichever key was pressed
  const onKeyboardClick = (event: MouseEvent<HTMLDivElement>) => {
    if (contactSent) return;
    const keyDiv = (event.target as HTMLElement).closest("div");
    if (!keyDiv) return;
    const label = (keyDiv.textContent ?? "").trim();
    if (label === "delete") setMessage((current) => current.slice(0, -1));
    else if (label === "return") {
      if (message.trim()) sendEmail();
    } else if (label === "" && keyDiv.className.includes("flex-[5]"))
      setMessage((current) => current + " ");
    else if (/^[a-z0-9`\-=[\]\;',./]$/i.test(label))
      setMessage((current) => current + label.toLowerCase());
  };

  // esc steps back: letter -> writing -> home
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


  return (
    <main className="relative min-h-dvh w-full">
      {room === null && (
        <div className="flex min-h-dvh w-full flex-col items-center px-6 pt-[24vh] text-center">
          <div>
            <WordReveal
              lead="by design."
              paragraphs={[""]}
              className="text-[13px] leading-[1.5] text-neutral-500"
            />
          </div>
        </div>
      )}

      {room === "socials" && (
        <section
          key="socials"
        >
          <RoomTitle>digital real estate.</RoomTitle>
          <div
          className="animate-fade-in flex min-h-dvh w-full flex-col items-center justify-center overflow-hidden px-4 pt-14 pb-32"
          >

          <div
            className="folder-shelf animate-fade-up mt-8 flex items-end justify-center gap-3"
            style={{ animationDelay: "0.35s" }}
          >
            <LinkFolder
              name="social media"
              links={SOCIAL_CARDS}
              open={openFolder === "social"}
              onOpen={() => setOpenFolder("social")}
              onClose={() => setOpenFolder(null)}
              dimmed={openFolder !== null && openFolder !== "social"}
              hovered={hoverFolder === "social"}
              onHover={(hovering) => setHoverFolder(hovering ? "social" : null)}
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
            />
          </div>
          </div>
        </section>
      )}

      {room === "companies" && (
        <section key="companies" className="animate-fade-in w-full">
          <RoomTitle>founded.</RoomTitle>
          {isMobileView ? (
            <div className="px-6 pt-[34vh] pb-32">
              <div className="grid grid-cols-2 justify-items-center gap-3">
                {companyCards(FOUNDED)(null)}
              </div>
              <h1 className="mt-14 text-center text-[13px] font-medium tracking-tight">
                invested.
              </h1>
              <div className="mt-6 grid grid-cols-2 justify-items-center gap-3">
                {companyCards(INVESTED)(null)}
              </div>
            </div>
          ) : (
            <>
              <div className="h-[42vh]" />
              <RadialScrollGallery
                className="!min-h-[64vh]"
                baseRadius={430}
                mobileRadius={210}
                scrollDuration={1600}
                visiblePercentage={42}
                startTrigger="top 35%"
              >
                {companyCards(FOUNDED)}
              </RadialScrollGallery>

              {/* the first wheel lets go, then the second set begins */}
              <div className="flex h-[52vh] flex-col items-center justify-end px-6">
                <h1 className="text-[13px] font-medium tracking-tight">invested.</h1>
              </div>
              <RadialScrollGallery
                className="!min-h-[64vh]"
                baseRadius={430}
                mobileRadius={210}
                scrollDuration={1600}
                visiblePercentage={42}
                startTrigger="top 35%"
              >
                {companyCards(INVESTED)}
              </RadialScrollGallery>
              <div className="h-[26vh]" />
            </>
          )}
        </section>
      )}

      {room === "writing" && letter === null && (
        <section
          key="writing-list"
          className="animate-fade-in mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-6 pt-[32vh] pb-36"
        >
          <RoomTitle>writing.</RoomTitle>
          <div className="flex flex-col gap-9">
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
                    <ArrowRight
                      size={10}
                      className="transition-transform duration-300 group-hover:translate-x-0.5"
                    />
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
            className="text-[13px] leading-[1.8] text-neutral-400"
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

      {room === "contact" && (
        <section
          key="contact"
          className="animate-fade-in flex min-h-dvh flex-col items-center gap-6 overflow-hidden px-4 pt-[31vh] pb-24"
        >
          <RoomTitle>connect with me.</RoomTitle>
          {/* phones: a plain compose card with a real textarea */}
          <div className="animate-fade-up flex w-full max-w-sm flex-col sm:hidden">
            <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0b0b0b]">
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
                    rows={8}
                    placeholder="what&rsquo;s on your mind"
                    className="w-full resize-none bg-transparent px-4 py-3 text-[13px] leading-relaxed text-neutral-200 outline-none placeholder:text-faint"
                  />
                </>
              )}
            </div>
            {!contactSent && (
              <p className="animate-fade-in mt-3 text-center text-[11px] text-faint">
                write your email, then tap send
              </p>
            )}
          </div>

          {/* the display — silver, with the desktop running mail */}
          <div
            className="animate-fade-up relative hidden w-[min(400px,88vw)] sm:block"
            style={{ animationDelay: "0.1s" }}
          >
            <Mac className="desk-glass h-auto w-full text-[#050505]" />
            <div
              className="desk-screen absolute top-[5%] left-[4.9%] flex h-[61%] w-[90.2%] flex-col overflow-hidden text-neutral-200"
            >
              {/* menu bar */}
              <div className="flex h-[16px] shrink-0 items-center justify-between bg-white/[0.06] px-2.5 text-[8px] text-neutral-300">
                <div className="flex items-center gap-2.5">
                  <Apple size={9} className="fill-neutral-200 text-neutral-200" />
                  <span className="font-semibold text-neutral-100">mail</span>
                  {["file", "edit", "view", "mailbox", "message"].map(
                    (menu) => (
                      <span key={menu} className="text-neutral-400">
                        {menu}
                      </span>
                    ),
                  )}
                </div>
                <div className="flex items-center gap-2 text-neutral-400">
                  <Wifi size={9} />
                  <Search size={8} />
                  <span className="text-neutral-300">
                    {new Date()
                      .toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })
                      .replace(",", "")}{" "}
                    {new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>

              {/* desktop */}
              <div className="relative flex flex-1 items-center justify-center">
                <div className="absolute top-2.5 right-3.5 flex gap-4">
                  {["dumps", "folders"].map((name) => (
                    <div key={name} className="flex flex-col items-center gap-0.5">
                      <Folder size={20} strokeWidth={1} className="desk-folder fill-white/10 text-white/25" />
                      <span className="text-[7px] font-medium text-neutral-300">{name}</span>
                    </div>
                  ))}
                </div>

                {/* compose window */}
                <div className="desk-window flex h-[74%] w-[52%] flex-col overflow-hidden rounded-md border border-white/10 bg-[#141414] shadow-[0_18px_50px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.06)]">
                  <div className="flex items-center gap-2.5 border-b border-white/[0.06] bg-white/[0.03] px-2.5 py-1.5">
                    <div className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#ff5f57]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-[#febc2e]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-[#28c840]" />
                    </div>
                    <button
                      type="button"
                      onClick={sendEmail}
                      disabled={contactSent || !message.trim()}
                      aria-label="send"
                      className="flex cursor-pointer items-center gap-0.5 text-neutral-400 transition-colors duration-300 hover:text-foreground disabled:cursor-default disabled:opacity-35"
                    >
                      <Send size={10} strokeWidth={1.75} />
                      <ChevronDown size={7} />
                    </button>
                    <div className="ml-auto flex items-center gap-2 text-neutral-500">
                      <Undo2 size={9} strokeWidth={1.75} />
                      <Paperclip size={9} strokeWidth={1.75} />
                      <PenLine size={9} strokeWidth={1.75} />
                      <Type size={10} strokeWidth={1.75} />
                      <Smile size={10} strokeWidth={1.75} />
                      <Images size={10} strokeWidth={1.75} />
                    </div>
                  </div>

                  {contactSent ? (
                    <div className="flex flex-1 items-center justify-center">
                      <p className="text-[9px] text-neutral-500">
                        sent &mdash; thank you. i&rsquo;ll read it soon.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-1.5 border-b border-white/[0.06] px-2.5 py-1 text-[8.5px]">
                        <span className="text-neutral-500">to:</span>
                        <span className="text-neutral-200">alex@vertus.ai</span>
                        <CirclePlus size={9} strokeWidth={1.5} className="ml-auto text-neutral-500" />
                      </div>
                      <div className="flex items-center gap-1.5 border-b border-white/[0.06] px-2.5 py-1 text-[8.5px]">
                        <span className="text-neutral-500">cc:</span>
                      </div>
                      <div className="flex items-center gap-1.5 border-b border-white/[0.06] px-2.5 py-1 text-[8.5px]">
                        <span className="text-neutral-500">subject:</span>
                        <span className="text-neutral-200">
                          hello from {localStorage.getItem("gate:name") ?? "you"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 border-b border-white/[0.06] px-2.5 py-1 text-[8.5px]">
                        <span className="text-neutral-500">from:</span>
                        <span className="text-neutral-200">
                          {localStorage.getItem("gate:name") ?? "you"} &ndash;{" "}
                          {localStorage.getItem("gate:email") ?? "your email"}
                        </span>
                      </div>
                      <div className="flex-1 overflow-y-auto px-2.5 py-2 text-[9px] leading-[1.7] whitespace-pre-wrap">
                        {message}
                        <span className="animate-cursor-blink ml-px inline-block h-[9px] w-px translate-y-[1.5px] bg-neutral-200" />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <p className="animate-fade-in hidden text-[11px] text-faint sm:block">
            {contactSent ? " " : "write your email, then press return to send"}
          </p>

          {/* the keyboard on the desk, true to proportion */}
          <div
            className="animate-fade-up hidden sm:block"
            style={{ animationDelay: "0.25s", zoom: 0.3 }}
            onClick={onKeyboardClick}
          >
            <Keyboard />
          </div>
        </section>
      )}

      {/* the dock — small and quiet */}
      <div className="fixed bottom-4 left-1/2 z-50 max-w-full -translate-x-1/2">
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
    </main>
  );
}
