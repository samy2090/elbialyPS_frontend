<template>
  <AuthLayout>
    <template #header>
      <div class="brand-header">
        <div class="brand-logo">
          <div class="logo-circle">
            <i class="logo-icon" aria-hidden="true">🔐</i>
          </div>
        </div>
        <h1 class="brand-title">Password Recovery</h1>
        <p class="brand-subtitle">Enter your email to receive a reset link</p>
      </div>
    </template>

    <div v-if="authStore.error" class="alert alert-error">
      <div class="alert-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
          <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
        </svg>
      </div>
      <div class="alert-content">
        <div class="alert-title">Error</div>
        <div class="alert-message">{{ authStore.error }}</div>
      </div>
    </div>

    <div v-if="message" class="alert alert-success">
      <div class="alert-icon" aria-hidden="true">✅</div>
      <div class="alert-content">
        <div class="alert-title">Success</div>
        <div class="alert-message">{{ message }}</div>
      </div>
    </div>

    <form @submit.prevent="handleForgotPassword" class="reset-form">
      <div class="form-group">
        <label class="form-label">
          <svg class="label-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="18" height="18">
            <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M22 6L12 13L2 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Email Address
        </label>
        <input
          v-model="form.email"
          type="email"
          class="form-input"
          placeholder="Enter your email address"
          required
        />
      </div>

      <button
        type="submit"
        class="submit-btn"
        :disabled="authStore.loading"
      >
        <span class="btn-content">
          <span v-if="!authStore.loading" class="btn-icon">→</span>
          <span v-else class="loading-spinner"></span>
          {{ authStore.loading ? 'Sending Reset Link...' : 'Send Reset Link' }}
        </span>
      </button>
    </form>

    <template #nav>
      <div class="navigation-links">
        <router-link to="/login" class="nav-link">
          <span class="nav-icon" aria-hidden="true">←</span>
          Back to Login
        </router-link>
        <router-link to="/register" class="nav-link">
          <span class="nav-icon" aria-hidden="true">✨</span>
          Create Account
        </router-link>
      </div>
    </template>
  </AuthLayout>
</template>

<script>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import AuthLayout from '@/components/site/auth/AuthLayout.vue'

export default {
  name: 'ForgotPasswordView',
  components: { AuthLayout },
  setup() {
    const authStore = useAuthStore()
    const message = ref('')
    const form = ref({ email: '' })

    const handleForgotPassword = async () => {
      try {
        authStore.clearError()
        message.value = ''
        await new Promise(resolve => setTimeout(resolve, 1000))
        message.value = 'Password reset link sent to your email address.'
      } catch (error) {
        console.error('Forgot Password Error', error)
      }
    }

    return { form, authStore, message, handleForgotPassword }
  }
}
</script>
