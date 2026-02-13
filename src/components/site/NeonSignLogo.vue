<template>
  <header
    ref="rootRef"
    class="neon-lamp"
    :class="[
      `neon-lamp--${normalizedStatus}`,
      { 'neon-lamp--loaded': hasLoadedOnce },
      { 'neon-lamp--hover': isHovered }
    ]"
    role="banner"
    aria-label="Site status"
    @mousemove="onPointerMove"
    @touchmove.passive="onPointerMove"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false; resetPointer()"
  >
    <!-- Standalone mode only: bg layers -->
    <template v-if="!embedded">
      <div class="neon-lamp__bg" aria-hidden="true">
        <div class="neon-lamp__gradient neon-lamp__gradient--1"></div>
        <div class="neon-lamp__gradient neon-lamp__gradient--2"></div>
      </div>
      <div v-show="normalizedStatus === 'open'" class="neon-lamp__particles" aria-hidden="true">
        <span v-for="n in 12" :key="n" class="neon-lamp__particle" :style="particleStyle(n)"></span>
      </div>
    </template>

    <!-- CLOSED: subtle overlay only (no heavy scanline) -->
    <div v-show="normalizedStatus === 'closed'" class="neon-lamp__sleep" aria-hidden="true"></div>

    <div ref="innerRef" class="neon-lamp__inner" :style="innerStyle">
      <!-- Lamp body: hyper-realistic 3D tubes — no container -->
      <div ref="tubesWrapRef" class="neon-lamp__tubes-wrap" :style="tubesWrapStyle">
        <!-- Ambient spill (subtle, so letters stay readable) -->
        <div class="neon-lamp__diffusion" aria-hidden="true">
          <span class="neon-lamp__diffusion-text">{{ displayText }}</span>
        </div>
        <!-- Depth layer 1: far back (tube thickness) -->
        <span class="neon-lamp__tubes-back" aria-hidden="true">{{ displayText }}</span>
        <!-- Depth layer 2: mid (tube body glow) -->
        <span class="neon-lamp__tubes-mid" aria-hidden="true">{{ displayText }}</span>
        <!-- Tube edge: crisp outline so letters read clearly -->
        <span class="neon-lamp__tubes-edge" aria-hidden="true">{{ displayText }}</span>
        <!-- Main tube face: bright core, controlled glow -->
        <span class="neon-lamp__tubes" :data-text="displayText">{{ displayText }}</span>
        <!-- Specular: tiny highlight for glass -->
        <span class="neon-lamp__tubes-specular" aria-hidden="true">{{ displayText }}</span>
        <!-- Ground reflection -->
        <div class="neon-lamp__reflection" aria-hidden="true"></div>
      </div>

      <!-- Hanging status sign: one cable, glass panel, pendulum (directly under neon) -->
      <div ref="hangingRef" class="neon-lamp__hanging" :aria-live="normalizedStatus === 'closed' ? 'polite' : 'off'" aria-label="Status">
        <div ref="hangingPivotRef" class="neon-lamp__hanging-pivot">
          <span ref="hangingCableRef" class="neon-lamp__hanging-cable" aria-hidden="true"></span>
          <div ref="hangingPanelRef" class="neon-lamp__hanging-panel">
            <div class="neon-lamp__hanging-reflection" aria-hidden="true"></div>
            <span class="neon-lamp__hanging-label">{{ statusLabel }}</span>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import gsap from 'gsap'
import { siteSettingsApi } from '@/api/siteSettings'

const props = defineProps({
  siteName: { type: String, default: '' },
  placeStatus: { type: String, default: '' },
  fallbackName: { type: String, default: 'El Bialy PS' },
  embedded: { type: Boolean, default: true },
})

const rootRef = ref(null)
const innerRef = ref(null)
const tubesWrapRef = ref(null)
const hangingRef = ref(null)
const hangingPivotRef = ref(null)
const hangingPanelRef = ref(null)
const hangingCableRef = ref(null)
const loading = ref(true)
const prefersReducedMotion = ref(false)
const useTubesGSAP = ref(false)
const fetchedName = ref('')
const fetchedStatus = ref('')
const hasLoadedOnce = ref(false)
const isHovered = ref(false)
const pointerX = ref(0.5)
const pointerY = ref(0.5)
let rafId = null
let lastX = 0.5
let lastY = 0.5

