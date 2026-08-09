import { useState } from "react";

// VHS cassettes in the language of the reference library site: dark beveled
// shell, glossy spool windows with per-tape wind ratios, cream label sticker
// with muted stripe sets and ink lettering.

const INK = "#2b2721";
const LABEL = "#e8e2d6";
const STRIPE_SETS = [
  ["#9c4a40", "#c0803a", "#54683f"],
  ["#3f5c82", "#9c4a40", "#c8b98a"],
  ["#54683f", "#3f5c82", "#9c4a40"],
  ["#7d5c8a", "#c0803a", "#3f5c82"],
  ["#c0803a", "#54683f", "#7d5c8a"],
  ["#456e6a", "#c8b98a", "#9c4a40"],
];

export interface VhsTapeProps {
  title: string;
  duration: string;
  url?: string;
  index: number;
}

function Spool({ wind }: { wind: number }) {
  const ring = 16 + wind * 14; // wound tape radius in px
  return (
    <div className="relative flex h-[52px] w-[52px] items-center justify-center">
      {/* wound tape */}
      <div
        className="absolute rounded-full"
        style={{
          width: ring * 2,
          height: ring * 2,
          background:
            "repeating-radial-gradient(circle, #1a1a1c 0px, #232326 1.5px, #131315 3px)",
        }}
      />
      {/* hub */}
      <div
        className="relative z-10 flex h-[22px] w-[22px] items-center justify-center rounded-full"
        style={{ background: "#d8d5cd" }}
      >
        <div
          className="h-full w-full rounded-full"
          style={{
            background:
              "repeating-conic-gradient(#d8d5cd 0deg 40deg, #8f8c84 40deg 60deg)",
            maskImage: "radial-gradient(circle, transparent 30%, black 32%)",
            WebkitMaskImage: "radial-gradient(circle, transparent 30%, black 32%)",
          }}
        />
      </div>
    </div>
  );
}

export function VhsTape({ title, duration, url, index }: VhsTapeProps) {
  const [hovered, setHovered] = useState(false);
  const stripes = STRIPE_SETS[index % STRIPE_SETS.length];
  const wind = ((index * 37) % 100) / 100; // deterministic per-tape wind ratio

  const Wrapper = url ? "a" : "div";
  const linkProps = url
    ? { href: url, target: "_blank", rel: "noreferrer", "aria-label": `${title} — watch` }
    : {};

  return (
    <Wrapper
      {...linkProps}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group block w-[264px] shrink-0"
      style={{
        transform: hovered && url
          ? "translateY(-10px) rotateX(4deg)"
          : "translateY(0) rotateX(0deg)",
        transition: "transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
        perspective: "800px",
      }}
    >
      <div
        className="relative h-[166px] w-full rounded-[7px] border border-white/10"
        style={{
          background: "linear-gradient(170deg, #1b1b1e 0%, #121214 55%, #0c0c0e 100%)",
          boxShadow: hovered
            ? "0 26px 50px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.08)"
            : "0 14px 30px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        {/* corner screws */}
        {[
          "top-1.5 left-2",
          "top-1.5 right-2",
          "bottom-1.5 left-2",
          "bottom-1.5 right-2",
        ].map((pos) => (
          <div
            key={pos}
            className={`absolute ${pos} h-[5px] w-[5px] rounded-full`}
            style={{
              background: "radial-gradient(circle at 35% 30%, #3c3c40, #0a0a0b)",
            }}
          />
        ))}

        {/* spool window */}
        <div
          className="absolute inset-x-8 top-3 flex h-[62px] items-center justify-between rounded-[4px] border border-white/10 px-4"
          style={{
            background:
              "linear-gradient(115deg, rgba(20,20,23,0.9) 0%, rgba(10,10,12,0.95) 45%, rgba(28,28,32,0.9) 55%, rgba(12,12,14,0.95) 100%)",
          }}
        >
          <Spool wind={1 - wind * 0.7} />
          <div className="h-px flex-1 bg-white/5" />
          <Spool wind={0.3 + wind * 0.7} />
          {/* glass reflection */}
          <div
            className="pointer-events-none absolute inset-0 rounded-[4px]"
            style={{
              background:
                "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.06) 42%, transparent 54%)",
            }}
          />
        </div>

        {/* label sticker */}
        <div
          className="absolute inset-x-5 bottom-3 h-[68px] rounded-[2px] px-3 pt-2"
          style={{ background: LABEL, boxShadow: "0 1px 4px rgba(0,0,0,0.45)" }}
        >
          <div className="flex gap-0">
            {stripes.map((color) => (
              <div key={color} className="h-[7px] flex-1" style={{ background: color }} />
            ))}
          </div>
          <p
            className="mt-2 truncate font-serif text-[13.5px] italic"
            style={{ color: INK }}
          >
            {title}
          </p>
          <div
            className="mt-1 flex items-center justify-between font-mono text-[9px] tracking-[0.14em] uppercase"
            style={{ color: "rgba(43,39,33,0.6)" }}
          >
            <span>vhs · e-180</span>
            <span>{duration}</span>
          </div>
        </div>
      </div>
    </Wrapper>
  );
}

// Spine view for the rack: the tape standing with its labeled edge out.
export function VhsSpine({
  title,
  index,
  selected,
  onClick,
}: {
  title: string;
  index: number;
  selected: boolean;
  onClick: () => void;
}) {
  const stripes = STRIPE_SETS[index % STRIPE_SETS.length];

  if (selected) {
    // the tape is out — an empty slot stays behind
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={`${title} — put it back`}
        className="h-[218px] w-[54px] cursor-pointer rounded-[5px] border border-dashed border-white/15 bg-black/40 transition-colors hover:border-white/30"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${title} — pull it out`}
      className="group h-[218px] w-[54px] cursor-pointer rounded-[5px] border border-white/10 transition-transform duration-300 hover:-translate-y-2.5"
      style={{
        background: "linear-gradient(180deg, #1c1c1f 0%, #131315 60%, #0d0d0f 100%)",
        boxShadow: "0 10px 24px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.07)",
      }}
    >
      <div className="flex h-full flex-col items-center py-2.5">
        {/* stripe block */}
        <div className="w-[34px]">
          {stripes.map((color) => (
            <div key={color} className="h-[6px] w-full" style={{ background: color }} />
          ))}
        </div>
        {/* spine label */}
        <div
          className="mt-2.5 flex min-h-0 w-[34px] flex-1 items-center justify-center rounded-[1px] px-0.5 py-2"
          style={{ background: LABEL }}
        >
          <p
            className="overflow-hidden font-serif text-[11px] italic"
            style={{
              color: INK,
              writingMode: "vertical-rl",
              maxHeight: "100%",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {title}
          </p>
        </div>
        <p
          className="mt-2 font-mono text-[8px] tracking-[0.18em]"
          style={{ color: "rgba(235,233,228,0.4)" }}
        >
          VHS
        </p>
      </div>
    </button>
  );
}
