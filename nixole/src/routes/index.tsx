import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { motion, useInView } from 'framer-motion'

import mainLogo from '../assets/main-logo.svg'
import browserMockup from '../assets/browser-mockup.png'
import nurseVideo from '../assets/nurse-video.mp4'
import nutanixAvatar from '../assets/nutanix-avatar.svg'
import frame207 from '../assets/frame-207.svg'
import programmingArrow from '../assets/programming-arrow.svg'
import upsideLogo from '../assets/upside-logo.svg'

export const Route = createFileRoute('/')({
  component: LandingPage,
})

/* -------------------------------------------------------------------------- */
/*                             Reusable components                            */
/* -------------------------------------------------------------------------- */

const RISE_EASE = [0.25, 1, 0.5, 1] as const

function AnimatedWords({
  text,
  className,
  delayStart = 0,
  stagger = 0.06,
  inView = false,
}: {
  text: string
  className?: string
  delayStart?: number
  stagger?: number
  inView?: boolean
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const play = inView ? isInView : true
  const words = text.split(' ')

  return (
    <span ref={ref} className={className}>
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          className="inline-block overflow-hidden pb-[0.2em] align-bottom"
        >
          <motion.span
            className="inline-block"
            initial={{ y: '110%', opacity: 0 }}
            animate={play ? { y: '0%', opacity: 1 } : { y: '110%', opacity: 0 }}
            transition={{
              duration: 0.6,
              ease: RISE_EASE,
              delay: delayStart + i * stagger,
            }}
          >
            {word}
            {i < words.length - 1 ? ' ' : ''}
          </motion.span>
        </span>
      ))}
    </span>
  )
}

const DOTTED_FRAME_PATH =
  'M140.75 3.75H5.75C2.98857 3.75 0.75 5.98858 0.75 8.75V95.75C0.75 98.5114 2.98858 100.75 5.75 100.75H40'

function AnimatedDottedFrame({
  className,
  style,
  startDelay = 0,
}: {
  className?: string
  style?: CSSProperties
  startDelay?: number
}) {
  const pathRef = useRef<SVGPathElement>(null)
  const [dots, setDots] = useState<Array<{ x: number; y: number }>>([])

  useEffect(() => {
    const path = pathRef.current
    if (!path) return
    const total = path.getTotalLength()
    const points: Array<{ x: number; y: number }> = []
    for (let d = 2; d <= total; d += 4) {
      const p = path.getPointAtLength(d)
      points.push({ x: p.x, y: p.y })
    }
    setDots(points)
  }, [])

  return (
    <svg
      className={className}
      style={style}
      width="141"
      height="107"
      viewBox="0 0 141 107"
      fill="none"
      aria-hidden="true"
    >
      <path ref={pathRef} d={DOTTED_FRAME_PATH} stroke="none" fill="none" />
      <g>
        {dots.map((dot, i) => (
          <circle
            key={i}
            className="dot-pop"
            cx={dot.x}
            cy={dot.y}
            r="1.5"
            fill="#fff"
            style={{ animationDelay: `${startDelay + i * 40}ms` }}
          />
        ))}
      </g>
    </svg>
  )
}

/* -------------------------------------------------------------------------- */
/*                                    Icons                                   */
/* -------------------------------------------------------------------------- */

function ChevronDownIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg
      width="8"
      height="8"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

const STAR_PATH =
  'M12 2.5l2.95 6.2 6.8.78-5.05 4.66 1.4 6.66L12 17.6l-6.1 3.2 1.4-6.66L2.25 9.48l6.8-.78L12 2.5z'

function StarIcon({ half = false }: { half?: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      className="star"
      aria-hidden="true"
    >
      {half ? (
        <>
          <defs>
            <linearGradient id="half-star" x1="0" y1="0" x2="1" y2="0">
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="rgba(0,0,0,0.15)" />
            </linearGradient>
          </defs>
          <path d={STAR_PATH} fill="url(#half-star)" />
        </>
      ) : (
        <path d={STAR_PATH} fill="currentColor" />
      )}
    </svg>
  )
}