function onPointerMove(e) {
  const rect = rootRef.value?.getBoundingClientRect()
  if (!rect) return
  const clientX = e.touches ? e.touches[0].clientX : e.clientX
  const clientY = e.touches ? e.touches[0].clientY : e.clientY
  lastX = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
  lastY = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height))
  if (rafId) return
  rafId = requestAnimationFrame(() => {
    pointerX.value = lastX
    pointerY.value = lastY
    rafId = null
  })
}

function resetPointer() {
  pointerX.value = 0.5
  pointerY.value = 0.5
}

const displayText = computed(() => {
  if (loading.value && !props.siteName) return '…'
  const name = (props.siteName || fetchedName.value || '').trim()
  return name || props.fallbackName
})

const normalizedStatus = computed(() => {
  const s = (props.placeStatus || fetchedStatus.value || 'open').toLowerCase()
  return s === 'closed' ? 'closed' : 'open'
})

const statusLabel = computed(() =>
  normalizedStatus.value === 'open' ? 'OPEN' : 'CLOSED'
)

const normalizedX = computed(() => (pointerX.value - 0.5) * 2)
const normalizedY = computed(() => (pointerY.value - 0.5) * 2)

const innerParallaxStyle = computed(() => {
  if (normalizedStatus.value !== 'open') return {}
  return {
    transform: `translate(${normalizedX.value * 6}px, ${normalizedY.value * 6}px)`,
  }
})

const tubesStyle = computed(() => {
  if (normalizedStatus.value !== 'open') return {}
  const rx = normalizedY.value * -4
  const ry = normalizedX.value * 6
  return {
    transform: `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`,
  }
})

const innerStyle = computed(() =>
  useTubesGSAP.value ? {} : innerParallaxStyle.value
)
const tubesWrapStyle = computed(() =>
  useTubesGSAP.value ? {} : tubesStyle.value
)

function particleStyle(n) {
  const x = (n * 19) % 100
  const delay = (n / 12) * -5
  return {
    '--p-x': `${x}%`,
    '--p-delay': `${delay}s`,
  }
}

let pendulumTween = null
let entranceTween = null
let floatTween = null
let tubesEntranceTween = null

function runTubesGSAP() {
  const inner = innerRef.value
  const tubesWrap = tubesWrapRef.value
  if (!inner || !tubesWrap || !rootRef.value) return

  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduced) return

  if (normalizedStatus.value !== 'open') return

  useTubesGSAP.value = true
  rootRef.value.classList.add('neon-lamp--tubes-gsap')

  // Entrance: tubes scale in with overshoot, inner drops into place
  gsap.set(tubesWrap, {
    scale: 0.82,
    opacity: 0,
    transformPerspective: 1000,
    rotationX: 0,
    rotationY: 0,
    y: 0,
  })
  gsap.set(inner, { x: 0, y: -24 })

  tubesEntranceTween = gsap.timeline({
    defaults: { ease: 'power2.out' },
    onComplete: startFloat,
  })
  tubesEntranceTween
    .to(tubesWrap, {
      scale: 1,
      opacity: 1,
      duration: 0.9,
      ease: 'back.out(1.3)',
    })
    .to(inner, { y: 0, duration: 0.55, ease: 'power2.out' }, '-=0.45')
}

function startFloat() {
  const inner = innerRef.value
  const tubesWrap = tubesWrapRef.value
  if (!inner || !tubesWrap || normalizedStatus.value !== 'open') return

  floatTween = gsap.timeline({ repeat: -1, repeatDelay: 0 })
  floatTween
    .to(tubesWrap, { y: -10, duration: 2.6, ease: 'sine.inOut' })
    .to(tubesWrap, { y: 0, duration: 2.6, ease: 'sine.inOut' })
}

function updateTubesParallax() {
  if (!useTubesGSAP.value || normalizedStatus.value !== 'open') return
  const inner = innerRef.value
  const tubesWrap = tubesWrapRef.value
  if (!inner || !tubesWrap) return
  const x = normalizedX.value * 8
  const y = normalizedY.value * 8
  const rx = normalizedY.value * -5
  const ry = normalizedX.value * 8
  gsap.set(inner, { x, y })
  gsap.set(tubesWrap, { rotationX: rx, rotationY: ry, transformPerspective: 1000 })
}

