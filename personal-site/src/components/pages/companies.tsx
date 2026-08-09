import { BusinessCards3D } from "@/components/ui/business-cards-3d";
import { useMemo } from "react";

export function CompaniesPage() {
  // One entry per 3D card, left to right.
  const businesses = useMemo(
    () => [
      { name: "Vertus", tagline: "", url: "https://vertus.ai" },
      { name: "Vanquish", tagline: "", url: "https://example.com" },
      { name: "Alexander William", tagline: "", url: "https://example.com" },
    ],
    [],
  );

  return (
    <main className="flex min-h-dvh w-full flex-col">
      <header className="mx-auto w-full max-w-3xl px-6 pt-20">
        <p className="animate-fade-up text-[11px] tracking-[0.25em] text-faint uppercase">
          Companies
        </p>
        <h1
          className="animate-fade-up mt-3 font-serif text-3xl font-light"
          style={{ animationDelay: "0.1s" }}
        >
          The card series
        </h1>
      </header>
      <div
        className="animate-fade-in mt-2 h-[calc(100dvh-230px)] min-h-[430px] w-full"
        style={{ animationDelay: "0.2s" }}
      >
        <BusinessCards3D businesses={businesses} />
      </div>
    </main>
  );
}
