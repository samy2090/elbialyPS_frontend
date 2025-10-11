<template>
  <div class="site-form">
    <h2 class="site-title">{{ isEditing ? 'Edit User' : 'Add New User' }}</h2>
    
    <div v-if="userStore.error" class="site-alert site-alert-error">
      {{ userStore.error }}
    </div>
    
    <form @submit.prevent="handleSubmit">
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
          :required="!isEditing"
        />
        <small v-if="isEditing" class="site-form-text">Leave blank to keep current password</small>
      </div>
      
      <div class="site-form-group">
        <label class="site-form-label">Confirm Password:</label>
        <input 
          v-model="form.password_confirmation" 
          type="password" 
          class="site-form-input" 
          :required="!isEditing"
        />
      </div>
      
      <div class="site-form-group">
        <label class="site-form-label">Role:</label>
        <select 
          v-model="form.role" 
          class="site-form-select"
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
        <small class="site-form-text">Select the user's role and permissions level</small>
      </div>
      
      <!-- Keep the legacy is_admin field for backward compatibility -->
      <div class="site-form-group" style="display: none;">
        <input 
          v-model="form.is_admin" 
          type="checkbox" 
        />
      </div>
      
      <div class="site-form-actions">
        <button 
          type="submit" 
          class="site-btn" 
          :disabled="userStore.loading"
        >
          {{ userStore.loading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update User' : 'Create User') }}
        </button>
        <button 
          type="button" 
          class="site-btn site-btn-secondary" 
          @click="$emit('cancel')"
        >
          Cancel
        </button>
      </div>
    </form>
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
.site-form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.site-form-checkbox {
  margin-right: 0.5rem;
}

.site-form-text {
  color: #6c757d;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: block;
}

.site-form-select {
  width: 100%;
  padding: 0.375rem 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  font-size: 1rem;
  line-height: 1.5;
  background-color: #fff;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.site-form-select:focus {
  border-color: #80bdff;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}
</style>