<template>
  <div class="site-container">
    <div class="site-header">
      <h2 class="site-title">Users</h2>
    </div>
    
    <div v-if="userStore.loading" class="site-loading">
      <p>Loading users...</p>
    </div>
    
    <div v-else-if="userStore.error" class="site-alert site-alert-error">
      {{ userStore.error }}
    </div>
    
    <div v-else>
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
              <td>{{ user.name }}</td>
              <td>{{ user.email }}</td>
              <td>{{ user.is_admin ? 'Admin' : 'User' }}</td>
              <td>
                <button class="site-btn site-btn-sm site-btn-secondary">Edit</button>
                <button class="site-btn site-btn-sm site-btn-danger">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted } from 'vue'
import { useUserStore } from '@/stores/userStore'

export default {
  name: 'UserListView',
  setup() {
    const userStore = useUserStore()
    
    // Load users when component mounts
    onMounted(async () => {
      try {
        // In a real app, you would fetch all users
        // For now, we'll just work with the current user
        await userStore.fetchCurrentUser()
      } catch (error) {
        console.error('Failed to load users:', error)
      }
    })
    
    return {
      userStore
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
}

.site-btn-secondary {
  background-color: #6c757d;
  border-color: #6c757d;
}

.site-btn-danger {
  background-color: #dc3545;
  border-color: #dc3545;
}
</style>