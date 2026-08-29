<template>
  <div class="dashboard" :class="{ dark: isDark }">
    <!-- ============ SIDEBAR ============ -->
    <aside class="sidebar">
      <div class="sidebar-top">
        <div class="brand">
          <span class="brand-mark">
            <svg viewBox="0 0 32 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 3h12l-7 18H2l5-13H2V3z" fill="currentColor" />
              <path d="M17 3h12l-7 18h-5l5-13h-5V3z" fill="currentColor" />
            </svg>
          </span>
          <span class="brand-name">Paktos</span>
        </div>
        <button class="icon-btn ghost" aria-label="Collapse sidebar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <rect x="3" y="4" width="18" height="16" rx="3" />
            <line x1="9.5" y1="4" x2="9.5" y2="20" />
          </svg>
        </button>
      </div>

      <nav class="nav">
        <button
          v-for="item in navItems"
          :key="item.label"
          class="nav-item"
          :class="{ active: item.label === activeNav }"
          @click="activeNav = item.label"
        >
          <span class="nav-icon" :class="{ gradient: item.label === activeNav }">
            <svg v-if="item.icon === 'trophy'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4z" />
              <path d="M7 6H4a1 1 0 0 0-1 1c0 2.5 1.5 4 4 4.5M17 6h3a1 1 0 0 1 1 1c0 2.5-1.5 4-4 4.5" />
            </svg>
            <svg v-else-if="item.icon === 'chat'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12a8 8 0 0 1-8 8H4l2-3a8 8 0 1 1 15-5z" />
            </svg>
            <svg v-else-if="item.icon === 'sparkle'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" />
              <path d="M19 15l.9 2.6L22.5 18.5l-2.6.9L19 22l-.9-2.6-2.6-.9 2.6-.9L19 15z" />
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <path d="M7 15v-4M12 15V8M17 15v-6" />
            </svg>
          </span>
          <span class="nav-label">{{ item.label }}</span>
        </button>
      </nav>

      <div class="sidebar-bottom">
        <div class="user-card">
          <span class="user-avatar">
            <span class="user-avatar-inner">J</span>
          </span>
          <div class="user-meta">
            <span class="user-name">jstone</span>
            <span class="user-rank">RANK&nbsp;#13</span>
          </div>
        </div>
      </div>
    </aside>

    <!-- ============ MAIN ============ -->
    <main class="main">
      <div class="main-inner">
        <!-- Top bar -->
        <header class="topbar">
          <div class="topbar-left">
            <h1 class="page-title">Tournaments</h1>
            <p class="page-sub">
              <span class="mono">3&nbsp;ACCOUNTS</span>
              <span class="dot-sep">·</span>
              <span>active TR-1001 (Monthly)</span>
            </p>
          </div>

          <div class="topbar-right">
            <!-- Trader / Partner segmented neumorphic switch -->
            <label class="segmented" aria-label="Account mode">
              <input type="checkbox" class="segmented-state" v-model="isPartner" />
              <span class="segmented-track">
                <span class="segmented-thumb" :class="{ right: isPartner }"></span>
                <span class="segmented-option" :class="{ on: !isPartner }">Trader</span>
                <span class="segmented-option" :class="{ on: isPartner }">Partner</span>
              </span>
            </label>

            <!-- Theme toggle (neumorphic slide toggle) -->
            <label class="theme-label" aria-label="Toggle theme">
              <div class="theme-toggle">
                <input type="checkbox" class="theme-state" v-model="isDark" />
                <div class="theme-indicator"></div>
                <span class="theme-icon sun">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
                  </svg>
                </span>
                <span class="theme-icon moon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
                  </svg>
                </span>
              </div>
            </label>

            <button class="icon-btn" aria-label="Messages">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
                <rect x="3" y="5" width="18" height="14" rx="3" />
                <path d="M3.5 7l8.5 6 8.5-6" />
              </svg>
            </button>
            <button class="icon-btn" aria-label="Notifications">
              <span class="bell-dot"></span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 9a6 6 0 1 0-12 0c0 5-2 6-2 6h16s-2-1-2-6" />
                <path d="M10.3 19a2 2 0 0 0 3.4 0" />
              </svg>
            </button>
          </div>
        </header>

        <!-- Tabs -->
        <div class="tabs">
          <button class="tab" :class="{ active: activeTab === 'tournaments' }" @click="activeTab = 'tournaments'">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4z" />
              <path d="M7 6H4a1 1 0 0 0-1 1c0 2.5 1.5 4 4 4.5M17 6h3a1 1 0 0 1 1 1c0 2.5-1.5 4-4 4.5" />
            </svg>
            <span>Tournaments</span>
          </button>
          <button class="tab" :class="{ active: activeTab === 'arena' }" @click="activeTab = 'arena'">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14.5 3.5L20.5 9.5M20.5 3.5L14.5 9.5M3.5 14.5l6 6M3.5 20.5l6-6M5 5l6.5 6.5M19 19l-6.5-6.5" />
            </svg>
            <span>Arena</span>
            <span class="tab-count">·&nbsp;3</span>
          </button>
        </div>

        <!-- ============ HERO ============ -->
        <section class="hero">
          <div class="hero-glow"></div>
          <div class="hero-content">
            <div class="hero-left">
              <div class="live-badge">
                <span class="pulse-dot"></span>
                <span class="mono">LIVE</span>
              </div>

              <h2 class="hero-title">
                Live <span class="hero-title-accent">tournaments</span>
              </h2>

              <p class="hero-desc">
                Every entry adds 100% to its prize pool and the top 10 on each board
                share it. Open to everyone — buy in any time, no spot limit.
              </p>

              <div class="hero-stats">
                <div class="stat">
                  <span class="stat-label mono">TOTAL&nbsp;PRIZE&nbsp;POOL</span>
                  <span class="stat-value">£{{ (prizePool / 1e6).toFixed(2) }}M</span>
                </div>
                <div class="stat">
                  <span class="stat-label mono">ACTIVE&nbsp;PLAYERS</span>
                  <span class="stat-value">{{ activePlayers.toLocaleString('en-GB') }}</span>
                </div>
                <div class="stat">
                  <span class="stat-label mono">LIVE&nbsp;CAPITAL</span>
                  <span class="stat-value">£{{ (liveCapital / 1e9).toFixed(2) }}B</span>
                </div>
              </div>

              <div class="hero-actions">
                <button class="btn-primary">
                  <span class="pulse-dot small light"></span>
                  Enter Now
                </button>
                <button class="btn-neu">Invite friends to compete</button>
              </div>

              <div class="hero-social">
                <div class="avatar-stack">
                  <span class="stack-avatar" style="background: linear-gradient(135deg, #fcd9a0, #e8935a)">🦊</span>
                  <span class="stack-avatar" style="background: linear-gradient(135deg, #c9d4e2, #8fa3bd)">🐺</span>
                  <span class="stack-avatar" style="background: linear-gradient(135deg, #d9c2ef, #a184c8)">🐵</span>
                </div>
                <p class="hero-social-text">
                  <strong>@Theo4</strong>, <strong>@swisstony</strong> &amp; 12.6K others competing
                </p>
              </div>
            </div>

            <!-- Live leaderboard -->
            <div class="leaderboard">
              <div class="leaderboard-head">
                <span class="pulse-dot purple"></span>
                <span class="mono leaderboard-title">LIVE&nbsp;LEADERBOARD</span>
              </div>

              <transition-group name="board" tag="ul" class="leaderboard-list">
                <li
                  v-for="(row, i) in leaderboard"
                  :key="row.name"
                  class="leaderboard-row"
                  :class="{ me: row.you }"
                >
                  <span class="row-rank mono">{{ String(i + 1).padStart(2, '0') }}</span>
                  <span class="row-avatar" :style="row.photo ? '' : ''">
                    <img v-if="row.photo" :src="row.photo" alt="" />
                    <template v-else>{{ row.name.charAt(0).toUpperCase() }}</template>
                  </span>
                  <span class="row-name">
                    {{ row.name }}
                    <span v-if="row.you" class="row-you">· you</span>
                    <span class="row-flag">{{ row.flag }}</span>
                  </span>
                  <span class="row-value mono-num" :class="{ ticked: row.justTicked }">
                    £{{ Math.round(row.value).toLocaleString('en-GB') }}
                  </span>
                </li>
              </transition-group>

              <button class="link-btn">
                View leaderboard
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 12h15M13 6l6 6-6 6" />
                </svg>
              </button>
            </div>
          </div>
        </section>

        <!-- ============ ACTIVE TOURNAMENTS ============ -->
        <section class="section">
          <div class="section-head">
            <div>
              <h3 class="section-title">Active tournaments</h3>
              <p class="section-sub">
                <span class="mono">{{ tournaments.length }}&nbsp;RUNNING</span>
                <span class="dot-sep">·</span>
                <span>tap to view the board</span>
              </p>
            </div>

            <div class="section-head-right">
              <!-- Live feed LED switch -->
              <div class="feed-switch" :title="feedLive ? 'Live feed on' : 'Live feed paused'">
                <span class="feed-label mono">{{ feedLive ? 'FEED LIVE' : 'PAUSED' }}</span>
                <div class="switch-container">
                  <input type="checkbox" id="feed-toggle" class="toggle-checkbox" v-model="feedLive" />
                  <label class="switch" for="feed-toggle">
                    <div class="toggle">
                      <div class="led"></div>
                    </div>
                  </label>
                </div>
              </div>
              <button class="link-btn">
                View leaderboard
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 12h15M13 6l6 6-6 6" />
                </svg>
              </button>
            </div>
          </div>

          <div class="tournament-grid">
            <article v-for="t in tournaments" :key="t.name" class="tournament-card">
              <div class="tournament-card-top">
                <span class="trophy-tile">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4z" />
                    <path d="M7 6H4a1 1 0 0 0-1 1c0 2.5 1.5 4 4 4.5M17 6h3a1 1 0 0 1 1 1c0 2.5-1.5 4-4 4.5" />
                  </svg>
                </span>
                <span class="live-tag">
                  <span class="pulse-dot tiny"></span>
                  <span class="mono">LIVE</span>
                </span>
              </div>

              <p class="tournament-name mono">{{ t.name }}</p>
              <p class="tournament-pool">£{{ t.pool }}</p>

              <div class="tournament-meta">
                <p>{{ t.entries.toLocaleString('en-GB') }} in <span class="dot-sep">·</span> £25 entry</p>
                <p>Closes in <strong class="closes">{{ formatCountdown(t.secondsLeft) }}</strong></p>
              </div>

              <button class="btn-neu enter">
                <span class="pulse-dot tiny purple"></span>
                Enter Now
              </button>
            </article>
          </div>
        </section>

        <!-- ============ HALL OF FAME ============ -->
        <section class="section">
          <div class="section-head">
            <div>
              <h3 class="section-title">Hall of Fame</h3>
              <p class="section-sub">Biggest wins all-time — best returns ever made on Paktos, across every market</p>
            </div>
            <div class="section-head-right">
              <input
                v-model="fameQuery"
                class="neu-input"
                type="text"
                placeholder="Search player…"
                aria-label="Search Hall of Fame"
              />
              <button class="link-btn">
                See all
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 12h15M13 6l6 6-6 6" />
                </svg>
              </button>
            </div>
          </div>

          <div class="fame-card">
            <div class="fame-scroll">
              <table class="fame-table">
                <thead>
                  <tr class="mono">
                    <th class="col-rank">#</th>
                    <th class="col-player">PLAYER</th>
                    <th class="col-tournament">TOURNAMENT</th>
                    <th class="col-place">PLACE</th>
                    <th class="col-pool">POOL</th>
                    <th class="col-entry">ENTRY</th>
                    <th class="col-winning">WINNING</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, i) in filteredFame" :key="row.player">
                    <td class="col-rank mono rank-num">{{ String(row.rank).padStart(2, '0') }}</td>
                    <td class="col-player">
                      <span class="fame-player">
                        <span class="fame-avatar" :style="row.emoji ? `background:${row.tint}` : ''">
                          <template v-if="row.emoji">{{ row.emoji }}</template>
                          <template v-else>{{ row.player.charAt(0).toUpperCase() }}</template>
                        </span>
                        <span class="fame-name">{{ row.player }}</span>
                        <span class="row-flag">🇺🇸</span>
                      </span>
                    </td>
                    <td class="col-tournament">{{ row.tournament }}</td>
                    <td class="col-place">{{ row.place }}</td>
                    <td class="col-pool">£{{ row.pool }}</td>
                    <td class="col-entry">£25</td>
                    <td class="col-winning">
                      <span class="winning-amount">£{{ row.winning }}</span>
                      <span class="winning-return">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M4 17l6-6 4 4 6-7" />
                          <path d="M14 8h6v6" />
                        </svg>
                        {{ row.ret }}
                      </span>
                    </td>
                  </tr>
                  <tr v-if="!filteredFame.length">
                    <td colspan="7" class="fame-empty">No players match “{{ fameQuery }}”</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <!-- ============ PAST TOURNAMENTS ============ -->
        <section class="section">
          <div class="section-head">
            <h3 class="section-title">Past tournaments</h3>
            <div class="pager">
              <button class="icon-btn round" aria-label="Previous" @click="cyclePast(-1)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M15 6l-6 6 6 6" />
                </svg>
              </button>
              <button class="icon-btn round" aria-label="Next" @click="cyclePast(1)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </button>
            </div>
          </div>

          <div class="past-grid">
            <article v-for="p in visiblePast" :key="p.city" class="past-card">
              <div class="past-art" :class="p.art">
                <span class="past-chip">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 21s-6-5.1-6-10a6 6 0 1 1 12 0c0 4.9-6 10-6 10z" />
                    <circle cx="12" cy="11" r="2.2" />
                  </svg>
                  {{ p.city }}
                </span>
                <span class="past-chip right">{{ p.date }}</span>

                <!-- stylised coin / tile art -->
                <div class="coin-scene">
                  <div class="coin" :class="p.coin">
                    <svg viewBox="0 0 32 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 3h12l-7 18H2l5-13H2V3z" fill="currentColor" />
                      <path d="M17 3h12l-7 18h-5l5-13h-5V3z" fill="currentColor" />
                    </svg>
                  </div>
                  <div class="coin-shadow"></div>
                </div>
              </div>

              <div class="past-stats">
                <div class="stat">
                  <span class="stat-label mono">PRIZE&nbsp;POOL</span>
                  <span class="stat-value sm">£{{ p.pool }}</span>
                </div>
                <div class="stat">
                  <span class="stat-label mono">ENTRY&nbsp;FEE</span>
                  <span class="stat-value sm">Free</span>
                </div>
                <div class="stat">
                  <span class="stat-label mono">LIVE&nbsp;CAPITAL</span>
                  <span class="stat-value sm">£{{ p.capital }}</span>
                </div>
              </div>

              <div class="past-footer">Ended <span class="dot-sep">·</span> {{ p.joined }} traders joined</div>
            </article>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script>
