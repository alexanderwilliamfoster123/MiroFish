import * as React from "react";
import NumberFlow from "@number-flow/react";
import { PaktosLogo } from "@/components/paktos-logo";

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
  /** start angle of this coin's holographic rainbow sweep */
  hue: number;
  /** which face color this coin got (index into FACES) */
  face: number;
  rot: number;
  vr: number;
  /** 0 = solid; >0 = dissolving out of the pile (oldest coins) */
  dis: number;
}

// Saturated holographic faces, matching the brand coin renders:
// cyan, gold, pink, violet, peach, pearl, and the occasional dark navy.
const FACES: [string, string][] = [
  ["#2fd2f2", "#8df2ff"],
  ["#ffd257", "#ffeba6"],
  ["#ff96d3", "#ffcdea"],
  ["#a86df2", "#dcb0ff"],
  ["#ffb06a", "#ffdda1"],
  ["#efe3ee", "#ffffff"],
  ["#232338", "#40405e"],
];
const DARK_FACE = FACES.length - 1;
// Cumulative weights — vivid faces common, pearl and dark rarer.
const FACE_WEIGHTS = [0.18, 0.34, 0.5, 0.65, 0.8, 0.9, 1];

function pickFace(): number {
  const roll = Math.random();
  for (let i = 0; i < FACE_WEIGHTS.length; i++) {
    if (roll <= FACE_WEIGHTS[i]) return i;
  }
  return 0;
}

// Iridescent sweep blended over every face; the per-coin `hue` rotates it.
const HOLO_STOPS: [number, string][] = [
  [0, "rgba(255,90,150,0.75)"],
  [0.17, "rgba(255,160,70,0.7)"],
  [0.34, "rgba(255,235,130,0.65)"],
  [0.5, "rgba(110,235,200,0.6)"],
  [0.66, "rgba(90,160,255,0.7)"],
  [0.83, "rgba(200,110,255,0.72)"],
  [1, "rgba(255,90,150,0.75)"],
];
// The rainbow chrome milled edge, near-opaque.
const RIM_STOPS: [number, string][] = [
  [0, "rgba(255,110,160,0.9)"],
  [0.17, "rgba(255,180,90,0.9)"],
  [0.34, "rgba(255,240,150,0.9)"],
  [0.5, "rgba(130,240,210,0.9)"],
  [0.66, "rgba(110,175,255,0.9)"],
  [0.83, "rgba(210,130,255,0.9)"],
  [1, "rgba(255,110,160,0.9)"],
];

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

    const starPath = (x: number, y: number, rOut: number, rot: number) => {
      const rIn = rOut * 0.45;
      ctx.beginPath();
      for (let i = 0; i < 12; i++) {
        const angle = rot + (i * Math.PI) / 6;
        const radius = i % 2 === 0 ? rOut : rIn;
        const px = x + Math.cos(angle) * radius;
        const py = y + Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
    };

    const drawCoin = (coin: Coin) => {
      const scale = 1 - coin.dis;
      if (scale <= 0) return;
      const r = coin.r * scale;
      const { x, y } = coin;

      // saturated face
      const [deep, light] = FACES[coin.face];
      const dark = coin.face === DARK_FACE;
      const base = ctx.createLinearGradient(x - r, y - r, x + r, y + r);
      base.addColorStop(0, light);
      base.addColorStop(1, deep);
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = base;
      ctx.fill();

      // holographic rainbow sweep blended over the metal
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.clip();
      const conic = (
        ctx as CanvasRenderingContext2D & {
          createConicGradient?: (
            angle: number,
            x: number,
            y: number
          ) => CanvasGradient;
        }
      ).createConicGradient;
      const holo = conic
        ? conic.call(ctx, coin.hue, x, y)
        : ctx.createLinearGradient(x - r, y - r, x + r, y + r);
      for (const [p, c] of HOLO_STOPS) holo.addColorStop(p, c);
      ctx.globalCompositeOperation = "overlay";
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = holo;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
      ctx.globalAlpha = 1;
      ctx.restore();

      // rainbow chrome milled edge, plus a bright inner ring
      const rim = conic
        ? conic.call(ctx, coin.hue + 1.2, x, y)
        : ctx.createLinearGradient(x - r, y + r, x + r, y - r);
      for (const [p, c] of RIM_STOPS) rim.addColorStop(p, c);
      ctx.beginPath();
      ctx.arc(x, y, r - 0.5, 0, Math.PI * 2);
      ctx.lineWidth = Math.max(1.2, r * 0.13);
      ctx.strokeStyle = rim;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, y, r * 0.84, 0, Math.PI * 2);
      ctx.lineWidth = Math.max(0.8, r * 0.05);
      ctx.strokeStyle = "rgba(255,255,255,0.55)";
      ctx.stroke();

      // embossed star: light catch below, engraving above
      starPath(x + r * 0.06, y + r * 0.06, r * 0.52, coin.rot);
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.fill();
      starPath(x, y, r * 0.52, coin.rot);
      ctx.fillStyle = dark ? "rgba(5,5,16,0.6)" : "rgba(70,60,100,0.42)";
      ctx.fill();

      // top-left sheen
      ctx.beginPath();
      ctx.arc(x, y, r * 0.8, Math.PI * 0.95, Math.PI * 1.5);
      ctx.lineWidth = Math.max(1, r * 0.12);
      ctx.strokeStyle = "rgba(255,255,255,0.75)";
      ctx.stroke();
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
        const r = 11 + Math.random() * 4;
        coins.push({
          x: jarLeft + jarW * (0.3 + Math.random() * 0.4),
          y: Math.max(jarTop - 46, 18),
          vx: (Math.random() - 0.5) * 120,
          vy: reduceMotion ? 600 : 40,
          r,
          hue: Math.random() * Math.PI * 2,
          face: pickFace(),
          rot: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 3,
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
