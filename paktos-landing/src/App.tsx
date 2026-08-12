import * as React from "react";
import { AnimatedTicket } from "@/components/ui/ticket-confirmation-card";
import { AwardBadge } from "@/components/ui/award-badge";
import { PaktosLogo } from "@/components/paktos-logo";

interface TicketData {
  ticketId: string;
  date: Date;
  cardHolder: string;
  last4Digits: string;
  barcodeValue: string;
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
  };
}

export default function App() {
  const [email, setEmail] = React.useState("");
  const [ticket, setTicket] = React.useState<TicketData | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) return;
    setTicket(issueTicket(email.trim()));
  };

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      {ticket ? (
        <AnimatedTicket
          ticketId={ticket.ticketId}
          amount={0}
          date={ticket.date}
          cardHolder={ticket.cardHolder}
          last4Digits={ticket.last4Digits}
          barcodeValue={ticket.barcodeValue}
        />
      ) : (
        <div className="flex w-full max-w-md flex-col items-center text-center">
          <PaktosLogo />
          <p className="mt-6 text-muted-foreground">
            The World Is Watching.
          </p>
          <p className="mt-10 text-xs font-medium uppercase tracking-[0.3em] text-foreground">
            The Founding List
          </p>
          <form
            onSubmit={handleSubmit}
            className="mt-4 flex w-full items-center gap-2"
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
          <div className="mt-16 flex justify-center">
            <AwardBadge
              type="product-of-the-day"
              place={1}
              topText="PAKTOS"
              titleText="Coming 2026"
              hideIcon
            />
          </div>
        </div>
      )}
    </main>
  );
}