/* -------------------------------------------------------------------------- */
/*                            Inline brand wordmarks                          */
/* -------------------------------------------------------------------------- */
/*
 * NOTE: these are vector stand-ins drawn at the exact viewBox dimensions the
 * spec calls for. The upstream brand path data lives on qclay.design, which is
 * blocked by this environment's egress policy — swap the <text> node in each
 * component for the real <path> entries when the host is reachable.
 */

const WORDMARK_FONT = '"Inter Tight", ui-sans-serif, system-ui, sans-serif'

function IntelLogo() {
  return (
    <svg width="50" height="20" viewBox="0 0 50 20" fill="none" aria-label="Intel">
      <text
        x="0"
        y="15.5"
        fill="currentColor"
        fontFamily={WORDMARK_FONT}
        fontSize="18"
        fontWeight="600"
        letterSpacing="-0.9"
      >
        intel
      </text>
    </svg>
  )
}

function OracleLogo() {
  return (
    <svg width="110" height="15" viewBox="0 0 110 15" fill="none" aria-label="Oracle">
      <text
        x="0"
        y="12.5"
        fill="currentColor"
        fontFamily={WORDMARK_FONT}
        fontSize="15"
        fontWeight="500"
        letterSpacing="1.6"
      >
        ORACLE
      </text>
    </svg>
  )
}

function GoFundMeLogo() {
  return (
    <svg
      width="100"
      height="30"
      viewBox="0 0 100 30"
      fill="none"
      aria-label="GoFundMe"
    >
      <path
        d="M11.6 3.2c2.4-1.7 5.4-1.3 6.8.9 1.4 2.2.5 5-2 6.6-2 1.3-4.6 1.6-6.9 1.5.2-2.3 1-4.7 2.1-6.1.1-.1.1-.2 0-.2-1.3.9-2.5 2.6-3.2 4.4C7.1 8.6 5.6 6.4 3.5 5.5c-.1 0-.2.1-.1.2 1.4 1.1 2.6 3.3 3.2 5.5-2.2-.5-4.5-1.5-6-3.1C-.9 6.2-.6 3.4 1.6 2.1 3.8.7 6.7 1.5 8 3.7c.4.6.7 1.4.9 2.2.4-1 1.4-2 2.7-2.7z"
        fill="currentColor"
      />
      <text
        x="24"
        y="21"
        fill="currentColor"
        fontFamily={WORDMARK_FONT}
        fontSize="16"
        fontWeight="700"
        textLength="74"
        lengthAdjust="spacingAndGlyphs"
      >
        GoFundMe
      </text>
    </svg>
  )
}

function NutanixLogo() {
  return (
    <svg
      width="105"
      height="14"
      viewBox="0 0 105 14"
      fill="none"
      aria-label="Nutanix"
    >
      <text
        x="0"
        y="12"
        fill="currentColor"
        fontFamily={WORDMARK_FONT}
        fontSize="15"
        fontWeight="600"
        letterSpacing="-0.3"
      >
        NUTANIX
      </text>
    </svg>
  )
}

/* -------------------------------------------------------------------------- */
/*                                    Page                                    */
/* -------------------------------------------------------------------------- */

const NAV_LINKS = [
  { label: 'Home', active: true, chevron: false },
  { label: 'How it works', active: false, chevron: false },
  { label: 'Company', active: false, chevron: true },
  { label: 'Case Studies', active: false, chevron: false },
]

const KEY_FEATURES = [
  { label: 'AI Sales Agent', active: false },
  { label: 'Lead Capture & Forms', active: false },
  { label: 'Payments & Subscriptions', active: true },
  { label: 'Automated Follow-ups', active: false },
  { label: 'CRM for Academies', active: false },
]

const MARQUEE_MASK =
  'linear-gradient(to right, transparent 0, #000 80px, #000 calc(100% - 80px), transparent 100%)'

function MarqueeGroup() {
  return (
    <div className="flex shrink-0 items-center gap-10 pr-10">
      <IntelLogo />
      <OracleLogo />
      <GoFundMeLogo />
      <NutanixLogo />
      <img src={upsideLogo} alt="Upside" className="h-6 w-auto" />
    </div>
  )
}

