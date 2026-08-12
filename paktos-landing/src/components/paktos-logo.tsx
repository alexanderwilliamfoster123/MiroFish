import { cn } from "@/lib/utils";
import logo1x from "@/assets/paktos-logo-black-380.png";
import logo2x from "@/assets/paktos-logo-black-760.png";

// Official Paktos lockup, downscaled from the 2000px master supplied by the
// brand. Icon and wordmark stay together per the brand guidelines.
export function PaktosLogo({ className }: { className?: string }) {
  return (
    <img
      src={logo1x}
      srcSet={`${logo1x} 1x, ${logo2x} 2x`}
      alt="Paktos"
      className={cn("block w-[190px] h-auto", className)}
    />
  );
}
