import { CodeBlock } from "@/components/ui/code-block";
import { LETTERS, wrapText } from "@/lib/letters";
import { useEffect, useRef, useState } from "react";

// V3 — the reading machine. Plug in a chapter number and the letter is
// written out as code in front of you; when it finishes, it asks what
// you want to read next.

const HEADER = `#!/usr/bin/env python3
# letters.py — the reading machine

chapters = {
${LETTERS.map((l) => `    ${l.num}: "${l.title}",`).join("\n")}
}

# which chapter? press 1-${LETTERS.length} (enter skips the typing)
`;

function chapterScript(num: number): string {
  const letter = LETTERS.find((l) => l.num === num);
  if (!letter) return "";
  const body = letter.paragraphs
    .map((p) => wrapText(p, 58).join("\n"))
    .join("\n\n");
  return `
read(${num})

"""
chapter ${num} — ${letter.title}
${letter.date}

${body}
"""

# read another? press 1-${LETTERS.length}
`;
}

export function TerminalView() {
  const [target, setTarget] = useState(HEADER);
  const [display, setDisplay] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // typewriter: chase the target
  useEffect(() => {
    if (display.length >= target.length) return;
    const interval = setInterval(() => {
      setDisplay(target.slice(0, Math.min(display.length + 2, target.length)));
    }, 16);
    return () => clearInterval(interval);
  }, [display, target]);

  // keep the newest line in view
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [display]);

  const busy = display.length < target.length;

  const select = (num: number) => {
    if (busy) return;
    setTarget((prev) => prev + chapterScript(num));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const num = Number(e.key);
      if (num >= 1 && num <= LETTERS.length) {
        e.preventDefault();
        select(num);
      } else if (e.key === "Enter") {
        e.preventDefault();
        setDisplay(target); // skip the typing
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  return (
    <div className="animate-fade-up mx-auto mt-10 w-full max-w-2xl">
      <div ref={scrollRef} className="max-h-[62vh] overflow-y-auto rounded-lg">
        <CodeBlock
          language="python"
          filename="letters.py"
          code={display || " "}
          className="[&_pre]:!text-[13px]"
        />
      </div>
      <div className="mt-5 flex items-center justify-center gap-3">
        <span className="text-[11px] tracking-[0.18em] text-faint lowercase">
          plug in a chapter
        </span>
        {LETTERS.map((letter) => (
          <button
            key={letter.num}
            type="button"
            onClick={() => select(letter.num)}
            disabled={busy}
            title={letter.title}
            className="h-9 w-9 cursor-pointer rounded-md border border-white/15 font-mono text-sm text-muted-foreground transition-colors duration-200 hover:border-white/40 hover:text-foreground disabled:cursor-default disabled:opacity-40"
          >
            {letter.num}
          </button>
        ))}
      </div>
      <p className="mt-3 text-center text-[11px] text-faint lowercase">
        {busy ? "writing… press enter to skip ahead" : "waiting for you"}
      </p>
    </div>
  );
}
