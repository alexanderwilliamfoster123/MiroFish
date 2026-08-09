import { EmailGate } from "@/components/email-gate";
import { CompaniesPage } from "@/components/pages/companies";
import { ContactPage } from "@/components/pages/contact";
import { HomePage } from "@/components/pages/home";
import { LettersPage } from "@/components/pages/letters";
import { MoviesPage } from "@/components/pages/movies";
import { PicturesPage } from "@/components/pages/pictures";
import { SubscriptionReceipt } from "@/components/subscription-receipt";
import type { Section } from "@/lib/sections";
import { useEffect, useState } from "react";

const STORAGE_KEY = "gate:email";

export default function App() {
  const [email, setEmail] = useState<string | null>(() =>
    localStorage.getItem(STORAGE_KEY),
  );
  const [showReceipt, setShowReceipt] = useState(false);
  const [section, setSection] = useState<Section>("console");

  useEffect(() => {
    if (email) {
      localStorage.setItem(STORAGE_KEY, email);
    } else {
      localStorage.removeItem(STORAGE_KEY);
      setSection("console");
    }
  }, [email]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [section]);

  // everything happens from the panel — esc always returns to it
  useEffect(() => {
    if (section === "console") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !e.defaultPrevented) setSection("console");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [section]);

  if (!email) {
    return (
      <EmailGate
        onEnter={(value) => {
          setEmail(value);
          setShowReceipt(true);
        }}
      />
    );
  }

  if (showReceipt) {
    return (
      <SubscriptionReceipt
        email={email}
        onContinue={() => setShowReceipt(false)}
      />
    );
  }

  return (
    <>
      {/* key remounts the page so the fade-up intro replays on navigation */}
      <div key={section} className="animate-fade-in">
        {section === "console" && (
          <ContactPage
            email={email}
            onNavigate={setSection}
            onLeave={() => setEmail(null)}
          />
        )}
        {section === "home" && (
          <HomePage email={email} onLeave={() => setEmail(null)} />
        )}
        {section === "companies" && <CompaniesPage />}
        {section === "letters" && <LettersPage />}
        {section === "pictures" && <PicturesPage />}
        {section === "movies" && <MoviesPage />}
      </div>

      {section !== "console" && (
        <button
          type="button"
          onClick={() => setSection("console")}
          className="fixed top-5 left-6 z-[60] cursor-pointer font-mono text-[11px] tracking-[0.18em] text-faint lowercase transition-colors duration-300 hover:text-foreground"
        >
          ↩ console
        </button>
      )}
    </>
  );
}