function killTubesGSAP() {
  if (tubesEntranceTween) {
    tubesEntranceTween.kill()
    tubesEntranceTween = null
  }
  if (floatTween) {
    floatTween.kill()
    floatTween = null
  }
  useTubesGSAP.value = false
  rootRef.value?.classList.remove('neon-lamp--tubes-gsap')
  const inner = innerRef.value
  const tubesWrap = tubesWrapRef.value
  if (inner) gsap.set(inner, { clearProps: 'transform' })
  if (tubesWrap) gsap.set(tubesWrap, { clearProps: 'transform' })
}

function runHangingGSAP() {
  const pivot = hangingPivotRef.value
  const panel = hangingPanelRef.value
  const cable = hangingCableRef.value
  const container = hangingRef.value
  if (!pivot || !panel || !cable || !container) return

  prefersReducedMotion.value =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (prefersReducedMotion.value) return

  container.classList.add('neon-lamp__hanging--gsap')

  // Entrance: bigger drop from above with stronger overshoot, cable stretches in
  gsap.set(pivot, { rotation: 0, y: -72, opacity: 0 })
  gsap.set(cable, { scaleY: 0.15, transformOrigin: 'top center' })
  gsap.set(panel, { opacity: 0, y: 8 })

  entranceTween = gsap.timeline({
    defaults: { ease: 'power2.out' },
    onComplete: startPendulum,
  })
  entranceTween
    .to(pivot, {
      y: 0,
      opacity: 1,
      duration: 0.85,
      ease: 'back.out(1.7)',
    })
    .to(
      cable,
      { scaleY: 1, duration: 0.5, ease: 'power2.inOut' },
      '-=0.4'
    )
    .to(panel, { opacity: 1, y: 0, duration: 0.35 }, '-=0.45')
}

function startPendulum() {
  const pivot = hangingPivotRef.value
  if (!pivot || prefersReducedMotion.value) return
  pendulumTween = gsap.timeline({ repeat: -1, repeatDelay: 0 })
  pendulumTween
    .to(pivot, {
      rotation: 16,
      duration: 2.2,
      ease: 'sine.inOut',
    })
    .to(pivot, {
      rotation: -16,
      duration: 2.2,
      ease: 'sine.inOut',
    })
    .to(pivot, {
      rotation: 0,
      duration: 1.2,
      ease: 'sine.inOut',
    })
}

function killHangingGSAP() {
  if (entranceTween) {
    entranceTween.kill()
    entranceTween = null
  }
  if (pendulumTween) {
    pendulumTween.kill()
    pendulumTween = null
  }
  const container = hangingRef.value
  if (container) container.classList.remove('neon-lamp__hanging--gsap')
}

watch(
  [() => normalizedStatus.value, () => hasLoadedOnce.value],
  () => {
    if (normalizedStatus.value !== 'open' || !hasLoadedOnce.value) {
      if (floatTween) {
        floatTween.kill()
        floatTween = null
      }
      if (useTubesGSAP.value && normalizedStatus.value !== 'open') {
        const inner = innerRef.value
        const tubesWrap = tubesWrapRef.value
        if (inner) gsap.set(inner, { x: 0, y: 0 })
        if (tubesWrap) gsap.set(tubesWrap, { rotationX: 0, rotationY: 0, y: 0 })
      }
      return
    }
    if (useTubesGSAP.value && tubesWrapRef.value && innerRef.value && !floatTween)
      startFloat()
    else if (!useTubesGSAP.value && innerRef.value && tubesWrapRef.value)
      nextTick().then(() => runTubesGSAP())
  },
  { immediate: true }
)

watch(
  () => [normalizedX.value, normalizedY.value],
  () => updateTubesParallax(),
  { immediate: true }
)

onMounted(async () => {
  if (props.siteName && props.placeStatus) {
    loading.value = false
    hasLoadedOnce.value = true
    await nextTick()
    runTubesGSAP()
    runHangingGSAP()
    return
  }
  const cached = await siteSettingsApi.getCachedStatic()
  if (cached?.site_name) fetchedName.value = cached.site_name
  try {
    const data = await siteSettingsApi.get()
    fetchedName.value = data?.site_name ?? ''
    fetchedStatus.value = data?.place_status ?? 'open'
  } catch {
    fetchedName.value = fetchedName.value || ''
    fetchedStatus.value = 'open'
  } finally {
    loading.value = false
    hasLoadedOnce.value = true
    await nextTick()
    runTubesGSAP()
    runHangingGSAP()
  }
})

