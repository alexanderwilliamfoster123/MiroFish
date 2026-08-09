// A pressed wax seal, monogrammed AW. Irregular blob edge, embossed rim and
// lettering — bone wax so it sits inside the site's monochrome world.

export function WaxSeal({
  size = 44,
  className = "",
  rotate = 0,
}: {
  size?: number;
  className?: string;
  rotate?: number;
}) {
  return (
    <div
      className={className}
      style={{ width: size, height: size, transform: `rotate(${rotate}deg)` }}
      aria-hidden="true"
    >
      <div
        className="relative h-full w-full"
        style={{
          borderRadius: "46% 54% 51% 49% / 53% 46% 54% 47%",
          background:
            "radial-gradient(circle at 32% 26%, #e9e3d5 0%, #cfc7b5 38%, #a89f8b 78%, #8f8672 100%)",
          boxShadow:
            "0 3px 8px rgba(0,0,0,0.55), inset 0 2px 3px rgba(255,255,255,0.5), inset 0 -3px 5px rgba(0,0,0,0.28)",
        }}
      >
        {/* drips */}
        <div
          className="absolute -right-[6%] top-[58%] h-[26%] w-[26%]"
          style={{
            borderRadius: "60% 40% 55% 45% / 50% 55% 45% 50%",
            background: "radial-gradient(circle at 35% 30%, #ddd5c4, #a89f8b)",
            boxShadow: "0 2px 4px rgba(0,0,0,0.4)",
          }}
        />
        <div
          className="absolute -left-[4%] top-[20%] h-[18%] w-[18%]"
          style={{
            borderRadius: "50% 50% 45% 55% / 55% 45% 55% 45%",
            background: "radial-gradient(circle at 35% 30%, #ddd5c4, #a89f8b)",
          }}
        />
        {/* pressed ring */}
        <div
          className="absolute inset-[13%]"
          style={{
            borderRadius: "48% 52% 50% 50% / 51% 49% 52% 48%",
            boxShadow:
              "inset 0 1px 3px rgba(0,0,0,0.35), inset 0 -1px 2px rgba(255,255,255,0.35)",
          }}
        />
        {/* monogram */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="font-serif italic"
            style={{
              fontSize: size * 0.34,
              letterSpacing: "0.02em",
              color: "#7c7361",
              textShadow:
                "0 1px 0 rgba(255,255,255,0.55), 0 -1px 1px rgba(0,0,0,0.45)",
            }}
          >
            AW
          </span>
        </div>
      </div>
    </div>
  );
}