export default {
  name: 'LiveDashboard',
  data() {
    return {
      isDark: false,
      isPartner: false,
      feedLive: true,
      activeNav: 'Tournaments',
      activeTab: 'tournaments',
      fameQuery: '',
      pastOffset: 0,
      navItems: [
        { label: 'Tournaments', icon: 'trophy' },
        { label: 'Social', icon: 'chat' },
        { label: 'Ideas', icon: 'sparkle' },
        { label: 'Trades', icon: 'chart' }
      ],
      prizePool: 4420000,
      activePlayers: 177792,
      liveCapital: 17800000000,
      leaderboard: [
        { name: 'Rudy', flag: '🇺🇸', value: 1147695, justTicked: false },
        { name: 'Sander Schouten', flag: '🇪🇸', value: 154292, justTicked: false },
        { name: 'Dion Trades', flag: '🇮🇹', value: 153339, justTicked: false },
        { name: 'jstone', flag: '🇬🇧', value: 121300, you: true, justTicked: false }
      ],
      tournaments: [
        { name: 'DAILY SPRINT', pool: '18.4K', entries: 736, secondsLeft: 13 * 3600 + 38 * 60 + 2 },
        { name: 'WEEKLY OPEN', pool: '62.5K', entries: 2500, secondsLeft: ((2 * 24 + 1) * 3600) + 4 * 60 + 17 },
        { name: 'JULY GLOBAL OPEN', pool: '250.0K', entries: 10000, secondsLeft: ((4 * 24 + 2) * 3600) + 10 * 60 + 12 },
        { name: 'Q3 CHAMPIONSHIP', pool: '842.0K', entries: 33680, secondsLeft: ((61 * 24 + 23) * 3600) + 51 * 60 + 48 },
        { name: '2026 WORLD SERIES', pool: '3.15M', entries: 126000, secondsLeft: ((186 * 24 + 23) * 3600) + 47 * 60 + 31 }
      ],
      hallOfFame: [
        { rank: 1, player: 'Theo4', emoji: '🦊', tint: 'linear-gradient(135deg,#fcd9a0,#e8935a)', tournament: '2026 World Series', place: '1st', pool: '3.15M', winning: '1.26M', ret: '50400%' },
        { rank: 2, player: 'Fredi9999', emoji: '🐺', tint: 'linear-gradient(135deg,#c9d4e2,#8fa3bd)', tournament: '2025 World Series', place: '1st', pool: '3.15M', winning: '1.26M', ret: '50400%' },
        { rank: 3, player: 'swisstony', emoji: '🐵', tint: 'linear-gradient(135deg,#d9c2ef,#a184c8)', tournament: '2024 World Series', place: '1st', pool: '3.15M', winning: '1.26M', ret: '50400%' },
        { rank: 4, player: 'kch123', tournament: '2026 World Series', place: '2nd', pool: '3.15M', winning: '630K', ret: '25200%' },
        { rank: 5, player: 'RN1', tournament: '2025 World Series', place: '2nd', pool: '3.15M', winning: '630K', ret: '25200%' },
        { rank: 6, player: 'mintblade', tournament: 'Q3 Championship', place: '1st', pool: '842K', winning: '336.8K', ret: '13472%' },
        { rank: 7, player: 'fishalive', emoji: '🐹', tint: 'linear-gradient(135deg,#e7c9a9,#b98a5a)', tournament: 'Q2 Championship', place: '1st', pool: '842K', winning: '336.8K', ret: '13472%' },
        { rank: 8, player: 'frostrizz', tournament: 'Q1 Championship', place: '1st', pool: '842K', winning: '336.8K', ret: '13472%' }
      ],
      pastTournaments: [
        { city: 'London', date: 'Mar 2026', pool: '50K', capital: '179K', joined: 358, art: 'art-silver', coin: 'coin-round' },
        { city: 'Rome', date: 'Feb 2026', pool: '50K', capital: '104K', joined: 208, art: 'art-mag', coin: 'coin-square' },
        { city: 'Amsterdam', date: 'Feb 2026', pool: '25K', capital: '78K', joined: 156, art: 'art-duo', coin: 'coin-duo' }
      ],
      timers: []
    }
  },
  computed: {
    filteredFame() {
      const q = this.fameQuery.trim().toLowerCase()
      if (!q) return this.hallOfFame
      return this.hallOfFame.filter(
        r => r.player.toLowerCase().includes(q) || r.tournament.toLowerCase().includes(q)
      )
    },
    visiblePast() {
      const n = this.pastTournaments.length
      return Array.from({ length: n }, (_, i) => this.pastTournaments[(i + this.pastOffset + n) % n])
    }
  },
  mounted() {
    this.timers.push(setInterval(this.tickCountdowns, 1000))
    this.timers.push(setInterval(this.tickLiveNumbers, 2600))
  },
  beforeUnmount() {
    this.timers.forEach(clearInterval)
  },
  methods: {
    formatCountdown(total) {
      const d = Math.floor(total / 86400)
      const h = Math.floor((total % 86400) / 3600)
      const m = Math.floor((total % 3600) / 60)
      const s = total % 60
      const pad = n => String(n).padStart(2, '0')
      if (d > 0) return `${d}d ${pad(h)}h ${pad(m)}m ${pad(s)}s`
      return `${h}h ${pad(m)}m ${pad(s)}s`
    },
    tickCountdowns() {
      if (!this.feedLive) return
      this.tournaments.forEach(t => {
        if (t.secondsLeft > 0) t.secondsLeft -= 1
      })
    },
    tickLiveNumbers() {
      if (!this.feedLive) return
      // Drift the hero stats gently
      this.prizePool += Math.floor(Math.random() * 900)
      this.activePlayers += Math.floor(Math.random() * 7) - 2
      this.liveCapital += Math.floor(Math.random() * 4e6)
      // Nudge one leaderboard PnL and re-rank
      const i = Math.floor(Math.random() * this.leaderboard.length)
      const row = this.leaderboard[i]
      row.value = Math.max(0, row.value + (Math.random() - 0.42) * 1400)
      row.justTicked = true
      setTimeout(() => { row.justTicked = false }, 700)
      this.leaderboard.sort((a, b) => b.value - a.value)
    },
    cyclePast(dir) {
      this.pastOffset += dir
    }
  }
}
</script>

