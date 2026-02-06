<template>
  <section ref="heroRef" class="hero-section" :class="{ 'hero-section--visible': isVisible }">
    <div class="hero-section__bg">
      <div class="hero-section__orb hero-section__orb--1" aria-hidden="true"></div>
      <div class="hero-section__orb hero-section__orb--2" aria-hidden="true"></div>
      <div class="hero-section__orb hero-section__orb--3" aria-hidden="true"></div>
      <div class="hero-section__orb hero-section__orb--4" aria-hidden="true"></div>
      <div class="hero-section__grid" aria-hidden="true"></div>
      <div class="hero-section__hexgrid" aria-hidden="true"></div>
      <div class="hero-section__scan" aria-hidden="true"></div>
      <div class="hero-section__particles" aria-hidden="true">
        <span v-for="n in 16" :key="n" class="hero-section__particle" :style="{ '--p': n }"></span>
      </div>
      <div class="hero-section__noise" aria-hidden="true"></div>
    </div>

    <div class="hero-section__inner">
      <div class="hero-section__content">
        <div class="hero-section__text">
          <div v-if="$slots.badge" class="hero-section__badge-wrap">
            <slot name="badge"></slot>
          </div>
          <h1 class="hero-section__title">
            <slot name="title">
              {{ title }}
              <span v-if="titleHighlight" class="hero-section__title-highlight">{{ titleHighlight }}</span>
            </slot>
          </h1>
          <p class="hero-section__description">
            <slot name="description">
              {{ description }}
            </slot>
          </p>
          <div class="hero-section__actions">
            <slot name="actions"></slot>
          </div>
        </div>
        <div v-if="$slots.visual" class="hero-section__visual">
          <slot name="visual"></slot>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

defineProps({
  title: { type: String, default: '' },
  titleHighlight: { type: String, default: '' },
  description: { type: String, default: '' },
})

const heroRef = ref(null)
const isVisible = ref(false)

// Only run animations when hero is in view (saves CPU when off-screen)
let observer = null
onMounted(() => {
  if (!heroRef.value || typeof IntersectionObserver === 'undefined') {
    isVisible.value = true
    return
  }
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) isVisible.value = true
      })
    },
    { rootMargin: '50px', threshold: 0.01 }
  )
  observer.observe(heroRef.value)
})
onUnmounted(() => {
  if (observer && heroRef.value) observer.unobserve(heroRef.value)
})
</script>

<style scoped>
.hero-section {
  position: relative;
  min-height: clamp(72vh, 88vw, 88vh);
  display: flex;
  align-items: center;
  padding: clamp(3rem, 8vw, 5.5rem) 1.5rem;
  overflow: hidden;
}

.hero-section__bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

/* Orbs: GPU-friendly (transform + opacity). Blur only on desktop; solid on mobile. */
.hero-section__orb {
  position: absolute;
  border-radius: 50%;
  opacity: 0.4;
  will-change: transform, opacity;
}

.hero-section--visible .hero-section__orb {
  animation: heroOrb 14s ease-in-out infinite;
}

.hero-section__orb--1 {
  width: 560px;
  height: 560px;
  background: rgba(139, 92, 246, 0.3);
  top: -25%;
  left: -12%;
  filter: blur(90px);
  animation-delay: 0s;
}

.hero-section__orb--2 {
  width: 420px;
  height: 420px;
  background: rgba(6, 182, 212, 0.25);
  top: 25%;
  right: -18%;
  filter: blur(90px);
  animation-delay: -3s;
}

.hero-section__orb--3 {
  width: 320px;
  height: 320px;
  background: rgba(168, 85, 247, 0.2);
  bottom: -15%;
  left: 25%;
  filter: blur(90px);
  animation-delay: -7s;
}

.hero-section__orb--4 {
  width: 200px;
  height: 200px;
  background: rgba(236, 72, 153, 0.15);
  top: 60%;
  left: 5%;
  filter: blur(90px);
  animation-delay: -11s;
}

@keyframes heroOrb {
  0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.35; }
  25% { transform: translate(25px, -25px) scale(1.08); opacity: 0.5; }
  50% { transform: translate(-20px, 20px) scale(0.95); opacity: 0.4; }
  75% { transform: translate(15px, 15px) scale(1.05); opacity: 0.45; }
}

