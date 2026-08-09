import { DockNav } from "@/components/dock-nav";
import { EmailGate } from "@/components/email-gate";
import { CompaniesPage } from "@/components/pages/companies";
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
  const [section, setSection] = useState<Section>("home");

  useEffect(() => {
    if (email) {
      localStorage.setItem(STORAGE_KEY, email);
    } else {
      localStorage.removeItem(STORAGE_KEY);
      setSection("home");
    }
  }, [email]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
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
        {section === "home" && (
          <HomePage email={email} onLeave={() => setEmail(null)} />
        )}
        {section === "companies" && <CompaniesPage />}
        {section === "letters" && <LettersPage />}
        {section === "pictures" && <PicturesPage />}
        {section === "movies" && <MoviesPage />}
      </div>
      <DockNav active={section} onNavigate={setSection} />
    </>
  );
}
