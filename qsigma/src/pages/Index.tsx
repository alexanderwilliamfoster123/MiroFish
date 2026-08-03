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
import TakeControl from "../components/qsigma/TakeControl";
import Footer from "../components/qsigma/Footer";
import AuthModal from "../components/qsigma/AuthModal";

const Index = () => {
  const [dark, setDark] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

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
      <h1 className="sr-only">QSigma — A New Standard in Wealth Management</h1>
      <Navbar dark={dark} onLaunch={() => setAuthOpen(true)} />
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
          <TakeControl onRequestAccess={() => setAuthOpen(true)} />
          <Footer />
        </div>
      </div>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </main>
  );
};

export default Index;
