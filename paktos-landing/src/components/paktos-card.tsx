import * as React from "react";
import NumberFlow from "@number-flow/react";
import { LiquidCard, CardContent } from "@/components/ui/liquid-glass-card";
import { TiltCard } from "@/components/ui/tilt-card";
import iconWhite from "@/assets/paktos-icon-white-192.png";

interface PaktosCardProps {
  memberName: string;
  memberId: string;
  xp: number;
}

// The member's Paktos Card: the Founding Member XP bonus animates onto the
// balance shortly after the card appears, so the credit visibly "lands".
export function PaktosCard({ memberName, memberId, xp }: PaktosCardProps) {
  const [balance, setBalance] = React.useState(0);

  React.useEffect(() => {
    const timer = setTimeout(() => setBalance(xp), 900);
    return () => clearTimeout(timer);
  }, [xp]);

  const formattedId = memberId.replace(/(\d{4})(?=\d)/g, "$1 ");

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-5">
      <div className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground animate-in fade-in-0 slide-in-from-top-2 duration-500">
        +{xp} XP · Founding Member bonus
      </div>

      <div className="w-full animate-in fade-in-0 zoom-in-95 duration-500">
        <TiltCard className="rounded-xl shadow-2xl">
        <LiquidCard className="h-56 w-full border-0 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 text-white">
          <CardContent className="flex h-full flex-col justify-between p-6">
            <div className="flex items-start justify-between">
              <img src={iconWhite} alt="Paktos" className="h-9 w-9" />
              <p className="text-[10px] uppercase tracking-[0.25em] text-slate-300">
                Founding Member
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-slate-300">
                Paktos XP
              </p>
              <p className="text-4xl font-semibold tabular-nums">
                <NumberFlow value={balance} />
                <span className="ml-2 text-lg font-medium text-slate-300">XP</span>
              </p>
            </div>

            <div className="flex items-end justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-wide text-slate-300">
                  Member
                </p>
                <p className="font-medium">{memberName}</p>
              </div>
              <p className="font-mono text-sm tracking-wider text-slate-300">
                {formattedId}
              </p>
            </div>
          </CardContent>
        </LiquidCard>
        </TiltCard>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Your Founding Member bonus has been added to your Paktos Card.
      </p>
    </div>
  );
}
