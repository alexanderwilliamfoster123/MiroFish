import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import Hero from "@/components/synex/Hero";
import Navbar from "@/components/synex/Navbar";
import WealthIntelligence from "@/components/synex/WealthIntelligence";
import CapitalSignals from "@/components/synex/CapitalSignals";
import IntelligenceLayers from "@/components/synex/IntelligenceLayers";
import Integrations from "@/components/synex/Integrations";
import WhySynex from "@/components/synex/WhySynex";
import TakeControl from "@/components/synex/TakeControl";
import Footer from "@/components/synex/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Synex — A New Standard in Wealth Management" },
      {
        name: "description",
        content:
          "Quietly engineered software for stewards of capital — clarity, compounding, and craft, in one calm surface.",
      },
      { property: "og:title", content: "Synex — A New Standard in Wealth Management" },
      {
        property: "og:description",
        content:
          "Quietly engineered software for stewards of capital — clarity, compounding, and craft, in one calm surface.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      // Switch to dark when white section has fully covered the hero
      const trigger = window.innerHeight - 80;
      setDark(window.scrollY >= trigger);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <main>
      <h1 className="sr-only">Synex — A New Standard in Wealth Management</h1>
      <Navbar dark={dark} />
      <div className="relative">
        <div className="sticky top-0 z-0" style={{ height: "calc(100vh + 80px)" }}>
          <Hero />
        </div>
        <WealthIntelligence />
        <CapitalSignals />
        <IntelligenceLayers />
        <Integrations />
        <WhySynex />
        <TakeControl />
        <Footer />
      </div>
    </main>
  );
}