.hero-section__grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 56px 56px;
  mask-image: radial-gradient(ellipse 110% 90% at 50% 40%, black 15%, transparent 72%);
  -webkit-mask-image: radial-gradient(ellipse 110% 90% at 50% 40%, black 15%, transparent 72%);
  will-change: opacity;
}

.hero-section--visible .hero-section__grid {
  animation: heroGridPulse 8s ease-in-out infinite;
}

@keyframes heroGridPulse {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; }
}

.hero-section__hexgrid {
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='24' viewBox='0 0 28 24'%3E%3Cpath fill='none' stroke='rgba(139,92,246,0.04)' stroke-width='0.5' d='M14 0l7 4v8l-7 4-7-4V4z'/%3E%3Cpath fill='none' stroke='rgba(6,182,212,0.03)' stroke-width='0.4' d='M0 12l7-4 7 4 7-4'/%3E%3C/svg%3E");
  background-size: 28px 24px;
  mask-image: radial-gradient(ellipse 100% 80% at 50% 35%, black 25%, transparent 75%);
  -webkit-mask-image: radial-gradient(ellipse 100% 80% at 50% 35%, black 25%, transparent 75%);
  pointer-events: none;
}

.hero-section__scan {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.8), rgba(139, 92, 246, 0.9), transparent);
  pointer-events: none;
  will-change: transform, opacity;
}

/* Static glow (no animated box-shadow) for performance */
.hero-section__scan::after {
  content: '';
  position: absolute;
  inset: -2px 0;
  background: rgba(6, 182, 212, 0.15);
  border-radius: 2px;
  z-index: -1;
}

.hero-section--visible .hero-section__scan {
  animation: heroScan 4s linear infinite;
}

@keyframes heroScan {
  0% { transform: translateY(0); opacity: 0.6; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translateY(100vh); opacity: 0.4; }
}

.hero-section__particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.hero-section__particle {
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: rgba(139, 92, 246, 0.5);
  will-change: transform, opacity;
  /* Position with % (one-time), animation uses only transform + opacity */
  left: calc((var(--p, 1) * 6.25%) % 100%);
  top: calc((var(--p, 1) * 7%) % 100%);
}

.hero-section--visible .hero-section__particle {
  animation: heroParticle 10s ease-in-out infinite;
  animation-delay: calc(var(--p, 0) * -0.5s);
}

/* Light shadow on desktop only; none on mobile to reduce paint cost */
.hero-section__particle::before {
  content: '';
  position: absolute;
  inset: -3px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%);
  pointer-events: none;
}

@keyframes heroParticle {
  0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.4; }
  25% { transform: translate(20px, -30px) scale(1.2); opacity: 0.9; }
  50% { transform: translate(-15px, -10px) scale(0.85); opacity: 0.5; }
  75% { transform: translate(10px, -25px) scale(1.1); opacity: 0.8; }
}

.hero-section__noise {
  position: absolute;
  inset: 0;
  opacity: 0.025;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  pointer-events: none;
}

.hero-section__inner {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
}

.hero-section__content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(2.5rem, 5vw, 4.5rem);
  align-items: center;
}

.hero-section__text {
  display: flex;
  flex-direction: column;
}

.hero-section__badge-wrap {
  margin-bottom: 1rem;
  opacity: 0;
}

.hero-section--visible .hero-section__badge-wrap {
  animation: heroBadgeIn 0.7s cubic-bezier(0.34, 1.2, 0.64, 1) both;
}

@keyframes heroBadgeIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

.hero-section__title {
  font-size: clamp(2.5rem, 5.5vw, 4rem);
  font-weight: 800;
  line-height: 1.08;
  color: rgba(255, 255, 255, 0.97);
  margin-bottom: 1.35rem;
  letter-spacing: -0.045em;
  opacity: 0;
}

.hero-section--visible .hero-section__title {
  animation: heroTitleIn 1s cubic-bezier(0.34, 1.2, 0.64, 1) both;
}

