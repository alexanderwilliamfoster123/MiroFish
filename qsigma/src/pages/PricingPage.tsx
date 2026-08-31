import PageShell, { PageHero, CtaBand } from "@/components/qsigma/PageShell";
import Pricing from "@/components/qsigma/Pricing";
import WhyQSigma from "@/components/qsigma/WhyQSigma";
import Faq from "@/components/qsigma/Faq";

export default function PricingPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Pricing"
        titleDim="One number,"
        title="nothing behind it"
        intro="A single onboarding fee, a light monthly AUM fee, and a written promise: every fee disclosed before you pay anything."
      />
      <Pricing />
      <WhyQSigma />
      <Faq />
      <CtaBand />
    </PageShell>
  );
}
