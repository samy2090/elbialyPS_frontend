<template>
  <article class="metric-card" :class="`metric-card--${variant}`">
    <div class="metric-card__glow"></div>
    <div class="metric-card__content">
      <span class="metric-card__label">{{ label }}</span>
      <span class="metric-card__value">{{ formatted }}</span>
      <span v-if="secondary" class="metric-card__secondary" :class="secondaryClass">
        {{ secondary }}
      </span>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { formatCurrencyEGP } from '@/utils/expenseHelpers'

const props = defineProps({
  label: { type: String, required: true },
  value: { type: [Number, String], default: 0 },
  type: { type: String, default: 'currency' }, // currency | number | percent
  variant: { type: String, default: 'revenue' }, // revenue | net-revenue | expenses | profit | profit-negative
  secondary: { type: String, default: '' },
  secondaryTone: { type: String, default: 'muted' }, // muted | positive | negative
})

const formatted = computed(() => {
  const n = Number(props.value)
  if (props.type === 'percent') {
    if (props.value === null || Number.isNaN(n)) return '—'
    return `${n.toFixed(2)}%`
  }
  if (props.type === 'number') {
    if (Number.isNaN(n)) return '0'
    return new Intl.NumberFormat('en-US').format(n)
  }
  return formatCurrencyEGP(n)
})

const secondaryClass = computed(() => `metric-card__secondary--${props.secondaryTone}`)
</script>

<style scoped>
.metric-card {
  position: relative;
  padding: 1.25rem 1rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  overflow: hidden;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}

.metric-card:hover {
  transform: translateY(-4px);
  border-color: rgba(255, 255, 255, 0.12);
  box-shadow: 0 12px 32px -8px rgba(0, 0, 0, 0.35);
}

.metric-card__glow {
  position: absolute;
  top: -50%;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  height: 100%;
  border-radius: 50%;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.25s ease;
}

.metric-card:hover .metric-card__glow {
  opacity: 1;
}

.metric-card__content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.metric-card__label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(255, 255, 255, 0.55);
}

.metric-card__value {
  font-size: clamp(1.1rem, 2.5vw, 1.5rem);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
}

.metric-card__secondary {
  font-size: 0.75rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.metric-card__secondary--muted {
  color: rgba(255, 255, 255, 0.55);
}

.metric-card__secondary--positive {
  color: #34d399;
}

.metric-card__secondary--negative {
  color: #f87171;
}

.metric-card--revenue .metric-card__value {
  color: #a78bfa;
  text-shadow: 0 0 24px rgba(139, 92, 246, 0.35);
}
.metric-card--revenue .metric-card__glow {
  background: radial-gradient(ellipse at center, rgba(139, 92, 246, 0.12) 0%, transparent 70%);
}

.metric-card--net-revenue .metric-card__value {
  color: #06b6d4;
  text-shadow: 0 0 20px rgba(6, 182, 212, 0.3);
}
.metric-card--net-revenue .metric-card__glow {
  background: radial-gradient(ellipse at center, rgba(6, 182, 212, 0.08) 0%, transparent 70%);
}

.metric-card--expenses .metric-card__value {
  color: #fbbf24;
  text-shadow: 0 0 20px rgba(251, 191, 36, 0.25);
}
.metric-card--expenses .metric-card__glow {
  background: radial-gradient(ellipse at center, rgba(251, 191, 36, 0.08) 0%, transparent 70%);
}

.metric-card--profit .metric-card__value {
  color: #34d399;
  text-shadow: 0 0 20px rgba(52, 211, 153, 0.3);
}
.metric-card--profit .metric-card__glow {
  background: radial-gradient(ellipse at center, rgba(52, 211, 153, 0.08) 0%, transparent 70%);
}

.metric-card--profit-negative .metric-card__value {
  color: #f87171;
  text-shadow: 0 0 20px rgba(248, 113, 113, 0.3);
}
.metric-card--profit-negative .metric-card__glow {
  background: radial-gradient(ellipse at center, rgba(248, 113, 113, 0.08) 0%, transparent 70%);
}
</style>
