<template>
  <nav class="site-navbar">
    <div class="site-navbar-brand">
      <router-link to="/" class="site-brand-link">
        <div class="site-brand-logo">
          <div class="site-logo-circle">
            <i class="site-logo-icon">🎮</i>
          </div>
        </div>
        <span class="site-brand-text">Dashboard Hub</span>
      </router-link>
    </div>
    
    <div class="site-navbar-menu" :class="{ 'is-active': isMenuOpen }">
      <div class="site-navbar-start">
        <router-link to="/dashboard" class="site-navbar-item">
          <i class="site-item-icon">📊</i>
          Dashboard
        </router-link>
        <router-link to="/about" class="site-navbar-item">
          <i class="site-item-icon">ℹ</i>
          About
        </router-link>
      </div>
      
      <div class="site-navbar-end">
        <AuthStatus />
      </div>
    </div>

    <!-- Mobile Menu Toggle -->
    <button class="site-mobile-menu-toggle" @click="toggleMenu" :class="{ 'is-active': isMenuOpen }">
      <span class="site-hamburger-line"></span>
      <span class="site-hamburger-line"></span>
      <span class="site-hamburger-line"></span>
    </button>
  </nav>
</template>

<script>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import AuthStatus from '@/components/site/auth/AuthStatus.vue'

export default {
  name: 'AppNavbar',
  components: {
    AuthStatus
  },
  setup() {
    const authStore = useAuthStore()
    const isMenuOpen = ref(false)
    
    const toggleMenu = () => {
      isMenuOpen.value = !isMenuOpen.value
    }
    
    const handleLogout = async () => {
      try {
        await authStore.logout()
        isMenuOpen.value = false // Close menu after logout
      } catch (error) {
        console.error('Logout error:', error)
      }
    }
    
    return {
      authStore,
      isMenuOpen,
      toggleMenu,
      handleLogout
    }
  }
}
</script>