<template>
  <article
    ref="cardRef"
    class="glass-stat-card"
    data-glass-card
    role="group"
    :aria-label="tagline"
    @pointerdown="onTapStart"
    @pointerup="onTapEnd"
    @pointerleave="onTapEnd"
  >
    <div class="glass-stat-card__border" aria-hidden="true"></div>
    <div ref="glowRef" class="glass-stat-card__glow" aria-hidden="true"></div>
    <div class="glass-stat-card__orb" aria-hidden="true"></div>
    <div class="glass-stat-card__inner">
      <span ref="iconRef" class="glass-stat-card__icon" aria-hidden="true">{{ icon }}</span>
      <span class="glass-stat-card__value">{{ value }}</span>
      <span class="glass-stat-card__tagline">{{ tagline }}</span>
    </div>
  </article>
</template>

<script setup>
import { ref } from 'vue'
import gsap from 'gsap'

defineProps({
  icon: { type: String, default: '' },
  value: { type: String, required: true },
  tagline: { type: String, required: true },
})

const cardRef = ref(null)
const glowRef = ref(null)
const iconRef = ref(null)
let tapTween = null

function onTapStart() {
  if (tapTween) tapTween.kill()
  if (!cardRef.value || !glowRef.value) return
  tapTween = gsap.timeline()
  tapTween.to(cardRef.value, { scale: 0.96, duration: 0.06, ease: 'power2.out' })
  tapTween.to(glowRef.value, { opacity: 0.75, duration: 0.08 }, 0)
}

function onTapEnd() {
  if (tapTween) tapTween.kill()
  if (!cardRef.value || !glowRef.value) return
  tapTween = gsap.timeline()
  tapTween.to(cardRef.value, { scale: 1, duration: 0.25, ease: 'power2.out' })
  tapTween.to(glowRef.value, { opacity: 0.35, duration: 0.2 }, 0)
}
</script>

<style scoped>
.glass-stat-card {
  --glass-neon: rgba(0, 245, 255, 0.35);
  --glass-neon-soft: rgba(0, 245, 255, 0.12);
  --glass-pink: rgba(255, 100, 180, 0.2);
  position: relative;
  flex: 1 1 160px;
  min-width: 0;
  border-radius: 20px;
  overflow: hidden;
  opacity: 0;
  transform: translateY(24px) scale(0.95);
  will-change: transform;
  touch-action: manipulation;
}

.glass-stat-card__border {
  position: absolute;
  inset: 0;
  border-radius: 20px;
  padding: 1px;
  background: linear-gradient(135deg, var(--glass-neon) 0%, var(--glass-pink) 50%, rgba(168, 85, 247, 0.25) 100%);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
  opacity: 0.8;
}

.glass-stat-card__glow {
  position: absolute;
  inset: -20%;
  background: radial-gradient(ellipse 80% 60% at 50% 30%, var(--glass-neon-soft) 0%, transparent 60%);
  pointer-events: none;
  opacity: 0.35;
}

.glass-stat-card__orb {
  position: absolute;
  top: -30%;
  left: 50%;
  transform: translateX(-50%);
  width: 120%;
  height: 60%;
  background: radial-gradient(ellipse at center, rgba(0, 245, 255, 0.08) 0%, transparent 70%);
  pointer-events: none;
}

.glass-stat-card__inner {
  position: relative;
  z-index: 1;
  padding: 1.25rem 1rem;
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 20px;
  text-align: center;
  min-height: 100%;
  box-sizing: border-box;
}

.glass-stat-card__icon {
  display: block;
  font-size: clamp(1.5rem, 3.5vw, 2rem);
  margin-bottom: 0.5rem;
  filter: drop-shadow(0 0 10px var(--glass-neon-soft));
  will-change: transform;
}

.glass-stat-card__value {
  display: block;
  font-size: clamp(1.5rem, 3vw, 2.25rem);
  font-weight: 800;
  color: rgba(255, 255, 255, 0.98);
  letter-spacing: -0.03em;
  text-shadow:
    0 0 20px var(--glass-neon-soft),
    0 0 40px rgba(0, 245, 255, 0.15),
    0 1px 2px rgba(0, 0, 0, 0.2);
  margin-bottom: 0.25rem;
}

.glass-stat-card__tagline {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

@media (max-width: 768px) {
  .glass-stat-card {
    flex: 0 0 auto;
    min-width: 100px;
    scroll-snap-align: start;
    border-radius: 18px;
  }

  .glass-stat-card__border {
    border-radius: 18px;
  }

  .glass-stat-card__inner {
    padding: 0.9rem 0.75rem;
    border-radius: 18px;
  }

  .glass-stat-card__icon {
    font-size: 1.35rem;
    margin-bottom: 0.35rem;
  }

  .glass-stat-card__value {
    font-size: 1.25rem;
  }

  .glass-stat-card__tagline {
    font-size: 0.65rem;
    letter-spacing: 0.08em;
  }
}

@media (prefers-reduced-motion: reduce) {
  .glass-stat-card {
    will-change: auto;
  }

  .glass-stat-card__icon {
    will-change: auto;
  }
}
</style>
