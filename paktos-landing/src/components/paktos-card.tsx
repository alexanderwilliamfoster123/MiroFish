import * as React from "react";
import NumberFlow from "@number-flow/react";
import { TiltCard } from "@/components/ui/tilt-card";
import { AwardBadge } from "@/components/ui/award-badge";
import iconBlack from "@/assets/paktos-icon-black-192.png";
import logoBlack2x from "@/assets/paktos-logo-black-760.png";

const WAITLIST_LINK = "paktos.com/waitlist";
const SOCIAL_TAG = "@tradepaktos";

interface PaktosCardProps {
  memberName: string;
  serial: string;
  memberNo: string;
  xp: number;
  /** Called after the member confirms they shared their story */
  onShared?: () => void;
}

// ——— 9:16 story image generation (1080×1920 PNG, drawn on a canvas) ———

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function generateStoryImage(
  memberName: string,
  memberNo: string
): Promise<Blob> {
  const W = 1080;
  const H = 1920;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const anyCtx = ctx as CanvasRenderingContext2D & { letterSpacing?: string };
  const sans =
    "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

  // open white ground
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);

  // black lockup
  const logo = await loadImage(logoBlack2x);
  const logoW = 300;
  const logoH = (logo.height / logo.width) * logoW;
  ctx.drawImage(logo, (W - logoW) / 2, 360, logoW, logoH);

  ctx.textAlign = "center";

  anyCtx.letterSpacing = "12px";
  ctx.font = `800 78px ${sans}`;
  ctx.fillStyle = "#18181B";
  ctx.fillText("YOU'RE IN", W / 2, 700);

  anyCtx.letterSpacing = "8px";
  ctx.font = `800 148px ${sans}`;
  ctx.fillText(memberNo, W / 2, 890);

  anyCtx.letterSpacing = "7px";
  ctx.font = `500 30px ${sans}`;
  ctx.fillStyle = "#94939F";
  ctx.fillText(
    `FOUNDING MEMBER · ${memberName.toUpperCase()}`,
    W / 2,
    970
  );

  anyCtx.letterSpacing = "1px";
  ctx.font = `600 52px ${sans}`;
  ctx.fillStyle = "#18181B";
  ctx.fillText(`${memberName} just joined Paktos.`, W / 2, 1360);
  ctx.font = `400 46px ${sans}`;
  ctx.fillStyle = "#61606C";
  ctx.fillText("Will you be the next?", W / 2, 1440);

  ctx.font = `500 34px ${sans}`;
  ctx.fillStyle = "#94939F";
  ctx.fillText(`${SOCIAL_TAG} · ${WAITLIST_LINK}`, W / 2, 1580);

  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("canvas export failed"))),
      "image/png"
    )
  );
}

// Celebration burst when the XP lands on the card.
function CardConfetti() {
  const [active, setActive] = React.useState(true);
  React.useEffect(() => {
    const timer = setTimeout(() => setActive(false), 5500);
    return () => clearTimeout(timer);
  }, []);
  if (!active) return null;
  const colors = ["#ef4444", "#3b82f6", "#22c55e", "#eab308", "#8b5cf6", "#f97316"];
  return (
    <>
      <style>
        {`
          @keyframes card-fall {
            0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
            100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
          }
        `}
      </style>
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
        {Array.from({ length: 90 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-4"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${-20 + Math.random() * 10}%`,
              backgroundColor: colors[i % colors.length],
              transform: `rotate(${Math.random() * 360}deg)`,
              animation: `card-fall ${2.5 + Math.random() * 2.5}s ${Math.random() * 1.5}s linear forwards`,
            }}
          />
        ))}
      </div>
    </>
  );
}

// Engraved-into-metal text treatment.
const engraved: React.CSSProperties = {
  color: "#55565c",
  textShadow: "0 1px 0 rgba(255,255,255,0.55), 0 -1px 0 rgba(0,0,0,0.28)",
};

// Our own metal members card: brushed steel, the mark, and the member's
// identity — engraved, simple, and unmistakably Paktos.
function CardFace({
  memberName,
  serial,
}: {
  memberName: string;
  serial: string;
}) {
  return (
    <div
      className="relative flex h-56 w-full flex-col justify-between overflow-hidden rounded-2xl border border-[#96969c] p-6 text-left"
      style={{
        background:
          "linear-gradient(180deg, #dcdce0 0%, #c6c6cc 30%, #b9b9bf 52%, #cfcfd4 78%, #e3e3e7 100%)",
      }}
    >
      {/* brushed metal grain */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0 1px, rgba(0,0,0,0.035) 1px 2px)",
        }}
      />
      {/* soft diagonal sheen */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(115deg, transparent 32%, rgba(255,255,255,0.5) 47%, transparent 62%)",
        }}
      />
      {/* inner highlight edge */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-[3px] rounded-[13px] border border-white/40"
      />

      <div className="relative flex items-start justify-between">
        <img
          src={iconBlack}
          alt="Paktos"
          className="h-9 w-9 opacity-70"
          style={{ filter: "drop-shadow(0 1px 0 rgba(255,255,255,0.5))" }}
        />
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.28em]"
          style={engraved}
        >
          Founding Member
        </p>
      </div>

      <div className="relative">
        <p
          className="text-xl font-semibold uppercase tracking-[0.12em]"
          style={engraved}
        >
          {memberName}
        </p>
        <p
          className="mt-1 text-[10px] font-medium uppercase tracking-[0.3em]"
          style={{ ...engraved, color: "#7a7b81" }}
        >
          Paktos Member
        </p>
      </div>

      <div className="relative flex items-end justify-between">
        <p
          className="font-mono text-sm font-medium tracking-[0.15em]"
          style={engraved}
        >
          {serial}
        </p>
        <p
          className="text-[11px] font-medium uppercase tracking-[0.2em]"
          style={{ ...engraved, color: "#7a7b81" }}
        >
          Since 2026
        </p>
      </div>
    </div>
  );
}

