/* Paktos smoke suite — quick end-to-end regression pass.
   Run: node tests/smoke.mjs (needs playwright-core + chromium, serves static/ on :8899) */
import { chromium } from 'playwright-core'

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium' })
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } })
const errors = []
let pass = 0, fail = 0
const ok = (name, cond) => { cond ? pass++ : fail++; console.log((cond ? 'PASS' : 'FAIL') + ' - ' + name) }
page.on('pageerror', e => errors.push(e.message))

await page.goto('http://localhost:8899/live-dashboard.html', { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(1400)
await page.evaluate(() => localStorage.clear())
await page.reload({ waitUntil: 'domcontentloaded' })
await page.waitForTimeout(1400)

// every view renders
for (const v of ['arena', 'terminal', 'ideas', 'social', 'hub', 'explore', 'performance', 'live', 'board']) {
  await page.evaluate(x => window.navigate(x), v)
  await page.waitForTimeout(300)
  ok(`view ${v} renders`, await page.evaluate(x => document.querySelector(`.view[data-view="${x}"]`)?.innerHTML.length > 200, v))
}

// arena: board-style hero + promo + panels
await page.evaluate(() => window.navigate('arena'))
await page.waitForTimeout(400)
ok('arena hero map + chips', await page.evaluate(() => !!document.querySelector('.ar-hero .ar-map svg') && document.querySelectorAll('.ar-chip').length === 3))
ok('promo countdown ticking ids', await page.evaluate(() => !!document.getElementById('ppD')))
ok('arena panels', await page.evaluate(() => document.querySelectorAll('.view[data-view="arena"] .pk-panel').length >= 2))

// money loop: accept -> pay -> escrow -> battle card
await page.click('[data-accept]')
await page.waitForTimeout(400)
ok('terms modal', await page.evaluate(() => !!document.getElementById('btVeil')))
await page.click('[data-btpay]')
await page.waitForTimeout(300)
await page.click('[data-btgo]')
await page.waitForTimeout(900)
ok('escrow ticket', await page.evaluate(() => !!document.getElementById('escVeil')))
await page.click('[data-escdone]').catch(() => {})
await page.waitForTimeout(400)
ok('your battles card + market chip', await page.evaluate(() => !!document.querySelector('.mb-card .asset-ic.sm')))

// spectate: polymarket framing
await page.click('.ar-chip')
await page.waitForTimeout(1000)
ok('spectate pm header', await page.evaluate(() => !!document.querySelector('.pm-stats') && !!document.getElementById('pmBeat')))
ok('spectate TO BEAT line', await page.evaluate(() => [...document.querySelectorAll('#specChart svg text')].some(t => t.textContent === 'TO BEAT')))
ok('spectate side buttons cheer', await page.evaluate(() => document.querySelectorAll('.pm-side').length === 2))

// flick fits one screen and takes a trade
await page.evaluate(() => window.navigate('ideas'))
await page.waitForTimeout(800)
ok('flick fits 900px viewport', await page.evaluate(() => document.querySelector('.flickwrap').getBoundingClientRect().bottom <= window.innerHeight))
ok('flick nav row has take/skip', await page.evaluate(() => !!document.querySelector('.fan-nav [data-ftake]') && !!document.querySelector('.fan-nav [data-fskip]')))
await page.click('[data-ftake]')
await page.waitForTimeout(700)
ok('flick take executes', await page.evaluate(() => document.querySelectorAll('.fpick').length >= 1))

// social world seg + hubs
await page.evaluate(() => window.navigate('social'))
await page.waitForTimeout(500)
ok('social seg switcher', await page.evaluate(() => document.querySelectorAll('.view[data-view="social"] .soc-tab').length === 3))
await page.evaluate(() => window.navigate('hub'))
await page.waitForTimeout(500)
ok('hub renders + rc connect entry', await page.evaluate(() => !!document.querySelector('.hub-wrap') && !!document.querySelector('[data-rcopen]')))

// persistence
await page.reload({ waitUntil: 'domcontentloaded' })
await page.waitForTimeout(1400)
await page.evaluate(() => window.navigate('arena'))
await page.waitForTimeout(500)
ok('battle persists after reload', await page.evaluate(() => document.querySelectorAll('.mb-card').length >= 1))

console.log(`==== SMOKE: ${pass + fail} checks, ${fail} failures ====`)
console.log('pageerrors:', JSON.stringify(errors))
await browser.close()
process.exit(fail || errors.length ? 1 : 0)
