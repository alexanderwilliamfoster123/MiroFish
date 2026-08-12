import { cn } from "@/lib/utils";
import logo1x from "@/assets/paktos-logo-black-380.png";
import logo2x from "@/assets/paktos-logo-black-760.png";

// Official Paktos lockup from the brand logo kit. The kit's traced SVG has
// stair-stepped edges, so we serve edge-smoothed downscales of the 2048px
// master instead. Icon and wordmark stay together per the kit's guidelines.
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
