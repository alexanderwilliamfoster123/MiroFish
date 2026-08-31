import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import PageShell, { PageHero, PageSection, CtaBand } from "@/components/qsigma/PageShell";
import FadeUp from "@/components/qsigma/FadeUp";
import Faq from "@/components/qsigma/Faq";
import { openCheckout } from "@/lib/checkout";

/* ---------------------------------- Support ---------------------------------- */

const CHANNELS = [
  { t: "Email support", d: "For account, billing, and strategy questions. We answer within one business day — usually much faster.", a: "info@squaredq.com", href: "mailto:info@squaredq.com" },
  { t: "Priority line", d: "Members with active subscriptions get priority routing. Use the email on your welcome note and include your member ID.", a: "Included with All Access", href: "mailto:info@squaredq.com?subject=Priority%20support" },
  { t: "Security issues", d: "Suspected fraud, phishing, or a vulnerability? Skip the queue entirely.", a: "Report a security issue", href: "mailto:info@squaredq.com?subject=SECURITY" },
];

export function Support() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Support"
        titleDim="Real answers,"
        title="from real humans"
        intro="Most questions are answered below. For everything else, a person — not a bot — reads your message."
      />
      <PageSection white>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {CHANNELS.map((c, i) => (
            <FadeUp key={c.t} delay={i * 0.05}>
              <a href={c.href} className="block h-full rounded-2xl border border-black/10 bg-[#F7F7F5] p-7 transition-shadow hover:shadow-md" style={{ textDecoration: "none" }}>
                <h3 className="text-[16px]" style={{ fontWeight: 600, color: "#05050C", margin: 0 }}>{c.t}</h3>
                <p className="mt-3 text-[13.5px]" style={{ fontWeight: 500, color: "rgba(0,0,0,0.55)", lineHeight: 1.6 }}>{c.d}</p>
                <span className="mt-4 inline-block text-[13px]" style={{ fontWeight: 600, color: "#5F7052" }}>{c.a} →</span>
              </a>
            </FadeUp>
          ))}
        </div>
      </PageSection>
      <Faq />
      <CtaBand />
    </PageShell>
  );
}

/* ---------------------------------- Contact ---------------------------------- */

export function Contact() {
  const [sent, setSent] = useState(false);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    setSent(true);
  };
  const field = {
    width: "100%",
    fontFamily: "inherit",
    fontWeight: 500,
    fontSize: 14,
    color: "#05050C",
    backgroundColor: "#FFFFFF",
    border: "1px solid rgba(0,0,0,0.15)",
    borderRadius: 10,
    padding: "12px 14px",
    outline: "none",
  } as const;
  return (
    <PageShell>
      <PageHero
        eyebrow="Contact"
        titleDim="Talk to"
        title="Squared³"
        intro="Sales, press, partnerships, or just a hard question about the numbers — send it over."
      />
      <PageSection white narrow>
        {sent ? (
          <FadeUp>
            <div className="rounded-2xl border border-black/10 bg-[#F7F7F5] p-10 text-center">
              <h2 className="text-[24px]" style={{ fontWeight: 500, color: "#05050C", margin: 0 }}>Message sent</h2>
              <p className="mt-3 text-[14px]" style={{ fontWeight: 500, color: "rgba(0,0,0,0.50)" }}>
                A person will reply within one business day. Meanwhile, the{" "}
                <Link to="/support" style={{ color: "#5F7052" }}>support page</Link> answers the most common questions.
              </p>
            </div>
          </FadeUp>
        ) : (
          <FadeUp>
            <form onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-[13px]" style={{ fontWeight: 600, color: "rgba(0,0,0,0.60)" }}>
                Name
                <input required style={field} placeholder="Your name" />
              </label>
              <label className="flex flex-col gap-2 text-[13px]" style={{ fontWeight: 600, color: "rgba(0,0,0,0.60)" }}>
                Email
                <input required type="email" style={field} placeholder="you@example.com" />
              </label>
              <label className="flex flex-col gap-2 text-[13px] sm:col-span-2" style={{ fontWeight: 600, color: "rgba(0,0,0,0.60)" }}>
                Topic
                <select style={field} defaultValue="General">
                  <option>General</option>
                  <option>Sales</option>
                  <option>Press</option>
                  <option>Partnerships</option>
                  <option>Billing</option>
                </select>
              </label>
              <label className="flex flex-col gap-2 text-[13px] sm:col-span-2" style={{ fontWeight: 600, color: "rgba(0,0,0,0.60)" }}>
                Message
                <textarea required rows={6} style={{ ...field, resize: "vertical" }} placeholder="What's on your mind?" />
              </label>
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="h-11 px-7 rounded-full bg-black text-white text-[14px] font-semibold transition-colors hover:bg-zinc-800"
                  style={{ cursor: "pointer", border: "none" }}
                >
                  Send message
                </button>
                <p className="mt-3 text-[12.5px]" style={{ fontWeight: 500, color: "rgba(0,0,0,0.40)" }}>
                  Prefer email? <a href="mailto:info@squaredq.com" style={{ color: "#5F7052" }}>info@squaredq.com</a>
                </p>
              </div>
            </form>
          </FadeUp>
        )}
      </PageSection>
    </PageShell>
  );
}

