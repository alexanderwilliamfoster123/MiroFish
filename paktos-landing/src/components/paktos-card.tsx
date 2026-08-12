import * as React from "react";
import NumberFlow from "@number-flow/react";
import { TiltCard } from "@/components/ui/tilt-card";
import { AwardBadge } from "@/components/ui/award-badge";
import iconBlack from "@/assets/paktos-icon-black-192.png";
import logoWhite from "@/assets/paktos-logo-white-380.png";
import logoWhite2x from "@/assets/paktos-logo-white-760.png";
import logoWhite4x from "@/assets/paktos-logo-white-1520.png";

const WAITLIST_LINK = "paktos.com/waitlist";

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

// Quiet, screenshot-ready story screen: black ground, one headline, the card.
function StoryShareScreen({
  memberName,
  serial,
  xp,
  onDone,
  onDismiss,
}: {
  memberName: string;
  serial: string;
  xp: number;
  onDone: () => void;
  onDismiss: () => void;
}) {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onDismiss]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Share to your story"
      className="fixed inset-0 z-50 flex flex-col items-center justify-between overflow-y-auto bg-black px-8 py-12 animate-in fade-in-0 duration-700"
    >
      {/* ——— the screenshot zone ——— */}
      <div className="flex w-full max-w-sm flex-1 flex-col items-center justify-center gap-10 text-center">
        <img
          src={logoWhite}
          srcSet={`${logoWhite} 1x, ${logoWhite2x} 2x, ${logoWhite4x} 4x`}
          alt="Paktos"
          className="w-[120px] animate-in fade-in-0 duration-1000"
        />

        <p className="text-[11px] uppercase tracking-[0.35em] text-neutral-500 animate-in fade-in-0 slide-in-from-bottom-2 duration-1000 delay-200">
          Founding Member · {serial}
        </p>

        <div className="w-full animate-in fade-in-0 zoom-in-95 duration-1000 delay-300">
          <CardFace memberName={memberName} serial={serial} />
        </div>

        <div className="animate-in fade-in-0 duration-1000 delay-500">
          <p className="text-sm tracking-wide text-neutral-400">
            {WAITLIST_LINK}
          </p>
          <p className="mt-2 text-sm font-medium tracking-wide text-white">
            @tradepaktos
          </p>
        </div>
      </div>

      {/* ——— instructions, below the story art ——— */}
      <div className="mt-10 flex w-full max-w-sm flex-col items-center gap-3 animate-in fade-in-0 duration-1000 delay-700">
        <p className="text-center text-xs leading-5 text-neutral-500">
          Screenshot this screen, post it to your story and tag{" "}
          <span className="text-neutral-300">@tradepaktos</span> to enter the{" "}
          <span className="text-neutral-300">$1,000 raffle</span>.
        </p>
        <button
          onClick={onDone}
          className="h-11 w-full rounded-full bg-white px-6 text-sm font-medium text-black transition-opacity hover:opacity-90"
        >
          I posted it · Claim my +{xp} XP
        </button>
        <button
          onClick={onDismiss}
          className="text-xs text-neutral-600 underline-offset-2 hover:underline"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}

// The member's platinum Paktos Card. The Founding Member XP bonus rolls onto
// the balance pill; sharing opens the story screen and the second bonus lands
// after the member confirms they posted.
export function PaktosCard({ memberName, serial, xp }: PaktosCardProps) {
  const [balance, setBalance] = React.useState(0);
  const [shared, setShared] = React.useState(false);
  const [storyOpen, setStoryOpen] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setBalance((b) => Math.max(b, xp)), 900);
    return () => clearTimeout(timer);
  }, [xp]);

  const handleShareDone = () => {
    setStoryOpen(false);
    setShared(true);
    setBalance(xp * 2);
  };

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-5">
      {storyOpen && (
        <StoryShareScreen
          memberName={memberName}
          serial={serial}
          xp={xp}
          onDone={handleShareDone}
          onDismiss={() => setStoryOpen(false)}
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

      <p className="text-center text-sm text-muted-foreground">
        Your Founding Member bonus has been added to your Paktos Card.
      </p>

      <button
        onClick={() => !shared && setStoryOpen(true)}
        disabled={shared}
        className="h-11 w-full rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {shared
          ? `+${xp} XP added · Thanks for sharing!`
          : `Share to your story · Earn +${xp} XP`}
      </button>
    </div>
  );
}
