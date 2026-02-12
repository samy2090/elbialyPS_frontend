<template>
  <nav class="dashboard-navbar">
    <div class="navbar-glow-line" aria-hidden="true"></div>
    <div class="navbar-container">
      <!-- Logo -->
      <div class="navbar-logo">
        <div class="logo-icon-wrap">
          <svg class="logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
          </svg>
        </div>

        <!-- Place status toggle (open/close) -->
        <button
          type="button"
          class="place-status-btn"
          :class="[
            placeStatus === 'open' ? 'place-status-open' : 'place-status-closed',
            { 'place-status-loading': placeStatusLoading }
          ]"
          :disabled="placeStatusLoading || placeStatus === null"
          :aria-label="placeStatus === 'open' ? 'Place is open – click to close' : 'Place is closed – click to open'"
          @click="togglePlaceStatus"
        >
          <span class="place-status-glow" aria-hidden="true"></span>
          <span v-if="placeStatusLoading" class="place-status-spinner" aria-hidden="true"></span>
          <template v-else>
            <svg class="place-status-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <template v-if="placeStatus === 'open'">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M8 12L11 15L16 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </template>
              <template v-else-if="placeStatus === 'closed'">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M15 9L9 15M9 9L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </template>
            </svg>
            <span class="place-status-label">{{ placeStatus === 'open' ? 'Open' : (placeStatus === 'closed' ? 'Closed' : '…') }}</span>
          </template>
        </button>
      </div>

      <!-- Right side controls -->
      <div class="navbar-controls">
        <button
          class="navbar-btn menu-btn"
          @click="$emit('toggle-menu')"
          :aria-label="menuOpen ? 'Close menu' : 'Open menu'"
        >
          <svg class="navbar-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>

        <button
          class="navbar-btn notification-btn"
          @click="$emit('toggle-notifications')"
          aria-label="Notifications"
        >
          <svg class="navbar-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M18 8A6 6 0 0 0 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M13.73 21A2 2 0 0 1 10.27 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span v-if="notificationCount > 0" class="notification-badge">{{ notificationCount }}</span>
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { siteSettingsApi } from '@/api/siteSettings'

defineProps({
  menuOpen: {
    type: Boolean,
    default: false
  },
  notificationCount: {
    type: Number,
    default: 0
  }
})

defineEmits(['toggle-menu', 'toggle-notifications', 'place-status-changed'])

const placeStatus = ref(null) // 'open' | 'closed'
const placeStatusLoading = ref(false)

async function loadPlaceStatus() {
  placeStatusLoading.value = true
  try {
    const data = await siteSettingsApi.get()
    placeStatus.value = (data?.place_status ?? 'open').toLowerCase()
  } catch {
    placeStatus.value = 'open'
  } finally {
    placeStatusLoading.value = false
  }
}

async function togglePlaceStatus() {
  if (placeStatusLoading.value || placeStatus.value == null) return
  const next = placeStatus.value === 'open' ? 'closed' : 'open'
  placeStatusLoading.value = true
  try {
    await siteSettingsApi.update({ place_status: next })
    placeStatus.value = next
  } catch {
    // keep current state on error
  } finally {
    placeStatusLoading.value = false
  }
}

onMounted(loadPlaceStatus)
</script>

<style scoped>
/* Futuristic navbar: glass, glow accents, sharp typography */
.dashboard-navbar {
  --nav-accent: #8b5cf6;
  --nav-accent-dim: rgba(139, 92, 246, 0.4);
  --nav-cyan: #22d3ee;
  --nav-bg: rgba(10, 10, 18, 0.92);
  --nav-border: rgba(139, 92, 246, 0.15);
  --nav-text: rgba(255, 255, 255, 0.92);
  --nav-text-muted: rgba(255, 255, 255, 0.6);

  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 72px;
  background: var(--nav-bg);
  backdrop-filter: blur(24px) saturate(1.2);
  -webkit-backdrop-filter: blur(24px) saturate(1.2);
  border-bottom: 1px solid var(--nav-border);
  z-index: 1000;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
}

.navbar-glow-line {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--nav-accent-dim) 15%,
    var(--nav-accent) 50%,
    var(--nav-cyan) 85%,
    transparent 100%
  );
  opacity: 0.9;
  pointer-events: none;
}

.navbar-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0 28px;
  position: relative;
  z-index: 1;
}

.navbar-logo {
  display: flex;
  align-items: center;
  gap: 14px;
}

