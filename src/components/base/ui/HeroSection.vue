<template>
  <section
    ref="heroRef"
    class="hero-section"
    :class="[
      `hero-section--tier-${tier}`,
      {
        'hero-section--visible': isVisible,
        'hero-section--with-logo': $slots.logo,
        'hero-section--gsap': gsapEntry,
        'hero-section--gsap-loops': gsapLoops,
        'hero-section--entered': hasEntered,
      },
    ]"
    @mousemove="onPointerMove"
    @touchmove.passive="onPointerMove"
    @mouseleave="resetPointer"
  >
    <div class="hero-section__bg">
      <div ref="orb1Ref" class="hero-section__orb hero-section__orb--1" aria-hidden="true"></div>
      <div ref="orb2Ref" class="hero-section__orb hero-section__orb--2" aria-hidden="true"></div>
      <div ref="orb3Ref" class="hero-section__orb hero-section__orb--3" aria-hidden="true"></div>
      <div ref="orb4Ref" class="hero-section__orb hero-section__orb--4" aria-hidden="true"></div>

      <!-- Cursor-reactive orbs (desktop only) -->
      <div v-if="tier === 'high'" class="hero-section__cursor-orbs" aria-hidden="true">
        <div class="hero-section__cursor-orb hero-section__cursor-orb--1" :style="cursorOrbStyle(1)"></div>
        <div class="hero-section__cursor-orb hero-section__cursor-orb--2" :style="cursorOrbStyle(2)"></div>
      </div>

      <div class="hero-section__grid" aria-hidden="true"></div>
      <div v-if="tier !== 'low'" class="hero-section__grid-perspective" aria-hidden="true"></div>
      <div v-if="tier === 'high'" class="hero-section__hexgrid" aria-hidden="true"></div>

      <!-- Cyberpunk: corruption blocks (small flickering data fragments) -->
      <div v-if="tier !== 'low'" class="hero-section__corruption" aria-hidden="true">
        <span class="hero-section__corruption-block" v-for="n in corruptionCount" :key="`c${n}`" :style="corruptionStyle(n)"></span>
      </div>

      <!-- Cyberpunk: glitch distortion bars (replace the simple sweep) -->
      <div class="hero-section__glitch-bars" aria-hidden="true">
        <div ref="bar1Ref" class="hero-section__glitch-bar hero-section__glitch-bar--1"></div>
        <div ref="bar2Ref" class="hero-section__glitch-bar hero-section__glitch-bar--2"></div>
        <div ref="bar3Ref" class="hero-section__glitch-bar hero-section__glitch-bar--3"></div>
      </div>

      <div ref="scanRef" class="hero-section__scan" aria-hidden="true"></div>

      <div v-if="tier !== 'low'" class="hero-section__particles" aria-hidden="true">
        <span
          v-for="n in particleCount"
          :key="n"
          class="hero-section__particle"
          :style="particleStyle(n)"
        ></span>
      </div>

      <div class="hero-section__vignette" aria-hidden="true"></div>
      <div v-if="tier === 'high'" class="hero-section__noise" aria-hidden="true"></div>

      <!-- Cyberpunk: HUD corner brackets framing the hero -->
      <div class="hero-section__bracket hero-section__bracket--tl" aria-hidden="true"></div>
      <div class="hero-section__bracket hero-section__bracket--tr" aria-hidden="true"></div>
      <div class="hero-section__bracket hero-section__bracket--bl" aria-hidden="true"></div>
      <div class="hero-section__bracket hero-section__bracket--br" aria-hidden="true"></div>
    </div>

    <div
      class="hero-section__inner"
      :class="{ 'hero-section__inner--with-logo': $slots.logo }"
    >
      <div v-if="$slots.logo" ref="logoWrapRef" class="hero-section__logo-wrap">
        <slot name="logo"></slot>
      </div>
      <div v-if="$slots['below-logo']" class="hero-section__below-logo">
        <slot name="below-logo"></slot>
      </div>
      <div class="hero-section__content">
        <div class="hero-section__text">
          <div v-if="$slots.badge" ref="badgeRef" class="hero-section__badge-wrap">
            <slot name="badge"></slot>
          </div>
          <h1 ref="titleRef" class="hero-section__title" :data-text="title">
            <slot name="title">
              <span ref="titleTextRef" class="hero-section__title-text" :data-text="title">{{ title }}</span>
              <span
                v-if="titleHighlight"
                ref="titleHighlightRef"
                class="hero-section__title-highlight"
              >{{ titleHighlight }}</span>
            </slot>
          </h1>
          <p ref="descriptionRef" class="hero-section__description">
            <slot name="description">
              {{ description }}
            </slot>
          </p>
          <div ref="actionsRef" class="hero-section__actions">
            <slot name="actions"></slot>
          </div>
        </div>
        <div v-if="$slots.visual" ref="visualRef" class="hero-section__visual">
          <slot name="visual"></slot>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick, computed } from 'vue'

const props = defineProps({
  title: { type: String, default: '' },
  titleHighlight: { type: String, default: '' },
  description: { type: String, default: '' },
})

