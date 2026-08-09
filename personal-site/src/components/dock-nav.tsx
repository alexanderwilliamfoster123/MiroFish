import { Dock, DockIcon, DockItem, DockLabel } from "@/components/ui/dock";
import type { Section } from "@/lib/sections";
import { cn } from "@/lib/utils";
import {
  Building2,
  Camera,
  Clapperboard,
  Feather,
  HomeIcon,
} from "lucide-react";

const ITEMS: Array<{ section: Section; title: string; icon: typeof HomeIcon }> =
  [
    { section: "home", title: "Home", icon: HomeIcon },
    { section: "companies", title: "Companies", icon: Building2 },
    { section: "letters", title: "Letters", icon: Feather },
    { section: "pictures", title: "Pictures", icon: Camera },
    { section: "movies", title: "Movies", icon: Clapperboard },
  ];

interface DockNavProps {
  active: Section;
  onNavigate: (section: Section) => void;
}

export function DockNav({ active, onNavigate }: DockNavProps) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-2 z-50">
      <div className="pointer-events-auto absolute bottom-0 left-1/2 max-w-full -translate-x-1/2">
        <Dock className="items-end border border-line/80 bg-white/80 pb-3 shadow-[0_8px_30px_rgba(0,0,0,0.06)] backdrop-blur-md">
          {ITEMS.map((item) => (
            <DockItem
              key={item.section}
              onClick={() => onNavigate(item.section)}
              className={cn(
                "aspect-square rounded-full border border-line/70 bg-gray-100 transition-colors",
                active === item.section && "border-foreground/30 bg-gray-200",
              )}
            >
              <DockLabel>{item.title}</DockLabel>
              <DockIcon>
                <item.icon
                  className={cn(
                    "h-full w-full",
                    active === item.section
                      ? "text-neutral-800"
                      : "text-neutral-500",
                  )}
                />
              </DockIcon>
            </DockItem>
          ))}
        </Dock>
      </div>
    </div>
  );
}
