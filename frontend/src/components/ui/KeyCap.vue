<template>
  <component
    :is="tag"
    class="keycap"
    :class="[
      `keycap--${variant}`,
      `keycap--${size}`,
      { 'keycap--wide': wide, 'keycap--script': script, 'keycap--pressed': pressed }
    ]"
    :href="href || undefined"
    :target="href ? '_blank' : undefined"
    :rel="href ? 'noopener noreferrer' : undefined"
    :type="tag === 'button' ? 'button' : undefined"
    :aria-label="ariaLabel || label"
    @click="onClick"
  >
    <span class="keycap__top">
      <span v-if="variant === 'glass'" class="keycap__frame" aria-hidden="true"></span>
      <span class="keycap__label"><slot>{{ label }}</slot></span>
      <span v-if="hint" class="keycap__hint" aria-hidden="true">{{ hint }}</span>
    </span>
  </component>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  label: { type: String, default: '' },
  /* light | accent | glass */
  variant: { type: String, default: 'light' },
  /* sm | md | lg */
  size: { type: String, default: 'md' },
  wide: { type: Boolean, default: false },
  /* 手写体（品牌键） */
  script: { type: Boolean, default: false },
  /* 外部链接 */
  href: { type: String, default: '' },
  /* 站内路由 */
  to: { type: [String, Object], default: '' },
  hint: { type: String, default: '' },
  ariaLabel: { type: String, default: '' },
  /* 由父组件驱动的按下状态（快捷键反馈） */
  pressed: { type: Boolean, default: false }
})

const emit = defineEmits(['press'])
const router = useRouter()

const tag = computed(() => (props.href ? 'a' : 'button'))

function onClick() {
  emit('press')
  if (props.to) router.push(props.to)
}
</script>

<style scoped>
.keycap {
  position: relative;
  display: inline-block;
  border: none;
  padding: 0;
  background: transparent;
  cursor: pointer;
  text-decoration: none;
  -webkit-tap-highlight-color: transparent;
  font-family: var(--mf-font-mono);
}

.keycap:focus-visible {
  outline: 2px solid var(--mf-orange);
  outline-offset: 5px;
  border-radius: var(--mf-key-radius);
}

.keycap__top {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--mf-key-radius);
  transition: transform 0.08s ease, box-shadow 0.08s ease, filter 0.15s ease;
}

/* ---- 尺寸 ---- */
.keycap--sm .keycap__top { width: 48px; height: 48px; }
.keycap--md .keycap__top { width: 62px; height: 62px; }
.keycap--lg .keycap__top { width: 76px; height: 76px; }
.keycap--wide.keycap--sm .keycap__top { width: 76px; }
.keycap--wide.keycap--md .keycap__top { width: 98px; }
.keycap--wide.keycap--lg .keycap__top { width: 120px; }

/* ---- 奶白键 ---- */
.keycap--light .keycap__top {
  background: linear-gradient(148deg, var(--mf-cream-hi) 0%, var(--mf-cream) 55%, var(--mf-cream-lo) 100%);
  box-shadow:
    inset 0 1.5px 1px rgba(255, 255, 255, 0.95),
    inset 0 -5px 8px rgba(70, 55, 30, 0.1),
    inset 2px 0 4px rgba(255, 255, 255, 0.4),
    0 5px 0 var(--mf-cream-side),
    0 11px 20px rgba(0, 0, 0, 0.5);
}
.keycap--light .keycap__label { color: var(--mf-ink); }

/* ---- 橙色键 ---- */
.keycap--accent .keycap__top {
  background: linear-gradient(148deg, var(--mf-orange-hi) 0%, var(--mf-orange) 55%, var(--mf-orange-lo) 100%);
  box-shadow:
    inset 0 1.5px 1px rgba(255, 220, 170, 0.8),
    inset 0 -5px 8px rgba(120, 50, 0, 0.28),
    0 5px 0 var(--mf-orange-side),
    0 11px 22px rgba(0, 0, 0, 0.5),
    0 6px 26px rgba(249, 124, 22, 0.28);
}
.keycap--accent .keycap__label { color: var(--mf-paper); }

/* ---- 琥珀玻璃键 ---- */
.keycap--glass .keycap__top {
  background:
    radial-gradient(120% 90% at 50% 0%, rgba(255, 140, 40, 0.22), transparent 55%),
    var(--mf-glass-bg);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  border: 1.5px solid var(--mf-glass-rim);
  box-shadow:
    inset 0 0 16px var(--mf-glass-glow),
    inset 0 -6px 10px rgba(255, 100, 10, 0.18),
    0 5px 0 rgba(120, 55, 8, 0.85),
    0 11px 22px rgba(0, 0, 0, 0.6),
    0 0 24px rgba(255, 122, 26, 0.22);
}
.keycap--glass .keycap__label {
  color: var(--mf-paper);
  text-shadow: 0 0 10px rgba(255, 150, 60, 0.8);
}
.keycap--glass .keycap__frame {
  position: absolute;
  inset: 22%;
  border: 1px solid rgba(255, 122, 26, 0.5);
  border-radius: 4px;
  pointer-events: none;
}

/* ---- 标签 ---- */
.keycap__label {
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: lowercase;
  line-height: 1;
  user-select: none;
  white-space: nowrap;
}
.keycap--sm .keycap__label { font-size: 11px; }
.keycap--lg .keycap__label { font-size: 15px; }

/* 手写体品牌键 */
.keycap--script .keycap__label {
  font-family: var(--mf-font-display);
  font-style: italic;
  font-weight: 700;
  text-transform: none;
  letter-spacing: 0.02em;
}

/* 快捷键角标 */
.keycap__hint {
  position: absolute;
  right: 7px;
  bottom: 5px;
  font-size: 8px;
  letter-spacing: 0.05em;
  opacity: 0.45;
  color: inherit;
  font-family: var(--mf-font-mono);
}
.keycap--light .keycap__hint { color: var(--mf-ink); }
.keycap--accent .keycap__hint,
.keycap--glass .keycap__hint { color: var(--mf-paper); }

/* ---- 按下 ---- */
.keycap:hover .keycap__top { filter: brightness(1.05); }
.keycap:active .keycap__top,
.keycap--pressed .keycap__top {
  transform: translateY(4px);
  filter: brightness(0.97);
}
.keycap--light:active .keycap__top,
.keycap--light.keycap--pressed .keycap__top {
  box-shadow:
    inset 0 1.5px 1px rgba(255, 255, 255, 0.95),
    inset 0 -4px 6px rgba(70, 55, 30, 0.12),
    0 1px 0 var(--mf-cream-side),
    0 4px 10px rgba(0, 0, 0, 0.45);
}
.keycap--accent:active .keycap__top,
.keycap--accent.keycap--pressed .keycap__top {
  box-shadow:
    inset 0 1.5px 1px rgba(255, 220, 170, 0.8),
    inset 0 -4px 6px rgba(120, 50, 0, 0.3),
    0 1px 0 var(--mf-orange-side),
    0 4px 10px rgba(0, 0, 0, 0.45),
    0 3px 16px rgba(249, 124, 22, 0.25);
}
.keycap--glass:active .keycap__top,
.keycap--glass.keycap--pressed .keycap__top {
  box-shadow:
    inset 0 0 16px var(--mf-glass-glow),
    0 1px 0 rgba(120, 55, 8, 0.85),
    0 4px 10px rgba(0, 0, 0, 0.5),
    0 0 18px rgba(255, 122, 26, 0.2);
}
</style>
