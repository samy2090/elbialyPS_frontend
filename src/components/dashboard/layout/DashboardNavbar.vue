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
        <span class="logo-text">Dashboard</span>
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

defineEmits(['toggle-menu', 'toggle-notifications'])
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

.logo-text {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--nav-text);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.03);
  font-variation-settings: "wght" 700;
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

  .logo-text {
    font-size: 1.1rem;
    letter-spacing: 0.03em;
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