const heroRef = ref(null)
const logoWrapRef = ref(null)
const badgeRef = ref(null)
const titleRef = ref(null)
const titleTextRef = ref(null)
const titleHighlightRef = ref(null)
const descriptionRef = ref(null)
const actionsRef = ref(null)
const visualRef = ref(null)
const orb1Ref = ref(null)
const orb2Ref = ref(null)
const orb3Ref = ref(null)
const orb4Ref = ref(null)
const scanRef = ref(null)
const bar1Ref = ref(null)
const bar2Ref = ref(null)
const bar3Ref = ref(null)

const isVisible = ref(false)
const hasEntered = ref(false)
const gsapEntry = ref(false)
const gsapLoops = ref(false)
const pointerX = ref(0.5)
const pointerY = ref(0.5)
let rafId = null
let lastX = 0.5
let lastY = 0.5
let scrambleRafId = null
let scrambleRafId2 = null
let glitchTimer = null

// Device tier — same as before.
const tier = ref(detectTier())
const particleCount = computed(() => (tier.value === 'high' ? 22 : 6))
const corruptionCount = computed(() => (tier.value === 'high' ? 14 : 6))

function detectTier() {
  if (typeof window === 'undefined') return 'high'
  const reduced =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduced) return 'low'

  const nav = window.navigator || {}
  const cores = typeof nav.hardwareConcurrency === 'number' ? nav.hardwareConcurrency : 8
  const mem = typeof nav.deviceMemory === 'number' ? nav.deviceMemory : 8
  const isCoarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches
  const isNarrow = window.innerWidth < 768

  if (mem <= 3 || cores <= 3) return 'low'
  if (isCoarse && isNarrow && (mem <= 4 || cores <= 4)) return 'low'
  if (isCoarse || isNarrow) return 'mid'
  return 'high'
}

function onPointerMove(e) {
  if (tier.value !== 'high') return
  const rect = heroRef.value?.getBoundingClientRect()
  if (!rect) return
  const clientX = e.touches ? e.touches[0].clientX : e.clientX
  const clientY = e.touches ? e.touches[0].clientY : e.clientY
  lastX = (clientX - rect.left) / rect.width
  lastY = (clientY - rect.top) / rect.height
  if (rafId) return
  rafId = requestAnimationFrame(() => {
    pointerX.value = Math.max(0, Math.min(1, lastX))
    pointerY.value = Math.max(0, Math.min(1, lastY))
    rafId = null
  })
}

function resetPointer() {
  pointerX.value = 0.5
  pointerY.value = 0.5
}

function cursorOrbStyle(index) {
  const x = pointerX.value * 100
  const y = pointerY.value * 100
  const lag = index === 1 ? 0.45 : 0.75
  return {
    '--cursor-x': `${x}%`,
    '--cursor-y': `${y}%`,
    '--cursor-lag': `${lag}s`,
  }
}

function particleStyle(n) {
  const delay = (n * 0.37) % 6
  const left = (n * 53 + 7) % 100
  const top = (n * 41 + 11) % 100
  const duration = 9 + ((n * 7) % 6)
  return {
    '--p-left': `${left}%`,
    '--p-top': `${top}%`,
    '--p-delay': `-${delay}s`,
    '--p-duration': `${duration}s`,
  }
}

function corruptionStyle(n) {
  const left = (n * 71 + 13) % 95
  const top = (n * 47 + 19) % 95
  const delay = (n * 0.83) % 5
  const duration = 2.2 + ((n * 3) % 4)
  const size = 4 + (n % 4) * 2
  const hue = n % 3 // 0=cyan, 1=magenta, 2=purple
  return {
    '--c-left': `${left}%`,
    '--c-top': `${top}%`,
    '--c-delay': `-${delay}s`,
    '--c-duration': `${duration}s`,
    '--c-size': `${size}px`,
    '--c-hue': hue,
  }
}

// ---- Scramble / decode reveal ----
const SCRAMBLE_CHARS = '!<>-_\\/[]{}=+*^?#█▓▒░ABCDEF0123456789'

function scrambleReveal(el, finalText, duration, rafSlot) {
  if (!el || !finalText) return
  const chars = finalText.split('')
  const lockTimes = chars.map((_, i) => (i / Math.max(chars.length, 1)) * (duration * 0.7) + duration * 0.15)
  const start = performance.now()

  const tick = () => {
    const t = performance.now() - start
    let out = ''
    for (let i = 0; i < chars.length; i++) {
      const c = chars[i]
      if (c === ' ' || c === ' ') {
        out += c
      } else if (t >= lockTimes[i]) {
        out += c
      } else {
        out += SCRAMBLE_CHARS[(Math.random() * SCRAMBLE_CHARS.length) | 0]
      }
    }
    el.textContent = out
    if (t < duration) {
      const id = requestAnimationFrame(tick)
      if (rafSlot === 1) scrambleRafId = id
      else scrambleRafId2 = id
    } else {
      el.textContent = finalText
    }
  }
  tick()
}

