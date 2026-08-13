// Fey-style on-load reveal: the copy sweeps in as one blur-dissolve wave,
// word by word in reading order. Delays are derived from character position
// so the total reveal time stays constant regardless of copy length.
// Skipped under prefers-reduced-motion.

import { useMemo } from "react";

interface WordRevealProps {
  lead?: string; // bold run-in at the start of the first paragraph
  paragraphs: string[];
  total?: number; // seconds for the wave to sweep all the text
  className?: string;
}

const STYLE_ID = "word-reveal-style";

function ensureStyles() {
  if (typeof document === "undefined" || document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    .wr-word {
      display: inline-block;
      opacity: 0;
      filter: blur(7px);
      transform: translateY(0.12em);
      animation: wr-in 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    }
    @keyframes wr-in {
      to { opacity: 1; filter: blur(0); transform: translateY(0); }
    }
    @media (prefers-reduced-motion: reduce) {
      .wr-word { opacity: 1; filter: none; transform: none; animation: none; }
    }
  `;
  document.head.appendChild(style);
}

export function WordReveal({
  lead,
  paragraphs,
  total = 0.8,
  className,
}: WordRevealProps) {
  ensureStyles();

  const rendered = useMemo(() => {
    const totalChars =
      (lead ?? "").replace(/\s/g, "").length +
      paragraphs.join("").replace(/\s/g, "").length;
    const step = total / Math.max(totalChars, 1);
    let index = 0; // global visible-character index -> drives the wave

    const splitWords = (text: string, bold: boolean) =>
      text.split(/\s+/).filter(Boolean).map((word, wordIndex) => {
        const delay = (index * step).toFixed(3);
        index += word.length;
        return (
          <span key={`${word}-${wordIndex}-${delay}`}>
            <span
              className={"wr-word" + (bold ? " font-medium text-foreground" : "")}
              style={{ animationDelay: `${delay}s` }}
            >
              {word}
            </span>{" "}
          </span>
        );
      });

    return paragraphs.map((paragraph, paragraphIndex) => (
      <p key={paragraphIndex} className={paragraphIndex > 0 ? "mt-6" : undefined}>
        {paragraphIndex === 0 && lead ? splitWords(lead, true) : null}
        {splitWords(paragraph, false)}
      </p>
    ));
  }, [lead, paragraphs, total]);

  return <div className={className}>{rendered}</div>;
}
