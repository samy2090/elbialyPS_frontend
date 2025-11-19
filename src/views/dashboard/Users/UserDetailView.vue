<template>
  <div class="dashboard-page">
    <!-- Header Section -->
    <div class="dashboard-page-header">
      <div class="dashboard-page-header-content">
        <h1 class="dashboard-page-title">User Details</h1>
        <p class="dashboard-page-subtitle">Complete information about this user</p>
      </div>
      <div class="dashboard-page-header-actions">
        <router-link to="/users" class="action-btn secondary">
          <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Back to Users
        </router-link>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="userStore.loading" class="loading-state">
      <div class="loading-spinner">
        <div class="spinner"></div>
      </div>
      <p class="loading-text">Loading user details...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="userStore.error" class="error-state">
      <div class="error-card">
        <div class="error-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
            <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>
        <h3 class="error-title">Error Loading User</h3>
        <p class="error-message">{{ userStore.error }}</p>
        <button @click="loadUser" class="action-btn secondary">
          <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 4V10H7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M23 20V14H17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14L18.36 18.36A9 9 0 0 1 3.51 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Retry
        </button>
      </div>
    </div>

    <!-- User Details -->
    <div v-else-if="user" class="dashboard-section">
      <!-- User Profile Header -->
      <div class="user-profile-header">
        <div class="user-avatar-large">
          {{ getUserInitials(user.name) }}
        </div>
        <div class="user-profile-info">
          <h2 class="user-profile-name">{{ user.name }}</h2>
          <p class="user-profile-email">{{ user.email }}</p>
          <div class="user-profile-badges">
            <span :class="getRoleClass(user)" class="role-badge large">
              {{ getUserRole(user) }}
            </span>
            <span v-if="getUserStatus(user)" :class="getStatusClass(user)" class="status-badge large">
              {{ getUserStatus(user) }}
            </span>
          </div>
        </div>
      </div>

      <!-- User Information Sections -->
      <div class="user-details-grid">
        <!-- Basic Information -->
        <div class="detail-section">
          <h3 class="section-title">
            <svg class="section-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
            </svg>
            Basic Information
          </h3>
          <div class="detail-card">
            <div class="detail-item">
              <span class="detail-label">User ID</span>
              <span class="detail-value">{{ user.id }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Full Name</span>
              <span class="detail-value">{{ user.name || 'N/A' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Email Address</span>
              <span class="detail-value">
                <a :href="`mailto:${user.email}`" class="email-link">{{ user.email || 'N/A' }}</a>
              </span>
            </div>
            <div v-if="user.phone" class="detail-item">
              <span class="detail-label">Phone</span>
              <span class="detail-value">
                <a :href="`tel:${user.phone}`" class="phone-link">{{ user.phone }}</a>
              </span>
            </div>
            <div v-if="user.username" class="detail-item">
              <span class="detail-label">Username</span>
              <span class="detail-value">{{ user.username }}</span>
            </div>
          </div>
        </div>

        <!-- Account Information -->
        <div class="detail-section">
          <h3 class="section-title">
            <svg class="section-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Account Information
          </h3>
          <div class="detail-card">
            <div class="detail-item">
              <span class="detail-label">Role</span>
              <span class="detail-value">
                <span :class="getRoleClass(user)" class="role-badge">
                  {{ getUserRole(user) }}
                </span>
              </span>
            </div>
            <div v-if="user.is_admin !== undefined" class="detail-item">
              <span class="detail-label">Admin Status</span>
              <span class="detail-value">
                <span :class="user.is_admin ? 'badge-success' : 'badge-secondary'" class="status-badge">
                  {{ user.is_admin ? 'Yes' : 'No' }}
                </span>
              </span>
            </div>
            <div v-if="getUserStatus(user)" class="detail-item">
              <span class="detail-label">Status</span>
              <span class="detail-value">
                <span :class="getStatusClass(user)" class="status-badge">
                  {{ getUserStatus(user) }}
                </span>
              </span>
            </div>
            <div v-if="user.email_verified_at" class="detail-item">
              <span class="detail-label">Email Verified</span>
              <span class="detail-value">
                <span class="badge-success status-badge">Yes</span>
                <span class="detail-meta">({{ formatDateTime(user.email_verified_at) }})</span>
              </span>
            </div>
            <div v-else-if="user.email_verified_at === null" class="detail-item">
              <span class="detail-label">Email Verified</span>
              <span class="detail-value">
                <span class="badge-warning status-badge">No</span>
              </span>
            </div>
          </div>
        </div>

        <!-- Additional Information -->
        <div v-if="hasAdditionalInfo" class="detail-section">
          <h3 class="section-title">
            <svg class="section-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Additional Information
          </h3>
          <div class="detail-card">
            <div v-if="user.address" class="detail-item">
              <span class="detail-label">Address</span>
              <span class="detail-value">{{ user.address }}</span>
            </div>
            <div v-if="user.city" class="detail-item">
              <span class="detail-label">City</span>
              <span class="detail-value">{{ user.city }}</span>
            </div>
            <div v-if="user.country" class="detail-item">
              <span class="detail-label">Country</span>
              <span class="detail-value">{{ user.country }}</span>
            </div>
            <div v-if="user.postal_code" class="detail-item">
              <span class="detail-label">Postal Code</span>
              <span class="detail-value">{{ user.postal_code }}</span>
            </div>
            <div v-if="user.bio" class="detail-item">
              <span class="detail-label">Bio</span>
              <span class="detail-value">{{ user.bio }}</span>
            </div>
            <div v-if="user.company" class="detail-item">
              <span class="detail-label">Company</span>
              <span class="detail-value">{{ user.company }}</span>
            </div>
            <div v-if="user.department" class="detail-item">
              <span class="detail-label">Department</span>
              <span class="detail-value">{{ user.department }}</span>
            </div>
            <div v-if="user.position" class="detail-item">
              <span class="detail-label">Position</span>
              <span class="detail-value">{{ user.position }}</span>
            </div>
          </div>
        </div>

        <!-- Timestamps -->
        <div class="detail-section">
          <h3 class="section-title">
            <svg class="section-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <polyline points="12 6 12 12 16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Timestamps
          </h3>
          <div class="detail-card">
            <div v-if="user.created_at" class="detail-item">
              <span class="detail-label">Created At</span>
              <span class="detail-value">{{ formatDateTime(user.created_at) }}</span>
            </div>
            <div v-if="user.updated_at" class="detail-item">
              <span class="detail-label">Updated At</span>
              <span class="detail-value">{{ formatDateTime(user.updated_at) }}</span>
            </div>
            <div v-if="user.last_login_at" class="detail-item">
              <span class="detail-label">Last Login</span>
              <span class="detail-value">{{ formatDateTime(user.last_login_at) }}</span>
            </div>
            <div v-if="user.deleted_at" class="detail-item">
              <span class="detail-label">Deleted At</span>
              <span class="detail-value text-danger">{{ formatDateTime(user.deleted_at) }}</span>
            </div>
          </div>
        </div>

        <!-- All Fields (for debugging) -->
        <div v-if="showAllFields" class="detail-section">
          <h3 class="section-title">
            <svg class="section-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            All Fields (Raw Data)
            <button @click="showAllFields = false" class="toggle-btn">Hide</button>
          </h3>
          <div class="detail-card">
            <pre class="raw-data">{{ JSON.stringify(user, null, 2) }}</pre>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="user-actions">
        <router-link :to="`/users/${user.id}/edit`" class="action-btn primary">
          <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Edit User
        </router-link>
        <button @click="deleteUser" :disabled="userStore.loading" class="action-btn danger">
          <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 6H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Delete User
        </button>
        <button @click="showAllFields = !showAllFields" class="action-btn secondary">
          <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          {{ showAllFields ? 'Hide' : 'Show' }} Raw Data
        </button>
      </div>
    </div>

    <!-- Not Found State -->
    <div v-else class="empty-state">
      <div class="empty-icon">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
        </svg>
      </div>
      <h3 class="empty-title">User Not Found</h3>
      <p class="empty-message">The user you're looking for doesn't exist or has been deleted.</p>
      <router-link to="/users" class="action-btn primary">
        <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 12H5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Back to Users
      </router-link>
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
          <p>Are you sure you want to delete the user "{{ user?.name }}"?</p>
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
import { ref, computed, onMounted } from 'vue'
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
    const showAllFields = ref(false)
    
    const loadUser = async () => {
      try {
        const userId = route.params.id
        const userData = await userStore.fetchUserById(userId)
        user.value = userData
        
        // Log the full response to console for verification
        console.log('=== User Detail Response ===')
        console.log('Full user object:', userData)
        console.log('User keys:', Object.keys(userData || {}))
        console.log('==========================')
      } catch (error) {
        console.error('Failed to load user:', error)
      }
    }
    
    onMounted(() => {
      loadUser()
    })
    
    const getUserInitials = (name) => {
      if (!name) return 'U'
      return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    
    const getUserStatus = (user) => {
      if (!user) return null
      if (user.status) return user.status
      if (user.is_active !== undefined) return user.is_active ? 'Active' : 'Inactive'
      if (user.deleted_at) return 'Deleted'
      return 'Active'
    }
    
    const getStatusClass = (user) => {
      const status = getUserStatus(user)?.toLowerCase() || 'active'
      return `status-${status}`
    }
    
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleDateString()
    }
    
    const formatDateTime = (dateString) => {
      if (!dateString) return 'N/A'
      const date = new Date(dateString)
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    
    const hasAdditionalInfo = computed(() => {
      if (!user.value) return false
      return !!(
        user.value.address ||
        user.value.city ||
        user.value.country ||
        user.value.postal_code ||
        user.value.bio ||
        user.value.company ||
        user.value.department ||
        user.value.position
      )
    })
    
    const showDeleteModal = ref(false)

    const deleteUser = () => {
      showDeleteModal.value = true
    }

    const closeDeleteModal = () => {
      showDeleteModal.value = false
    }

    const confirmDeleteUser = async () => {
      try {
        await userStore.deleteUser(route.params.id)
        // Redirect back to users list after deletion
        router.push('/users')
      } catch (error) {
        console.error('Failed to delete user:', error)
        closeDeleteModal()
      }
    }
    
    return {
      user,
      userStore,
      showAllFields,
      showDeleteModal,
      loadUser,
      formatDate,
      formatDateTime,
      deleteUser,
      confirmDeleteUser,
      closeDeleteModal,
      getUserRole,
      getRoleClass,
      getUserStatus,
      getStatusClass,
      getUserInitials,
      hasAdditionalInfo
    }
  }
}
</script>