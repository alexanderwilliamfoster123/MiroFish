import Hero from "../components/qsigma/Hero";
import StatsBar from "../components/qsigma/StatsBar";
import Strategies from "../components/qsigma/Strategies";
import HowItWorks from "../components/qsigma/HowItWorks";
import Performance from "../components/qsigma/Performance";
import Calculator from "../components/qsigma/Calculator";
import Comparison from "../components/qsigma/Comparison";
import Pricing from "../components/qsigma/Pricing";
import CtaSection from "../components/qsigma/CtaSection";
import Footer from "../components/qsigma/Footer";

const Index = () => {
  return (
    <main>
      <h1 className="sr-only">QSigma — A New Standard in Wealth Management</h1>
      <Hero />
      <StatsBar />
      <Strategies />
      <HowItWorks />
      <Performance />
      <Calculator />
      <Comparison />
      <Pricing />
      <CtaSection />
      <Footer />
    </main>
  );
};

export default Index;
