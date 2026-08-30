import * as React from "react";
import { cn } from "@/lib/utils";
import { LAUNCH_DATE } from "@/lib/launch";
import { PaktosLogo } from "@/components/paktos-logo";
import { CoinOrbit } from "@/components/coin-orbit";
import { CoinsLoop } from "@/components/coins-loop";
import { AnimatedCountdown } from "@/components/ui/animated-countdown";
import { Button } from "@/components/ui/button";
import {
  RiInstagramFill,
  RiLinkedinFill,
  RiTwitterXFill,
} from "@remixicon/react";
import cardPlatinum from "@/assets/paktos-card-platinum.jpg";
import coinCyan from "@/assets/coins/coin-cyan.png";
import coinYellow from "@/assets/coins/coin-yellow.png";
import coinPink from "@/assets/coins/coin-pink.png";

const XP_BONUS = 500;

// Fades a section in the first time it scrolls into view.
function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [shown, setShown] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={cn(
        "transition-all duration-700 ease-out",
        shown ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
        className
      )}
    >
      {children}
    </div>
  );
}

function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-[11px] font-medium uppercase tracking-[0.22em] text-[#86868b]",
        className
      )}
    >
      {children}
    </p>
  );
}

const ARENA_STEPS = [
  {
    coin: coinCyan,
    title: "Claim your handle",
    body: "Your @handle is your identity in the arena — one name across every leaderboard, locked in at launch.",
  },
  {
    coin: coinYellow,
    title: "Enter a tournament",
    body: "A $25 ticket is one seat, and every ticket feeds the shared prize pool. Everyone starts on the same line.",
  },
  {
    coin: coinPink,
    title: "Trade in the open",
    body: "Live leaderboards rank pure performance. No hidden books, no capital advantage — skill is the only edge.",
  },
];

const PRINCIPLES = [
  {
    title: "Skill",
    body: "Performance is measured through execution, not account size. Every competitor enters on equal terms.",
  },
  {
    title: "Transparency",
    body: "Every rank, prize, and milestone is public and updates in real time. Nothing happens behind closed doors.",
  },
  {
    title: "A shared prize",
    body: "One pool, funded by every ticket, won in the open. The arena grows with everyone who steps into it.",
  },
];

const FAQ = [
  {
    q: "What is Paktos?",
    a: "Paktos turns trading into a competitive sport. Traders enter tournaments on equal terms, compete in real time, and earn their position through consistent execution — skill, not capital.",
  },
  {
    q: "How do tournaments work?",
    a: "A ticket buys one seat, and every ticket feeds the shared prize pool. Once the arena opens, everyone trades under the same conditions while a live leaderboard ranks pure performance.",
  },
  {
    q: "What does it cost to enter?",
    a: "Entry to the first tournament is $25. One ticket, one seat, one coin in the pool — the entire pool is paid out to the leaderboard.",
  },
  {
    q: "What is XP?",
    a: `XP is your standing on Paktos, recorded on your member card. It grows with every tournament you enter and every rank you climb. Founding members on the waitlist start with ${XP_BONUS} XP.`,
  },
  {
    q: "When does Paktos launch?",
    a: "Paktos launches on October 11, 2026, with the first live arena in London to follow. Join the waitlist to lock in your handle and member number before doors open.",
  },
];

const SOCIALS = [
  {
    href: "https://x.com/tradepaktos",
    label: "Follow Paktos on X",
    Icon: RiTwitterXFill,
  },
  {
    href: "https://instagram.com/tradepaktos",
    label: "Follow Paktos on Instagram",
    Icon: RiInstagramFill,
  },
  {
    href: "https://linkedin.com/company/tradepaktos",
    label: "Follow Paktos on LinkedIn",
    Icon: RiLinkedinFill,
  },
];

