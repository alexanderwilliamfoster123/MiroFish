import { mountBusinessCards } from "@/components/vendor/business-cards/business-cards.js";
import "@/components/vendor/business-cards/business-cards.css";
import { useEffect, useRef } from "react";

export interface Business {
  name: string;
  tagline?: string;
  url?: string;
}

// React mount for the vendored 3D card gallery (drag / wheel / arrow keys to
// browse, click a card to inspect with orbit + zoom, "visit" opens the url).
export function BusinessCards3D({ businesses }: { businesses: Business[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const app = mountBusinessCards(containerRef.current, {
      businesses,
      background: "transparent",
      theme: "dark",
      fontFamily: "Inter, sans-serif",
      linkLabel: "visit ↗",
    });
    return () => app.destroy();
  }, [businesses]);

  return <div ref={containerRef} className="h-full w-full" />;
}
