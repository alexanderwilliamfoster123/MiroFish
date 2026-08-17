#!/usr/bin/env python3
"""
Builds standalone/nixole.html — the landing page as one self-contained file.

Everything is inlined: the Tailwind build output, the Inter Tight variable font,
and all seven rendered assets as data: URIs. No external requests, so it runs
straight from disk and satisfies the Artifact CSP.

The framer-motion mount animations from src/routes/index.tsx are expressed here
as CSS keyframes driven by a --d delay custom property; the dotted connector
keeps its original getPointAtLength() construction in a small inline script.

Prereqs: `bun run build` (for dist/client/assets/styles-*.css) and
tools/fetch-font.py (for tools/inter-tight.woff2).
"""

import base64
import glob
import html
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = os.path.join(ROOT, "src", "assets")
OUT_DIR = os.path.join(ROOT, "standalone")
os.makedirs(OUT_DIR, exist_ok=True)


def data_uri(name: str, mime: str) -> str:
    with open(os.path.join(ASSETS, name), "rb") as fh:
        return f"data:{mime};base64," + base64.b64encode(fh.read()).decode()


MAIN_LOGO = data_uri("main-logo.svg", "image/svg+xml")
BROWSER = data_uri("browser-mockup.png", "image/png")
NURSE = data_uri("nurse-video.mp4", "video/mp4")
NUTANIX = data_uri("nutanix-avatar.svg", "image/svg+xml")
FRAME207 = data_uri("frame-207.svg", "image/svg+xml")
ARROW = data_uri("programming-arrow.svg", "image/svg+xml")
UPSIDE = data_uri("upside-logo.svg", "image/svg+xml")

with open(os.path.join(ROOT, "tools", "inter-tight.woff2"), "rb") as fh:
    FONT_B64 = base64.b64encode(fh.read()).decode()

tailwind_css = open(glob.glob(os.path.join(ROOT, "dist", "client", "assets", "styles-*.css"))[0]).read()


# --------------------------------------------------------------------------- #
# markup helpers — the HTML twins of AnimatedWords / the motion.* wrappers
# --------------------------------------------------------------------------- #

def words(text: str, delay: float, stagger: float = 0.05, cls: str = "") -> str:
    """The AnimatedWords component: one overflow-hidden box per word."""
    parts = text.split(" ")
    spans = []
    for i, word in enumerate(parts):
        tail = "&#160;" if i < len(parts) - 1 else ""
        spans.append(
            f'<span class="aw"><span class="aw-i" style="--d:{delay + i * stagger:.2f}s">'
            f"{html.escape(word)}{tail}</span></span>"
        )
    attr = f' class="{cls}"' if cls else ""
    return f"<span{attr}>" + "".join(spans) + "</span>"


def letters(text: str, delay: float, stagger: float = 0.06) -> str:
    return "".join(
        f'<span class="aw aw--tight"><span class="aw-i" style="--d:{delay + i * stagger:.2f}s">'
        f"{html.escape(ch)}</span></span>"
        for i, ch in enumerate(text)
    )


NAV = [
    ("Home", True, False),
    ("How it works", False, False),
    ("Company", False, True),
    ("Case Studies", False, False),
]

FEATURES = [
    ("AI Sales Agent", False),
    ("Lead Capture &amp; Forms", False),
    ("Payments &amp; Subscriptions", True),
    ("Automated Follow-ups", False),
    ("CRM for Academies", False),
]

CHEVRON = (
    '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
    'stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
    '<polyline points="6 9 12 15 18 9"/></svg>'
)

STAR_PATH = (
    "M12 2.5l2.95 6.2 6.8.78-5.05 4.66 1.4 6.66L12 17.6l-6.1 3.2 1.4-6.66L2.25 9.48l6.8-.78L12 2.5z"
)

WORDMARK_FONT = "'Inter Tight', ui-sans-serif, system-ui, sans-serif"

