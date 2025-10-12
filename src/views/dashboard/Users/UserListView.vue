<template>
  <div class="user-management-page">
    <!-- Header Section -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">Users Management</h1>
        <p class="page-subtitle">Manage your platform users and their permissions</p>
      </div>
      <div class="header-actions">
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
    <div v-else class="users-section">
      <!-- Desktop Table View -->
      <div class="users-table-container desktop-only">
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
                    <router-link :to="`/users/${user.id}/edit`" class="action-btn secondary small">
                      <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      Edit
                    </router-link>
                    <button @click="deleteUser(user.id)" :disabled="userStore.loading" class="action-btn danger small">
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
      <div class="users-cards-container mobile-only">
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
            <router-link :to="`/users/${user.id}/edit`" class="action-btn secondary">
              Edit
            </router-link>
            <button @click="deleteUser(user.id)" :disabled="userStore.loading" class="action-btn danger">
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
      getUserRole,
      getRoleClass,
      getUserInitials
    }
  }
}
</script>

<style scoped>
.user-management-page {
  min-height: 100vh;
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 2rem 0 3rem;
  border-bottom: 1px solid var(--border-primary);
  margin-bottom: 3rem;
}

.header-content h1 {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.page-subtitle {
  color: var(--text-secondary);
  font-size: 1.125rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: 500;
  transition: all var(--transition-normal);
  cursor: pointer;
  font-size: 0.9rem;
}

.action-btn:hover {
  background: var(--bg-quaternary);
  color: var(--text-primary);
  transform: translateY(-2px);
}

.action-btn.primary {
  background: var(--gradient-primary);
  border-color: transparent;
  color: white;
  box-shadow: var(--shadow-md);
}

.action-btn.primary:hover {
  box-shadow: var(--shadow-lg);
}

.action-btn.secondary {
  background: var(--bg-quaternary);
  border-color: var(--border-secondary);
}

.action-btn.danger {
  background: rgba(239, 68, 68, 0.1);
  border-color: var(--primary-red);
  color: var(--primary-red);
}

.action-btn.danger:hover {
  background: var(--primary-red);
  color: white;
}

.action-btn.small {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.icon {
  width: 1.25rem;
  height: 1.25rem;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.loading-spinner {
  margin-bottom: 2rem;
}

.spinner {
  width: 3rem;
  height: 3rem;
  border: 3px solid var(--border-primary);
  border-top: 3px solid var(--primary-purple);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  color: var(--text-secondary);
  font-size: 1.125rem;
}

/* Error State */
.error-state {
  display: flex;
  justify-content: center;
  padding: 2rem;
}

.error-card {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: 3rem;
  text-align: center;
  max-width: 500px;
  width: 100%;
}

.error-icon {
  width: 4rem;
  height: 4rem;
  margin: 0 auto 2rem;
  color: var(--primary-red);
}

.error-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.error-message {
  color: var(--text-secondary);
  margin-bottom: 2rem;
  line-height: 1.6;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 1rem;
}

.error-note {
  padding: 1rem;
  background: rgba(139, 92, 246, 0.1);
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 0.875rem;
  line-height: 1.5;
}

/* Users Section */
.users-section {
  margin-top: 2rem;
}

/* Desktop Table */
.users-table-container {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.table-card {
  overflow-x: auto;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th {
  background: var(--bg-quaternary);
  padding: 1.5rem;
  text-align: left;
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--border-secondary);
}

.user-row {
  border-bottom: 1px solid var(--border-secondary);
  transition: background-color var(--transition-fast);
}

.user-row:hover {
  background: var(--bg-quaternary);
}

.users-table td {
  padding: 1.5rem;
  vertical-align: middle;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-avatar {
  width: 2.5rem;
  height: 2.5rem;
  background: var(--gradient-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.user-name {
  font-weight: 500;
  color: var(--text-primary);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.user-name:hover {
  color: var(--primary-purple);
}

.user-id {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.user-email {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.role-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  background: rgba(139, 92, 246, 0.1);
  color: var(--primary-purple);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-badge.online {
  background: rgba(16, 185, 129, 0.1);
  color: var(--primary-green);
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

/* Mobile Cards */
.users-cards-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.user-card {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all var(--transition-normal);
}

.user-card:hover {
  border-color: var(--border-accent);
  box-shadow: var(--shadow-md);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-secondary);
}

.card-content {
  padding: 1.5rem;
}

.user-meta {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.meta-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.meta-label {
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
}

.meta-value {
  color: var(--text-primary);
  font-size: 0.875rem;
}

.card-actions {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid var(--border-secondary);
}

.card-actions .action-btn {
  flex: 1;
  justify-content: center;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.empty-icon {
  width: 4rem;
  height: 4rem;
  color: var(--text-tertiary);
  margin-bottom: 2rem;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.empty-message {
  color: var(--text-secondary);
  margin-bottom: 2rem;
  max-width: 400px;
  line-height: 1.6;
}

/* Responsive Design */
.desktop-only {
  display: block;
}

.mobile-only {
  display: none;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 2rem;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: stretch;
  }
  
  .action-btn {
    flex: 1;
    justify-content: center;
  }
  
  .page-title {
    font-size: 2rem !important;
  }

  .desktop-only {
    display: none;
  }

  .mobile-only {
    display: block;
  }

  .error-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .user-management-page {
    padding: 0;
  }
  
  .card-actions {
    flex-direction: column;
  }
  
  .error-card {
    padding: 2rem;
  }
}
</style>