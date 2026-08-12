import { cn } from "@/lib/utils";
import logoBlack from "@/assets/paktos-logo-black.svg";

// Official Paktos lockup from the brand logo kit. Per the kit's guidelines the
// icon and wordmark must not be separated, recoloured, or restyled.
export function PaktosLogo({ className }: { className?: string }) {
  return (
    <img
      src={logoBlack}
      alt="Paktos"
      className={cn("block w-[190px] h-auto", className)}
    />
  );
}