BRAND_LOGOS = f"""
<svg width="50" height="20" viewBox="0 0 50 20" fill="none" aria-label="Intel">
  <text x="0" y="15.5" fill="currentColor" font-family="{WORDMARK_FONT}" font-size="18"
        font-weight="600" letter-spacing="-0.9">intel</text></svg>
<svg width="110" height="15" viewBox="0 0 110 15" fill="none" aria-label="Oracle">
  <text x="0" y="12.5" fill="currentColor" font-family="{WORDMARK_FONT}" font-size="15"
        font-weight="500" letter-spacing="1.6">ORACLE</text></svg>
<svg width="100" height="30" viewBox="0 0 100 30" fill="none" aria-label="GoFundMe">
  <path d="M11.6 3.2c2.4-1.7 5.4-1.3 6.8.9 1.4 2.2.5 5-2 6.6-2 1.3-4.6 1.6-6.9 1.5.2-2.3 1-4.7 2.1-6.1.1-.1.1-.2 0-.2-1.3.9-2.5 2.6-3.2 4.4C7.1 8.6 5.6 6.4 3.5 5.5c-.1 0-.2.1-.1.2 1.4 1.1 2.6 3.3 3.2 5.5-2.2-.5-4.5-1.5-6-3.1C-.9 6.2-.6 3.4 1.6 2.1 3.8.7 6.7 1.5 8 3.7c.4.6.7 1.4.9 2.2.4-1 1.4-2 2.7-2.7z" fill="currentColor"/>
  <text x="24" y="21" fill="currentColor" font-family="{WORDMARK_FONT}" font-size="16"
        font-weight="700" textLength="74" lengthAdjust="spacingAndGlyphs">GoFundMe</text></svg>
<svg width="105" height="14" viewBox="0 0 105 14" fill="none" aria-label="Nutanix">
  <text x="0" y="12" fill="currentColor" font-family="{WORDMARK_FONT}" font-size="15"
        font-weight="600" letter-spacing="-0.3">NUTANIX</text></svg>
<img src="{UPSIDE}" alt="Upside" class="h-6 w-auto"/>
"""

MARQUEE_GROUP = f'<div class="flex shrink-0 items-center gap-10 pr-10">{BRAND_LOGOS}</div>'

DOT_STYLE = (
    "width:8px;height:8px;border:2px solid rgba(255,255,255,0.12);"
    "box-sizing:content-box;background-clip:content-box"
)

nav_html = "".join(
    f'<a href="#" class="anim-up flex items-center gap-1.5 text-[15px] font-medium transition-colors '
    + (
        'text-foreground underline decoration-[1.5px] underline-offset-[6px]"'
        if active
        else 'text-muted-foreground hover:text-foreground"'
    )
    + f' style="--d:{1.0 + i * 0.08:.2f}s">{label}{CHEVRON if chevron else ""}</a>'
    for i, (label, active, chevron) in enumerate(NAV)
)

features_html = "".join(
    (
        f'<div class="flex items-center gap-2" style="padding:6px 4px;background:#F4F4F4;'
        f'border-radius:4.312px;color:#111114">'
        '<span class="flex h-3 w-3 shrink-0 items-center justify-center text-white" '
        'style="background:#FFD209;border-radius:1.006px">'
        '<svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
        'stroke-width="4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
        '<polyline points="20 6 9 17 4 12"/></svg></span>'
        f'<span class="text-[12px] font-medium">{label}</span></div>'
        if active
        else f'<div class="flex items-center gap-2" style="padding:6px 4px">'
        '<span class="h-3 w-3 shrink-0 rounded-[3px] bg-white/15"></span>'
        f'<span class="text-[12px] font-medium text-white/90">{label}</span></div>'
    )
    for label, active in FEATURES
)

stars_html = "".join(
    '<svg width="16" height="16" viewBox="0 0 24 24" class="star" aria-hidden="true">'
    f'<path d="{STAR_PATH}" fill="currentColor"/></svg>'
    for _ in range(4)
) + (
    '<svg width="16" height="16" viewBox="0 0 24 24" class="star" aria-hidden="true"><defs>'
    '<linearGradient id="half-star" x1="0" y1="0" x2="1" y2="0">'
    '<stop offset="50%" stop-color="currentColor"/>'
    '<stop offset="50%" stop-color="rgba(0,0,0,0.15)"/></linearGradient></defs>'
    f'<path d="{STAR_PATH}" fill="url(#half-star)"/></svg>'
)

MARQUEE_MASK = (
    "linear-gradient(to right, transparent 0, #000 80px, #000 calc(100% - 80px), transparent 100%)"
)

