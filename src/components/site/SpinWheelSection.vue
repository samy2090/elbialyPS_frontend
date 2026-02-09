<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { spinWheelApi } from '@/api/spinWheelUser'

const props = defineProps({
  /** When true, user is authenticated and we fetch status / allow spin */
  canSpin: { type: Boolean, default: false },
  /** Static segments when not using API (e.g. not logged in) */
  segments: {
    type: Array,
    default: () => [
      { id: 1, label: '+10 pts', icon: '⭐', color: 'rgba(0, 245, 255, 0.35)' },
      { id: 2, label: 'Free Spin', icon: '🎡', color: 'rgba(168, 85, 247, 0.35)' },
      { id: 3, label: '50 Coins', icon: '🪙', color: 'rgba(255, 159, 67, 0.35)' },
      { id: 4, label: '+5 pts', icon: '✨', color: 'rgba(0, 255, 136, 0.35)' },
      { id: 5, label: '2x Spin', icon: '🔄', color: 'rgba(255, 0, 128, 0.3)' },
      { id: 6, label: '25 Coins', icon: '💰', color: 'rgba(0, 212, 255, 0.3)' },
    ],
  },
})

const emit = defineEmits(['spin', 'result'])

const router = useRouter()

// API state
const statusLoading = ref(false)
const statusError = ref(null)
const status = ref(null)

// Local batch state (from status or updated after spin/choose)
const batch = computed(() => status.value?.batch ?? null)
const options = computed(() => status.value?.options ?? [])

// Segment palette when building from API options (no icon in API)
const SEGMENT_COLORS = [
  'rgba(0, 245, 255, 0.35)',
  'rgba(168, 85, 247, 0.35)',
  'rgba(255, 159, 67, 0.35)',
  'rgba(0, 255, 136, 0.35)',
  'rgba(255, 0, 128, 0.3)',
  'rgba(0, 212, 255, 0.3)',
  'rgba(236, 72, 153, 0.35)',
  'rgba(34, 197, 94, 0.35)',
]

/** Segments to render: from API options when authenticated and we have options, else props.segments */
const displaySegments = computed(() => {
  if (props.canSpin && options.value.length > 0) {
    return options.value.map((opt, i) => ({
      id: opt.id,
      label: opt.label ?? '',
      icon: '🎁',
      color: SEGMENT_COLORS[i % SEGMENT_COLORS.length],
    }))
  }
  return props.segments
})

const segmentCount = computed(() => displaySegments.value.length)
const segmentAngle = computed(() => 360 / segmentCount.value)

const wheelGradient = computed(() => {
  const step = 100 / segmentCount.value
  return displaySegments.value
    .map((s, i) => `${s.color} ${i * step}% ${(i + 1) * step}%`)
    .join(', ')
})

// Wheel rotation and spin state
const rotation = ref(0)
const isSpinning = ref(false)
const lastResult = ref(null)
const showResult = ref(false)
const chooseSuccess = ref(false)
const apiError = ref(null)

// Can user spin right now? (authenticated + batch.can_spin)
const canSpinNow = computed(() => {
  return props.canSpin && batch.value?.can_spin === true && !isSpinning.value
})

// Can user choose (claim) current result?
const canChooseNow = computed(() => {
  return props.canSpin && batch.value?.can_choose === true && !isSpinning.value
})

// Current result to show (from batch or last spin)
const currentResult = computed(() => {
  if (chooseSuccess.value && lastResult.value) return lastResult.value
  const cr = batch.value?.current_result
  if (cr?.label) return { label: cr.label, icon: '🎁' }
  return lastResult.value
})

const spinsRemaining = computed(() => {
  if (batch.value?.spins_remaining != null) return batch.value.spins_remaining
  if (batch.value?.spins_used != null && status.value?.max_spins_per_period != null) {
    return Math.max(0, status.value.max_spins_per_period - batch.value.spins_used)
  }
  return null
})

// Dynamic label for the main spin button
const spinButtonText = computed(() => {
  if (isSpinning.value) return 'Spinning…'
  // After the user has a current result and still has spins, show “Spin again”
  if (currentResult.value && canSpinNow.value) return 'Spin again'
  return 'SPIN NOW'
})
const periodEnd = computed(() => {
  const end = batch.value?.period_end
  if (!end) return null
  const d = new Date(end)
  return isNaN(d.getTime()) ? null : d
})

