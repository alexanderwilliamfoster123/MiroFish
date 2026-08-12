import * as React from "react";
import NumberFlow from "@number-flow/react";
import { TiltCard } from "@/components/ui/tilt-card";
import platinumCard from "@/assets/paktos-card-platinum.jpg";
import logoWhite from "@/assets/paktos-logo-white-380.png";
import logoWhite2x from "@/assets/paktos-logo-white-760.png";
import logoWhite4x from "@/assets/paktos-logo-white-1520.png";

const WAITLIST_LINK = "paktos.com/waitlist";

interface PaktosCardProps {
  memberName: string;
  serial: string;
  xp: number;
}

// Engraved-metal text treatment to match the platinum card artwork.
const engraved: React.CSSProperties = {
  color: "#6f7277",
  textShadow: "0 1px 0 rgba(255,255,255,0.55), 0 -1px 1px rgba(0,0,0,0.35)",
  fontWeight: 500,
};

// The platinum Paktos Card artwork with the member's details set into it.
function PlatinumCardFace({
  memberName,
  serial,
}: {
  memberName: string;
  serial: string;
}) {
  const last4 = serial.replace(/\D/g, "").slice(-4);
  return (
    <div className="relative w-full" style={{ containerType: "inline-size" }}>
      <img
        src={platinumCard}
        alt="Paktos platinum member card"
        className="block h-auto w-full rounded-2xl"
      />
      {/* Member name — set above the engraved PAKTOS MEMBER label */}
      <p
        className="absolute font-sans uppercase"
        style={{
          ...engraved,
          left: "10%",
          top: "72.5%",
          fontSize: "5.6cqw",
          letterSpacing: "0.14em",
        }}
      >
        {memberName}
      </p>
      {/* Serial digits — beside the contactless symbol */}
      <p
        className="absolute font-sans tabular-nums"
        style={{
          ...engraved,
          left: "82%",
          top: "44.5%",
          fontSize: "5.2cqw",
          letterSpacing: "0.1em",
        }}
      >
        {last4}
      </p>
      {/* Member since — under the banner */}
      <p
        className="absolute font-sans tabular-nums -translate-x-1/2"
        style={{
          ...engraved,
          left: "76%",
          top: "72.5%",
          fontSize: "4.6cqw",
          letterSpacing: "0.08em",
        }}
      >
        26
      </p>
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
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between overflow-y-auto bg-black px-8 py-12 animate-in fade-in-0 duration-700">
      {/* ——— the screenshot zone ——— */}
      <div className="flex w-full max-w-sm flex-1 flex-col items-center justify-center gap-10 text-center">
        <img
          src={logoWhite}
          srcSet={`${logoWhite} 1x, ${logoWhite2x} 2x, ${logoWhite4x} 4x`}
          alt="Paktos"
          className="w-[120px] animate-in fade-in-0 duration-1000"
        />

        <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-1000 delay-200">
          <p className="font-serif text-5xl text-white">I'm in.</p>
          <p className="mt-4 text-[11px] uppercase tracking-[0.35em] text-neutral-500">
            Founding Member · {serial}
          </p>
        </div>

        <div className="w-full animate-in fade-in-0 zoom-in-95 duration-1000 delay-300">
          <PlatinumCardFace memberName={memberName} serial={serial} />
        </div>

        <p className="text-sm tracking-wide text-neutral-400 animate-in fade-in-0 duration-1000 delay-500">
          {WAITLIST_LINK}
        </p>
      </div>

      {/* ——— instructions, below the story art ——— */}
      <div className="mt-10 flex w-full max-w-sm flex-col items-center gap-3 animate-in fade-in-0 duration-1000 delay-700">
        <p className="text-center text-xs text-neutral-500">
          Screenshot this screen and post it to your story.
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
          <PlatinumCardFace memberName={memberName} serial={serial} />
        </TiltCard>
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
