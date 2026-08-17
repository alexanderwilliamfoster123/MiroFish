// the receipt printer, reshaped for this site: framer-motion instead of the
// motion package, lucide instead of phosphor, monochrome tokens instead of
// the grayscale scale, and no texture files — plain paper, dark machine.
import { motion } from "framer-motion";
import { CheckCircle2, Loader2 } from "lucide-react";
import type { ReactNode } from "react";

export type ReceiptStage = "processing" | "printing" | "complete";

const TOOTH_COUNT = 40;
const TOOTH_DEPTH = 4;
const toothPoints = Array.from({ length: TOOTH_COUNT * 2 }, (_, index) => {
  const x = 100 - ((index + 1) * 100) / (TOOTH_COUNT * 2);
  const y = index % 2 === 0 ? "100%" : `calc(100% - ${TOOTH_DEPTH}px)`;
  return `${x}% ${y}`;
}).join(", ");
const receiptClipPath = `polygon(0 0, 100% 0, 100% calc(100% - ${TOOTH_DEPTH}px), ${toothPoints})`;

// the paper advances line by line, the way thermal printers actually feed
const printingTransformKeyframes = [
  "translateY(calc(-100% + 2px))",
  "translateY(-91%)",
  "translateY(-91%)",
  "translateY(-81%)",
  "translateY(-81%)",
  "translateY(-70%)",
  "translateY(-70%)",
  "translateY(-58%)",
  "translateY(-58%)",
  "translateY(-45%)",
  "translateY(-45%)",
  "translateY(-32%)",
  "translateY(-32%)",
  "translateY(-20%)",
  "translateY(-20%)",
  "translateY(-10%)",
  "translateY(-10%)",
  "translateY(-3%)",
  "translateY(-3%)",
  "translateY(0%)",
];
const printingKeyframeTimes = [
  0, 0.075, 0.105, 0.18, 0.21, 0.285, 0.315, 0.39, 0.42, 0.495, 0.525, 0.6,
  0.63, 0.705, 0.735, 0.81, 0.84, 0.915, 0.945, 1,
];

const STATUS_LABELS: Record<ReceiptStage, string> = {
  processing: "processing your access",
  printing: "printing your receipt",
  complete: "access granted",
};

export function ReceiptPrinter({
  stage,
  children,
}: {
  stage: ReceiptStage;
  children: ReactNode;
}) {
  const isReceiptVisible = stage !== "processing";

  return (
    <section
      aria-label="receipt printer"
      data-stage={stage}
      className="relative isolate flex w-full max-w-xs flex-col items-center sm:max-w-sm"
    >
      {/* the machine */}
      <div className="relative z-30 w-full overflow-hidden rounded-3xl border border-white/10 bg-neutral-900 p-3 pb-8 shadow-[0_20px_40px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.07)]">
        {/* the little screen */}
        <div className="rounded-2xl border border-white/10 bg-neutral-950/80 p-4 shadow-inner">
          <div className="flex items-center gap-2" role="status" aria-live="polite">
            {stage === "complete" ? (
              <CheckCircle2 size={15} strokeWidth={2} className="shrink-0 text-neutral-200" />
            ) : (
              <Loader2 size={15} strokeWidth={2} className="shrink-0 animate-spin text-neutral-500" />
            )}
            <span className="truncate text-[11px] font-medium text-neutral-400">
              {STATUS_LABELS[stage]}
            </span>
          </div>
        </div>
        {/* the slot */}
        <div
          aria-hidden="true"
          className="absolute inset-x-6 bottom-3 z-40 h-2 rounded border border-black bg-black shadow-inner"
        />
      </div>

      {/* the paper, feeding out */}
      <div className="relative z-20 -mt-4 h-[26rem] w-[calc(80%+3rem)] max-w-full overflow-hidden px-6">
        {isReceiptVisible && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-6 -top-1 z-20 h-2 bg-black/60 blur-[6px]"
          />
        )}
        <motion.div
          initial={false}
          aria-hidden={stage !== "complete"}
          animate={{
            opacity: isReceiptVisible ? 1 : 0,
            transform:
              stage === "printing"
                ? printingTransformKeyframes
                : isReceiptVisible
                  ? "translateY(0%)"
                  : "translateY(calc(-100% + 2px))",
          }}
          transition={{
            opacity: { duration: 0.16 },
            transform: {
              duration: stage === "printing" ? 1.75 : 0,
              ease: "linear",
              times: stage === "printing" ? printingKeyframeTimes : undefined,
            },
          }}
          className="relative"
        >
          <article
            className="relative min-h-80 bg-[#f7f7f4] px-6 pt-7 pb-8 font-mono text-[#161616] shadow-[0_10px_28px_rgba(0,0,0,0.35)]"
            style={{ clipPath: receiptClipPath }}
          >
            {children}
          </article>
        </motion.div>
      </div>
    </section>
  );
}

// the printed slip itself — name, email, and the stamp of the visit
export function AccessReceipt({
  name,
  email,
  date,
  ticketId,
}: {
  name: string;
  email: string;
  date: Date;
  ticketId: string;
}) {
  return (
    <div className="text-center">
      <p className="text-[13px] font-semibold tracking-tight">
        alexander&rsquo;s world
      </p>
      <p className="mt-0.5 text-[9px] tracking-[0.22em] text-[#8a8a86]">
        access receipt
      </p>

      <div className="my-4 border-t border-dashed border-[#c9c9c4]" />

      <div className="space-y-1.5 text-left text-[10px]">
        <div className="flex justify-between gap-3">
          <span className="shrink-0 text-[#8a8a86]">name</span>
          <span className="truncate">{name}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="shrink-0 text-[#8a8a86]">email</span>
          <span className="truncate">{email}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="shrink-0 text-[#8a8a86]">date</span>
          <span>
            {date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toLowerCase()}
          </span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="shrink-0 text-[#8a8a86]">time</span>
          <span>
            {date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="shrink-0 text-[#8a8a86]">no.</span>
          <span>{ticketId}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="shrink-0 text-[#8a8a86]">amount</span>
          <span>$0.00</span>
        </div>
      </div>

      <div className="my-4 border-t border-dashed border-[#c9c9c4]" />

      <p className="text-[10px] leading-relaxed">
        welcome. you&rsquo;ve been granted access.
      </p>

      {/* barcode, drawn from the ticket number */}
      <div className="mx-auto mt-4 flex h-9 items-stretch justify-center gap-[2px]" aria-hidden="true">
        {ticketId
          .repeat(3)
          .split("")
          .map((digit, index) => (
            <span
              key={index}
              className="bg-[#161616]"
              style={{ width: (Number(digit) % 3) + 1 }}
            />
          ))}
      </div>
      <p className="mt-1.5 text-[8px] tracking-[0.34em] text-[#8a8a86]">
        {ticketId}
      </p>
    </div>
  );
}
