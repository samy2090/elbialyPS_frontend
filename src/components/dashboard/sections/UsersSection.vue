<template>
  <div class="users-content">
    <!-- Header Section -->
    <div class="users-header">
      <div class="header-info">
        <h1 class="section-title">Users Management</h1>
        <p class="section-subtitle">Manage your platform users and their permissions</p>
      </div>
      <div class="header-actions">
        <button @click="showCreateModal = true" class="action-btn primary">
          <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5V19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Add New User
        </button>
      </div>
    </div>

    <!-- Success Notification -->
    <div v-if="showSuccess" class="success-notification">
      <div class="notification-content">
        <svg class="success-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.7088 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18457 2.99721 7.13633 4.39828 5.49707C5.79935 3.85782 7.69279 2.71867 9.79619 2.24318C11.8996 1.76769 14.1003 1.98245 16.07 2.86" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>{{ successMessage }}</span>
      </div>
    </div>

    <!-- Section Tabs -->
    <div class="section-tabs">
      <button 
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        :class="['tab-btn', { active: activeTab === tab.id }]"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Tab Content -->
    <div class="tab-content">
      <!-- Users List Tab -->
      <div v-if="activeTab === 'list'" class="users-list-content">
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
            <button @click="loadUsers" class="action-btn secondary">
              <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 4V10H7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M23 20V14H17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14L18.36 18.36A9 9 0 0 1 3.51 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Retry
            </button>
          </div>
        </div>

        <!-- Users Table/Cards -->
        <div v-else class="users-display">
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
                          <button @click="viewUser(user)" class="user-name">
                            {{ user.name }}
                          </button>
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
                      <span :class="getStatusClass(user)" class="status-badge">
                        {{ getUserStatus(user) }}
                      </span>
                    </td>
                    <td>
                      <div class="user-actions">
                        <button @click="viewUser(user)" class="action-btn small secondary" title="View User">
                          <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                          </svg>
                        </button>
                        <button @click="editUser(user)" class="action-btn small primary" title="Edit User">
                          <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Mobile Cards View -->
          <div class="users-cards-container mobile-only">
            <div 
              v-for="user in userStore.getUsers" 
              :key="user.id" 
              class="user-card"
            >
              <div class="user-card-header">
                <div class="user-avatar">
                  {{ getUserInitials(user.name) }}
                </div>
                <div class="user-info">
                  <h3 class="user-name">{{ user.name }}</h3>
                  <p class="user-email">{{ user.email }}</p>
                </div>
              </div>
              <div class="user-card-content">
                <div class="user-badges">
                  <span :class="getRoleClass(user)" class="role-badge">
                    {{ getUserRole(user) }}
                  </span>
                  <span :class="getStatusClass(user)" class="status-badge">
                    {{ getUserStatus(user) }}
                  </span>
                </div>
                <div class="user-actions">
                  <button @click="viewUser(user)" class="action-btn small secondary">
                    View
                  </button>
                  <button @click="editUser(user)" class="action-btn small primary">
                    Edit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Statistics Tab -->
      <div v-if="activeTab === 'stats'" class="stats-content">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" stroke-width="2"/>
                <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" stroke-width="2"/>
                <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <div class="stat-content">
              <h4 class="stat-value">{{ totalUsers }}</h4>
              <p class="stat-label">Total Users</p>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <path d="M8 14S9.5 16 12 16S16 14 16 14" stroke="currentColor" stroke-width="2"/>
                <line x1="9" y1="9" x2="9.01" y2="9" stroke="currentColor" stroke-width="2"/>
                <line x1="15" y1="9" x2="15.01" y2="9" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <div class="stat-content">
              <h4 class="stat-value">{{ activeUsers }}</h4>
              <p class="stat-label">Active Users</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" stroke-width="2"/>
                <circle cx="8.5" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                <polyline points="17,11 19,13 23,9" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <div class="stat-content">
              <h4 class="stat-value">{{ adminUsers }}</h4>
              <p class="stat-label">Admins</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- User Detail Modal -->
    <div v-if="selectedUser" class="user-modal-overlay" @click="closeUserModal">
      <div class="user-modal" @click.stop>
        <div class="modal-header">
          <h3>User Details</h3>
          <button @click="closeUserModal" class="close-btn">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
        </div>
        <div class="modal-content">
          <div class="user-detail-card">
            <div class="user-avatar large">
              {{ getUserInitials(selectedUser.name) }}
            </div>
            <h4>{{ selectedUser.name }}</h4>
            <p>{{ selectedUser.email }}</p>
            <div class="user-badges">
              <span :class="getRoleClass(selectedUser)" class="role-badge">
                {{ getUserRole(selectedUser) }}
              </span>
              <span :class="getStatusClass(selectedUser)" class="status-badge">
                {{ getUserStatus(selectedUser) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit User Modal -->
    <div v-if="showEditModal && editingUser" class="user-modal-overlay" @click="closeEditModal">
      <div class="user-modal edit-modal" @click.stop>
        <div class="modal-header">
          <h3>Edit User</h3>
          <button @click="closeEditModal" class="close-btn">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
        </div>
        <div class="modal-content">
          <UserForm 
            :user="editingUser"
            @user-updated="onUserUpdated"
            @cancel="closeEditModal"
          />
        </div>
      </div>
    </div>

    <!-- Create User Modal -->
    <div v-if="showCreateModal" class="user-modal-overlay" @click="closeCreateModal">
      <div class="user-modal edit-modal" @click.stop>
        <div class="modal-header">
          <h3>Create New User</h3>
          <button @click="closeCreateModal" class="close-btn">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
        </div>
        <div class="modal-content">
          <UserForm 
            @user-created="onUserCreated"
            @cancel="closeCreateModal"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/userStore'
import UserForm from '@/components/dashboard/users/UserForm.vue'

const userStore = useUserStore()

// Reactive state
const activeTab = ref('list')
const usersLoaded = ref(false)
const selectedUser = ref(null)
const editingUser = ref(null)
const showEditModal = ref(false)
const showCreateModal = ref(false)
const successMessage = ref('')
const showSuccess = ref(false)

// Tabs configuration
const tabs = computed(() => [
  { id: 'list', label: 'Users List' },
  { id: 'stats', label: 'Statistics' }
])

// Computed statistics
const totalUsers = computed(() => userStore.getUsers?.length || 0)
const activeUsers = computed(() => userStore.getUsers?.filter(user => getUserStatus(user) === 'Active').length || 0)
const adminUsers = computed(() => userStore.getUsers?.filter(user => getUserRole(user) === 'Admin').length || 0)

// Methods
const loadUsers = async () => {
  try {
    await userStore.fetchUsers()
    usersLoaded.value = true
  } catch (error) {
    console.error('Error loading users:', error)
  }
}

const getUserInitials = (name) => {
  if (!name) return 'U'
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

const getUserRole = (user) => {
  // This should match your actual user role logic
  return user.role || user.userType || 'User'
}

const getUserStatus = (user) => {
  // This should match your actual user status logic
  return user.status || user.isActive ? 'Active' : 'Inactive'
}

const getRoleClass = (user) => {
  const role = getUserRole(user).toLowerCase()
  return `role-${role}`
}

const getStatusClass = (user) => {
  const status = getUserStatus(user).toLowerCase()
  return `status-${status}`
}

const viewUser = (user) => {
  selectedUser.value = user
}

const editUser = (user) => {
  // Set editing user and show edit modal
  editingUser.value = user
  showEditModal.value = true
}

const closeUserModal = () => {
  selectedUser.value = null
}

const closeEditModal = () => {
  showEditModal.value = false
  editingUser.value = null
}

const closeCreateModal = () => {
  showCreateModal.value = false
}

const showSuccessMessage = (message) => {
  successMessage.value = message
  showSuccess.value = true
  setTimeout(() => {
    showSuccess.value = false
  }, 3000)
}

const onUserCreated = () => {
  // Handle user creation success
  closeCreateModal()
  loadUsers() // Refresh the list
  showSuccessMessage('User created successfully!')
}

const onUserUpdated = () => {
  // Handle user update success
  closeEditModal()
  loadUsers() // Refresh the list
  showSuccessMessage('User updated successfully!')
}

// Lifecycle
onMounted(() => {
  loadUsers()
})

// Emit events to parent component
defineEmits(['user-selected', 'user-created', 'user-updated'])
</script>

<style scoped>
.users-content {
  padding: 0;
}

.users-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 1rem;
}

.header-info {
  flex: 1;
}

.section-title {
  font-size: 2rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 0.5rem 0;
}

.section-subtitle {
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.75rem;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  position: relative;
  overflow: hidden;
}

.action-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.5s ease;
}

.action-btn:hover::before {
  left: 100%;
}

.action-btn.primary {
  background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);
  color: white;
  box-shadow: 
    0 4px 15px rgba(139, 92, 246, 0.2),
    0 2px 10px rgba(139, 92, 246, 0.1);
  border: 1px solid rgba(139, 92, 246, 0.3);
}

