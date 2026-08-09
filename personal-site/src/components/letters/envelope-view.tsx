import { LETTERS, type Letter } from "@/lib/letters";
import { useState } from "react";

// V1 — each letter lives in a 3D envelope. Click one: the flap folds back,
// the paper rises out, and the letter opens full-size to read.

const PAPER = "#ece9e2";
const INK = "#1c1a17";

export function EnvelopeView() {
  const [openedNum, setOpenedNum] = useState<number | null>(null);
  const [reading, setReading] = useState<Letter | null>(null);

  const open = (letter: Letter) => {
    if (openedNum !== null) return;
    setOpenedNum(letter.num);
    setTimeout(() => setReading(letter), 750);
  };

  const close = () => {
    setReading(null);
    setTimeout(() => setOpenedNum(null), 350);
  };

  return (
    <>
      <div className="mt-14 flex flex-wrap items-start justify-center gap-x-12 gap-y-14">
        {LETTERS.map((letter, i) => {
          const isOpen = openedNum === letter.num;
          return (
            <div
              key={letter.num}
              className="animate-fade-up flex flex-col items-center"
              style={{ animationDelay: `${0.1 + i * 0.1}s` }}
            >
              <button
                type="button"
                onClick={() => open(letter)}
                aria-label={`Open letter no. ${letter.num} — ${letter.title}`}
                className="group relative h-[150px] w-[232px] cursor-pointer"
                style={{ perspective: "800px" }}
              >
                {/* paper hidden behind the pocket, rising out on open */}
                <div
                  className="absolute inset-x-4 top-[38%] bottom-[8%] z-10 rounded-[3px] transition-transform duration-700 ease-out"
                  style={{
                    background: PAPER,
                    transform: isOpen ? "translateY(-112%)" : "translateY(0)",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.5)",
                  }}
                >
                  <p
                    className="px-4 pt-3 text-left font-serif text-[11px] italic"
                    style={{ color: INK, opacity: isOpen ? 1 : 0, transition: "opacity 0.4s 0.3s" }}
                  >
                    {letter.title}
                  </p>
                </div>

                {/* envelope back */}
                <div className="absolute inset-0 z-0 rounded-md border border-white/10 bg-[#131313]" />

                {/* front pocket */}
                <div
                  className="absolute inset-x-0 bottom-0 z-20 h-[64%] rounded-b-md border-t border-white/10 bg-[#181818]"
                  style={{
                    background:
                      "linear-gradient(115deg, #191919 0%, #161616 48%, #1c1c1c 52%, #171717 100%)",
                  }}
                />

                {/* flap */}
                <div
                  className="absolute inset-x-0 top-0 h-[54%] transition-all duration-700"
                  style={{
                    clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                    background: "linear-gradient(180deg, #202020 0%, #191919 100%)",
                    transformOrigin: "top center",
                    transform: isOpen ? "rotateX(178deg)" : "rotateX(0deg)",
                    zIndex: isOpen ? 5 : 30,
                    boxShadow: "0 1px 0 rgba(235,233,228,0.08) inset",
                  }}
                />

                {/* wax seal */}
                <div
                  className="absolute left-1/2 z-40 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full transition-all duration-500"
                  style={{
                    top: "40%",
                    background: "radial-gradient(circle at 35% 30%, #e6e2da, #b9b4aa 70%)",
                    color: INK,
                    opacity: isOpen ? 0 : 1,
                    transform: `translateX(-50%) scale(${isOpen ? 0.5 : 1})`,
                    boxShadow: "0 2px 6px rgba(0,0,0,0.5)",
                  }}
                >
                  <span className="font-serif text-[13px] italic">a.</span>
                </div>

                {/* hover lift */}
                <div className="absolute inset-0 z-50 rounded-md transition-shadow duration-300 group-hover:shadow-[0_18px_40px_rgba(0,0,0,0.55)]" />
              </button>

              <p className="mt-4 text-center text-[11px] tracking-[0.16em] text-faint lowercase">
                no. {letter.num} · {letter.date}
              </p>
              <p className="mt-1 max-w-[232px] text-center text-[12px] text-muted-foreground lowercase">
                {letter.title}
              </p>
            </div>
          );
        })}
      </div>

      {/* the opened letter */}
      {reading && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label={`Letter — ${reading.title}`}
        >
          <article
            onClick={(e) => e.stopPropagation()}
            className="animate-fade-up max-h-[84vh] w-full max-w-xl overflow-y-auto rounded-[4px] p-8 font-serif sm:p-12"
            style={{
              background: `linear-gradient(160deg, #f0ede6 0%, ${PAPER} 60%, #e4e0d7 100%)`,
              color: INK,
              boxShadow: "0 40px 90px rgba(0,0,0,0.8)",
              animationDuration: "0.45s",
            }}
          >
            <p className="text-right text-[13px] italic opacity-60">{reading.date}</p>
            <h2 className="mt-6 text-2xl font-light lowercase">{reading.title}</h2>
            <p className="mt-8 text-[15px] italic opacity-80">dear reader,</p>
            {reading.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 24)} className="mt-5 text-[15px] leading-[1.85]">
                {paragraph}
              </p>
            ))}
            <p className="mt-10 text-[15px] italic">yours, quietly —</p>
            <p className="mt-1 text-xl italic">alexander</p>
            <button
              type="button"
              onClick={close}
              className="mt-10 cursor-pointer text-[11px] tracking-[0.2em] uppercase opacity-50 transition-opacity hover:opacity-100"
            >
              fold it back
            </button>
          </article>
        </div>
      )}
    </>
  );
}
