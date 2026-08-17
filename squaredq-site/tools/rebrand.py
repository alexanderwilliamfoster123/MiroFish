# -*- coding: utf-8 -*-
"""Rebrand the saved Wealthsimple homepage capture into a self-contained SquaredQ site."""
import re, base64, io, sys

SRC = 'src.html'
OUT = 'squaredq.html'

s = open(SRC, encoding='utf-8', errors='replace').read()
orig_len = len(s)
log = []
def note(msg): log.append(msg); print(msg)

# ---------------------------------------------------------------- 1. strip junk
def drop(pattern, label, flags=0):
    global s
    n = len(re.findall(pattern, s, flags))
    if n:
        s = re.sub(pattern, '', s, flags=flags)
    note('removed %-42s x%d' % (label, n))

drop(r'<!--\s*Page saved with SingleFile[\s\S]*?-->', 'SingleFile banner comment')
drop(r'<plasmo-csui[\s\S]*?</plasmo-csui>', 'browser-extension shadow roots')
drop(r'<iframe id=universal_pixel[\s\S]*?</iframe>', 'TTD tracking pixel iframe')
drop(r'<iframe id=decagon-iframe[\s\S]*?</iframe>', 'third-party chat widget iframe')
drop(r'<next-route-announcer>[\s\S]*?</next-route-announcer>', 'next-route-announcer')
# SingleFile's little "open the source video" overlay links
drop(r'<a href=https://videos\.ctfassets\.net[\s\S]*?</a>', 'SingleFile video source overlays')
# 1x1 tracking pixels
drop(r'<img [^>]*src=data:, height=1 width=1[^>]*>', 'tracking pixels')
drop(r'<img width=0 height=0 src=data:,[^>]*>', 'zero-size pixel')

# ---------------------------------------------------------------- 2. de-link
# every off-site destination becomes an inert anchor so nothing points back
# at the source site.
before = len(re.findall(r'href=(?:"[^"]*"|\'[^\']*\'|[^ >]+)', s))
def relink(m):
    q, url = m.group(1), m.group(2)
    if url.startswith('#') or url.startswith('data:'):
        return m.group(0)
    return 'href=%s#%s' % (q, q)
s = re.sub(r'href=(["\']?)(https?://[^"\'> ]+)\1', relink, s)
note('rewrote %-42s x%d' % ('external hrefs -> "#"', before))

# ---------------------------------------------------------------- 3. de-hotlink video
n = len(re.findall(r'\sdata(?:-single-file-lazy-loaded)?-src=https?://[^ >]+', s))
s = re.sub(r'\sdata(?:-single-file-lazy-loaded)?-src=https?://[^ >]+', '', s)
note('removed %-42s x%d' % ('remote video sources (posters kept)', n))
# drop now-empty <source> elements
n = len(re.findall(r'<source [^>]*>', s))
s = re.sub(r'<source [^>]*>', '', s)
note('removed %-42s x%d' % ('empty <source> elements', n))

# ---------------------------------------------------------------- 4. brand assets
wordmark_svg = open('squaredq-wordmark.svg').read()
mark_svg     = open('squaredq-mark.svg').read()
weekly_svg   = open('sq-weekly.svg').read()

def b64(t): return base64.b64encode(t.encode('utf-8')).decode('ascii')

svgs = set(re.findall(r'data:image/svg\+xml;base64,([A-Za-z0-9+/=]+)', s))
old_wm = [b for b in svgs if b'1798.21' in base64.b64decode(b)[:400]][0]
n = s.count(old_wm)
s = s.replace(old_wm, b64(wordmark_svg))
note('swapped %-42s x%d' % ('wordmark (nav, 5 eyebrows, footer)', n))

# the two width-driven wordmark <img>s carry width/height attrs that set the
# box ratio; retune them to the new wordmark's 4.44:1 so nothing stretches.
s = s.replace('<img class="Logo_logo___jthE9 Header_logo___1CC0V" width=262 height=40',
              '<img class="Logo_logo___jthE9 Header_logo___1CC0V" width=262 height=59')
s = s.replace('<img class=Logo_logo___jthE9 width=172 height=26',
              '<img class=Logo_logo___jthE9 width=172 height=39')
note('retuned wordmark <img> aspect ratios')

# favicon
FAV = r'<link rel=icon href=data:image/png;base64,[A-Za-z0-9+/=]+[^>]*>'
n = len(re.findall(FAV, s))
assert n, 'favicon link not found'
s = re.sub(FAV, '<link rel=icon href="data:image/svg+xml;base64,%s">' % b64(mark_svg), s)
note('swapped %-42s x%d' % ('favicon -> SquaredQ Q² mark', n))

# newsletter logotype + drop the borrowed emoji animation next to it
# NB: these class names appear in the stylesheet first — anchor on the markup.
i = s.find('<div class=TLDRSection_heading')
assert i > 0, 'newsletter heading not found'
if i > 0:
    st = s.find('<svg', i)
    en = s.find('</svg>', st) + len('</svg>')
    s = s[:st] + weekly_svg + s[en:]
    note('swapped newsletter logotype -> "SQ WEEKLY"')