onUnmounted(() => {
  if (rafId) cancelAnimationFrame(rafId)
  killTubesGSAP()
  killHangingGSAP()
})
</script>

<style scoped>
/* ==============================================
   NEON LAMP — Realistic 3D tubes, no container
   Inner + outer glow, diffusion, hanging status sign
   ============================================== */
.neon-lamp {
  --tube-cyan: #00f5ff;
  --tube-cyan-inner: rgba(220, 255, 255, 1);
  --tube-cyan-mid: rgba(0, 245, 255, 0.85);
  --tube-cyan-outer: rgba(0, 245, 255, 0.4);
  --ease: cubic-bezier(0.4, 0, 0.2, 1);

  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 0.5rem;
  overflow: hidden;
}

.neon-lamp:not(.neon-lamp--embedded) {
  
  padding: 24px 0.75rem;
}

/* ----- Standalone bg (no box) ----- */
.neon-lamp__bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.neon-lamp__gradient {
  position: absolute;
  inset: -25%;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.35;
}

.neon-lamp__gradient--1 {
  background: radial-gradient(circle, rgba(0, 245, 255, 0.2) 0%, transparent 55%);
  top: -20%;
  left: -15%;
}

.neon-lamp__gradient--2 {
  background: radial-gradient(circle, rgba(0, 245, 255, 0.12) 0%, transparent 50%);
  bottom: -25%;
  right: -10%;
}

.neon-lamp__particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.neon-lamp__particle {
  position: absolute;
  width: 2px;
  height: 2px;
  border-radius: 50%;
  left: var(--p-x, 50%);
  top: 25%;
  background: var(--tube-cyan);
  box-shadow: 0 0 8px var(--tube-cyan);
  opacity: 0.5;
  animation: lampParticle 14s ease-in-out infinite;
  animation-delay: var(--p-delay, 0s);
}

@keyframes lampParticle {
  0%, 100% { transform: translate(0, 0); opacity: 0.3; }
  50% { transform: translate(10px, -60px); opacity: 0.6; }
}

.neon-lamp__sleep {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(ellipse 80% 50% at 50% 50%, transparent 40%, rgba(0, 0, 0, 0.12) 100%);
}

/* ----- Inner: no background, no border, no box ----- */
.neon-lamp__inner {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: min(96vw, 1280px);
  margin: 0 auto;
  transition: transform 0.2s var(--ease);
  box-sizing: border-box;
}

.neon-lamp--embedded.neon-lamp--open .neon-lamp__inner {
  animation: lampFloat 6s ease-in-out infinite;
}

.neon-lamp--tubes-gsap.neon-lamp--embedded.neon-lamp--open .neon-lamp__inner {
  animation: none;
}

@keyframes lampFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

/* ----- Tubes wrap: only light, no container ----- */
.neon-lamp__tubes-wrap {
  position: relative;
  display: inline-block;
  transform-style: preserve-3d;
  will-change: transform;
}

/* ----- Hyper-realistic 3D: many layers, reduced glow for readability ----- */

/* Ambient spill: very subtle so letters stay crisp */
.neon-lamp__diffusion {
  position: absolute;
  inset: -45%;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.neon-lamp__diffusion-text {
  font-family: 'Outfit', var(--font-sans, sans-serif);
  font-size: clamp(1.6rem, 6.5vw, 2.5rem);
  font-weight: 800;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--tube-cyan);
  white-space: nowrap;
  filter: blur(32px);
  opacity: 0.22;
}

.neon-lamp--closed .neon-lamp__diffusion-text {
  opacity: 0.06;
  color: rgba(120, 160, 180, 0.35);
}

