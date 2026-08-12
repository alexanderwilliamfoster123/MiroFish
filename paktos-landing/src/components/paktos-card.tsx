import * as React from "react";
import NumberFlow from "@number-flow/react";
import { TiltCard } from "@/components/ui/tilt-card";
import { AwardBadge } from "@/components/ui/award-badge";
import iconBlack from "@/assets/paktos-icon-black-192.png";
import logoWhite2x from "@/assets/paktos-logo-white-760.png";

const WAITLIST_LINK = "paktos.com/waitlist";
const SOCIAL_TAG = "@tradepaktos";

interface PaktosCardProps {
  memberName: string;
  serial: string;
  xp: number;
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

// ——— Story image generation (1080×1920 PNG, drawn on a canvas) ———

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

async function generateStoryImage(
  memberName: string,
  serial: string
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
  const mono = "'SF Mono', 'Cascadia Mono', Consolas, 'Courier New', monospace";

  // ground
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W / 2, 620, 100, W / 2, 620, 900);
  glow.addColorStop(0, "rgba(255,255,255,0.07)");
  glow.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // white lockup
  const logo = await loadImage(logoWhite2x);
  const logoW = 320;
  const logoH = (logo.height / logo.width) * logoW;
  ctx.drawImage(logo, (W - logoW) / 2, 330, logoW, logoH);

  // founding member line
  ctx.textAlign = "center";
  anyCtx.letterSpacing = "10px";
  ctx.font = `500 30px ${sans}`;
  ctx.fillStyle = "#8b8b90";
  ctx.fillText(`FOUNDING MEMBER · ${serial}`, W / 2, 590);

  // ——— the metal card ———
  const cx = 100;
  const cy = 680;
  const cw = 880;
  const ch = 560;
  const grad = ctx.createLinearGradient(0, cy, 0, cy + ch);
  grad.addColorStop(0, "#dcdce0");
  grad.addColorStop(0.3, "#c6c6cc");
  grad.addColorStop(0.52, "#b9b9bf");
  grad.addColorStop(0.78, "#cfcfd4");
  grad.addColorStop(1, "#e3e3e7");
  roundedRect(ctx, cx, cy, cw, ch, 44);
  ctx.fillStyle = grad;
  ctx.fill();

  // brushed grain
  ctx.save();
  roundedRect(ctx, cx, cy, cw, ch, 44);
  ctx.clip();
  for (let gx = cx; gx < cx + cw; gx += 4) {
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    ctx.fillRect(gx, cy, 2, ch);
    ctx.fillStyle = "rgba(0,0,0,0.035)";
    ctx.fillRect(gx + 2, cy, 2, ch);
  }
  // diagonal sheen
  const sheen = ctx.createLinearGradient(cx, cy, cx + cw, cy + ch);
  sheen.addColorStop(0.32, "rgba(255,255,255,0)");
  sheen.addColorStop(0.47, "rgba(255,255,255,0.5)");
  sheen.addColorStop(0.62, "rgba(255,255,255,0)");
  ctx.fillStyle = sheen;
  ctx.fillRect(cx, cy, cw, ch);
  ctx.restore();

  // borders
  roundedRect(ctx, cx, cy, cw, ch, 44);
  ctx.strokeStyle = "#96969c";
  ctx.lineWidth = 3;
  ctx.stroke();
  roundedRect(ctx, cx + 8, cy + 8, cw - 16, ch - 16, 36);
  ctx.strokeStyle = "rgba(255,255,255,0.4)";
  ctx.lineWidth = 2;
  ctx.stroke();

  // engraved text helper: light offset below, dark on top
  const engravedText = (
    text: string,
    x: number,
    y: number,
    font: string,
    color: string,
    align: CanvasTextAlign,
    spacing: string
  ) => {
    ctx.textAlign = align;
    anyCtx.letterSpacing = spacing;
    ctx.font = font;
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.fillText(text, x, y + 2);
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
  };

  // mark
  const mark = await loadImage(iconBlack);
  ctx.globalAlpha = 0.7;
  ctx.drawImage(mark, cx + 56, cy + 52, 84, 84);
  ctx.globalAlpha = 1;

