<template>
  <div class="dashboard-page">
    <!-- Header Section -->
    <div class="dashboard-page-header">
      <div class="dashboard-page-header-content">
        <h1 class="dashboard-page-title">Users Management</h1>
        <p class="dashboard-page-subtitle">Manage your platform users and their permissions</p>
      </div>
      <div class="dashboard-page-header-actions">
        <router-link to="/users/create" class="action-btn primary">
          <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5V19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Add New User
        </router-link>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="userStore.loading && !usersLoaded" class="loading-state">
      <div class="loading-spinner">
        <div class="spinner"></div>
      </div>
      <p class="loading-text">Loading users...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="userStore.error && !usersLoaded" class="error-state">
      <div class="error-card">
        <div class="error-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
            <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>
        <h3 class="error-title">Error Loading Users</h3>
        <p class="error-message">{{ userStore.error }}</p>
        <div class="error-actions">
          <button @click="loadUsers" class="action-btn secondary">
            <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 4V10H7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M23 20V14H17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14L18.36 18.36A9 9 0 0 1 3.51 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Retry
          </button>
          <router-link to="/login" class="action-btn primary" v-if="!authStore.isAuthenticated">
            <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M10 17L15 12L10 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M15 12H3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Login to Access
          </router-link>
        </div>
        <div v-if="userStore.error.includes('Authentication required') || userStore.error.includes('401')" class="error-note">
          <strong>Note:</strong> You need to login to view users. The API is working correctly.
        </div>
      </div>
    </div>

    <!-- Users Table/List -->
    <div v-else class="dashboard-section">
      <!-- Desktop Table View -->
      <div class="dashboard-table-container desktop-only">
        <div class="table-card">
          <table class="users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in userStore.getUsers" :key="user.id" class="user-row">
                <td>
                  <div class="user-info">
                    <div class="user-avatar">
                      {{ getUserInitials(user.name) }}
                    </div>
                    <div class="user-details">
                      <router-link :to="`/users/${user.id}`" class="user-name">
                        {{ user.name }}
                      </router-link>
                      <span class="user-id">ID: {{ user.id }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="user-email">{{ user.email }}</span>
                </td>
                <td>
                  <span :class="getRoleClass(user)" class="role-badge">
                    {{ getUserRole(user) }}
                  </span>
                </td>
                <td>
                  <span class="status-badge online">Active</span>
                </td>
                <td>
                  <div class="action-buttons">
                    <router-link :to="`/users/${user.id}`" class="action-btn primary small">
                      <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                      </svg>
                      View
                    </router-link>
                    <router-link :to="`/users/${user.id}/edit`" class="action-btn secondary small">
                      <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      Edit
                    </router-link>
                    <button @click="deleteUser(user)" :disabled="userStore.loading" class="action-btn danger small">
                      <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 6H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Mobile Card View -->
      <div class="dashboard-cards-container mobile-only">
        <div v-for="user in userStore.getUsers" :key="user.id" class="user-card">
          <div class="card-header">
            <div class="user-info">
              <div class="user-avatar">
                {{ getUserInitials(user.name) }}
              </div>
              <div class="user-details">
                <router-link :to="`/users/${user.id}`" class="user-name">
                  {{ user.name }}
                </router-link>
                <span class="user-email">{{ user.email }}</span>
              </div>
            </div>
            <span class="status-badge online">Active</span>
          </div>
          <div class="card-content">
            <div class="user-meta">
              <div class="meta-item">
                <span class="meta-label">Role:</span>
                <span :class="getRoleClass(user)" class="role-badge">
                  {{ getUserRole(user) }}
                </span>
              </div>
              <div class="meta-item">
                <span class="meta-label">ID:</span>
                <span class="meta-value">{{ user.id }}</span>
              </div>
            </div>
          </div>
          <div class="card-actions">
            <router-link :to="`/users/${user.id}`" class="action-btn primary">
              View
            </router-link>
            <router-link :to="`/users/${user.id}/edit`" class="action-btn secondary">
              Edit
            </router-link>
            <button @click="deleteUser(user)" :disabled="userStore.loading" class="action-btn danger">
              Delete
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="usersLoaded && userStore.getUsers.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>
        <h3 class="empty-title">No Users Found</h3>
        <p class="empty-message">Get started by adding your first user to the platform.</p>
        <router-link to="/users/create" class="action-btn primary">
          <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5V19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Add Your First User
        </router-link>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="user-modal-overlay" @click="closeDeleteModal">
      <div class="user-modal delete-modal" @click.stop>
        <div class="modal-header">
          <h3>Delete User</h3>
          <button @click="closeDeleteModal" class="close-btn">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
        </div>
        <div class="modal-content">
          <p>Are you sure you want to delete the user "{{ deletingUser?.name }}"?</p>
          <p class="warning-text">This action cannot be undone.</p>
        </div>
        <div class="modal-actions">
          <button @click="closeDeleteModal" class="action-btn secondary">Cancel</button>
          <button @click="confirmDeleteUser" :disabled="userStore.loading" class="action-btn danger">Delete User</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { useAuthStore } from '@/stores/auth'
import { getUserRole, getRoleClass } from '@/utils/roleHelpers'
import { useBodyScrollLock } from '@/composables/useBodyScrollLock'

export default {
  name: 'UserListView',
  setup() {
    const userStore = useUserStore()
    const authStore = useAuthStore()
    const usersLoaded = ref(false)
    const showDeleteModal = ref(false)
    const deletingUser = ref(null)
    
    // Lock body scroll when modal is open
    useBodyScrollLock(showDeleteModal)
    
    // Load users when component mounts
    const loadUsers = async () => {
      try {
        console.log('UserListView: Loading users...')
        usersLoaded.value = false
        await userStore.fetchUsers()
        usersLoaded.value = true
        console.log('UserListView: Users loaded. Count:', userStore.getUsers.length)
      } catch (error) {
        console.error('UserListView: Failed to load users:', error)
        usersLoaded.value = true // Set to true even on error to show error state
      }
    }
    
    onMounted(() => {
      loadUsers()
    })
    
    const deleteUser = (user) => {
      deletingUser.value = user
      showDeleteModal.value = true
    }

    const closeDeleteModal = () => {
      showDeleteModal.value = false
      deletingUser.value = null
    }

    const confirmDeleteUser = async () => {
      if (deletingUser.value) {
        try {
          await userStore.deleteUser(deletingUser.value.id)
          // Reload users to reflect changes
          loadUsers()
          closeDeleteModal()
        } catch (error) {
          console.error('Failed to delete user:', error)
          closeDeleteModal()
        }
      }
    }

    const getUserInitials = (name) => {
      return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    
    return {
      userStore,
      authStore,
      usersLoaded,
      loadUsers,
      deleteUser,
      confirmDeleteUser,
      closeDeleteModal,
      showDeleteModal,
      deletingUser,
      getUserRole,
      getRoleClass,
      getUserInitials
    }
  }
}
</script>