/** Set wheel rotation so the segment for the current result is under the pointer (top). */
function pointWheelAtCurrentResult() {
  const cr = batch.value?.current_result
  const opts = options.value
  if (!cr?.label || !opts?.length) return
  const segmentAngleDeg = 360 / opts.length
  const index = opts.findIndex(
    (opt) =>
      opt.label === cr.label ||
      opt.reward?.label === cr.label
  )
  if (index === -1) return
  const angle = (index + 0.5) * segmentAngleDeg
  rotation.value = 360 - angle
}

async function fetchStatus() {
  if (!props.canSpin) return
  statusLoading.value = true
  statusError.value = null
  apiError.value = null
  try {
    const res = await spinWheelApi.getStatus()
    status.value = res
    pointWheelAtCurrentResult()
  } catch (err) {
    statusError.value = err.response?.data?.message ?? err.message ?? 'Could not load spin wheel'
    status.value = null
  } finally {
    statusLoading.value = false
  }
}

function findSegmentIndexByOptionId(optionId) {
  const idx = displaySegments.value.findIndex((s) => String(s.id) === String(optionId))
  return idx >= 0 ? idx : 0
}

async function spin() {
  if (!canSpinNow.value) return
  apiError.value = null
  showResult.value = false
  lastResult.value = null
  isSpinning.value = true

  try {
    const res = await spinWheelApi.spin()
    const data = res?.data ?? res
    const option = data?.option
    const reward = data?.reward ?? option?.reward ?? option
    const optionId = option?.id ?? reward?.option_id
    const targetIndex = optionId != null ? findSegmentIndexByOptionId(optionId) : Math.floor(Math.random() * segmentCount.value)

    const targetDeg = (targetIndex + 0.5) * segmentAngle.value
    const fullTurns = 5 + Math.floor(Math.random() * 2)
    const finalRotation = rotation.value + 360 * fullTurns + (360 - targetDeg)
    rotation.value = finalRotation

    const winnerLabel = reward?.label ?? option?.label ?? displaySegments.value[targetIndex]?.label ?? 'Reward'
    const winner = { id: optionId, label: winnerLabel, icon: '🎁' }

    setTimeout(() => {
      isSpinning.value = false
      lastResult.value = winner
      showResult.value = true
      emit('spin', { segmentIndex: targetIndex, segment: winner })
      emit('result', winner)
      if (data) {
        status.value = {
          ...status.value,
          batch: data.batch ?? status.value?.batch,
          options: status.value?.options ?? [],
        }
        if (data.spins_remaining != null && status.value?.batch) status.value.batch.spins_remaining = data.spins_remaining
        if (data.can_choose != null && status.value?.batch) status.value.batch.can_choose = data.can_choose
        if (data.current_result != null && status.value?.batch) status.value.batch.current_result = data.current_result
      }
    }, 4200)
  } catch (err) {
    isSpinning.value = false
    apiError.value = err.response?.data?.message ?? err.message ?? 'Spin failed. Try again.'
  }
}

async function choose() {
  if (!canChooseNow.value) return
  apiError.value = null
  try {
    const res = await spinWheelApi.choose()
    const data = res?.data ?? res
    chooseSuccess.value = true
    const label = data?.reward?.label ?? data?.reward_type ?? currentResult.value?.label ?? 'Reward'
    lastResult.value = { label, icon: '🎁' }
    showResult.value = true
    await fetchStatus()
  } catch (err) {
    apiError.value = err.response?.data?.message ?? err.message ?? 'Could not claim reward.'
  }
}

function goToLogin() {
  router.push({ name: 'login' })
}

// Visibility: when section is shown and user is logged in, fetch status
watch(() => props.canSpin, (can) => {
  if (can) fetchStatus()
}, { immediate: true })

onMounted(() => {
  if (props.canSpin) fetchStatus()
})
</script>

