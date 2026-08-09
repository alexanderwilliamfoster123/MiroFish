import { Component as Keyboard } from "@/components/ui/keyboard";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

// The site's console: a screen panel + the keyboard, wired together as one
// design-system component. Feed it commands and (optionally) a composer and
// it becomes a control panel: type to run commands, `write` to compose a
// letter, physical and on-screen keys both drive it.

export interface ConsoleCommand {
  name: string;
  hint: string;
  aliases?: string[];
  // returns lines to print; side effects (navigation, window.open) welcome
  run: (args: string) => string[] | void;
}

export interface ConsoleComposer {
  to: string;
  from: string;
  triggers: string[]; // command words that enter compose mode
  onSend: (message: string) => void;
}

interface ConsoleProps {
  title: string;
  welcome: string[];
  commands: ConsoleCommand[];
  compose?: ConsoleComposer;
  className?: string;
}

export function Console({
  title,
  welcome,
  commands,
  compose,
  className,
}: ConsoleProps) {
  const [lines, setLines] = useState<string[]>(welcome);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"command" | "compose">("command");
  const [message, setMessage] = useState("");
  const outputRef = useRef<HTMLDivElement>(null);
  // mirror of `input` so Enter can read-and-clear outside a state updater
  const inputRef = useRef("");
  const writeInput = (value: string) => {
    inputRef.current = value;
    setInput(value);
  };

  const print = (...next: string[]) =>
    setLines((prev) => [...prev, ...next]);

  useEffect(() => {
    const el = outputRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines, input, message, mode]);

  const exitCompose = (note?: string) => {
    setMode("command");
    setMessage("");
    if (note) print(note);
  };

  const runCommand = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;
    print(`> ${trimmed}`);
    const [word, ...rest] = trimmed.toLowerCase().split(/\s+/);
    const args = rest.join(" ");

    if (compose && compose.triggers.includes(word)) {
      setMode("compose");
      print("composing — type your letter. esc backs out.");
      return;
    }
    if (word === "help") {
      const rows = commands.map((c) => `  ${c.name.padEnd(11)}${c.hint}`);
      if (compose) {
        rows.unshift(`  ${compose.triggers[0].padEnd(11)}write me a letter`);
      }
      print("commands:", ...rows, `  ${"clear".padEnd(11)}wipe the screen`);
      return;
    }
    if (word === "clear") {
      setLines([]);
      return;
    }
    const command = commands.find(
      (c) => c.name === word || c.aliases?.includes(word),
    );
    if (!command) {
      print(`unknown command: ${word} — try help`);
      return;
    }
    const output = command.run(args);
    if (output) print(...output);
  };

  const sendLetter = () => {
    if (!compose || !message.trim()) return;
    compose.onSend(message);
    exitCompose("letter sent — receipt printing…");
  };

  // one key handler for both the physical and on-screen keyboards
  const applyKey = (key: string, resolved: string) => {
    const isCompose = mode === "compose";
    switch (key) {
      case "Backspace":
        if (isCompose) setMessage((prev) => prev.slice(0, -1));
        else writeInput(inputRef.current.slice(0, -1));
        break;
      case "Enter":
        if (isCompose) {
          setMessage((prev) => prev + "\n");
        } else {
          const command = inputRef.current;
          writeInput("");
          runCommand(command);
        }
        break;
      case "Tab":
        if (isCompose) setMessage((prev) => prev + "  ");
        break;
      case "Escape":
        if (isCompose) exitCompose("letter discarded.");
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
        if (isCompose) setMessage((prev) => prev + resolved);
        else writeInput(inputRef.current + resolved);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key.length === 1) {
        e.preventDefault();
        applyKey(e.key, e.key);
      } else if (["Backspace", "Enter", "Tab", "Escape"].includes(e.key)) {
        e.preventDefault();
        applyKey(e.key, e.key);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const cursor = (
    <span className="animate-cursor-blink ml-px inline-block h-[1.1em] w-[7px] translate-y-[3px] bg-foreground" />
  );

  return (
    <div className={cn("w-full", className)}>
      {/* the screen */}
      <section
        className="mx-auto w-full max-w-2xl rounded-xl border border-white/10 bg-neutral-950 font-mono text-[13px]"
        aria-label={title}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
          {mode === "compose" && compose ? (
            <>
              <div className="text-muted-foreground">
                <p>
                  to: <span className="text-foreground">{compose.to}</span>
                </p>
                <p className="mt-0.5">
                  from: <span className="text-foreground">{compose.from}</span>
                </p>
              </div>
              <div className="flex items-center gap-5">
                <button
                  type="button"
                  onClick={() => exitCompose("letter discarded.")}
                  className="cursor-pointer text-[11px] tracking-[0.2em] text-faint uppercase transition-colors hover:text-foreground"
                >
                  esc
                </button>
                <button
                  type="button"
                  onClick={sendLetter}
                  className={
                    "cursor-pointer text-[11px] tracking-[0.2em] uppercase transition-all duration-300 " +
                    (message.trim()
                      ? "text-foreground opacity-100 hover:opacity-70"
                      : "pointer-events-none text-faint opacity-40")
                  }
                >
                  send ↗
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-muted-foreground">{title}</p>
              <p className="text-[11px] tracking-[0.2em] text-faint uppercase">
                {mode}
              </p>
            </>
          )}
        </div>

        <div
          ref={outputRef}
          className="max-h-[38vh] min-h-44 overflow-y-auto px-5 py-4 leading-relaxed break-words whitespace-pre-wrap"
        >
          {mode === "compose" ? (
            <>
              {message ? (
                <span className="text-foreground">{message}</span>
              ) : (
                <span className="text-faint">your letter…</span>
              )}
              {cursor}
            </>
          ) : (
            <>
              {lines.map((line, index) => (
                <p
                  key={`${index}-${line.slice(0, 12)}`}
                  className={
                    line.startsWith(">")
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }
                >
                  {line || " "}
                </p>
              ))}
              <p className="text-foreground">
                {"> "}
                {input}
                {cursor}
              </p>
            </>
          )}
        </div>
      </section>

      {/* quick commands */}
      {mode === "command" && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          {(compose ? [compose.triggers[0]] : [])
            .concat(commands.map((c) => c.name), "help")
            .map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => runCommand(name)}
                className="cursor-pointer text-[11px] tracking-[0.18em] text-faint lowercase transition-colors duration-200 hover:text-foreground"
              >
                {name}
              </button>
            ))}
        </div>
      )}

      {/* the keyboard */}
      <div className="mt-8 w-full overflow-x-auto">
        <Keyboard onKey={applyKey} />
      </div>
    </div>
  );
}