.action-btn.primary:hover {
  background: linear-gradient(135deg, #7c3aed 0%, #9333ea 100%);
  box-shadow: 
    0 8px 25px rgba(139, 92, 246, 0.3),
    0 4px 15px rgba(139, 92, 246, 0.2);
  transform: translateY(-2px);
}

.action-btn.secondary {
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.action-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.action-btn.small {
  padding: 0.5rem;
  font-size: 0.875rem;
}

.action-btn .icon {
  width: 1rem;
  height: 1rem;
}

.section-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
}

.section-tabs::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  height: 2px;
  background: linear-gradient(90deg, #8b5cf6, #a855f7);
  border-radius: 1px;
  transition: all 0.3s ease;
  opacity: 0;
}

.tab-btn {
  padding: 1rem 1.5rem;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 2px solid transparent;
  font-weight: 500;
  position: relative;
  border-radius: 8px 8px 0 0;
}

.tab-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px 8px 0 0;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.tab-btn:hover {
  color: rgba(255, 255, 255, 0.8);
}

.tab-btn:hover::before {
  opacity: 1;
}

.tab-btn.active {
  color: #8b5cf6;
  border-bottom-color: #8b5cf6;
  background: rgba(139, 92, 246, 0.1);
  font-weight: 600;
}

.tab-btn.active::before {
  opacity: 0;
}

.tab-content {
  min-height: 400px;
}

/* Loading and Error States */
.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
}

