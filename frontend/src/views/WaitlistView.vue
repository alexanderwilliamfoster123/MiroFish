<template>
  <div class="waitlist-page">
    <div class="waitlist-card">
      <!-- Logo -->
      <div class="logo">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M30 76 V24 h28 c10 0 18 8 18 18 s-8 18 -18 18 h-18"
            stroke="white"
            stroke-width="9"
            stroke-linecap="round"
            stroke-linejoin="round"
            fill="none"
          />
        </svg>
      </div>

      <h1 class="title">Paktos</h1>
      <p class="subtitle">Be the first to trade what happens next</p>
      <p class="count" v-if="countLabel">{{ countLabel }}</p>

      <!-- Subscribe form -->
      <form v-if="!subscribed" class="subscribe-form" @submit.prevent="onSubmit">
        <input
          v-model="email"
          type="email"
          class="email-input"
          placeholder="Type your email…"
          autocomplete="email"
          required
          :disabled="submitting"
        />
        <button type="submit" class="subscribe-btn" :disabled="submitting">
          {{ submitting ? 'Joining…' : 'Join waitlist' }}
        </button>
      </form>

      <!-- Success state -->
      <div v-else class="success">
        <span class="success-check">✓</span>
        {{ alreadySubscribed ? "You're already on the list." : "You're on the list. See you at launch." }}
      </div>

      <p v-if="error" class="error">{{ error }}</p>

      <p class="legal" v-if="!subscribed">
        By subscribing, you agree to Paktos'
        <a href="#" @click.prevent>Terms of Use</a>, and acknowledge its
        <a href="#" @click.prevent>Information Collection Notice</a> and
        <a href="#" @click.prevent>Privacy Policy</a>.
      </p>

      <router-link to="/" class="no-thanks">
        No thanks <span class="chevron">›</span>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { subscribeWaitlist, getWaitlistCount } from '../api/waitlist'

const email = ref('')
const submitting = ref(false)
const subscribed = ref(false)
const alreadySubscribed = ref(false)
const error = ref('')
const count = ref(null)

const countLabel = computed(() => {
  if (count.value === null) return ''
  if (count.value >= 100) return `Over ${count.value.toLocaleString()} people on the waitlist`
  if (count.value > 0) return `Join ${count.value.toLocaleString()} ${count.value === 1 ? 'person' : 'people'} already on the waitlist`
  return 'Be among the first to join'
})

onMounted(async () => {
  try {
    const res = await getWaitlistCount()
    count.value = res.count
  } catch {
    // 人数加载失败时静默降级，不影响订阅
  }
})

const onSubmit = async () => {
  error.value = ''
  submitting.value = true
  try {
    const res = await subscribeWaitlist(email.value)
    subscribed.value = true
    alreadySubscribed.value = res.already_subscribed
    if (typeof res.count === 'number') count.value = res.count
  } catch (e) {
    error.value = e.message || 'Something went wrong. Please try again.'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.waitlist-page {
  min-height: 100vh;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

.waitlist-card {
  width: 100%;
  max-width: 680px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.logo {
  width: 150px;
  height: 150px;
  background: #4a5df9;
  border-radius: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 56px;
}

.logo svg {
  width: 72%;
  height: 72%;
}

.title {
  font-size: 44px;
  font-weight: 700;
  color: #1a1a1a;
  letter-spacing: -0.5px;
  margin: 0 0 20px;
}

.subtitle {
  font-size: 24px;
  color: #6b6b6b;
  margin: 0 0 28px;
  font-weight: 400;
}

.count {
  font-size: 18px;
  font-weight: 700;
  color: #6b6b6b;
  margin: 0 0 36px;
}

.subscribe-form {
  display: flex;
  width: 100%;
  max-width: 620px;
  margin-bottom: 32px;
}

.email-input {
  flex: 1;
  min-width: 0;
  font-size: 20px;
  padding: 18px 22px;
  border: 1px solid #d6d6d6;
  border-right: none;
  border-radius: 14px 0 0 14px;
  outline: none;
  color: #1a1a1a;
}

.email-input::placeholder {
  color: #a3a3a3;
}

.email-input:focus {
  border-color: #4a5df9;
}

.subscribe-btn {
  font-size: 20px;
  font-weight: 600;
  color: #ffffff;
  background: #4a5df9;
  border: none;
  border-radius: 0 14px 14px 0;
  padding: 18px 34px;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s ease;
}

.subscribe-btn:hover:not(:disabled) {
  background: #3a4be0;
}

.subscribe-btn:disabled {
  opacity: 0.7;
  cursor: default;
}

.success {
  font-size: 22px;
  color: #1a1a1a;
  font-weight: 600;
  margin-bottom: 32px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.success-check {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #4a5df9;
  color: #fff;
  font-size: 17px;
}

.error {
  color: #d63333;
  font-size: 16px;
  margin: -16px 0 24px;
}

.legal {
  font-size: 18px;
  color: #6b6b6b;
  line-height: 1.55;
  max-width: 560px;
  margin: 0 0 40px;
}

.legal a {
  color: #6b6b6b;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.no-thanks {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.no-thanks:hover {
  opacity: 0.75;
}

.chevron {
  font-size: 24px;
  line-height: 1;
  font-weight: 400;
}

@media (max-width: 560px) {
  .logo {
    width: 110px;
    height: 110px;
    border-radius: 24px;
    margin-bottom: 36px;
  }

  .title {
    font-size: 32px;
  }

  .subtitle {
    font-size: 18px;
  }

  .subscribe-form {
    flex-direction: column;
    gap: 12px;
  }

  .email-input {
    border-right: 1px solid #d6d6d6;
    border-radius: 14px;
    text-align: center;
  }

  .subscribe-btn {
    border-radius: 14px;
    padding: 16px;
  }
}
</style>
