import { Component as Keyboard } from "@/components/ui/keyboard";
import { LiquidMetalButton } from "@/components/ui/liquid-metal-button";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// natural keyboard widths: compact (<768px windows) vs full
const KEYBOARD_NATURAL_COMPACT = 700;
const KEYBOARD_NATURAL_FULL = 1080;

interface EmailGateProps {
  onEnter: (email: string) => void;
}

export function EmailGate({ onEnter }: EmailGateProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const emailRef = useRef("");
  const leavingRef = useRef(false);

  // keyboard scales down to fit narrow screens
  const scalerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = scalerRef.current;
    if (!el) return;
    const compute = () => {
      const natural =
        window.innerWidth < 768
          ? KEYBOARD_NATURAL_COMPACT
          : KEYBOARD_NATURAL_FULL;
      setScale(Math.min(1, el.clientWidth / natural));
    };
    compute();
    const observer = new ResizeObserver(compute);
    observer.observe(el);
    window.addEventListener("resize", compute);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", compute);
    };
  }, []);

  const write = (value: string) => {
    emailRef.current = value;
    setEmail(value);
    setError(false);
  };

  const submit = () => {
    if (leavingRef.current) return;
    const value = emailRef.current.trim();
    if (!EMAIL_PATTERN.test(value)) {
      setError(true);
      return;
    }
    leavingRef.current = true;
    setLeaving(true);
    setTimeout(() => onEnter(value), 700);
  };

  // one handler for the on-screen keyboard and physical keys
  const applyKey = (key: string, resolved: string) => {
    switch (key) {
      case "Backspace":
        write(emailRef.current.slice(0, -1));
        break;
      case "Enter":
        submit();
        break;
      case " ":
      case "Tab":
      case "Shift":
      case "CapsLock":
      case "NumLock":
      case "Control":
      case "Alt":
      case "Meta":
      case "ContextMenu":
        break;
      default:
        if (
          resolved.length === 1 &&
          !/\s/.test(resolved) &&
          emailRef.current.length < 64
        ) {
          write(emailRef.current + resolved);
        }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key.length === 1 || ["Backspace", "Enter"].includes(e.key)) {
        e.preventDefault();
        applyKey(e.key, e.key);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main
      className={cn(
        "flex min-h-dvh flex-col items-center justify-center px-4 py-10 transition-opacity duration-700 ease-out",
        leaving && "pointer-events-none opacity-0",
      )}
    >
      <div className="flex w-full flex-col items-center text-center">
        <p
          className="animate-fade-up font-serif text-2xl font-light italic leading-snug text-foreground sm:text-3xl"
          style={{ animationDelay: "0.1s" }}
        >
          One small thing first.
        </p>
        <p
          className="animate-fade-up mt-3 text-[13px] tracking-wide text-muted-foreground"
          style={{ animationDelay: "0.25s" }}
        >
          Leave your email to step inside — type, or play the keys.
        </p>

        {/* the email line */}
        <div
          className="animate-fade-up mt-10 w-full max-w-sm"
          style={{ animationDelay: "0.4s" }}
        >
          <div
            className={cn(
              "border-b pb-3 text-center font-mono text-base transition-colors duration-300",
              error ? "border-white/70" : "border-line",
            )}
            aria-label="Email address"
            aria-live="polite"
          >
            {email ? (
              <span className="text-foreground">{email}</span>
            ) : (
              <span className="text-faint">you@somewhere.com</span>
            )}
            <span className="animate-cursor-blink ml-px inline-block h-[1.05em] w-[7px] translate-y-[3px] bg-foreground" />
          </div>
          <p
            className={cn(
              "mt-3 h-4 text-xs text-neutral-400 transition-opacity duration-300",
              error ? "opacity-100" : "opacity-0",
            )}
            aria-live="polite"
          >
            That doesn&rsquo;t look like an email.
          </p>
        </div>

        <div className="animate-fade-up mt-6" style={{ animationDelay: "0.55s" }}>
          <LiquidMetalButton label="Enter" onClick={submit} />
        </div>

        {/* the keyboard */}
        <div
          ref={scalerRef}
          className="animate-fade-up mt-10 w-full max-w-5xl"
          style={{ animationDelay: "0.7s" }}
        >
          <div style={{ zoom: scale }}>
            <Keyboard onKey={applyKey} />
          </div>
        </div>
      </div>

      <p className="animate-fade-in mt-10 text-[11px] tracking-[0.2em] text-faint uppercase">
        Alexander Foster
      </p>
    </main>
  );
}
