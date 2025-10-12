<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <h1 class="dashboard-title">Dashboard</h1>
      <button @click="handleLogout" class="dashboard-btn" :disabled="authStore.loading">
        {{ authStore.loading ? 'Logging out...' : 'Logout' }}
      </button>
    </div>
    
    <div class="dashboard-content">
      <div v-if="authStore.user" class="dashboard-card">
        <h2>Welcome, {{ authStore.user.name }}!</h2>
        <p>Email: {{ authStore.user.email }}</p>
        <p v-if="authStore.user.is_admin">Role: Administrator</p>
        <p v-else>Role: User</p>
      </div>
      
      <div v-if="authStore.error" class="dashboard-alert dashboard-alert-error">
        {{ authStore.error }}
      </div>
      
      <div class="dashboard-card">
        <h3>Dashboard Content</h3>
        <p>This is the dashboard content area.</p>
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'DashboardView',
  setup() {
    const authStore = useAuthStore()
    
    const handleLogout = async () => {
      try {
        await authStore.logout()
      } catch (error) {
        // Error is handled in the store
        console.error('Logout failed:', error)
      }
    }
    
    // Fetch user data when component mounts
    onMounted(() => {
      if (!authStore.user) {
        authStore.fetchUser()
      }
    })
    
    return {
      authStore,
      handleLogout
    }
  }
}
</script>

<style scoped>
/* Component specific styles can be added here if needed */
</style>