// ---- Random glitch flicker (high tier only) ----
function scheduleGlitch() {
  if (tier.value !== 'high' || !titleRef.value) return
  const delay = 3500 + Math.random() * 5000
  glitchTimer = setTimeout(() => {
    const el = titleRef.value
    if (!el) return
    el.classList.add('hero-section__title--glitching')
    setTimeout(() => {
      el?.classList.remove('hero-section__title--glitching')
    }, 280)
    scheduleGlitch()
  }, delay)
}

// ---- GSAP (lazy) ----
let entryTl = null
let orbsTl = null
let scanTl = null
let barsTl = null
let gsapLib = null

async function loadGsap() {
  if (gsapLib) return gsapLib
  const mod = await import('gsap')
  gsapLib = mod.default || mod.gsap || mod
  return gsapLib
}

function runEntryTimeline(g) {
  const badge = badgeRef.value
  const title = titleRef.value
  const titleText = titleTextRef.value
  const titleHighlight = titleHighlightRef.value
  const description = descriptionRef.value
  const actions = actionsRef.value
  const visual = visualRef.value
  const logo = logoWrapRef.value
  const bars = [bar1Ref.value, bar2Ref.value, bar3Ref.value].filter(Boolean)

  entryTl = g.timeline({
    defaults: { ease: 'power3.out', force3D: true },
    onComplete: () => {
      hasEntered.value = true
      scheduleGlitch()
    },
  })

  // 1. Glitch bars rip across the hero in fast staccato.
  if (bars.length) {
    g.set(bars, { opacity: 0, scaleX: 0, transformOrigin: '0% 50%' })
    entryTl.to(
      bars,
      {
        opacity: 1,
        scaleX: 1,
        duration: 0.18,
        ease: 'power2.out',
        stagger: 0.08,
      },
      0
    )
    entryTl.to(
      bars,
      { opacity: 0, duration: 0.25, ease: 'power1.in', stagger: 0.05 },
      '>-0.05'
    )
  }

  if (logo) {
    g.set(logo, { opacity: 0, y: -8, scale: 0.96 })
    entryTl.to(logo, { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'back.out(1.3)' }, 0.1)
  }
  if (badge) {
    g.set(badge, { opacity: 0, y: 14 })
    entryTl.to(badge, { opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.5)' }, 0.2)
  }

  // 2. Title materializes via scramble + chromatic split flash.
  if (title) {
    g.set(title, { opacity: 0, y: 24 })
    entryTl.to(
      title,
      { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' },
      badge ? '-=0.25' : 0.15
    )
    // Trigger the scramble during the rise.
    entryTl.call(
      () => {
        if (titleText && props.title) {
          scrambleReveal(titleText, props.title, 750, 1)
        }
        if (titleHighlight && props.titleHighlight) {
          scrambleReveal(titleHighlight, props.titleHighlight, 800, 2)
        }
        // Briefly flash the "glitching" class for chromatic split + slice.
        title.classList.add('hero-section__title--glitching')
        setTimeout(() => title?.classList.remove('hero-section__title--glitching'), 380)
      },
      null,
      '<'
    )
  }

  if (description) {
    g.set(description, { opacity: 0, y: 18 })
    entryTl.to(description, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.3')
  }
  if (actions) {
    g.set(actions, { opacity: 0, y: 16 })
    entryTl.to(actions, { opacity: 1, y: 0, duration: 0.55, ease: 'back.out(1.3)' }, '-=0.4')
  }
  if (visual) {
    g.set(visual, { opacity: 0, x: 32, rotationY: -8, transformPerspective: 800 })
    entryTl.to(
      visual,
      { opacity: 1, x: 0, rotationY: 0, duration: 0.85, ease: 'power3.out' },
      '-=0.6'
    )
  }
}

function runOrbsLoop(g) {
  const orbs = [orb1Ref.value, orb2Ref.value, orb3Ref.value, orb4Ref.value].filter(Boolean)
  if (!orbs.length) return
  orbsTl = g.timeline({ repeat: -1, yoyo: true })
  orbsTl.to(orbs, {
    x: (i) => (i % 2 === 0 ? 22 : -22),
    y: (i) => (i % 2 === 0 ? -18 : 18),
    scale: 1.06,
    opacity: 0.55,
    duration: 6,
    ease: 'sine.inOut',
    stagger: { each: 0.4, from: 'random' },
  })
}

function runScanLoop(g) {
  const scan = scanRef.value
  if (!scan) return
  g.set(scan, { y: 0, opacity: 0 })
  scanTl = g.timeline({ repeat: -1, repeatDelay: 2.5 })
  scanTl
    .to(scan, { opacity: 0.7, duration: 0.4, ease: 'power1.out' })
    .to(scan, { y: '100vh', duration: 3.6, ease: 'none' }, '<')
    .to(scan, { opacity: 0, duration: 0.5, ease: 'power1.in' }, '-=0.5')
    .set(scan, { y: 0 })
}

// Random glitch-bar flashes after entry — cyberpunk ambience.
function runBarsLoop(g) {
  const bars = [bar1Ref.value, bar2Ref.value, bar3Ref.value].filter(Boolean)
  if (!bars.length) return
  barsTl = g.timeline({ repeat: -1, repeatDelay: 4 })
  bars.forEach((bar, i) => {
    barsTl.to(
      bar,
      {
        opacity: 0.9,
        scaleX: 1,
        duration: 0.12,
        ease: 'power2.out',
        transformOrigin: i % 2 === 0 ? '0% 50%' : '100% 50%',
      },
      i * 0.1
    )
    barsTl.to(
      bar,
      { opacity: 0, duration: 0.2, ease: 'power1.in' },
      `>-0.02`
    )
  })
}

async function runHeroGSAP() {
  if (tier.value === 'low') {
    hasEntered.value = true
    return
  }
  const g = await loadGsap()
  if (!heroRef.value) return
  gsapEntry.value = true
  runEntryTimeline(g)
  if (tier.value === 'high') {
    gsapLoops.value = true
    runOrbsLoop(g)
    runScanLoop(g)
    runBarsLoop(g)
  }
}

function killHeroGSAP() {
  ;[entryTl, orbsTl, scanTl, barsTl].forEach((tl) => {
    if (tl) tl.kill()
  })
  entryTl = orbsTl = scanTl = barsTl = null
  gsapEntry.value = false
  gsapLoops.value = false
  if (scrambleRafId) cancelAnimationFrame(scrambleRafId)
  if (scrambleRafId2) cancelAnimationFrame(scrambleRafId2)
  if (glitchTimer) clearTimeout(glitchTimer)
  scrambleRafId = scrambleRafId2 = glitchTimer = null
}

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

watch(
  isVisible,
  (visible) => {
    if (!visible) return
    nextTick().then(runHeroGSAP)
  },
  { immediate: true }
)

onUnmounted(() => {
  if (rafId) cancelAnimationFrame(rafId)
  if (observer && heroRef.value) observer.unobserve(heroRef.value)
  killHeroGSAP()
})
</script>

<style scoped>
.hero-section {
  position: relative;
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(2.5rem, 6vw, 4.5rem) 1.25rem;
  overflow: hidden;
  isolation: isolate;
}

.hero-section--with-logo {
  padding-top: 0;
  padding-bottom: 0;
}

.hero-section__bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

/* ============ Orbs (background mood) ============ */
.hero-section__orb {
  position: absolute;
  border-radius: 50%;
  opacity: 0.4;
}
.hero-section--tier-high.hero-section--visible .hero-section__orb,
.hero-section--tier-mid.hero-section--visible .hero-section__orb {
  will-change: transform, opacity;
}
.hero-section--visible:not(.hero-section--gsap-loops) .hero-section__orb {
  animation: heroOrbDrift 18s ease-in-out infinite;
}
.hero-section--tier-mid.hero-section--visible:not(.hero-section--gsap-loops) .hero-section__orb {
  animation-duration: 22s;
}
.hero-section--tier-low .hero-section__orb {
  animation: none !important;
}

.hero-section__orb--1 { width: 560px; height: 560px; background: rgba(168, 85, 247, 0.32); top: -25%; left: -12%; filter: blur(90px); }
.hero-section__orb--2 { width: 420px; height: 420px; background: rgba(0, 245, 255, 0.28); top: 25%; right: -18%; filter: blur(90px); animation-delay: -3s; }
.hero-section__orb--3 { width: 320px; height: 320px; background: rgba(255, 0, 128, 0.22); bottom: -15%; left: 25%; filter: blur(90px); animation-delay: -7s; }
.hero-section__orb--4 { width: 200px; height: 200px; background: rgba(0, 255, 136, 0.18); top: 60%; left: 5%; filter: blur(90px); animation-delay: -11s; }

@keyframes heroOrbDrift {
  0%, 100% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.4; }
  50%      { transform: translate3d(22px, -18px, 0) scale(1.05); opacity: 0.55; }
}

/* ============ Cursor orbs (desktop) ============ */
.hero-section__cursor-orbs { position: absolute; inset: 0; pointer-events: none; }
.hero-section__cursor-orb {
  position: absolute;
  width: 280px; height: 280px;
  margin-left: -140px; margin-top: -140px;
  left: var(--cursor-x, 50%); top: var(--cursor-y, 50%);
  border-radius: 50%;
  background: radial-gradient(circle, rgba(0, 245, 255, 0.14) 0%, transparent 65%);
  filter: blur(40px);
  transition:
    left var(--cursor-lag, 0.5s) cubic-bezier(0.22, 1, 0.36, 1),
    top var(--cursor-lag, 0.5s) cubic-bezier(0.22, 1, 0.36, 1);
}
.hero-section__cursor-orb--2 {
  width: 180px; height: 180px;
  margin-left: -90px; margin-top: -90px;
  background: radial-gradient(circle, rgba(255, 0, 128, 0.12) 0%, transparent 65%);
}

/* ============ Grid / perspective / hexgrid ============ */
.hero-section__grid {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(0, 245, 255, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 245, 255, 0.06) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse 120% 100% at 50% 45%, black 10%, transparent 70%);
  -webkit-mask-image: radial-gradient(ellipse 120% 100% at 50% 45%, black 10%, transparent 70%);
  opacity: 0.9;
}
.hero-section--tier-low .hero-section__grid {
  mask-image: none; -webkit-mask-image: none;
  background-image:
    linear-gradient(rgba(0, 245, 255, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 245, 255, 0.035) 1px, transparent 1px);
  opacity: 0.7;
}
.hero-section__grid-perspective {
  position: absolute; inset: -20%;
  background: linear-gradient(180deg, rgba(0, 245, 255, 0.03) 0%, transparent 40%, transparent 60%, rgba(168, 85, 247, 0.04) 100%);
  pointer-events: none;
}
.hero-section__hexgrid {
  position: absolute; inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='24' viewBox='0 0 28 24'%3E%3Cpath fill='none' stroke='rgba(168,85,247,0.05)' stroke-width='0.5' d='M14 0l7 4v8l-7 4-7-4V4z'/%3E%3Cpath fill='none' stroke='rgba(0,245,255,0.04)' stroke-width='0.4' d='M0 12l7-4 7 4 7-4'/%3E%3C/svg%3E");
  background-size: 28px 24px;
  mask-image: radial-gradient(ellipse 100% 80% at 50% 35%, black 25%, transparent 75%);
  -webkit-mask-image: radial-gradient(ellipse 100% 80% at 50% 35%, black 25%, transparent 75%);
  pointer-events: none;
}
.hero-section__vignette {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse 100% 80% at 50% 50%, transparent 40%, rgba(0, 0, 0, 0.4) 100%);
  pointer-events: none;
}