/* Depth 1: far back (tube thickness, soft) */
.neon-lamp__tubes-back {
  position: absolute;
  left: 0;
  top: 0;
  font-family: 'Outfit', var(--font-sans, sans-serif);
  font-size: clamp(1.6rem, 6.5vw, 2.5rem);
  font-weight: 800;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: transparent;
  white-space: nowrap;
  pointer-events: none;
  transform: translate(3px, 4px);
  z-index: 0;
  text-shadow:
    0 0 6px rgba(0, 200, 220, 0.35),
    0 0 14px rgba(0, 245, 255, 0.15),
    0 0 28px rgba(0, 245, 255, 0.08);
  filter: blur(1.5px);
  opacity: 0.65;
}

.neon-lamp--closed .neon-lamp__tubes-back {
  opacity: 0.15;
}

/* Depth 2: mid (tube body glow behind face) */
.neon-lamp__tubes-mid {
  position: absolute;
  left: 0;
  top: 0;
  font-family: 'Outfit', var(--font-sans, sans-serif);
  font-size: clamp(1.6rem, 6.5vw, 2.5rem);
  font-weight: 800;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: transparent;
  white-space: nowrap;
  pointer-events: none;
  transform: translate(1px, 2px);
  z-index: 0.5;
  text-shadow:
    0 0 2px rgba(0, 245, 255, 0.4),
    0 0 6px rgba(0, 245, 255, 0.25),
    0 0 12px rgba(0, 245, 255, 0.12);
  filter: blur(0.5px);
  opacity: 0.85;
}

.neon-lamp--closed .neon-lamp__tubes-mid {
  opacity: 0.2;
}

/* Tube edge: crisp 1px so letter contours stay readable */
.neon-lamp__tubes-edge {
  position: absolute;
  left: 0;
  top: 0;
  font-family: 'Outfit', var(--font-sans, sans-serif);
  font-size: clamp(1.6rem, 6.5vw, 2.5rem);
  font-weight: 800;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: transparent;
  white-space: nowrap;
  pointer-events: none;
  z-index: 0.9;
  text-shadow:
    0 0 1px rgba(255, 255, 255, 0.9),
    0 0 2px var(--tube-cyan);
  opacity: 0.9;
}

.neon-lamp--closed .neon-lamp__tubes-edge {
  opacity: 0.4;
  text-shadow: 0 0 1px rgba(180, 220, 230, 0.4);
}

/* Main tube face: bright core, reduced outer glow for readability */
.neon-lamp__tubes {
  position: relative;
  display: inline-block;
  z-index: 1;
  font-family: 'Outfit', var(--font-sans, sans-serif);
  font-size: clamp(1.6rem, 6.5vw, 2.5rem);
  font-weight: 800;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--tube-cyan-inner);
  /* Tight inner glow so letters stay sharp; outer layers subtle */
  text-shadow:
    0 0 1px #fff,
    0 0 2px rgba(255, 255, 255, 0.95),
    0 0 3px var(--tube-cyan-inner),
    0 0 4px var(--tube-cyan),
    0 0 6px rgba(0, 245, 255, 0.7),
    0 0 10px rgba(0, 245, 255, 0.4),
    0 0 16px rgba(0, 245, 255, 0.22),
    0 0 24px rgba(0, 245, 255, 0.12),
    0 0 36px rgba(0, 245, 255, 0.07),
    0 0 52px rgba(0, 245, 255, 0.04),
    /* Depth: layered offset for tube roundness */
    0 1px 1px rgba(0, 0, 0, 0.2),
    0 2px 3px rgba(0, 0, 0, 0.1),
    0 3px 6px rgba(0, 245, 255, 0.05);
  filter: drop-shadow(0 0 2px rgba(0, 245, 255, 0.4)) drop-shadow(0 1px 2px rgba(0, 0, 0, 0.25));
  transition: color 0.5s var(--ease), text-shadow 0.5s var(--ease), filter 0.5s var(--ease);
}

/* Specular: tiny highlight for glass tube */
.neon-lamp__tubes-specular {
  position: absolute;
  left: 0;
  top: 0;
  font-family: 'Outfit', var(--font-sans, sans-serif);
  font-size: clamp(1.6rem, 6.5vw, 2.5rem);
  font-weight: 800;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: transparent;
  white-space: nowrap;
  pointer-events: none;
  z-index: 1.1;
  text-shadow: 0 -1px 0 rgba(255, 255, 255, 0.15);
  opacity: 0.8;
}

.neon-lamp--closed .neon-lamp__tubes-specular {
  opacity: 0.2;
}

