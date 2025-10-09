<template>
  <div class="auth-status">
    <div v-if="authStore.isAuthenticated && authStore.user" class="user-info">
      <span>Welcome, {{ authStore.user.name }}!</span>
      <button @click="handleLogout" class="logout-btn" :disabled="authStore.loading">
        {{ authStore.loading ? 'Logging out...' : 'Logout' }}
      </button>
    </div>
    <div v-else class="auth-links">
      <RouterLink to="/login" class="auth-link">Login</RouterLink>
      <RouterLink to="/register" class="auth-link">Register</RouterLink>
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

<style scoped>
.auth-status {
  display: flex;
  align-items: center;
  margin-left: auto;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.logout-btn {
  padding: 5px 10px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.logout-btn:hover:not(:disabled) {
  background-color: #c82333;
}

.logout-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.auth-links {
  display: flex;
  gap: 15px;
}

.auth-link {
  color: #007bff;
  text-decoration: none;
  padding: 5px 10px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.auth-link:hover {
  background-color: #e9ecef;
}
</style>