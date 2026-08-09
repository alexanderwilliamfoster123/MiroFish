interface PageShellProps {
  eyebrow: string;
  title: string;
  intro?: string;
  children: React.ReactNode;
}

export function PageShell({ eyebrow, title, intro, children }: PageShellProps) {
  return (
    <main className="mx-auto w-full max-w-2xl px-6 pt-24 pb-40">
      <p
        className="animate-fade-up text-[11px] tracking-[0.25em] text-faint uppercase"
        style={{ animationDelay: "0.05s" }}
      >
        {eyebrow}
      </p>
      <h1
        className="animate-fade-up mt-4 font-serif text-4xl font-light leading-tight"
        style={{ animationDelay: "0.15s" }}
      >
        {title}
      </h1>
      {intro && (
        <p
          className="animate-fade-up mt-5 max-w-md text-[15px] font-light leading-relaxed text-muted-foreground"
          style={{ animationDelay: "0.25s" }}
        >
          {intro}
        </p>
      )}
      <div className="animate-fade-up mt-12" style={{ animationDelay: "0.35s" }}>
        {children}
      </div>
    </main>
  );
}
