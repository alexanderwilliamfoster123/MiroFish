<template>
  <div class="ars">
    <!-- top bar -->
    <header class="topbar">
      <div class="bar-inner">
        <div class="wordmark" @click="$router.push('/')" role="button" tabindex="0">
          omera<small>ad reaction studio · powered by MiroFish</small>
        </div>
        <div class="spacer"></div>
        <button class="btn-dark" :disabled="!canRun || running" @click="run">
          {{ running ? 'Simulating…' : 'Run simulation' }}
        </button>
      </div>
    </header>

    <div class="wrap">
      <!-- intro -->
      <div class="intro">
        <h1>Drop a headline.<br>Watch every audience react.</h1>
        <p>
          Pick pages from your seeding roster, drop in the ad, and the engine role-plays each
          page's audience with LLM persona agents — sentiment, objections and comments, per world,
          before anything is posted for real.
        </p>
      </div>

      <!-- step 1: creative -->
      <section class="section">
        <div class="sec-head">
          <span class="stepnum">01</span>
          <h2>The creative</h2>
        </div>
        <div class="creative-grid">
          <div class="field">
            <label class="eyebrow" for="headline">Headline / hook *</label>
            <textarea
              id="headline" v-model="headline" rows="2" maxlength="300"
              placeholder="e.g. The whole summer in one bag — six pieces, thirty looks."
            ></textarea>
          </div>
          <div class="field">
            <label class="eyebrow" for="caption">Caption / body (optional)</label>
            <textarea
              id="caption" v-model="caption" rows="2" maxlength="600"
              placeholder="Any supporting copy, offer or CTA…"
            ></textarea>
          </div>
        </div>
      </section>

      <!-- step 2: audiences -->
      <section class="section">
        <div class="sec-head">
          <span class="stepnum">02</span>
          <h2>The audiences</h2>
          <span class="sub" v-if="roster.length">
            {{ selected.length }} of {{ maxPages }} selected · {{ roster.length }} pages in roster
          </span>
        </div>

        <div v-if="rosterError" class="error-box">
          Could not load the roster from the backend — is it running on port 5001?
          <button class="link-btn" @click="loadRoster">Retry</button>
        </div>

        <template v-else>
          <div class="filters">
            <button
              v-for="g in groupChips" :key="g.key"
              class="fchip" :class="{ on: activeGroup === g.key }"
              @click="activeGroup = activeGroup === g.key ? null : g.key"
            >{{ g.key }}<b>{{ g.count }}</b></button>
            <input v-model="query" class="search" placeholder="Search pages…" />
          </div>

          <div class="page-grid">
            <button
              v-for="p in visiblePages" :key="p.name"
              class="page-pill"
              :class="{ on: isSelected(p.name), full: !isSelected(p.name) && selected.length >= maxPages }"
              @click="toggle(p.name)"
            >
              <span class="pname">{{ p.name }}</span>
              <span class="pgroup">{{ p.group }}</span>
            </button>
          </div>
          <p class="count-note" v-if="hiddenCount > 0">+ {{ hiddenCount }} more — refine with search or groups</p>
        </template>
      </section>

      <!-- step 3: results -->
      <section class="section" v-if="running || summary || runError">
        <div class="sec-head">
          <span class="stepnum">03</span>
          <h2>The reaction</h2>
          <span class="sub" v-if="summary">
            {{ summary.pages_simulated }} worlds simulated<span v-if="summary.pages_failed"> · {{ summary.pages_failed }} failed</span>
          </span>
        </div>

        <div v-if="runError" class="error-box">{{ runError }}</div>

        <div v-if="running" class="running-box">
          <div class="pulse"></div>
          Simulating {{ pendingCount }} audience world{{ pendingCount === 1 ? '' : 's' }} — persona agents are reading your ad…
        </div>

        <!-- summary -->
        <div v-if="summary && summary.pages_simulated" class="summary-row">
          <div class="stat">
            <div class="v">{{ summary.avg_engagement_score }}</div>
            <div class="lab">Mean engagement score<br>across simulated worlds (0–100)</div>
          </div>
          <div class="stat" v-if="summary.advocate_detractor_ratio !== null && summary.advocate_detractor_ratio !== undefined">
            <div class="v">{{ summary.advocate_detractor_ratio }}<small>:1</small></div>
            <div class="lab">Advocate to detractor ratio</div>
          </div>
          <div class="stat wide" v-if="summary.sentiment">
            <div class="lab" style="margin-bottom: 10px">Blended sentiment</div>
            <div class="minibar">
              <i v-for="k in sentimentKeys" :key="k"
                 :style="{ width: summary.sentiment[k] + '%', background: pastel(k) }"></i>
            </div>
            <div class="legend">
              <span v-for="k in sentimentKeys" :key="k" class="k">
                <i :style="{ background: pastel(k) }"></i>{{ cap(k) }} <b>{{ summary.sentiment[k] }}%</b>
              </span>
            </div>
          </div>
        </div>

        <!-- per-world results -->
        <div class="results">
          <article v-for="r in results" :key="r.page" class="world" :class="{ failed: !r.success }">
            <div class="world-head">
              <div>
                <div class="wname">@{{ r.page }}</div>
                <div class="wgroup">{{ r.group }}</div>
              </div>
              <div class="wscore" v-if="r.success">
                <span class="meter"><i :style="{ width: r.engagement_score + '%', background: scoreTone(r.engagement_score) }"></i></span>
                <b>{{ r.engagement_score }}</b>
              </div>
            </div>

            <template v-if="r.success">
              <p class="wprofile">{{ r.audience_profile }}</p>
              <p class="wverdict">{{ r.verdict }}</p>

              <div class="minibar small">
                <i v-for="k in sentimentKeys" :key="k"
                   :style="{ width: r.sentiment[k] + '%', background: pastel(k) }"></i>
              </div>
              <div class="wmeta">
                <span v-for="k in sentimentKeys" :key="k" class="mk">{{ cap(k) }} <b>{{ r.sentiment[k] }}%</b></span>
              </div>
              <div class="objection" v-if="r.top_objection">
                <span class="eyebrow">Top objection</span> {{ r.top_objection }}
              </div>

              <div class="personas">
                <div v-for="(p, i) in r.personas" :key="i" class="persona">
                  <div class="pface" :style="{ background: pastel(p.sentiment) + '55', color: tone(p.sentiment) }">
                    {{ initials(p.name) }}
                  </div>
                  <div class="pmeta">
                    <div class="pn">
                      {{ p.name }}<span v-if="p.mbti"> · {{ p.mbti }}</span>
                      <span class="senttag" :style="{ color: tone(p.sentiment), background: pastel(p.sentiment) + '45' }">
                        {{ p.sentiment }}
                      </span>
                    </div>
                    <div class="pt">{{ p.occupation }}</div>
                    <div class="pc" :style="{ borderLeftColor: pastel(p.sentiment) }">{{ p.comment }}</div>
                  </div>
                </div>
              </div>
            </template>
            <p v-else class="werror">Simulation failed for this page: {{ r.error }}</p>
          </article>
        </div>
      </section>

      <p class="note">
        <b>How to read this.</b> Reactions are generated by LLM persona agents inferring each
        audience from its page handle — a fast, honest first read, not real user data. Accuracy
        improves as pages gain ingested comment histories and full MiroFish world simulations.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getRoster, simulateReaction } from '../api/adReaction'

