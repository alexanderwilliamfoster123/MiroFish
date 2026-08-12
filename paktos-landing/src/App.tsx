import * as React from "react";
import { AnimatedTicket } from "@/components/ui/ticket-confirmation-card";
import { AwardBadge } from "@/components/ui/award-badge";
import { PaktosLogo } from "@/components/paktos-logo";
import { PaktosCard } from "@/components/paktos-card";
import { LiquidMetalButton } from "@/components/ui/liquid-metal-button";
import paktosIconBlack from "@/assets/paktos-icon-black-192.png";

const XP_BONUS = 500;

type Stage = "email" | "name" | "ticket" | "card";

interface TicketData {
  ticketId: string;
  date: Date;
  last4Digits: string;
  barcodeValue: string;
  serial: string;
}

function digitsFrom(seed: string, length: number): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  let out = "";
  let state = Math.abs(hash) + 1;
  while (out.length < length) {
    state = (state * 48271) % 2147483647;
    out += String(state % 10);
  }
  return out;
}

function issueTicket(email: string): TicketData {
  const seed = `${email}:${Date.now()}`;
  return {
    ticketId: digitsFrom(seed, 13),
    date: new Date(),
    last4Digits: digitsFrom(email, 4),
    barcodeValue: digitsFrom(seed + ":barcode", 14),
    serial: `PKT-${digitsFrom(seed + ":serial", 5)}`,
  };
}

// Members are shown by name only — if someone typed their email into the
// name field, fall back to a title-cased name from its local part.
function formatMemberName(input: string): string {
  const base = input.includes("@") ? input.split("@")[0] : input;
  return base
    .split(/[._\-+\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function App() {
  const [stage, setStage] = React.useState<Stage>("email");
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [ticket, setTicket] = React.useState<TicketData | null>(null);

  const handleEmailSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) return;
    setStage("name");
  };

  const handleNameSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) return;
    setTicket(issueTicket(email.trim()));
    setStage("ticket");
  };

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-background p-4 py-10">
      {stage === "ticket" && ticket ? (
        <div className="z-10 flex w-full max-w-sm flex-col items-center gap-6">
          <AnimatedTicket
            ticketId={ticket.ticketId}
            amount={0}
            date={ticket.date}
            cardHolder={formatMemberName(name)}
            last4Digits={ticket.last4Digits}
            barcodeValue={ticket.barcodeValue}
            xp={XP_BONUS}
            memberLabel="Founding Member"
            icon={<img src={paktosIconBlack} alt="Paktos" className="h-8 w-8" />}
          />
          <LiquidMetalButton
            label={`Add ${XP_BONUS} XP to my Paktos Card`}
            width={260}
            onClick={() => setStage("card")}
          />
        </div>
      ) : stage === "card" && ticket ? (
        <PaktosCard
          memberName={formatMemberName(name)}
          serial={ticket.serial}
          xp={XP_BONUS}
        />
      ) : (
        <div className="flex w-full max-w-md flex-col items-center text-center">
          <PaktosLogo />
          <p className="mt-6 text-muted-foreground">
            The World Is Watching.
          </p>
          {stage === "email" ? (
            <form
              onSubmit={handleEmailSubmit}
              className="mt-10 flex w-full items-center gap-2"
            >
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                aria-label="Email address"
                className="h-11 flex-1 rounded-md border border-input bg-background px-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
              <LiquidMetalButton label="Join" width={96} />
            </form>
          ) : (
            <form
              onSubmit={handleNameSubmit}
              className="mt-10 flex w-full items-center gap-2"
            >
              <input
                type="text"
                required
                autoFocus
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name"
                aria-label="Name"
                className="h-11 flex-1 rounded-md border border-input bg-background px-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
              <LiquidMetalButton label="Continue" width={124} />
            </form>
          )}
          <div className="mt-12 flex justify-center">
            <AwardBadge
              type="product-of-the-day"
              place={1}
              topText="PAKTOS"
              titleText="Founding Member"
            />
          </div>
        </div>
      )}
    </main>
  );
}
