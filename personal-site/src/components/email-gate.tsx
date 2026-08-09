import { LiquidMetalButton } from "@/components/ui/liquid-metal-button";
import { cn } from "@/lib/utils";
import { useRef, useState } from "react";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface EmailGateProps {
  onEnter: (email: string) => void;
}

export function EmailGate({ onEnter }: EmailGateProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = () => {
    const value = email.trim();
    if (!EMAIL_PATTERN.test(value)) {
      setError(true);
      inputRef.current?.focus();
      return;
    }
    setLeaving(true);
    setTimeout(() => onEnter(value), 700);
  };

  return (
    <main
      className={cn(
        "flex min-h-dvh flex-col items-center justify-center px-6 transition-opacity duration-700 ease-out",
        leaving && "pointer-events-none opacity-0",
      )}
    >
      <div className="flex w-full max-w-sm flex-col items-center text-center">
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
          Leave your email to step inside.
        </p>

        <div
          className="animate-fade-up mt-12 w-full"
          style={{ animationDelay: "0.4s" }}
        >
          <input
            ref={inputRef}
            type="email"
            inputMode="email"
            autoComplete="email"
            autoFocus
            spellCheck={false}
            placeholder="you@somewhere.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
            aria-label="Email address"
            aria-invalid={error}
            className={cn(
              "w-full border-b bg-transparent pb-3 text-center text-base font-light tracking-wide outline-none transition-colors duration-300",
              "placeholder:text-faint",
              error
                ? "border-white/70"
                : "border-line focus:border-foreground/60",
            )}
          />
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

        <div
          className="animate-fade-up mt-8"
          style={{ animationDelay: "0.55s" }}
        >
          <LiquidMetalButton label="Enter" onClick={submit} />
        </div>
      </div>

      <p className="animate-fade-in fixed bottom-8 text-[11px] tracking-[0.2em] text-faint uppercase">
        Alexander Foster
      </p>
    </main>
  );
}