const PASTEL = {
  advocate: '#a8d8b9', positive: '#b7cfe8', neutral: '#e0e0e0',
  skeptical: '#f2d4ae', hostile: '#f0bcbc'
}
const TONE = {
  advocate: '#4d7d5f', positive: '#4f6f96', neutral: '#8b8b90',
  skeptical: '#9c7745', hostile: '#a05c5c'
}
const sentimentKeys = ['advocate', 'positive', 'neutral', 'skeptical', 'hostile']

const roster = ref([])
const maxPages = ref(10)
const rosterError = ref(false)
const activeGroup = ref(null)
const query = ref('')
const selected = ref([])

const headline = ref('')
const caption = ref('')
const running = ref(false)
const runError = ref('')
const summary = ref(null)
const results = ref([])
const pendingCount = ref(0)

const VISIBLE_CAP = 60

const groupChips = computed(() => {
  const counts = {}
  roster.value.forEach(p => { counts[p.group] = (counts[p.group] || 0) + 1 })
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([key, count]) => ({ key, count }))
})

const filteredPages = computed(() => roster.value
  .filter(p => !activeGroup.value || p.group === activeGroup.value)
  .filter(p => !query.value || p.name.toLowerCase().includes(query.value.toLowerCase())))

const visiblePages = computed(() => {
  const sel = new Set(selected.value.map(s => s.toLowerCase()))
  const list = filteredPages.value
  const chosen = list.filter(p => sel.has(p.name.toLowerCase()))
  const rest = list.filter(p => !sel.has(p.name.toLowerCase()))
  return [...chosen, ...rest].slice(0, VISIBLE_CAP)
})
const hiddenCount = computed(() => Math.max(0, filteredPages.value.length - VISIBLE_CAP))