/* Gradient text: animate background-position only (no filter in keyframes for perf) */
.hero-section__title-highlight {
  display: inline-block;
  background: linear-gradient(120deg, #a78bfa 0%, #06b6d4 40%, #a78bfa 70%, #ec4899 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
}

.hero-section--visible .hero-section__title-highlight {
  animation: heroHighlightShimmer 6s ease-in-out infinite;
}

@keyframes heroHighlightShimmer {
  0%, 100% { background-position: 0% center; opacity: 1; }
  50% { background-position: 100% center; opacity: 0.92; }
}

@keyframes heroTitleIn {
  from { opacity: 0; transform: translateY(28px); }
  to { opacity: 1; transform: translateY(0); }
}

.hero-section__description {
  font-size: clamp(1.05rem, 2.2vw, 1.3rem);
  color: rgba(255, 255, 255, 0.72);
  line-height: 1.7;
  margin-bottom: 2.25rem;
  max-width: 520px;
  opacity: 0;
}

.hero-section--visible .hero-section__description {
  animation: heroDescIn 1s cubic-bezier(0.34, 1.2, 0.64, 1) 0.2s both;
}

@keyframes heroDescIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.hero-section__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  opacity: 0;
}

.hero-section--visible .hero-section__actions {
  animation: heroActionsIn 1s cubic-bezier(0.34, 1.2, 0.64, 1) 0.35s both;
}

@keyframes heroActionsIn {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

.hero-section__visual {
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
}

.hero-section--visible .hero-section__visual {
  animation: heroVisualIn 1.2s cubic-bezier(0.34, 1.2, 0.64, 1) 0.25s both;
}

@keyframes heroVisualIn {
  from { opacity: 0; transform: scale(0.9) translateX(30px); }
  to { opacity: 1; transform: scale(1) translateX(0); }
}

/* ---------- Mobile: lighter animations for performance ---------- */
@media (max-width: 767px) {
  /* No blur on orbs (filter is very expensive on mobile GPU) */
  .hero-section__orb--1,
  .hero-section__orb--2,
  .hero-section__orb--3,
  .hero-section__orb--4 {
    filter: none;
  }

  /* Slightly smaller orbs, same positions */
  .hero-section__orb--1 { width: 320px; height: 320px; }
  .hero-section__orb--2 { width: 240px; height: 240px; }
  .hero-section__orb--3 { width: 180px; height: 180px; }
  .hero-section__orb--4 { width: 120px; height: 120px; }

  .hero-section--visible .hero-section__orb {
    animation-duration: 20s;
  }

  .hero-section--visible .hero-section__grid {
    animation-duration: 12s;
  }

  .hero-section--visible .hero-section__scan {
    animation-duration: 6s;
  }

  .hero-section--visible .hero-section__particle {
    animation-duration: 14s;
  }

  /* Fewer particles visible on mobile (hide the rest) */
  .hero-section__particle:nth-child(n+7) {
    display: none;
  }

  /* Remove glow pseudo on particles to reduce paint */
  .hero-section__particle::before {
    display: none;
  }

  /* Shorter entry animation durations */
  .hero-section--visible .hero-section__badge-wrap {
    animation-duration: 0.5s;
  }
  .hero-section--visible .hero-section__title {
    animation-duration: 0.6s;
  }
  .hero-section--visible .hero-section__description {
    animation-duration: 0.6s;
    animation-delay: 0.1s;
  }
  .hero-section--visible .hero-section__actions {
    animation-duration: 0.6s;
    animation-delay: 0.2s;
  }
  .hero-section--visible .hero-section__visual {
    animation-duration: 0.7s;
    animation-delay: 0.15s;
  }

  .hero-section--visible .hero-section__title-highlight {
    animation: none;
  }
}

@media (max-width: 768px) {
  .hero-section__content {
    grid-template-columns: 1fr;
    gap: 2.5rem;
    text-align: center;
  }

  .hero-section__description {
    margin-left: auto;
    margin-right: auto;
  }

  .hero-section__actions {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .hero-section {
    min-height: auto;
    padding: 2.5rem 1rem;
  }
}

/* ---------- Reduced motion: disable animations, show final state ---------- */
@media (prefers-reduced-motion: reduce) {
  .hero-section__orb,
  .hero-section__grid,
  .hero-section__scan,
  .hero-section__particle,
  .hero-section__title-highlight {
    animation: none !important;
  }

  .hero-section__badge-wrap,
  .hero-section__title,
  .hero-section__description,
  .hero-section__actions,
  .hero-section__visual {
    animation: none !important;
    opacity: 1;
    transform: none;
  }
}
</style>
