import { WelcomeScript } from "@/components/welcome-script";
import { Instagram, Linkedin, Twitter, Youtube } from "lucide-react";

const SOCIALS = [
  { label: "instagram", href: "https://instagram.com/", icon: Instagram },
  { label: "x", href: "https://x.com/", icon: Twitter },
  { label: "linkedin", href: "https://linkedin.com/", icon: Linkedin },
  { label: "youtube", href: "https://youtube.com/", icon: Youtube },
];

interface HomePageProps {
  email: string;
  onLeave: () => void;
}

export function HomePage({ email, onLeave }: HomePageProps) {
  return (
    <main className="animate-fade-in min-h-dvh w-full">
      <WelcomeScript email={email} />

      {/* social media */}
      <section className="px-6 pb-44 sm:px-12">
        <p className="text-[11px] tracking-[0.25em] text-faint uppercase">
          Social media
        </p>
        <div className="mt-5 flex flex-wrap gap-x-8 gap-y-4">
          {SOCIALS.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-2.5 text-muted-foreground transition-colors duration-300 hover:text-foreground"
            >
              <social.icon size={16} strokeWidth={1.5} />
              <span className="text-[13px] lowercase tracking-wide">
                {social.label}
              </span>
              <span className="text-[11px] opacity-0 transition-opacity duration-300 group-hover:opacity-60">
                ↗
              </span>
            </a>
          ))}
        </div>
      </section>

      <button
        type="button"
        onClick={onLeave}
        className="fixed top-5 right-6 z-50 cursor-pointer text-[11px] tracking-[0.2em] text-faint uppercase transition-colors duration-300 hover:text-foreground"
      >
        leave
      </button>
    </main>
  );
}
