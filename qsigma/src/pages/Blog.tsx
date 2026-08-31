import { Link, useParams } from "react-router-dom";
import PageShell, { PageHero, CtaBand } from "@/components/qsigma/PageShell";
import FadeUp from "@/components/qsigma/FadeUp";

type Post = {
  slug: string;
  title: string;
  dek: string;
  date: string;
  tag: string;
  minutes: number;
  body: { h?: string; p: string[] }[];
};

export const POSTS: Post[] = [
  {
    slug: "why-we-show-the-audits",
    title: "Why we show you the audits",
    dek: "Performance claims are cheap. We decided the only honest move was to make ours falsifiable.",
    date: "Aug 18, 2026",
    tag: "Transparency",
    minutes: 5,
    body: [
      {
        p: [
          "Every trading platform tells you it beats the market. Very few hand you the evidence and invite you to check it. That asymmetry is the single biggest reason smart people stay out of algorithmic investing — and we think they're right to.",
          "So we made a rule before we wrote a line of strategy code: no number appears on our site that a subscriber can't verify. Every portfolio's live performance is audited by a US CPA, and every factsheet carries a link to an independent audit trail. Click it. That's what it's for.",
        ],
      },
      {
        h: "Backtests are a starting point, not a promise",
        p: [
          "Our strategies have run in a backtesting environment since January 2013. Backtests matter — they show how a system behaves across regimes: the 2015 flash crash, the 2018 volatility spike, the 2020 drawdown, the 2022 rate shock. But backtested performance has inherent limitations, and we label it as such everywhere it appears.",
          "What we hold ourselves to is the live record. Live results are computed from real fills in real brokerage accounts, then handed to an auditor whose signature means something.",
        ],
      },
      {
        h: "Falsifiability is the product",
        p: [
          "The audit links aren't a marketing flourish. They're the product working as designed: a system where you never have to take our word for anything — not performance, not fees, not custody. If a claim on this site ever fails your verification, we want to know about it more than you do.",
        ],
      },
    ],
  },
  {
    slug: "inside-master-max",
    title: "Inside Master Max: anatomy of a flagship",
    dek: "A 33.3% CAGR with a −19% worst drawdown doesn't come from one big idea. It comes from hundreds of small ones, disciplined.",
    date: "Aug 4, 2026",
    tag: "Strategies",
    minutes: 7,
    body: [
      {
        p: [
          "Master Max is our growth flagship: 33.3% CAGR against QQQ since 2013, 17.9% volatility, a 1.70 Sharpe, and a worst drawdown of −19.0%. Those four numbers travel together — you can't understand one without the others.",
        ],
      },
      {
        h: "Where the return comes from",
        p: [
          "Master Max is a regime-aware momentum system. It holds concentrated exposure to the strongest liquid growth names when the regime model reads risk-on, scales down as internals deteriorate, and rotates to defensive positioning rather than fighting a falling tape.",
          "The edge isn't a secret indicator. It's the fusion layer: thousands of signal streams — market microstructure, positioning data, macro surprise indices, sentiment flows — compressed into a single conviction score that decides how much risk the book should carry today.",
        ],
      },
      {
        h: "Why the drawdown is the number we manage",
        p: [
          "A strategy you abandon in month eleven has a real-world return of whatever you locked in when you quit. That's why the system's first job is keeping the worst month survivable. The −19% figure isn't luck; the risk layer cuts gross exposure mechanically as realized volatility climbs — no committee, no hesitation.",
          "If you want the smoother ride, Master Portfolio runs the same machinery against SPY at roughly half the volatility. The monthly returns table for both is in the factsheet, every month since 2013, including the ugly ones.",
        ],
      },
    ],
  },
  {
    slug: "self-custody-is-non-negotiable",
    title: "Self-custody is non-negotiable",
    dek: "The most important feature of Squared³ is the thing we can't do: touch your money.",
    date: "Jul 21, 2026",
    tag: "Custody",
    minutes: 4,
    body: [
      {
        p: [
          "Every few years the industry relearns the same lesson: platforms that pool client money eventually face a day when clients want it back at once. We designed Squared³ so that day can't exist.",
          "Your capital never moves. It stays in your own account at Public.com, Alpaca, or Interactive Brokers — brokerages regulated in the United States, with the investor protections that come with that. Squared³ connects to your account with execution-only permissions: we can place the trades you've subscribed to, and that is the entire list of things we can do.",
        ],
      },
      {
        h: "What execution-only means in practice",
        p: [
          "We cannot withdraw funds. We cannot change your bank links. We cannot see your credentials — the brokerage connection is made through the brokerage's own OAuth flow, and you can revoke it from your brokerage's settings page as well as ours.",
          "Leaving Squared³ takes one click and zero transfers, because there's nothing to transfer back. Your positions and cash are already where they've always been: with you.",
        ],
      },
    ],
  },
  {
    slug: "eleven-thousand-streams-one-trade",
    title: "How 11,000 signal streams become one trade",
    dek: "Satellite passes, dark-pool prints, central-bank language drift — and the fusion layer that turns noise into a position.",
    date: "Jul 7, 2026",
    tag: "Engineering",
    minutes: 6,
    body: [
      {
        p: [
          "The Squared³ core ingests more than 11,000 signal streams. Most of them are individually worthless. That's not a bug — it's the honest starting point of quantitative work: no single stream survives contact with the market for long.",
        ],
      },
      {
        h: "Three layers between data and a fill",
        p: [
          "The scanning layer is planetary-scale and indiscriminate: satellite imagery of ports and parking lots, shipping manifests, power-grid draw, options skew, dark-pool prints, yield-curve microstructure, weather systems, geopolitical risk feeds, and the drift in central-bank language between two otherwise identical statements.",
          "The fusion layer is where the swarm earns its keep. Self-evolving model populations compete on out-of-sample prediction; losers are culled, winners breed variants. What survives is a small set of conviction scores per strategy — each one an opinion with a confidence interval, not a black-box oracle.",
          "The execution layer turns conviction into orders sized for your account, routed to your own brokerage, in microseconds. It also enforces the risk budget: when realized volatility spikes, gross exposure comes down mechanically, before a human could finish reading the alert.",
        ],
      },
      {
        h: "Why we publish this",
        p: [
          "None of this architecture is a secret worth keeping — the edge is in the execution of the process, not the existence of it. Publishing how the machine works is part of the same bet the whole company makes: that transparency compounds faster than mystique.",
        ],
      },
    ],
  },
];

