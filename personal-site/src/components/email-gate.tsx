import { Component as Keyboard } from "@/components/ui/keyboard";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

// natural keyboard widths: compact (<768px windows) vs full
const KEYBOARD_NATURAL_COMPACT = 700;
const KEYBOARD_NATURAL_FULL = 1080;

interface CaptureStepProps {
  heading: string;
  placeholder: string;
  allowSpaces?: boolean;
  errorText?: string;
  validate?: (value: string) => boolean;
  onSubmit: (value: string) => void;
}

// One question per screen: a heading, a line, the keyboard. Enter moves on.
export function CaptureStep({
  heading,
  placeholder,
  allowSpaces = false,
  errorText,
  validate,
  onSubmit,
}: CaptureStepProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const valueRef = useRef("");
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

  const write = (next: string) => {
    valueRef.current = next;
    setValue(next);
    setError(false);
  };

  const submit = () => {
    if (leavingRef.current) return;
    const trimmed = valueRef.current.trim();
    if (!trimmed) return;
    if (validate && !validate(trimmed)) {
      setError(true);
      return;
    }
    leavingRef.current = true;
    setLeaving(true);
    setTimeout(() => onSubmit(trimmed), 550);
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
        if (allowSpaces && current && current.length < 48) {
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

  return (
    <main
      className={cn(
        "flex min-h-dvh flex-col items-center justify-center px-4 py-10 transition-opacity duration-500 ease-out",
        leaving && "pointer-events-none opacity-0",
      )}
    >
      <div className="flex w-full flex-col items-center text-center">
        <h1
          className="animate-fade-up text-[26px] font-medium tracking-tight text-foreground sm:text-[30px]"
          style={{ animationDelay: "0.1s" }}
        >
          {heading}
        </h1>

        {/* the line */}
        <div
          className="animate-fade-up mt-9 w-full max-w-sm"
          style={{ animationDelay: "0.25s" }}
        >
          <div
            className={cn(
              "border-b pb-3 text-center text-[17px] transition-colors duration-300",
              error ? "border-white/70" : "border-line",
            )}
            aria-label={heading}
            aria-live="polite"
          >
            {value ? (
              <span className="text-foreground">{value}</span>
            ) : (
              <span className="text-faint">{placeholder}</span>
            )}
            <span className="animate-cursor-blink ml-px inline-block h-[1.05em] w-[2px] translate-y-[3px] bg-foreground" />
          </div>
          <p
            className={cn(
              "mt-3 h-4 text-xs transition-opacity duration-300",
              error
                ? "text-neutral-400 opacity-100"
                : value
                  ? "text-faint opacity-100"
                  : "opacity-0",
            )}
            aria-live="polite"
          >
            {error ? errorText : "press return"}
          </p>
        </div>

        {/* the keyboard */}
        <div
          ref={scalerRef}
          className="animate-fade-up mt-8 w-full max-w-5xl"
          style={{ animationDelay: "0.4s" }}
        >
          <div style={{ zoom: scale }}>
            <Keyboard onKey={applyKey} />
          </div>
        </div>
      </div>
    </main>
  );
}
