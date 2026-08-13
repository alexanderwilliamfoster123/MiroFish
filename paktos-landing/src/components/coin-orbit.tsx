import type * as React from "react";
import coinCyan from "@/assets/coins/coin-cyan.png";
import coinBlue from "@/assets/coins/coin-blue.png";
import coinYellow from "@/assets/coins/coin-yellow.png";
import coinOrange from "@/assets/coins/coin-orange.png";
import coinPink from "@/assets/coins/coin-pink.png";
import coinNavy from "@/assets/coins/coin-navy.png";

// Ten brand coins orbiting clockwise, slow and calm. The ring spins while
// each coin counter-spins so the faces stay upright the whole way round.
const RING: { src: string; size: number }[] = [
  { src: coinNavy, size: 62 },
  { src: coinPink, size: 54 },
  { src: coinYellow, size: 58 },
  { src: coinOrange, size: 50 },
  { src: coinCyan, size: 60 },
  { src: coinBlue, size: 52 },
  { src: coinPink, size: 58 },
  { src: coinYellow, size: 50 },
  { src: coinCyan, size: 56 },
  { src: coinOrange, size: 54 },
];

const PERIOD = "90s";

export function CoinOrbit({ radius = 116 }: { radius?: number }) {
  const box = (radius + 34) * 2;
  return (
    <div
      aria-hidden="true"
      className="relative"
      style={{ width: box, height: box }}
    >
      <div
        className="absolute inset-0 motion-safe:animate-[coin-orbit_var(--p)_linear_infinite]"
        style={{ "--p": PERIOD } as React.CSSProperties}
      >
        {RING.map((coin, i) => {
          const angle = (i * 360) / RING.length;
          return (
            <div
              key={i}
              className="absolute left-1/2 top-1/2"
              style={{
                transform: `rotate(${angle}deg) translateY(-${radius}px)`,
              }}
            >
              <div
                className="motion-safe:animate-[coin-orbit-rev_var(--p)_linear_infinite]"
                style={{ "--p": PERIOD } as React.CSSProperties}
              >
                <img
                  src={coin.src}
                  alt=""
                  draggable={false}
                  className="max-w-none select-none"
                  style={{
                    width: coin.size,
                    height: coin.size,
                    marginLeft: -coin.size / 2,
                    marginTop: -coin.size / 2,
                    transform: `rotate(${-angle}deg)`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
