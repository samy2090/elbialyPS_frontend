<script setup>
import { RouterLink, RouterView, useRoute } from 'vue-router'
import AuthStatus from './components/site/auth/AuthStatus.vue'
import { useAuthStore } from '@/stores/auth'
import { onMounted, computed } from 'vue'

const authStore = useAuthStore()
const route = useRoute()

// Initialize auth state when app loads
onMounted(() => {
  authStore.initAuth()
})

// Check if current route is the dashboard
const isDashboardRoute = computed(() => {
  return route.name === 'dashboard'
})

// Navigation items
const navigationItems = computed(() => [
  { to: '/', label: 'Home', icon: 'home' },
  { to: '/about', label: 'About', icon: 'info' },
  ...(authStore.isAuthenticated ? [
    { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' }
  ] : [])
])
</script>

<template>
  <!-- Only show main navigation if not on dashboard route -->
  <div v-if="!isDashboardRoute" class="app-container">
    <header class="main-header">
      <div class="header-content">
        <!-- Logo Section -->
        <div class="logo-section">
          <div class="logo-container">
            <svg class="logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
            </svg>
            <span class="logo-text">ElbialyPS</span>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="main-nav">
          <RouterLink 
            v-for="item in navigationItems"
            :key="item.to"
            :to="item.to"
            class="nav-link"
            :class="{ 'nav-link-active': $route.path === item.to }"
          >
            <span class="nav-icon" :data-icon="item.icon"></span>
            <span class="nav-label">{{ item.label }}</span>
          </RouterLink>
        </nav>

        <!-- Auth Status -->
        <div class="auth-section">
          <AuthStatus />
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="main-content">
      <RouterView />
    </main>
  </div>

  <!-- Dashboard routes render their own layout -->
  <RouterView v-else />
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  background: var(--bg-primary);
  display: flex;
  flex-direction: column;
}

.main-header {
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  background: var(--bg-secondary);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-primary);
  transition: all var(--transition-normal);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  max-width: 1400px;
  margin: 0 auto;
  gap: 2rem;
}

.logo-section {
  flex-shrink: 0;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  transition: all var(--transition-normal);
}

.logo-container:hover {
  transform: translateY(-1px);
}

.logo-icon {
  width: 2.5rem;
  height: 2.5rem;
  color: var(--primary-purple);
  filter: drop-shadow(0 0 8px rgba(139, 92, 246, 0.3));
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 800;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.main-nav {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  justify-content: center;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: var(--radius-lg);
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: 500;
  transition: all var(--transition-normal);
  position: relative;
  border: 1px solid transparent;
}

.nav-link:hover {
  color: var(--text-primary);
  background: var(--bg-tertiary);
  border-color: var(--border-secondary);
  transform: translateY(-2px);
}

.nav-link-active {
  color: var(--primary-purple);
  background: rgba(139, 92, 246, 0.1);
  border-color: var(--border-accent);
  box-shadow: var(--shadow-md);
}

.nav-icon {
  width: 1.25rem;
  height: 1.25rem;
  position: relative;
}

.nav-icon[data-icon="home"]::before {
  content: '🏠';
}

.nav-icon[data-icon="info"]::before {
  content: 'ℹ️';
}

.nav-icon[data-icon="dashboard"]::before {
  content: '📊';
}

.nav-icon[data-icon="play"]::before {
  content: '🎬';
}

.nav-icon[data-icon="users"]::before {
  content: '👥';
}

.nav-icon[data-icon="box"]::before {
  content: '📦';
}

.nav-label {
  font-size: 0.875rem;
  white-space: nowrap;
}

.auth-section {
  flex-shrink: 0;
}

.main-content {
  flex: 1;
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .header-content {
    padding: 1rem;
    gap: 1rem;
  }
  
  .logo-text {
    display: none;
  }
  
  .main-nav {
    gap: 0.25rem;
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  
  .main-nav::-webkit-scrollbar {
    display: none;
  }
  
  .nav-link {
    padding: 0.5rem 0.75rem;
    flex-shrink: 0;
  }
  
  .nav-label {
    display: none;
  }
  
  .nav-icon {
    width: 1.5rem;
    height: 1.5rem;
  }
  
  .main-content {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .header-content {
    flex-direction: column;
    gap: 1rem;
    padding: 0.75rem;
  }
  
  .main-nav {
    width: 100%;
    justify-content: space-around;
  }
  
  .nav-link {
    flex: 1;
    justify-content: center;
    min-width: 0;
  }
}

/* Large screens */
@media (min-width: 1200px) {
  .header-content {
    padding: 1.5rem 3rem;
  }
  
  .main-nav {
    gap: 1rem;
  }
  
  .nav-link {
    padding: 1rem 1.5rem;
  }
}
</style>