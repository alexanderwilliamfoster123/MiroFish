import { PageShell } from "@/components/pages/page-shell";
import { BusinessCard } from "@/components/ui/business-card";

// One entry per card, left to right — same shape as the reference site.
const BUSINESSES = [
  { name: "vertus", tagline: "", url: "https://vertus.ai" },
  { name: "vanquish", tagline: "", url: "https://example.com" },
  { name: "alexander william", tagline: "", url: "https://example.com" },
];

export function CompaniesPage() {
  return (
    <PageShell
      eyebrow="Companies"
      title="The card series"
      intro="Three bets, printed on cardstock. Hover to inspect, select a card to visit."
    >
      <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-10">
        {BUSINESSES.map((business, index) => (
          <div
            key={business.name}
            className="animate-fade-up"
            style={{ animationDelay: `${0.15 + index * 0.12}s` }}
          >
            <BusinessCard
              name={business.name}
              tagline={business.tagline}
              url={business.url}
              index={index}
            />
          </div>
        ))}
      </div>
      <p className="mt-12 text-center text-[11px] tracking-[0.18em] text-faint lowercase">
        {BUSINESSES.length} cards · card series
      </p>
    </PageShell>
  );
}
