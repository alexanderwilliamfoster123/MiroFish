// Builds tradr.html — a single double-clickable file: a Revolut-style, fully-3D,
// interactive trading-COMPETITION site branded "Tradr". Three.js inlined,
// environment generated in code, hash routing, drag-to-spin 3D, live leaderboard.
const fs = require('fs');
const path = require('path');
const HERE = __dirname;
const THREE_SRC = fs.readFileSync(path.join(HERE, 'node_modules/three/build/three.min.js'), 'utf8');

/* ============================ DESIGN SYSTEM ============================ */
const CSS = `
:root{
  --bg:#06070c; --bg2:#0b0d16; --panel:rgba(255,255,255,.035); --line:rgba(255,255,255,.09);
  --ink:#f4f6fb; --muted:#9aa0b4;
  --green:#00e676; --violet:#7c5cff; --gold:#ffd66b; --red:#ff5d6c;
  --radius:18px; --radius-lg:26px; --maxw:1180px;
  --ease:cubic-bezier(.22,.61,.36,1);
  --font:-apple-system,BlinkMacSystemFont,"Segoe UI","Helvetica Neue",Arial,sans-serif;
  --grad:linear-gradient(96deg,#00e676 0%,#46e0c0 40%,#7c5cff 100%);
}
*{margin:0;padding:0;box-sizing:border-box;}
html{scroll-behavior:smooth;-webkit-font-smoothing:antialiased;}
body{font-family:var(--font);background:var(--bg);color:var(--ink);line-height:1.55;overflow-x:hidden;}
a{color:inherit;text-decoration:none;}
::selection{background:var(--green);color:#04130b;}
.wrap{width:100%;max-width:var(--maxw);margin:0 auto;padding:0 26px;}
.section{padding:clamp(64px,10vw,150px) 0;position:relative;}
.center{text-align:center;}
.grid{display:grid;gap:24px;}
@media(min-width:760px){.cols-2{grid-template-columns:1fr 1fr;}.cols-3{grid-template-columns:repeat(3,1fr);}.cols-4{grid-template-columns:repeat(4,1fr);}}

h1,h2,h3{line-height:1.0;letter-spacing:-.03em;font-weight:800;}
.display{font-size:clamp(46px,8.5vw,116px);letter-spacing:-.05em;line-height:.92;}
h1{font-size:clamp(40px,6.5vw,84px);}
h2{font-size:clamp(31px,4.6vw,58px);}
h3{font-size:clamp(19px,2.3vw,26px);letter-spacing:-.02em;}
.lead{font-size:clamp(16px,1.55vw,20px);color:var(--muted);max-width:54ch;}
.eyebrow{font-size:12px;font-weight:700;letter-spacing:.24em;text-transform:uppercase;color:var(--green);}
.muted{color:var(--muted);}
.grad-text{background:var(--grad);-webkit-background-clip:text;background-clip:text;color:transparent;}
.gold-text{color:var(--gold);}

.btn{display:inline-flex;align-items:center;gap:9px;font-weight:700;font-size:15px;line-height:1;padding:14px 24px;border-radius:100px;border:1px solid transparent;cursor:pointer;transition:transform .35s var(--ease),box-shadow .35s var(--ease),background .25s,color .25s,border-color .25s;}
.btn:hover{transform:translateY(-2px);}
.btn-primary{background:var(--grad);color:#04130b;box-shadow:0 12px 34px -12px rgba(0,230,118,.6);}
.btn-primary:hover{box-shadow:0 18px 44px -12px rgba(0,230,118,.75);}
.btn-gold{background:linear-gradient(96deg,#ffd66b,#ffb43d);color:#1a1203;box-shadow:0 12px 34px -12px rgba(255,180,61,.6);}
.btn-ghost{background:transparent;color:var(--ink);border-color:var(--line);}
.btn-ghost:hover{border-color:var(--ink);}
.btn-lg{padding:17px 30px;font-size:16px;}
.btn .arrow{transition:transform .35s var(--ease);}
.btn:hover .arrow{transform:translateX(4px);}

/* nav */
.nav{position:fixed;top:0;left:0;right:0;z-index:50;transition:background .4s var(--ease),border-color .4s,backdrop-filter .4s;border-bottom:1px solid transparent;}
.nav.scrolled{background:rgba(6,7,12,.72);backdrop-filter:saturate(160%) blur(16px);border-bottom-color:var(--line);}
.nav .wrap{display:flex;align-items:center;justify-content:space-between;height:68px;}
.brand{display:flex;align-items:center;gap:9px;font-size:22px;font-weight:850;letter-spacing:-.04em;}
.brand .mark{width:24px;height:24px;border-radius:7px;background:var(--grad);display:inline-grid;place-items:center;color:#04130b;font-size:15px;font-weight:900;box-shadow:0 4px 14px -4px rgba(0,230,118,.7);}
.nav-links{display:none;gap:4px;}
@media(min-width:960px){.nav-links{display:flex;}}
.nav-links a{font-size:14px;font-weight:600;color:var(--muted);padding:9px 14px;border-radius:100px;transition:background .25s,color .25s;}
.nav-links a:hover{background:rgba(255,255,255,.06);color:var(--ink);}
.nav-links a.active{color:var(--green);}
.nav-right{display:flex;align-items:center;gap:12px;}
.nav-right .login{display:none;font-size:14px;font-weight:600;color:var(--ink);}
@media(min-width:620px){.nav-right .login{display:inline;}}
.burger{display:grid;gap:5px;padding:10px;background:none;border:0;cursor:pointer;}
@media(min-width:960px){.burger{display:none;}}
.burger span{width:22px;height:2px;background:var(--ink);border-radius:2px;}
.mobile-menu{position:fixed;inset:68px 0 auto 0;z-index:49;background:rgba(8,10,18,.97);backdrop-filter:blur(16px);border-bottom:1px solid var(--line);display:grid;gap:2px;padding:14px 26px 22px;transform:translateY(-12px);opacity:0;pointer-events:none;transition:.3s var(--ease);}
.mobile-menu.open{transform:translateY(0);opacity:1;pointer-events:auto;}
.mobile-menu a{padding:14px 6px;font-size:18px;font-weight:600;border-bottom:1px solid var(--line);}

/* 3d canvas */
.spa-canvas{position:fixed;inset:0;width:100vw;height:100vh;z-index:0;}
.hero{position:relative;min-height:100svh;display:flex;align-items:center;}
.hero .wrap{position:relative;z-index:2;}
.hero-copy{max-width:620px;}
.hero-copy .lead{margin-top:22px;}
.hero-actions{display:flex;flex-wrap:wrap;gap:13px;margin-top:32px;}
.drag-hint{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:5;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--muted);display:flex;align-items:center;gap:8px;}
.drag-hint .dotp{width:7px;height:7px;border-radius:50%;background:var(--green);box-shadow:0 0 12px var(--green);}

/* glass panels & cards */
.panel{background:var(--panel);border:1px solid var(--line);border-radius:var(--radius-lg);backdrop-filter:blur(8px);}
.card{background:var(--panel);border:1px solid var(--line);border-radius:var(--radius-lg);padding:28px;transition:transform .5s var(--ease),border-color .5s,box-shadow .5s;}
.card:hover{transform:translateY(-6px);border-color:rgba(255,255,255,.22);box-shadow:0 26px 60px -30px rgba(0,0,0,.8);}
.card .ic{width:46px;height:46px;border-radius:13px;display:grid;place-items:center;font-size:22px;margin-bottom:16px;background:var(--grad);color:#04130b;}
.card h3{margin-bottom:8px;}
.card p{color:var(--muted);font-size:15px;}
.section-soft{background:linear-gradient(180deg,var(--bg) 0%,var(--bg2) 100%);}

/* badges & pills */
.pill{display:inline-flex;align-items:center;gap:7px;font-size:12px;font-weight:700;padding:6px 12px;border-radius:100px;border:1px solid var(--line);background:rgba(255,255,255,.04);}
.dot{width:7px;height:7px;border-radius:50%;background:var(--green);box-shadow:0 0 10px var(--green);}
.up{color:var(--green);} .down{color:var(--red);}

/* leaderboard */
.lb{overflow:hidden;}
.lb-row{display:grid;grid-template-columns:46px 1fr auto auto;align-items:center;gap:14px;padding:15px 20px;border-bottom:1px solid var(--line);transition:background .4s;}
.lb-row:last-child{border-bottom:0;}
.lb-row .rk{font-weight:800;font-size:16px;color:var(--muted);text-align:center;}
.lb-row.r1 .rk{color:var(--gold);} .lb-row.r2 .rk{color:#d6dae6;} .lb-row.r3 .rk{color:#cd8e54;}
.lb-row .who{display:flex;align-items:center;gap:11px;font-weight:650;}
.lb-row .av{width:30px;height:30px;border-radius:50%;background:var(--grad);display:grid;place-items:center;color:#04130b;font-weight:800;font-size:13px;}
.lb-row .pnl{font-variant-numeric:tabular-nums;font-weight:750;}
.lb-row .eq{font-variant-numeric:tabular-nums;color:var(--muted);font-size:14px;}
@media(max-width:560px){.lb-row{grid-template-columns:34px 1fr auto;}.lb-row .eq{display:none;}}

/* stats */
.stats{display:grid;grid-template-columns:repeat(2,1fr);gap:26px;}
@media(min-width:760px){.stats{grid-template-columns:repeat(4,1fr);}}
.stat .n{font-size:clamp(32px,4.4vw,54px);font-weight:850;letter-spacing:-.04em;}
.stat .l{color:var(--muted);font-size:14px;margin-top:4px;}

/* competition cards */
.comp{position:relative;overflow:hidden;}
.comp .tag{position:absolute;top:18px;right:18px;}
.comp .prize{font-size:30px;font-weight:850;letter-spacing:-.03em;margin:6px 0 2px;}
.comp .meta{display:flex;gap:18px;color:var(--muted);font-size:13px;margin:14px 0 20px;flex-wrap:wrap;}
.bar{height:7px;border-radius:100px;background:rgba(255,255,255,.08);overflow:hidden;margin-bottom:8px;}
.bar > i{display:block;height:100%;background:var(--grad);border-radius:100px;}

/* prize tiers */
.tier{display:flex;flex-direction:column;padding:32px;}
.tier.featured{background:linear-gradient(180deg,rgba(124,92,255,.16),rgba(0,230,118,.06));border-color:rgba(124,92,255,.4);}
.tier .price{font-size:44px;font-weight:850;letter-spacing:-.04em;margin:12px 0 2px;}
.tier ul{list-style:none;margin:20px 0 26px;display:grid;gap:11px;}
.tier li{font-size:15px;padding-left:26px;position:relative;color:var(--muted);}
.tier li::before{content:"✓";position:absolute;left:0;color:var(--green);font-weight:800;}
.tier .btn{margin-top:auto;justify-content:center;}

/* band */
.band{border-radius:var(--radius-lg);padding:clamp(38px,6vw,76px);position:relative;overflow:hidden;border:1px solid var(--line);background:radial-gradient(120% 160% at 0% 0%,rgba(0,230,118,.16),transparent 55%),radial-gradient(120% 160% at 100% 100%,rgba(124,92,255,.18),transparent 55%),var(--bg2);}
.band h2{max-width:18ch;}

/* marquee */
.marquee{overflow:hidden;border-block:1px solid var(--line);padding:18px 0;mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent);}
.marquee .track{display:flex;gap:54px;width:max-content;animation:scrollx 26s linear infinite;}
.marquee span{font-weight:800;font-size:18px;color:var(--muted);letter-spacing:-.01em;white-space:nowrap;}
@keyframes scrollx{to{transform:translateX(-50%);}}

/* footer */
.footer{background:var(--bg2);border-top:1px solid var(--line);padding:66px 0 36px;position:relative;z-index:2;}
.footer .cols{display:grid;gap:38px;grid-template-columns:1.4fr;}
@media(min-width:760px){.footer .cols{grid-template-columns:1.6fr repeat(3,1fr);}}
.footer h4{font-size:13px;text-transform:uppercase;letter-spacing:.12em;color:var(--muted);margin-bottom:14px;}
.footer ul{list-style:none;display:grid;gap:9px;}
.footer a{color:var(--ink);opacity:.8;font-size:15px;}
.footer a:hover{color:var(--green);opacity:1;}
.footer .bottom{margin-top:50px;padding-top:22px;border-top:1px solid var(--line);display:flex;flex-wrap:wrap;gap:12px;justify-content:space-between;color:var(--muted);font-size:13px;}

/* forms */
.shell{min-height:100svh;display:grid;place-items:center;padding:108px 20px 60px;}
.auth{max-width:460px;margin:0 auto;width:100%;padding:38px;}
.field{display:grid;gap:7px;margin-bottom:17px;}
.field label{font-size:13px;font-weight:600;color:var(--ink);}
.field input,.field select{font:inherit;font-size:15px;padding:14px 16px;border-radius:13px;border:1px solid var(--line);background:rgba(255,255,255,.04);color:var(--ink);transition:border-color .2s,box-shadow .2s;}
.field input::placeholder{color:#6b7186;}
.field input:focus,.field select:focus{outline:none;border-color:var(--green);box-shadow:0 0 0 4px rgba(0,230,118,.14);}
.field select option{background:#0b0d16;}
.note{font-size:13px;color:var(--muted);}
.divider{display:flex;align-items:center;gap:14px;color:var(--muted);font-size:13px;margin:20px 0;}
.divider::before,.divider::after{content:"";height:1px;background:var(--line);flex:1;}

/* reveal */
.reveal{opacity:0;transform:translateY(24px);transition:opacity .9s var(--ease),transform .9s var(--ease);}
.reveal.in{opacity:1;transform:none;}
.reveal.d1{transition-delay:.08s;}.reveal.d2{transition-delay:.16s;}.reveal.d3{transition-delay:.24s;}
@media(prefers-reduced-motion:reduce){.reveal{opacity:1;transform:none;}}

/* loader */
.loading{position:fixed;inset:0;z-index:60;display:grid;place-items:center;background:var(--bg);transition:opacity .6s ease;}
.loading.hide{opacity:0;pointer-events:none;}
.loading .l-mark{width:40px;height:40px;border-radius:11px;background:var(--grad);display:grid;place-items:center;color:#04130b;font-weight:900;font-size:22px;animation:pulse 1.1s infinite;}
@keyframes pulse{0%,100%{transform:scale(.85);opacity:.6;}50%{transform:scale(1);opacity:1;}}

/* route states */
[data-route]{display:none;}
body.route-signup .spa-canvas,body.route-login .spa-canvas{opacity:.35;}
`;

