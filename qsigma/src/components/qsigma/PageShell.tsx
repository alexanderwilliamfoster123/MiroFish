import { ReactNode, useEffect } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import FadeUp from "./FadeUp";
import { openCheckout } from "@/lib/checkout";
import { openAuth } from "@/lib/auth";

const FONT = '"Satoshi", "Inter Tight", system-ui, sans-serif';

const DEFAULT_TITLE = "Squared³ — A New Standard in Algorithmic Trading";

/** Shared chrome for every subpage: solid navbar, content, sitemap footer. */
export default function PageShell({ children, title }: { children: ReactNode; title?: string }) {
  useEffect(() => {
    document.title = title ? `${title} — Squared³` : DEFAULT_TITLE;
    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, [title]);
  return (
    <main style={{ fontFamily: FONT, backgroundColor: "#F2F2F0" }}>
      <Navbar dark onLaunch={() => openAuth()} />
      <div style={{ paddingTop: 80 }}>{children}</div>
      <Footer />
    </main>
  );
}

/** Standard page opener: eyebrow, serif headline (dim first line), intro. */
export function PageHero({
  eyebrow,
  titleDim,
  title,
  intro,
}: {
  eyebrow: string;
  titleDim?: string;
  title: string;
  intro?: string;
}) {
  return (
    <header style={{ padding: "96px 24px 72px", backgroundColor: "#F2F2F0" }}>
      <div className="mx-auto max-w-[900px] text-center">
        <FadeUp>
          <p
            className="text-[12px] sm:text-[13px] md:text-[14px] mb-3 md:mb-4"
            style={{ fontWeight: 500, color: "rgba(0,0,0,0.50)" }}
          >
            {eyebrow}
          </p>
          <h1
            className="text-[36px] sm:text-[46px] md:text-[56px]"
            style={{ fontWeight: 500, letterSpacing: "-1.2px", lineHeight: 1.05 }}
          >
            {titleDim && (
              <span className="block" style={{ color: "rgba(0,0,0,0.20)" }}>
                {titleDim}
              </span>
            )}
            <span className="block" style={{ color: "#05050C" }}>
              {title}
            </span>
          </h1>
          {intro && (
            <p
              className="mx-auto mt-5 text-[15px] sm:text-[17px]"
              style={{ fontWeight: 500, color: "rgba(0,0,0,0.45)", maxWidth: "560px", lineHeight: 1.6 }}
            >
              {intro}
            </p>
          )}
        </FadeUp>
      </div>
    </header>
  );
}

/** Constrained content band. */
export function PageSection({
  children,
  white,
  narrow,
}: {
  children: ReactNode;
  white?: boolean;
  narrow?: boolean;
}) {
  return (
    <section
      style={{
        backgroundColor: white ? "#FFFFFF" : "#F2F2F0",
        padding: "72px 24px",
        borderTop: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <div className={`mx-auto ${narrow ? "max-w-[760px]" : "max-w-[1100px]"}`}>{children}</div>
    </section>
  );
}

/** Dark closing band with the two standard CTAs. */
export function CtaBand({
  title = "Operate at a new level.",
  sub = "One fee. Every strategy. Your own brokerage account.",
}: {
  title?: string;
  sub?: string;
}) {
  return (
    <section style={{ backgroundColor: "#05050C", padding: "88px 24px" }}>
      <div className="mx-auto max-w-[760px] text-center">
        <FadeUp>
          <h2
            className="text-[30px] sm:text-[38px] md:text-[44px]"
            style={{ fontWeight: 500, letterSpacing: "-1px", lineHeight: 1.1, color: "#FFFFFF" }}
          >
            {title}
          </h2>
          <p className="mt-4 text-[15px]" style={{ fontWeight: 500, color: "rgba(255,255,255,0.45)" }}>
            {sub}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => openCheckout("Squared³ All Access")}
              className="h-11 px-7 rounded-full bg-white text-[14px] font-semibold transition-colors hover:bg-[#E8E8E4]"
              style={{ color: "#05050C", cursor: "pointer", border: "none" }}
            >
              Get started
            </button>
            <button
              type="button"
              onClick={() => openAuth()}
              className="h-11 px-6 rounded-full text-[14px] font-semibold text-white/80 transition-colors hover:text-white"
              style={{ border: "1px solid rgba(255,255,255,0.25)", background: "none", cursor: "pointer" }}
            >
              Request access
            </button>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

/** Legal / long-form prose styling. */
export function Prose({ children }: { children: ReactNode }) {
  return (
    <div className="prose-legal">
      <style>{`
        .prose-legal h2 { font-size: 22px; font-weight: 500; letter-spacing: -0.4px; color: #05050C; margin: 40px 0 10px; }
        .prose-legal h3 { font-size: 16px; font-weight: 600; color: #05050C; margin: 26px 0 8px; font-family: inherit; }
        .prose-legal p, .prose-legal li { font-size: 14.5px; font-weight: 500; color: rgba(0,0,0,0.60); line-height: 1.7; }
        .prose-legal p { margin: 10px 0; }
        .prose-legal ul { padding-left: 22px; margin: 10px 0; }
        .prose-legal li { margin: 6px 0; }
        .prose-legal strong { color: rgba(0,0,0,0.80); font-weight: 600; }
      `}</style>
      {children}
    </div>
  );
}
