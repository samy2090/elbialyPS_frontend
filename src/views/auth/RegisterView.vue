<template>
  <div class="site-container">
    <div class="site-form">
      <h2 class="site-title">Register</h2>
      
      <div v-if="authStore.error" class="site-alert site-alert-error">
        {{ authStore.error }}
      </div>
      
      <form @submit.prevent="handleRegister">
        <div class="site-form-group">
          <label class="site-form-label">Name:</label>
          <input 
            v-model="form.name" 
            type="text" 
            class="site-form-input" 
            required 
          />
        </div>
        
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
        
        <div class="site-form-group">
          <label class="site-form-label">Confirm Password:</label>
          <input 
            v-model="form.password_confirmation" 
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
          {{ authStore.loading ? 'Registering...' : 'Register' }}
        </button>
      </form>
      
      <div class="site-navigation">
        <router-link to="/login" class="site-nav-link">
          Already have an account? Login
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'RegisterView',
  setup() {
    const authStore = useAuthStore()
    
    const form = ref({
      name: '',
      email: '',
      password: '',
      password_confirmation: ''
    })
    
    const handleRegister = async () => {
      try {
        // Clear any previous errors
        authStore.clearError()
        await authStore.register(form.value)
      } catch (error) {
        // Error is handled in the store
        console.error('Registration failed:', error)
      }
    }
    
    return {
      form,
      authStore,
      handleRegister
    }
  }
}
</script>

<style scoped>
/* Component specific styles can be added here if needed */
</style>