// Open white share screen: shows the generated 9:16 story image immediately
// with Share to Story and Save to Photos actions.
function ShareScreen({
  memberName,
  memberNo,
  onDone,
  onDismiss,
}: {
  memberName: string;
  memberNo: string;
  onDone: () => void;
  onDismiss: () => void;
}) {
  const [blob, setBlob] = React.useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onDismiss]);

  React.useEffect(() => {
    let url: string | null = null;
    let cancelled = false;
    generateStoryImage(memberName, memberNo)
      .then((b) => {
        if (cancelled) return;
        url = URL.createObjectURL(b);
        setBlob(b);
        setPreviewUrl(url);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [memberName, memberNo]);

  const download = () => {
    if (!previewUrl) return;
    const a = document.createElement("a");
    a.href = previewUrl;
    a.download = "paktos-member-story.png";
    a.click();
  };

  const shareToStory = async () => {
    if (!blob) return;
    const file = new File([blob], "paktos-member-story.png", {
      type: "image/png",
    });
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: "Paktos" });
        return;
      } catch {
        // share sheet dismissed — fall through to download
      }
    }
    download();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Share to your story"
      className="fixed inset-0 z-50 flex flex-col items-center justify-between overflow-y-auto bg-white px-8 py-10 animate-in fade-in-0 duration-500"
    >
      <div className="flex w-full max-w-sm flex-1 flex-col items-center justify-center gap-5 text-center">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={`Your Paktos story image — member ${memberNo}`}
            className="max-h-[52vh] rounded-xl border border-neutral-200 shadow-lg animate-in fade-in-0 zoom-in-95 duration-500"
          />
        ) : (
          <div className="flex h-[52vh] w-full items-center justify-center text-sm text-neutral-400">
            Preparing your story image…
          </div>
        )}

        <div className="flex w-full gap-2 animate-in fade-in-0 duration-700 delay-200">
          <button
            onClick={shareToStory}
            disabled={!blob}
            className="h-11 flex-1 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            Share to Story
          </button>
          <button
            onClick={download}
            disabled={!blob}
            className="h-11 flex-1 rounded-md border border-input bg-background px-4 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-60"
          >
            Save to Photos
          </button>
        </div>

        <p className="text-xs leading-5 text-neutral-500">
          Post it to your story, tag 3 trader friends and{" "}
          <span className="text-neutral-800">{SOCIAL_TAG}</span> to be entered
          into the <span className="text-neutral-800">$1,000 raffle</span>.
        </p>
      </div>

      <div className="mt-6 flex w-full max-w-sm flex-col items-center gap-3">
        <button
          onClick={onDone}
          className="h-11 w-full rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          I shared to my story
        </button>
        <button
          onClick={onDismiss}
          className="text-xs text-neutral-500 underline-offset-2 hover:underline"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}

// The member's metal Paktos Card. The Founding Member XP bonus rolls onto
// the balance pill; sharing opens the white story screen, and the second
// bonus lands after the member confirms they shared.
export function PaktosCard({ memberName, serial, memberNo, xp, onShared }: PaktosCardProps) {
  const [balance, setBalance] = React.useState(0);
  const [shared, setShared] = React.useState(false);
  const [shareOpen, setShareOpen] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setBalance((b) => Math.max(b, xp)), 900);
    return () => clearTimeout(timer);
  }, [xp]);

  const handleShareDone = () => {
    setShareOpen(false);
    setShared(true);
    setBalance(xp * 2);
    // let the balance roll before moving to the raffle countdown
    setTimeout(() => onShared?.(), 2000);
  };

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-5">
      <CardConfetti />
      {shareOpen && (
        <ShareScreen
          memberName={memberName}
          memberNo={memberNo}
          onDone={handleShareDone}
          onDismiss={() => setShareOpen(false)}
        />
      )}

      <div className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground animate-in fade-in-0 slide-in-from-top-2 duration-500 tabular-nums">
        +<NumberFlow value={balance} /> XP · Founding Member bonus
      </div>

      <div className="w-full animate-in fade-in-0 zoom-in-95 duration-500">
        <TiltCard className="rounded-2xl shadow-2xl">
          <CardFace memberName={memberName} serial={serial} />
        </TiltCard>
      </div>

      <div className="flex justify-center animate-in fade-in-0 duration-500 delay-200">
        <AwardBadge
          type="product-of-the-day"
          place={2}
          topText="FOUNDING MEMBER"
          titleText="Paktos"
        />
      </div>

      <p className="text-center text-sm leading-6 text-muted-foreground">
        Tag 3 trader friends and share to your story to be entered into a{" "}
        <span className="font-medium text-foreground">$1,000 raffle</span>.
      </p>

      <button
        onClick={() => !shared && setShareOpen(true)}
        disabled={shared}
        className="h-11 w-full rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {shared
          ? `+${xp} XP added · Thanks for sharing!`
          : "Share to my story"}
      </button>
    </div>
  );
}
