<template>
  <div class="site-container">
    <div class="site-form">
      <h2 class="site-title">Login</h2>
      
      <div v-if="authStore.error" class="site-alert site-alert-error">
        {{ authStore.error }}
      </div>
      
      <form @submit.prevent="handleLogin">
        <div class="site-form-group">
          <label class="site-form-label">Email:</label>
          <input 
            v-model="form.email" 
            type="email" 
            class="site-form-input" 
            required 
          />
        </div>
        
        <div class="site-form-group">
          <label class="site-form-label">Password:</label>
          <input 
            v-model="form.password" 
            type="password" 
            class="site-form-input" 
            required 
          />
        </div>
        
        <button 
          type="submit" 
          class="site-btn" 
          :disabled="authStore.loading"
        >
          {{ authStore.loading ? 'Logging in...' : 'Login' }}
        </button>
      </form>
      
      <div class="site-navigation">
        <router-link to="/register" class="site-nav-link">
          Don't have an account? Register
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'LoginView',
  setup() {
    const authStore = useAuthStore()
    
    const form = ref({
      email: '',
      password: ''
    })
    
    const handleLogin = async () => {
      console.log('LoginView: Starting login process');
      try {
        // Clear any previous errors
        authStore.clearError()
        console.log('LoginView: Calling authStore.login with', form.value);
        await authStore.login(form.value)
        console.log('LoginView: Login completed successfully');
      } catch (error) {
        // Error is handled in the store
        console.error('LoginView: Login failed with error', error);
      }
    }
    
    return {
      form,
      authStore,
      handleLogin
    }
  }
}
</script>

<style scoped>
/* Component specific styles can be added here if needed */
</style>