/* OPEN: lamp re-lights every 4s + gentle pulsation */
.neon-lamp--open .neon-lamp__tubes {
  animation: lampPulse 5s ease-in-out infinite;
}

.neon-lamp--open.neon-lamp--loaded .neon-lamp__tubes {
  animation: lampLoop4s 4s ease-in-out infinite, lampPulse 5s ease-in-out infinite;
}

/* Every 4s: dim → flicker on → hold full */
@keyframes lampLoop4s {
  0% {
    opacity: 0.12;
    filter: drop-shadow(0 0 2px rgba(0, 245, 255, 0.25));
  }
  3% {
    opacity: 0.6;
    filter: drop-shadow(0 0 10px rgba(0, 245, 255, 0.6));
  }
  6% {
    opacity: 0.25;
    filter: drop-shadow(0 0 4px rgba(0, 245, 255, 0.35));
  }
  10% {
    opacity: 0.85;
    filter: drop-shadow(0 0 12px rgba(0, 245, 255, 0.65));
  }
  14% {
    opacity: 0.4;
    filter: drop-shadow(0 0 5px rgba(0, 245, 255, 0.4));
  }
  20% {
    opacity: 1;
    filter: drop-shadow(0 0 6px rgba(0, 245, 255, 0.5));
  }
  100% {
    opacity: 1;
    filter: drop-shadow(0 0 6px rgba(0, 245, 255, 0.5));
  }
}

@keyframes lampPulse {
  0%, 100% {
    text-shadow:
      0 0 1px #fff,
      0 0 2px rgba(255, 255, 255, 0.95),
      0 0 3px var(--tube-cyan-inner),
      0 0 4px var(--tube-cyan),
      0 0 6px rgba(0, 245, 255, 0.7),
      0 0 10px rgba(0, 245, 255, 0.4),
      0 0 16px rgba(0, 245, 255, 0.22),
      0 0 24px rgba(0, 245, 255, 0.12),
      0 0 36px rgba(0, 245, 255, 0.07),
      0 0 52px rgba(0, 245, 255, 0.04),
      0 1px 1px rgba(0, 0, 0, 0.2),
      0 2px 3px rgba(0, 0, 0, 0.1),
      0 3px 6px rgba(0, 245, 255, 0.05);
  }
  50% {
    text-shadow:
      0 0 1px #fff,
      0 0 2px #fff,
      0 0 4px var(--tube-cyan-inner),
      0 0 5px var(--tube-cyan),
      0 0 8px rgba(0, 245, 255, 0.75),
      0 0 12px rgba(0, 245, 255, 0.45),
      0 0 20px rgba(0, 245, 255, 0.25),
      0 0 30px rgba(0, 245, 255, 0.14),
      0 0 42px rgba(0, 245, 255, 0.08),
      0 0 58px rgba(0, 245, 255, 0.05),
      0 1px 1px rgba(0, 0, 0, 0.2),
      0 2px 3px rgba(0, 0, 0, 0.1),
      0 3px 6px rgba(0, 245, 255, 0.06);
  }
}

/* CLOSED: dim, cold, optional micro flicker */
.neon-lamp--closed .neon-lamp__tubes {
  color: rgba(140, 180, 200, 0.5);
  text-shadow:
    0 0 2px rgba(180, 220, 230, 0.3),
    0 0 8px rgba(0, 245, 255, 0.06),
    0 0 20px rgba(0, 245, 255, 0.03);
  filter: saturate(0.5) brightness(0.75);
  animation: lampSleepFlicker 6s ease-in-out infinite;
}

@keyframes lampSleepFlicker {
  0%, 92%, 100% { opacity: 0.6; }
  94% { opacity: 0.45; }
  97% { opacity: 0.55; }
}

.neon-lamp--hover.neon-lamp--open .neon-lamp__tubes {
  filter: drop-shadow(0 0 12px rgba(0, 245, 255, 0.6));
}

/* Reflection: light only */
.neon-lamp__reflection {
  position: absolute;
  left: 50%;
  bottom: -8px;
  width: 80%;
  height: 14px;
  transform: translateX(-50%);
  background: linear-gradient(180deg, rgba(0, 245, 255, 0.18) 0%, transparent 100%);
  border-radius: 50%;
  filter: blur(6px);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.5s var(--ease);
}