/* ============ HUD corner brackets ============ */
.hero-section__bracket {
  position: absolute;
  width: 56px;
  height: 56px;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.6s ease;
}
.hero-section--visible .hero-section__bracket { opacity: 1; }

.hero-section__bracket::before,
.hero-section__bracket::after {
  content: '';
  position: absolute;
  background: linear-gradient(90deg, rgba(0, 245, 255, 0.9), rgba(255, 0, 128, 0.4));
  box-shadow: 0 0 8px rgba(0, 245, 255, 0.6);
}
.hero-section__bracket::before { height: 2px; }
.hero-section__bracket::after  { width: 2px;  background: linear-gradient(180deg, rgba(0, 245, 255, 0.9), rgba(255, 0, 128, 0.4)); }

.hero-section__bracket--tl { top: 16px; left: 16px; }
.hero-section__bracket--tl::before { top: 0; left: 0; right: 0; }
.hero-section__bracket--tl::after  { top: 0; left: 0; bottom: 0; }

.hero-section__bracket--tr { top: 16px; right: 16px; }
.hero-section__bracket--tr::before { top: 0; left: 0; right: 0; }
.hero-section__bracket--tr::after  { top: 0; right: 0; bottom: 0; }

.hero-section__bracket--bl { bottom: 16px; left: 16px; }
.hero-section__bracket--bl::before { bottom: 0; left: 0; right: 0; }
.hero-section__bracket--bl::after  { top: 0; left: 0; bottom: 0; }

