import { useEffect, useState } from "react";
import Hero from "../components/qsigma/Hero";
import Navbar from "../components/qsigma/Navbar";
import StatsBar from "../components/qsigma/StatsBar";
import WealthIntelligence from "../components/qsigma/WealthIntelligence";
import CapitalSignals from "../components/qsigma/CapitalSignals";
import IntelligenceLayers from "../components/qsigma/IntelligenceLayers";
import Integrations from "../components/qsigma/Integrations";
import WhyQSigma from "../components/qsigma/WhyQSigma";
import Strategies from "../components/qsigma/Strategies";
import Calculator from "../components/qsigma/Calculator";
import Pricing from "../components/qsigma/Pricing";
import Faq from "../components/qsigma/Faq";
import Press from "../components/qsigma/Press";
import TakeControl from "../components/qsigma/TakeControl";
import Footer from "../components/qsigma/Footer";
import { useLocation } from "react-router-dom";
import { openAuth } from "@/lib/auth";
import { scrollToId } from "@/lib/nav";

const Index = () => {
  const [dark, setDark] = useState(false);
  const location = useLocation();

  // Arriving from a subpage nav link: scroll to the requested section.
  useEffect(() => {
    const target = (location.state as { scrollTo?: string } | null)?.scrollTo;
    if (target) {
      const t = setTimeout(() => scrollToId(target), 120);
      return () => clearTimeout(t);
    }
  }, [location.state]);

  useEffect(() => {
    const onScroll = () => {
      // Switch to dark when the next section has fully covered the hero
      const trigger = window.innerHeight - 80;
      setDark(window.scrollY >= trigger);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <main>
      <h1 className="sr-only">Squared³ — A New Standard in Algorithmic Trading</h1>
      <Navbar dark={dark} onLaunch={() => openAuth()} />
      <div className="relative">
        <div className="sticky top-0 z-0" style={{ height: "calc(100vh + 80px)" }}>
          <Hero />
        </div>
        <div className="relative z-10">
          <StatsBar />
          <WealthIntelligence />
          <CapitalSignals />
          <IntelligenceLayers />
          <Integrations />
          <WhyQSigma />
          <Strategies />
          <Calculator />
          <Pricing />
          <Faq />
          <Press />
          <TakeControl onRequestAccess={() => openAuth()} />
          <Footer />
        </div>
      </div>
    </main>
  );
};

export default Index;
