<template>
  <nav class="mobile-bottom-nav" :class="{ 'hidden': !visible }">
    <div class="nav-container">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="$emit('tab-selected', tab.id)"
        :class="['nav-tab', { active: activeTab === tab.id }]"
        :aria-label="tab.label"
      >
        <div class="tab-icon">
          <component :is="tab.icon" />
        </div>
        <span class="tab-label">{{ tab.label }}</span>
        <div v-if="activeTab === tab.id" class="active-indicator"></div>
      </button>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'

// Icon components as inline SVGs
const HomeIcon = {
  template: `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M9 22V12H15V22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `
}

const ExploreIcon = {
  template: `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
      <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88 16.24,7.76" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `
}

const UsersIcon = {
  template: `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
      <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `
}

const ProductsIcon = {
  template: `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 7L12 3L4 7M20 7L12 11M20 7V17L12 21M12 11V21M4 7V17L12 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `
}



const SessionsIcon = {
  template: `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" stroke-width="2"/>
      <path d="M3 10H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M7 4V8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M17 4V8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <circle cx="9" cy="14" r="1" fill="currentColor"/>
      <circle cx="15" cy="14" r="1" fill="currentColor"/>
      <path d="M12 14V18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `
}

defineProps({
  activeTab: {
    type: String,
    default: 'home'
  },
  visible: {
    type: Boolean,
    default: true
  }
})

const tabs = computed(() => [
  { id: 'home', label: 'Home', icon: HomeIcon },
  { id: 'sessions', label: 'Sessions', icon: SessionsIcon },
  { id: 'explore', label: 'Explore', icon: ExploreIcon },
  { id: 'users', label: 'Users', icon: UsersIcon },
  { id: 'products', label: 'Products', icon: ProductsIcon },
])

defineEmits(['tab-selected'])
</script>

<style scoped>
.mobile-bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(15, 15, 23, 0.95);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.5rem;
  transition: transform 0.3s ease;
}

.mobile-bottom-nav.hidden {
  transform: translateY(100%);
}

.nav-container {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.25rem;
  max-width: 100%;
  margin: 0 auto;
}

.nav-tab {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.75rem 0.5rem;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 16px;
  min-height: 4rem;
}

.nav-tab:hover {
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.8);
  transform: translateY(-2px);
}

.nav-tab.active {
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.1);
  border: 1px solid rgba(139, 92, 246, 0.2);
}

.tab-icon {
  width: 1.5rem;
  height: 1.5rem;
  margin-bottom: 0.25rem;
  transition: all 0.3s ease;
}

.nav-tab.active .tab-icon {
  transform: scale(1.1);
  filter: drop-shadow(0 0 8px rgba(139, 92, 246, 0.4));
}

.tab-label {
  font-size: 0.75rem;
  font-weight: 500;
  text-align: center;
  line-height: 1;
}

.active-indicator {
  position: absolute;
  top: 0.5rem;
  left: 50%;
  transform: translateX(-50%);
  width: 3px;
  height: 3px;
  background: linear-gradient(135deg, #8b5cf6, #06b6d4);
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(139, 92, 246, 0.6);
  animation: glow 2s infinite alternate;
}

@keyframes glow {
  from {
    box-shadow: 0 0 8px rgba(139, 92, 246, 0.6);
  }
  to {
    box-shadow: 0 0 12px rgba(139, 92, 246, 0.8);
  }
}

/* Hide on desktop */
@media (min-width: 768px) {
  .mobile-bottom-nav {
    display: none;
  }
}

/* Safe area for devices with home indicators */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .mobile-bottom-nav {
    padding-bottom: calc(0.5rem + env(safe-area-inset-bottom));
  }
}
</style>