.hero-section__bracket--br { bottom: 16px; right: 16px; }
.hero-section__bracket--br::before { bottom: 0; left: 0; right: 0; }
.hero-section__bracket--br::after  { top: 0; right: 0; bottom: 0; }

/* Brackets "draw on" via clip-path on visible. */
.hero-section--visible .hero-section__bracket::before { animation: hudHLine 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.1s both; }
.hero-section--visible .hero-section__bracket::after  { animation: hudVLine 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.15s both; }
@keyframes hudHLine { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0 0 0 0); } }
@keyframes hudVLine { from { clip-path: inset(100% 0 0 0); } to { clip-path: inset(0 0 0 0); } }

.hero-section--tier-low .hero-section__bracket::before,
.hero-section--tier-low .hero-section__bracket::after {
  animation: none !important;
  clip-path: inset(0);
  box-shadow: none;
}

/* ============ Corruption blocks (small flickering data fragments) ============ */
.hero-section__corruption { position: absolute; inset: 0; pointer-events: none; }
.hero-section__corruption-block {
  position: absolute;
  left: var(--c-left, 50%);
  top: var(--c-top, 50%);
  width: var(--c-size, 6px);
  height: var(--c-size, 6px);
  background:
    rgba(0, 245, 255, 0.85);
  opacity: 0;
  mix-blend-mode: screen;
  animation-name: corruptFlicker;
  animation-iteration-count: infinite;
  animation-duration: var(--c-duration, 3s);
  animation-delay: var(--c-delay, 0s);
  animation-timing-function: steps(1, end);
}
.hero-section__corruption-block:nth-child(3n) { background: rgba(255, 0, 128, 0.85); }
.hero-section__corruption-block:nth-child(3n+1) { background: rgba(168, 85, 247, 0.85); }

@keyframes corruptFlicker {
  0%, 88%, 100% { opacity: 0; transform: translate3d(0, 0, 0); }
  90%   { opacity: 1; transform: translate3d(2px, 0, 0); }
  92%   { opacity: 0; }
  94%   { opacity: 1; transform: translate3d(-2px, 0, 0); }
  96%   { opacity: 0; }
}

