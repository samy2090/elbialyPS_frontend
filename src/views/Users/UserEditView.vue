<template>
  <div class="site-container">
    <div class="site-header">
      <h2 class="site-title">Edit User</h2>
      <button 
        class="site-btn site-btn-secondary" 
        @click="$router.back()"
      >
        Back to Users
      </button>
    </div>
    
    <div v-if="userStore.loading && !user" class="site-loading">
      <p>Loading user...</p>
    </div>
    
    <div v-else-if="userStore.error && !user" class="site-alert site-alert-error">
      {{ userStore.error }}
      <button @click="loadUser" class="site-btn site-btn-sm site-btn-secondary" style="margin-left: 1rem;">
        Retry
      </button>
    </div>
    
    <div v-else>
      <UserForm 
        v-if="user" 
        :user="user" 
        @save="handleSave" 
        @cancel="$router.back()"
      />
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import UserForm from '@/components/Users/UserForm.vue'

export default {
  name: 'UserEditView',
  components: {
    UserForm
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const userStore = useUserStore()
    const user = ref(null)
    
    const loadUser = async () => {
      try {
        const userId = route.params.id
        user.value = await userStore.fetchUserById(userId)
      } catch (error) {
        console.error('Failed to load user:', error)
      }
    }
    
    onMounted(() => {
      loadUser()
    })
    
    const handleSave = () => {
      // Redirect back to users list after saving
      router.push('/users')
    }
    
    return {
      user,
      userStore,
      loadUser,
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