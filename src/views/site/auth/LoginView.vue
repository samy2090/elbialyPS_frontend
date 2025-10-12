<template>
  <div class="auth-page">
    <div class="auth-container">
      <!-- Decorative Background -->
      <div class="auth-background">
        <div class="bg-gradient"></div>
        <div class="bg-pattern"></div>
      </div>

      <!-- Auth Content -->
      <div class="auth-content">
        <!-- Auth Header -->
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

        <!-- Error Alert -->
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

        <!-- Login Form -->
        <form @submit.prevent="handleLogin" class="auth-form">
          <div class="form-field">
            <label class="field-label">
              <svg class="label-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M22 6L12 13L2 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Email Address
            </label>
            <input 
              v-model="form.email" 
              type="email" 
              class="form-input" 
              placeholder="Enter your email"
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
            class="auth-btn primary"
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

        <!-- Navigation Links -->
        <div class="auth-navigation">
          <p class="nav-text">Don't have an account?</p>
          <router-link to="/register" class="nav-link">
            Create an account
            <svg class="link-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 5L19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </router-link>
        </div>

        <!-- Quick Links -->
        <div class="quick-links">
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
        </div>
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
      password: '',
      remember: false
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
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  overflow: hidden;
}

.auth-container {
  position: relative;
  width: 100%;
  max-width: 450px;
  z-index: 2;
}

/* Decorative Background */
.auth-background {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  pointer-events: none;
}

.bg-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--gradient-primary);
  opacity: 0.05;
}

.bg-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 25% 25%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, rgba(6, 182, 212, 0.1) 0%, transparent 50%);
  animation: float 20s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  33% { transform: translate(30px, -30px) rotate(1deg); }
  66% { transform: translate(-20px, 20px) rotate(-1deg); }
}

/* Auth Content */
.auth-content {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-xl);
  padding: 3rem;
  box-shadow: var(--shadow-xl);
  backdrop-filter: blur(10px);
  position: relative;
}

/* Auth Header */
.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.brand-logo {
  width: 4rem;
  height: 4rem;
  background: var(--gradient-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  color: white;
  box-shadow: var(--shadow-lg);
}

.brand-logo svg {
  width: 2rem;
  height: 2rem;
}

.auth-title {
  font-size: 2rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.auth-subtitle {
  color: var(--text-secondary);
  font-size: 1rem;
  line-height: 1.5;
}

/* Error Alert */
.error-alert {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: var(--radius-md);
  color: var(--primary-red);
  margin-bottom: 1.5rem;
}

.alert-icon {
  width: 1.5rem;
  height: 1.5rem;
  flex-shrink: 0;
}

.alert-message {
  font-size: 0.875rem;
  font-weight: 500;
}

/* Form */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.label-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--primary-purple);
}

.form-input {
  width: 100%;
  padding: 1rem;
  background: var(--bg-quaternary);
  border: 1px solid var(--border-secondary);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: 0.875rem;
  transition: all var(--transition-normal);
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-purple);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
  background: var(--bg-tertiary);
}

.form-input::placeholder {
  color: var(--text-tertiary);
}

/* Form Options */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0.5rem 0;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-checkbox {
  width: 1rem;
  height: 1rem;
  accent-color: var(--primary-purple);
  cursor: pointer;
}

.checkbox-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  cursor: pointer;
}

.forgot-link {
  font-size: 0.875rem;
  color: var(--primary-purple);
  text-decoration: none;
  font-weight: 500;
  transition: color var(--transition-fast);
}

.forgot-link:hover {
  color: var(--primary-purple-dark);
}

/* Auth Button */
.auth-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 0.875rem;
  transition: all var(--transition-normal);
  cursor: pointer;
  border: 1px solid transparent;
  margin-top: 0.5rem;
}

.auth-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.auth-btn.primary {
  background: var(--gradient-primary);
  color: white;
  box-shadow: var(--shadow-md);
}

.auth-btn.primary:hover:not(:disabled) {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.btn-icon {
  width: 1.25rem;
  height: 1.25rem;
}

/* Loading Spinner */
.loading-spinner {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Navigation */
.auth-navigation {
  text-align: center;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-secondary);
}

.nav-text {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-bottom: 0.75rem;
}

.nav-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--primary-purple);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.875rem;
  transition: all var(--transition-fast);
}

.nav-link:hover {
  color: var(--primary-purple-dark);
  transform: translateX(2px);
}

.link-icon {
  width: 1rem;
  height: 1rem;
}

/* Quick Links */
.quick-links {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-secondary);
}

.quick-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--bg-quaternary);
  border: 1px solid var(--border-secondary);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.75rem;
  font-weight: 500;
  transition: all var(--transition-normal);
}

.quick-link:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  transform: translateY(-1px);
}

.quick-link .icon {
  width: 1rem;
  height: 1rem;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .auth-page {
    padding: 1rem;
  }
  
  .auth-content {
    padding: 2rem;
  }
  
  .auth-title {
    font-size: 1.75rem;
  }
  
  .form-options {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .quick-links {
    flex-direction: column;
    gap: 0.5rem;
  }
}

@media (max-width: 480px) {
  .auth-page {
    padding: 0.5rem;
  }
  
  .auth-content {
    padding: 1.5rem;
    border-radius: var(--radius-lg);
  }
  
  .brand-logo {
    width: 3rem;
    height: 3rem;
    margin-bottom: 1rem;
  }
  
  .brand-logo svg {
    width: 1.5rem;
    height: 1.5rem;
  }
  
  .auth-title {
    font-size: 1.5rem;
  }
}
</style>