<template>
  <section class="spin-section" aria-label="Spin the wheel and win rewards">
    <div class="spin-section__bg" aria-hidden="true"></div>

    <header class="spin-header">
      <h2 class="spin-header__title">🎯 Spin & Win</h2>
      <p class="spin-header__subtitle">Try your luck and win rewards</p>
      <div class="spin-header__divider" aria-hidden="true"></div>
    </header>

    <!-- Loading status -->
    <div v-if="canSpin && statusLoading && !status" class="spin-status spin-status--loading">
      <div class="spin-status__spinner" aria-hidden="true"></div>
      <p>Loading spin wheel…</p>
    </div>

    <!-- Not active -->
    <div v-else-if="canSpin && status && status.is_active === false" class="spin-status spin-status--message">
      <p>Spin wheel is currently disabled.</p>
    </div>

    <!-- Not available now -->
    <div v-else-if="canSpin && status && status.is_available_now === false" class="spin-status spin-status--message">
      <p>Spin wheel is not available at this time. Check back later.</p>
    </div>

    <!-- Status error -->
    <div v-else-if="canSpin && statusError" class="spin-status spin-status--error">
      <p>{{ statusError }}</p>
      <button type="button" class="spin-btn spin-btn--secondary" @click="fetchStatus">Retry</button>
    </div>

    <!-- Wheel (show when: not logged in, or logged in and (no status yet = use defaults) or (active and available)); lock when no spins and no claim available -->
    <template v-else>
      <div class="spin-wheel-wrap" :class="{ 'spin-wheel-wrap--locked': !canSpinNow && !canChooseNow }">
        <div class="spin-wheel-outer">
          <div
            class="spin-wheel"
            :class="{ 'spin-wheel--spinning': isSpinning }"
            :style="{
              '--rotation': `${rotation}deg`,
              '--segment-count': segmentCount,
              '--segment-angle': segmentAngle,
            }"
          >
            <div class="spin-wheel__glass"></div>
            <div class="spin-wheel__shine" aria-hidden="true"></div>
            <div
              class="spin-wheel__segments"
              :style="{ background: `conic-gradient(from 0deg, ${wheelGradient})` }"
            ></div>
            <div class="spin-wheel__inner-ring"></div>
            <div
              v-for="(seg, i) in displaySegments"
              :key="seg.id"
              class="spin-wheel__label"
              :style="{ '--i': i, '--seg-angle': segmentAngle }"
            >
              <span class="spin-wheel__label-inner">
                <span class="spin-wheel__label-icon">{{ seg.icon }}</span>
                <span class="spin-wheel__label-text">{{ seg.label }}</span>
              </span>
            </div>
            <div class="spin-wheel__hub" aria-hidden="true"></div>
          </div>
          <div class="spin-pointer" :class="{ 'spin-pointer--locked': !canSpinNow }" aria-hidden="true">
            <div class="spin-pointer__inner"></div>
          </div>
        </div>
      </div>

      <!-- API error (e.g. no spins left) -->
      <div v-if="apiError" class="spin-api-error">
        {{ apiError }}
      </div>

      <!-- Actions -->
      <div class="spin-actions">
        <template v-if="canSpin">
          <div v-if="canSpinNow" class="spin-actions__row">
            <button
              type="button"
              class="spin-btn"
              :class="{ 'spin-btn--spinning': isSpinning }"
              :disabled="isSpinning"
              @click="spin"
            >
              <span class="spin-btn__glow" aria-hidden="true"></span>
              <span class="spin-btn__text">{{ spinButtonText }}</span>
            </button>
          </div>
          <div v-if="canChooseNow && !isSpinning" class="spin-actions__row">
            <button type="button" class="spin-btn spin-btn--choose" @click="choose">
              <span class="spin-btn__glow" aria-hidden="true"></span>
              <span class="spin-btn__text">Claim this reward</span>
            </button>
          </div>
        </template>
        <template v-else>
          <p class="spin-login-hint">Log in to spin the wheel and win rewards.</p>
          <button type="button" class="spin-btn spin-btn--login" @click="goToLogin">
            <span class="spin-btn__glow" aria-hidden="true"></span>
            <span class="spin-btn__text">Log in to spin</span>
          </button>
        </template>
      </div>

      <!-- Result area: show current reward whenever we have one (from spin or from API) -->
      <div class="spin-result">
        <div v-if="!currentResult" class="spin-result-placeholder">
          Your reward will appear here
        </div>
        <Transition name="spin-result-reveal">
          <div v-if="currentResult" class="spin-result-card">
            <div class="spin-result-card__glow" aria-hidden="true"></div>
            <span class="spin-result-card__icon">{{ currentResult.icon }}</span>
            <span class="spin-result-card__text">You got: {{ currentResult.label }}</span>
          </div>
        </Transition>
      </div>

      <!-- Info bar: spins remaining, period end -->
      <div class="spin-info">
        <div class="spin-info__glass">
          <span class="spin-info__item">
            <span class="spin-info__icon" aria-hidden="true">🎡</span>
            <span>Remaining: <strong>{{ spinsRemaining != null ? spinsRemaining : '—' }}</strong> spins</span>
          </span>
          <template v-if="periodEnd">
            <span class="spin-info__divider" aria-hidden="true"></span>
            <span class="spin-info__item">
              <span class="spin-info__icon" aria-hidden="true">⏱</span>
              <span>Period ends: <strong>{{ periodEnd.toLocaleDateString(undefined, { dateStyle: 'short' }) }}</strong></span>
            </span>
          </template>
          <template v-else-if="canSpin && batch && spinsRemaining === 0">
            <span class="spin-info__divider" aria-hidden="true"></span>
            <span class="spin-info__item">
              <span>Claim your reward above or wait for next period.</span>
            </span>
          </template>
        </div>
      </div>
    </template>
  </section>