/* ============================ SHARED MARKUP ============================ */
const MARK = '<span class="mark">T</span>';
const NAV = `
<nav class="nav"><div class="wrap">
  <a class="brand" href="#home">${MARK}Tradr</a>
  <div class="nav-links">
    <a href="#competitions">Competitions</a><a href="#leaderboard">Leaderboard</a><a href="#how">How it works</a><a href="#prizes">Prizes</a>
  </div>
  <div class="nav-right">
    <a class="login" href="#login">Log in</a>
    <a class="btn btn-primary" href="#signup">Join now <span class="arrow">→</span></a>
    <button class="burger" id="burger" aria-label="Menu"><span></span><span></span><span></span></button>
  </div>
</div></nav>
<div class="mobile-menu" id="mobileMenu">
  <a href="#competitions">Competitions</a><a href="#leaderboard">Leaderboard</a><a href="#how">How it works</a><a href="#prizes">Prizes</a><a href="#login">Log in</a><a href="#signup">Join now</a>
</div>`;

const FOOTER = `
<footer class="footer"><div class="wrap">
  <div class="cols">
    <div>
      <a class="brand" href="#home">${MARK}Tradr</a>
      <p class="muted" style="margin-top:14px;max-width:34ch;">The arena for traders. Compete in real-time tournaments, climb the leaderboard, win real prizes.</p>
      <div class="hero-actions" style="margin-top:20px;"><a class="btn btn-primary" href="#signup">Join Tradr <span class="arrow">→</span></a></div>
    </div>
    <div><h4>Compete</h4><ul><li><a href="#competitions">Competitions</a></li><li><a href="#leaderboard">Leaderboard</a></li><li><a href="#how">How it works</a></li><li><a href="#prizes">Prizes</a></li></ul></div>
    <div><h4>Company</h4><ul><li><a href="#about">About</a></li><li><a href="#about">Careers</a></li><li><a href="#about">Press</a></li><li><a href="#login">Log in</a></li></ul></div>
    <div><h4>Legal</h4><ul><li><a href="#home">Contest rules</a></li><li><a href="#home">Terms</a></li><li><a href="#home">Privacy</a></li><li><a href="#home">Risk notice</a></li></ul></div>
  </div>
  <div class="bottom"><span>© <span data-year></span> Tradr Arena Ltd · Demonstration only. Trading involves risk.</span><span>Built with Three.js — drag the 3D, it's all real-time.</span></div>
</div></footer>`;

