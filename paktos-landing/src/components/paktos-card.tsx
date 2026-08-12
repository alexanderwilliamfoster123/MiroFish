import * as React from "react";
import NumberFlow from "@number-flow/react";
import { TiltCard } from "@/components/ui/tilt-card";
import platinumCard from "@/assets/paktos-card-platinum.jpg";

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

// The member's platinum Paktos Card: the supplied metal artwork with the
// member's details set into it. The Founding Member XP bonus rolls onto the
// balance pill, and sharing to a story earns a second bonus.
export function PaktosCard({ memberName, serial, xp }: PaktosCardProps) {
  const [balance, setBalance] = React.useState(0);
  const [shared, setShared] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setBalance((b) => Math.max(b, xp)), 900);
    return () => clearTimeout(timer);
  }, [xp]);

  const handleShare = async () => {
    if (shared) return;
    const text = "I'm a Paktos Founding Member. The World Is Watching.";
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({ title: "Paktos", text, url });
      } else {
        await navigator.clipboard.writeText(`${text} ${url}`.trim());
      }
    } catch {
      // share sheet dismissed or clipboard unavailable — still count the tap
    }
    setShared(true);
    setBalance(xp * 2);
  };

  const last4 = serial.replace(/\D/g, "").slice(-4);

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-5">
      <div className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground animate-in fade-in-0 slide-in-from-top-2 duration-500 tabular-nums">
        +<NumberFlow value={balance} /> XP · Founding Member bonus
      </div>

      <div className="w-full animate-in fade-in-0 zoom-in-95 duration-500">
        <TiltCard className="rounded-2xl shadow-2xl">
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
        </TiltCard>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Your Founding Member bonus has been added to your Paktos Card.
      </p>

      <button
        onClick={handleShare}
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