<style scoped>
/* ==================================================================
   Paktos live dashboard — soft-neumorphic, Apple-clean.
   Light + dark themes driven by CSS variables on .dashboard.
   ================================================================== */

.dashboard {
  --bg: #eef1f6;
  --surface: #f4f6fa;
  --surface-raised: #f8fafd;
  --card: #fbfcfe;
  --text: #17181c;
  --text-soft: #5f6672;
  --text-faint: #9aa1ad;
  --line: rgba(23, 24, 28, 0.06);
  --shadow-dark: #d3d9e3;
  --shadow-light: #ffffff;
  --accent-a: #7c3aed;
  --accent-b: #d946ef;
  --green: #16a34a;
  --neu-out: -8px -8px 18px var(--shadow-light), 8px 8px 18px var(--shadow-dark);
  --neu-out-sm: -4px -4px 10px var(--shadow-light), 4px 4px 10px var(--shadow-dark);
  --neu-in: inset 4px 4px 10px var(--shadow-dark), inset -4px -4px 10px var(--shadow-light);
  --neu-in-sm: inset 2px 2px 6px var(--shadow-dark), inset -2px -2px 6px var(--shadow-light);

  display: flex;
  min-height: 100vh;
  background: var(--bg);
  color: var(--text);
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Inter, Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  letter-spacing: -0.01em;
  transition: background 0.4s ease, color 0.4s ease;
}

