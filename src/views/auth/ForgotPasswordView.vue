<template>
  <div class="site-container">
    <div class="site-form">
      <h2 class="site-title">Forgot Password</h2>
      
      <div v-if="authStore.error" class="site-alert site-alert-error">
        {{ authStore.error }}
      </div>
      
      <div v-if="message" class="site-alert site-alert-success">
        {{ message }}
      </div>
      
      <form @submit.prevent="handleForgotPassword">
        <div class="site-form-group">
          <label class="site-form-label">Email:</label>
          <input 
            v-model="form.email" 
            type="email" 
            class="site-form-input" 
            required 
          />
        </div>
        
        <button 
          type="submit" 
          class="site-btn" 
          :disabled="authStore.loading"
        >
          {{ authStore.loading ? 'Sending...' : 'Send Reset Link' }}
        </button>
      </form>
      
      <div class="site-navigation">
        <router-link to="/login" class="site-nav-link">
          Back to Login
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'ForgotPasswordView',
  setup() {
    const authStore = useAuthStore()
    const message = ref('')
    
    const form = ref({
      email: ''
    })
    
    const handleForgotPassword = async () => {
      try {
        // Clear any previous errors
        authStore.clearError()
        message.value = ''
        
        // In a real app, you would call an API endpoint to send reset link
        // For now, we'll just simulate the process
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        message.value = 'Password reset link sent to your email address.'
      } catch (error) {
        // Error is handled in the store
        console.error('Forgot Password Error:', error)
      }
    }
    
    return {
      form,
      authStore,
      message,
      handleForgotPassword
    }
  }
}
</script>

<style scoped>
/* Component specific styles can be added here if needed */
</style>