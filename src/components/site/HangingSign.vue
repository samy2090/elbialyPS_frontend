<template>
  <div
    class="hanging-sign"
    :class="[`hanging-sign--${normalizedStatus}`]"
    aria-live="polite"
    aria-label="Status"
  >
    <div class="hanging-sign__pivot">
      <!-- Thin cables: refined, subtle -->
      <div class="hanging-sign__cables">
        <span class="hanging-sign__cable hanging-sign__cable--left"></span>
        <span class="hanging-sign__cable hanging-sign__cable--center"></span>
        <span class="hanging-sign__cable hanging-sign__cable--right"></span>
      </div>
      <!-- Glass panel: OPEN / CLOSED -->
      <div class="hanging-sign__panel">
        <div class="hanging-sign__reflection hanging-sign__reflection--top" aria-hidden="true"></div>
        <div class="hanging-sign__reflection hanging-sign__reflection--edge" aria-hidden="true"></div>
        <div class="hanging-sign__panel-inner">
          <span class="hanging-sign__label">{{ statusLabel }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { siteSettingsApi } from '@/api/siteSettings'

const props = defineProps({
  status: { type: String, default: '' },
})

const fetchedStatus = ref('')

const normalizedStatus = computed(() => {
  const s = (props.status || fetchedStatus.value || 'open').toLowerCase()
  return s === 'closed' ? 'closed' : 'open'
})

const statusLabel = computed(() =>
  normalizedStatus.value === 'open' ? 'OPEN' : 'CLOSED'
)

onMounted(async () => {
  if (props.status) return
  try {
    const data = await siteSettingsApi.get()
    fetchedStatus.value = data?.place_status ?? ''
  } catch {
    fetchedStatus.value = 'open'
  }
})
</script>

<style scoped>
.hanging-sign {
  --glass-bg: rgba(255, 255, 255, 0.06);
  --glass-border: rgba(255, 255, 255, 0.18);
  --glass-highlight: rgba(255, 255, 255, 0.2);
  --ease-natural: cubic-bezier(0.37, 0, 0.21, 1);

  display: flex;
  justify-content: center;
  padding: 0.5rem 0 1.25rem;
  perspective: 900px;
}

/* Pivot: smooth, physically natural swing — not cartoonish */
.hanging-sign__pivot {
  transform-origin: 50% 0;
  animation: pendulum 8.5s var(--ease-natural) infinite;
}

/* Cables: thin, metallic but understated */
.hanging-sign__cables {
  position: relative;
  display: flex;
  justify-content: center;
  gap: clamp(20px, 6vw, 40px);
  height: 24px;
  margin-bottom: -1px;
}

.hanging-sign__cable {
  width: 1.5px;
  height: 100%;
  background: linear-gradient(180deg, rgba(180, 190, 200, 0.9) 0%, rgba(100, 112, 128, 0.85) 50%, rgba(60, 70, 85, 0.9) 100%);
  border-radius: 1px;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.08);
}

/* Panel: glossy glass with soft reflections and depth */
.hanging-sign__panel {
  position: relative;
  padding: 0.5em 1.25em 0.7em;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 10px 10px 12px 12px;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  /* Flowing shape: non-rectangular */
  clip-path: polygon(
    0% 0%,
    100% 0%,
    100% 80%,
    97% 90%,
    90% 96%,
    50% 100%,
    10% 96%,
    3% 90%,
    0% 80%
  );
  /* Cinematic depth: soft multi-layer shadows */
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.2),
    0 10px 20px -4px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 var(--glass-highlight);
  transform: translateZ(0) rotateX(1.5deg);
  transform-style: preserve-3d;
  overflow: hidden;
}

/* Soft reflection: top highlight (glass catch light) */
.hanging-sign__reflection--top {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  height: 45%;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.12) 0%,
    rgba(255, 255, 255, 0.04) 40%,
    transparent 100%
  );
  border-radius: 10px 10px 0 0;
  pointer-events: none;
}

/* Edge reflection */
.hanging-sign__reflection--edge {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.03);
  pointer-events: none;
}

.hanging-sign__panel-inner {
  position: relative;
  z-index: 1;
}

.hanging-sign__label {
  font-family: 'Outfit', var(--font-sans, sans-serif);
  font-size: clamp(0.75rem, 2vw, 0.95rem);
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  text-align: center;
  display: block;
  white-space: nowrap;
  transition: color 0.4s ease, text-shadow 0.4s ease;
}

/* OPEN: subtle glow, premium feel */
.hanging-sign--open .hanging-sign__label {
  color: rgba(220, 252, 255, 0.98);
  text-shadow:
    0 0 12px rgba(0, 245, 255, 0.25),
    0 0 24px rgba(0, 245, 255, 0.12),
    0 1px 2px rgba(0, 0, 0, 0.2);
}

.hanging-sign--open .hanging-sign__panel {
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.2),
    0 10px 20px -4px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(0, 0, 0, 0.05),
    0 0 24px rgba(0, 245, 255, 0.08),
    inset 0 1px 0 var(--glass-highlight);
}

/* CLOSED: muted, soft */
.hanging-sign--closed .hanging-sign__label {
  color: rgba(180, 195, 210, 0.85);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
}

.hanging-sign--closed .hanging-sign__panel {
  --glass-bg: rgba(255, 255, 255, 0.04);
  --glass-border: rgba(255, 255, 255, 0.1);
  --glass-highlight: rgba(255, 255, 255, 0.08);
}

/* Pendulum: elegant, natural weight — slow at extremes */
@keyframes pendulum {
  0% {
    transform: rotate(-2.8deg);
  }
  26% {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(2.8deg);
  }
  74% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(-2.8deg);
  }
}
</style>
