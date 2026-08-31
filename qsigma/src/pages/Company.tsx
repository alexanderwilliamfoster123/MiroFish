import PageShell, { PageHero, PageSection, CtaBand } from "@/components/qsigma/PageShell";
import FadeUp from "@/components/qsigma/FadeUp";
import { PRESS } from "@/components/qsigma/Press";

const PRINCIPLES = [
  {
    t: "Falsifiable, or it doesn't ship",
    d: "Every claim on our site — performance, fees, custody — must be independently verifiable by the person reading it. US CPA audits and public audit links aren't marketing; they're the spec.",
  },
  {
    t: "Your money stays yours",
    d: "We connect to your own brokerage account with execution-only permissions. We cannot withdraw, we cannot pool, and leaving takes one click. Any product decision that would weaken this is dead on arrival.",
  },
  {
    t: "The machine does the discipline",
    d: "Humans are brilliant at research and terrible at 2 a.m. risk decisions. Strategy design is human; execution and risk are mechanical, in microseconds, without exception.",
  },
  {
    t: "One price, said out loud",
    d: "A single onboarding fee and a light AUM fee, both printed on the front page. No performance fees, no spreads, no tiers designed to be misunderstood.",
  },
];

const MILESTONES = [
  { y: "2013", d: "Strategy research begins; every portfolio's backtest clock starts here — including the months we'd rather forget." },
  { y: "2019", d: "The fusion layer goes multi-strategy: one signal core, many risk profiles." },
  { y: "2024", d: "First external CPA audit of live performance completed." },
  { y: "2025", d: "Execution-only brokerage connections launch with Public.com, Alpaca, and Interactive Brokers." },
  { y: "2026", d: "Squared³ opens to the public: every strategy, one fee, lifetime access." },
];

export function About() {
  return (
    <PageShell>
      <PageHero
        eyebrow="About"
        titleDim="Built to be"
        title="checked"
        intro="Squared³ exists because algorithmic investing had a trust problem, not a returns problem. We fixed the part that was actually broken."
      />
      <PageSection white narrow>
        <FadeUp>
          <p className="text-[17px]" style={{ fontWeight: 500, color: "rgba(0,0,0,0.65)", lineHeight: 1.7 }}>
            The tools that compound serious wealth — systematic strategies, regime models, disciplined
            execution — spent decades locked inside funds with seven-figure minimums and opaque fee
            stacks. The technology to open them up has existed for years. What was missing was a
            structure anyone could verify: audited numbers, self-custody, and a price printed in
            public. That structure is the company.
          </p>
        </FadeUp>
      </PageSection>
      <PageSection>
        <FadeUp>
          <h2 className="text-[26px] sm:text-[32px]" style={{ fontWeight: 500, letterSpacing: "-0.6px", color: "#05050C" }}>
            Principles we hire, build, and fire by
          </h2>
        </FadeUp>
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
          {PRINCIPLES.map((p, i) => (
            <FadeUp key={p.t} delay={i * 0.05}>
              <div className="h-full rounded-2xl border border-black/10 bg-white p-7">
                <h3 className="text-[17px]" style={{ fontWeight: 600, color: "#05050C", margin: 0 }}>
                  {p.t}
                </h3>
                <p className="mt-3 text-[14px]" style={{ fontWeight: 500, color: "rgba(0,0,0,0.55)", lineHeight: 1.65 }}>
                  {p.d}
                </p>
              </div>
            </FadeUp>
          ))}
        </div>
      </PageSection>
      <PageSection white narrow>
        <FadeUp>
          <h2 className="text-[26px] sm:text-[32px]" style={{ fontWeight: 500, letterSpacing: "-0.6px", color: "#05050C" }}>
            The long way here
          </h2>
        </FadeUp>
        <div className="mt-8">
          {MILESTONES.map((m, i) => (
            <FadeUp key={m.y} delay={i * 0.04}>
              <div className="flex gap-6 border-b border-black/10 py-5">
                <span className="w-16 shrink-0 text-[15px]" style={{ fontWeight: 700, color: "#5F7052" }}>
                  {m.y}
                </span>
                <p className="text-[14.5px]" style={{ fontWeight: 500, color: "rgba(0,0,0,0.60)", lineHeight: 1.6, margin: 0 }}>
                  {m.d}
                </p>
              </div>
            </FadeUp>
          ))}
        </div>
      </PageSection>
      <CtaBand />
    </PageShell>
  );
}

