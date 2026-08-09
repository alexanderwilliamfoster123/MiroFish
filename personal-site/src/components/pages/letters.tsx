import { BookView } from "@/components/letters/book-view";
import { EnvelopeView } from "@/components/letters/envelope-view";
import { TerminalView } from "@/components/letters/terminal-view";
import { cn } from "@/lib/utils";
import { useState } from "react";

type Mode = "envelopes" | "book" | "terminal";

const MODES: Array<{ id: Mode; label: string }> = [
  { id: "envelopes", label: "envelopes" },
  { id: "book", label: "book" },
  { id: "terminal", label: "terminal" },
];

export function LettersPage() {
  const [mode, setMode] = useState<Mode>("envelopes");

  return (
    <main className="mx-auto w-full max-w-3xl px-6 pt-24 pb-44">
      <p
        className="animate-fade-up text-[11px] tracking-[0.25em] text-faint uppercase"
        style={{ animationDelay: "0.05s" }}
      >
        Letters
      </p>
      <h1
        className="animate-fade-up mt-4 font-serif text-4xl font-light"
        style={{ animationDelay: "0.15s" }}
      >
        Ways of reading
      </h1>
      <p
        className="animate-fade-up mt-5 max-w-md text-[15px] font-light text-muted-foreground"
        style={{ animationDelay: "0.25s" }}
      >
        The same letters, three doors in. Pick how you want them.
      </p>

      <div
        className="animate-fade-up mt-8 flex gap-7"
        style={{ animationDelay: "0.35s" }}
      >
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMode(m.id)}
            className={cn(
              "cursor-pointer text-[12px] tracking-[0.22em] lowercase transition-colors duration-300",
              mode === m.id
                ? "text-foreground"
                : "text-faint hover:text-muted-foreground",
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div key={mode} className="animate-fade-in">
        {mode === "envelopes" && <EnvelopeView />}
        {mode === "book" && <BookView />}
        {mode === "terminal" && <TerminalView />}
      </div>
    </main>
  );
}