.dashboard.dark {
  --bg: #16181d;
  --surface: #1b1e24;
  --surface-raised: #20242b;
  --card: #1e2228;
  --text: #eef0f4;
  --text-soft: #a4abb8;
  --text-faint: #6b7280;
  --line: rgba(255, 255, 255, 0.06);
  --shadow-dark: #0d0e12;
  --shadow-light: #23272f;
}

.mono {
  font-family: 'SF Mono', ui-monospace, 'JetBrains Mono', Menlo, monospace;
  font-size: 0.72em;
  letter-spacing: 0.14em;
  font-weight: 500;
}

.mono-num {
  font-variant-numeric: tabular-nums;
}

.dot-sep {
  color: var(--text-faint);
  margin: 0 0.35em;
}

/* ---------------- Sidebar ---------------- */

.sidebar {
  position: sticky;
  top: 0;
  height: 100vh;
  width: 264px;
  flex: 0 0 264px;
  display: flex;
  flex-direction: column;
  padding: 28px 20px 24px;
  box-sizing: border-box;
}

.sidebar-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 40px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand-mark {
  width: 28px;
  height: 22px;
  color: var(--text);
  display: inline-flex;
}

.brand-mark svg {
  width: 100%;
  height: 100%;
}

.brand-name {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 10px 12px;
  border: none;
  border-radius: 16px;
  background: transparent;
  color: var(--text-soft);
  font-size: 15.5px;
  font-weight: 500;
  font-family: inherit;
  letter-spacing: -0.01em;
  cursor: pointer;
  transition: all 0.25s ease;
}