const ROLES = [
  { t: "Senior Quantitative Researcher", team: "Research", loc: "New York / Remote (US)" },
  { t: "Execution Systems Engineer", team: "Engineering", loc: "New York / Remote (US)" },
  { t: "Machine Learning Engineer — Signal Fusion", team: "Engineering", loc: "Remote (US)" },
  { t: "Product Designer", team: "Design", loc: "Remote (US)" },
  { t: "Member Support Specialist", team: "Operations", loc: "Remote (US)" },
];

export function Careers() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Careers"
        titleDim="Do the work"
        title="you can sign"
        intro="Small team, audited output, no theater. If you want your work checked by the market every day — and by an auditor every quarter — you'll like it here."
      />
      <PageSection white>
        <FadeUp>
          <h2 className="text-[24px] sm:text-[28px]" style={{ fontWeight: 500, letterSpacing: "-0.5px", color: "#05050C" }}>
            Open roles
          </h2>
        </FadeUp>
        <div className="mt-6">
          {ROLES.map((r, i) => (
            <FadeUp key={r.t} delay={i * 0.04}>
              <a
                href={`mailto:info@squaredq.com?subject=${encodeURIComponent("Application: " + r.t)}`}
                className="flex flex-col gap-1 border-b border-black/10 py-5 transition-colors hover:bg-black/[0.02] sm:flex-row sm:items-center sm:justify-between"
                style={{ textDecoration: "none" }}
              >
                <div>
                  <span className="text-[16px]" style={{ fontWeight: 600, color: "#05050C" }}>
                    {r.t}
                  </span>
                  <span className="ml-3 text-[12px]" style={{ fontWeight: 600, color: "#5F7052" }}>
                    {r.team}
                  </span>
                </div>
                <span className="text-[13px]" style={{ fontWeight: 500, color: "rgba(0,0,0,0.40)" }}>
                  {r.loc} · Apply →
                </span>
              </a>
            </FadeUp>
          ))}
        </div>
        <FadeUp delay={0.2}>
          <p className="mt-8 text-[14px]" style={{ fontWeight: 500, color: "rgba(0,0,0,0.45)" }}>
            Nothing that fits? We read every note sent to{" "}
            <a href="mailto:info@squaredq.com" style={{ color: "#5F7052" }}>
              info@squaredq.com
            </a>
            . Show us something you've built.
          </p>
        </FadeUp>
      </PageSection>
      <CtaBand title="Rather use it than build it?" />
    </PageShell>
  );
}

export function Newsroom() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Newsroom"
        titleDim="What the press"
        title="says about us"
        intro="Coverage, announcements, and the media kit. For interviews and press inquiries: info@squaredq.com."
      />
      <PageSection white>
        <div className="grid grid-cols-1 md:grid-cols-2" style={{ borderTop: "1px solid rgba(0,0,0,0.10)" }}>
          {PRESS.map((p) => (
            <div key={p.outlet} className="block py-6 pr-8 md:odd:pr-10 md:even:pl-10" style={{ borderBottom: "1px solid rgba(0,0,0,0.10)" }}>
              <div className="flex items-baseline justify-between gap-4">
                <span
                  className="text-[12px] uppercase"
                  style={{
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    color: "#05050C",
                    fontFamily: p.serif ? 'Georgia, "Times New Roman", serif' : "inherit",
                  }}
                >
                  {p.outlet}
                </span>
                <span className="shrink-0 text-[12px]" style={{ fontWeight: 500, color: "rgba(0,0,0,0.35)" }}>
                  {p.date}
                </span>
              </div>
              <p className="mt-2 text-[15px]" style={{ fontWeight: 500, color: "rgba(0,0,0,0.60)", lineHeight: 1.5, margin: "8px 0 0" }}>
                {p.headline}
              </p>
            </div>
          ))}
        </div>
        <FadeUp delay={0.1}>
          <p className="mt-10 text-[14px]" style={{ fontWeight: 500, color: "rgba(0,0,0,0.45)" }}>
            <strong style={{ color: "rgba(0,0,0,0.70)" }}>Media kit:</strong> brand marks, product screenshots, and factsheet
            samples are available on request —{" "}
            <a href="mailto:info@squaredq.com?subject=Media%20kit" style={{ color: "#5F7052" }}>
              info@squaredq.com
            </a>
            .
          </p>
        </FadeUp>
      </PageSection>
      <CtaBand />
    </PageShell>
  );
}