function OutlinePill({
  children,
  className = '',
  delay,
}: {
  children: ReactNode
  className?: string
  delay: number
}) {
  return (
    <motion.button
      type="button"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.5, ease: 'backOut', delay }}
      className={`rounded-full border border-border bg-white shadow-[0_1px_0_rgba(0,0,0,0.04)] transition-colors hover:bg-muted ${className}`}
    >
      {children}
    </motion.button>
  )
}

function LandingPage() {
  return (
    <main className="min-h-screen w-full bg-background">
      {/* ------------------------------- HEADER ------------------------------ */}
      <header className="mx-auto w-full max-w-[1400px] px-6 pt-6 md:px-10 md:pt-8">
        <div className="flex items-center justify-between">
          <a href="/" className="flex items-center" style={{ gap: '9.23px' }}>
            <motion.img
              src={mainLogo}
              alt="Nixole"
              width={38}
              height={38}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, ease: 'backOut' }}
            />
            <span
              className="flex text-[28px] font-semibold leading-none"
              style={{ color: '#000' }}
            >
              {'Nixole'.split('').map((letter, i) => (
                <span
                  key={`${letter}-${i}`}
                  className="inline-block overflow-hidden"
                >
                  <motion.span
                    className="inline-block"
                    initial={{ y: '110%', opacity: 0 }}
                    animate={{ y: '0%', opacity: 1 }}
                    transition={{
                      duration: 0.6,
                      ease: RISE_EASE,
                      delay: 0.5 + i * 0.06,
                    }}
                  >
                    {letter}
                  </motion.span>
                </span>
              ))}
            </span>
          </a>

          <nav className="hidden items-center md:flex" style={{ gap: '36px' }}>
            {NAV_LINKS.map((link, i) => (
              <motion.a
                key={link.label}
                href="#"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.0 + i * 0.08 }}
                className={`flex items-center gap-1.5 text-[15px] font-medium transition-colors ${
                  link.active
                    ? 'text-foreground underline decoration-[1.5px] underline-offset-[6px]'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {link.label}
                {link.chevron ? <ChevronDownIcon /> : null}
              </motion.a>
            ))}
          </nav>

          <OutlinePill delay={1.3} className="px-5 py-2.5 text-[14px] font-medium">
            Book a demo
          </OutlinePill>
        </div>
      </header>

      {/* -------------------------------- HERO ------------------------------- */}
      <section className="mx-auto w-full max-w-[1400px] px-6 pt-16 text-center md:px-10 md:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 1.5 }}
          className="inline-flex items-center rounded-[8px]"
          style={{
            padding: '4px 11px 4px 4px',
            gap: '10px',
            background: 'rgba(192, 192, 192, 0.17)',
          }}
        >
          <span className="flex h-[22px] w-[28px] items-center justify-center rounded-[6px] bg-pill-chip">
            <svg
              width="14"
              height="12"
              viewBox="0 0 12 10"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M5.71198 0L9.56198 9.982H7.686L6.734 7.336H2.786L1.806 9.982H0L3.85 0H5.71198ZM6.272 6.02L4.788 1.82L3.234 6.02H6.272ZM11.998 0.014V9.982H10.234V0.014H11.998Z"
                opacity="0.85"
                fill="currentColor"
              />
            </svg>
          </span>
          <span className="text-[14px]">
            Autonomous calls, enrollment &amp; payments
          </span>
        </motion.div>

        <h1 className="mx-auto mt-6 max-w-[1100px] text-[64px] font-medium leading-[1.05] tracking-[-0.035em] md:text-[88px]">
          <span className="block">
            <AnimatedWords text="AI that converts patients" delayStart={1.7} stagger={0.05} />
          </span>
          <span className="block">
            <AnimatedWords text="for your" delayStart={1.95} stagger={0.05} />
            {' '}
            <motion.video
              src={nurseVideo}
              autoPlay
              loop
              muted
              playsInline
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, ease: 'backOut', delay: 2.15 }}
              className="inline-block h-[88px] w-[88px] rounded-full object-cover align-middle md:h-[108px] md:w-[108px]"
            />
            {' '}
            <AnimatedWords
              text="medical practice"
              delayStart={2.1}
              stagger={0.05}
              className="text-foreground/25"
            />
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 2.5 }}
          className="mx-auto mt-8 max-w-[760px] text-[18px] leading-[1.5] text-muted-foreground"
        >
          Built for how patients actually decide. They Google. They hesitate. They
          miss calls.
          <br />
          Our AI handles every touchpoint — calls, WhatsApp — until they book an
          appointment.
        </motion.p>

        <div className="mt-10 flex items-center justify-center gap-3">
          <OutlinePill delay={2.7} className="px-6 py-3 text-[15px] font-medium">
            Book a demo
          </OutlinePill>
          <motion.button
            type="button"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, ease: 'backOut', delay: 2.8 }}
            whileHover={{ scale: 1.02 }}
            className="rounded-full px-6 py-3 text-[15px] font-semibold text-foreground"
            style={{ backgroundColor: 'oklch(0.88 0.18 95)' }}
          >
            Let&rsquo;s Talk
          </motion.button>
        </div>
      </section>

      {/* ------------------------------ SHOWCASE ----------------------------- */}
      <section className="mt-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: RISE_EASE, delay: 3.0 }}
          className="mesh-showcase overflow-hidden rounded-[28px] p-5 md:p-7"
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* ------------------------- LEFT INNER CARD ------------------------ */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 3.2 }}
              className="relative flex min-h-[360px] flex-col rounded-[22px] p-6 text-white md:p-7"
              style={{ backgroundColor: '#1E1D19' }}
            >
              <motion.span
                initial={{ scale: 2.4, opacity: 0.2 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.7, ease: RISE_EASE, delay: 3.45 }}
                className="flex h-[22px] w-[36px] items-center justify-center rounded-[6px] text-[12px] font-medium"
                style={{ backgroundColor: '#FFFFFF', color: '#111114' }}
              >
                Pro
              </motion.span>

              <h2 className="mt-5 text-[28px] font-medium leading-[1.15] tracking-tight text-white">
                <span className="block">
                  <AnimatedWords text="All-in-One" delayStart={3.6} stagger={0.05} />
                </span>
                <span className="block">
                  <AnimatedWords
                    text="Enrollment Platform"
                    delayStart={3.75}
                    stagger={0.05}
                  />
                </span>
              </h2>

              <p
                className="mt-auto pt-6 text-[16px] font-normal"
                style={{ color: 'rgba(255,255,255,0.36)', lineHeight: '19px' }}
              >
                From lead capture to recurring payments,
                <br />
                We run your enrollment with AI.
              </p>

              {/* Floating browser mockup */}
              <div
                className="absolute bottom-0 right-0 hidden w-[330px] md:block"
                style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.45))' }}
              >
                <img
                  src={browserMockup}
                  alt="Medical.AI dashboard"
                  className="w-full"
                />
                <span
                  className="absolute rounded-full bg-white"
                  style={{
                    top: '40px',
                    left: '1px',
                    width: '8px',
                    height: '8px',
                    border: '2px solid rgba(255,255,255,0.12)',
                    boxSizing: 'content-box',
                    backgroundClip: 'content-box',
                  }}
                />
                <AnimatedDottedFrame
                  className="absolute"
                  style={{ left: '-135.75px', top: '43.25px' }}
                  startDelay={4200}
                />
              </div>

              {/* Key Features popover */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 3.95 }}
                className="absolute z-10 hidden flex-col md:flex"
                style={{
                  bottom: '-24px',
                  right: '214px',
                  width: '210px',
                  height: '222px',
                  borderRadius: '13.654px',
                  border: '1px solid rgba(255,255,255,0.34)',
                  background:
                    'linear-gradient(164deg, rgba(255,255,255,0.04) 14.62%, rgba(255,255,255,0.40) 85.2%)',
                  backdropFilter: 'blur(214.5px)',
                  WebkitBackdropFilter: 'blur(214.5px)',
                  padding: '12px',
                }}
              >
                <div className="mb-2 flex items-center gap-2">
                  <img
                    src={programmingArrow}
                    alt=""
                    width={14}
                    height={14}
                    aria-hidden="true"
                  />
                  <span className="text-[13px] font-medium text-white">
                    Key Features
                  </span>
                </div>

                <div
                  className="relative mb-2 -mx-3 h-px"
                  style={{ background: 'rgba(255,255,255,0.19)' }}
                >
                  <span
                    className="absolute rounded-full bg-white"
                    style={{
                      left: '-4px',
                      top: '-4px',
                      width: '8px',
                      height: '8px',
                      border: '2px solid rgba(255,255,255,0.12)',
                      boxSizing: 'content-box',
                      backgroundClip: 'content-box',
                    }}
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  {KEY_FEATURES.map((feature) => (
                    <div
                      key={feature.label}
                      className="flex items-center gap-2"
                      style={{
                        padding: '6px 4px',
                        ...(feature.active
                          ? {
                              background: '#F4F4F4',
                              borderRadius: '4.312px',
                              color: '#111114',
                            }
                          : {}),
                      }}
                    >
                      {feature.active ? (
                        <span
                          className="flex h-3 w-3 shrink-0 items-center justify-center text-white"
                          style={{
                            background: '#FFD209',
                            borderRadius: '1.006px',
                          }}
                        >
                          <CheckIcon />
                        </span>
                      ) : (
                        <span className="h-3 w-3 shrink-0 rounded-[3px] bg-white/15" />
                      )}
                      <span
                        className={`text-[12px] font-medium ${
                          feature.active ? '' : 'text-white/90'
                        }`}
                      >
                        {feature.label}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>

            {/* ------------------------ RIGHT INNER CARD ------------------------ */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 3.3 }}
              className="relative min-h-[360px] rounded-[22px] bg-white p-6 md:p-7"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img src={frame207} alt="" aria-hidden="true" className="h-11 w-auto" />
                  <span className="text-[15px] font-medium text-foreground">
                    What our customers say
                  </span>
                </div>
                <div
                  className="flex flex-col items-end"
                  style={{ gap: '4.34px' }}
                >
                  <span
                    style={{
                      width: '4.343px',
                      height: '32.569px',
                      borderRadius: '5.428px',
                      background: '#131318',
                    }}
                  />
                  <span
                    style={{
                      width: '4.343px',
                      height: '16.285px',
                      borderRadius: '5.428px',
                      background: '#DCDCDC',
                    }}
                  />
                </div>
              </div>

              <p className="mt-12 text-[13px] text-muted-foreground">
                Feb 02, 2026
              </p>

              <blockquote className="mt-2 max-w-[420px] text-[22px] font-medium leading-[1.3] tracking-tight">
                <AnimatedWords
                  text="They converted 40% more leads"
                  delayStart={3.6}
                  stagger={0.04}
                  className="text-foreground"
                />
                {' '}
                <AnimatedWords
                  text="than our sales team — and never missed a follow-up."
                  delayStart={3.75}
                  stagger={0.04}
                  className="text-muted-foreground"
                />
              </blockquote>

              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                <img src={nutanixAvatar} alt="Nutanix" className="h-7 w-auto" />
                <div className="flex items-center gap-1">
                  <StarIcon />
                  <StarIcon />
                  <StarIcon />
                  <StarIcon />
                  <StarIcon half />
                </div>
              </div>
            </motion.div>
          </div>

          {/* ---------------------------- TRUSTED BY --------------------------- */}
          <div className="mt-7 flex flex-col gap-6 px-1 text-white md:flex-row md:items-center md:justify-between">
            <p className="max-w-md text-[13px] leading-[1.5] text-white/75">
              Trusted by industry leaders in X who don&rsquo;t just follow trends,
              <br />
              but define how the industry moves forward.
            </p>
            <div
              className="overflow-hidden md:max-w-[60%]"
              style={{
                maskImage: MARQUEE_MASK,
                WebkitMaskImage: MARQUEE_MASK,
              }}
            >
              {/* no gap between the two groups: each group carries its own
                  trailing 40px so translateX(-50%) lands on an exact repeat */}
              <div className="animate-marquee flex w-max items-center">
                <MarqueeGroup />
                <MarqueeGroup />
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <div className="h-24" />
    </main>
  )
}
