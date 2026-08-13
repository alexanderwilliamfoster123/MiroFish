import { Dock, DockIcon, DockItem, DockLabel } from "@/components/ui/dock";
import { AtSign, Camera, Feather } from "lucide-react";

const ITEMS = [
  { title: "writing", icon: Feather },
  { title: "pictures", icon: Camera },
  { title: "socials", icon: AtSign },
];

interface WorldProps {
  onLeave: () => void;
}

export function World({ onLeave }: WorldProps) {
  return (
    <main className="relative min-h-dvh w-full">
      <button
        type="button"
        onClick={onLeave}
        className="fixed top-5 right-6 z-50 cursor-pointer text-[11px] tracking-[0.2em] text-faint transition-colors duration-300 hover:text-foreground"
      >
        leave
      </button>

      <div className="flex min-h-dvh items-center justify-center">
        <p className="animate-fade-in text-[12px] tracking-[0.3em] text-faint">
          alexander foster
        </p>
      </div>

      {/* the dock */}
      <div className="fixed bottom-4 left-1/2 z-50 max-w-full -translate-x-1/2">
        <Dock className="items-end border border-white/10 bg-neutral-950/80 pb-3 shadow-[0_8px_30px_rgba(0,0,0,0.6)] backdrop-blur-md">
          {ITEMS.map((item) => (
            <DockItem
              key={item.title}
              className="aspect-square rounded-full border border-white/10 bg-neutral-900"
            >
              <DockLabel className="border-white/10 bg-neutral-900 text-neutral-200">
                {item.title}
              </DockLabel>
              <DockIcon>
                <item.icon className="h-full w-full text-neutral-400" />
              </DockIcon>
            </DockItem>
          ))}
        </Dock>
      </div>
    </main>
  );
}
