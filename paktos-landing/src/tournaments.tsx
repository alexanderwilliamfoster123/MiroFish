import * as React from "react";
import NumberFlow from "@number-flow/react";
import { PaktosLogo } from "@/components/paktos-logo";
import coinCyan from "@/assets/coins/coin-cyan.png";
import coinBlue from "@/assets/coins/coin-blue.png";
import coinYellow from "@/assets/coins/coin-yellow.png";
import coinOrange from "@/assets/coins/coin-orange.png";
import coinPink from "@/assets/coins/coin-pink.png";
import coinNavy from "@/assets/coins/coin-navy.png";

// ——— Simulated ticket sales ———
// Wire these to the real tournament API when it exists: each sale event
// should bump the pool and call spawnCoin() once.
const TICKET_VALUE = 25;
const STARTING_POOL = 48_650;
const STARTING_TICKETS = 1_946;
const MILESTONES = [50_000, 75_000, 100_000, 150_000, 250_000];

const FEED_HANDLES = [
  "marcusfx",
  "elenatrades",
  "kwame_k",
  "sofia_m",
  "jayminalpha",
  "lena_cap",
  "tomdelta",
  "priyaswing",
  "nikoscalp",
  "avamacro",
];

function fmtShort(v: number): string {
  return v >= 1000 ? `$${Math.round(v / 1000)}K` : `$${v}`;
}

// ——— The coin jar: a small 2D physics sim on a canvas ———

interface Coin {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  /** small per-coin hue shift in degrees, for variety in the pile */
  hue: number;
  /** which sprite this coin uses (index into SPRITE_URLS) */
  face: number;
  rot: number;
  vr: number;
  /** 0 = solid; >0 = dissolving out of the pile (oldest coins) */
  dis: number;
}

// The actual brand coin renders, cut from the hero animation frames.
const SPRITE_URLS = [
  coinCyan,
  coinBlue,
  coinYellow,
  coinOrange,
  coinPink,
  coinNavy,
];
// Cumulative pick weights — dark navy stays the rare one, like the video.
const FACE_WEIGHTS = [0.2, 0.38, 0.56, 0.72, 0.88, 1];

function pickFace(): number {
  const roll = Math.random();
  for (let i = 0; i < FACE_WEIGHTS.length; i++) {
    if (roll <= FACE_WEIGHTS[i]) return i;
  }
  return 0;
}

const MAX_COINS = 90;
const GRAVITY = 2600;

interface JarHandle {
  spawn: () => void;
}

