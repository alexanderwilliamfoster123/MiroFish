import * as React from "react";
import { AnimatedTicket } from "@/components/ui/ticket-confirmation-card";
import { AwardBadge } from "@/components/ui/award-badge";
import { PaktosLogo } from "@/components/paktos-logo";
import { PaktosCard } from "@/components/paktos-card";
import paktosIconBlack from "@/assets/paktos-icon-black-192.png";

const XP_BONUS = 500;

type Stage = "landing" | "ticket" | "card";

interface TicketData {
  ticketId: string;
  date: Date;
  cardHolder: string;
  last4Digits: string;
  barcodeValue: string;
  memberId: string;
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

function nameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "Guest";
  return local
    .split(/[._\-+]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function issueTicket(email: string): TicketData {
  const seed = `${email}:${Date.now()}`;
  return {
    ticketId: digitsFrom(seed, 13),
    date: new Date(),
    cardHolder: nameFromEmail(email),
    last4Digits: digitsFrom(email, 4),
    barcodeValue: digitsFrom(seed + ":barcode", 14),
    memberId: digitsFrom(seed + ":member", 16),
  };
}

export default function App() {
  const [email, setEmail] = React.useState("");
  const [stage, setStage] = React.useState<Stage>("landing");
  const [ticket, setTicket] = React.useState<TicketData | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) return;
    setTicket(issueTicket(email.trim()));
    setStage("ticket");
  };

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      {stage === "ticket" && ticket ? (
        <div className="z-10 flex w-full max-w-sm flex-col items-center gap-6">
          <AnimatedTicket
            ticketId={ticket.ticketId}
            amount={0}
            date={ticket.date}
            cardHolder={ticket.cardHolder}
            last4Digits={ticket.last4Digits}
            barcodeValue={ticket.barcodeValue}
            xp={XP_BONUS}
            memberLabel="Founding Member"
            icon={<img src={paktosIconBlack} alt="Paktos" className="h-8 w-8" />}
          />
          <button
            onClick={() => setStage("card")}
            className="h-11 w-full max-w-sm rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Add {XP_BONUS} XP to my Paktos Card
          </button>
        </div>
      ) : stage === "card" && ticket ? (
        <PaktosCard
          memberName={ticket.cardHolder}
          memberId={ticket.memberId}
          xp={XP_BONUS}
        />
      ) : (
        <div className="flex w-full max-w-md flex-col items-center text-center">
          <PaktosLogo />
          <p className="mt-6 text-muted-foreground">
            The World Is Watching.
          </p>
          <form
            onSubmit={handleSubmit}
            className="mt-10 flex w-full items-center gap-2"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              aria-label="Email address"
              className="h-11 flex-1 rounded-md border border-input bg-background px-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
            <button
              type="submit"
              className="h-11 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Join
            </button>
          </form>
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
