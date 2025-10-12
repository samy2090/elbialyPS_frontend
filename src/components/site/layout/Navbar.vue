<template>
  <nav class="navbar">
    <div class="navbar-brand">
      <router-link to="/" class="brand-link">
        <div class="brand-logo">
          <div class="logo-circle">
            <i class="logo-icon">🎮</i>
          </div>
        </div>
        <span class="brand-text">Dashboard Hub</span>
      </router-link>
    </div>
    
    <div class="navbar-menu" :class="{ 'is-active': isMenuOpen }">
      <div class="navbar-start">
        <router-link to="/dashboard" class="navbar-item">
          <i class="item-icon">📊</i>
          Dashboard
        </router-link>
        <router-link to="/users" class="navbar-item" v-if="authStore.isAuthenticated">
          <i class="item-icon">👥</i>
          Users
        </router-link>
        <router-link to="/about" class="navbar-item">
          <i class="item-icon">ℹ</i>
          About
        </router-link>
      </div>
      
      <div class="navbar-end">
        <AuthStatus />
      </div>
    </div>

    <!-- Mobile Menu Toggle -->
    <button class="mobile-menu-toggle" @click="toggleMenu" :class="{ 'is-active': isMenuOpen }">
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
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

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 32px;
  background: linear-gradient(135deg, rgba(15, 15, 35, 0.95), rgba(26, 26, 62, 0.95));
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(139, 92, 246, 0.2);
  position: sticky;
  top: 0;
  z-index: 1000;
  transition: all 0.3s ease;
}

.navbar::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.5), transparent);
}

/* Brand */
.navbar-brand {
  z-index: 1001;
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--color-text);
  text-decoration: none;
  transition: all 0.3s ease;
}

.brand-link:hover {
  transform: translateY(-1px);
}

.brand-logo {
  position: relative;
}

.logo-circle {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(139, 92, 246, 0.3);
  transition: all 0.3s ease;
  animation: logoFloat 6s ease-in-out infinite;
}

.brand-link:hover .logo-circle {
  transform: scale(1.05);
  box-shadow: 0 12px 25px rgba(139, 92, 246, 0.4);
}

@keyframes logoFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

.logo-icon {
  font-size: 20px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.brand-text {
  font-size: 20px;
  font-weight: 700;
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;
}

/* Menu */
.navbar-menu {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-left: 40px;
}

.navbar-start {
  display: flex;
  align-items: center;
  gap: 8px;
}

.navbar-item {
  color: var(--color-text);
  text-decoration: none;
  padding: 12px 20px;
  border-radius: 12px;
  font-weight: 500;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.navbar-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(6, 182, 212, 0.1));
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: -1;
}

.navbar-item:hover::before,
.navbar-item.router-link-active::before {
  opacity: 1;
}

.navbar-item:hover {
  transform: translateY(-2px);
  color: var(--color-primary);
  box-shadow: 0 8px 25px rgba(139, 92, 246, 0.2);
}

.navbar-item.router-link-active {
  color: var(--color-primary);
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(6, 182, 212, 0.1));
  border: 1px solid rgba(139, 92, 246, 0.3);
}

.item-icon {
  font-size: 16px;
  transition: transform 0.3s ease;
}

.navbar-item:hover .item-icon {
  transform: scale(1.1);
}

.navbar-end {
  margin-left: auto;
}

/* Mobile Menu Toggle */
.mobile-menu-toggle {
  display: none;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(6, 182, 212, 0.1));
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 1001;
}

.mobile-menu-toggle:hover {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(6, 182, 212, 0.15));
  border-color: rgba(139, 92, 246, 0.4);
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(139, 92, 246, 0.3);
}

.hamburger-line {
  width: 20px;
  height: 2px;
  background: var(--color-text);
  margin: 2px 0;
  transition: all 0.3s ease;
  border-radius: 1px;
}

.mobile-menu-toggle.is-active .hamburger-line:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px);
}

.mobile-menu-toggle.is-active .hamburger-line:nth-child(2) {
  opacity: 0;
}

.mobile-menu-toggle.is-active .hamburger-line:nth-child(3) {
  transform: rotate(-45deg) translate(7px, -6px);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .navbar {
    padding: 16px 24px;
  }
  
  .navbar-start {
    gap: 4px;
  }
  
  .navbar-item {
    padding: 10px 16px;
    font-size: 13px;
  }
  
  .brand-text {
    font-size: 18px;
  }
}

@media (max-width: 768px) {
  .navbar {
    padding: 12px 20px;
    position: relative;
  }
  
  .mobile-menu-toggle {
    display: flex;
  }
  
  .navbar-menu {
    position: fixed;
    top: 80px;
    left: 0;
    right: 0;
    background: linear-gradient(135deg, rgba(15, 15, 35, 0.98), rgba(26, 26, 62, 0.98));
    backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(139, 92, 246, 0.2);
    border-top: 1px solid rgba(139, 92, 246, 0.2);
    flex-direction: column;
    padding: 20px;
    gap: 16px;
    transform: translateY(-100%);
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    z-index: 999;
    margin-left: 0;
  }
  
  .navbar-menu.is-active {
    transform: translateY(0);
    opacity: 1;
    visibility: visible;
  }
  
  .navbar-start {
    flex-direction: column;
    width: 100%;
    gap: 8px;
  }
  
  .navbar-end {
    width: 100%;
    margin-left: 0;
    justify-content: center;
  }
  
  .navbar-item {
    width: 100%;
    justify-content: flex-start;
    padding: 16px 20px;
    font-size: 14px;
    border-radius: 8px;
  }
  
  .brand-text {
    font-size: 16px;
  }
  
  .logo-circle {
    width: 36px;
    height: 36px;
  }
  
  .logo-icon {
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .navbar {
    padding: 10px 16px;
  }
  
  .brand-text {
    display: none;
  }
  
  .navbar-menu {
    top: 70px;
    padding: 16px;
  }
  
  .navbar-item {
    padding: 14px 16px;
  }
}

/* Dark mode enhancements */
@media (prefers-color-scheme: dark) {
  .navbar {
    background: linear-gradient(135deg, rgba(10, 10, 25, 0.98), rgba(20, 20, 50, 0.98));
  }
}

/* Smooth scrolling compensation for sticky navbar */
@media (min-width: 769px) {
  .navbar {
    height: 80px;
  }
}

@media (max-width: 768px) {
  .navbar {
    height: 70px;
  }
}

/* Accessibility enhancements */
@media (prefers-reduced-motion: reduce) {
  .navbar,
  .navbar-item,
  .brand-link,
  .mobile-menu-toggle,
  .hamburger-line,
  .logo-circle {
    transition: none;
    animation: none;
  }
}

/* Focus styles for accessibility */
.navbar-item:focus,
.brand-link:focus,
.mobile-menu-toggle:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
</style>