.neon-lamp--open.neon-lamp--hover .neon-lamp__reflection {
  opacity: 1;
}

/* ----- Hanging status sign: mint accent (matches hero, distinct from main neon), enhanced ----- */
.neon-lamp__hanging {
  --hang-accent: rgb(160, 255, 235);
  --hang-accent-rgb: 160, 255, 235;
  --hang-glass: rgba(255, 255, 255, 0.05);
  --hang-border: rgba(var(--hang-accent-rgb), 0.45);
  --hang-highlight: rgba(255, 255, 255, 0.2);
  --ease-pendulum: cubic-bezier(0.32, 0, 0.2, 1);

  display: flex;
  justify-content: center;
  margin-top: 0.6rem;
  perspective: 700px;
}

.neon-lamp__hanging-pivot {
  transform-origin: 50% 0;
  animation: lampHangingPendulum 5.5s var(--ease-pendulum) infinite;
}

/* GSAP drives entrance + pendulum; disable CSS pendulum when active */
.neon-lamp__hanging--gsap .neon-lamp__hanging-pivot {
  animation: none;
}

.neon-lamp__hanging-cable {
  display: block;
  width: 1.5px;
  height: 22px;
  margin: 0 auto 0;
  background: linear-gradient(180deg, rgba(200, 230, 225, 0.95) 0%, rgba(140, 180, 175, 0.9) 50%, rgba(90, 120, 118, 0.95) 100%);
  border-radius: 1px;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1), 0 0 10px rgba(var(--hang-accent-rgb), 0.12);
}

.neon-lamp__hanging-panel {
  position: relative;
  margin-top: -1px;
  padding: 0.4em 1em 0.5em;
  background: linear-gradient(165deg, rgba(255, 255, 255, 0.08) 0%, var(--hang-glass) 50%, rgba(0, 0, 0, 0.06) 100%);
  border: 1px solid var(--hang-border);
  border-radius: 10px 10px 12px 12px;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  clip-path: polygon(0% 0%, 100% 0%, 100% 80%, 97% 90%, 50% 100%, 3% 90%, 0% 80%);
  box-shadow:
    0 6px 20px rgba(0, 0, 0, 0.35),
    0 2px 8px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 var(--hang-highlight),
    inset 0 -1px 0 rgba(0, 0, 0, 0.15),
    inset 0 0 20px rgba(var(--hang-accent-rgb), 0.03);
  transform: translateZ(0) rotateX(2.5deg);
  overflow: hidden;
}

/* Enhanced: dual-layer reflection — bright band + accent tint */
.neon-lamp__hanging-reflection {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  height: 58%;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.22) 0%,
    rgba(255, 255, 255, 0.1) 20%,
    rgba(var(--hang-accent-rgb), 0.15) 40%,
    rgba(var(--hang-accent-rgb), 0.05) 65%,
    transparent 100%
  );
  border-radius: 10px 10px 0 0;
  pointer-events: none;
}

/* Soft light spill under panel (cinematic shadow + glow) */
.neon-lamp__hanging-panel::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: -8px;
  width: 80%;
  height: 12px;
  transform: translateX(-50%);
  background: radial-gradient(ellipse 80% 100% at 50% 0%, rgba(var(--hang-accent-rgb), 0.2) 0%, transparent 70%);
  pointer-events: none;
  filter: blur(4px);
}

.neon-lamp__hanging-label {
  position: relative;
  z-index: 1;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  font-variant-numeric: tabular-nums;
  display: block;
  text-align: center;
  transition: color 0.4s var(--ease), text-shadow 0.4s var(--ease);
}

/* OPEN: mint neon — layered glow + breathe */
.neon-lamp--open .neon-lamp__hanging-label {
  color: var(--hang-accent);
  text-shadow:
    0 0 1px #fff,
    0 0 2px rgba(255, 255, 255, 0.9),
    0 0 4px rgba(var(--hang-accent-rgb), 0.95),
    0 0 8px rgba(var(--hang-accent-rgb), 0.85),
    0 0 14px rgba(var(--hang-accent-rgb), 0.6),
    0 0 24px rgba(var(--hang-accent-rgb), 0.4),
    0 0 36px rgba(var(--hang-accent-rgb), 0.25),
    0 0 52px rgba(var(--hang-accent-rgb), 0.12),
    0 1px 2px rgba(0, 0, 0, 0.2);
  animation: hangGlowBreathe 4s ease-in-out infinite;
}