</template>

<style scoped>
/* Design tokens */
.spin-section {
  --spin-bg: #0B0F1A;
  --spin-cyan: #00d4ff;
  --spin-purple: #a855f7;
  --spin-pink: #ec4899;
  --spin-glass: rgba(255, 255, 255, 0.06);
  --spin-glass-border: rgba(255, 255, 255, 0.08);
  --spin-font: 'Outfit', var(--font-sans, sans-serif);
}

.spin-section {
  position: relative;
  padding: clamp(2.5rem, 8vw, 4rem) 1.25rem;
  max-width: 420px;
  margin: 0 auto;
  font-family: var(--spin-font);
}

.spin-section__bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 80% 50% at 50% 20%, rgba(0, 212, 255, 0.08) 0%, transparent 50%),
    radial-gradient(ellipse 60% 40% at 50% 70%, rgba(168, 85, 247, 0.06) 0%, transparent 50%);
  pointer-events: none;
}

.spin-header {
  position: relative;
  text-align: center;
  margin-bottom: 1.75rem;
}

.spin-header__title {
  font-size: clamp(1.6rem, 5vw, 1.9rem);
  font-weight: 800;
  color: #fff;
  margin: 0 0 0.35em;
  letter-spacing: -0.02em;
  text-shadow: 0 0 28px rgba(0, 212, 255, 0.35), 0 0 56px rgba(168, 85, 247, 0.2);
}

.spin-header__subtitle {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.65);
  margin: 0;
  letter-spacing: 0.03em;
}

.spin-header__divider {
  height: 1px;
  margin: 1rem 1.5rem 0;
  background: linear-gradient(90deg, transparent, var(--spin-cyan), var(--spin-purple), transparent);
  box-shadow: 0 0 14px rgba(0, 212, 255, 0.25);
  opacity: 0.9;
}

/* Status messages */
.spin-status {
  text-align: center;
  padding: 2rem 1rem;
  color: rgba(255, 255, 255, 0.85);
}

.spin-status--loading .spin-status__spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 1rem;
  border: 3px solid rgba(139, 92, 246, 0.3);
  border-top-color: #8b5cf6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.spin-status--error .spin-btn--secondary {
  margin-top: 1rem;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0.5rem 1rem;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 600;
}