.logo-icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(145deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.05));
  border: 1px solid var(--nav-accent-dim);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.06);
  transition: box-shadow 0.3s ease, border-color 0.3s ease;
}

.navbar-logo:hover .logo-icon-wrap {
  box-shadow: 0 0 28px rgba(139, 92, 246, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.08);
  border-color: var(--nav-accent);
}

.logo-icon {
  width: 22px;
  height: 22px;
  color: var(--nav-accent);
  filter: drop-shadow(0 0 6px rgba(139, 92, 246, 0.5));
}

/* Place status toggle – futuristic pill */
.place-status-btn {
  --status-open: #10b981;
  --status-open-glow: rgba(16, 185, 129, 0.5);
  --status-closed: #ef4444;
  --status-closed-glow: rgba(239, 68, 68, 0.5);

  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 44px;
  padding: 0 18px;
  border: none;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  overflow: hidden;
  transition: box-shadow 0.3s ease, border-color 0.3s ease, transform 0.2s ease;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
}
.place-status-btn:disabled {
  cursor: not-allowed;
  opacity: 0.85;
}
.place-status-btn:not(:disabled):hover {
  transform: translateY(-1px);
}
.place-status-btn:not(:disabled):active {
  transform: translateY(0);
}

.place-status-glow {
  position: absolute;
  inset: -1px;
  border-radius: 13px;
  opacity: 0.35;
  pointer-events: none;
}
.place-status-open .place-status-glow {
  background: radial-gradient(ellipse 80% 50% at 50% 50%, var(--status-open-glow), transparent 70%);
  box-shadow: 0 0 24px var(--status-open-glow);
}
.place-status-closed .place-status-glow {
  background: radial-gradient(ellipse 80% 50% at 50% 50%, var(--status-closed-glow), transparent 70%);
  box-shadow: 0 0 24px var(--status-closed-glow);
}

.place-status-open {
  background: linear-gradient(145deg, rgba(16, 185, 129, 0.25), rgba(16, 185, 129, 0.08));
  border: 1px solid rgba(16, 185, 129, 0.45);
  color: #6ee7b7;
}
.place-status-open:hover:not(:disabled) {
  box-shadow: 0 0 28px rgba(16, 185, 129, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.place-status-closed {
  background: linear-gradient(145deg, rgba(239, 68, 68, 0.25), rgba(239, 68, 68, 0.08));
  border: 1px solid rgba(239, 68, 68, 0.45);
  color: #fca5a5;
}
.place-status-closed:hover:not(:disabled) {
  box-shadow: 0 0 28px rgba(239, 68, 68, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.place-status-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  stroke: currentColor;
}
.place-status-label {
  position: relative;
  z-index: 1;
  text-shadow: 0 0 12px currentColor;
}
.place-status-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: place-status-spin 0.6s linear infinite;
}
@keyframes place-status-spin {
  to { transform: rotate(360deg); }
}

.navbar-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.navbar-btn {
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02));
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--nav-text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease, transform 0.2s ease;
  position: relative;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.navbar-btn:hover {
  color: var(--nav-text);
  border-color: var(--nav-accent-dim);
  box-shadow:
    0 0 20px rgba(139, 92, 246, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
  transform: translateY(-1px);
}

.navbar-btn:active {
  transform: translateY(0);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.2);
}

.navbar-icon {
  width: 20px;
  height: 20px;
  min-width: 20px;
  min-height: 20px;
  flex-shrink: 0;
  display: block;
  color: inherit;
  stroke: currentColor;
}

.notification-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 5px;
  border-radius: 6px;
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  box-shadow: 0 0 12px rgba(239, 68, 68, 0.5), 0 1px 0 rgba(255, 255, 255, 0.2) inset;
  border: 1px solid rgba(255, 255, 255, 0.15);
  letter-spacing: 0.02em;
}

@media (max-width: 768px) {
  .dashboard-navbar {
    height: 64px;
  }

  .navbar-container {
    padding: 0 16px;
  }

  .logo-icon-wrap {
    width: 36px;
    height: 36px;
  }

  .logo-icon {
    width: 18px;
    height: 18px;
  }

  .place-status-btn {
    height: 40px;
    padding: 0 14px;
    font-size: 0.8rem;
  }
  .place-status-icon {
    width: 16px;
    height: 16px;
  }

  .navbar-controls {
    gap: 10px;
  }

  .navbar-btn {
    width: 40px;
    height: 40px;
  }
}
</style>