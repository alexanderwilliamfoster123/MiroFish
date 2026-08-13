import * as React from "react";
import { AnimatedTicket } from "@/components/ui/ticket-confirmation-card";
import { PaktosLogo } from "@/components/paktos-logo";
import { CoinOrbit } from "@/components/coin-orbit";
import { SplineHero } from "@/components/ui/spline-hero";
import coinsScene from "@/assets/paktos-scene.splinecode?url";
import { PaktosCard } from "@/components/paktos-card";
import { AnimatedCountdown } from "@/components/ui/animated-countdown";
import { Button } from "@/components/ui/button";
import { RiInstagramFill, RiLinkedinFill, RiTwitterXFill } from "@remixicon/react";

const XP_BONUS = 500;

// The Paktos launch date — 60 days out.
const GIVEAWAY_DATE = new Date("2026-10-11T18:00:00Z");

type Stage = "email" | "name" | "handle" | "ticket" | "card" | "countdown";

interface TicketData {
  ticketId: string;
  date: Date;
  last4Digits: string;
  barcodeValue: string;
  serial: string;
  memberNo: string;
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
  // Simulated permanent member number — replace with the backend-assigned
  // value when signups are wired up.
  const memberNumber = 300 + (parseInt(digitsFrom(seed + ":member", 4), 10) % 1200);
  return {
    ticketId: digitsFrom(seed, 13),
    date: new Date(),
    last4Digits: digitsFrom(email, 4),
    barcodeValue: digitsFrom(seed + ":barcode", 14),
    serial: `PKT-${digitsFrom(seed + ":serial", 5)}`,
    memberNo: `#${String(memberNumber).padStart(6, "0")}`,
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

// Handles are lowercase alphanumerics and underscores, max 20 chars.
function sanitizeHandle(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20);
}

// The tournaments space is pre-launch: only reachable at #tournaments
// until it gets a real route when the page goes live.
const TournamentsPage = React.lazy(() => import("@/tournaments"));

export default function App() {
  const [route, setRoute] = React.useState(() => window.location.hash);
  React.useEffect(() => {
    const onHash = () => setRoute(window.location.hash);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const [stage, setStage] = React.useState<Stage>("email");
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [handle, setHandle] = React.useState("");
  const [ticket, setTicket] = React.useState<TicketData | null>(null);

  const handleEmailSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) return;
    setStage("name");
  };

  const handleNameSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) return;
    setStage("handle");
  };

  const handleHandleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!handle) return;
    setTicket(issueTicket(email.trim()));
    setStage("ticket");
  };

  if (route === "#tournaments") {
    return (
      <React.Suspense fallback={null}>
        <TournamentsPage />
      </React.Suspense>
    );
  }

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
            hideMember
            confetti={false}
            memberNo={ticket.memberNo}
            details={[
              { label: "Name", value: formatMemberName(name) },
              { label: "Handle", value: `@${handle}` },
              { label: "Email", value: email.trim(), span: true },
            ]}
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
          memberName={formatMemberName(name)}
          serial={ticket.serial}
          memberNo={ticket.memberNo}
          handle={handle}
          joined={ticket.date}
          xp={XP_BONUS}
          onShared={() => setStage("countdown")}
        />
      ) : stage === "countdown" ? (
        <div className="fixed inset-0 z-10 overflow-hidden bg-white animate-in fade-in-0 duration-700">
          <div className="relative z-10 flex h-full flex-col items-center justify-between overflow-y-auto px-6 py-10">
            <div className="flex w-full flex-1 items-center justify-center py-4">
              {/* Interactive 3D coin ring — drag to play. Falls back to the
                  sprite orbit where WebGL/wasm can't run. */}
              <SplineHero
                scene={coinsScene}
                className="aspect-[896/425] w-full max-w-3xl"
                fallback={<CoinOrbit />}
              />
            </div>

            <div className="flex flex-col items-center gap-5">
              <p className="text-[11px] font-medium uppercase tracking-[0.35em] text-[#61606C]">
                Paktos Launch
              </p>
              <AnimatedCountdown
                targetDate={GIVEAWAY_DATE}
                variant="minimal"
                size="md"
                containerClassName="border-transparent"
                numberClassName="text-[#18181B]"
                labelClassName="text-[#94939F]"
                unitClassName="hover:bg-transparent"
              />
            </div>

            <div className="mt-8 flex flex-col items-center gap-3 pb-2">
              <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-[#94939F]">
                Follow the arena
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" asChild>
                  <a
                    href="https://x.com/tradepaktos"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Follow Paktos on X"
                  >
                    <RiTwitterXFill size={16} aria-hidden="true" />
                  </a>
                </Button>
                <Button variant="outline" size="icon" asChild>
                  <a
                    href="https://instagram.com/tradepaktos"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Follow Paktos on Instagram"
                  >
                    <RiInstagramFill size={16} aria-hidden="true" />
                  </a>
                </Button>
                <Button variant="outline" size="icon" asChild>
                  <a
                    href="https://linkedin.com/company/tradepaktos"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Follow Paktos on LinkedIn"
                  >
                    <RiLinkedinFill size={16} aria-hidden="true" />
                  </a>
                </Button>
              </div>
              <p className="text-xs text-[#94939F]">@tradepaktos</p>
            </div>
          </div>
        </div>
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
                className="h-11 flex-1 rounded-md border border-input bg-background px-4 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:text-sm"
              />
              <button
                type="submit"
                className="h-11 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Join
              </button>
            </form>
          ) : stage === "name" ? (
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
                className="h-11 flex-1 rounded-md border border-input bg-background px-4 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:text-sm"
              />
              <button
                type="submit"
                className="h-11 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Continue
              </button>
            </form>
          ) : (
            <>
              <form
                onSubmit={handleHandleSubmit}
                className="mt-10 flex w-full items-center gap-2"
              >
                <div className="relative flex-1">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base text-muted-foreground sm:text-sm">
                    @
                  </span>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={handle}
                    onChange={(event) =>
                      setHandle(sanitizeHandle(event.target.value))
                    }
                    placeholder="yourhandle"
                    aria-label="Handle"
                    className="h-11 w-full rounded-md border border-input bg-background pl-8 pr-4 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="h-11 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Claim
                </button>
              </form>
              <p className="mt-3 text-xs text-muted-foreground">
                Secure your handle on Paktos now — it's yours at launch.
              </p>
            </>
          )}
        </div>
      )}
    </main>
  );
}