const CoinJar = React.forwardRef<JarHandle, { tier: number }>(function CoinJar(
  { tier },
  ref
) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const coinsRef = React.useRef<Coin[]>([]);
  const pendingRef = React.useRef(0);
  const tierRef = React.useRef(tier);
  const scaleRef = React.useRef(1);
  tierRef.current = tier;

  React.useImperativeHandle(ref, () => ({
    spawn: () => {
      pendingRef.current += 1;
    },
  }));

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let last = performance.now();
    let width = 0;
    let height = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const sprites = SPRITE_URLS.map((url) => {
      const img = new Image();
      img.src = url;
      return img;
    });

    const drawCoin = (coin: Coin) => {
      const scale = 1 - coin.dis;
      if (scale <= 0) return;
      const r = coin.r * scale;
      const img = sprites[coin.face];
      ctx.save();
      ctx.translate(coin.x, coin.y);
      ctx.rotate(coin.rot);
      if (img.complete && img.naturalWidth > 0) {
        // slight per-coin hue shift for extra variety in the pile
        if (coin.hue !== 0 && "filter" in ctx) {
          ctx.filter = `hue-rotate(${coin.hue}deg)`;
        }
        ctx.drawImage(img, -r, -r, r * 2, r * 2);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fillStyle = "#dcdce2";
        ctx.fill();
      }
      ctx.restore();
    };

    const step = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.032);
      last = now;

      // jar grows a size each milestone tier
      const targetScale = Math.min(1 + tierRef.current * 0.12, 1.5);
      scaleRef.current += (targetScale - scaleRef.current) * 0.04;

      const jarW = Math.min(width * 0.66, 320) * scaleRef.current;
      const jarH = Math.min(height * 0.62, 250) * scaleRef.current;
      const jarLeft = (width - jarW) / 2;
      const jarRight = jarLeft + jarW;
      const jarBottom = height - 20;
      const jarTop = jarBottom - jarH;

      const coins = coinsRef.current;

      // spawn queued coins through the mouth of the jar
      while (pendingRef.current > 0) {
        pendingRef.current -= 1;
        const r = 12.5 + Math.random() * 4;
        coins.push({
          x: jarLeft + jarW * (0.3 + Math.random() * 0.4),
          y: Math.max(jarTop - 46, 18),
          vx: (Math.random() - 0.5) * 120,
          vy: reduceMotion ? 600 : 40,
          r,
          hue: Math.round((Math.random() - 0.5) * 16),
          face: pickFace(),
          rot: (Math.random() - 0.5) * 0.9,
          vr: (Math.random() - 0.5) * 1.6,
          dis: 0,
        });
        // dissolve the oldest coins once the jar is at capacity
        const alive = coins.filter((c) => c.dis === 0);
        if (alive.length > MAX_COINS) alive[0].dis = 0.0001;
      }

      // integrate
      for (const coin of coins) {
        if (coin.dis > 0) {
          coin.dis = Math.min(coin.dis + dt * 2.4, 1);
          continue;
        }
        coin.vy += GRAVITY * dt;
        coin.x += coin.vx * dt;
        coin.y += coin.vy * dt;
        coin.rot += coin.vr * dt;
        coin.vx *= 0.995;

        if (coin.y + coin.r > jarBottom) {
          coin.y = jarBottom - coin.r;
          coin.vy *= -0.18;
          coin.vx *= 0.82;
          coin.vr *= 0.85;
        }
        // walls only apply once the coin is at or below the mouth
        if (coin.y + coin.r > jarTop) {
          if (coin.x - coin.r < jarLeft) {
            coin.x = jarLeft + coin.r;
            coin.vx *= -0.3;
          } else if (coin.x + coin.r > jarRight) {
            coin.x = jarRight - coin.r;
            coin.vx *= -0.3;
          }
        }
      }

      // coin-on-coin collisions, a few relaxation passes
      const solid = coins.filter((c) => c.dis === 0);
      for (let pass = 0; pass < 3; pass++) {
        for (let i = 0; i < solid.length; i++) {
          for (let j = i + 1; j < solid.length; j++) {
            const a = solid[i];
            const b = solid[j];
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const min = a.r + b.r;
            const distSq = dx * dx + dy * dy;
            if (distSq >= min * min || distSq === 0) continue;
            const dist = Math.sqrt(distSq);
            const overlap = (min - dist) / 2;
            const nx = dx / dist;
            const ny = dy / dist;
            a.x -= nx * overlap;
            a.y -= ny * overlap;
            b.x += nx * overlap;
            b.y += ny * overlap;
            const rvx = b.vx - a.vx;
            const rvy = b.vy - a.vy;
            const velAlongNormal = rvx * nx + rvy * ny;
            if (velAlongNormal < 0) {
              const impulse = -0.55 * velAlongNormal;
              a.vx -= impulse * nx;
              a.vy -= impulse * ny;
              b.vx += impulse * nx;
              b.vy += impulse * ny;
            }
          }
        }
      }

      // pile pressure can shove coins through the walls during the
      // relaxation passes — clamp everything back inside the jar
      for (const coin of solid) {
        if (coin.y + coin.r > jarBottom) {
          coin.y = jarBottom - coin.r;
          if (coin.vy > 0) coin.vy = 0;
        }
        if (coin.y + coin.r > jarTop) {
          if (coin.x - coin.r < jarLeft) coin.x = jarLeft + coin.r;
          else if (coin.x + coin.r > jarRight) coin.x = jarRight - coin.r;
        }
      }

      coinsRef.current = coins.filter((c) => c.dis < 1);

      // ——— render ———
      ctx.clearRect(0, 0, width, height);

      // glass jar
      const cornerR = 26 * scaleRef.current;
      ctx.beginPath();
      ctx.moveTo(jarLeft, jarTop);
      ctx.lineTo(jarLeft, jarBottom - cornerR);
      ctx.arcTo(jarLeft, jarBottom, jarLeft + cornerR, jarBottom, cornerR);
      ctx.lineTo(jarRight - cornerR, jarBottom);
      ctx.arcTo(jarRight, jarBottom, jarRight, jarBottom - cornerR, cornerR);
      ctx.lineTo(jarRight, jarTop);
      ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
      ctx.fill();
      ctx.lineWidth = 2;
      const glass = ctx.createLinearGradient(jarLeft, 0, jarRight, 0);
      glass.addColorStop(0, "#d6d6dd");
      glass.addColorStop(0.5, "#ebebf0");
      glass.addColorStop(1, "#d6d6dd");
      ctx.strokeStyle = glass;
      ctx.stroke();
      // rim highlights
      ctx.beginPath();
      ctx.moveTo(jarLeft - 5, jarTop);
      ctx.lineTo(jarLeft + 8, jarTop);
      ctx.moveTo(jarRight - 8, jarTop);
      ctx.lineTo(jarRight + 5, jarTop);
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.strokeStyle = "#c4c4cc";
      ctx.stroke();
      ctx.lineCap = "butt";

      for (const coin of coinsRef.current) drawCoin(coin);

      // glass sheen over the coins
      const sheen = ctx.createLinearGradient(jarLeft, jarTop, jarRight, jarBottom);
      sheen.addColorStop(0.28, "rgba(255,255,255,0)");
      sheen.addColorStop(0.44, "rgba(255,255,255,0.28)");
      sheen.addColorStop(0.58, "rgba(255,255,255,0)");
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(jarLeft, jarTop);
      ctx.lineTo(jarLeft, jarBottom - cornerR);
      ctx.arcTo(jarLeft, jarBottom, jarLeft + cornerR, jarBottom, cornerR);
      ctx.lineTo(jarRight - cornerR, jarBottom);
      ctx.arcTo(jarRight, jarBottom, jarRight, jarBottom - cornerR, cornerR);
      ctx.lineTo(jarRight, jarTop);
      ctx.closePath();
      ctx.clip();
      ctx.fillStyle = sheen;
      ctx.fillRect(jarLeft, jarTop, jarW, jarH);
      ctx.restore();

      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="h-[420px] w-full"
      aria-label="Prize pool jar filling with coins as tickets are sold"
    />
  );
});

