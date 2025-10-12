<template>
  <nav class="dashboard-navbar">
    <div class="navbar-container">
      <!-- Logo -->
      <div class="navbar-logo">
        <svg class="logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
          <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
          <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
        </svg>
        <span class="logo-text">Dashboard</span>
      </div>

      <!-- Right side controls -->
      <div class="navbar-controls">
        <!-- Menu Button -->
        <button 
          class="navbar-btn menu-btn"
          @click="$emit('toggle-menu')"
          :aria-label="menuOpen ? 'Close menu' : 'Open menu'"
        >
          <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>

        <!-- Notification Button -->
        <button 
          class="navbar-btn notification-btn"
          @click="$emit('toggle-notifications')"
          aria-label="Notifications"
        >
          <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
.dashboard-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: rgba(15, 15, 23, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 1000;
  display: flex;
  align-items: center;
}

.navbar-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0 24px;
}

.navbar-logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 32px;
  height: 32px;
  color: rgba(139, 92, 246, 1);
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
  letter-spacing: -0.025em;
}

.navbar-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.navbar-btn {
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  position: relative;
}

.navbar-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
  transform: translateY(-1px);
}

.navbar-btn:active {
  transform: translateY(0);
}

.icon {
  width: 20px;
  height: 20px;
}

.notification-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  background: rgba(239, 68, 68, 1);
  color: white;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

@media (max-width: 768px) {
  .navbar-container {
    padding: 0 16px;
  }
  
  .logo-text {
    font-size: 18px;
  }
  
  .navbar-controls {
    gap: 12px;
  }
}
</style>