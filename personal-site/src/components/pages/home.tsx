import { BusinessCard } from "@/components/ui/business-card";

// One entry per card, left to right — same shape as the reference site.
const BUSINESSES = [
  { name: "vertus", tagline: "", url: "https://vertus.ai" },
  { name: "vanquish", tagline: "", url: "https://example.com" },
  { name: "alexander william", tagline: "", url: "https://example.com" },
];

interface HomePageProps {
  email: string;
  onLeave: () => void;
}

export function HomePage({ email, onLeave }: HomePageProps) {
  return (
    <main className="relative flex min-h-dvh w-full flex-col items-center justify-center px-6 pt-20 pb-44">
      <p className="fixed top-5 left-6 z-50 text-[11px] tracking-[0.22em] text-muted-foreground lowercase">
        alexander foster
      </p>
      <button
        type="button"
        onClick={onLeave}
        className="fixed top-5 right-6 z-50 cursor-pointer text-[11px] tracking-[0.2em] text-faint uppercase transition-colors duration-300 hover:text-foreground"
        title={`through the door as ${email}`}
      >
        leave
      </button>

      <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
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

      <p
        className="animate-fade-in mt-14 text-[11px] tracking-[0.18em] text-faint lowercase"
        style={{ animationDelay: "0.7s" }}
      >
        {BUSINESSES.length} cards · hover to inspect · select a card to visit
      </p>
    </main>
  );
}
