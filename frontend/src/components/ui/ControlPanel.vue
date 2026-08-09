<template>
  <nav class="cp" aria-label="MiroFish 控制台">
    <transition name="cp-pop">
      <div v-if="open" class="cp__panel">
        <div class="cp__header">
          <span class="cp__dot" aria-hidden="true"></span>
          <span class="cp__title">mirofish · control</span>
          <span class="cp__ver">v0.1</span>
        </div>

        <transition name="cp-pop">
          <div v-if="pagesOpen" class="cp__pages">
            <button class="cp__page-link" @click="go('/')">
              <span class="cp__page-num">01</span> 主页 / Home
            </button>
            <button
              v-for="page in recentPages"
              :key="page.fullPath"
              class="cp__page-link"
              @click="go(page.fullPath)"
            >
              <span class="cp__page-num">↩</span> {{ page.title }}
            </button>
            <div v-if="recentPages.length === 0" class="cp__page-empty">
              浏览过的项目页面会出现在这里
            </div>
          </div>
        </transition>

        <div class="cp__keys">
          <KeyCap label="home" hint="h" :pressed="flash === 'h'" @press="go('/')" />
          <KeyCap label="pages" hint="p" :pressed="flash === 'p'" @press="pagesOpen = !pagesOpen" />
          <KeyCap label="email" hint="e" :pressed="flash === 'e'" :href="`mailto:${CONTACT_EMAIL}`" aria-label="发邮件联系我" />
          <KeyCap
            label="MiroFish"
            variant="accent"
            script
            wide
            hint="g"
            :pressed="flash === 'g'"
            :href="GITHUB_URL"
            aria-label="访问 GitHub 主页"
          />
        </div>

        <div class="cp__hints">h 主页 · p 页面 · e 邮件 · g github · esc 收起</div>
      </div>
    </transition>

    <KeyCap
      variant="glass"
      :pressed="flash === '&'"
      :aria-label="open ? '收起控制台' : '展开控制台'"
      @press="toggle"
    >&amp;</KeyCap>
  </nav>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import KeyCap from './KeyCap.vue'

const CONTACT_EMAIL = 'alex@vertus.ai'
const GITHUB_URL = 'https://github.com/666ghj/MiroFish'
const RECENT_KEY = 'mf.recentPages'

const PAGE_TITLES = {
  Process: '项目流程 / Process',
  Simulation: '模拟配置 / Simulation',
  SimulationRun: '模拟运行 / Run',
  Report: '预测报告 / Report',
  Interaction: '深度互动 / Interaction'
}

const router = useRouter()
const open = ref(false)
const pagesOpen = ref(false)
const flash = ref('')
const recentPages = ref([])

let flashTimer = null
let removeAfterEach = null

function toggle() {
  open.value = !open.value
  if (!open.value) pagesOpen.value = false
}

function go(path) {
  router.push(path)
  pagesOpen.value = false
}

function flashKey(k) {
  flash.value = k
  clearTimeout(flashTimer)
  flashTimer = setTimeout(() => (flash.value = ''), 160)
}

function loadRecent() {
  try {
    recentPages.value = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]')
  } catch {
    recentPages.value = []
  }
}

function rememberPage(route) {
  const title = PAGE_TITLES[route.name]
  if (!title) return
  const list = recentPages.value.filter((p) => p.fullPath !== route.fullPath)
  list.unshift({ fullPath: route.fullPath, title })
  recentPages.value = list.slice(0, 5)
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(recentPages.value))
  } catch {
    /* 隐私模式下忽略 */
  }
}

function onKeydown(e) {
  const t = e.target
  if (
    e.metaKey || e.ctrlKey || e.altKey ||
    t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable
  ) {
    return
  }

  if (e.key === 'Escape' && open.value) {
    toggle()
    flashKey('&')
    return
  }
  if (e.key === '&') {
    toggle()
    flashKey('&')
    return
  }
  if (!open.value) return

  switch (e.key.toLowerCase()) {
    case 'h':
      flashKey('h')
      go('/')
      break
    case 'p':
      flashKey('p')
      pagesOpen.value = !pagesOpen.value
      break
    case 'e':
      flashKey('e')
      window.location.href = `mailto:${CONTACT_EMAIL}`
      break
    case 'g':
      flashKey('g')
      window.open(GITHUB_URL, '_blank', 'noopener')
      break
  }
}

onMounted(() => {
  loadRecent()
  removeAfterEach = router.afterEach((to) => rememberPage(to))
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  if (removeAfterEach) removeAfterEach()
  clearTimeout(flashTimer)
})
</script>

<style scoped>
.cp {
  position: fixed;
  right: 22px;
  bottom: 22px;
  z-index: 9999;
  display: flex;
  align-items: flex-end;
  gap: 16px;
}

.cp__panel {
  background: var(--mf-panel);
  border: 1px solid var(--mf-panel-edge);
  border-radius: var(--mf-panel-radius);
  padding: 14px 18px 12px;
  box-shadow: var(--mf-panel-shadow);
}

.cp__header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
  font-family: var(--mf-font-mono);
  font-size: 10px;
  letter-spacing: 0.14em;
  color: rgba(255, 255, 255, 0.55);
}

.cp__dot {
  width: 6px;
  height: 6px;
  background: var(--mf-orange);
  box-shadow: 0 0 8px var(--mf-glass-glow);
}

.cp__ver {
  margin-left: auto;
  opacity: 0.5;
}

.cp__keys {
  display: flex;
  align-items: center;
  gap: 13px;
  padding-bottom: 6px;
}

.cp__pages {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 14px;
  padding: 8px;
  border: 1px solid var(--mf-panel-edge);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
}

.cp__page-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 10px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: rgba(255, 255, 255, 0.82);
  font-family: var(--mf-font-mono);
  font-size: 12px;
  text-align: left;
  cursor: pointer;
  transition: background 0.12s ease, color 0.12s ease;
}

.cp__page-link:hover {
  background: rgba(249, 124, 22, 0.14);
  color: #fff;
}

.cp__page-num {
  color: var(--mf-orange);
  font-size: 10px;
}

.cp__page-empty {
  padding: 7px 10px;
  font-family: var(--mf-font-mono);
  font-size: 11px;
  color: rgba(255, 255, 255, 0.35);
}

.cp__hints {
  margin-top: 10px;
  font-family: var(--mf-font-mono);
  font-size: 9px;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.3);
  text-align: center;
}

/* 弹出动画 */
.cp-pop-enter-active,
.cp-pop-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.cp-pop-enter-from,
.cp-pop-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.97);
}

@media (max-width: 640px) {
  .cp {
    right: 14px;
    bottom: 14px;
    gap: 12px;
  }
  .cp__panel {
    padding: 12px 12px 10px;
  }
  .cp__keys {
    gap: 10px;
  }
}
</style>