PAGE = f"""<title>Nixole — AI that converts patients for your medical practice</title>
<meta name="description" content="Autonomous calls, enrollment &amp; payments. AI that handles every patient touchpoint — calls, WhatsApp — until they book an appointment."/>

<style>
@font-face{{
  font-family:'Inter Tight';
  font-style:normal;
  font-weight:300 700;
  font-display:swap;
  src:url(data:font/woff2;base64,{FONT_B64}) format('woff2');
}}
</style>

<style>
{tailwind_css}
</style>

<style>
/* framer-motion mount animations, expressed as CSS. --d carries each delay. */
:root{{
  --ease-back:cubic-bezier(0.34,1.56,0.64,1);
  --ease-rise:cubic-bezier(0.25,1,0.5,1);
}}
@keyframes popIn      {{from{{transform:scale(0)}}                    to{{transform:scale(1)}}}}
@keyframes wordRise   {{from{{transform:translateY(110%);opacity:0}}  to{{transform:translateY(0);opacity:1}}}}
@keyframes fadeUp20   {{from{{transform:translateY(20px);opacity:0}}  to{{transform:translateY(0);opacity:1}}}}
@keyframes fadeUp30   {{from{{transform:translateY(30px);opacity:0}}  to{{transform:translateY(0);opacity:1}}}}
@keyframes fadeUp40   {{from{{transform:translateY(40px);opacity:0}}  to{{transform:translateY(0);opacity:1}}}}
@keyframes fadeUp60   {{from{{transform:translateY(60px);opacity:0}}  to{{transform:translateY(0);opacity:1}}}}

.aw    {{display:inline-block;overflow:hidden;padding-bottom:0.2em;vertical-align:bottom}}
.aw--tight{{padding-bottom:0}}
.aw-i  {{display:inline-block;animation:wordRise .6s var(--ease-rise) both;animation-delay:var(--d,0s)}}
.anim-pop  {{animation:popIn .5s var(--ease-back) both;animation-delay:var(--d,0s)}}
.anim-pop6 {{animation:popIn .6s var(--ease-back) both;animation-delay:var(--d,0s)}}
.anim-up   {{animation:fadeUp20 .5s ease-out both;animation-delay:var(--d,0s)}}
.anim-up30 {{animation:fadeUp30 .8s ease-out both;animation-delay:var(--d,0s)}}
.anim-up40 {{animation:fadeUp40 .8s ease-out both;animation-delay:var(--d,0s)}}
.anim-up60 {{animation:fadeUp60 1s var(--ease-rise) both;animation-delay:var(--d,0s)}}
.anim-pro  {{animation:proScale .7s var(--ease-rise) both;animation-delay:var(--d,0s)}}

.cta-solid{{transition:transform .2s ease}}
.cta-solid:hover{{transform:scale(1.02)}}
a:focus-visible,button:focus-visible{{outline:2px solid #111114;outline-offset:3px;border-radius:9999px}}

@media (prefers-reduced-motion:reduce){{
  .aw-i,.anim-pop,.anim-pop6,.anim-up,.anim-up30,.anim-up40,.anim-up60,.anim-pro,
  .dot-pop,.animate-marquee,.mesh-showcase,.mesh-showcase::before{{
    animation:none !important;
  }}
  .dot-pop{{opacity:.36}}
  .cta-solid{{transition:none}}
}}
</style>

<main class="min-h-screen w-full bg-background">
  <header class="mx-auto w-full max-w-[1400px] px-6 pt-6 md:px-10 md:pt-8">
    <div class="flex items-center justify-between">
      <a href="/" class="flex items-center" style="gap:9.23px">
        <img src="{MAIN_LOGO}" alt="Nixole" width="38" height="38" class="anim-pop"/>
        <span class="flex text-[28px] font-semibold leading-none" style="color:#000">
          {letters("Nixole", 0.5)}
        </span>
      </a>

      <nav class="hidden items-center md:flex" style="gap:36px">{nav_html}</nav>

      <button type="button" class="anim-pop rounded-full border border-border bg-white shadow-[0_1px_0_rgba(0,0,0,0.04)] transition-colors hover:bg-muted px-5 py-2.5 text-[14px] font-medium" style="--d:1.3s">Book a demo</button>
    </div>
  </header>

  <section class="mx-auto w-full max-w-[1400px] px-6 pt-16 text-center md:px-10 md:pt-24">
    <div class="anim-up30 inline-flex items-center rounded-[8px]"
         style="--d:1.5s;padding:4px 11px 4px 4px;gap:10px;background:rgba(192,192,192,0.17)">
      <span class="flex h-[22px] w-[28px] items-center justify-center rounded-[6px] bg-pill-chip">
        <svg width="14" height="12" viewBox="0 0 12 10" fill="none" aria-hidden="true">
          <path d="M5.71198 0L9.56198 9.982H7.686L6.734 7.336H2.786L1.806 9.982H0L3.85 0H5.71198ZM6.272 6.02L4.788 1.82L3.234 6.02H6.272ZM11.998 0.014V9.982H10.234V0.014H11.998Z" opacity="0.85" fill="currentColor"/>
        </svg>
      </span>
      <span class="text-[14px]">Autonomous calls, enrollment &amp; payments</span>
    </div>

    <h1 class="mx-auto mt-6 max-w-[1100px] text-[64px] font-medium leading-[1.05] tracking-[-0.035em] md:text-[88px]">
      <span class="block">{words("AI that converts patients", 1.7)}</span>
      <span class="block">
        {words("for your", 1.95)}
        <video src="{NURSE}" autoplay loop muted playsinline
               class="anim-pop6 inline-block h-[88px] w-[88px] rounded-full object-cover align-middle md:h-[108px] md:w-[108px]"
               style="--d:2.15s"></video>
        {words("medical practice", 2.10, cls="text-foreground/25")}
      </span>
    </h1>

    <p class="anim-up30 mx-auto mt-8 max-w-[760px] text-[18px] leading-[1.5] text-muted-foreground" style="--d:2.5s">
      Built for how patients actually decide. They Google. They hesitate. They miss calls.<br/>
      Our AI handles every touchpoint — calls, WhatsApp — until they book an appointment.
    </p>

    <div class="mt-10 flex items-center justify-center gap-3">
      <button type="button" class="anim-pop rounded-full border border-border bg-white shadow-[0_1px_0_rgba(0,0,0,0.04)] transition-colors hover:bg-muted px-6 py-3 text-[15px] font-medium" style="--d:2.7s">Book a demo</button>
      <button type="button" class="anim-pop cta-solid rounded-full px-6 py-3 text-[15px] font-semibold text-foreground" style="--d:2.8s;background-color:oklch(0.88 0.18 95)">Let&rsquo;s Talk</button>
    </div>
  </section>

  <section class="mt-16 px-4">
    <div class="anim-up60 mesh-showcase overflow-hidden rounded-[28px] p-5 md:p-7" style="--d:3s">
      <div class="grid grid-cols-1 gap-5 md:grid-cols-2">

        <div class="anim-up40 relative flex min-h-[360px] flex-col rounded-[22px] p-6 text-white md:p-7"
             style="--d:3.2s;background-color:#1E1D19">
          <span class="anim-pro flex h-[22px] w-[36px] items-center justify-center rounded-[6px] text-[12px] font-medium"
                style="--d:3.45s;background-color:#FFFFFF;color:#111114">Pro</span>

          <h2 class="mt-5 text-[28px] font-medium leading-[1.15] tracking-tight text-white">
            <span class="block">{words("All-in-One", 3.6)}</span>
            <span class="block">{words("Enrollment Platform", 3.75)}</span>
          </h2>

          <p class="mt-auto pt-6 text-[16px] font-normal" style="color:rgba(255,255,255,0.36);line-height:19px">
            From lead capture to recurring payments,<br/>
            We run your enrollment with AI.
          </p>

          <div class="absolute bottom-0 right-0 hidden w-[330px] md:block"
               style="filter:drop-shadow(0 20px 40px rgba(0,0,0,0.45))">
            <img src="{BROWSER}" alt="Medical.AI dashboard" class="w-full"/>
            <span class="absolute rounded-full bg-white" style="top:40px;left:1px;{DOT_STYLE}"></span>
            <svg id="dotted-frame" class="absolute" style="left:-135.75px;top:43.25px"
                 width="141" height="107" viewBox="0 0 141 107" fill="none" aria-hidden="true">
              <path id="dotted-guide" d="M140.75 3.75H5.75C2.98857 3.75 0.75 5.98858 0.75 8.75V95.75C0.75 98.5114 2.98858 100.75 5.75 100.75H40" stroke="none" fill="none"/>
              <g id="dotted-dots"></g>
            </svg>
          </div>

          <div class="anim-up30 absolute z-10 hidden flex-col md:flex"
               style="--d:3.95s;bottom:-24px;right:214px;width:210px;height:222px;border-radius:13.654px;border:1px solid rgba(255,255,255,0.34);background:linear-gradient(164deg, rgba(255,255,255,0.04) 14.62%, rgba(255,255,255,0.40) 85.2%);backdrop-filter:blur(214.5px);-webkit-backdrop-filter:blur(214.5px);padding:12px">
            <div class="mb-2 flex items-center gap-2">
              <img src="{ARROW}" alt="" width="14" height="14" aria-hidden="true"/>
              <span class="text-[13px] font-medium text-white">Key Features</span>
            </div>
            <div class="relative mb-2 -mx-3 h-px" style="background:rgba(255,255,255,0.19)">
              <span class="absolute rounded-full bg-white" style="left:-4px;top:-4px;{DOT_STYLE}"></span>
            </div>
            <div class="flex flex-col space-y-1">{features_html}</div>
          </div>
        </div>

        <div class="anim-up40 relative min-h-[360px] rounded-[22px] bg-white p-6 md:p-7" style="--d:3.3s">
          <div class="flex items-start justify-between gap-4">
            <div class="flex items-center gap-3">
              <img src="{FRAME207}" alt="" aria-hidden="true" class="h-11 w-auto"/>
              <span class="text-[15px] font-medium text-foreground">What our customers say</span>
            </div>
            <div class="flex flex-col items-end" style="gap:4.34px">
              <span style="width:4.343px;height:32.569px;border-radius:5.428px;background:#131318"></span>
              <span style="width:4.343px;height:16.285px;border-radius:5.428px;background:#DCDCDC"></span>
            </div>
          </div>

          <p class="mt-12 text-[13px] text-muted-foreground">Feb 02, 2026</p>

          <blockquote class="mt-2 max-w-[420px] text-[22px] font-medium leading-[1.3] tracking-tight">
            {words("They converted 40% more leads", 3.6, 0.04, "text-foreground")}
            {words("than our sales team — and never missed a follow-up.", 3.75, 0.04, "text-muted-foreground")}
          </blockquote>

          <div class="absolute bottom-6 left-6 right-6 flex items-center justify-between">
            <img src="{NUTANIX}" alt="Nutanix" class="h-7 w-auto"/>
            <div class="flex items-center gap-1">{stars_html}</div>
          </div>
        </div>
      </div>

      <div class="mt-7 flex flex-col gap-6 px-1 text-white md:flex-row md:items-center md:justify-between">
        <p class="max-w-md text-[13px] leading-[1.5] text-white/75">
          Trusted by industry leaders in X who don&rsquo;t just follow trends,<br/>
          but define how the industry moves forward.
        </p>
        <div class="overflow-hidden md:max-w-[60%]"
             style="mask-image:{MARQUEE_MASK};-webkit-mask-image:{MARQUEE_MASK}">
          <div class="animate-marquee flex w-max items-center">{MARQUEE_GROUP}{MARQUEE_GROUP}</div>
        </div>
      </div>
    </div>
  </section>

  <div class="h-24"></div>
</main>

<script>
// AnimatedDottedFrame: walk the hidden guide path and pop a dot every 4 units.
(function () {{
  var path = document.getElementById('dotted-guide');
  var group = document.getElementById('dotted-dots');
  if (!path || !group) return;
  var total = path.getTotalLength();
  var startDelay = 4200;
  var i = 0;
  for (var d = 2; d <= total; d += 4) {{
    var p = path.getPointAtLength(d);
    var c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c.setAttribute('class', 'dot-pop');
    c.setAttribute('cx', p.x);
    c.setAttribute('cy', p.y);
    c.setAttribute('r', '1.5');
    c.setAttribute('fill', '#fff');
    c.style.animationDelay = (startDelay + i * 40) + 'ms';
    group.appendChild(c);
    i++;
  }}
}})();
</script>
"""

out = os.path.join(OUT_DIR, "nixole.html")
with open(out, "w", encoding="utf-8") as fh:
    fh.write(PAGE)
print("wrote", out, f"({os.path.getsize(out) / 1024:.0f} KB)")
