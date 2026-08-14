import { Dock, DockIcon, DockItem, DockLabel } from "@/components/ui/dock";
import {
  HoverRevealList,
  type RevealItem,
} from "@/components/ui/hover-reveal-list";
import { RadialScrollGallery } from "@/components/ui/portfolio-and-image-gallery";
import { Mac } from "@/components/ui/mac";
import Keyboard from "@/components/ui/magic-keyboard-component";
import { WordReveal } from "@/components/ui/word-reveal";
import { LETTERS } from "@/lib/letters";
import {
  AtSign,
  Briefcase,
  Feather,
  Mail,
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
const SOCIALS: RevealItem[] = [
  {
    title: "instagram",
    handle: "@alexanderfoster",
    description: "three doors — the world, the mind, the soul.",
    href: "https://instagram.com/",
    icon: Instagram,
    sublinks: [
      { title: "the world", href: "https://instagram.com/" },
      { title: "the mind", href: "https://instagram.com/" },
      { title: "the soul", href: "https://instagram.com/" },
    ],
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
];

const DOCK_ITEMS: Array<{ room: Room; title: string; icon: typeof Feather }> = [
  { room: "companies", title: "companies", icon: Briefcase },
  { room: "writing", title: "writing", icon: Feather },
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

interface WorldProps {
  onLeave: () => void;
}

export function World({ onLeave }: WorldProps) {
  const [room, setRoomState] = useState<Room | null>(null);
  const [letter, setLetter] = useState<number | null>(null);
  const [contactSent, setContactSent] = useState(false);
  const [message, setMessage] = useState("");

  const setRoom = (next: Room | null) => {
    setLetter(null);
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
  };

  // the magic keyboard is markup-only — read whichever key was pressed
  const onKeyboardClick = (event: MouseEvent<HTMLDivElement>) => {
    if (contactSent) return;
    const keyDiv = (event.target as HTMLElement).closest("div");
    if (!keyDiv) return;
    const label = (keyDiv.textContent ?? "").trim();
    if (label === "delete") setMessage((current) => current.slice(0, -1));
    else if (label === "return") setMessage((current) => current + "\n");
    else if (label === "" && keyDiv.className.includes("flex-[5]"))
      setMessage((current) => current + " ");
    else if (/^[a-z0-9`\-=[\]\\;',./]$/i.test(label))
      setMessage((current) => current + label.toLowerCase());
  };

  useEffect(() => {
    if (room !== "contact" || contactSent) return;
    // the clicked dock item keeps focus — space/enter would re-trigger it
    (document.activeElement as HTMLElement | null)?.blur?.();
    const onKey = (e: KeyboardEvent) => {
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
              paragraphGap="mt-2"
              className="text-[15px] leading-normal text-neutral-500"
            />
            <p
              className="animate-fade-in mt-8 font-serif text-base italic text-neutral-600"
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
            {companyCards(FOUNDED)}
          </RadialScrollGallery>

          {/* the first wheel lets go, then the second set begins */}
          <div className="flex h-[52vh] flex-col items-center justify-end px-6 text-center">
            <h1 className="text-[19px] font-medium tracking-tight sm:text-[21px]">
              invested.
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
            {companyCards(INVESTED)}
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

      {room === "contact" && (
        <section
          key="contact"
          className="animate-fade-in flex min-h-dvh flex-col items-center justify-center gap-4 overflow-hidden px-4 pt-10 pb-30"
        >
          <div className="animate-fade-up relative w-[min(620px,94vw)]" style={{ animationDelay: "0.1s" }}>
            <Mac className="h-auto w-full text-[#101010]" />
            {/* the mail window, projected onto the screen */}
            <div className="absolute top-[5%] left-[4.9%] flex h-[61%] w-[90.2%] flex-col overflow-hidden bg-[#f7f7f5] text-neutral-900">
              <div className="flex items-center justify-between border-b border-neutral-200 px-3 py-1.5">
                <span className="text-[10px] text-neutral-400">new message</span>
                {!contactSent && (
                  <button
                    type="button"
                    onClick={sendEmail}
                    disabled={!message.trim()}
                    className="cursor-pointer text-[10px] font-medium text-neutral-500 transition-colors duration-300 hover:text-neutral-900 disabled:cursor-default disabled:opacity-40"
                  >
                    send &rarr;
                  </button>
                )}
              </div>
              {contactSent ? (
                <div className="flex flex-1 items-center justify-center">
                  <p className="text-[11px] text-neutral-500">
                    sent — thank you. i&rsquo;ll read it soon.
                  </p>
                </div>
              ) : (
                <>
                  <div className="border-b border-neutral-200 px-3 py-1 text-[10px] text-neutral-400">
                    to: <span className="text-neutral-600">alex@vertus.ai</span>
                  </div>
                  <div className="border-b border-neutral-200 px-3 py-1 text-[10px] text-neutral-400">
                    subject:{" "}
                    <span className="text-neutral-600">
                      hello from {localStorage.getItem("gate:name") ?? "you"}
                    </span>
                  </div>
                  <div className="flex-1 overflow-y-auto px-3 py-2 text-[11px] leading-relaxed whitespace-pre-wrap">
                    {message}
                    <span className="animate-cursor-blink ml-px inline-block h-[11px] w-[1.5px] translate-y-[2px] bg-neutral-900" />
                  </div>
                </>
              )}
            </div>
          </div>

          <div
            className="animate-fade-up"
            style={{ animationDelay: "0.25s", zoom: 0.78 }}
            onClick={onKeyboardClick}
          >
            <Keyboard />
          </div>

          <p className="animate-fade-up text-[11px] tracking-[0.2em] text-faint" style={{ animationDelay: "0.4s" }}>
            type your note — send opens it in your browser
          </p>
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
