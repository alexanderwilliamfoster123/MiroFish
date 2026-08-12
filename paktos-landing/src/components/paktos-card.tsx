import * as React from "react";
import NumberFlow from "@number-flow/react";
import { LiquidCard, CardContent } from "@/components/ui/liquid-glass-card";
import { TiltCard } from "@/components/ui/tilt-card";
import iconWhite from "@/assets/paktos-icon-white-192.png";

interface PaktosCardProps {
  memberName: string;
  serial: string;
  xp: number;
}

// Brand gradient — lavender through coral into plum and violet. Reserved for
// standout statements per the brand guidelines.
const BRAND_GRADIENT =
  "linear-gradient(115deg, #F0DCFF 0%, #FF8E94 35%, #D95DDF 65%, #9081DF 100%)";

// The member's Paktos Card, set to the brand system: near-black #18181B body
// on a gradient metallic edge, lavender and grey-scale accents, with the
// Founding Member XP bonus animating onto the balance. Sharing to a story
// earns a second bonus that rolls the balance up again.
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
      <div
        className="rounded-full px-4 py-1.5 text-sm font-medium text-[#18181B] animate-in fade-in-0 slide-in-from-top-2 duration-500"
        style={{ background: BRAND_GRADIENT }}
      >
        +{xp} XP · Founding Member bonus
      </div>

      <div className="w-full animate-in fade-in-0 zoom-in-95 duration-500">
        <TiltCard className="rounded-xl shadow-2xl">
          <div className="rounded-xl p-[1.5px]" style={{ background: BRAND_GRADIENT }}>
            <LiquidCard className="h-56 w-full rounded-[11px] border-0 bg-[#18181B] text-[#F2F1F3]">
              <CardContent className="relative flex h-full flex-col justify-between p-6">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-[11px]"
                  style={{
                    background:
                      "radial-gradient(60% 80% at 85% 0%, rgba(217,93,223,0.16), transparent 60%), radial-gradient(50% 70% at 10% 100%, rgba(144,129,223,0.14), transparent 60%)",
                  }}
                />
                <div className="flex items-start justify-between">
                  <img src={iconWhite} alt="Paktos" className="h-9 w-9" />
                  <p className="text-[10px] uppercase tracking-[0.25em] text-[#D3C2F0]">
                    Founding Member
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-[#94939F]">
                    Paktos XP
                  </p>
                  <p className="text-4xl font-semibold tabular-nums">
                    <NumberFlow value={balance} />
                    <span
                      className="ml-2 text-lg font-medium"
                      style={{
                        background: BRAND_GRADIENT,
                        WebkitBackgroundClip: "text",
                        backgroundClip: "text",
                        color: "transparent",
                      }}
                    >
                      XP
                    </span>
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
                    <p className="font-mono text-sm tracking-wider text-[#C9C9CF]">
                      {serial}
                    </p>
                  </div>
                </div>
              </CardContent>
            </LiquidCard>
          </div>
        </TiltCard>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Your Founding Member bonus has been added to your Paktos Card.
      </p>

      <button
        onClick={handleShare}
        disabled={shared}
        className="h-11 w-full rounded-md bg-[#18181B] px-6 text-sm font-medium text-[#F2F1F3] transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {shared
          ? `+${xp} XP added · Thanks for sharing!`
          : `Share to your story · Earn +${xp} XP`}
      </button>
    </div>
  );
}
