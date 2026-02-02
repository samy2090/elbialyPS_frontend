<template>
  <article
    class="stat-card"
    :class="[variantClass, { 'stat-card--animated': animated }]"
    :style="cardStyle"
  >
    <div class="stat-card__glow" aria-hidden="true"></div>
    <div class="stat-card__border"></div>
    <div class="stat-card__content">
      <div class="stat-card__value">{{ value }}</div>
      <div class="stat-card__label">{{ label }}</div>
      <div v-if="trend" class="stat-card__trend" :class="trendClass">
        {{ trend }}
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: { type: [String, Number], required: true },
  label: { type: String, required: true },
  trend: { type: String, default: '' },
  trendDirection: { type: String, default: 'positive' },
  variant: { type: String, default: 'default' },
  animated: { type: Boolean, default: true },
  accentColor: { type: String, default: '' },
})

const variantClass = computed(() => `stat-card--${props.variant}`)
const trendClass = computed(() => `stat-card__trend--${props.trendDirection}`)
const cardStyle = computed(() =>
  props.accentColor ? { '--stat-accent': props.accentColor } : {}
)
</script>

<style scoped>
.stat-card {
  --stat-accent: var(--primary-purple, #8b5cf6);
  position: relative;
  text-align: center;
  padding: 1.75rem 1.25rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  overflow: hidden;
  transition: transform 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease;
}

.stat-card:hover {
  transform: translateY(-6px);
  border-color: rgba(255, 255, 255, 0.12);
  box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.4), 0 0 40px -10px var(--stat-accent);
}

.stat-card__glow {
  position: absolute;
  top: -50%;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  height: 100%;
  background: radial-gradient(ellipse at center, rgba(139, 92, 246, 0.08) 0%, transparent 70%);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.35s ease;
}

.stat-card:hover .stat-card__glow {
  opacity: 1;
}

.stat-card__border {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--stat-accent), transparent);
  opacity: 0.5;
  transform: scaleX(0);
  transform-origin: center;
  transition: transform 0.4s ease;
}

.stat-card:hover .stat-card__border {
  transform: scaleX(1);
}

.stat-card__content {
  position: relative;
  z-index: 1;
}

.stat-card__value {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 800;
  color: var(--stat-accent);
  margin-bottom: 0.35rem;
  letter-spacing: -0.02em;
  text-shadow: 0 0 30px rgba(139, 92, 246, 0.3);
}

.stat-card__label {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.65);
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.stat-card__trend {
  font-size: 0.8rem;
  font-weight: 600;
}

.stat-card__trend--positive {
  color: #10b981;
}

.stat-card__trend--negative {
  color: #ef4444;
}

.stat-card__trend--neutral {
  color: rgba(255, 255, 255, 0.5);
}

.stat-card--cyan { --stat-accent: #06b6d4; }
.stat-card--green { --stat-accent: #10b981; }
.stat-card--orange { --stat-accent: #f59e0b; }

.stat-card--animated .stat-card__value {
  animation: statCountPulse 3s ease-in-out infinite;
}

@keyframes statCountPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.85; }
}

@media (max-width: 768px) {
  .stat-card {
    padding: 1.25rem 1rem;
  }
}
</style>
