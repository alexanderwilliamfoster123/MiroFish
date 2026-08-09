import { useRef, useState } from "react";

// Recreation of the reference 3D business cards (dark rounded card, hairline
// inner frame, holographic triangle emblem, small technical labels) as a CSS
// card with pointer-driven 3D tilt. Colors mirror the reference decals:
// body #101114, cream rgba(235,233,228,.92), dim rgba(235,233,228,.45).

export interface BusinessCardProps {
  name: string;
  tagline?: string;
  url: string;
  index: number;
}

const CREAM = "rgba(235, 233, 228, 0.92)";
const DIM = "rgba(235, 233, 228, 0.45)";

export function BusinessCard({ name, tagline, url, index }: BusinessCardProps) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const [transform, setTransform] = useState(
    "perspective(900px) rotateX(0deg) rotateY(0deg)",
  );
  const [glare, setGlare] = useState({ x: 50, y: 50, visible: false });

  const handleMove = (e: React.MouseEvent) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rotateY = (px - 0.5) * 22;
    const rotateX = (0.5 - py) * 22;
    setTransform(
      `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(12px)`,
    );
    setGlare({ x: px * 100, y: py * 100, visible: true });
  };

  const handleLeave = () => {
    setTransform("perspective(900px) rotateX(0deg) rotateY(0deg)");
    setGlare((g) => ({ ...g, visible: false }));
  };

  const chip = `c-${String(index + 1).padStart(2, "0")}`;

  return (
    <a
      ref={cardRef}
      href={url}
      target="_blank"
      rel="noreferrer"
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      aria-label={`${name} — visit`}
      className="group block w-[228px] shrink-0 sm:w-[248px]"
      style={{
        transform,
        transition: "transform 0.25s cubic-bezier(0.22, 1, 0.36, 1)",
        transformStyle: "preserve-3d",
      }}
    >
      <div
        className="relative aspect-[5/7] w-full overflow-hidden rounded-[16px]"
        style={{
          background: "linear-gradient(160deg, #14151a 0%, #101114 55%, #0c0d10 100%)",
          boxShadow:
            "0 0 0 1px rgba(235, 233, 228, 0.07), 0 30px 60px rgba(0, 0, 0, 0.7), 0 10px 24px rgba(0, 0, 0, 0.5)",
        }}
      >
        {/* hairline inner frame */}
        <div
          className="pointer-events-none absolute inset-[7px] rounded-[11px]"
          style={{ boxShadow: "inset 0 0 0 1px rgba(235, 233, 228, 0.12)" }}
        />

        {/* top-left stack */}
        <div className="absolute top-5 left-5">
          <p className="text-[13px] lowercase" style={{ color: CREAM }}>
            {name}
          </p>
          <p className="mt-2 text-[10px] leading-[1.5] lowercase" style={{ color: DIM }}>
            business
            <br />
            card series
          </p>
        </div>

        {/* top-right index chip */}
        <p
          className="absolute top-5 right-5 font-mono text-[11px]"
          style={{ color: CREAM }}
        >
          {chip}
        </p>

        {/* holographic triangle emblem */}
        <div className="absolute inset-x-0 top-[38%] flex justify-center">
          <div
            className="animate-holo h-[74px] w-[84px] opacity-90 transition-transform duration-500 group-hover:scale-110"
            style={{
              clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
              background:
                "conic-gradient(from 210deg at 50% 60%, #8a8f98, #d8dade, #6f7480, #babdc4, #82868f, #e4e6ea, #8a8f98)",
              filter: "saturate(0.5)",
            }}
          />
        </div>

        {/* bottom block */}
        <div className="absolute bottom-5 left-5 right-5">
          <p className="text-[17px] lowercase" style={{ color: CREAM }}>
            {name}
          </p>
          {tagline ? (
            <p className="mt-1.5 text-[10px] lowercase" style={{ color: DIM }}>
              {tagline}
            </p>
          ) : null}
          <p
            className="mt-1.5 text-[10px] tracking-[0.18em] lowercase opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{ color: DIM }}
          >
            visit ↗
          </p>
        </div>

        {/* pointer glare */}
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            opacity: glare.visible ? 1 : 0,
            background: `radial-gradient(280px circle at ${glare.x}% ${glare.y}%, rgba(235, 233, 228, 0.08), transparent 60%)`,
          }}
        />
      </div>
    </a>
  );
}
