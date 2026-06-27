import pkg from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = pkg;

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1050, height: 760 } });
const errors = [];
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', e => errors.push('PAGEERR: ' + e.message));

await page.goto('http://localhost:8099/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
await page.screenshot({ path: 'shot-top.png' });

// scroll to ~35% to catch the coin rolling down
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.35));
await page.waitForTimeout(1200);
await page.screenshot({ path: 'shot-mid.png' });

console.log('CONSOLE_ERRORS:', errors.length ? errors.join(' | ') : 'none');
await browser.close();
