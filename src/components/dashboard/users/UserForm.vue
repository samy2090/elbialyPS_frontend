<template>
  <div class="user-form-container">
    <div class="form-card">
      <div class="form-header">
        <h2 class="form-title">{{ isEditing ? 'Edit User' : 'Add New User' }}</h2>
        <p class="form-subtitle">{{ isEditing ? 'Update user information and permissions' : 'Create a new user account with role assignment' }}</p>
      </div>

      <!-- Error Alert -->
      <div v-if="userStore.error" class="error-alert">
        <div class="alert-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
            <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>
        <span class="alert-message">{{ userStore.error }}</span>
      </div>

      <form @submit.prevent="handleSubmit" class="user-form">
        <!-- Name Field -->
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
            placeholder="Enter full name"
            required 
          />
        </div>

        <!-- Email Field -->
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
            placeholder="Enter email address"
            required 
          />
        </div>

        <!-- Password Fields Row -->
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
              placeholder="Enter password"
              :required="!isEditing"
            />
            <small v-if="isEditing" class="field-hint">Leave blank to keep current password</small>
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
              :required="!isEditing"
            />
          </div>
        </div>

        <!-- Role Field -->
        <div class="form-field">
          <label class="field-label">
            <svg class="label-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
              <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            User Role
          </label>
          <select 
            v-model="form.role" 
            class="form-select"
            @change="handleRoleChange"
          >
            <option 
              v-for="role in availableRoles" 
              :key="role.value" 
              :value="role.value"
            >
              {{ role.label }}
            </option>
          </select>
          <small class="field-hint">Select the user's role and permissions level</small>
        </div>

        <!-- Hidden legacy field for backward compatibility -->
        <input 
          v-model="form.is_admin" 
          type="checkbox" 
          style="display: none;"
        />

        <!-- Form Actions -->
        <div class="form-actions">
          <button 
            type="submit" 
            class="action-btn primary"
            :disabled="userStore.loading"
          >
            <svg v-if="!userStore.loading" class="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 21L5 21C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3L16 3L21 8V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M17 21V13H7V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M7 3V8H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <div v-else class="loading-spinner"></div>
            {{ userStore.loading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update User' : 'Create User') }}
          </button>
          <button 
            type="button" 
            class="action-btn secondary" 
            @click="$emit('cancel')"
          >
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { getUserRoleForForm, getAvailableRoles, isAdminRole } from '@/utils/roleHelpers'

export default {
  name: 'UserForm',
  props: {
    user: {
      type: Object,
      default: null
    }
  },
  emits: ['save', 'cancel'],
  setup(props, { emit }) {
    const userStore = useUserStore()
    
    const isEditing = ref(!!props.user)
    const availableRoles = getAvailableRoles()
    
    const form = ref({
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      is_admin: false,
      role: 'user'
    })
    
    // Populate form if editing existing user
    onMounted(() => {
      if (props.user) {
        form.value.name = props.user.name
        form.value.email = props.user.email
        form.value.is_admin = props.user.is_admin || false
        form.value.role = getUserRoleForForm(props.user)
      }
    })
    
    // Handle role change and update is_admin for backward compatibility
    const handleRoleChange = () => {
      form.value.is_admin = isAdminRole(form.value.role)
    }
    
    const handleSubmit = async () => {
      try {
        userStore.clearError()
        
        if (isEditing.value) {
          // Editing existing user
          await userStore.updateUser(props.user.id, form.value)
        } else {
          // Creating new user
          await userStore.createUser(form.value)
        }
        
        // Emit save event to parent component
        emit('save')
      } catch (error) {
        console.error('Failed to save user:', error)
      }
    }
    
    return {
      form,
      isEditing,
      userStore,
      handleSubmit,
      handleRoleChange,
      availableRoles
    }
  }
}
</script>

<style scoped>
.user-form-container {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.form-card {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: 2rem;
  box-shadow: var(--shadow-md);
}

.form-header {
  margin-bottom: 2rem;
  text-align: center;
}

.form-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.form-subtitle {
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
  margin-bottom: 2rem;
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
.user-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
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

.form-input,
.form-select {
  width: 100%;
  padding: 0.75rem 1rem;
  background: var(--bg-quaternary);
  border: 1px solid var(--border-secondary);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: 0.875rem;
  transition: all var(--transition-normal);
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: var(--primary-purple);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
  background: var(--bg-tertiary);
}

.form-input::placeholder {
  color: var(--text-tertiary);
}

.form-select {
  cursor: pointer;
}

.field-hint {
  color: var(--text-tertiary);
  font-size: 0.75rem;
  line-height: 1.4;
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-secondary);
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-md);
  font-weight: 500;
  font-size: 0.875rem;
  transition: all var(--transition-normal);
  cursor: pointer;
  border: 1px solid transparent;
  flex: 1;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.action-btn.primary {
  background: var(--gradient-primary);
  color: white;
  box-shadow: var(--shadow-md);
}

.action-btn.primary:hover:not(:disabled) {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.action-btn.secondary {
  background: var(--bg-quaternary);
  border-color: var(--border-primary);
  color: var(--text-secondary);
}

.action-btn.secondary:hover:not(:disabled) {
  background: var(--bg-tertiary);
  color: var(--text-primary);
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

/* Mobile Responsive */
@media (max-width: 768px) {
  .form-card {
    padding: 1.5rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .form-title {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .user-form-container {
    padding: 0;
  }
  
  .form-card {
    padding: 1rem;
    border-radius: var(--radius-md);
  }
  
  .form-header {
    margin-bottom: 1.5rem;
  }
}
</style>