export function BlogIndex() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Blog"
        titleDim="Signal,"
        title="not noise"
        intro="How the machine works, why the numbers are shaped the way they are, and what we believe about money — written by the people who build it."
      />
      <section style={{ backgroundColor: "#FFFFFF", padding: "72px 24px", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
        <div className="mx-auto grid max-w-[1100px] grid-cols-1 gap-6 md:grid-cols-2">
          {POSTS.map((p, i) => (
            <FadeUp key={p.slug} delay={i * 0.06}>
              <Link
                to={`/blog/${p.slug}`}
                className="block h-full rounded-2xl border border-black/10 bg-[#F7F7F5] p-8 transition-shadow hover:shadow-lg"
                style={{ textDecoration: "none" }}
              >
                <div className="flex items-center gap-3 text-[12px]" style={{ fontWeight: 600 }}>
                  <span
                    className="rounded-full px-3 py-1"
                    style={{ backgroundColor: "rgba(95,112,82,0.12)", color: "#5F7052" }}
                  >
                    {p.tag}
                  </span>
                  <span style={{ color: "rgba(0,0,0,0.35)", fontWeight: 500 }}>
                    {p.date} · {p.minutes} min
                  </span>
                </div>
                <h2
                  className="font-display mt-5 text-[24px] sm:text-[28px]"
                  style={{ lineHeight: 1.15, letterSpacing: "-0.5px", color: "#05050C", margin: "20px 0 0" }}
                >
                  {p.title}
                </h2>
                <p className="mt-3 text-[14.5px]" style={{ fontWeight: 500, color: "rgba(0,0,0,0.50)", lineHeight: 1.6 }}>
                  {p.dek}
                </p>
                <span className="mt-5 inline-block text-[13px]" style={{ fontWeight: 600, color: "#05050C" }}>
                  Read article →
                </span>
              </Link>
            </FadeUp>
          ))}
        </div>
      </section>
      <CtaBand />
    </PageShell>
  );
}

export function BlogPost() {
  const { slug } = useParams();
  const post = POSTS.find((p) => p.slug === slug) ?? POSTS[0];
  return (
    <PageShell>
      <article>
        <header style={{ padding: "96px 24px 56px" }}>
          <div className="mx-auto max-w-[720px]">
            <FadeUp>
              <div className="flex items-center gap-3 text-[12px]" style={{ fontWeight: 600 }}>
                <Link to="/blog" style={{ color: "#5F7052", textDecoration: "none" }}>
                  ← Blog
                </Link>
                <span style={{ color: "rgba(0,0,0,0.35)", fontWeight: 500 }}>
                  {post.tag} · {post.date} · {post.minutes} min read
                </span>
              </div>
              <h1
                className="mt-6 text-[34px] sm:text-[44px]"
                style={{ fontWeight: 500, letterSpacing: "-1px", lineHeight: 1.08, color: "#05050C" }}
              >
                {post.title}
              </h1>
              <p className="mt-4 text-[16px] sm:text-[18px]" style={{ fontWeight: 500, color: "rgba(0,0,0,0.45)", lineHeight: 1.55 }}>
                {post.dek}
              </p>
            </FadeUp>
          </div>
        </header>
        <div style={{ backgroundColor: "#FFFFFF", borderTop: "1px solid rgba(0,0,0,0.06)", padding: "56px 24px 80px" }}>
          <div className="mx-auto max-w-[680px]">
            {post.body.map((sec, i) => (
              <FadeUp key={i} delay={Math.min(i * 0.04, 0.12)}>
                {sec.h && (
                  <h2
                    className="mt-10 text-[22px] sm:text-[25px]"
                    style={{ fontWeight: 500, letterSpacing: "-0.4px", color: "#05050C", margin: "40px 0 0" }}
                  >
                    {sec.h}
                  </h2>
                )}
                {sec.p.map((para, j) => (
                  <p
                    key={j}
                    className="mt-5 text-[15.5px]"
                    style={{ fontWeight: 500, color: "rgba(0,0,0,0.62)", lineHeight: 1.75 }}
                  >
                    {para}
                  </p>
                ))}
              </FadeUp>
            ))}
          </div>
        </div>
      </article>
      <CtaBand title="See the machine for yourself." />
    </PageShell>
  );
}