/* ---------------------------------- Security ---------------------------------- */

const SEC_ROWS = [
  { t: "You keep custody — always", d: "Your money and positions live in your own account at Public.com, Alpaca, or Interactive Brokers. Squared³ holds execution-only permissions: we can place subscribed trades and nothing else. We cannot withdraw funds or change bank links." },
  { t: "Credentials never touch us", d: "Brokerage connections use each brokerage's own OAuth flow. Your username and password are entered on the brokerage's domain, not ours, and can be revoked from either side at any time." },
  { t: "Encryption everywhere", d: "TLS 1.3 in transit, AES-256 at rest, role-based access with hardware keys internally, and full audit logging on every administrative action." },
  { t: "Verified numbers", d: "Live performance is audited by an independent US CPA, and every factsheet links to an independent audit record. If a number can't be verified, it doesn't ship." },
];

const SCAM_RULES = [
  "We will never DM you first on WhatsApp, Telegram, Instagram, or X. We have no 'account managers' sliding into inboxes.",
  "We will never ask you to wire money, buy crypto, or send funds to any account. Your money goes to your own brokerage — never to us.",
  "We will never ask for your brokerage password, 2FA codes, or remote access to your device.",
  "Our only domains are squaredq.com and your brokerage's official apps. Bookmark them; don't trust lookalikes with extra letters.",
  "Guaranteed-return promises are the surest scam signal there is. Our own site says the opposite: investing involves risk.",
];

