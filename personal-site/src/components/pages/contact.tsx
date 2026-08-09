import { Console, type ConsoleCommand } from "@/components/ui/console";
import { AnimatedTicket } from "@/components/ui/ticket-confirmation-card";
import type { Section } from "@/lib/sections";
import { useMemo, useState } from "react";

interface ContactPageProps {
  email: string;
  onNavigate: (section: Section) => void;
  onLeave: () => void;
}

const SOCIAL_URLS: Record<string, string> = {
  instagram: "https://instagram.com/",
  x: "https://x.com/",
  linkedin: "https://linkedin.com/",
  youtube: "https://youtube.com/",
  github: "https://github.com/alexanderwilliamfoster123",
};

export function ContactPage({ email, onNavigate, onLeave }: ContactPageProps) {
  const [sent, setSent] = useState(false);
  const [sentMessage, setSentMessage] = useState("");

  const receipt = useMemo(() => {
    const stamp = Date.now().toString();
    const localPart = email.split("@")[0] ?? "sender";
    const holder = localPart
      .split(/[._-]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
    return {
      ticketId: stamp.slice(-10),
      barcodeValue: stamp.slice(-13).padStart(13, "0"),
      last4Digits: stamp.slice(-4),
      cardHolder: holder || "A Reader",
    };
  }, [email]);

  const commands = useMemo<ConsoleCommand[]>(() => {
    const pages: Array<{ section: Section; hint: string }> = [
      { section: "home", hint: "back to welcome.py" },
      { section: "companies", hint: "the 3d card series" },
      { section: "letters", hint: "the reading machine" },
      { section: "pictures", hint: "the photo albums" },
      { section: "movies", hint: "the tape rack" },
    ];
    const pageCommands: ConsoleCommand[] = pages.map(({ section, hint }) => ({
      name: section,
      hint,
      run: () => {
        setTimeout(() => onNavigate(section), 450);
        return [`opening ${section}…`];
      },
    }));

    return [
      ...pageCommands,
      {
        name: "socials",
        hint: "list every link",
        run: () =>
          Object.entries(SOCIAL_URLS).map(
            ([name, url]) => `  ${name.padEnd(11)}${url}`,
          ),
      },
      ...Object.keys(SOCIAL_URLS).map((name) => ({
        name,
        hint: `open ${name}`,
        run: () => {
          window.open(SOCIAL_URLS[name], "_blank", "noreferrer");
          return [`opening ${name} ↗`];
        },
      })),
      {
        name: "leave",
        hint: "close the door behind you",
        run: () => {
          setTimeout(onLeave, 600);
          return ["closing the door…"];
        },
      },
    ];
  }, [onNavigate, onLeave]);

  const mailto = `mailto:alex@vertus.ai?subject=${encodeURIComponent(
    `a letter from ${email}`,
  )}&body=${encodeURIComponent(sentMessage)}`;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-4xl flex-col items-center px-4 pt-14 pb-40 sm:px-6">
      <p className="animate-fade-up text-[11px] tracking-[0.25em] text-faint uppercase">
        Console
      </p>
      <h1
        className="animate-fade-up mt-3 font-serif text-3xl font-light"
        style={{ animationDelay: "0.1s" }}
      >
        The control panel
      </h1>
      <p
        className="animate-fade-up mt-4 max-w-md text-center text-[14px] font-light text-muted-foreground"
        style={{ animationDelay: "0.2s" }}
      >
        The only way through. Write me a letter, open any room, pull any
        link — all from this panel.
      </p>

      <div className="animate-fade-up mt-8 w-full" style={{ animationDelay: "0.3s" }}>
        <Console
          title={`console — signed in as ${email}`}
          boot
          welcome={[
            "control.panel — the whole world runs from here",
            `signed in as ${email}`,
            " ",
            "prompts, left for you to click:",
            { prompt: "write me a letter", command: "write" },
            { prompt: "welcome.py", command: "home" },
            { prompt: "the card series — companies", command: "companies" },
            { prompt: "the reading machine — letters", command: "letters" },
            { prompt: "the photo albums — pictures", command: "pictures" },
            { prompt: "the tape rack — movies", command: "movies" },
            " ",
            "or just type — help lists everything. esc always returns here.",
          ]}
          commands={commands}
          compose={{
            to: "alex@vertus.ai",
            from: email,
            triggers: ["write", "email", "letter"],
            onSend: (message) => {
              setSentMessage(message);
              setSent(true);
            },
          }}
        />
      </div>

      {/* the receipt */}
      {sent && (
        <div
          className="fixed inset-0 z-[90] flex flex-col items-center justify-center gap-7 overflow-y-auto bg-black/90 p-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Letter sent"
        >
          <AnimatedTicket
            ticketId={receipt.ticketId}
            amount={0}
            date={new Date()}
            cardHolder={receipt.cardHolder}
            last4Digits={receipt.last4Digits}
            barcodeValue={receipt.barcodeValue}
          />
          <div className="animate-fade-up text-center" style={{ animationDelay: "0.4s" }}>
            <p className="text-[14px] text-foreground">
              thanks for the letter — we&rsquo;ll be in touch in due course.
            </p>
            <div className="mt-5 flex items-center justify-center gap-6">
              <a
                href={mailto}
                className="cursor-pointer text-[11px] tracking-[0.2em] text-foreground uppercase transition-opacity hover:opacity-70"
              >
                open in mail ↗
              </a>
              <button
                type="button"
                onClick={() => setSent(false)}
                className="cursor-pointer text-[11px] tracking-[0.2em] text-faint uppercase transition-colors hover:text-foreground"
              >
                close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