.nav-item:hover {
  color: var(--text);
}

.nav-item.active {
  background: var(--surface-raised);
  color: var(--text);
  font-weight: 600;
  box-shadow: var(--neu-out-sm);
}

.nav-icon {
  width: 36px;
  height: 36px;
  border-radius: 11px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-raised);
  box-shadow: var(--neu-out-sm);
  color: var(--text-soft);
  transition: all 0.25s ease;
}

.nav-icon svg {
  width: 18px;
  height: 18px;
}

.nav-icon.gradient {
  background: linear-gradient(135deg, #f7a8d8, var(--accent-a));
  color: #fff;
  box-shadow: 0 6px 14px rgba(124, 58, 237, 0.35);
}

.sidebar-bottom {
  margin-top: auto;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border-radius: 18px;
}

.user-avatar {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  padding: 2px;
  background: linear-gradient(135deg, var(--accent-b), var(--accent-a));
  display: inline-flex;
}

.user-avatar-inner {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #2b2f36;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
}

.user-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  font-weight: 600;
  font-size: 15px;
}

.user-rank {
  font-family: 'SF Mono', ui-monospace, Menlo, monospace;
  font-size: 11px;
  letter-spacing: 0.12em;
  color: var(--text-faint);
}

/* ---------------- Main / top bar ---------------- */

.main {
  flex: 1;
  min-width: 0;
  padding: 14px 14px 14px 0;
  box-sizing: border-box;
}

.main-inner {
  background: var(--surface);
  border-radius: 28px;
  box-shadow: var(--neu-out);
  padding: 30px 34px 40px;
  min-height: calc(100vh - 28px);
  box-sizing: border-box;
  transition: background 0.4s ease;
}

.topbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  padding-bottom: 22px;
  border-bottom: 1px solid var(--line);
  margin-bottom: 24px;
}

.page-title {
  margin: 0;
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.page-sub {
  margin: 6px 0 0;
  color: var(--text-faint);
  font-size: 13px;
}

.page-sub .mono {
  font-size: 11px;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 14px;
}

/* Neumorphic segmented Trader/Partner switch */

.segmented {
  display: inline-flex;
  cursor: pointer;
  user-select: none;
}

.segmented-state {
  display: none;
}

.segmented-track {
  position: relative;
  isolation: isolate;
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  width: 188px;
  height: 42px;
  border-radius: 21px;
  background: var(--surface);
  box-shadow: var(--neu-in-sm);
  overflow: hidden;
}

.segmented-thumb {
  position: absolute;
  z-index: 0;
  top: 4px;
  left: 4px;
  width: calc(50% - 8px);
  height: calc(100% - 8px);
  border-radius: 17px;
  background: var(--surface-raised);
  box-shadow: var(--neu-out-sm);
  transition: transform 0.4s cubic-bezier(0.85, 0.05, 0.18, 1.35);
}

.segmented-thumb.right {
  transform: translateX(calc(100% + 8px));
}

.segmented-option {
  position: relative;
  z-index: 1;
  text-align: center;
  font-size: 13.5px;
  font-weight: 500;
  color: var(--text-faint);
  transition: color 0.3s ease;
}

.segmented-option.on {
  color: var(--text);
  font-weight: 600;
}

/* Theme slide toggle (Uiverse-style indicator slider) */

.theme-label {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
}

.theme-toggle {
  isolation: isolate;
  position: relative;
  height: 32px;
  width: 64px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: -6px -3px 8px 0 var(--shadow-light), 6px 3px 10px 0 var(--shadow-dark),
    3px 3px 4px 0 var(--shadow-dark) inset, -3px -3px 4px 0 var(--shadow-light) inset;
}

.theme-state {
  display: none;
}

.theme-indicator {
  height: 100%;
  width: 200%;
  background: var(--surface);
  border-radius: 16px;
  transform: translate3d(-75%, 0, 0);
  transition: transform 0.4s cubic-bezier(0.85, 0.05, 0.18, 1.35), background 0.4s ease;
  box-shadow: -6px -3px 8px 0 var(--shadow-light), 6px 3px 10px 0 var(--shadow-dark);
}

.theme-state:checked ~ .theme-indicator {
  transform: translate3d(25%, 0, 0);
}

.theme-icon {
  position: absolute;
  top: 50%;
  width: 15px;
  height: 15px;
  transform: translateY(-50%);
  color: var(--text-faint);
  pointer-events: none;
  transition: color 0.3s ease, opacity 0.3s ease;
  z-index: 1;
}

.theme-icon svg {
  width: 100%;
  height: 100%;
  display: block;
}

.theme-icon.sun {
  left: 9px;
  color: var(--text);
}

.theme-icon.moon {
  right: 9px;
}

.theme-state:checked ~ .theme-icon.sun {
  color: var(--text-faint);
}

.theme-state:checked ~ .theme-icon.moon {
  color: var(--text);
}

/* Icon buttons */

.icon-btn {
  position: relative;
  width: 42px;
  height: 42px;
  border: none;
  border-radius: 14px;
  background: var(--surface);
  color: var(--text-soft);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: var(--neu-out-sm);
  transition: all 0.25s ease;
  padding: 0;
}

.icon-btn svg {
  width: 19px;
  height: 19px;
}

.icon-btn:hover {
  color: var(--text);
}

.icon-btn:active {
  box-shadow: var(--neu-in-sm);
}

.icon-btn.ghost {
  box-shadow: none;
  background: transparent;
  width: 34px;
  height: 34px;
}

.icon-btn.round {
  border-radius: 50%;
}

.bell-dot {
  position: absolute;
  top: 10px;
  right: 11px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--accent-b);
  box-shadow: 0 0 0 2.5px var(--surface);
  z-index: 1;
}