const canRun = computed(() => headline.value.trim().length > 0 && selected.value.length > 0)

const isSelected = name => selected.value.some(s => s.toLowerCase() === name.toLowerCase())
const toggle = name => {
  if (isSelected(name)) {
    selected.value = selected.value.filter(s => s.toLowerCase() !== name.toLowerCase())
  } else if (selected.value.length < maxPages.value) {
    selected.value = [...selected.value, name]
  }
}

const pastel = k => PASTEL[k] || PASTEL.neutral
const tone = k => TONE[k] || TONE.neutral
const cap = s => s.charAt(0).toUpperCase() + s.slice(1)
const initials = n => n.split(/[\s,]+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
const scoreTone = s => s >= 65 ? PASTEL.advocate : s >= 45 ? PASTEL.skeptical : PASTEL.hostile

async function loadRoster () {
  rosterError.value = false
  try {
    const res = await getRoster()
    roster.value = res.data.pages
    maxPages.value = res.data.max_pages_per_run
  } catch (e) {
    rosterError.value = true
  }
}

async function run () {
  if (!canRun.value || running.value) return
  running.value = true
  runError.value = ''
  summary.value = null
  results.value = []
  pendingCount.value = selected.value.length
  try {
    const res = await simulateReaction({
      headline: headline.value.trim(),
      caption: caption.value.trim() || undefined,
      pages: selected.value
    })
    summary.value = res.data.summary
    results.value = res.data.results
  } catch (e) {
    runError.value = e.message || 'Simulation failed — check that LLM_API_KEY is configured in the backend .env'
  } finally {
    running.value = false
  }
}

onMounted(loadRoster)
</script>

<style scoped>
.ars {
  --page: #ffffff; --tint: #fafafa;
  --ink: #1d1d1f; --ink-2: #6e6e73; --muted: #a1a1a6;
  --hair: #ececec; --hair-2: #f4f4f4;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif;
  background: var(--page); color: var(--ink);
  min-height: 100vh; font-size: 14px; line-height: 1.55; font-weight: 400;
}
.wrap { max-width: 1180px; margin: 0 auto; padding: 0 32px 140px; }
h1, h2 { margin: 0; font-weight: 500; letter-spacing: -.01em; }
.eyebrow { font-size: 10px; letter-spacing: .22em; text-transform: uppercase; color: var(--muted); font-weight: 500; }

.topbar { position: sticky; top: 0; z-index: 40; background: rgba(255,255,255,.92); backdrop-filter: blur(12px); border-bottom: 1px solid var(--hair); }
.bar-inner { max-width: 1180px; margin: 0 auto; padding: 18px 32px; display: flex; align-items: center; gap: 28px; }
.wordmark { font-size: 19px; font-weight: 500; letter-spacing: -.02em; cursor: pointer; }
.wordmark small { display: block; font-size: 10px; letter-spacing: .22em; text-transform: uppercase; color: var(--muted); font-weight: 400; margin-top: 1px; }
.spacer { flex: 1; }
.btn-dark { background: var(--ink); color: #fff; border: 0; border-radius: 3px; padding: 11px 20px; font-size: 11px; font-weight: 500; letter-spacing: .16em; text-transform: uppercase; cursor: pointer; }
.btn-dark:hover:not(:disabled) { background: #000; }
.btn-dark:disabled { background: var(--hair); color: var(--muted); cursor: not-allowed; }

.intro { padding: 72px 0 48px; }
.intro h1 { font-size: 42px; line-height: 1.16; letter-spacing: -.022em; }
.intro p { color: var(--ink-2); font-size: 14.5px; max-width: 52ch; margin: 20px 0 0; }

.section { margin-top: 64px; }
.sec-head { display: flex; align-items: baseline; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
.stepnum { font-size: 11px; letter-spacing: .2em; color: var(--muted); font-variant-numeric: tabular-nums; }
.sec-head h2 { font-size: 24px; letter-spacing: -.018em; }
.sec-head .sub { font-size: 12.5px; color: var(--muted); margin-left: auto; }

.creative-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
@media (max-width: 900px) { .creative-grid { grid-template-columns: 1fr; } }
.field textarea { width: 100%; margin-top: 10px; border: 1px solid var(--hair); border-radius: 4px; padding: 14px 16px; font-size: 14px; font-family: inherit; color: var(--ink); resize: vertical; outline: none; background: #fff; }
.field textarea:focus { border-color: #d6d6d6; }
.field textarea::placeholder { color: var(--muted); }

.filters { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; align-items: center; }
.fchip { font-size: 11.5px; padding: 7px 14px; border-radius: 999px; border: 1px solid var(--hair); color: var(--ink-2); background: #fff; cursor: pointer; }
.fchip b { font-weight: 500; color: var(--ink); font-variant-numeric: tabular-nums; margin-left: 5px; }
.fchip.on { background: var(--ink); border-color: var(--ink); color: #fff; }
.fchip.on b { color: #fff; }
.search { margin-left: auto; border: 1px solid var(--hair); border-radius: 3px; padding: 8px 13px; font-size: 12.5px; width: 200px; outline: none; font-family: inherit; }
.search:focus { border-color: #d6d6d6; }

.page-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 8px; }
.page-pill { display: flex; flex-direction: column; align-items: flex-start; gap: 2px; text-align: left; border: 1px solid var(--hair); background: #fff; border-radius: 4px; padding: 10px 14px; cursor: pointer; font-family: inherit; }
.page-pill:hover { background: var(--tint); }
.page-pill.on { border-color: var(--ink); background: var(--tint); }
.page-pill.full { opacity: .45; cursor: not-allowed; }
.pname { font-size: 13px; font-weight: 450; color: var(--ink); word-break: break-all; }
.pgroup { font-size: 10px; letter-spacing: .1em; text-transform: uppercase; color: var(--muted); }
.count-note { font-size: 12px; color: var(--muted); margin-top: 12px; }

.error-box { border: 1px solid #f0d4d4; background: #fdf7f7; color: #a05c5c; border-radius: 4px; padding: 14px 18px; font-size: 13px; }
.link-btn { border: 0; background: none; color: inherit; text-decoration: underline; cursor: pointer; font-size: 13px; margin-left: 8px; }

.running-box { display: flex; align-items: center; gap: 14px; color: var(--ink-2); font-size: 13.5px; padding: 28px 0; }
.pulse { width: 10px; height: 10px; border-radius: 50%; background: #a8d8b9; animation: pulse 1.2s ease-in-out infinite; }
@keyframes pulse { 0%, 100% { opacity: .35; transform: scale(.8); } 50% { opacity: 1; transform: scale(1.15); } }
@media (prefers-reduced-motion: reduce) { .pulse { animation: none; } }

.summary-row { display: grid; grid-template-columns: auto auto 1fr; gap: 56px; padding: 36px 0; border-top: 1px solid var(--hair); border-bottom: 1px solid var(--hair); margin-bottom: 40px; align-items: start; }
@media (max-width: 900px) { .summary-row { grid-template-columns: 1fr; gap: 28px; } }
.stat .v { font-size: 44px; font-weight: 300; letter-spacing: -.03em; font-variant-numeric: tabular-nums; line-height: 1.05; }
.stat .v small { font-size: 22px; font-weight: 300; color: var(--ink-2); }
.stat .lab { font-size: 11.5px; color: var(--ink-2); margin-top: 8px; line-height: 1.45; }

.minibar { display: flex; height: 8px; border-radius: 4px; overflow: hidden; gap: 2px; }
.minibar.small { height: 6px; margin-top: 14px; }
.minibar i { display: block; height: 100%; }
.legend { display: flex; flex-wrap: wrap; gap: 8px 18px; margin-top: 12px; }
.legend .k { display: flex; align-items: center; gap: 7px; font-size: 11.5px; color: var(--ink-2); }
.legend .k i { width: 9px; height: 9px; border-radius: 50%; }
.legend .k b { color: var(--ink); font-weight: 500; font-variant-numeric: tabular-nums; }

.results { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
@media (max-width: 1000px) { .results { grid-template-columns: 1fr; } }
.world { border: 1px solid var(--hair); border-radius: 6px; padding: 26px 28px; }
.world.failed { border-style: dashed; }
.world-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
.wname { font-size: 15px; font-weight: 500; }
.wgroup { font-size: 10px; letter-spacing: .16em; text-transform: uppercase; color: var(--muted); margin-top: 2px; }
.wscore { display: flex; align-items: center; gap: 10px; font-variant-numeric: tabular-nums; }
.wscore b { font-size: 20px; font-weight: 400; }
.meter { position: relative; height: 5px; width: 64px; border-radius: 3px; background: var(--hair-2); overflow: hidden; display: inline-block; }
.meter i { position: absolute; left: 0; top: 0; bottom: 0; border-radius: 3px; }
.wprofile { font-size: 12.5px; color: var(--muted); margin: 14px 0 0; }
.wverdict { font-size: 13.5px; color: var(--ink); margin: 8px 0 0; line-height: 1.55; }
.wmeta { display: flex; flex-wrap: wrap; gap: 6px 16px; margin-top: 10px; }
.mk { font-size: 11px; color: var(--muted); }
.mk b { color: var(--ink-2); font-weight: 500; font-variant-numeric: tabular-nums; }
.objection { font-size: 12.5px; color: var(--ink-2); margin-top: 14px; display: flex; gap: 10px; align-items: baseline; }
.werror { font-size: 12.5px; color: #a05c5c; margin: 14px 0 0; }

.personas { margin-top: 20px; }
.persona { display: flex; gap: 14px; padding: 14px 0; border-top: 1px solid var(--hair-2); }
.pface { width: 34px; height: 34px; border-radius: 50%; flex: none; display: grid; place-items: center; font-size: 10.5px; font-weight: 500; }
.pmeta { flex: 1; min-width: 0; }
.pn { font-weight: 500; font-size: 13px; }
.pt { font-size: 11.5px; color: var(--muted); }
.pc { font-size: 12.5px; color: var(--ink-2); margin-top: 8px; line-height: 1.55; padding: 10px 14px; background: var(--tint); border-radius: 4px; border-left: 2px solid var(--hair); }
.senttag { font-size: 9px; letter-spacing: .14em; text-transform: uppercase; padding: 3px 8px; border-radius: 999px; margin-left: 10px; vertical-align: middle; font-weight: 500; }

.note { font-size: 11.5px; color: var(--muted); line-height: 1.7; margin-top: 96px; padding-top: 28px; border-top: 1px solid var(--hair); max-width: 78ch; }
.note b { color: var(--ink-2); font-weight: 500; }
</style>
