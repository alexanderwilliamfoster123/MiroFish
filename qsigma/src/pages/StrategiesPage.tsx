import PageShell, { PageHero, CtaBand } from "@/components/qsigma/PageShell";
import Strategies from "@/components/qsigma/Strategies";
import Calculator from "@/components/qsigma/Calculator";

export default function StrategiesPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Strategies"
        titleDim="Every portfolio,"
        title="every number, audited"
        intro="Two flagships, seven specialist portfolios, and three politician trackers — each with live NAV, full factsheet, and an independent audit link."
      />
      <Strategies />
      <Calculator />
      <CtaBand title="Pick one. Or run them all." sub="One fee covers every strategy — change allocations any time." />
    </PageShell>
  );
}
