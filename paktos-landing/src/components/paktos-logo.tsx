import * as React from "react";
import { cn } from "@/lib/utils";

// Geometric stepped mark, drawn to echo the Paktos brand mark:
// two offset zigzag glyphs built from stacked step shapes.
const PaktosMark = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 48 48"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    {...props}
  >
    <path d="M6 8h12v8h-6v8H6V8z" />
    <path d="M18 16h8v8h8v8H24v-8h-6v-8z" />
    <path d="M34 32h8v8H30v-6h4v-2z" />
    <path d="M12 24h6v10h-6V24z" />
  </svg>
);

export function PaktosLogo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <PaktosMark className="h-9 w-9 text-foreground" />
      <span className="font-serif text-4xl tracking-tight text-foreground">
        Paktos
      </span>
    </div>
  );
}