/* ---------------- Tabs ---------------- */

.tabs {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 26px;
}

.tab {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 11px 20px;
  border: none;
  border-radius: 15px;
  background: transparent;
  color: var(--text-faint);
  font-family: inherit;
  font-size: 14.5px;
  font-weight: 500;
  letter-spacing: -0.01em;
  cursor: pointer;
  transition: all 0.25s ease;
}

.tab svg {
  width: 17px;
  height: 17px;
}

.tab.active {
  background: var(--surface-raised);
  color: var(--text);
  font-weight: 600;
  box-shadow: var(--neu-out-sm);
}

.tab-count {
  color: var(--text-faint);
  font-weight: 500;
}

/* ---------------- Hero ---------------- */

.hero {
  position: relative;
  border-radius: 26px;
  background: var(--card);
  box-shadow: var(--neu-out);
  padding: 40px 40px 36px;
  margin-bottom: 44px;
  overflow: hidden;
}

.hero-glow {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(52% 90% at 12% 0%, rgba(217, 70, 239, 0.07), transparent 60%),
    radial-gradient(45% 80% at 88% 100%, rgba(124, 58, 237, 0.06), transparent 60%);
  pointer-events: none;
}

.hero-content {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(300px, 0.9fr);
  gap: 44px;
  align-items: start;
}

.live-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--text-soft);
  margin-bottom: 14px;
}

.live-badge .mono {
  font-size: 11px;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.5);
  animation: pulse 2s infinite;
  flex: 0 0 auto;
}

.pulse-dot.purple {
  background: var(--accent-a);
  box-shadow: 0 0 0 0 rgba(124, 58, 237, 0.45);
  animation-name: pulse-purple;
}

.pulse-dot.small {
  width: 6px;
  height: 6px;
}

.pulse-dot.tiny {
  width: 5px;
  height: 5px;
}

.pulse-dot.light {
  background: #a5f3c4;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.45); }
  70% { box-shadow: 0 0 0 7px rgba(34, 197, 94, 0); }
  100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
}

@keyframes pulse-purple {
  0% { box-shadow: 0 0 0 0 rgba(124, 58, 237, 0.4); }
  70% { box-shadow: 0 0 0 7px rgba(124, 58, 237, 0); }
  100% { box-shadow: 0 0 0 0 rgba(124, 58, 237, 0); }
}

.hero-title {
  margin: 0 0 16px;
  font-size: clamp(40px, 4.6vw, 58px);
  font-weight: 600;
  letter-spacing: -0.03em;
  line-height: 1.02;
}

.hero-title-accent {
  background: linear-gradient(92deg, var(--accent-a) 10%, var(--accent-b) 90%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.hero-desc {
  margin: 0 0 30px;
  max-width: 470px;
  color: var(--text-soft);
  font-size: 15px;
  line-height: 1.55;
}

.hero-stats {
  display: flex;
  gap: 54px;
  margin-bottom: 32px;
  flex-wrap: wrap;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-label {
  color: var(--text-faint);
  font-size: 11px;
}

.stat-value {
  font-size: 30px;
  font-weight: 700;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
}

.stat-value.sm {
  font-size: 21px;
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 28px;
  flex-wrap: wrap;
}

/* Primary dark pill button */

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 15px 30px;
  border: none;
  border-radius: 14px;
  background: linear-gradient(160deg, #24262c, #0c0d10);
  color: #fff;
  font-family: inherit;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.01em;
  cursor: pointer;
  box-shadow: 8px 10px 22px var(--shadow-dark), -6px -6px 16px var(--shadow-light),
    inset 0 1px 0 rgba(255, 255, 255, 0.12);
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-1px);
}

.btn-primary:active {
  transform: translateY(1px);
  box-shadow: 3px 4px 10px var(--shadow-dark), -3px -3px 8px var(--shadow-light);
}

/* Neumorphic soft button (Uiverse-style) */

.btn-neu {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  color: var(--text);
  padding: 15px 28px;
  font-size: 15px;
  font-weight: 500;
  font-family: inherit;
  letter-spacing: -0.01em;
  border-radius: 14px;
  background: var(--surface-raised);
  cursor: pointer;
  border: none;
  transition: all 0.3s ease;
  box-shadow: 6px 6px 14px var(--shadow-dark), -6px -6px 14px var(--shadow-light);
}

.btn-neu:hover {
  color: var(--accent-a);
}

.btn-neu:active {
  color: var(--text-soft);
  box-shadow: inset 4px 4px 12px var(--shadow-dark), inset -4px -4px 12px var(--shadow-light);
}

.btn-neu.enter {
  width: 100%;
  padding: 12px 18px;
  font-size: 14px;
  font-weight: 600;
}

.hero-social {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar-stack {
  display: flex;
}

.stack-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  border: 2.5px solid var(--card);
  margin-left: -9px;
}

.stack-avatar:first-child {
  margin-left: 0;
}

.hero-social-text {
  margin: 0;
  color: var(--text-soft);
  font-size: 13.5px;
}

.hero-social-text strong {
  color: var(--text);
  font-weight: 600;
}

/* ---------------- Leaderboard ---------------- */

.leaderboard {
  background: var(--surface-raised);
  border-radius: 20px;
  box-shadow: var(--neu-out-sm);
  border: 1px solid var(--line);
  padding: 22px 22px 16px;
}

.leaderboard-head {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 18px;
}

.leaderboard-title {
  font-size: 12px;
  color: var(--text);
  font-weight: 600;
}

.leaderboard-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.leaderboard-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px 10px;
  border-radius: 14px;
  transition: background 0.3s ease;
}

.leaderboard-row + .leaderboard-row {
  border-top: 1px solid var(--line);
}

.leaderboard-row.me {
  background: var(--surface);
  box-shadow: var(--neu-in-sm);
  border-top-color: transparent;
}

.board-move {
  transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}

.row-rank {
  color: var(--text-faint);
  font-size: 11px;
  width: 20px;
}

.row-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: linear-gradient(135deg, #cfd6e0, #aab3c2);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12.5px;
  font-weight: 600;
  overflow: hidden;
  flex: 0 0 auto;
}

.row-name {
  flex: 1;
  min-width: 0;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.row-you {
  color: var(--accent-b);
  font-weight: 500;
}

.row-flag {
  margin-left: 5px;
  font-size: 12.5px;
}

.row-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-soft);
  transition: color 0.3s ease;
}

