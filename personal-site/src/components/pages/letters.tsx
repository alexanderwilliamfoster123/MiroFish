import { TerminalView } from "@/components/letters/terminal-view";

export function LettersPage() {
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
        The reading machine
      </h1>
      <p
        className="animate-fade-up mt-5 max-w-md text-[15px] font-light text-muted-foreground"
        style={{ animationDelay: "0.25s" }}
      >
        Plug in a chapter and it writes itself out in front of you.
      </p>

      <TerminalView />
    </main>
  );
}