.spin-api-error {
  text-align: center;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  border-radius: 12px;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #fca5a5;
  font-size: 0.9rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Wheel (reuse existing styles) */
.spin-wheel-wrap {
  position: relative;
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.spin-wheel-wrap--locked .spin-wheel__segments,
.spin-wheel-wrap--locked .spin-wheel__glass,
.spin-wheel-wrap--locked .spin-wheel__inner-ring,
.spin-wheel-wrap--locked .spin-wheel__hub {
  filter: saturate(0.5) brightness(0.92);
}

.spin-wheel-wrap--locked .spin-wheel__shine {
  opacity: 0.4;
}

.spin-wheel-wrap:not(.spin-wheel-wrap--locked) .spin-wheel__segments {
  filter: saturate(1.15) brightness(1.02);
}

.spin-wheel-wrap:not(.spin-wheel-wrap--locked) .spin-wheel__hub {
  filter: saturate(1.2) brightness(1.05);
}

.spin-pointer--locked {
  filter: saturate(0.5) brightness(0.9) drop-shadow(0 0 8px rgba(0, 212, 255, 0.35));
  opacity: 0.85;
  animation: none;
}

.spin-pointer:not(.spin-pointer--locked) {
  filter: saturate(1.2) drop-shadow(0 0 14px rgba(0, 212, 255, 0.8));
}

.spin-wheel-outer {
  position: relative;
  width: min(280px, 78vw);
  aspect-ratio: 1;
}

@media (prefers-reduced-motion: no-preference) {
  .spin-wheel-outer {
    animation: spinWheelFloat 4s ease-in-out infinite;
  }
}

@keyframes spinWheelFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

.spin-wheel {
  position: relative;
  width: 100%;
  height: 100%;
  /* ensure the wheel always stays perfectly square */
  aspect-ratio: 1;
  border-radius: 50%;
  transform: rotate(var(--rotation, 0deg));
  transition: transform 4.2s cubic-bezier(0.17, 0.67, 0.12, 0.99);
  will-change: transform;
}

.spin-wheel--spinning {
  transition: transform 4.2s cubic-bezier(0.17, 0.67, 0.12, 0.99);
}

.spin-wheel__glass {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  background: var(--spin-glass);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--spin-glass-border);
  box-shadow:
    inset 0 2px 12px rgba(255, 255, 255, 0.06),
    inset 0 -2px 12px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(255, 255, 255, 0.05),
    0 12px 40px -12px rgba(0, 0, 0, 0.5),
    0 0 60px -16px rgba(0, 212, 255, 0.2);
}

.spin-wheel__shine {
  position: absolute;
  inset: 8%;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, transparent 50%);
  pointer-events: none;
  animation: spinShine 6s ease-in-out infinite;
}

@keyframes spinShine {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

.spin-wheel__segments {
  position: absolute;
  inset: 4%;
  border-radius: 50%;
  box-shadow: inset 0 0 30px rgba(0, 0, 0, 0.3);
}

.spin-wheel__inner-ring {
  position: absolute;
  inset: 30%;
  border-radius: 50%;
  background: linear-gradient(145deg, rgba(20, 25, 40, 0.95), rgba(10, 12, 22, 0.98));
  box-shadow:
    inset 0 2px 8px rgba(255, 255, 255, 0.08),
    inset 0 -4px 16px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

/* Label container: full size of wheel so translate % is relative to wheel */
.spin-wheel__label {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform-origin: 50% 50%;

  --angle: calc((var(--i) + 0.5) * var(--segment-angle) * 1deg);
  /* Place labels on the segment ring (between inner ring and outer edge) */
  --radius: 33%;

  transform:
    rotate(var(--angle))
    translateY(calc(-1 * var(--radius)));

  pointer-events: none;
}

/* Inner content: centered on segment, rotated WITH the slice so text is part of the wheel */
.spin-wheel__label-inner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  text-align: center;
  width: 72px;
  max-width: 22vw;
  font-size: 13px;
  font-weight: 600;
  color: #ffffff;
  pointer-events: none;
  /* Readable on all segment colors */
  text-shadow:
    0 0 2px rgba(0, 0, 0, 0.8),
    0 1px 3px rgba(0, 0, 0, 0.6),
    0 0 8px rgba(0, 0, 0, 0.4);
}

.spin-wheel__label-icon {
  font-size: clamp(1rem, 3vw, 1.35rem);
  line-height: 1;
  filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0.5));
}

.spin-wheel__label-text {
  font-size: clamp(0.8rem, 2.5vw, 0.95rem);
  font-weight: 700;
  color: rgba(255, 255, 255, 0.98);
  text-shadow:
    0 0 2px rgba(0, 0, 0, 0.8),
    0 1px 2px rgba(0, 0, 0, 0.6);
  white-space: nowrap;
  line-height: 1.2;
}

.spin-wheel__hub {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 22%;
  height: 22%;
  margin-left: -11%;
  margin-top: -11%;
  border-radius: 50%;
  background: linear-gradient(145deg, rgba(0, 212, 255, 0.25), rgba(168, 85, 247, 0.2));
  box-shadow:
    inset 0 2px 8px rgba(255, 255, 255, 0.2),
    inset 0 -2px 8px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.15),
    0 0 24px -4px rgba(0, 212, 255, 0.5);
}

