<template>
  <div class="site-container">
    <div class="site-form">
      <h2 class="site-title">User Profile</h2>
      
      <div v-if="userStore.error" class="site-alert site-alert-error">
        {{ userStore.error }}
      </div>
      
      <form @submit.prevent="handleUpdateProfile" v-if="userStore.currentUser">
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
        
        <button 
          type="submit" 
          class="site-btn" 
          :disabled="userStore.loading"
        >
          {{ userStore.loading ? 'Updating...' : 'Update Profile' }}
        </button>
      </form>
      
      <div v-else>
        <p>Loading user profile...</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/userStore'

export default {
  name: 'UserProfileView',
  setup() {
    const userStore = useUserStore()
    
    const form = ref({
      name: '',
      email: ''
    })
    
    // Load user data when component mounts
    onMounted(async () => {
      try {
        await userStore.fetchCurrentUser()
        if (userStore.currentUser) {
          form.value.name = userStore.currentUser.name
          form.value.email = userStore.currentUser.email
        }
      } catch (error) {
        console.error('Failed to load user profile:', error)
      }
    })
    
    const handleUpdateProfile = async () => {
      try {
        await userStore.updateProfile(form.value)
        // Show success message or redirect
      } catch (error) {
        console.error('Failed to update profile:', error)
      }
    }
    
    return {
      form,
      userStore,
      handleUpdateProfile
    }
  }
}
</script>

<style scoped>
/* Component specific styles can be added here if needed */
</style>