<template>
  <div class="site-container">
    <div class="site-header">
      <h2 class="site-title">User Details</h2>
      <router-link 
        to="/users" 
        class="site-btn site-btn-secondary"
      >
        Back to Users
      </router-link>
    </div>
    
    <div v-if="userStore.loading" class="site-loading">
      <p>Loading user details...</p>
    </div>
    
    <div v-else-if="userStore.error" class="site-alert site-alert-error">
      {{ userStore.error }}
    </div>
    
    <div v-else-if="user" class="site-card">
      <div class="user-detail-row">
        <strong>ID:</strong>
        <span>{{ user.id }}</span>
      </div>
      
      <div class="user-detail-row">
        <strong>Name:</strong>
        <span>{{ user.name }}</span>
      </div>
      
      <div class="user-detail-row">
        <strong>Email:</strong>
        <span>{{ user.email }}</span>
      </div>
      
      <div class="user-detail-row">
        <strong>Role:</strong>
        <span :class="getRoleClass(user)" class="role-badge">
          {{ getUserRole(user) }}
        </span>
      </div>
      
      <div class="user-detail-row">
        <strong>Created At:</strong>
        <span>{{ formatDate(user.created_at) }}</span>
      </div>
      
      <div class="user-detail-row">
        <strong>Updated At:</strong>
        <span>{{ formatDate(user.updated_at) }}</span>
      </div>
      
      <div class="site-actions">
        <router-link 
          :to="`/users/${user.id}/edit`"
          class="site-btn"
        >
          Edit User
        </router-link>
        <button 
          class="site-btn site-btn-danger" 
          @click="deleteUser"
        >
          Delete User
        </button>
      </div>
    </div>
    
    <div v-else class="site-alert site-alert-error">
      User not found
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { getUserRole, getRoleClass } from '@/utils/roleHelpers'

export default {
  name: 'UserDetailView',
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
    
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleDateString()
    }
    
    const deleteUser = async () => {
      if (confirm('Are you sure you want to delete this user?')) {
        try {
          await userStore.deleteUser(route.params.id)
          // Redirect back to users list after deletion
          router.push('/users')
        } catch (error) {
          console.error('Failed to delete user:', error)
        }
      }
    }
    
    return {
      user,
      userStore,
      formatDate,
      deleteUser,
      getUserRole,
      getRoleClass
    }
  }
}
</script>

<style scoped>
.site-card {
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.user-detail-row {
  display: flex;
  margin-bottom: 1rem;
}

.user-detail-row strong {
  width: 120px;
  display: inline-block;
}

.site-actions {
  margin-top: 2rem;
  display: flex;
  gap: 1rem;
}

.site-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
</style>