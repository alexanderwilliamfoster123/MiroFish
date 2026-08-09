import { Component as Keyboard } from "@/components/ui/keyboard";
import { AnimatedTicket } from "@/components/ui/ticket-confirmation-card";
import { useEffect, useMemo, useState } from "react";

interface ContactPageProps {
  email: string;
}

export function ContactPage({ email }: ContactPageProps) {
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

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

  const applyKey = (key: string, resolved: string) => {
    switch (key) {
      case "Backspace":
        setMessage((prev) => prev.slice(0, -1));
        break;
      case "Enter":
        setMessage((prev) => prev + "\n");
        break;
      case "Tab":
        setMessage((prev) => prev + "  ");
        break;
      case "Shift":
      case "CapsLock":
      case "NumLock":
      case "Control":
      case "Alt":
      case "Meta":
      case "ContextMenu":
        break;
      default:
        setMessage((prev) => prev + resolved);
    }
  };

  // Physical typing writes straight into the letter; the on-screen keyboard
  // animates by itself via its own global key listeners.
  useEffect(() => {
    if (sent) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key.length === 1) {
        e.preventDefault();
        setMessage((prev) => prev + e.key);
      } else if (e.key === "Backspace") {
        e.preventDefault();
        setMessage((prev) => prev.slice(0, -1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        setMessage((prev) => prev + "\n");
      } else if (e.key === "Tab") {
        e.preventDefault();
        setMessage((prev) => prev + "  ");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [sent]);

  const mailto = `mailto:alex@vertus.ai?subject=${encodeURIComponent(
    `a letter from ${email}`,
  )}&body=${encodeURIComponent(message)}`;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-4xl flex-col items-center px-4 pt-14 pb-40 sm:px-6">
      <p
        className="animate-fade-up text-[11px] tracking-[0.25em] text-faint uppercase"
        style={{ animationDelay: "0.05s" }}
      >
        Contact
      </p>
      <h1
        className="animate-fade-up mt-3 font-serif text-3xl font-light"
        style={{ animationDelay: "0.15s" }}
      >
        Write to me
      </h1>

      {/* the screen */}
      <section
        className="animate-fade-up mt-8 w-full max-w-2xl rounded-xl border border-white/10 bg-neutral-950 font-mono text-[13px]"
        style={{ animationDelay: "0.25s" }}
        aria-label="Your letter"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
          <div className="text-muted-foreground">
            <p>
              to: <span className="text-foreground">alex@vertus.ai</span>
            </p>
            <p className="mt-0.5">
              from: <span className="text-foreground">{email}</span>
            </p>
          </div>
          <a
            href={mailto}
            onClick={() => {
              if (message.trim()) setSent(true);
            }}
            className={
              "text-[11px] tracking-[0.2em] uppercase transition-all duration-300 " +
              (message.trim()
                ? "text-foreground opacity-100 hover:opacity-70"
                : "pointer-events-none text-faint opacity-40")
            }
          >
            send ↗
          </a>
        </div>
        <div className="min-h-40 px-5 py-4 leading-relaxed break-words whitespace-pre-wrap">
          {message ? (
            <span className="text-foreground">{message}</span>
          ) : (
            <span className="text-faint">start typing, or play the keys below…</span>
          )}
          <span className="animate-cursor-blink ml-px inline-block h-[1.1em] w-[7px] translate-y-[3px] bg-foreground" />
        </div>
      </section>

      {/* the keyboard — mirrors physical keys, clickable too */}
      <div
        className="animate-fade-up mt-10 w-full overflow-x-auto"
        style={{ animationDelay: "0.4s" }}
      >
        <Keyboard onKey={applyKey} />
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
              <button
                type="button"
                onClick={() => {
                  setSent(false);
                  setMessage("");
                }}
                className="cursor-pointer text-[11px] tracking-[0.2em] text-muted-foreground uppercase transition-colors hover:text-foreground"
              >
                write another
              </button>
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
