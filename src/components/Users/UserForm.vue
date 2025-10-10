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
        <label class="site-form-label">
          <input 
            v-model="form.is_admin" 
            type="checkbox" 
            class="site-form-checkbox"
          /> Admin User
        </label>
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
    
    const form = ref({
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      is_admin: false
    })
    
    // Populate form if editing existing user
    onMounted(() => {
      if (props.user) {
        form.value.name = props.user.name
        form.value.email = props.user.email
        form.value.is_admin = props.user.is_admin || false
      }
    })
    
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
      handleSubmit
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
}
</style>