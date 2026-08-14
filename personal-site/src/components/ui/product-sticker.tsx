// an ean product sticker for a link — tap a card and it tells you what it
// actually is: barcode, spec grid, tiny ornaments, and a small explainer.
// monochrome, both themes, all css/svg.

import type { FolderLink } from "@/components/ui/link-folder";
import { ArrowUpRight, X } from "lucide-react";

interface ProductStickerProps {
  link: FolderLink;
  folder: string;
  index: number;
  onClose: () => void;
}

// deterministic pseudo-random bars from the title, so each card
// prints its own barcode
function bars(seed: string, count = 42) {
  let hash = 7;
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) % 9973;
  const widths: number[] = [];
  for (let i = 0; i < count; i++) {
    hash = (hash * 137 + 11) % 9973;
    widths.push(1 + (hash % 3));
  }
  return widths;
}

function digitsFor(seed: string) {
  let hash = 3;
  for (const char of seed) hash = (hash * 33 + char.charCodeAt(0)) % 1_000_000_007;
  return String(hash).padStart(13, "0").slice(0, 13);
}

const Ornament = ({ kind }: { kind: number }) => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 text-foreground" fill="none" stroke="currentColor" strokeWidth="1">
    {kind === 0 && (
      <>
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i * Math.PI) / 6;
          return (
            <line
              key={i}
              x1={12 + Math.cos(a) * 4}
              y1={12 + Math.sin(a) * 4}
              x2={12 + Math.cos(a) * 10}
              y2={12 + Math.sin(a) * 10}
            />
          );
        })}
      </>
    )}
    {kind === 1 && (
      <>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5.5" />
        <circle cx="12" cy="12" r="2" />
      </>
    )}
    {kind === 2 && (
      <>
        <circle cx="12" cy="12" r="9" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="12" y1="3" x2="12" y2="21" />
        <line x1="5.6" y1="5.6" x2="18.4" y2="18.4" />
        <line x1="18.4" y1="5.6" x2="5.6" y2="18.4" />
      </>
    )}
    {kind === 3 && (
      <path d="M12 3c2 4 5 7 9 9-4 2-7 5-9 9-2-4-5-7-9-9 4-2 7-5 9-9z" />
    )}
  </svg>
);

export function ProductSticker({ link, folder, index, onClose }: ProductStickerProps) {
  const code = digitsFor(link.title + folder);
  const activate = () => {
    if (link.soon) return;
    if (link.onSelect) {
      onClose();
      link.onSelect();
    } else if (link.href) {
      window.open(link.href, "_blank", "noopener");
    }
  };

  return (
    <div
      className="animate-fade-in fixed inset-0 z-[70] flex items-center justify-center bg-background/85 px-4 backdrop-blur-sm"
      style={{ animationDuration: "0.3s" }}
      onClick={onClose}
    >
      <div
        className="animate-fade-up w-[300px] border border-line bg-card text-card-foreground shadow-[0_40px_120px_rgba(0,0,0,0.5)]"
        style={{ animationDelay: "0.05s", animationDuration: "0.5s" }}
        onClick={(event) => event.stopPropagation()}
      >
        {/* head: what it is, stamped */}
        <div className="flex items-start justify-between border-b border-line px-4 pt-3.5 pb-3">
          <div>
            <p className="text-[15px] font-semibold tracking-tight">{link.title}</p>
            {link.handle && (
              <p className="mt-0.5 font-mono text-[9px] text-muted-foreground">
                {link.handle}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1.5 pt-0.5">
            <span className="rounded-full border border-line px-1.5 py-0.5 font-mono text-[8px] text-muted-foreground">
              {folder}
            </span>
            <span className="rounded-full border border-line px-1.5 py-0.5 font-mono text-[8px] text-muted-foreground">
              {String(index + 1).padStart(2, "0")}
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="close"
              className="ml-1 cursor-pointer text-muted-foreground transition-colors duration-300 hover:text-foreground"
            >
              <X size={12} />
            </button>
          </div>
        </div>

        {/* barcode */}
        <div className="border-b border-line px-4 pt-4 pb-3">
          <div className="flex h-10 items-stretch gap-[1.5px]">
            {bars(link.title + folder).map((width, i) => (
              <span
                key={i}
                className="bg-foreground"
                style={{ width, opacity: i % 7 === 3 ? 0.55 : 1 }}
              />
            ))}
          </div>
          <p className="mt-1.5 font-mono text-[9px] tracking-[0.35em] text-muted-foreground">
            {code}
          </p>
        </div>

        {/* ornaments */}
        <div className="flex items-center justify-between border-b border-line px-6 py-3">
          <Ornament kind={0} />
          <Ornament kind={3} />
          <Ornament kind={1} />
          <Ornament kind={2} />
        </div>

        {/* spec grid */}
        <div className="grid grid-cols-3 border-b border-line text-center">
          {[
            ["id", link.soon ? "sealed" : "card"],
            ["project title", link.title],
            ["number", String(index + 1).padStart(2, "0")],
            ["shelf", folder],
            ["unit price", "xxxx"],
            ["creator", "alexander"],
          ].map(([label, value], i) => (
            <div
              key={label}
              className={
                "px-2 py-2 " +
                (i % 3 !== 2 ? "border-r border-line " : "") +
                (i < 3 ? "border-b border-line" : "")
              }
            >
              <p className="font-mono text-[7.5px] tracking-[0.15em] text-faint">{label}</p>
              <p className="mt-0.5 truncate text-[10px] text-foreground/85 italic">{value}</p>
            </div>
          ))}
        </div>

        {/* instructions */}
        <div className="px-4 pt-3 pb-4">
          <p className="text-center font-mono text-[8px] tracking-[0.2em] text-muted-foreground">
            product instructions and guides
          </p>
          <p className="mt-2 border border-line px-3 py-2 text-center text-[9.5px] leading-relaxed text-neutral-400">
            {link.description ??
              "handle with curiosity. apply daily. for best results: use without hurry."}
          </p>
          <div className="mt-3 flex justify-center">
            {link.soon ? (
              <span className="font-mono text-[9px] tracking-[0.2em] text-faint">
                coming soon
              </span>
            ) : (
              <button
                type="button"
                onClick={activate}
                className="flex cursor-pointer items-center gap-1 border border-line px-3 py-1.5 text-[10px] font-medium text-foreground transition-colors duration-300 hover:bg-foreground hover:text-background"
              >
                open {link.title}
                <ArrowUpRight size={10} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
