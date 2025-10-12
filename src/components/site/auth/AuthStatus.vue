<template>
  <div class="site-auth-status">
    <div v-if="authStore.isAuthenticated && authStore.user" class="site-user-info">
      <div class="site-user-avatar">
        <div class="site-avatar-circle">
          <i class="icon">👤</i>
        </div>
      </div>
      <div class="site-user-details">
        <span class="site-welcome-text">Welcome back</span>
        <span class="site-user-name">{{ authStore.user.name }}</span>
      </div>
      <button 
        @click="handleLogout" 
        class="site-logout-btn" 
        :disabled="authStore.loading"
      >
        <i class="site-logout-icon">🚪</i>
        {{ authStore.loading ? 'Logging out...' : 'Logout' }}
      </button>
    </div>
    <div v-else class="site-auth-links">
      <RouterLink to="/login" class="site-auth-link site-login-link">
        <i class="site-link-icon">🔐</i>
        Login
      </RouterLink>
      <RouterLink to="/register" class="site-auth-link site-register-link">
        <i class="site-link-icon">✨</i>
        Register
      </RouterLink>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

export default {
  name: 'AuthStatus',
  setup() {
    const authStore = useAuthStore()
    const router = useRouter()
    
    const handleLogout = async () => {
      try {
        await authStore.logout()
        // Redirect to home page after logout
        router.push('/')
      } catch (error) {
        console.error('Logout failed:', error)
      }
    }
    
    return {
      authStore,
      handleLogout
    }
  }
}
</script>