def cut_div(html, opening):
    """Remove the <div> that starts with `opening`, matching its close by depth."""
    st = html.find(opening)
    assert st > 0, 'not found: ' + opening
    depth, k, scan = 0, st, re.compile(r'<div\b|</div>')
    while k < len(html):
        m = scan.search(html, k)
        if not m: break
        depth += 1 if m.group(0) == '<div' else -1
        k = m.end()
        if depth == 0: break
    assert depth == 0, 'unbalanced markup for ' + opening
    return html[:st] + html[k:]

def div_span(html, opening):
    """(start, end) of the <div> beginning with `opening`, matched by depth."""
    st = html.find(opening)
    assert st > 0, 'not found: ' + opening
    depth, k, scan = 0, st, re.compile(r'<div\b|</div>')
    while k < len(html):
        m = scan.search(html, k)
        if not m: break
        depth += 1 if m.group(0) == '<div' else -1
        k = m.end()
        if depth == 0: break
    assert depth == 0, 'unbalanced markup for ' + opening
    return st, k

# SingleFile captured the page at desktop width and pinned `sf-hidden`
# (display:none!important) onto everything that happened to be hidden at that
# moment — which froze out every mobile-only asset. Unpin those subtrees so the
# stylesheet's own breakpoints take over again.
unhidden = 0
for opening in ('<div class="Hero_mobileAsset___I8VmJ sf-hidden"',
                '<div class="ProductHero_mobileAsset___rt_LX sf-hidden"'):
    while opening in s:
        a, z = div_span(s, opening)
        sub = s[a:z]
        # lazy-load placeholders never got a real source; they would render as
        # empty boxes over the poster art once unhidden.
        sub = re.sub(r'<img [^>]*Media__image[^>]*src=data:,[^>]*>', '', sub)
        sub = sub.replace(' sf-hidden', '').replace('sf-hidden ', '')
        s = s[:a] + sub + s[z:]
        unhidden += 1
note('restored %-40s x%d' % ('mobile art direction', unhidden))

s = cut_div(s, '<div class=TLDRSection_billie')
note('removed borrowed newsletter emoji animation')

# the chat widget it launched is gone, so the launcher would be a dead control
s = cut_div(s, '<div class=Chatbot_triggerButtonWrapper')
note('removed orphaned chat-widget launcher')

# ---------------------------------------------------------------- 5. copy
# Claims sourced to named third-party research firms cannot travel with a
# rebrand, so that footnote becomes a clearly-marked placeholder.
FOOTNOTE_OLD = ('As of April 21, 2026 Wealthsimple has the fastest asset and trading volume '
                'growth in Canadian online brokerages in 2025 according to data collected by '
                'Investor Insight and Institutional Shareholder Services Canada Inc.')
FOOTNOTE_NEW = ('Placeholder disclosure. Replace with SquaredQ&#x2019;s own substantiated '
                'figures and their source before this page goes to a public audience.')
if FOOTNOTE_OLD in s:
    s = s.replace(FOOTNOTE_OLD, FOOTNOTE_NEW); note('neutralised third-party research footnote')

s = s.replace('© 2016–2026, Wealthsimple Technologies Inc. All Rights Reserved.',
              '© 2026 SquaredQ Technologies Inc. All Rights Reserved.')

# Brand-name substitution, restricted to text nodes and human-readable
# attributes — CSS class names like WealthsimpleEyebrowContent_* must survive.
BRAND = [('Wealthsimple', 'SquaredQ'), ('WEALTHSIMPLE', 'SQUAREDQ'),
         ('wealthsimple', 'squaredq')]
TEXT_ATTRS = ('alt', 'title', 'content', 'aria-label', 'placeholder')

def sub_brand(t):
    for a, b in BRAND: t = t.replace(a, b)
    return t

parts = re.split(r'(<style[\s\S]*?</style>|<[^>]+>)', s)
hits = 0
for idx, p in enumerate(parts):
    if not p:
        continue
    if p.startswith('<style'):
        continue
    if p.startswith('<'):
        def attr(m):
            global hits
            v = sub_brand(m.group(3))
            if v != m.group(3): hits += 1
            return '%s=%s%s%s' % (m.group(1), m.group(2), v, m.group(2))
        # quoted values are matched per quote style: an alt text may legitimately
        # contain the *other* quote character ("Wealthsimple's app").
        names = '|'.join(TEXT_ATTRS)
        parts[idx] = re.sub(r'\b(%s)=(")([^"]*)"' % names, attr, p)
        parts[idx] = re.sub(r"\b(%s)=(')([^']*)'" % names, attr, parts[idx])
        # unquoted attribute values
        def attr2(m):
            global hits
            new = sub_brand(m.group(2))
            if new != m.group(2): hits += 1
            return '%s=%s' % (m.group(1), new)
        parts[idx] = re.sub(r'\b(%s)=([^"\'> ]+)' % '|'.join(TEXT_ATTRS), attr2, parts[idx])
    else:
        new = sub_brand(p)
        if new != p: hits += 1
        parts[idx] = new
