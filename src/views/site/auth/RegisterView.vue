<template>
  <AuthLayout>
    <template #header>
      <div class="auth-header">
        <div class="brand-logo">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="8.5" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
            <path d="M20 8V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M23 11H17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h1 class="auth-title">Create Account</h1>
        <p class="auth-subtitle">Join us and start your journey today</p>
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

    <form @submit.prevent="handleRegister" class="auth-form">
      <div class="form-field">
        <label class="field-label">
          <svg class="label-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
          </svg>
          Full Name
        </label>
        <input
          v-model="form.name"
          type="text"
          class="form-input"
          placeholder="Enter your full name"
          required
        />
      </div>
      <div class="form-field">
        <label class="field-label">
          <svg class="label-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Phone 
        </label>
        <input
          :value="form.phone"
          type="tel"
          inputmode="numeric"
          autocomplete="tel"
          class="form-input"
          :class="{ 'input-invalid': phoneError }"
          placeholder="01XXXXXXXXX"
          maxlength="11"
          required
          @keydown="onPhoneKeydown"
          @input="onPhoneInput"
        />
        <p v-if="phoneError" class="field-error">{{ phoneError }}</p>
      </div>

      <div class="form-field">
        <label class="field-label">
          <svg class="label-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M22 6L12 13L2 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Email Address <span class="optional-label">(optional)</span>
        </label>
        <input
          v-model="form.email"
          type="email"
          class="form-input"
          placeholder="Enter your email"
        />
      </div>



      <div class="form-row">
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
            placeholder="Create password"
            required
          />
        </div>
        <div class="form-field">
          <label class="field-label">
            <svg class="label-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
              <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" stroke-width="2"/>
            </svg>
            Confirm Password
          </label>
          <input
            v-model="form.password_confirmation"
            type="password"
            class="form-input"
            placeholder="Confirm password"
            required
          />
        </div>
      </div>

      <div class="form-agreement">
        <div class="agreement-checkbox">
          <input type="checkbox" id="terms" v-model="form.agreesToTerms" class="form-checkbox" required>
          <label for="terms" class="checkbox-label">
            I agree to the
            <router-link to="/terms" class="agreement-link">Terms of Service</router-link>
            and
            <router-link to="/privacy" class="agreement-link">Privacy Policy</router-link>
          </label>
        </div>
      </div>

      <button
        type="submit"
        class="auth-btn"
        :disabled="authStore.loading"
      >
        <svg v-if="!authStore.loading" class="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="8.5" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
          <path d="M20 8V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M23 11H17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <div v-else class="loading-spinner"></div>
        {{ authStore.loading ? 'Creating Account...' : 'Create Account' }}
      </button>
    </form>

    <template #nav>
      <p class="nav-text">Already have an account?</p>
      <router-link to="/login" class="nav-link">
        Sign in instead
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
      <!-- <router-link to="/dashboard" class="quick-link">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="3" width="7" height="7" stroke="currentColor" stroke-width="2"/>
          <rect x="14" y="3" width="7" height="7" stroke="currentColor" stroke-width="2"/>
          <rect x="14" y="14" width="7" height="7" stroke="currentColor" stroke-width="2"/>
          <rect x="3" y="14" width="7" height="7" stroke="currentColor" stroke-width="2"/>
        </svg>
        Dashboard
      </router-link> -->
    </template>
  </AuthLayout>
</template>

<script>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import AuthLayout from '@/components/site/auth/AuthLayout.vue'

export default {
  name: 'RegisterView',
  components: { AuthLayout },
  setup() {
    const authStore = useAuthStore()
    const form = ref({
      name: '',
      email: '',
      phone: '',
      password: '',
      password_confirmation: '',
      agreesToTerms: false
    })
    const phoneError = ref('')

    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End']
    const onPhoneKeydown = (e) => {
      if (allowedKeys.includes(e.key)) return
      if (e.ctrlKey || e.metaKey) {
        if (['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) return
      }
      const char = e.key
      if (!/^\d$/.test(char)) {
        e.preventDefault()
      }
    }

    const onPhoneInput = (e) => {
      const raw = e.target.value.replace(/\D/g, '')
      form.value.phone = raw.slice(0, 11)
      e.target.value = form.value.phone
      if (phoneError.value) {
        phoneError.value = ''
      }
    }

    const validatePhone = () => {
      const p = form.value.phone
      if (!p || p.length !== 11) {
        phoneError.value = 'Phone must be exactly 11 digits.'
        return false
      }
      if (!p.startsWith('01')) {
        phoneError.value = 'Phone must start with 01.'
        return false
      }
      phoneError.value = ''
      return true
    }

    const handleRegister = async () => {
      if (!validatePhone()) return
      try {
        authStore.clearError()
        await authStore.register(form.value)
      } catch (error) {
        console.error('Registration failed', error)
      }
    }

    return { form, authStore, phoneError, onPhoneKeydown, onPhoneInput, handleRegister }
  }
}
</script>

<style scoped>
.optional-label {
  font-weight: normal;
  opacity: 0.75;
}
.field-hint {
  font-weight: normal;
  opacity: 0.7;
  font-size: 0.9em;
}
.field-error {
  margin: 0.25rem 0 0;
  color: var(--error-color, #dc3545);
  font-size: 0.875rem;
}
.input-invalid {
  border-color: var(--error-color, #dc3545);
}
</style>
