import * as React from "react";
import NumberFlow from "@number-flow/react";
import { LiquidCard, CardContent } from "@/components/ui/liquid-glass-card";
import { TiltCard } from "@/components/ui/tilt-card";
import iconBlack from "@/assets/paktos-icon-black-192.png";

interface PaktosCardProps {
  memberName: string;
  serial: string;
  xp: number;
}

// The member's gold Paktos Card: the Founding Member XP bonus animates onto
// the balance shortly after the card appears, and sharing to a story earns a
// second bonus that rolls the balance up again.
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

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-5">
      <div className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground animate-in fade-in-0 slide-in-from-top-2 duration-500">
        +{xp} XP · Founding Member bonus
      </div>

      <div className="w-full animate-in fade-in-0 zoom-in-95 duration-500">
        <TiltCard className="rounded-xl shadow-2xl">
        <LiquidCard className="h-56 w-full border-0 bg-gradient-to-br from-[#f7ecc4] via-[#f3e3ac] to-[#dcc584] text-neutral-800 ring-1 ring-inset ring-[#b3a05e]/40">
          <CardContent className="relative flex h-full flex-col justify-between p-6">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(115deg, rgba(255,0,128,0.07), rgba(255,236,0,0.12) 30%, rgba(0,255,128,0.07) 55%, rgba(0,128,255,0.09) 80%, rgba(255,0,255,0.07))",
              }}
            />
            <div className="flex items-start justify-between">
              <img src={iconBlack} alt="Paktos" className="h-9 w-9" />
              <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-600">
                Founding Member
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-neutral-600">
                Paktos XP
              </p>
              <p className="text-4xl font-semibold tabular-nums">
                <NumberFlow value={balance} />
                <span className="ml-2 text-lg font-medium text-neutral-600">XP</span>
              </p>
            </div>

            <div className="flex items-end justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-wide text-neutral-600">
                  Member
                </p>
                <p className="font-medium">{memberName}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wide text-neutral-600">
                  Serial No.
                </p>
                <p className="font-mono text-sm tracking-wider">{serial}</p>
              </div>
            </div>
          </CardContent>
        </LiquidCard>
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
