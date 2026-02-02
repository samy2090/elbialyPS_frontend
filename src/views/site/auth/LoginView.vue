<template>
  <AuthLayout>
    <template #header>
      <div class="auth-header">
        <div class="brand-logo">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h1 class="auth-title">Welcome Back</h1>
        <p class="auth-subtitle">Sign in to your account to continue</p>
      </div>
    </template>

    <div v-if="authStore.error" class="error-alert">
      <div class="alert-icon">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
          <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
        </svg>
      </div>
      <span class="alert-message">{{ authStore.error }}</span>
    </div>

    <form @submit.prevent="handleLogin" class="auth-form">
      <div class="form-field">
        <label class="field-label">
          <svg class="label-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M22 6L12 13L2 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Email, Phone, or Username
        </label>
        <input
          v-model="form.login"
          type="text"
          class="form-input"
          placeholder="Enter your email, phone, or username"
          required
        />
      </div>

      <div class="form-field">
        <label class="field-label">
          <svg class="label-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
            <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" stroke-width="2"/>
          </svg>
          Password
        </label>
        <input
          v-model="form.password"
          type="password"
          class="form-input"
          placeholder="Enter your password"
          required
        />
      </div>

      <div class="form-options">
        <div class="remember-me">
          <input type="checkbox" id="remember" v-model="form.remember" class="form-checkbox">
          <label for="remember" class="checkbox-label">Remember me</label>
        </div>
        <router-link to="/forgot-password" class="forgot-link">
          Forgot password?
        </router-link>
      </div>

      <button
        type="submit"
        class="auth-btn"
        :disabled="authStore.loading"
      >
        <svg v-if="!authStore.loading" class="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M10 17L15 12L10 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M15 12H3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <div v-else class="loading-spinner"></div>
        {{ authStore.loading ? 'Signing in...' : 'Sign In' }}
      </button>
    </form>

    <template #nav>
      <p class="nav-text">Don't have an account?</p>
      <router-link to="/register" class="nav-link">
        Create an account
        <svg class="link-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 5L19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </router-link>
    </template>

    <template #quickLinks>
      <router-link to="/" class="quick-link">
        <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M9 22V12H15V22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Back to Home
      </router-link>
      <router-link to="/dashboard" class="quick-link">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="3" width="7" height="7" stroke="currentColor" stroke-width="2"/>
          <rect x="14" y="3" width="7" height="7" stroke="currentColor" stroke-width="2"/>
          <rect x="14" y="14" width="7" height="7" stroke="currentColor" stroke-width="2"/>
          <rect x="3" y="14" width="7" height="7" stroke="currentColor" stroke-width="2"/>
        </svg>
        Dashboard
      </router-link>
    </template>
  </AuthLayout>
</template>

<script>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import AuthLayout from '@/components/site/auth/AuthLayout.vue'

export default {
  name: 'LoginView',
  components: { AuthLayout },
  setup() {
    const authStore = useAuthStore()
    const form = ref({
      login: '',
      password: '',
      remember: false
    })

    const handleLogin = async () => {
      try {
        authStore.clearError()
        await authStore.login(form.value)
      } catch (error) {
        console.error('LoginView: Login failed', error)
      }
    }

    return { form, authStore, handleLogin }
  }
}
</script>