.row-value.ticked {
  color: var(--accent-a);
}

.link-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  padding: 10px 8px;
  border: none;
  background: transparent;
  color: var(--text);
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: gap 0.25s ease, color 0.25s ease;
}

.link-btn svg {
  width: 16px;
  height: 16px;
}

.link-btn:hover {
  gap: 12px;
  color: var(--accent-a);
}

/* ---------------- Sections ---------------- */

.section {
  margin-bottom: 46px;
}

.section:last-child {
  margin-bottom: 0;
}

.section-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.section-title {
  margin: 0;
  font-size: 21px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.section-sub {
  margin: 6px 0 0;
  color: var(--text-faint);
  font-size: 13px;
}

.section-sub .mono {
  font-size: 11px;
}

.section-head-right {
  display: flex;
  align-items: center;
  gap: 18px;
  flex-wrap: wrap;
}

/* LED live-feed switch (Uiverse-style, scaled down) */

.feed-switch {
  display: flex;
  align-items: center;
  gap: 12px;
}

.feed-label {
  font-size: 10px;
  color: var(--text-faint);
}

.switch-container {
  position: relative;
  width: 86px;
  height: 36px;
  background: var(--surface);
  border-radius: 50px;
  box-shadow: var(--neu-in-sm);
}

.toggle-checkbox {
  display: none;
}

.switch {
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  height: 100%;
  transform: translateY(-50%);
  border-radius: 50px;
  overflow: hidden;
  cursor: pointer;
}

.switch .toggle {
  position: absolute;
  width: 44px;
  height: 28px;
  background: linear-gradient(145deg, var(--surface-raised), var(--surface));
  border-radius: 50px;
  top: 4px;
  left: 4px;
  box-shadow: -3px -3px 6px var(--shadow-light), 3px 3px 6px var(--shadow-dark);
  transition: all 0.3s ease-in-out;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding-left: 8px;
  box-sizing: border-box;
}

.led {
  width: 8px;
  height: 8px;
  background: var(--text-faint);
  border-radius: 50%;
  box-shadow: 0 0 8px 1px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease-in-out;
}

.toggle-checkbox:checked + .switch .toggle {
  left: 38px;
}

.toggle-checkbox:checked + .switch .led {
  background: #22c55e;
  box-shadow: 0 0 10px 3px rgba(34, 197, 94, 0.6);
}

.switch:hover .toggle {
  box-shadow: -3px -3px 9px var(--shadow-light), 3px 3px 9px var(--shadow-dark);
}

/* Neumorphic search input (Uiverse-style) */

.neu-input {
  border: none;
  padding: 12px 18px;
  border-radius: 13px;
  width: 190px;
  background: var(--surface);
  color: var(--text);
  font-family: inherit;
  font-size: 13.5px;
  box-shadow: 6px 6px 14px var(--shadow-dark), -6px -6px 14px var(--shadow-light);
  transition: 0.3s;
  box-sizing: border-box;
}

.neu-input::placeholder {
  color: var(--text-faint);
}

.neu-input:focus {
  outline: none;
  box-shadow: inset 5px 5px 12px var(--shadow-dark), inset -5px -5px 12px var(--shadow-light);
}

/* ---------------- Tournament cards ---------------- */

.tournament-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 18px;
}

.tournament-card {
  background: var(--card);
  border-radius: 20px;
  box-shadow: var(--neu-out-sm);
  padding: 20px 18px 18px;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}

.tournament-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--neu-out);
}

.tournament-card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
}

.trophy-tile {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #f9a8d4 0%, #c084fc 55%, #a855f7 100%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 16px rgba(168, 85, 247, 0.3);
}

.trophy-tile svg {
  width: 20px;
  height: 20px;
}

.live-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--text-faint);
}

.live-tag .mono {
  font-size: 10px;
}

.tournament-name {
  margin: 0 0 6px;
  font-size: 11px;
  color: var(--text-soft);
}

.tournament-pool {
  margin: 0 0 16px;
  font-size: 27px;
  font-weight: 700;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
}

.tournament-meta {
  border-top: 1px dashed var(--line);
  padding-top: 13px;
  margin-bottom: 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.tournament-meta p {
  margin: 0;
  font-size: 12.5px;
  color: var(--text-faint);
}

.closes {
  color: var(--accent-a);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

/* ---------------- Hall of Fame ---------------- */

.fame-card {
  background: var(--card);
  border-radius: 22px;
  box-shadow: var(--neu-out-sm);
  padding: 8px 26px;
}

.fame-scroll {
  overflow-x: auto;
}

.fame-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 760px;
}

.fame-table thead th {
  text-align: left;
  padding: 18px 12px 14px;
  font-size: 10.5px;
  color: var(--text-faint);
  font-weight: 500;
  border-bottom: 1px solid var(--line);
}

.fame-table tbody td {
  padding: 15px 12px;
  font-size: 14px;
  border-bottom: 1px solid var(--line);
}

.fame-table tbody tr:last-child td {
  border-bottom: none;
}

.fame-table tbody tr {
  transition: background 0.2s ease;
}

.fame-table tbody tr:hover {
  background: var(--surface);
}

.col-rank { width: 46px; }
.col-place, .col-pool, .col-entry { color: var(--text-soft); }
.col-tournament { color: var(--text); }
.col-winning { text-align: right; }

.rank-num {
  color: var(--accent-a);
  font-size: 12px;
}

.fame-player {
  display: inline-flex;
  align-items: center;
  gap: 11px;
}

.fame-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #cfd6e0, #aab3c2);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
}

