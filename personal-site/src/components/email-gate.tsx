import { Component as Keyboard } from "@/components/ui/keyboard";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// natural keyboard widths: compact (<768px windows) vs full
const KEYBOARD_NATURAL_COMPACT = 700;
const KEYBOARD_NATURAL_FULL = 1080;

type Step = "email" | "name";

const STEPS: Record<
  Step,
  { heading: string; sub?: string; placeholder: string; errorText?: string }
> = {
  email: {
    heading: "every world has a key.",
    sub: "yours is an email.",
    placeholder: "you@somewhere.com",
    errorText: "that doesn’t look right.",
  },
  name: {
    heading: "and your name.",
    placeholder: "your name",
  },
};

interface GateProps {
  initialStep: Step;
  onEmail: (email: string) => void;
  onName: (name: string) => void;
}

// One continuous screen: the line collects the email, empties itself,
// asks for the name, then hands over to the receipt. The keyboard never
// moves; only the words change.
export function Gate({ initialStep, onEmail, onName }: GateProps) {
  const [step, setStep] = useState<Step>(initialStep);
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const valueRef = useRef("");
  const stepRef = useRef<Step>(initialStep);
  const leavingRef = useRef(false);
  stepRef.current = step;

  // keyboard scales down to fit narrow screens, capped so the page stays airy
  const scalerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.72);

  useEffect(() => {
    const el = scalerRef.current;
    if (!el) return;
    const compute = () => {
      const natural =
        window.innerWidth < 768
          ? KEYBOARD_NATURAL_COMPACT
          : KEYBOARD_NATURAL_FULL;
      setScale(Math.min(0.72, el.clientWidth / natural));
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

  const write = (next: string) => {
    valueRef.current = next;
    setValue(next);
    setError(false);
  };

  const submit = () => {
    if (leavingRef.current) return;
    const trimmed = valueRef.current.trim();
    if (!trimmed) return;
    if (stepRef.current === "email") {
      if (!EMAIL_PATTERN.test(trimmed)) {
        setError(true);
        return;
      }
      onEmail(trimmed); // kept immediately, even if they wander off here
      write("");
      setStep("name");
    } else {
      leavingRef.current = true;
      setLeaving(true);
      setTimeout(() => onName(trimmed), 550);
    }
  };

  // one handler for the on-screen keyboard and physical keys
  const applyKey = (key: string, resolved: string) => {
    const current = valueRef.current;
    switch (key) {
      case "Backspace":
        write(current.slice(0, -1));
        break;
      case "Enter":
        submit();
        break;
      case " ":
        if (stepRef.current === "name" && current && current.length < 48) {
          write(current + " ");
        }
        break;
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
        if (resolved.length === 1 && !/\s/.test(resolved) && current.length < 64) {
          write(current + resolved);
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

  const copy = STEPS[step];

  return (
    <main
      className={cn(
        "flex min-h-dvh flex-col items-center justify-center px-4 py-10 transition-opacity duration-500 ease-out",
        leaving && "pointer-events-none opacity-0",
      )}
    >
      <div className="flex w-full flex-col items-center text-center">
        {/* only the words change between steps */}
        <div key={step} className="animate-fade-up" style={{ animationDuration: "0.5s" }}>
          <h1 className="text-[19px] font-medium tracking-tight text-foreground sm:text-[21px]">
            {copy.heading}
          </h1>
          <p
            className={cn(
              "mt-2.5 text-[13px] text-muted-foreground",
              !copy.sub && "hidden",
            )}
          >
            {copy.sub}
          </p>

          {/* the line */}
          <div className="mx-auto mt-14 w-full max-w-[300px]">
            <div
              className={cn(
                "border-b pb-2.5 text-center text-[15px] transition-colors duration-300",
                error ? "border-white/70" : "border-line",
              )}
              aria-label={copy.heading}
              aria-live="polite"
            >
              {value ? (
                <span className="text-foreground">{value}</span>
              ) : (
                <span className="text-faint">{copy.placeholder}</span>
              )}
              <span className="animate-cursor-blink ml-px inline-block h-[1.05em] w-[2px] translate-y-[3px] bg-foreground" />
            </div>
            <p
              className={cn(
                "mt-3 h-4 text-[11px] transition-opacity duration-300",
                error
                  ? "text-neutral-400 opacity-100"
                  : value
                    ? "text-faint opacity-100"
                    : "opacity-0",
              )}
              aria-live="polite"
            >
              {error ? copy.errorText : "press return"}
            </p>
          </div>
        </div>

        {/* the keyboard — mounted once, never moves */}
        <div
          ref={scalerRef}
          className="animate-fade-up mt-16 w-full max-w-5xl"
          style={{ animationDelay: "0.45s" }}
        >
          <div style={{ zoom: scale }}>
            <Keyboard onKey={applyKey} />
          </div>
        </div>
      </div>
    </main>
  );
}
