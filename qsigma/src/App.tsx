import { useEffect, useState } from "react";
import { HashRouter, Route, Routes, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import PricingPage from "./pages/PricingPage";
import StrategiesPage from "./pages/StrategiesPage";
import { BlogIndex, BlogPost } from "./pages/Blog";
import { About, Careers, Newsroom } from "./pages/Company";
import { Terms, Privacy, Disclosures } from "./pages/Legal";
import { Support, Contact, Security, Payments, Rewards } from "./pages/SupportPages";
import AuthModal from "./components/qsigma/AuthModal";
import CheckoutModal from "./components/qsigma/CheckoutModal";
import { CHECKOUT_EVENT } from "@/lib/checkout";
import { AUTH_EVENT } from "@/lib/auth";

/** Jump to top on every route change (section scrolls are handled in-page). */
function ScrollManager() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);
  return null;
}

/** Auth + checkout modals live above the router so every page can open them. */
function GlobalModals() {
  const [authOpen, setAuthOpen] = useState(false);
  const [checkout, setCheckout] = useState<string | null>(null);
  const { pathname } = useLocation();

  // A route change means the user moved on — don't leave a modal floating over the new page.
  useEffect(() => {
    setAuthOpen(false);
    setCheckout(null);
  }, [pathname]);

  // Escape closes the auth modal (checkout handles its own).
  useEffect(() => {
    if (!authOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAuthOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [authOpen]);

  useEffect(() => {
    const onAuth = () => setAuthOpen(true);
    const onCheckout = (e: Event) => setCheckout((e as CustomEvent<{ name: string }>).detail.name);
    window.addEventListener(AUTH_EVENT, onAuth);
    window.addEventListener(CHECKOUT_EVENT, onCheckout);
    return () => {
      window.removeEventListener(AUTH_EVENT, onAuth);
      window.removeEventListener(CHECKOUT_EVENT, onCheckout);
    };
  }, []);

  return (
    <>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      <CheckoutModal portfolio={checkout} onClose={() => setCheckout(null)} />
    </>
  );
}

export default function App() {
  return (
    <HashRouter>
      <ScrollManager />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/strategies" element={<StrategiesPage />} />
        <Route path="/blog" element={<BlogIndex />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/about" element={<About />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/newsroom" element={<Newsroom />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/disclosures" element={<Disclosures />} />
        <Route path="/support" element={<Support />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/security" element={<Security />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/rewards" element={<Rewards />} />
        <Route path="*" element={<Index />} />
      </Routes>
      <GlobalModals />
    </HashRouter>
  );
}