/* leaderboard rows are rendered by JS; this is the container */
const lbContainer = (id) => `<div class="panel lb" id="${id}"></div>`;

/* ============================ VIEWS ============================ */
const VIEWS = `
<!-- HOME -->
<div data-route="home">
<header class="hero"><div class="wrap"><div class="hero-copy">
  <div class="pill reveal"><span class="dot"></span> 12,480 traders competing right now</div>
  <h1 class="display reveal d1" style="margin-top:20px;">Trade.<br>Compete.<br><span class="grad-text">Win.</span></h1>
  <p class="lead reveal d2">Tradr is the arena where traders go head-to-head in live tournaments. Climb the leaderboard, beat the field, and take home real prizes — skill, not luck.</p>
  <div class="hero-actions reveal d3">
    <a class="btn btn-primary btn-lg" href="#signup">Enter a competition <span class="arrow">→</span></a>
    <a class="btn btn-ghost btn-lg" href="#how">How it works</a>
  </div>
</div></div></header>
<div class="marquee"><div class="track">
  <span>🏆 $250,000 Monthly Masters</span><span>⚡ Live now</span><span>📈 +412% top return</span><span>🌍 140 countries</span><span>🥇 Daily payouts</span><span>🔥 Weekend Blitz</span>
  <span>🏆 $250,000 Monthly Masters</span><span>⚡ Live now</span><span>📈 +412% top return</span><span>🌍 140 countries</span><span>🥇 Daily payouts</span><span>🔥 Weekend Blitz</span>
</div></div>
<main>
  <section class="section section-soft"><div class="wrap">
    <div class="center" style="max-width:720px;margin:0 auto 54px;"><div class="eyebrow reveal">Why Tradr</div><h2 class="reveal d1" style="margin-top:14px;">An arena built for winners</h2></div>
    <div class="grid cols-3">
      <div class="card reveal"><div class="ic">🏟️</div><h3>Real tournaments</h3><p>Join daily, weekly and monthly contests with thousands of traders and a fixed prize pool.</p></div>
      <div class="card reveal d1"><div class="ic">⚖️</div><h3>Fair & verified</h3><p>Everyone starts with the same virtual balance. Pure skill, fully audited, no insider edge.</p></div>
      <div class="card reveal d2"><div class="ic">💸</div><h3>Real prizes</h3><p>Top of the leaderboard wins cash, funded accounts and Tradr trophies. Paid out fast.</p></div>
    </div>
  </div></section>

  <section class="section" style="padding-top:0;"><div class="wrap"><div class="grid cols-2" style="gap:46px;align-items:center;">
    <div class="reveal">
      <div class="eyebrow">Live leaderboard</div>
      <h2 style="margin:14px 0 16px;">Watch the field<br>move in real time.</h2>
      <p class="lead">Ranks update every second as traders open and close positions. This is the Monthly Masters — and it's live right now.</p>
      <div class="hero-actions"><a class="btn btn-ghost" href="#leaderboard">Full leaderboard <span class="arrow">→</span></a></div>
    </div>
    <div class="reveal d1">${lbContainer('lb-home')}</div>
  </div></div></section>

  <section class="section section-soft"><div class="wrap">
    <div class="stats">
      <div class="stat reveal"><div class="n grad-text">$4.2M</div><div class="l">Prizes paid out</div></div>
      <div class="stat reveal d1"><div class="n grad-text">312K</div><div class="l">Registered traders</div></div>
      <div class="stat reveal d2"><div class="n grad-text">1,800+</div><div class="l">Contests run</div></div>
      <div class="stat reveal d3"><div class="n grad-text">140</div><div class="l">Countries</div></div>
    </div>
  </div></section>

  <section class="section" style="padding-top:0;"><div class="wrap"><div class="band reveal center">
    <div class="eyebrow" style="color:var(--gold);">The Monthly Masters is open</div>
    <h2 style="margin:14px auto 0;">Your seat in the arena<br>is waiting.</h2>
    <p class="lead" style="margin:16px auto 0;">Free to enter. Same starting balance for everyone. May the best trader win.</p>
    <div class="hero-actions" style="margin-top:30px;justify-content:center;"><a class="btn btn-primary btn-lg" href="#signup">Join free <span class="arrow">→</span></a><a class="btn btn-ghost btn-lg" href="#competitions">Browse contests</a></div>
  </div></div></section>
</main>${FOOTER}
</div>

<!-- COMPETITIONS -->
<div data-route="competitions">
<header class="hero" style="min-height:74svh;"><div class="wrap"><div class="hero-copy">
  <div class="eyebrow reveal">Competitions</div>
  <h1 class="display reveal d1" style="margin-top:16px;">Pick your<br><span class="grad-text">arena</span></h1>
  <p class="lead reveal d2">From 60-second blitzes to month-long masters. Every contest, one fair start, one leaderboard, real prizes.</p>
</div></div></header>
<main>
  <section class="section section-soft" style="padding-top:60px;"><div class="wrap"><div class="grid cols-3">
    <div class="card comp reveal"><span class="pill tag"><span class="dot"></span>Live</span><div class="eyebrow">Weekend Blitz</div><div class="prize gold-text">$25,000</div><div class="muted">Prize pool</div>
      <div class="meta"><span>⏱️ 48 hours</span><span>👥 4,210 in</span><span>🎟️ Free</span></div>
      <div class="bar"><i style="width:68%"></i></div><div class="muted" style="font-size:12px;margin-bottom:18px;">68% of seats filled</div>
      <a class="btn btn-primary" href="#signup">Enter now <span class="arrow">→</span></a></div>
    <div class="card comp reveal d1"><span class="pill tag" style="color:var(--gold);border-color:rgba(255,214,107,.4);">★ Featured</span><div class="eyebrow">Monthly Masters</div><div class="prize gold-text">$250,000</div><div class="muted">Prize pool</div>
      <div class="meta"><span>⏱️ 30 days</span><span>👥 12,480 in</span><span>🎟️ Free</span></div>
      <div class="bar"><i style="width:83%"></i></div><div class="muted" style="font-size:12px;margin-bottom:18px;">83% of seats filled</div>
      <a class="btn btn-primary" href="#signup">Enter now <span class="arrow">→</span></a></div>
    <div class="card comp reveal d2"><span class="pill tag"><span class="dot" style="background:var(--gold);box-shadow:0 0 10px var(--gold);"></span>Soon</span><div class="eyebrow">Crypto Cup</div><div class="prize gold-text">$80,000</div><div class="muted">Prize pool</div>
      <div class="meta"><span>⏱️ 7 days</span><span>👥 920 waitlisted</span><span>🎟️ $9</span></div>
      <div class="bar"><i style="width:22%"></i></div><div class="muted" style="font-size:12px;margin-bottom:18px;">Starts in 3 days</div>
      <a class="btn btn-ghost" href="#signup">Join waitlist</a></div>
    <div class="card comp reveal"><span class="pill tag"><span class="dot"></span>Live</span><div class="eyebrow">FX Friday</div><div class="prize gold-text">$15,000</div><div class="muted">Prize pool</div>
      <div class="meta"><span>⏱️ 1 day</span><span>👥 2,640 in</span><span>🎟️ Free</span></div>
      <div class="bar"><i style="width:54%"></i></div><div class="muted" style="font-size:12px;margin-bottom:18px;">54% of seats filled</div>
      <a class="btn btn-primary" href="#signup">Enter now <span class="arrow">→</span></a></div>
    <div class="card comp reveal d1"><span class="pill tag"><span class="dot"></span>Live</span><div class="eyebrow">60-Second Sprint</div><div class="prize gold-text">$2,500</div><div class="muted">Prize pool · every hour</div>
      <div class="meta"><span>⏱️ 60 sec</span><span>👥 580 in</span><span>🎟️ Free</span></div>
      <div class="bar"><i style="width:91%"></i></div><div class="muted" style="font-size:12px;margin-bottom:18px;">Next round in 4 min</div>
      <a class="btn btn-primary" href="#signup">Enter now <span class="arrow">→</span></a></div>
    <div class="card comp reveal d2"><span class="pill tag" style="color:var(--gold);border-color:rgba(255,214,107,.4);">Pro</span><div class="eyebrow">Champions League</div><div class="prize gold-text">$500,000</div><div class="muted">Prize pool · invite only</div>
      <div class="meta"><span>⏱️ 90 days</span><span>👥 Top 1%</span><span>🎟️ Qualify</span></div>
      <div class="bar"><i style="width:40%"></i></div><div class="muted" style="font-size:12px;margin-bottom:18px;">Qualify via any contest</div>
      <a class="btn btn-ghost" href="#how">How to qualify</a></div>
  </div></div></section>
  <section class="section" style="padding-top:0;"><div class="wrap"><div class="band reveal center"><h2 style="margin:0 auto;">One free entry. Infinite glory.</h2><div class="hero-actions" style="margin-top:28px;justify-content:center;"><a class="btn btn-primary btn-lg" href="#signup">Enter your first contest <span class="arrow">→</span></a></div></div></div></section>
</main>${FOOTER}
</div>

<!-- LEADERBOARD -->
<div data-route="leaderboard">
<header class="hero" style="min-height:70svh;"><div class="wrap"><div class="hero-copy">
  <div class="pill reveal"><span class="dot"></span> Monthly Masters · live</div>
  <h1 class="display reveal d1" style="margin-top:18px;">The <span class="grad-text">leaderboard</span></h1>
  <p class="lead reveal d2">Real ranks, updating every second. Same starting balance, $100,000 virtual. Highest return wins.</p>
</div></div></header>
<main>
  <section class="section section-soft" style="padding-top:50px;"><div class="wrap" style="max-width:860px;">
    <div class="reveal" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;flex-wrap:wrap;gap:12px;">
      <div class="pill"><span class="dot"></span> Updating live</div>
      <div class="muted" style="font-size:14px;">Showing top 12 of 12,480 traders</div>
    </div>
    <div class="reveal d1">${lbContainer('lb-full')}</div>
    <p class="note reveal" style="text-align:center;margin-top:22px;">Think you can crack the top 10? <a href="#signup" style="color:var(--green);font-weight:600;">Enter the arena →</a></p>
  </div></section>
</main>${FOOTER}
</div>

<!-- HOW -->
<div data-route="how">
<header class="hero" style="min-height:72svh;"><div class="wrap"><div class="hero-copy">
  <div class="eyebrow reveal">How it works</div>
  <h1 class="display reveal d1" style="margin-top:16px;">Four steps<br>to the <span class="grad-text">podium</span></h1>
  <p class="lead reveal d2">No deposit to compete. No luck involved. Just you, the market, and the leaderboard.</p>
</div></div></header>
<main>
  <section class="section section-soft"><div class="wrap"><div class="grid cols-2" style="gap:22px;">
    <div class="card reveal"><div class="ic">①</div><h3>Join a contest</h3><p>Pick any open competition and claim your seat. Most are free; every entrant starts equal.</p></div>
    <div class="card reveal d1"><div class="ic">②</div><h3>Trade your balance</h3><p>You get $100,000 virtual. Trade FX, crypto, indices and stocks in real market conditions.</p></div>
    <div class="card reveal"><div class="ic">③</div><h3>Climb the board</h3><p>Your return ranks you live against the whole field. Every trade moves you up — or down.</p></div>
    <div class="card reveal d1"><div class="ic">④</div><h3>Win real prizes</h3><p>When the clock hits zero, the top traders win cash, funded accounts and trophies.</p></div>
  </div></div></section>
  <section class="section" style="padding-top:0;"><div class="wrap"><div class="grid cols-2" style="gap:46px;align-items:center;">
    <div class="reveal"><div class="eyebrow">Fair by design</div><h2 style="margin:14px 0 16px;">Same start.<br>Skill decides.</h2><p class="lead">Identical balances, identical fees, identical data feed. We audit every contest end-to-end so the leaderboard reflects one thing only: how well you trade.</p><div class="hero-actions"><a class="btn btn-primary" href="#signup">Prove it <span class="arrow">→</span></a></div></div>
    <div class="reveal d1 grid" style="gap:16px;">
      <div class="card"><h3 style="font-size:18px;">$0 to enter</h3><p>Most contests are free. Win real money anyway.</p></div>
      <div class="card"><h3 style="font-size:18px;">Real prices</h3><p>Live market data — no simulated softballs.</p></div>
      <div class="card"><h3 style="font-size:18px;">Instant payouts</h3><p>Prizes clear within 24 hours of the final whistle.</p></div>
    </div>
  </div></div></section>
</main>${FOOTER}
</div>

<!-- PRIZES -->
<div data-route="prizes">
<header class="hero" style="min-height:74svh;"><div class="wrap"><div class="hero-copy">
  <div class="eyebrow reveal" style="color:var(--gold);">Prizes</div>
  <h1 class="display reveal d1" style="margin-top:16px;">Play for<br><span class="gold-text">real rewards</span></h1>
  <p class="lead reveal d2">Cash, funded capital and Tradr trophies. The bigger the arena, the bigger the haul.</p>
</div></div></header>
<main>
  <section class="section section-soft" style="padding-top:56px;"><div class="wrap"><div class="grid cols-3">
    <div class="card tier reveal"><div class="eyebrow">Rookie</div><div class="price">Free</div><p class="muted">Daily & weekend contests.</p><ul><li>$2.5k–$25k prize pools</li><li>$100k virtual balance</li><li>Live leaderboard</li><li>Tradr trophy on wins</li></ul><a class="btn btn-ghost" href="#signup">Start free</a></div>
    <div class="card tier featured reveal d1"><div class="pill" style="align-self:flex-start;color:var(--gold);border-color:rgba(255,214,107,.4);">★ Most entered</div><div class="eyebrow" style="margin-top:10px;">Masters</div><div class="price grad-text">$9<span style="font-size:17px;font-weight:600;color:var(--muted);">/contest</span></div><p class="muted">Monthly Masters & Crypto Cup.</p><ul><li>$80k–$250k prize pools</li><li>Funded account for winners</li><li>Cash payouts to top 100</li><li>Priority execution</li></ul><a class="btn btn-primary" href="#signup">Enter Masters <span class="arrow">→</span></a></div>
    <div class="card tier reveal d2"><div class="eyebrow">Champions</div><div class="price">Qualify</div><p class="muted">Invite-only, top 1%.</p><ul><li>$500k Champions League</li><li>Funded up to $1M</li><li>Sponsorship & travel</li><li>Hall of Fame</li></ul><a class="btn btn-ghost" href="#how">How to qualify</a></div>
  </div></div></section>
  <section class="section" style="padding-top:0;"><div class="wrap"><div class="band reveal">
    <div class="eyebrow" style="color:var(--gold);">This month's pool</div>
    <h2 style="margin:14px 0 0;">$345,000 <span class="muted" style="font-weight:700;font-size:.5em;">on the table right now</span></h2>
    <p class="lead">Across all live Tradr competitions. Your share is one good month away.</p>
    <div class="hero-actions" style="margin-top:28px;"><a class="btn btn-gold btn-lg" href="#signup">Compete for it <span class="arrow">→</span></a></div>
  </div></div></section>
</main>${FOOTER}
</div>

<!-- ABOUT -->
<div data-route="about">
<header class="hero" style="min-height:74svh;"><div class="wrap"><div class="hero-copy">
  <div class="eyebrow reveal">Company</div>
  <h1 class="display reveal d1" style="margin-top:16px;">We built the<br><span class="grad-text">arena</span></h1>
  <p class="lead reveal d2">Tradr exists to settle one question: who can actually trade? We turn that into a sport — transparent, global, and fair.</p>
</div></div></header>
<main>
  <section class="section section-soft"><div class="wrap"><div class="stats">
    <div class="stat reveal"><div class="n grad-text">2022</div><div class="l">Founded</div></div>
    <div class="stat reveal d1"><div class="n grad-text">58</div><div class="l">Team</div></div>
    <div class="stat reveal d2"><div class="n grad-text">$4.2M</div><div class="l">Prizes paid</div></div>
    <div class="stat reveal d3"><div class="n grad-text">312K</div><div class="l">Traders</div></div>
  </div></div></section>
  <section class="section" style="padding-top:0;"><div class="wrap"><div class="grid cols-2" style="gap:46px;align-items:center;">
    <div class="reveal"><div class="eyebrow">Our mission</div><h2 style="margin:14px 0 16px;">Make trading<br>a meritocracy.</h2><p class="lead">No gatekeepers, no minimum balance, no luck. Anyone, anywhere can enter the arena, and the leaderboard tells the truth. The best rise — and we pay them for it.</p></div>
    <div class="reveal d1 grid" style="gap:16px;">
      <div class="card"><h3 style="font-size:18px;">Transparent</h3><p>Every contest audited and verifiable.</p></div>
      <div class="card"><h3 style="font-size:18px;">Global</h3><p>140 countries, one leaderboard.</p></div>
      <div class="card"><h3 style="font-size:18px;">Fair</h3><p>Same start for the rookie and the pro.</p></div>
    </div>
  </div></div></section>
  <section class="section" style="padding-top:0;"><div class="wrap"><div class="band reveal center"><div class="eyebrow" style="color:var(--gold);">Join the team</div><h2 style="margin:14px auto 0;">Help us run the<br>world's biggest arena.</h2><div class="hero-actions" style="margin-top:28px;justify-content:center;"><a class="btn btn-primary btn-lg" href="#signup">See open roles <span class="arrow">→</span></a></div></div></div></section>
</main>${FOOTER}
</div>

<!-- SIGNUP -->
<div data-route="signup"><div class="shell"><div class="auth panel reveal in">
  <div id="su-form">
    <a class="brand" href="#home" style="margin-bottom:14px;">${MARK}Tradr</a>
    <h2 style="font-size:29px;margin:6px 0 4px;">Enter the arena</h2><p class="note" style="margin-bottom:22px;">Free to join. Your first contest is on us.</p>
    <form id="signup">
      <div class="field"><label>Trader handle</label><input id="su-handle" required placeholder="@yourname" /></div>
      <div class="field"><label>Email</label><input type="email" required placeholder="you@email.com" /></div>
      <div class="field"><label>Country</label><select><option>United Kingdom</option><option>United States</option><option>Germany</option><option>UAE</option><option>Singapore</option><option>Other</option></select></div>
      <div class="field"><label>First competition</label><select><option selected>Monthly Masters — Free</option><option>Weekend Blitz — Free</option><option>Crypto Cup — $9</option></select></div>
      <button class="btn btn-primary btn-lg" type="submit" style="width:100%;justify-content:center;">Claim my seat <span class="arrow">→</span></button>
    </form>
    <p class="note" style="text-align:center;margin-top:16px;">Already competing? <a href="#login" style="color:var(--green);font-weight:600;">Log in</a></p>
  </div>
  <div id="su-done" style="display:none;text-align:center;">
    <div style="width:66px;height:66px;border-radius:18px;background:var(--grad);display:grid;place-items:center;margin:4px auto 18px;font-size:30px;color:#04130b;">🏆</div>
    <h2 style="font-size:27px;margin-bottom:8px;">You're in, <span id="su-who">trader</span>!</h2>
    <p class="muted" style="margin-bottom:22px;">Your seat in the Monthly Masters is locked. The leaderboard is waiting.</p>
    <a class="btn btn-primary btn-lg" href="#leaderboard" style="width:100%;justify-content:center;">View the leaderboard <span class="arrow">→</span></a>
    <a class="btn btn-ghost" href="#competitions" style="width:100%;justify-content:center;margin-top:11px;">Browse competitions</a>
  </div>
</div></div></div>

<!-- LOGIN -->
<div data-route="login"><div class="shell"><div class="auth panel reveal in">
  <a class="brand" href="#home" style="margin-bottom:14px;">${MARK}Tradr</a>
  <h2 style="font-size:29px;margin:6px 0 22px;">Welcome back, trader</h2>
  <form id="login">
    <div class="field"><label>Email or handle</label><input required placeholder="@yourname" /></div>
    <div class="field"><label>Password</label><input type="password" required placeholder="••••••••" /></div>
    <button class="btn btn-primary btn-lg" type="submit" style="width:100%;justify-content:center;">Log in <span class="arrow">→</span></button>
  </form>
  <div class="divider">or</div>
  <a class="btn btn-ghost btn-lg" href="#signup" style="width:100%;justify-content:center;">Create a Tradr account</a>
  <p class="note" style="text-align:center;margin-top:16px;"><a href="#login" style="color:var(--green);font-weight:600;">Forgot password?</a></p>
</div></div></div>
`;