.neon-lamp--open .neon-lamp__hanging-panel {
  --hang-border: rgba(var(--hang-accent-rgb), 0.55);
  box-shadow:
    0 6px 20px rgba(0, 0, 0, 0.35),
    0 2px 8px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(0, 0, 0, 0.1),
    0 0 24px rgba(var(--hang-accent-rgb), 0.25),
    0 0 48px rgba(var(--hang-accent-rgb), 0.12),
    inset 0 1px 0 var(--hang-highlight),
    inset 0 -1px 0 rgba(0, 0, 0, 0.15),
    inset 0 0 24px rgba(var(--hang-accent-rgb), 0.04);
  animation: hangPanelShimmer 6s ease-in-out infinite;
}

/* CLOSED: dimmed mint (cool standby) */
.neon-lamp--closed .neon-lamp__hanging-label {
  color: rgba(140, 200, 190, 0.6);
  text-shadow:
    0 0 4px rgba(var(--hang-accent-rgb), 0.25),
    0 0 12px rgba(var(--hang-accent-rgb), 0.1),
    0 1px 2px rgba(0, 0, 0, 0.35);
}

.neon-lamp--closed .neon-lamp__hanging-panel {
  --hang-glass: rgba(255, 255, 255, 0.02);
  --hang-border: rgba(var(--hang-accent-rgb), 0.22);
  --hang-highlight: rgba(255, 255, 255, 0.05);
}

.neon-lamp--closed .neon-lamp__hanging-panel::after {
  opacity: 0.3;
}

/* More motion: wider, smoother pendulum swing */
@keyframes lampHangingPendulum {
  0% { transform: rotate(-7deg); }
  24% { transform: rotate(0deg); }
  50% { transform: rotate(7deg); }
  76% { transform: rotate(0deg); }
  100% { transform: rotate(-7deg); }
}

@keyframes hangGlowBreathe {
  0%, 100% {
    filter: brightness(1) drop-shadow(0 0 10px rgba(var(--hang-accent-rgb), 0.45));
  }
  50% {
    filter: brightness(1.06) drop-shadow(0 0 18px rgba(var(--hang-accent-rgb), 0.55));
  }
}

@keyframes hangPanelShimmer {
  0%, 100% {
    box-shadow:
      0 6px 20px rgba(0, 0, 0, 0.35),
      0 2px 8px rgba(0, 0, 0, 0.2),
      0 0 0 1px rgba(0, 0, 0, 0.1),
      0 0 24px rgba(var(--hang-accent-rgb), 0.25),
      0 0 48px rgba(var(--hang-accent-rgb), 0.12),
      inset 0 1px 0 var(--hang-highlight),
      inset 0 -1px 0 rgba(0, 0, 0, 0.15),
      inset 0 0 24px rgba(var(--hang-accent-rgb), 0.04);
  }
  50% {
    box-shadow:
      0 6px 22px rgba(0, 0, 0, 0.32),
      0 2px 10px rgba(0, 0, 0, 0.18),
      0 0 0 1px rgba(0, 0, 0, 0.1),
      0 0 32px rgba(var(--hang-accent-rgb), 0.32),
      0 0 60px rgba(var(--hang-accent-rgb), 0.15),
      inset 0 1px 0 var(--hang-highlight),
      inset 0 -1px 0 rgba(0, 0, 0, 0.15),
      inset 0 0 28px rgba(var(--hang-accent-rgb), 0.06);
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .neon-lamp__particle,
  .neon-lamp__tubes,
  .neon-lamp__hanging-pivot,
  .neon-lamp__hanging-label,
  .neon-lamp__hanging-panel,
  .neon-lamp__inner {
    animation: none !important;
  }

  .neon-lamp--open .neon-lamp__tubes {
    opacity: 1;
  }

  .neon-lamp--closed .neon-lamp__tubes {
    opacity: 0.6;
  }

  .neon-lamp__inner {
    transition: none;
  }

  .neon-lamp__tubes-wrap {
    transition: none;
  }
}
</style>
