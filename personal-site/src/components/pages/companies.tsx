import { PageShell } from "@/components/pages/page-shell";
import { ArrowUpRight } from "lucide-react";

const COMPANIES = [
  {
    name: "Vertus AI",
    role: "Founder",
    description:
      "Building intelligence you can trust with real work. Quiet software, sharp results.",
    href: "https://vertus.ai",
    image:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop",
  },
  {
    name: "MiroFish",
    role: "Creator",
    description:
      "A collective-intelligence engine for predicting how groups of people behave.",
    href: "https://github.com/alexanderwilliamfoster123/mirofish",
    image:
      "https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=1200&auto=format&fit=crop",
  },
] as const;

export function CompaniesPage() {
  return (
    <PageShell
      eyebrow="Companies"
      title="Things I'm building"
      intro="The bets I'm making with my time. Each one is a long game."
    >
      <div className="grid gap-6 sm:grid-cols-2">
        {COMPANIES.map((company) => (
          <a
            key={company.name}
            href={company.href}
            target="_blank"
            rel="noreferrer"
            className="group overflow-hidden rounded-2xl border border-line bg-white transition-all duration-300 hover:border-foreground/25 hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)]"
          >
            <div className="aspect-[16/9] overflow-hidden">
              <img
                src={company.image}
                alt={company.name}
                loading="lazy"
                className="h-full w-full object-cover grayscale transition-all duration-700 group-hover:scale-[1.03] group-hover:grayscale-0"
              />
            </div>
            <div className="p-5">
              <div className="flex items-baseline justify-between">
                <h2 className="text-sm font-medium">{company.name}</h2>
                <span className="flex items-center gap-1 text-[11px] tracking-wide text-faint uppercase">
                  {company.role}
                  <ArrowUpRight
                    size={12}
                    className="opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  />
                </span>
              </div>
              <p className="mt-2 text-[13px] font-light leading-relaxed text-muted-foreground">
                {company.description}
              </p>
            </div>
          </a>
        ))}
      </div>
    </PageShell>
  );
}
