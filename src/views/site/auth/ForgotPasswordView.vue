<template>
  <div class="forgot-password-container">
    <!-- Animated Background -->
    <div class="animated-bg">
      <div class="floating-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
        <div class="shape shape-4"></div>
        <div class="shape shape-5"></div>
      </div>
    </div>

    <div class="forgot-password-content">
      <div class="forgot-password-card">
        <!-- Brand Header -->
        <div class="brand-header">
          <div class="brand-logo">
            <div class="logo-circle">
              <i class="logo-icon">🔐</i>
            </div>
          </div>
          <h1 class="brand-title">Password Recovery</h1>
          <p class="brand-subtitle">Enter your email to receive a reset link</p>
        </div>

        <!-- Error Alert -->
        <div v-if="authStore.error" class="alert alert-error">
          <div class="alert-icon">⚠️</div>
          <div class="alert-content">
            <div class="alert-title">Error</div>
            <div class="alert-message">{{ authStore.error }}</div>
          </div>
        </div>

        <!-- Success Alert -->
        <div v-if="message" class="alert alert-success">
          <div class="alert-icon">✅</div>
          <div class="alert-content">
            <div class="alert-title">Success</div>
            <div class="alert-message">{{ message }}</div>
          </div>
        </div>

        <!-- Reset Form -->
        <form @submit.prevent="handleForgotPassword" class="reset-form">
          <div class="form-group">
            <label class="form-label">
              <i class="label-icon">📧</i>
              Email Address
            </label>
            <div class="input-wrapper">
              <input 
                v-model="form.email" 
                type="email" 
                class="form-input" 
                placeholder="Enter your email address"
                required 
              />
              <div class="input-decoration"></div>
            </div>
          </div>
          
          <button 
            type="submit" 
            class="submit-btn"
            :disabled="authStore.loading"
          >
            <span class="btn-content">
              <i class="btn-icon">{{ authStore.loading ? '⏳' : '🚀' }}</i>
              {{ authStore.loading ? 'Sending Reset Link...' : 'Send Reset Link' }}
            </span>
            <div class="btn-decoration"></div>
          </button>
        </form>

        <!-- Navigation -->
        <div class="navigation-links">
          <router-link to="/login" class="nav-link">
            <i class="nav-icon">←</i>
            Back to Login
          </router-link>
          <router-link to="/register" class="nav-link">
            <i class="nav-icon">✨</i>
            Create Account
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
.forgot-password-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a3e 25%, #2d1b4e 50%, #1a1a3e 75%, #0f0f23 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
}

/* Animated Background */
.animated-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
}

.floating-shapes {
  position: relative;
  width: 100%;
  height: 100%;
}

.shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.1;
  animation: float 20s infinite ease-in-out;
}

.shape-1 {
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.shape-2 {
  width: 200px;
  height: 200px;
  background: linear-gradient(135deg, var(--color-secondary), var(--color-accent));
  top: 60%;
  right: 15%;
  animation-delay: 5s;
}

.shape-3 {
  width: 150px;
  height: 150px;
  background: linear-gradient(135deg, var(--color-accent), var(--color-primary));
  bottom: 20%;
  left: 20%;
  animation-delay: 10s;
}

.shape-4 {
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
  top: 30%;
  right: 30%;
  animation-delay: 15s;
}

.shape-5 {
  width: 250px;
  height: 250px;
  background: linear-gradient(135deg, var(--color-secondary), var(--color-primary));
  bottom: 10%;
  right: 10%;
  animation-delay: 8s;
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
  25% { transform: translateY(-30px) rotate(90deg) scale(1.1); }
  50% { transform: translateY(-60px) rotate(180deg) scale(0.9); }
  75% { transform: translateY(-30px) rotate(270deg) scale(1.1); }
}

/* Content */
.forgot-password-content {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 480px;
}

.forgot-password-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
}

.forgot-password-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.5), transparent);
}

/* Brand Header */
.brand-header {
  text-align: center;
  margin-bottom: 40px;
}

.brand-logo {
  margin-bottom: 20px;
}

.logo-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  box-shadow: 0 15px 35px rgba(139, 92, 246, 0.3);
  animation: logoFloat 6s ease-in-out infinite;
}

@keyframes logoFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.logo-icon {
  font-size: 36px;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
}

.brand-title {
  font-size: 32px;
  font-weight: 700;
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 12px;
  letter-spacing: -0.5px;
}

.brand-subtitle {
  color: rgba(255, 255, 255, 0.7);
  font-size: 16px;
  line-height: 1.5;
  margin: 0;
}

/* Alerts */
.alert {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 24px;
  animation: slideIn 0.5s ease-out;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.alert-error {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.alert-success {
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.alert-icon {
  font-size: 20px;
  flex-shrink: 0;
  margin-top: 2px;
}

.alert-content {
  flex: 1;
}

.alert-title {
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 4px;
}

.alert-message {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  line-height: 1.4;
}

/* Form */
.reset-form {
  margin-bottom: 32px;
}

.form-group {
  margin-bottom: 32px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 12px;
  font-size: 14px;
  letter-spacing: 0.5px;
}

.label-icon {
  font-size: 16px;
}

.input-wrapper {
  position: relative;
}

.form-input {
  width: 100%;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: var(--color-text);
  font-size: 16px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  outline: none;
}

.form-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.form-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
  background: rgba(255, 255, 255, 0.08);
}

.input-decoration {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
  border-radius: 1px;
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.form-input:focus + .input-decoration {
  transform: scaleX(1);
}

/* Submit Button */
.submit-btn {
  width: 100%;
  padding: 16px 24px;
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 10px 25px rgba(139, 92, 246, 0.3);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 15px 35px rgba(139, 92, 246, 0.4);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  position: relative;
  z-index: 2;
}

.btn-icon {
  font-size: 18px;
}

.btn-decoration {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.6s ease;
}

.submit-btn:hover:not(:disabled) .btn-decoration {
  left: 100%;
}

/* Navigation */
.navigation-links {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  gap: 16px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
  flex: 1;
  justify-content: center;
}

.nav-link:hover {
  color: var(--color-primary);
  background: rgba(139, 92, 246, 0.1);
  transform: translateY(-1px);
}

.nav-icon {
  font-size: 16px;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .forgot-password-container {
    padding: 16px;
  }
  
  .forgot-password-card {
    padding: 32px 24px;
  }
  
  .brand-title {
    font-size: 28px;
  }
  
  .brand-subtitle {
    font-size: 14px;
  }
  
  .logo-circle {
    width: 70px;
    height: 70px;
  }
  
  .logo-icon {
    font-size: 32px;
  }
  
  .navigation-links {
    flex-direction: column;
    gap: 12px;
  }
  
  .nav-link {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .forgot-password-card {
    padding: 24px 20px;
  }
  
  .brand-title {
    font-size: 24px;
  }
  
  .form-input {
    padding: 14px 16px;
    font-size: 16px; /* Prevent zoom on iOS */
  }
  
  .submit-btn {
    padding: 14px 20px;
  }
}

/* Loading Animation */
@keyframes spin {
  to { transform: rotate(360deg); }
}

.submit-btn:disabled .btn-icon {
  animation: spin 1s linear infinite;
}
</style>