/* ============ Glitch bars (replace single sweep) ============ */
.hero-section__glitch-bars { position: absolute; inset: 0; pointer-events: none; }
.hero-section__glitch-bar {
  position: absolute;
  left: 0; right: 0;
  height: 2px;
  opacity: 0;
  transform: scaleX(0);
  transform-origin: 0% 50%;
  mix-blend-mode: screen;
  pointer-events: none;
}
.hero-section__glitch-bar--1 {
  top: 38%;
  background: linear-gradient(90deg, transparent, rgba(0, 245, 255, 0.95) 30%, rgba(0, 245, 255, 0.95) 70%, transparent);
  box-shadow: 0 0 8px rgba(0, 245, 255, 0.7);
  height: 1px;
}
.hero-section__glitch-bar--2 {
  top: 52%;
  background: linear-gradient(90deg, transparent, rgba(255, 0, 128, 0.95) 25%, rgba(255, 0, 128, 0.95) 75%, transparent);
  box-shadow: 0 0 10px rgba(255, 0, 128, 0.6);
  height: 3px;
}
.hero-section__glitch-bar--3 {
  top: 65%;
  background: linear-gradient(90deg, transparent, rgba(168, 85, 247, 0.95) 35%, rgba(168, 85, 247, 0.95) 65%, transparent);
  box-shadow: 0 0 8px rgba(168, 85, 247, 0.6);
  height: 1px;
}
/* CSS fallback for bars on tiers without GSAP loops driving them. */
.hero-section--tier-mid.hero-section--visible .hero-section__glitch-bar {
  animation: barFlicker 7s steps(1, end) infinite;
}
.hero-section--tier-mid.hero-section--visible .hero-section__glitch-bar--2 { animation-delay: -2.3s; }
.hero-section--tier-mid.hero-section--visible .hero-section__glitch-bar--3 { animation-delay: -4.7s; }
.hero-section--tier-low .hero-section__glitch-bar {
  /* One subtle pulse on entry, then static. */
  animation: barEntryLow 1.2s ease-out 0.1s forwards;
}
@keyframes barFlicker {
  0%, 95%, 100% { opacity: 0; transform: scaleX(0); }
  96%  { opacity: 0.9; transform: scaleX(1); }
  97%  { opacity: 0; }
  98%  { opacity: 0.9; transform: scaleX(1) translate3d(0, 1px, 0); }
  99%  { opacity: 0; }
}
@keyframes barEntryLow {
  0%   { opacity: 0; transform: scaleX(0); }
  40%  { opacity: 0.9; transform: scaleX(1); }
  100% { opacity: 0; transform: scaleX(1); }
}

/* ============ Scan ============ */
.hero-section__scan {
  position: absolute; top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(0, 245, 255, 0.85), rgba(255, 0, 128, 0.9), transparent);
  pointer-events: none;
  opacity: 0;
}
.hero-section--tier-high.hero-section--visible .hero-section__scan { will-change: transform, opacity; }
.hero-section__scan::after {
  content: ''; position: absolute; inset: -2px 0;
  background: rgba(0, 245, 255, 0.15);
  border-radius: 2px;
  z-index: -1;
}
.hero-section--visible:not(.hero-section--gsap-loops) .hero-section__scan {
  animation: heroScan 6s linear infinite;
}
.hero-section--tier-low .hero-section__scan { display: none; }
@keyframes heroScan {
  0%   { transform: translate3d(0, 0, 0); opacity: 0; }
  10%  { opacity: 0.85; }
  90%  { opacity: 0.85; }
  100% { transform: translate3d(0, 100vh, 0); opacity: 0; }
}

/* ============ Particles ============ */
.hero-section__particles { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
.hero-section__particle {
  position: absolute;
  width: 4px; height: 4px;
  border-radius: 50%;
  background: rgba(0, 245, 255, 0.45);
  left: var(--p-left, 20%); top: var(--p-top, 30%);
  animation-delay: var(--p-delay, 0s);
  animation-duration: var(--p-duration, 10s);
}
.hero-section--visible .hero-section__particle {
  animation-name: heroParticle;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
  will-change: transform, opacity;
}
.hero-section--tier-high .hero-section__particle::before {
  content: '';
  position: absolute; inset: -4px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(0, 245, 255, 0.35) 0%, transparent 70%);
  pointer-events: none;
}
@keyframes heroParticle {
  0%, 100% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.35; }
  33%      { transform: translate3d(12px, -32px, 0) scale(1.1); opacity: 0.8; }
  66%      { transform: translate3d(-16px, -12px, 0) scale(0.9); opacity: 0.5; }
}

/* ============ Noise ============ */
.hero-section__noise {
  position: absolute; inset: 0;
  opacity: 0.05;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  pointer-events: none;
}