export default function SitePage() {
  return (
    <div className="min-h-screen w-full bg-white text-[#1d1d1f]">
      {/* ——— Nav ——— */}
      <header className="sticky top-0 z-40 border-b border-[#e8e8ed]/80 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-6">
          <a href="#" aria-label="Paktos home" className="flex items-center">
            <PaktosLogo className="w-[96px]" />
          </a>
          <nav className="hidden items-center gap-7 text-sm text-[#86868b] sm:flex">
            <a href="#arena" className="transition-colors hover:text-[#1d1d1f]">
              Arena
            </a>
            <a href="#card" className="transition-colors hover:text-[#1d1d1f]">
              Card
            </a>
            <a
              href="#tournaments"
              className="transition-colors hover:text-[#1d1d1f]"
            >
              Tournaments
            </a>
            <a href="#faq" className="transition-colors hover:text-[#1d1d1f]">
              FAQ
            </a>
          </nav>
          <a
            href="#join"
            className="flex h-9 items-center rounded-md bg-[#1d1d1f] px-4 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Join waitlist
          </a>
        </div>
      </header>

      {/* ——— Hero ——— */}
      <section className="mx-auto flex w-full max-w-4xl flex-col items-center px-6 pt-20 text-center sm:pt-28">
        <Eyebrow>Launching October 2026</Eyebrow>
        <h1 className="mt-5 text-5xl font-semibold tracking-[-0.03em] [text-wrap:balance] sm:text-7xl">
          The World Is Watching.
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-[#86868b] sm:text-lg">
          Paktos turns trading into a sport. Every competitor enters on equal
          terms, trades in real time, and earns their rank through skill — not
          capital.
        </p>
        <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
          <a
            href="#join"
            className="flex h-11 items-center rounded-md bg-[#1d1d1f] px-7 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Join the waitlist
          </a>
          <a
            href="#tournaments"
            className="flex h-11 items-center rounded-md border border-[#e8e8ed] bg-white px-7 text-sm font-medium text-[#1d1d1f] transition-colors hover:bg-[#f5f5f7]"
          >
            Watch the prize pool
          </a>
        </div>

        <div className="mt-16 w-full overflow-hidden rounded-[28px] bg-[#f5f5f7]">
          <CoinsLoop className="h-auto" />
        </div>

        <div className="mt-10 grid w-full max-w-md grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-[#86868b]">Entry</p>
            <p className="mt-1.5 text-sm font-medium">$25</p>
          </div>
          <div>
            <p className="text-xs text-[#86868b]">Launch</p>
            <p className="mt-1.5 text-sm font-medium">Oct 2026</p>
          </div>
          <div>
            <p className="text-xs text-[#86868b]">First arena</p>
            <p className="mt-1.5 text-sm font-medium">London</p>
          </div>
        </div>
      </section>

      {/* ——— The arena ——— */}
      <section id="arena" className="mx-auto w-full max-w-5xl scroll-mt-20 px-6 pt-28 sm:pt-36">
        <Reveal className="flex flex-col items-center text-center">
          <Eyebrow>The arena</Eyebrow>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.02em] [text-wrap:balance] sm:text-4xl">
            One ticket. One seat. One shared prize.
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {ARENA_STEPS.map((step, i) => (
            <Reveal key={step.title} delay={i * 120}>
              <div className="flex h-full flex-col rounded-[28px] bg-[#f5f5f7] p-7">
                <img
                  src={step.coin}
                  alt=""
                  aria-hidden="true"
                  className="h-12 w-12 select-none"
                  draggable={false}
                />
                <h3 className="mt-6 text-lg font-semibold tracking-[-0.01em]">
                  {step.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-[#86868b]">
                  {step.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ——— First tournament ——— */}
      <section className="mx-auto w-full max-w-5xl px-6 pt-24 sm:pt-28">
        <Reveal>
          <div className="flex flex-col items-center rounded-[28px] bg-[#1d1d1f] px-6 py-14 text-center text-white sm:py-16">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-white/50">
              First live arena
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
              London
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/60">
              The prize pool is already open and grows with every ticket sold.
              Watch the jar fill, coin by coin, until doors open.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-1.5">
              {["$50K", "$75K", "$100K", "$150K", "$250K"].map((m, i) => (
                <span
                  key={m}
                  className={
                    i === 0
                      ? "rounded-full bg-white px-3 py-1 text-[11px] font-medium text-[#1d1d1f]"
                      : "rounded-full bg-white/10 px-3 py-1 text-[11px] font-medium text-white/60"
                  }
                >
                  {m}
                </span>
              ))}
            </div>
            <a
              href="#tournaments"
              className="mt-8 flex h-11 items-center rounded-md bg-white px-7 text-sm font-medium text-[#1d1d1f] transition-opacity hover:opacity-90"
            >
              Watch it fill live
            </a>
          </div>
        </Reveal>
      </section>

      {/* ——— The Paktos Card ——— */}
      <section
        id="card"
        className="mx-auto grid w-full max-w-5xl scroll-mt-20 items-center gap-10 px-6 pt-28 sm:pt-36 lg:grid-cols-2 lg:gap-16"
      >
        <Reveal>
          <img
            src={cardPlatinum}
            alt="The platinum Paktos member card"
            className="w-full rounded-[28px] shadow-[0_24px_60px_-24px_rgba(29,29,31,0.35)]"
            draggable={false}
          />
        </Reveal>
        <Reveal delay={120}>
          <Eyebrow>The Paktos Card</Eyebrow>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.02em] [text-wrap:balance] sm:text-4xl">
            Your record, minted.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-[#86868b] sm:text-base">
            Every member carries a card: your handle, your permanent member
            number, and the XP you earn in every arena you enter. It is your
            history on Paktos — and it starts counting before launch.
          </p>
          <dl className="mt-8 divide-y divide-[#e8e8ed] border-y border-[#e8e8ed]">
            {[
              ["XP", "Earned in every tournament, never reset"],
              ["Member №", "Issued once, in order of joining"],
              ["Handle", "Claimed on the waitlist, locked at launch"],
            ].map(([term, def]) => (
              <div
                key={term}
                className="flex items-baseline justify-between gap-6 py-3.5"
              >
                <dt className="text-sm font-medium">{term}</dt>
                <dd className="text-right text-sm text-[#86868b]">{def}</dd>
              </div>
            ))}
          </dl>
          <a
            href="#join"
            className="mt-8 inline-flex h-11 items-center rounded-md bg-[#1d1d1f] px-7 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Claim yours early
          </a>
          <p className="mt-3 text-xs text-[#86868b]">
            Founding members start with {XP_BONUS} XP.
          </p>
        </Reveal>
      </section>

      {/* ——— Principles ——— */}
      <section className="mx-auto w-full max-w-5xl px-6 pt-28 sm:pt-36">
        <Reveal>
          <div className="grid gap-10 border-t border-[#e8e8ed] pt-12 sm:grid-cols-3 sm:gap-8">
            {PRINCIPLES.map((p) => (
              <div key={p.title}>
                <h3 className="text-sm font-semibold uppercase tracking-[0.14em]">
                  {p.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[#86868b]">
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ——— FAQ ——— */}
      <section
        id="faq"
        className="mx-auto w-full max-w-2xl scroll-mt-20 px-6 pt-28 sm:pt-36"
      >
        <Reveal className="flex flex-col items-center text-center">
          <Eyebrow>Questions</Eyebrow>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
            Before you enter
          </h2>
        </Reveal>
        <Reveal delay={120} className="mt-10">
          {FAQ.map((item) => (
            <details
              key={item.q}
              className="group border-b border-[#e8e8ed] py-5"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-sm font-medium [&::-webkit-details-marker]:hidden">
                {item.q}
                <span
                  aria-hidden="true"
                  className="text-lg font-normal leading-none text-[#86868b] transition-transform duration-200 group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 pr-8 text-sm leading-relaxed text-[#86868b]">
                {item.a}
              </p>
            </details>
          ))}
        </Reveal>
      </section>

      {/* ——— Countdown finale ——— */}
      <section className="mx-auto flex w-full max-w-4xl flex-col items-center px-6 pb-24 pt-28 text-center sm:pt-36">
        <Reveal className="flex flex-col items-center">
          <CoinOrbit radius={96} />
          <p className="mt-10 text-[11px] font-medium uppercase tracking-[0.35em] text-[#61606C]">
            Paktos Launch
          </p>
          <div className="mt-4">
            <AnimatedCountdown
              targetDate={LAUNCH_DATE}
              variant="minimal"
              size="md"
              containerClassName="border-transparent"
              numberClassName="text-[#18181B]"
              labelClassName="text-[#94939F]"
              unitClassName="hover:bg-transparent"
            />
          </div>
          <a
            href="#join"
            className="mt-10 flex h-11 items-center rounded-md bg-[#1d1d1f] px-8 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Join the waitlist
          </a>
          <p className="mt-3 text-xs text-[#86868b]">
            Secure your handle before doors open.
          </p>
        </Reveal>
      </section>

      {/* ——— Footer ——— */}
      <footer className="border-t border-[#e8e8ed]">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-6 px-6 py-10 sm:flex-row sm:justify-between">
          <PaktosLogo className="w-[96px]" />
          <div className="flex items-center gap-2">
            {SOCIALS.map(({ href, label, Icon }) => (
              <Button key={href} variant="outline" size="icon" asChild>
                <a href={href} target="_blank" rel="noreferrer" aria-label={label}>
                  <Icon size={16} aria-hidden="true" />
                </a>
              </Button>
            ))}
            <span className="ml-2 text-xs text-[#86868b]">@tradepaktos</span>
          </div>
        </div>
        <p className="pb-8 text-center text-xs text-[#86868b]">
          © 2026 Paktos. The World Is Watching.
        </p>
      </footer>
    </div>
  );
}