// ——— The tournaments prize pool page ———

export default function TournamentsPage() {
  const [pool, setPool] = React.useState(STARTING_POOL);
  const [tickets, setTickets] = React.useState(STARTING_TICKETS);
  const [lastBuyer, setLastBuyer] = React.useState<string | null>(null);
  const [milestoneHit, setMilestoneHit] = React.useState<number | null>(null);
  const jarRef = React.useRef<JarHandle | null>(null);

  const tier = MILESTONES.filter((m) => pool >= m).length;
  const milestone = MILESTONES[Math.min(tier, MILESTONES.length - 1)];
  const prev = tier === 0 ? 0 : MILESTONES[tier - 1];
  const progress = Math.min((pool - prev) / (milestone - prev), 1);

  // Fill the jar on load to match progress toward the next milestone,
  // so the pile always reflects the number above it.
  React.useEffect(() => {
    const startTier = MILESTONES.filter((m) => STARTING_POOL >= m).length;
    const startPrev = startTier === 0 ? 0 : MILESTONES[startTier - 1];
    const startNext = MILESTONES[Math.min(startTier, MILESTONES.length - 1)];
    const seedCount = Math.round(
      ((STARTING_POOL - startPrev) / (startNext - startPrev)) * 70
    );
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 0; i < seedCount; i++) {
      timers.push(setTimeout(() => jarRef.current?.spawn(), 150 + i * 35));
    }
    return () => timers.forEach(clearTimeout);
  }, []);

  // Simulated live ticket sales — replace with the sales event stream.
  React.useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const sell = () => {
      setPool((p) => p + TICKET_VALUE);
      setTickets((t) => t + 1);
      setLastBuyer(
        FEED_HANDLES[Math.floor(Math.random() * FEED_HANDLES.length)]
      );
      jarRef.current?.spawn();
      timer = setTimeout(sell, 700 + Math.random() * 1800);
    };
    timer = setTimeout(sell, 800);
    return () => clearTimeout(timer);
  }, []);

  // milestone celebration banner
  const tierSeen = React.useRef(tier);
  React.useEffect(() => {
    if (tier > tierSeen.current) {
      tierSeen.current = tier;
      setMilestoneHit(MILESTONES[tier - 1]);
      const timer = setTimeout(() => setMilestoneHit(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [tier]);

  return (
    <main className="flex min-h-screen w-full flex-col items-center bg-white px-6 py-16">
      <PaktosLogo />

      <p className="mt-10 text-xs font-medium text-[#86868b]">
        London · March 2026
      </p>

      <p className="mt-12 text-[11px] font-medium uppercase tracking-[0.22em] text-[#86868b]">
        Live prize pool
      </p>
      <div className="mt-3 text-6xl font-semibold tabular-nums tracking-[-0.02em] text-[#1d1d1f] sm:text-7xl">
        <NumberFlow
          value={pool}
          format={{
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0,
          }}
        />
      </div>
      <p className="mt-3 text-sm text-[#86868b]">
        <span className="font-medium tabular-nums text-[#1d1d1f]">
          {tickets.toLocaleString()}
        </span>{" "}
        tickets sold
      </p>

      <div className="relative mt-10 w-full max-w-md overflow-hidden rounded-[28px] bg-[#f5f5f7]">
        {milestoneHit && (
          <div className="absolute inset-x-0 top-5 z-10 flex justify-center animate-in fade-in-0 zoom-in-95 duration-500">
            <span className="rounded-full bg-[#1d1d1f] px-4 py-1.5 text-xs font-medium text-white shadow-lg">
              {fmtShort(milestoneHit)} unlocked
            </span>
          </div>
        )}
        <CoinJar ref={jarRef} tier={tier} />
        <p className="pb-5 text-center text-xs text-[#86868b]">
          1 ticket = 1 coin · ${TICKET_VALUE}
        </p>
      </div>

      <div className="mt-8 w-full max-w-md">
        <div className="flex items-baseline justify-between text-xs">
          <span className="text-[#86868b]">{fmtShort(prev)}</span>
          <span className="font-medium text-[#1d1d1f]">
            Next milestone {fmtShort(milestone)}
          </span>
        </div>
        <div className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-[#e8e8ed]">
          <div
            className="h-full rounded-full bg-[#1d1d1f] transition-[width] duration-700 ease-out"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
        <div className="mt-4 flex justify-center gap-1.5">
          {MILESTONES.map((m) => (
            <span
              key={m}
              className={
                pool >= m
                  ? "rounded-full bg-[#1d1d1f] px-3 py-1 text-[11px] font-medium text-white"
                  : "rounded-full bg-[#f5f5f7] px-3 py-1 text-[11px] font-medium text-[#86868b]"
              }
            >
              {fmtShort(m)}
            </span>
          ))}
        </div>
      </div>

      <p className="mt-8 h-5 text-xs text-[#86868b]" aria-live="polite">
        {lastBuyer && (
          <span
            key={`${lastBuyer}-${tickets}`}
            className="inline-block animate-in fade-in-0 slide-in-from-bottom-1 duration-500"
          >
            <span className="font-medium text-[#1d1d1f]">@{lastBuyer}</span>{" "}
            just entered
          </span>
        )}
      </p>

      <div className="mt-12 grid w-full max-w-md grid-cols-3 gap-4 border-t border-[#e8e8ed] pt-7 text-center">
        <div>
          <p className="text-xs text-[#86868b]">Entry</p>
          <p className="mt-1.5 text-sm font-medium text-[#1d1d1f]">
            ${TICKET_VALUE}
          </p>
        </div>
        <div>
          <p className="text-xs text-[#86868b]">Starts</p>
          <p className="mt-1.5 text-sm font-medium text-[#1d1d1f]">Mar 2026</p>
        </div>
        <div>
          <p className="text-xs text-[#86868b]">Location</p>
          <p className="mt-1.5 text-sm font-medium text-[#1d1d1f]">London</p>
        </div>
      </div>
    </main>
  );
}