/* ============ Inner / layout ============ */
.hero-section__inner {
  position: relative; z-index: 1;
  width: 80vw; max-width: 80vw;
  margin-left: auto; margin-right: auto;
  box-sizing: border-box;
}
.hero-section__inner--with-logo {
  display: flex; flex-direction: column; align-items: center;
  gap: clamp(0.9rem, 2.5vw, 1.5rem);
  text-align: center;
}
.hero-section__logo-wrap { width: 100%; display: flex; justify-content: center; flex-shrink: 0; background: none; border: none; box-shadow: none; }
.hero-section__below-logo { width: 100%; display: flex; justify-content: center; flex-shrink: 0; }
.hero-section__content { width: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: clamp(2.5rem, 5vw, 4.5rem); align-items: center; }
.hero-section__inner--with-logo .hero-section__content { grid-template-columns: 1fr; max-width: 640px; margin: 0 auto; }
.hero-section__text { display: flex; flex-direction: column; }

/* ============ Badge ============ */
.hero-section__badge-wrap { margin-bottom: 0.75rem; opacity: 0; }
.hero-section--visible:not(.hero-section--gsap) .hero-section__badge-wrap {
  animation: heroBadgeIn 0.6s cubic-bezier(0.34, 1.3, 0.64, 1) both;
}
@keyframes heroBadgeIn {
  from { opacity: 0; transform: translate3d(0, 14px, 0); }
  to   { opacity: 1; transform: translate3d(0, 0, 0); }
}

/* ============ Title (cyberpunk) ============ */
.hero-section__title {
  position: relative;
  font-size: clamp(2.75rem, 7vw, 4.5rem);
  font-weight: 800;
  line-height: 1.05;
  color: rgba(255, 255, 255, 0.98);
  margin-bottom: 1.5rem;
  letter-spacing: -0.04em;
  opacity: 0;
  text-shadow: 0 0 60px rgba(0, 245, 255, 0.08);
}
.hero-section__title-text {
  display: inline;
  /* Permanent subtle chromatic aberration on the title — gives it the cyberpunk feel even at rest. */
  text-shadow:
    0.018em 0 0 rgba(255, 0, 128, 0.55),
    -0.018em 0 0 rgba(0, 245, 255, 0.55);
}
.hero-section--tier-low .hero-section__title-text {
  /* On low tier, the chromatic shadow is the only "futuristic" cue on the title — keep but reduce. */
  text-shadow:
    0.012em 0 0 rgba(255, 0, 128, 0.4),
    -0.012em 0 0 rgba(0, 245, 255, 0.4);
}

.hero-section--visible:not(.hero-section--gsap) .hero-section__title {
  animation: heroTitleIn 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
}
@keyframes heroTitleIn {
  from { opacity: 0; transform: translate3d(0, 24px, 0); }
  to   { opacity: 1; transform: translate3d(0, 0, 0); }
}

/* Active glitch: triggered briefly on entry + at random intervals. */
.hero-section__title--glitching .hero-section__title-text {
  animation: titleChroma 0.28s steps(8, end);
}
.hero-section__title--glitching::before,
.hero-section__title--glitching::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  pointer-events: none;
  font: inherit;
  letter-spacing: inherit;
}
.hero-section__title--glitching::before {
  color: rgba(0, 245, 255, 0.9);
  transform: translate3d(-3px, 1px, 0);
  clip-path: inset(15% 0 55% 0);
  mix-blend-mode: screen;
  animation: titleSliceA 0.28s steps(4, end);
}
.hero-section__title--glitching::after {
  color: rgba(255, 0, 128, 0.9);
  transform: translate3d(3px, -1px, 0);
  clip-path: inset(50% 0 20% 0);
  mix-blend-mode: screen;
  animation: titleSliceB 0.28s steps(4, end);
}
@keyframes titleChroma {
  0%   { text-shadow:  0.04em 0 0 rgba(255, 0, 128, 0.8), -0.04em 0 0 rgba(0, 245, 255, 0.8); transform: translate3d(0, 0, 0); }
  25%  { text-shadow: -0.06em 0 0 rgba(255, 0, 128, 0.9),  0.06em 0 0 rgba(0, 245, 255, 0.9); transform: translate3d(2px, 0, 0); }
  50%  { text-shadow:  0.05em 0 0 rgba(255, 0, 128, 0.9), -0.05em 0 0 rgba(0, 245, 255, 0.9); transform: translate3d(-2px, 1px, 0); }
  75%  { text-shadow: -0.03em 0 0 rgba(255, 0, 128, 0.9),  0.03em 0 0 rgba(0, 245, 255, 0.9); transform: translate3d(1px, -1px, 0); }
  100% { text-shadow:  0.018em 0 0 rgba(255, 0, 128, 0.55), -0.018em 0 0 rgba(0, 245, 255, 0.55); transform: translate3d(0, 0, 0); }
}
@keyframes titleSliceA {
  0%   { clip-path: inset(15% 0 55% 0); transform: translate3d(-3px, 1px, 0); }
  33%  { clip-path: inset(30% 0 40% 0); transform: translate3d(-6px, -1px, 0); }
  66%  { clip-path: inset(5% 0 70% 0);  transform: translate3d(4px, 2px, 0); }
  100% { clip-path: inset(15% 0 55% 0); transform: translate3d(-3px, 1px, 0); }
}
@keyframes titleSliceB {
  0%   { clip-path: inset(50% 0 20% 0); transform: translate3d(3px, -1px, 0); }
  33%  { clip-path: inset(65% 0 5% 0);  transform: translate3d(6px, 1px, 0); }
  66%  { clip-path: inset(40% 0 35% 0); transform: translate3d(-4px, -2px, 0); }
  100% { clip-path: inset(50% 0 20% 0); transform: translate3d(3px, -1px, 0); }
}

