<template>
  <div class="site-container">
    <div class="site-header">
      <h2 class="site-title">Create New User</h2>
      <button 
        class="site-btn site-btn-secondary" 
        @click="$router.back()"
      >
        Back to Users
      </button>
    </div>
    
    <UserForm 
      @save="handleSave" 
      @cancel="$router.back()"
    />
  </div>
</template>

<script>
import { useRouter } from 'vue-router'
import UserForm from '@/components/Users/UserForm.vue'

export default {
  name: 'UserCreateView',
  components: {
    UserForm
  },
  setup() {
    const router = useRouter()
    
    const handleSave = () => {
      // Redirect back to users list after creating
      router.push('/users')
    }
    
    return {
      handleSave
    }
  }
}
</script>

<style scoped>
.site-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
</style>