.spin-pointer {
  position: absolute;
  left: 50%;
  top: -8px;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 14px solid transparent;
  border-right: 14px solid transparent;
  border-top: 22px solid var(--spin-cyan);
  filter: drop-shadow(0 0 12px rgba(0, 212, 255, 0.8));
  z-index: 2;
  animation: spinPointerPulse 2s ease-in-out infinite;
}

.spin-pointer__inner {
  position: absolute;
  left: -12px;
  top: -24px;
  width: 0;
  height: 0;
  border-left: 12px solid transparent;
  border-right: 12px solid transparent;
  border-top: 18px solid rgba(255, 255, 255, 0.4);
}

@keyframes spinPointerPulse {
  0%, 100% { filter: drop-shadow(0 0 12px rgba(0, 212, 255, 0.8)); opacity: 1; }
  50% { filter: drop-shadow(0 0 20px rgba(0, 212, 255, 1)); opacity: 0.95; }
}

.spin-actions {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.spin-actions__row {
  display: flex;
  justify-content: center;
}

.spin-login-hint {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.65);
  margin: 0;
  text-align: center;
}

.spin-btn {
  position: relative;
  min-width: 200px;
  min-height: 52px;
  padding: 0.9rem 2rem;
  font-family: var(--spin-font);
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #fff;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  overflow: hidden;
  background: linear-gradient(135deg, var(--spin-purple) 0%, var(--spin-cyan) 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    0 8px 24px -8px rgba(168, 85, 247, 0.5);
  transition: transform 0.2s ease, box-shadow 0.3s ease, opacity 0.3s ease;
  -webkit-tap-highlight-color: transparent;
}

.spin-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, transparent 50%);
  border-radius: 999px;
  pointer-events: none;
}

.spin-btn:active:not(:disabled) {
  transform: scale(0.97);
}

.spin-btn:disabled {
  cursor: not-allowed;
  opacity: 0.85;
}

.spin-btn__glow {
  position: absolute;
  inset: -2px;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--spin-purple), var(--spin-cyan));
  filter: blur(12px);
  opacity: 0.4;
  transition: opacity 0.3s ease;
}

.spin-btn--spinning .spin-btn__glow {
  opacity: 0.7;
  animation: spinBtnGlow 0.8s ease-in-out infinite;
}

.spin-btn--choose {
  background: linear-gradient(135deg, #22c55e 0%, #06b6d4 100%);
  box-shadow: 0 4px 20px -4px rgba(34, 197, 94, 0.4);
}

.spin-btn--login {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.06));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.08);
}

.spin-btn--login .spin-btn__glow {
  opacity: 0.2;
}

@keyframes spinBtnGlow {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 0.8; }
}

.spin-btn__text {
  position: relative;
  z-index: 1;
}

.spin-result {
  position: relative;
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.25rem;
}

.spin-result-placeholder {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.45);
  padding: 1rem 1.25rem;
}

.spin-result-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-radius: 16px;
  background: var(--spin-glass);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--spin-glass-border);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    0 0 24px -8px rgba(0, 212, 255, 0.3);
}

.spin-result-card__glow {
  position: absolute;
  inset: -20%;
  border-radius: 24px;
  background: radial-gradient(circle, rgba(0, 212, 255, 0.15) 0%, transparent 70%);
  animation: spinResultBurst 0.6s ease-out;
}

@keyframes spinResultBurst {
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
}

.spin-result-card__icon {
  font-size: 1.75rem;
  line-height: 1;
}

.spin-result-card__text {
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
}

.spin-info {
  position: relative;
}

.spin-info__glass {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.75rem 1rem;
  padding: 0.75rem 1.25rem;
  border-radius: 14px;
  background: var(--spin-glass);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid var(--spin-glass-border);
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.75);
}

.spin-info__item {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.spin-info__icon {
  font-size: 1rem;
  opacity: 0.9;
}

.spin-info__divider {
  width: 1px;
  height: 1em;
  background: rgba(255, 255, 255, 0.2);
}

.spin-result-reveal-enter-active,
.spin-result-reveal-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.spin-result-reveal-enter-from,
.spin-result-reveal-leave-to {
  opacity: 0;
  transform: scale(0.92);
}

@media (prefers-reduced-motion: reduce) {
  .spin-wheel__shine,
  .spin-pointer,
  .spin-wheel-outer {
    animation: none;
  }

  .spin-wheel {
    transition-duration: 0.5s;
  }
}
</style>