  engravedText(
    "FOUNDING MEMBER",
    cx + cw - 56,
    cy + 96,
    `600 26px ${sans}`,
    "#55565c",
    "right",
    "7px"
  );
  engravedText(
    memberName.toUpperCase(),
    cx + 56,
    cy + 320,
    `600 58px ${sans}`,
    "#55565c",
    "left",
    "7px"
  );
  engravedText(
    "PAKTOS MEMBER",
    cx + 56,
    cy + 370,
    `500 24px ${sans}`,
    "#7a7b81",
    "left",
    "8px"
  );
  engravedText(
    serial,
    cx + 56,
    cy + ch - 60,
    `500 34px ${mono}`,
    "#55565c",
    "left",
    "5px"
  );
  engravedText(
    "SINCE 2026",
    cx + cw - 56,
    cy + ch - 60,
    `500 26px ${sans}`,
    "#7a7b81",
    "right",
    "5px"
  );

  // link + tag
  anyCtx.letterSpacing = "1px";
  ctx.textAlign = "center";
  ctx.font = `400 36px ${sans}`;
  ctx.fillStyle = "#9ca3af";
  ctx.fillText(WAITLIST_LINK, W / 2, 1400);
  ctx.font = `600 40px ${sans}`;
  ctx.fillStyle = "#ffffff";
  ctx.fillText(SOCIAL_TAG, W / 2, 1470);

  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("canvas export failed"))),
      "image/png"
    )
  );
}

// The member's metal Paktos Card. The Founding Member XP bonus rolls onto
// the balance pill; sharing generates a story image (native share sheet on
// phones, download elsewhere) and the second bonus lands after the member
// confirms they posted.
export function PaktosCard({ memberName, serial, xp }: PaktosCardProps) {
  const [balance, setBalance] = React.useState(0);
  const [shared, setShared] = React.useState(false);
  const [shareOpen, setShareOpen] = React.useState(false);
  const [generating, setGenerating] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    const timer = setTimeout(() => setBalance((b) => Math.max(b, xp)), 900);
    return () => clearTimeout(timer);
  }, [xp]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShareOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  React.useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl]
  );

  const handleShare = async () => {
    if (shared || generating) return;
    setGenerating(true);
    try {
      const blob = await generateStoryImage(memberName, serial);
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);

      const file = new File([blob], "paktos-founding-member.png", {
        type: "image/png",
      });
      let sharedNatively = false;
      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: "Paktos" });
          sharedNatively = true;
        } catch {
          // share sheet dismissed — fall through to download
        }
      }
      if (!sharedNatively) {
        const a = document.createElement("a");
        a.href = url;
        a.download = "paktos-founding-member.png";
        a.click();
      }
      setShareOpen(true);
    } catch {
      setShareOpen(true);
    } finally {
      setGenerating(false);
    }
  };

  const handleShareDone = () => {
    setShareOpen(false);
    setShared(true);
    setBalance(xp * 2);
  };

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-5">
      {shareOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Post to your story"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6 animate-in fade-in-0 duration-300"
          onClick={() => setShareOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl animate-in fade-in-0 zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Your Paktos story image"
                className="mx-auto max-h-72 rounded-lg border border-neutral-200"
              />
            )}
            <p className="mt-4 text-sm leading-6 text-neutral-600">
              Your story image has been saved. Post it to your story and tag{" "}
              <span className="font-medium text-neutral-900">{SOCIAL_TAG}</span>{" "}
              to enter the{" "}
              <span className="font-medium text-neutral-900">$1,000 raffle</span>
              .
            </p>
            <button
              onClick={handleShareDone}
              className="mt-5 h-11 w-full rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              I posted it · Claim my +{xp} XP
            </button>
            <button
              onClick={() => setShareOpen(false)}
              className="mt-3 text-xs text-neutral-500 underline-offset-2 hover:underline"
            >
              Maybe later
            </button>
          </div>
        </div>
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

      <p className="text-center text-sm text-muted-foreground">
        Your Founding Member bonus has been added to your Paktos Card.
      </p>

      <button
        onClick={handleShare}
        disabled={shared || generating}
        className="h-11 w-full rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {shared
          ? `+${xp} XP added · Thanks for sharing!`
          : generating
            ? "Preparing your story image…"
            : `Share to your story · Earn +${xp} XP`}
      </button>
    </div>
  );
}
