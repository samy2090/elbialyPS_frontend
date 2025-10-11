<template>
  <div class="site-container">
    <div class="site-header">
      <h2 class="site-title">Users Management</h2>
      <router-link 
        to="/users/create" 
        class="site-btn"
      >
        Add New User
      </router-link>
    </div>
    
    <div v-if="userStore.loading && !usersLoaded" class="site-loading">
      <p>Loading users...</p>
    </div>
    
    <div v-else-if="userStore.error && !usersLoaded" class="site-alert site-alert-error">
      <strong>{{ userStore.error }}</strong>
      <div style="margin-top: 1rem;">
        <button @click="loadUsers" class="site-btn site-btn-sm site-btn-secondary" style="margin-right: 0.5rem;">
          Retry
        </button>
        <router-link to="/login" class="site-btn site-btn-sm site-btn-primary" v-if="!authStore.isAuthenticated">
          Login to Access Users
        </router-link>
        <div v-if="userStore.error.includes('Authentication required') || userStore.error.includes('401')" style="margin-top: 0.5rem; font-size: 0.9em;">
          <strong>Note:</strong> You need to login to view users. The API is working correctly.
        </div>
      </div>
    </div>
    
    <div v-else>
      <!-- Users Table -->
      <div class="site-table-container">
        <table class="site-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in userStore.getUsers" :key="user.id">
              <td>{{ user.id }}</td>
              <td>
                <router-link :to="`/users/${user.id}`" class="user-link">
                  {{ user.name }}
                </router-link>
              </td>
              <td>{{ user.email }}</td>
              <td>
                <span :class="getRoleClass(user)" class="role-badge">
                  {{ getUserRole(user) }}
                </span>
              </td>
              <td>
                <router-link 
                  :to="`/users/${user.id}/edit`"
                  class="site-btn site-btn-sm site-btn-secondary"
                >
                  Edit
                </router-link>
                <button 
                  class="site-btn site-btn-sm site-btn-danger" 
                  @click="deleteUser(user.id)"
                  :disabled="userStore.loading"
                >
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Empty state -->
      <div v-if="usersLoaded && userStore.getUsers.length === 0" class="site-empty">
        <p>No users found.</p>
        <router-link 
          to="/users/create" 
          class="site-btn"
        >
          Add Your First User
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { useAuthStore } from '@/stores/auth'
import { getUserRole, getRoleClass } from '@/utils/roleHelpers'

export default {
  name: 'UserListView',
  setup() {
    const userStore = useUserStore()
    const authStore = useAuthStore()
    const usersLoaded = ref(false)
    
    // Load users when component mounts
    const loadUsers = async () => {
      try {
        await userStore.fetchUsers()
        usersLoaded.value = true
      } catch (error) {
        console.error('Failed to load users:', error)
      }
    }
    
    onMounted(() => {
      loadUsers()
    })
    
    const deleteUser = async (userId) => {
      if (confirm('Are you sure you want to delete this user?')) {
        try {
          await userStore.deleteUser(userId)
          // Reload users to reflect changes
          loadUsers()
        } catch (error) {
          console.error('Failed to delete user:', error)
        }
      }
    }
    
    return {
      userStore,
      authStore,
      usersLoaded,
      loadUsers,
      deleteUser,
      getUserRole,
      getRoleClass
    }
  }
}
</script>

<style scoped>
.site-table-container {
  overflow-x: auto;
}

.site-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

.site-table th,
.site-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.site-table th {
  background-color: #f8f9fa;
  font-weight: bold;
}

.site-btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  margin-right: 0.5rem;
  text-decoration: none;
  display: inline-block;
}

.site-btn-secondary {
  background-color: #6c757d;
  border-color: #6c757d;
}

.site-btn-danger {
  background-color: #dc3545;
  border-color: #dc3545;
}

.site-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.site-empty {
  text-align: center;
  padding: 2rem;
}

.site-empty p {
  margin-bottom: 1rem;
}

.user-link {
  color: #007bff;
  text-decoration: none;
}

.user-link:hover {
  text-decoration: underline;
}
</style>