.loading-spinner .spinner {
  width: 2rem;
  height: 2rem;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-top: 2px solid #8b5cf6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  margin-top: 1rem;
  color: rgba(255, 255, 255, 0.6);
}

.error-card {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 16px;
  padding: 2rem;
  max-width: 400px;
}

.error-icon {
  width: 3rem;
  height: 3rem;
  color: #ef4444;
  margin: 0 auto 1rem;
}

.error-title {
  color: #ef4444;
  margin-bottom: 0.5rem;
}

.error-message {
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 1.5rem;
}

/* Users Table */
.table-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 
    0 10px 25px rgba(0, 0, 0, 0.2),
    0 5px 10px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(20px);
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th {
  background: rgba(255, 255, 255, 0.05);
  padding: 1.25rem;
  text-align: left;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.users-table td {
  padding: 1.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: background-color 0.3s ease;
}

.user-row:hover td {
  background: rgba(255, 255, 255, 0.03);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 2.5rem;
  height: 2.5rem;
  background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: white;
  font-size: 0.875rem;
  box-shadow: 
    0 4px 15px rgba(139, 92, 246, 0.3),
    0 2px 10px rgba(139, 92, 246, 0.1);
  position: relative;
}

.user-avatar::after {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(135deg, #8b5cf6, #a855f7, #ec4899);
  border-radius: 50%;
  z-index: -1;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.user-info:hover .user-avatar::after {
  opacity: 0.6;
}

.user-avatar.large {
  width: 4rem;
  height: 4rem;
  font-size: 1.25rem;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  text-decoration: none;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  padding: 0;
}

.user-name:hover {
  color: #8b5cf6;
}

.user-id {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.4);
}

.user-email {
  color: rgba(255, 255, 255, 0.7);
}

.role-badge, .status-badge {
  padding: 0.375rem 0.875rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  backdrop-filter: blur(10px);
  border: 1px solid transparent;
  transition: all 0.3s ease;
}

.role-admin {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.3);
  box-shadow: 0 2px 10px rgba(239, 68, 68, 0.1);
}

.role-staff {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
  border-color: rgba(34, 197, 94, 0.3);
  box-shadow: 0 2px 10px rgba(34, 197, 94, 0.1);
}

.role-user {
  background: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
  border-color: rgba(59, 130, 246, 0.3);
  box-shadow: 0 2px 10px rgba(59, 130, 246, 0.1);
}

.status-active {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
  border-color: rgba(34, 197, 94, 0.3);
  box-shadow: 0 2px 10px rgba(34, 197, 94, 0.1);
}

.status-inactive {
  background: rgba(156, 163, 175, 0.15);
  color: #9ca3af;
  border-color: rgba(156, 163, 175, 0.3);
  box-shadow: 0 2px 10px rgba(156, 163, 175, 0.1);
}

.user-actions {
  display: flex;
  gap: 0.5rem;
}

/* Mobile Cards */
.users-cards-container {
  display: grid;
  gap: 1.25rem;
}

.user-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
}

