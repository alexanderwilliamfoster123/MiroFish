import { WelcomeScript } from "@/components/welcome-script";
import { ArrowUpRight } from "lucide-react";

const LINKS = [
  { label: "Email", href: "mailto:alex@vertus.ai", meta: "alex@vertus.ai" },
  {
    label: "GitHub",
    href: "https://github.com/alexanderwilliamfoster123",
    meta: "@alexanderwilliamfoster123",
  },
] as const;

interface HomePageProps {
  email: string;
  onLeave: () => void;
}

export function HomePage({ email, onLeave }: HomePageProps) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6">
      <div className="flex flex-1 flex-col justify-center pt-16 pb-40">
        <p
          className="animate-fade-up text-[11px] tracking-[0.25em] text-faint uppercase"
          style={{ animationDelay: "0.1s" }}
        >
          Welcome in
        </p>

        <h1
          className="animate-fade-up mt-6 font-serif text-4xl font-light leading-tight sm:text-5xl"
          style={{ animationDelay: "0.2s" }}
        >
          Alexander Foster
        </h1>

        <p
          className="animate-fade-up mt-6 max-w-sm text-[15px] font-light leading-relaxed text-muted-foreground"
          style={{ animationDelay: "0.35s" }}
        >
          I build quiet, careful software. Currently thinking about collective
          intelligence, simulation, and interfaces that stay out of the way.
          The dock below leads everywhere else.
        </p>

        <div
          className="animate-fade-up mt-10"
          style={{ animationDelay: "0.45s" }}
        >
          <WelcomeScript />
        </div>

        <div
          className="animate-fade-up mt-14 border-t border-line"
          style={{ animationDelay: "0.5s" }}
        >
          {LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.href.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              className="group flex items-baseline justify-between border-b border-line py-4 transition-colors duration-300 hover:border-foreground/40"
            >
              <span className="text-sm">{link.label}</span>
              <span className="flex items-center gap-1.5 text-[13px] font-light text-muted-foreground transition-colors duration-300 group-hover:text-foreground">
                {link.meta}
                <ArrowUpRight
                  size={13}
                  className="opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                />
              </span>
            </a>
          ))}
        </div>

        <footer className="animate-fade-in mt-10 flex items-center justify-between text-[11px] text-faint">
          <span>through the door as {email}</span>
          <button
            type="button"
            onClick={onLeave}
            className="cursor-pointer tracking-wide transition-colors duration-300 hover:text-foreground"
          >
            leave
          </button>
        </footer>
      </div>
    </main>
  );
}
