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
    <span class="glass-stat-card__shape" aria-hidden="true"></span>
    <span class="glass-stat-card__bg" aria-hidden="true"></span>
    <div class="glass-stat-card__inner">
      <span class="glass-stat-card__icon" aria-hidden="true">{{ icon }}</span>
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
let tapTween = null

function onTapStart() {
  if (tapTween) tapTween.kill()
  if (!cardRef.value) return
  tapTween = gsap.to(cardRef.value, { scale: 0.96, duration: 0.08, ease: 'power2.out' })
}

function onTapEnd() {
  if (tapTween) tapTween.kill()
  if (!cardRef.value) return
  tapTween = gsap.to(cardRef.value, { scale: 1, duration: 0.22, ease: 'power2.out' })
}
</script>

<style scoped>
/* Cyberpunk panel: chamfered top-right + bottom-left corners, 1px gradient border. */
.glass-stat-card {
  --cut: 12px;
  position: relative;
  min-width: 0;
  height: 100%;
  opacity: 0;
  transform: translateY(16px);
  touch-action: manipulation;
  isolation: isolate;
}

/* Gradient border layer */
.glass-stat-card__shape {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(0, 245, 255, 0.7) 0%, rgba(168, 85, 247, 0.55) 50%, rgba(255, 0, 128, 0.7) 100%);
  clip-path: polygon(
    0 0,
    calc(100% - var(--cut)) 0,
    100% var(--cut),
    100% 100%,
    var(--cut) 100%,
    0 calc(100% - var(--cut))
  );
  z-index: 0;
  transition: opacity 0.25s ease;
}

/* Inner background sits 1px inside the gradient to fake a 1px gradient border. */
.glass-stat-card__bg {
  position: absolute;
  inset: 1px;
  background:
    linear-gradient(180deg, rgba(0, 245, 255, 0.04) 0%, transparent 60%),
    rgba(10, 10, 20, 0.85);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  clip-path: polygon(
    0 0,
    calc(100% - var(--cut) + 1px) 0,
    100% calc(var(--cut) - 1px),
    100% 100%,
    calc(var(--cut) - 1px) 100%,
    0 calc(100% - var(--cut) + 1px)
  );
  z-index: 1;
}

.glass-stat-card__inner {
  position: relative;
  z-index: 2;
  padding: clamp(0.55rem, 1.6vw, 1rem) clamp(0.4rem, 1.2vw, 0.85rem);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  height: 100%;
  box-sizing: border-box;
  gap: clamp(0.15rem, 0.6vw, 0.4rem);
}

.glass-stat-card__icon {
  display: block;
  font-size: clamp(1rem, 3.5vw, 1.85rem);
  line-height: 1;
  filter: drop-shadow(0 0 8px rgba(0, 245, 255, 0.4));
}

.glass-stat-card__value {
  display: block;
  font-size: clamp(0.8rem, 2.4vw, 1.65rem);
  font-weight: 800;
  color: rgba(255, 255, 255, 0.98);
  letter-spacing: -0.02em;
  line-height: 1.1;
  /* Subtle chromatic aberration matching the hero title. */
  text-shadow:
    0.02em 0 0 rgba(255, 0, 128, 0.5),
    -0.02em 0 0 rgba(0, 245, 255, 0.5),
    0 0 16px rgba(0, 245, 255, 0.18);
  max-width: 100%;
  /* Allow multi-word values like "Good times" to wrap instead of getting cut off. */
  overflow-wrap: anywhere;
  hyphens: auto;
}

.glass-stat-card__tagline {
  display: block;
  font-size: clamp(0.48rem, 1.5vw, 0.7rem);
  font-weight: 600;
  color: rgba(255, 255, 255, 0.55);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  line-height: 1.2;
  max-width: 100%;
  /* Allow tagline to wrap to 2 lines on narrow cards instead of cutting off. */
  overflow-wrap: anywhere;
  hyphens: auto;
}

@media (max-width: 419px) {
  .glass-stat-card {
    --cut: 9px;
  }
  .glass-stat-card__inner {
    /* Tighter padding so tagline has room to breathe on tiny phones. */
    padding: 0.45rem 0.3rem;
    gap: 0.15rem;
  }
}

@media (max-width: 768px) and (min-width: 420px) {
  .glass-stat-card {
    --cut: 10px;
  }
}

@media (hover: hover) {
  .glass-stat-card:hover .glass-stat-card__shape {
    opacity: 1;
    background: linear-gradient(135deg, rgba(0, 245, 255, 1) 0%, rgba(168, 85, 247, 0.85) 50%, rgba(255, 0, 128, 1) 100%);
  }
  .glass-stat-card:hover .glass-stat-card__value {
    text-shadow:
      0.04em 0 0 rgba(255, 0, 128, 0.8),
      -0.04em 0 0 rgba(0, 245, 255, 0.8),
      0 0 22px rgba(0, 245, 255, 0.28);
  }
}

@media (prefers-reduced-motion: reduce) {
  .glass-stat-card {
    opacity: 1;
    transform: none;
  }
  .glass-stat-card__value {
    text-shadow: 0 0 16px rgba(0, 245, 255, 0.15);
  }
}
</style>
