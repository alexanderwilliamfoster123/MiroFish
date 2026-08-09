import { WelcomeScript } from "@/components/welcome-script";

interface HomePageProps {
  email: string;
  onLeave: () => void;
}

export function HomePage({ email, onLeave }: HomePageProps) {
  return (
    <main className="animate-fade-in min-h-dvh w-full">
      <WelcomeScript email={email} />
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