export function Security() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Security & Scams"
        titleDim="Paranoid"
        title="by design"
        intro="How we protect your account — and how to spot the people pretending to be us."
      />
      <PageSection white>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {SEC_ROWS.map((r, i) => (
            <FadeUp key={r.t} delay={i * 0.05}>
              <div className="h-full rounded-2xl border border-black/10 bg-[#F7F7F5] p-7">
                <h3 className="text-[16px]" style={{ fontWeight: 600, color: "#05050C", margin: 0 }}>{r.t}</h3>
                <p className="mt-3 text-[13.5px]" style={{ fontWeight: 500, color: "rgba(0,0,0,0.55)", lineHeight: 1.65 }}>{r.d}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </PageSection>
      <PageSection narrow>
        <FadeUp>
          <h2 className="text-[24px] sm:text-[28px]" style={{ fontWeight: 500, letterSpacing: "-0.5px", color: "#05050C" }}>
            Five things Squared³ will never do
          </h2>
          <p className="mt-2 text-[14px]" style={{ fontWeight: 500, color: "rgba(0,0,0,0.45)" }}>
            If you see any of these, it isn't us. Forward it to{" "}
            <a href="mailto:info@squaredq.com?subject=SECURITY" style={{ color: "#5F7052" }}>info@squaredq.com</a>.
          </p>
        </FadeUp>
        <div className="mt-6">
          {SCAM_RULES.map((s, i) => (
            <FadeUp key={i} delay={i * 0.04}>
              <div className="flex gap-4 border-b border-black/10 py-4">
                <span className="text-[15px]" style={{ fontWeight: 700, color: "#A85C50" }}>✕</span>
                <p className="text-[14.5px]" style={{ fontWeight: 500, color: "rgba(0,0,0,0.60)", lineHeight: 1.6, margin: 0 }}>{s}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </PageSection>
      <CtaBand />
    </PageShell>
  );
}

/* ---------------------------------- Payments ---------------------------------- */

export function Payments() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Payment methods"
        titleDim="Pay once,"
        title="see everything"
        intro="What you pay, what you never pay, and how the money moves."
      />
      <PageSection white narrow>
        <FadeUp>
          <div className="overflow-x-auto rounded-2xl border border-black/10">
            <table className="w-full" style={{ borderCollapse: "collapse", fontSize: 14 }}>
              <tbody>
                {[
                  ["Onboarding fee", "$2,497 — once, lifetime access to every strategy"],
                  ["Platform fee", "0.50% of connected AUM per month, billed on average assets"],
                  ["Performance fees", "None"],
                  ["Per-trade fees from Squared³", "None — brokerage commissions, if any, are your brokerage's"],
                  ["Lock-ups / exit fees", "None — disconnect any time; your funds never left your brokerage"],
                  ["Refunds", "Onboarding fee refundable within 30 days if no strategy was activated"],
                ].map(([k, v]) => (
                  <tr key={k} style={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
                    <td className="whitespace-nowrap px-6 py-4" style={{ fontWeight: 600, color: "#05050C" }}>{k}</td>
                    <td className="px-6 py-4" style={{ fontWeight: 500, color: "rgba(0,0,0,0.55)" }}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-6 text-[14px]" style={{ fontWeight: 500, color: "rgba(0,0,0,0.55)", lineHeight: 1.65 }}>
            We accept <strong>Visa</strong>, <strong>Mastercard</strong>, and <strong>PayPal</strong> for the onboarding fee;
            the monthly platform fee is billed to the same method. Card details are handled by our payment
            processor and never stored on Squared³ servers. Your invested capital is never part of any
            payment to us — it stays in your own brokerage account.
          </p>
          <button
            type="button"
            onClick={() => openCheckout("Squared³ All Access")}
            className="mt-6 h-11 px-7 rounded-full bg-black text-white text-[14px] font-semibold transition-colors hover:bg-zinc-800"
            style={{ cursor: "pointer", border: "none" }}
          >
            Get started
          </button>
        </FadeUp>
      </PageSection>
      <CtaBand />
    </PageShell>
  );
}

/* ---------------------------------- Rewards ---------------------------------- */

const REWARD_STEPS = [
  { n: "01", t: "Share your link", d: "Every member gets a personal referral link on their dashboard." },
  { n: "02", t: "They join", d: "Your referral gets $250 off the onboarding fee — a real discount, not a coupon dance." },
  { n: "03", t: "You're credited", d: "You receive $250 of platform-fee credit the day their account activates. No cap." },
];

export function Rewards() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Rewards"
        titleDim="Good words,"
        title="rewarded"
        intro="The only marketing we trust more than audits is a member telling a friend. So we pay for it — both sides."
      />
      <PageSection white>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {REWARD_STEPS.map((s, i) => (
            <FadeUp key={s.n} delay={i * 0.06}>
              <div className="h-full rounded-2xl border border-black/10 bg-[#F7F7F5] p-7">
                <span className="text-[12px]" style={{ fontWeight: 700, color: "#5F7052", letterSpacing: "0.1em" }}>{s.n}</span>
                <h3 className="mt-3 text-[17px]" style={{ fontWeight: 600, color: "#05050C", margin: "12px 0 0" }}>{s.t}</h3>
                <p className="mt-3 text-[13.5px]" style={{ fontWeight: 500, color: "rgba(0,0,0,0.55)", lineHeight: 1.6 }}>{s.d}</p>
              </div>
            </FadeUp>
          ))}
        </div>
        <FadeUp delay={0.2}>
          <p className="mt-8 text-[12.5px]" style={{ fontWeight: 500, color: "rgba(0,0,0,0.40)", lineHeight: 1.6 }}>
            Referral credit applies to platform fees only and has no cash value. Program terms may change
            with 30 days' notice; credits already earned are never clawed back.
          </p>
        </FadeUp>
      </PageSection>
      <CtaBand title="Not a member yet?" />
    </PageShell>
  );
}
