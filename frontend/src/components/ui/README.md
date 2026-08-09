# MiroFish 键帽设计系统 (Keycap Design System)

灵感来自机械键盘键帽：黑色面板上的奶白、橙色与琥珀玻璃按键。
全站任何地方都可以复用这套组件与设计变量。

## 设计变量 (Design Tokens)

定义在 `src/styles/keys.css`，已在 `main.js` 全局引入。
在任何组件的样式里直接使用，例如：

```css
.my-card {
  background: var(--mf-panel);
  border-radius: var(--mf-panel-radius);
  color: var(--mf-paper);
  font-family: var(--mf-font-mono);
}
.my-highlight { color: var(--mf-orange); }
```

| 变量 | 用途 |
| --- | --- |
| `--mf-black` / `--mf-panel` / `--mf-panel-edge` | 黑色背景与面板 |
| `--mf-cream*` | 奶白键帽的高光 / 主色 / 阴影 / 侧面 |
| `--mf-orange*` | 橙色键帽同上 |
| `--mf-glass-*` | 琥珀玻璃键的底色 / 边框 / 辉光 |
| `--mf-ink` / `--mf-paper` | 深色 / 浅色文字 |
| `--mf-key-radius` / `--mf-panel-radius` | 键帽 / 面板圆角 |
| `--mf-font-mono` / `--mf-font-display` | 等宽 / 展示字体 |

## KeyCap 按键组件

```vue
<script setup>
import KeyCap from '@/components/ui/KeyCap.vue'
</script>

<template>
  <!-- 奶白键，站内路由跳转 -->
  <KeyCap label="home" to="/" />

  <!-- 橙色手写体品牌键，外部链接（自动新窗口打开） -->
  <KeyCap label="MiroFish" variant="accent" script wide href="https://github.com/666ghj/MiroFish" />

  <!-- 琥珀玻璃键，自定义点击 -->
  <KeyCap variant="glass" @press="doSomething">&amp;</KeyCap>
</template>
```

### Props

| Prop | 类型 | 说明 |
| --- | --- | --- |
| `label` | String | 键面文字（也可用默认插槽） |
| `variant` | `light` / `accent` / `glass` | 奶白 / 橙色 / 琥珀玻璃 |
| `size` | `sm` / `md` / `lg` | 48 / 62 / 76 px |
| `wide` | Boolean | 1.5 倍宽键 |
| `script` | Boolean | 手写斜体（品牌键） |
| `to` | String / Object | 站内路由 |
| `href` | String | 外部链接 |
| `hint` | String | 右下角快捷键角标 |
| `pressed` | Boolean | 外部驱动的按下状态（快捷键反馈用） |

事件：`@press` — 按下时触发。

## ControlPanel 全站控制台

已在 `App.vue` 挂载，出现在每个页面右下角：

- 琥珀玻璃 `&` 键：展开 / 收起键盘面板
- `home`：回主页 · `pages`：站内页面列表（自动记录最近访问的项目页）
- `email`：一键发邮件 · `MiroFish` 橙色键：GitHub 主页
- 快捷键：`&` 开关，展开后 `h` / `p` / `e` / `g`，`esc` 收起

联系邮箱与 GitHub 地址在 `ControlPanel.vue` 顶部的常量里修改。