/* ============================ APP (runtime) ============================ */
const APP = `
(function(){
  var SCENES={home:'medal',competitions:'coinstack',leaderboard:'podium',how:'orbit',prizes:'trophy',about:'medal',signup:'medal',login:'medal'};
  var ROUTES=Object.keys(SCENES);

  /* ---------- 3D ---------- */
  var canvas=document.getElementById('spa-canvas');
  var renderer=new THREE.WebGLRenderer({canvas:canvas,antialias:true,alpha:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
  renderer.setSize(window.innerWidth,window.innerHeight);
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;
  var scene=new THREE.Scene();
  var camera=new THREE.PerspectiveCamera(35,window.innerWidth/window.innerHeight,0.1,100);camera.position.set(0,0,9);
  function envTex(stops,spots){var c=document.createElement('canvas');c.width=512;c.height=256;var g=c.getContext('2d');var gr=g.createLinearGradient(0,0,0,256);stops.forEach(function(s){gr.addColorStop(s[0],s[1]);});g.fillStyle=gr;g.fillRect(0,0,512,256);(spots||[]).forEach(function(p){var rg=g.createRadialGradient(p[0],p[1],0,p[0],p[1],p[2]);rg.addColorStop(0,p[3]);rg.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=rg;g.beginPath();g.arc(p[0],p[1],p[2],0,7);g.fill();});var t=new THREE.CanvasTexture(c);t.mapping=THREE.EquirectangularReflectionMapping;return t;}
  var pmrem=new THREE.PMREMGenerator(renderer);
  scene.environment=pmrem.fromEquirectangular(envTex([[0,'#2a3350'],[0.5,'#10131f'],[1,'#05060a']],[[150,60,120,'rgba(0,230,118,0.55)'],[380,90,120,'rgba(124,92,255,0.55)'],[260,200,150,'rgba(255,214,107,0.35)']])).texture;
  var key=new THREE.DirectionalLight(0xffffff,2.4);key.position.set(5,7,6);key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.shadow.camera.near=1;key.shadow.camera.far=40;key.shadow.bias=-0.0002;scene.add(key);
  scene.add(new THREE.AmbientLight(0x8899bb,0.5));
  var g1=new THREE.PointLight(0x00e676,40,40);g1.position.set(-5,2,3);scene.add(g1);
  var g2=new THREE.PointLight(0x7c5cff,40,40);g2.position.set(5,-2,2);scene.add(g2);
  var ground=new THREE.Mesh(new THREE.PlaneGeometry(120,120),new THREE.ShadowMaterial({opacity:0.22}));ground.rotation.x=-Math.PI/2;ground.position.y=-3.6;ground.receiveShadow=true;scene.add(ground);
  var holder=new THREE.Group();scene.add(holder);
  var updateFn=null;

  var gold=function(){return new THREE.MeshStandardMaterial({color:0xffce5a,metalness:1.0,roughness:0.22});};
  var silver=function(){return new THREE.MeshStandardMaterial({color:0xdfe4ee,metalness:1.0,roughness:0.25});};
  var bronze=function(){return new THREE.MeshStandardMaterial({color:0xcd8e54,metalness:1.0,roughness:0.3});};
  var violet=function(){return new THREE.MeshStandardMaterial({color:0x8b6cff,metalness:0.9,roughness:0.25});};

  function tShape(){var s=new THREE.Shape();var w=0.62,h=0.78,a=0.22;s.moveTo(-w,h);s.lineTo(w,h);s.lineTo(w,h-a);s.lineTo(a,h-a);s.lineTo(a,-h);s.lineTo(-a,-h);s.lineTo(-a,h-a);s.lineTo(-w,h-a);s.lineTo(-w,h);return s;}
  function tMesh(mat){var g=new THREE.ExtrudeGeometry(tShape(),{depth:0.12,bevelEnabled:true,bevelSize:0.025,bevelThickness:0.025,bevelSegments:2});g.center();return new THREE.Mesh(g,mat);}

  function clearHolder(){for(var i=holder.children.length-1;i>=0;i--){var o=holder.children[i];holder.remove(o);o.traverse&&o.traverse(function(m){if(m.geometry)m.geometry.dispose();if(m.material){(Array.isArray(m.material)?m.material:[m.material]).forEach(function(x){x.dispose&&x.dispose();});}});}}

  var B={
    medal:function(){var m=gold();var coin=new THREE.Group();var disc=new THREE.Mesh(new THREE.CylinderGeometry(1.9,1.9,0.36,120),m);disc.rotation.x=Math.PI/2;disc.castShadow=true;coin.add(disc);var ring=new THREE.Mesh(new THREE.TorusGeometry(1.74,0.11,28,120),m);ring.position.z=0.18;coin.add(ring);var rb=ring.clone();rb.position.z=-0.18;coin.add(rb);var L=tMesh(m);L.position.z=0.22;L.scale.set(1.25,1.25,1);L.castShadow=true;coin.add(L);var Lb=L.clone();Lb.position.z=-0.22;Lb.rotation.y=Math.PI;coin.add(Lb);holder.add(coin);return function(f){coin.rotation.y=f.t*0.15;coin.position.y=Math.sin(f.t*0.7)*0.12-f.p*4.0;camera.position.z=9+f.p*1.5;camera.lookAt(0,coin.position.y*0.4,0);};},
    trophy:function(){var m=gold();var t=new THREE.Group();var bowl=new THREE.Mesh(new THREE.CylinderGeometry(1.25,0.55,1.25,64,1,false),m);bowl.position.y=0.95;bowl.castShadow=true;t.add(bowl);var rim=new THREE.Mesh(new THREE.TorusGeometry(1.25,0.1,24,80),m);rim.rotation.x=Math.PI/2;rim.position.y=1.57;t.add(rim);var stem=new THREE.Mesh(new THREE.CylinderGeometry(0.17,0.17,0.55,32),m);stem.position.y=0.12;t.add(stem);var base=new THREE.Mesh(new THREE.CylinderGeometry(0.62,0.72,0.28,48),m);base.position.y=-0.28;base.castShadow=true;t.add(base);[-1,1].forEach(function(s){var h=new THREE.Mesh(new THREE.TorusGeometry(0.34,0.07,18,40,Math.PI*1.1),m);h.position.set(s*1.18,1.05,0);h.rotation.z=s>0?-0.5:Math.PI+0.5;t.add(h);});t.position.y=-0.4;holder.add(t);return function(f){t.rotation.y=f.t*0.2;t.position.y=-0.4+Math.sin(f.t*0.7)*0.08-f.p*3.5;camera.position.z=9+f.p*1.2;camera.lookAt(0,0.4+t.position.y*0.3,0);};},
    podium:function(){var grp=new THREE.Group();function block(x,h,mat){var b=new THREE.Mesh(new THREE.BoxGeometry(1.15,h,1.15),mat);b.position.set(x,-1.8+h/2,0);b.castShadow=true;b.receiveShadow=true;var cap=new THREE.Mesh(new THREE.CylinderGeometry(0.42,0.42,0.16,40),gold());cap.position.set(x,-1.8+h+0.08,0);grp.add(b);grp.add(cap);return cap;}
      var c2=block(-1.25,1.5,silver());var c1=block(0,2.2,gold());var c3=block(1.25,1.0,bronze());holder.add(grp);return function(f){grp.rotation.y=Math.sin(f.t*0.25)*0.25;c1.rotation.y=f.t*1.2;c2.rotation.y=f.t*1.0;c3.rotation.y=f.t*0.9;grp.position.y=0.2-f.p*3.0;camera.position.z=9.5+f.p*1.2;camera.lookAt(0,-0.3+grp.position.y*0.3,0);};},
    coinstack:function(){var grp=new THREE.Group();var cs=[];for(var i=0;i<6;i++){var c=new THREE.Mesh(new THREE.CylinderGeometry(1.0,1.0,0.22,80),i%2?gold():silver());c.position.y=-1.1+i*0.26;c.rotation.y=i*0.4;c.castShadow=true;grp.add(c);cs.push(c);}var coin=new THREE.Mesh(new THREE.CylinderGeometry(1.05,1.05,0.24,80),gold());coin.position.set(1.7,0.7,0.6);coin.rotation.x=Math.PI/2;coin.castShadow=true;grp.add(coin);holder.add(grp);return function(f){grp.rotation.y=f.t*0.3;cs.forEach(function(c,i){c.position.y=-1.1+i*0.26+Math.sin(f.t*1.2+i*0.5)*0.04;});coin.rotation.z=f.t*1.5;coin.position.y=0.7+Math.sin(f.t*0.9)*0.15;grp.position.y=0.1-f.p*3.2;camera.position.z=9+f.p*1.3;camera.lookAt(0.4,grp.position.y*0.3,0);};},
    orbit:function(){var grp=new THREE.Group();var ring=new THREE.Mesh(new THREE.TorusGeometry(1.7,0.16,40,160),violet());ring.castShadow=true;grp.add(ring);var ring2=new THREE.Mesh(new THREE.TorusGeometry(1.2,0.08,30,120),gold());ring2.rotation.x=Math.PI/2.4;grp.add(ring2);var pivots=[];for(var i=0;i<3;i++){var p=new THREE.Group();var c=new THREE.Mesh(new THREE.CylinderGeometry(0.34,0.34,0.16,48),i===0?gold():i===1?silver():bronze());c.position.set(1.7,0,0);c.rotation.z=Math.PI/2;c.castShadow=true;p.rotation.z=i*2.1;p.add(c);grp.add(p);pivots.push(p);}holder.add(grp);return function(f){grp.rotation.z=f.t*0.1;ring.rotation.z=f.t*0.4;pivots.forEach(function(p,i){p.rotation.z=i*2.1+f.t*(0.7+i*0.25);});grp.position.y=-f.p*3.2;camera.position.z=8.6+f.p*1.3;camera.lookAt(0,grp.position.y*0.3,0);};}
  };
  function buildScene(type){clearHolder();updateFn=type?B[type]():null;}

  /* ---------- interactivity: drag to spin ---------- */
  var rotX=0.1,rotY=0,velX=0,velY=0,dragging=false,lastX=0,lastY=0,idle=true;
  function down(x,y){dragging=true;idle=false;lastX=x;lastY=y;velX=velY=0;}
  function move(x,y){if(!dragging)return;var dx=x-lastX,dy=y-lastY;lastX=x;lastY=y;velY=dx*0.006;velX=dy*0.006;rotY+=velY;rotX+=velX;rotX=Math.max(-0.9,Math.min(0.9,rotX));}
  function up(){dragging=false;}
  canvas.style.pointerEvents='auto';
  canvas.addEventListener('mousedown',function(e){down(e.clientX,e.clientY);});
  window.addEventListener('mousemove',function(e){move(e.clientX,e.clientY);});
  window.addEventListener('mouseup',up);
  canvas.addEventListener('touchstart',function(e){var t=e.touches[0];down(t.clientX,t.clientY);},{passive:true});
  window.addEventListener('touchmove',function(e){var t=e.touches[0];if(t)move(t.clientX,t.clientY);},{passive:true});
  window.addEventListener('touchend',up);

  var target=0,progress=0;
  function gs(){var m=document.body.scrollHeight-window.innerHeight;return m>0?window.scrollY/m:0;}
  window.addEventListener('scroll',function(){target=gs();},{passive:true});
  var clock=new THREE.Clock();
  (function loop(){requestAnimationFrame(loop);var t=clock.getElapsedTime();progress+=(target-progress)*0.07;
    if(!dragging){rotY+=velY;rotX+=velX;velX*=0.94;velY*=0.94;if(idle)rotY+=0.0024;}
    holder.rotation.y=rotY;holder.rotation.x=rotX;
    if(updateFn)updateFn({p:progress,t:t});
    renderer.render(scene,camera);})();
  window.addEventListener('resize',function(){camera.aspect=window.innerWidth/window.innerHeight;camera.updateProjectionMatrix();renderer.setSize(window.innerWidth,window.innerHeight);});

  /* ---------- live leaderboard ---------- */
  var NAMES=['@apex_fx','@nova','@kingpip','@zen_trades','@valkyrie','@orbit','@maverick','@delta_one','@shadow','@quantum','@bull_run','@ice','@rogue','@titan','@echo','@pulse'];
  var traders=NAMES.map(function(n,i){return {h:n,eq:100000+Math.round((Math.sin(i*99)*0.5+0.5)*42000),v:0};});
  function fmtPnl(p){var s=(p>=0?'+':'')+p.toFixed(2)+'%';return s;}
  function renderLB(el,n){if(!el)return;var sorted=traders.slice().sort(function(a,b){return b.eq-a.eq;}).slice(0,n);
    el.innerHTML=sorted.map(function(tr,i){var pnl=(tr.eq-100000)/1000;var up=pnl>=0;var rk=i+1;
      return '<div class="lb-row r'+rk+'"><div class="rk">'+(rk===1?'🥇':rk===2?'🥈':rk===3?'🥉':rk)+'</div>'+
        '<div class="who"><span class="av">'+tr.h.charAt(1).toUpperCase()+'</span>'+tr.h+'</div>'+
        '<div class="eq">$'+tr.eq.toLocaleString()+'</div>'+
        '<div class="pnl '+(up?'up':'down')+'">'+fmtPnl(pnl)+'</div></div>';}).join('');}
  var lbHome=null,lbFull=null;
  function tickLB(){traders.forEach(function(tr){tr.eq+=Math.round((Math.random()-0.48)*900);if(tr.eq<92000)tr.eq=92000;});lbHome=document.getElementById('lb-home');lbFull=document.getElementById('lb-full');if(lbHome)renderLB(lbHome,6);if(lbFull)renderLB(lbFull,12);}
  setInterval(tickLB,1200);

  /* ---------- routing ---------- */
  var menu=document.getElementById('mobileMenu');
  function setRoute(r){if(ROUTES.indexOf(r)<0)r='home';
    document.body.className='route-'+r;
    document.querySelectorAll('[data-route]').forEach(function(s){s.style.display=s.getAttribute('data-route')===r?'block':'none';});
    document.querySelectorAll('.nav-links a').forEach(function(a){a.classList.toggle('active',a.getAttribute('href')==='#'+r);});
    progress=0;target=0;rotX=0.1;rotY=0;velX=velY=0;idle=true;window.scrollTo(0,0);
    buildScene(SCENES[r]);tickLB();
    setTimeout(function(){document.querySelectorAll('[data-route=\"'+r+'\"] .reveal').forEach(function(el){el.classList.add('in');});},30);
    if(menu)menu.classList.remove('open');}
  window.addEventListener('hashchange',function(){setRoute(location.hash.slice(1));});

  /* ---------- chrome: nav, menu, forms, year ---------- */
  var nav=document.querySelector('.nav');function ns(){if(nav)nav.classList.toggle('scrolled',window.scrollY>12);}ns();window.addEventListener('scroll',ns,{passive:true});
  var burger=document.getElementById('burger');if(burger&&menu){burger.addEventListener('click',function(){menu.classList.toggle('open');});menu.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){menu.classList.remove('open');});});}
  document.querySelectorAll('[data-year]').forEach(function(el){el.textContent=new Date().getFullYear();});
  document.addEventListener('submit',function(e){
    if(e.target.id==='signup'){e.preventDefault();var h=(document.getElementById('su-handle').value||'trader').replace('@','').trim()||'trader';document.getElementById('su-who').textContent='@'+h;document.getElementById('su-form').style.display='none';document.getElementById('su-done').style.display='block';window.scrollTo(0,0);}
    if(e.target.id==='login'){e.preventDefault();location.hash='#leaderboard';}
  });

  var l=document.getElementById('loading');if(l)setTimeout(function(){l.classList.add('hide');},400);
  setRoute(location.hash.slice(1)||'home');
})();
`;

/* ============================ ASSEMBLE ============================ */
const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Tradr — Trade. Compete. Win.</title>
<meta name="description" content="Tradr is the arena for traders: live trading competitions, real-time leaderboards and real prizes." />
<style>${CSS}</style>
</head>
<body>
<div class="loading" id="loading"><div class="l-mark">T</div></div>
<canvas class="spa-canvas" id="spa-canvas"></canvas>
${NAV}
${VIEWS}
<div class="drag-hint"><span class="dotp"></span> Drag the 3D · scroll to explore</div>
<script>${THREE_SRC}</script>
<script>${APP}</script>
</body>
</html>`;

fs.writeFileSync(path.join(HERE, 'tradr.html'), html);
console.log('wrote tradr.html', (html.length/1024).toFixed(0)+'kb');
