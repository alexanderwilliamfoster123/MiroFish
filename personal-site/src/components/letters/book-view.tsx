import { LETTERS } from "@/lib/letters";
import { useMemo } from "react";

// V2 — the letters bound as a book. Each chapter opens on a title page,
// then flows across paper pages; scroll snaps page to page.

const PAPER = "#ece9e2";
const INK = "#1c1a17";
const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

type Page =
  | { kind: "cover" }
  | { kind: "title"; chapter: number; title: string; date: string }
  | { kind: "text"; paragraphs: string[]; pageNo: number };

export function BookView() {
  const pages = useMemo<Page[]>(() => {
    const result: Page[] = [{ kind: "cover" }];
    let pageNo = 1;
    for (const letter of LETTERS) {
      result.push({
        kind: "title",
        chapter: letter.num,
        title: letter.title,
        date: letter.date,
      });
      for (let i = 0; i < letter.paragraphs.length; i += 2) {
        result.push({
          kind: "text",
          paragraphs: letter.paragraphs.slice(i, i + 2),
          pageNo: pageNo++,
        });
      }
    }
    return result;
  }, []);

  return (
    <div className="animate-fade-up mt-10 flex flex-col items-center">
      <div
        className="h-[68vh] w-full max-w-[420px] snap-y snap-mandatory overflow-y-auto rounded-md"
        style={{ perspective: "1200px", scrollbarWidth: "none" }}
      >
        {pages.map((page, index) => (
          <div key={index} className="h-full snap-start px-1 py-1.5">
            <div
              className="relative flex h-full flex-col rounded-[4px] px-9 py-10 font-serif"
              style={{
                background:
                  page.kind === "cover"
                    ? "linear-gradient(160deg, #17181b 0%, #101114 70%)"
                    : `linear-gradient(105deg, #e2ded4 0%, ${PAPER} 12%, ${PAPER} 88%, #ddd8ce 100%)`,
                color: page.kind === "cover" ? "rgba(235,233,228,0.92)" : INK,
                boxShadow:
                  page.kind === "cover"
                    ? "0 0 0 1px rgba(235,233,228,0.1), 0 24px 60px rgba(0,0,0,0.7)"
                    : "0 24px 60px rgba(0,0,0,0.65)",
              }}
            >
              {page.kind === "cover" && (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <p className="text-[11px] tracking-[0.3em] uppercase opacity-50">
                    the collected
                  </p>
                  <h2 className="mt-5 text-3xl font-light lowercase">letters</h2>
                  <p className="mt-2 text-lg italic opacity-80">of alexander foster</p>
                  <div className="mt-8 h-px w-16 bg-current opacity-30" />
                  <p className="mt-8 text-[11px] tracking-[0.2em] uppercase opacity-40">
                    scroll to open
                  </p>
                </div>
              )}

              {page.kind === "title" && (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <p className="text-[12px] tracking-[0.3em] uppercase opacity-50">
                    chapter {ROMAN[page.chapter - 1]}
                  </p>
                  <h2 className="mt-6 max-w-[16ch] text-2xl leading-snug font-light lowercase">
                    {page.title}
                  </h2>
                  <p className="mt-6 text-[13px] italic opacity-60">{page.date}</p>
                </div>
              )}

              {page.kind === "text" && (
                <>
                  <div className="flex-1 overflow-hidden">
                    {page.paragraphs.map((paragraph, i) => (
                      <p
                        key={paragraph.slice(0, 24)}
                        className={
                          "text-[14.5px] leading-[1.9] " + (i > 0 ? "mt-5 indent-6" : "indent-6")
                        }
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                  <p className="pt-4 text-center text-[12px] opacity-50">
                    — {page.pageNo} —
                  </p>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-6 text-[11px] tracking-[0.18em] text-faint lowercase">
        {pages.length - 1} pages · scroll to turn
      </p>
    </div>
  );
}