/* Highlight word: gradient neon, slow shimmer. */
.hero-section__title-highlight {
  display: inline-block;
  background: linear-gradient(120deg, #00f5ff 0%, #a855f7 35%, #ff0080 70%, #00f5ff 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
  filter: drop-shadow(0 0 30px rgba(0, 245, 255, 0.3));
}
.hero-section--tier-high.hero-section--entered .hero-section__title-highlight,
.hero-section--tier-high.hero-section--visible:not(.hero-section--gsap) .hero-section__title-highlight {
  animation: heroHighlightShimmer 6s ease-in-out infinite;
}
@keyframes heroHighlightShimmer {
  0%, 100% { background-position: 0% center; }
  50%      { background-position: 100% center; }
}

/* ============ Description / actions ============ */
.hero-section__description {
  font-size: clamp(1rem, 2vw, 1.25rem);
  color: rgba(255, 255, 255, 0.72);
  line-height: 1.75;
  margin-bottom: 2rem;
  max-width: 480px;
  opacity: 0;
  letter-spacing: 0.02em;
}
.hero-section--visible:not(.hero-section--gsap) .hero-section__description {
  animation: heroFadeUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both;
}
.hero-section__actions {
  display: flex; flex-wrap: wrap; gap: 1rem;
  opacity: 0;
}
.hero-section--visible:not(.hero-section--gsap) .hero-section__actions {
  animation: heroFadeUp 0.7s cubic-bezier(0.34, 1.3, 0.64, 1) 0.35s both;
}
@keyframes heroFadeUp {
  from { opacity: 0; transform: translate3d(0, 18px, 0); }
  to   { opacity: 1; transform: translate3d(0, 0, 0); }
}
.hero-section__visual {
  display: flex; justify-content: center; align-items: center;
  opacity: 0;
}
.hero-section--visible:not(.hero-section--gsap) .hero-section__visual {
  animation: heroVisualIn 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.25s both;
}
@keyframes heroVisualIn {
  from { opacity: 0; transform: translate3d(28px, 0, 0); }
  to   { opacity: 1; transform: translate3d(0, 0, 0); }
}

/* ============ Mobile tuning ============ */
@media (max-width: 767px) {
  .hero-section__orb { filter: none; }
  .hero-section__orb--1 { width: 320px; height: 320px; }
  .hero-section__orb--2 { width: 240px; height: 240px; }
  .hero-section__orb--3 { width: 180px; height: 180px; }
  .hero-section__orb--4 { width: 120px; height: 120px; }

  .hero-section__bracket { width: 36px; height: 36px; }
  .hero-section__bracket--tl, .hero-section__bracket--tr { top: 10px; }
  .hero-section__bracket--bl, .hero-section__bracket--br { bottom: 10px; }
  .hero-section__bracket--tl, .hero-section__bracket--bl { left: 10px; }
  .hero-section__bracket--tr, .hero-section__bracket--br { right: 10px; }

  .hero-section--visible:not(.hero-section--gsap) .hero-section__badge-wrap { animation-duration: 0.5s; }
  .hero-section--visible:not(.hero-section--gsap) .hero-section__title { animation-duration: 0.55s; }
  .hero-section--visible:not(.hero-section--gsap) .hero-section__description { animation-duration: 0.55s; animation-delay: 0.1s; }
  .hero-section--visible:not(.hero-section--gsap) .hero-section__actions { animation-duration: 0.55s; animation-delay: 0.2s; }
  .hero-section--visible:not(.hero-section--gsap) .hero-section__visual { animation-duration: 0.6s; animation-delay: 0.15s; }
  .hero-section__title-highlight { animation: none !important; }
}

@media (max-width: 768px) {
  .hero-section__content {
    grid-template-columns: 1fr;
    gap: 2.5rem;
    text-align: center;
  }
  .hero-section__description { margin-left: auto; margin-right: auto; }
  .hero-section__actions { justify-content: center; }
}

@media (max-width: 480px) {
  .hero-section { min-height: auto; padding: 2.5rem 1rem; }
}

/* ============ Reduced motion ============ */
@media (prefers-reduced-motion: reduce) {
  .hero-section__orb,
  .hero-section__grid,
  .hero-section__scan,
  .hero-section__particle,
  .hero-section__title-highlight,
  .hero-section__glitch-bar,
  .hero-section__corruption-block,
  .hero-section__bracket::before,
  .hero-section__bracket::after,
  .hero-section__inner {
    animation: none !important;
  }
  .hero-section__badge-wrap,
  .hero-section__title,
  .hero-section__description,
  .hero-section__actions,
  .hero-section__visual,
  .hero-section__logo-wrap {
    animation: none !important;
    opacity: 1;
    transform: none;
    clip-path: none;
    -webkit-clip-path: none;
  }
  .hero-section__title-text {
    text-shadow: none;
  }
}
</style>