s = ''.join(parts)
note('rebranded %-40s x%d nodes' % ('visible text + a11y attributes', hits))

s = s.replace('<h2 class=visually-hidden>TLDR</h2>', '<h2 class=visually-hidden>SQ Weekly</h2>')
s = s.replace('>TLDR</a>', '>SQ Weekly</a>')
s = s.replace('A weekly dose of money, culture, and enough financial news to make you sound smart at parties',
              'A weekly dose of money, markets, and enough financial news to make you sound smart at parties')

# titles / meta
s = re.sub(r'<title>[^<]*</title>', '<title>SquaredQ</title>', s)
# og/twitter images pointed at the source CDN — drop rather than leave broken
n = len(re.findall(r'<meta (?:property|name)=(?:og:image|twitter:image)[^>]*>', s))
s = re.sub(r'<meta (?:property|name)=(?:og:image|twitter:image)[^>]*>', '', s)
note('removed %-42s x%d' % ('og/twitter image meta (remote)', n))
s = re.sub(r'<link rel=canonical[^>]*>', '<link rel=canonical href="/">', s)
s = re.sub(r'<link rel=alternate[^>]*>', '', s)
s = re.sub(r'<meta name=fb:app_id[^>]*>', '', s)
s = re.sub(r'<meta name=msapplication-TileColor[^>]*>',
           '<meta name=theme-color content="#141318">', s)

# ---------------------------------------------------------------- 6. brand layer
BRAND_CSS = """
/* ============================================================
   SquaredQ brand layer
   Overrides the inherited design-system tokens. Everything the
   rebrand touches lives here so it can be tuned in one place.
   ============================================================ */
:root{
  --sq-ink:#141318;
  --sq-accent:#3a2fd8;
  --sq-accent-strong:#2a21b0;
  --sq-accent-tint:#dedbf7;
  --sq-paper:#f5f3ef;

  /* text + line work, cooled a touch off the inherited warm greys */
  --ws-color-slate-10:#141318;
  --ws-color-slate-20:#1f1d28;
  --ws-color-slate-30:#413e4c;
  --ws-color-slate-40:#5e5b69;
  --ws-color-slate-90:#e3e1e6;
  --ws-color-slate-95:#f0eff2;
  --color-text:#141318;
  --color-text-light:#5e5b69;
  --color-borders:#1f1d28;
  --color-outlines:#e3e1e6;
  --nav-border-color:#e3e1e6;

  /* the accent only ever carries primary action */
  --color-button-primary:var(--sq-accent);
  --color-text-button-primary:#fff;
  --ws-color-focus-ring-primary:var(--sq-accent);
}

/* "Squared": the inherited pill buttons become square-shouldered */
.Button_button___kaipY{--button-border-radius:.625rem}

/* primary CTAs in SquaredQ indigo (dark sections keep their own inverted
   treatment, which is scoped to .ws-content-dark-theme and still wins) */
.Button_button___kaipY[data-variant=solid]{
  --button-background-color:var(--sq-accent);
  --button-text-color:#fff;
  --button-hover-background:var(--sq-accent-strong);
  --button-hover-background-overlay:var(--sq-accent-strong);
  --button-focus-ring-color:var(--sq-accent);
}

/* the wordmark is a different shape to the one it replaces (4.44:1 rather
   than 6.07:1) — hold the header lockup at its original optical size */
.Header_logo___1CC0V{width:8.25rem}
@media (min-width:768px){.Header_logo___1CC0V{width:8.75rem}}
.WealthsimpleEyebrowContent_logoWrapper___HRJBF{align-items:baseline}

/* newsletter panel picks up the accent tint in place of the inherited yellow */
.TLDRSection_innerContainer___ScAAT{
  --background:var(--sq-accent-tint)!important;
  --background-start-color:var(--sq-accent-tint)!important;
}
.TLDRSection_heading___MdWES svg path{fill:var(--sq-ink)}

/* ProductHero's desktop/mobile swap was a JS decision in the original app and
   has no stylesheet rule above 1024px; supply the missing half. */
@media (min-width:1025px){.ProductHero_mobileAsset___rt_LX{display:none}}

/* the page commits to a single light treatment — pin the ground so it can
   never borrow a dark host background (a stray html{background:#2d2f34} from
   the capture would otherwise show through) */
html{background:#fcfcfc;color-scheme:light}

/* text links in the footer / legal block */
.Footer_legalDisclaimer___ailC6 a{text-decoration-color:var(--sq-accent)}
"""
s = s.replace('</body>', '<style id="squaredq-brand">%s</style></body>' % BRAND_CSS)
if 'squaredq-brand' not in s:                      # no </body> in the capture
    s += '<style id="squaredq-brand">%s</style>' % BRAND_CSS
note('injected SquaredQ brand stylesheet')

open(OUT, 'w', encoding='utf-8').write(s)
note('')
note('%s: %.2f MB -> %s: %.2f MB' % (SRC, orig_len/1e6, OUT, len(s)/1e6))
left = len(re.findall(r'[Ww]ealthsimple', s))
note('remaining "wealthsimple" tokens (CSS class names only): %d' % left)
