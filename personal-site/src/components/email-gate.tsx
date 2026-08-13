import { Component as Keyboard } from "@/components/ui/keyboard";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// natural keyboard widths: compact (<768px windows) vs full
const KEYBOARD_NATURAL_COMPACT = 700;
const KEYBOARD_NATURAL_FULL = 1080;

type Field = "name" | "email";

interface EmailGateProps {
  onEnter: (name: string, email: string) => void;
}

export function EmailGate({ onEnter }: EmailGateProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [active, setActive] = useState<Field>("name");
  const [error, setError] = useState<Field | null>(null);
  const [leaving, setLeaving] = useState(false);

  const nameRef = useRef("");
  const emailRef = useRef("");
  const activeRef = useRef<Field>("name");
  const leavingRef = useRef(false);
  activeRef.current = active;

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

  const write = (field: Field, value: string) => {
    if (field === "name") {
      nameRef.current = value;
      setName(value);
    } else {
      emailRef.current = value;
      setEmail(value);
    }
    setError(null);
  };

  const submit = () => {
    if (leavingRef.current) return;
    const nameValue = nameRef.current.trim();
    const emailValue = emailRef.current.trim();
    if (!nameValue) {
      setActive("name");
      setError("name");
      return;
    }
    if (!EMAIL_PATTERN.test(emailValue)) {
      setActive("email");
      setError("email");
      return;
    }
    leavingRef.current = true;
    setLeaving(true);
    setTimeout(() => onEnter(nameValue, emailValue), 700);
  };

  // enter advances: name -> email -> receipt
  const advance = () => {
    if (activeRef.current === "name") {
      if (!nameRef.current.trim()) {
        setError("name");
        return;
      }
      setActive("email");
    } else {
      submit();
    }
  };

  // one handler for the on-screen keyboard and physical keys
  const applyKey = (key: string, resolved: string) => {
    const field = activeRef.current;
    const current = field === "name" ? nameRef.current : emailRef.current;
    switch (key) {
      case "Backspace":
        write(field, current.slice(0, -1));
        break;
      case "Enter":
        advance();
        break;
      case "Tab":
        setActive(field === "name" ? "email" : "name");
        break;
      case " ":
        if (field === "name" && current && current.length < 48) {
          write(field, current + " ");
        }
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
        if (resolved.length === 1 && !/\s/.test(resolved) && current.length < 64) {
          write(field, current + resolved);
        }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (
        e.key.length === 1 ||
        ["Backspace", "Enter", "Tab"].includes(e.key)
      ) {
        e.preventDefault();
        applyKey(e.key, e.key);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cursor = (
    <span className="animate-cursor-blink ml-px inline-block h-[1.05em] w-[7px] translate-y-[3px] bg-foreground" />
  );

  const fieldLine = (
    field: Field,
    value: string,
    placeholder: string,
  ) => (
    <button
      type="button"
      onClick={() => setActive(field)}
      className="block w-full cursor-text text-left"
      aria-label={field}
    >
      <p className="text-[10px] tracking-[0.25em] text-faint uppercase">
        {field}
      </p>
      <div
        className={cn(
          "mt-2 border-b pb-2.5 text-center font-mono text-base transition-colors duration-300",
          error === field
            ? "border-white/70"
            : active === field
              ? "border-white/40"
              : "border-line",
        )}
      >
        {value ? (
          <span className="text-foreground">{value}</span>
        ) : (
          <span className="text-faint">{placeholder}</span>
        )}
        {active === field && cursor}
      </div>
    </button>
  );

  return (
    <main
      className={cn(
        "flex min-h-dvh flex-col items-center justify-center px-4 py-10 transition-opacity duration-700 ease-out",
        leaving && "pointer-events-none opacity-0",
      )}
    >
      <div className="flex w-full flex-col items-center text-center">
        <h1
          className="font-display-condensed animate-fade-up text-3xl leading-snug text-foreground sm:text-4xl"
          style={{ animationDelay: "0.1s" }}
        >
          Every world needs a key.
        </h1>
        <p
          className="animate-fade-up mt-3 text-[13px] tracking-wide text-muted-foreground"
          style={{ animationDelay: "0.25s" }}
        >
          Yours is a name and an email.
        </p>

        {/* the two lines */}
        <div
          className="animate-fade-up mt-10 flex w-full max-w-sm flex-col gap-7"
          style={{ animationDelay: "0.4s" }}
        >
          {fieldLine("name", name, "your name")}
          {fieldLine("email", email, "you@somewhere.com")}
          <p
            className={cn(
              "h-4 text-xs transition-opacity duration-300",
              error
                ? "text-neutral-400 opacity-100"
                : email && active === "email"
                  ? "text-faint opacity-100"
                  : "opacity-0",
            )}
            aria-live="polite"
          >
            {error === "name"
              ? "A name first — any name."
              : error === "email"
                ? "That doesn’t look like an email."
                : "press enter ↵"}
          </p>
        </div>

        {/* the keyboard */}
        <div
          ref={scalerRef}
          className="animate-fade-up mt-6 w-full max-w-5xl"
          style={{ animationDelay: "0.55s" }}
        >
          <div style={{ zoom: scale }}>
            <Keyboard onKey={applyKey} />
          </div>
        </div>
      </div>
    </main>
  );
}
