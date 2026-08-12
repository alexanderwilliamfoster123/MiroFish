<template>
  <div class="spline-scene" :class="{ 'is-ready': state === 'ready' }">
    <canvas ref="canvasEl" class="spline-scene__canvas"></canvas>

    <div v-if="state === 'loading'" class="spline-scene__status" aria-hidden="true">
      <span class="spline-scene__dot"></span> loading scene…
    </div>

    <!-- WebGL 不可用或加载失败时显示后备内容 -->
    <div v-if="state === 'error'" class="spline-scene__fallback">
      <slot name="fallback"></slot>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  /* .splinecode 文件地址（放在 public/ 下） */
  url: { type: String, required: true }
})

const emit = defineEmits(['ready', 'error'])

const canvasEl = ref(null)
const state = ref('loading')
let app = null

onMounted(async () => {
  try {
    // 运行时较大（约 700KB gzip），按需加载避免拖慢首屏
    const { Application } = await import('@splinetool/runtime')
    app = new Application(canvasEl.value)
    await app.load(props.url)
    state.value = 'ready'
    emit('ready', app)
  } catch (err) {
    state.value = 'error'
    emit('error', err)
  }
})

onBeforeUnmount(() => {
  if (app) {
    try { app.dispose() } catch { /* 已释放 */ }
    app = null
  }
})
</script>

<style scoped>
.spline-scene {
  position: relative;
  width: 100%;
  height: 100%;
}

.spline-scene__canvas {
  display: block;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.6s ease;
}

.spline-scene.is-ready .spline-scene__canvas {
  opacity: 1;
}

.spline-scene__status {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: var(--mf-font-mono);
  font-size: 11px;
  letter-spacing: 0.14em;
  color: rgba(0, 0, 0, 0.4);
}

.spline-scene__dot {
  width: 6px;
  height: 6px;
  background: var(--mf-orange);
  box-shadow: 0 0 8px var(--mf-glass-glow);
  animation: spline-pulse 1s ease-in-out infinite;
}

@keyframes spline-pulse {
  50% { opacity: 0.3; }
}

@media (prefers-reduced-motion: reduce) {
  .spline-scene__canvas { transition: none; }
  .spline-scene__dot { animation: none; }
}

.spline-scene__fallback {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