.fame-name {
  font-weight: 600;
}

.winning-amount {
  display: block;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.winning-return {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 3px;
  color: var(--green);
  font-size: 12px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.winning-return svg {
  width: 13px;
  height: 13px;
}

.fame-empty {
  text-align: center;
  color: var(--text-faint);
  padding: 30px 0 !important;
}

/* ---------------- Past tournaments ---------------- */

.pager {
  display: flex;
  gap: 10px;
}

.past-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 22px;
}

.past-card {
  background: var(--card);
  border-radius: 22px;
  box-shadow: var(--neu-out-sm);
  padding: 14px 14px 0;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.past-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--neu-out);
}

.past-art {
  position: relative;
  height: 210px;
  border-radius: 15px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.art-silver {
  background: linear-gradient(150deg, #e9ebf2 0%, #d4d8e4 45%, #c3c9da 100%);
}

.art-mag {
  background: linear-gradient(150deg, #ecedf3 0%, #dcdfe9 50%, #cdd2e0 100%);
}

.art-duo {
  background: linear-gradient(150deg, #eceef4 0%, #dadeE8 50%, #c9cfdd 100%);
}

.dark .art-silver,
.dark .art-mag,
.dark .art-duo {
  filter: brightness(0.55) saturate(1.1);
}

.past-chip {
  position: absolute;
  top: 14px;
  left: 14px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  color: #3c4250;
  font-size: 12.5px;
  font-weight: 500;
  z-index: 2;
}

.past-chip svg {
  width: 13px;
  height: 13px;
}

.past-chip.right {
  left: auto;
  right: 14px;
}

/* Stylised coin art */

.coin-scene {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.coin {
  position: relative;
  z-index: 1;
  width: 108px;
  height: 108px;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: rotate(-10deg);
  animation: coin-float 5s ease-in-out infinite;
}

.coin svg {
  width: 52px;
  height: 40px;
}

.coin-round {
  border-radius: 50%;
  background:
    radial-gradient(circle at 32% 26%, #ffffff 0%, #e3e6ee 38%, #b9bfd0 72%, #9aa2b8 100%);
  box-shadow:
    inset 0 -6px 14px rgba(90, 98, 125, 0.45),
    inset 0 6px 10px rgba(255, 255, 255, 0.9),
    0 22px 34px rgba(74, 82, 110, 0.35);
  color: #8d94ab;
}

.coin-square {
  border-radius: 26px;
  background: linear-gradient(140deg, #f472b6 0%, #c026d3 48%, #7c3aed 100%);
  box-shadow:
    inset 0 -6px 14px rgba(76, 15, 130, 0.55),
    inset 0 6px 10px rgba(255, 255, 255, 0.45),
    0 22px 34px rgba(124, 58, 237, 0.4);
  color: rgba(255, 255, 255, 0.92);
}

.coin-duo {
  border-radius: 26px;
  background: linear-gradient(140deg, #e879f9 0%, #a21caf 55%, #6d28d9 100%);
  box-shadow:
    inset 0 -6px 14px rgba(76, 15, 130, 0.55),
    inset 0 6px 10px rgba(255, 255, 255, 0.45),
    0 22px 34px rgba(124, 58, 237, 0.4);
  color: rgba(255, 255, 255, 0.92);
}

.coin-duo::before {
  content: '€';
  position: absolute;
  top: -26px;
  right: -34px;
  width: 76px;
  height: 76px;
  border-radius: 50%;
  background: radial-gradient(circle at 32% 26%, #ffffff 0%, #dfe3ec 40%, #adb5c9 100%);
  box-shadow:
    inset 0 -4px 10px rgba(90, 98, 125, 0.45),
    inset 0 4px 8px rgba(255, 255, 255, 0.9),
    0 16px 26px rgba(74, 82, 110, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 34px;
  font-weight: 700;
  color: #7d859c;
  transform: rotate(12deg);
}

.coin-duo svg {
  transform: translate(-6px, 6px);
}

@keyframes coin-float {
  0%, 100% { transform: rotate(-10deg) translateY(0); }
  50% { transform: rotate(-8deg) translateY(-7px); }
}

.coin-shadow {
  position: absolute;
  bottom: -34px;
  width: 120px;
  height: 22px;
  border-radius: 50%;
  background: radial-gradient(ellipse, rgba(60, 66, 90, 0.28), transparent 70%);
}

.past-stats {
  display: flex;
  justify-content: space-between;
  padding: 22px 12px 20px;
  gap: 12px;
}

.past-stats .stat {
  gap: 6px;
}

.past-stats .stat-label {
  font-size: 10px;
}

.past-footer {
  border-top: 1px solid var(--line);
  margin: 0 -14px;
  padding: 15px 26px 17px;
  text-align: center;
  color: var(--text-soft);
  font-size: 13.5px;
  background: var(--surface);
}

/* ---------------- Responsive ---------------- */

@media (max-width: 1420px) {
  .tournament-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 1180px) {
  .hero-content {
    grid-template-columns: 1fr;
  }

  .past-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .sidebar {
    display: none;
  }

  .main {
    padding: 10px;
  }

  .main-inner {
    padding: 22px 18px 30px;
  }

  .tournament-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .hero {
    padding: 28px 22px;
  }

  .hero-stats {
    gap: 28px;
  }

  .topbar {
    flex-direction: column;
  }
}

@media (max-width: 560px) {
  .tournament-grid {
    grid-template-columns: 1fr;
  }
}
</style>