.user-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #8b5cf6, #a855f7, #ec4899);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.user-card:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 
    0 10px 25px rgba(0, 0, 0, 0.2),
    0 5px 10px rgba(0, 0, 0, 0.1);
}

.user-card:hover::before {
  opacity: 0.8;
}

.user-card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.user-card-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.user-badges {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

/* Statistics */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  width: 3rem;
  height: 3rem;
  color: #8b5cf6;
}

.stat-value {
  font-size: 2rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
}

.stat-label {
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

/* Form */
.form-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 2rem;
}

.form-title {
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 1.5rem;
}

/* Modal */
.user-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.user-modal {
  background: rgba(15, 15, 23, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h3 {
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
}

.close-btn svg {
  width: 1rem;
  height: 1rem;
}

.modal-content {
  padding: 1.5rem;
}

.user-detail-card {
  text-align: center;
}

.user-detail-card h4 {
  color: rgba(255, 255, 255, 0.9);
  margin: 1rem 0 0.5rem;
}

.user-detail-card p {
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 1rem;
}

/* Success Notification */
.success-notification {
  position: fixed;
  top: 2rem;
  right: 2rem;
  z-index: 1001;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 12px;
  padding: 1rem 1.5rem;
  color: #22c55e;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  animation: slideInRight 0.3s ease-out;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.success-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: #22c55e;
}

/* Edit Modal Specific Styles */
.edit-modal {
  max-width: 600px;
  width: 95%;
}

.edit-modal .modal-content {
  padding: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .desktop-only {
    display: none !important;
  }
  
  .mobile-only {
    display: block !important;
  }
  
  .users-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .section-tabs {
    overflow-x: auto;
    flex-wrap: nowrap;
    padding-bottom: 0.5rem;
  }
  
  .tab-btn {
    white-space: nowrap;
    min-width: fit-content;
  }
}

@media (min-width: 769px) {
  .desktop-only {
    display: block !important;
  }
  
  .mobile-only {
    display: none !important;
  }
}
</style>