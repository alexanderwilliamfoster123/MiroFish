import * as React from "react";
import NumberFlow from "@number-flow/react";
import { LiquidCard, CardContent } from "@/components/ui/liquid-glass-card";
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

// The white Paktos Card face, shared between the card screen and the
// story-share screen.
function CardFace({
  memberName,
  serial,
  balance,
}: {
  memberName: string;
  serial: string;
  balance: number;
}) {
  return (
    <LiquidCard className="h-56 w-full border border-neutral-200 bg-white text-[#18181B]">
      <CardContent className="relative flex h-full flex-col justify-between p-6 text-left">
        <div className="flex items-start justify-between">
          <img src={iconBlack} alt="Paktos" className="h-9 w-9" />
        </div>

        {/* Founding Member stamp */}
        <div className="pointer-events-none absolute right-5 top-[34%] -rotate-6 rounded-md border-2 border-[#18181B]/40 px-3 py-1.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#18181B]/55">
            Founding Member
          </p>
          <p className="mt-0.5 text-center text-[8px] uppercase tracking-[0.34em] text-[#18181B]/40">
            Est. 2026
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-[#94939F]">
            Paktos XP
          </p>
          <p className="text-4xl font-semibold tabular-nums">
            <NumberFlow value={balance} />
            <span className="ml-2 text-lg font-medium text-[#94939F]">XP</span>
          </p>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-[#94939F]">
              Member
            </p>
            <p className="font-medium">{memberName}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wide text-[#94939F]">
              Serial No.
            </p>
            <p className="font-mono text-sm tracking-wider text-[#61606C]">
              {serial}
            </p>
          </div>
        </div>
      </CardContent>
    </LiquidCard>
  );
}

// Full-screen story graphic, designed to be screenshotted and posted.
function StoryConfetti() {
  const colors = ["#ffffff", "#d4d4d8", "#a1a1aa", "#facc15", "#f4e3ac"];
  return (
    <>
      <style>
        {`
          @keyframes story-fall {
            0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
            100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
          }
        `}
      </style>
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {Array.from({ length: 70 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-3"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${-20 + Math.random() * 10}%`,
              backgroundColor: colors[i % colors.length],
              transform: `rotate(${Math.random() * 360}deg)`,
              animation: `story-fall ${3 + Math.random() * 3}s ${Math.random() * 3}s linear infinite`,
            }}
          />
        ))}
      </div>
    </>
  );
}

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
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between overflow-y-auto bg-black px-6 py-8 animate-in fade-in-0 duration-500">
      {/* dramatic ground */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(80% 60% at 50% 35%, rgba(255,255,255,0.10), transparent 70%)",
        }}
      />
      <StoryConfetti />

      {/* ——— the screenshot zone ——— */}
      <div className="relative z-10 flex w-full max-w-sm flex-1 flex-col items-center justify-center gap-6 text-center">
        <img
          src={logoWhite}
          srcSet={`${logoWhite} 1x, ${logoWhite2x} 2x, ${logoWhite4x} 4x`}
          alt="Paktos"
          className="w-[150px] animate-in fade-in-0 slide-in-from-top-4 duration-700"
        />

        <div className="animate-in fade-in-0 zoom-in-95 duration-700 delay-150">
          <p className="font-serif text-5xl leading-tight text-white">
            I'm in.
          </p>
          <p className="mt-3 text-sm uppercase tracking-[0.3em] text-neutral-400">
            Founding Member · {serial}
          </p>
        </div>

        <div className="w-full animate-in fade-in-0 zoom-in-95 duration-700 delay-300">
          <CardFace memberName={memberName} serial={serial} balance={xp} />
        </div>

        <div className="animate-in fade-in-0 duration-700 delay-500">
          <AwardBadge
            type="product-of-the-day"
            place={2}
            topText="FOUNDING MEMBER"
            titleText="Paktos"
          />
        </div>

        <p className="font-serif text-xl italic text-neutral-300 animate-in fade-in-0 duration-700 delay-500">
          The World Is Watching.
        </p>

        <div className="rounded-full bg-white px-5 py-2 text-sm font-semibold tracking-wide text-black animate-in fade-in-0 slide-in-from-bottom-2 duration-700 delay-700">
          {WAITLIST_LINK}
        </div>
      </div>

      {/* ——— instructions, below the story art ——— */}
      <div className="relative z-10 mt-8 flex w-full max-w-sm flex-col items-center gap-3">
        <p className="text-center text-sm text-neutral-400">
          Screenshot this screen and post it to your story.
        </p>
        <button
          onClick={onDone}
          className="h-11 w-full rounded-md bg-white px-6 text-sm font-semibold text-black transition-opacity hover:opacity-90"
        >
          I posted it · Claim my +{xp} XP
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

// The member's Paktos Card in white. The Founding Member XP bonus animates
// onto the balance; sharing to a story opens a screenshot-ready screen, and
// the second bonus lands after the member confirms they posted.
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
        +{xp} XP · Founding Member bonus
      </div>

      <div className="w-full animate-in fade-in-0 zoom-in-95 duration-500">
        <TiltCard className="rounded-xl shadow-2xl">
          <CardFace memberName={memberName} serial={serial} balance={balance} />
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
