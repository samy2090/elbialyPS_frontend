<template>
  <div class="devices-content">
    <!-- Header Section -->
    <div class="devices-header">
      <div class="header-info">
        <h1 class="section-title">Devices Management</h1>
        <p class="section-subtitle">Manage your platform devices and their configurations</p>
      </div>
      <div class="header-actions">
        <button @click="showCreateModal = true" class="action-btn primary">
          <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5V19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Add New Device
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
      <!-- Devices List Tab -->
      <div v-if="activeTab === 'list'" class="devices-list-content">
        <!-- Loading State -->
        <div v-if="deviceStore.loading && !devicesLoaded" class="loading-state">
          <div class="loading-spinner">
            <div class="spinner"></div>
          </div>
          <p class="loading-text">Loading devices...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="deviceStore.error && !devicesLoaded" class="error-state">
          <div class="error-card">
            <div class="error-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
                <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <h3 class="error-title">Error Loading Devices</h3>
            <p class="error-message">{{ deviceStore.error }}</p>
            <button @click="loadDevices" class="action-btn secondary">
              <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 4V10H7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M23 20V14H17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14L18.36 18.36A9 9 0 0 1 3.51 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Retry
            </button>
          </div>
        </div>

        <!-- Devices Table/Cards -->
        <div v-else class="devices-display">
          <!-- Desktop Table View -->
          <div class="devices-table-container desktop-only">
            <div class="table-card">
              <table class="devices-table">
                <thead>
                  <tr>
                    <th>Device</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Last Seen</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="device in deviceStore.getDevices" :key="device.id" class="device-row">
                    <td>
                      <div class="device-info">
                        <div class="device-avatar">
                          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" stroke-width="2"/>
                            <path d="M6 8H18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            <path d="M6 12H14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            <path d="M6 16H10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                          </svg>
                        </div>
                        <div class="device-details">
                          <span class="device-name">{{ device.name || 'Unknown Device' }}</span>
                          <span class="device-id">ID: {{ device.id }}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="device-type">{{ device.type || 'Unknown' }}</span>
                    </td>
                    <td>
                      <span :class="['status-badge', getStatusClass(device.active)]">
                        {{ getStatusText(device.active) }}
                      </span>
                    </td>
                    <td>
                      <span class="last-seen">{{ formatDate(device.lastSeen) }}</span>
                    </td>
                    <td>
                      <div class="action-buttons">
                        <button 
                          @click="viewDevice(device)" 
                          class="action-btn small secondary"
                          title="View Device"
                        >
                          <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" stroke-width="2"/>
                            <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                          </svg>
                        </button>
                        <button 
                          @click="editDevice(device)" 
                          class="action-btn small primary"
                          title="Edit Device"
                        >
                          <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          </svg>
                        </button>
                        <button 
                          @click="confirmDeleteDevice(device)" 
                          class="action-btn small danger"
                          title="Delete Device"
                        >
                          <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <polyline points="3,6 5,6 21,6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
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
          <div class="devices-cards-container mobile-only">
            <div v-for="device in deviceStore.getDevices" :key="device.id" class="device-card">
              <div class="device-card-header">
                <div class="device-info">
                  <div class="device-avatar">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" stroke-width="2"/>
                      <path d="M6 8H18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                      <path d="M6 12H14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                      <path d="M6 16H10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                  </div>
                  <div class="device-details">
                    <h3 class="device-name">{{ device.name || 'Unknown Device' }}</h3>
                    <p class="device-id">ID: {{ device.id }}</p>
                  </div>
                </div>
                <div class="device-status">
                  <span :class="['status-badge', getStatusClass(device.active)]">
                    {{ getStatusText(device.active) }}
                  </span>
                </div>
              </div>
              
              <div class="device-card-body">
                <div class="device-meta">
                  <span class="device-type">{{ device.type || 'Unknown' }}</span>
                  <span class="device-last-seen">{{ formatDate(device.lastSeen) }}</span>
                </div>
              </div>
              
              <div class="device-card-actions">
                <button @click="viewDevice(device)" class="action-btn small secondary">
                  <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" stroke-width="2"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  View
                </button>
                <button @click="editDevice(device)" class="action-btn small primary">
                  <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  Edit
                </button>
                <button @click="confirmDeleteDevice(device)" class="action-btn small danger">
                  <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <polyline points="3,6 5,6 21,6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="deviceStore.getDevices.length === 0" class="empty-state">
            <div class="empty-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" stroke-width="2"/>
                <path d="M6 8H18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <path d="M6 12H14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <path d="M6 16H10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
            <h3>No Devices Found</h3>
            <p>You haven't added any devices yet. Create your first device to get started.</p>
            <button @click="showCreateModal = true" class="action-btn primary">
              <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5V19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Add Your First Device
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Device Form Modal -->
    <div v-if="showCreateModal || showEditModal" class="modal-overlay" @click="closeModals">
      <div class="modal-content" @click.stop>
        <DeviceForm
          :device="editingDevice"
          :is-editing="showEditModal"
          @close="closeModals"
          @success="onDeviceSuccess"
        />
      </div>
    </div>

    <!-- Device View Modal -->
    <div v-if="showViewModal" class="modal-overlay" @click="closeViewModal">
      <div class="modal-content large" @click.stop>
        <div class="modal-header">
          <h2>Device Details</h2>
          <button @click="closeViewModal" class="close-btn">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div v-if="viewingDevice" class="device-details-view">
            <div class="detail-group">
              <label>Device Name</label>
              <span>{{ viewingDevice.name || 'Unknown Device' }}</span>
            </div>
            <div class="detail-group">
              <label>Device ID</label>
              <span>{{ viewingDevice.id }}</span>
            </div>
            <div class="detail-group">
              <label>Type</label>
              <span>{{ viewingDevice.type || 'Unknown' }}</span>
            </div>
            <div class="detail-group">
              <label>Status</label>
              <span :class="['status-badge', getStatusClass(viewingDevice.active)]">
                {{ getStatusText(viewingDevice.active) }}
              </span>
            </div>
            <div class="detail-group">
              <label>Last Seen</label>
              <span>{{ formatDate(viewingDevice.lastSeen) }}</span>
            </div>
            <div class="detail-group">
              <label>Description</label>
              <span>{{ viewingDevice.description || 'No description available' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="closeDeleteModal">
      <div class="modal-content small" @click.stop>
        <div class="modal-header">
          <h2>Delete Device</h2>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to delete the device "{{ deletingDevice?.name }}"?</p>
          <p class="warning-text">This action cannot be undone.</p>
        </div>
        <div class="modal-actions">
          <button @click="closeDeleteModal" class="action-btn secondary">Cancel</button>
          <button @click="deleteDevice" class="action-btn danger">Delete Device</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDeviceStore } from '@/stores/deviceStore'
import DeviceForm from '@/components/dashboard/devices/DeviceForm.vue'

// Store
const deviceStore = useDeviceStore()

// Reactive state
const activeTab = ref('list')
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showViewModal = ref(false)
const showDeleteModal = ref(false)
const showSuccess = ref(false)
const successMessage = ref('')
const editingDevice = ref(null)
const viewingDevice = ref(null)
const deletingDevice = ref(null)
const devicesLoaded = ref(false)

// Computed
const tabs = computed(() => [
  { id: 'list', label: 'All Devices' }
])

// Methods
const loadDevices = async () => {
  try {
    await deviceStore.fetchDevices()
    devicesLoaded.value = true
  } catch (error) {
    console.error('Error loading devices:', error)
    devicesLoaded.value = true // Set to true to show error state instead of loading
  }
}

const showSuccessMessage = (message) => {
  successMessage.value = message
  showSuccess.value = true
  setTimeout(() => {
    showSuccess.value = false
  }, 5000)
}

const closeModals = () => {
  showCreateModal.value = false
  showEditModal.value = false
  editingDevice.value = null
}

const closeViewModal = () => {
  showViewModal.value = false
  viewingDevice.value = null
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  deletingDevice.value = null
}

const editDevice = (device) => {
  editingDevice.value = { ...device }
  showEditModal.value = true
}

const viewDevice = (device) => {
  viewingDevice.value = device
  showViewModal.value = true
}

const confirmDeleteDevice = (device) => {
  deletingDevice.value = device
  showDeleteModal.value = true
}

const deleteDevice = async () => {
  if (deletingDevice.value) {
    try {
      await deviceStore.deleteDevice(deletingDevice.value.id)
      showSuccessMessage(`Device "${deletingDevice.value.name}" deleted successfully!`)
      closeDeleteModal()
    } catch (error) {
      console.error('Error deleting device:', error)
      // Show error message to user
      showSuccessMessage(`Failed to delete device: ${error.message || 'Unknown error'}`)
      closeDeleteModal()
    }
  }
}

const onDeviceSuccess = async (message) => {
  showSuccessMessage(message)
  closeModals()
  try {
    await loadDevices()
  } catch (error) {
    console.error('Error reloading devices after success:', error)
  }
}

const getStatusClass = (active) => {
  return active ? 'status-online' : 'status-offline'
}

const getStatusText = (active) => {
  return active ? 'Active' : 'Inactive'
}

const formatDate = (date) => {
  if (!date) return 'Never'
  return new Date(date).toLocaleDateString()
}

// Lifecycle
onMounted(() => {
  loadDevices()
})

defineEmits(['device-selected', 'device-created', 'device-updated'])
</script>

<style scoped>
/* Reuse the existing styles from UsersSection.vue */
.devices-content {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.devices-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 1rem;
}

.header-info h1 {
  font-size: 2rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 0.5rem;
}

.header-info p {
  color: rgba(255, 255, 255, 0.6);
  font-size: 1rem;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
}

.action-btn.primary {
  background: linear-gradient(135deg, #8b5cf6, #06b6d4);
  color: white;
}

.action-btn.secondary {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.action-btn.danger {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}

.action-btn.small {
  padding: 0.5rem;
  font-size: 0.875rem;
}

.action-btn .icon {
  width: 1rem;
  height: 1rem;
}

.success-notification {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.success-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: #10b981;
}

.section-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.tab-btn {
  padding: 1rem 1.5rem;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 600;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.3s ease;
}

.tab-btn.active {
  color: #8b5cf6;
  border-bottom-color: #8b5cf6;
}

.loading-state, .error-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.loading-spinner .spinner {
  width: 3rem;
  height: 3rem;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top: 3px solid #8b5cf6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.table-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  overflow: hidden;
  backdrop-filter: blur(20px);
}

.devices-table {
  width: 100%;
  border-collapse: collapse;
}

.devices-table th {
  background: rgba(255, 255, 255, 0.05);
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.devices-table td {
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.device-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.device-avatar {
  width: 2.5rem;
  height: 2.5rem;
  background: rgba(139, 92, 246, 0.1);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8b5cf6;
}

.device-avatar svg {
  width: 1.25rem;
  height: 1.25rem;
}

.device-details {
  display: flex;
  flex-direction: column;
}

.device-name {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.device-id {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.5);
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-online {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.status-offline {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.status-maintenance {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.status-unknown {
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
  border: 1px solid rgba(107, 114, 128, 0.3);
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.device-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  backdrop-filter: blur(20px);
}

.device-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.device-card-body {
  margin-bottom: 1rem;
}

.device-meta {
  display: flex;
  gap: 1rem;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
}

.device-card-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: rgba(15, 15, 23, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  backdrop-filter: blur(20px);
}

.modal-content.large {
  max-width: 800px;
}

.modal-content.small {
  max-width: 400px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h2 {
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
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

.modal-body {
  padding: 1.5rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.device-details-view {
  display: grid;
  gap: 1.5rem;
}

.detail-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-group label {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
}

.detail-group span {
  color: rgba(255, 255, 255, 0.9);
}

.warning-text {
  color: #ef4444;
  font-size: 0.875rem;
}

.desktop-only {
  display: block;
}

.mobile-only {
  display: none;
}

@media (max-width: 768px) {
  .devices-content {
    padding: 1rem;
  }
  
  .devices-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .desktop-only {
    display: none;
  }
  
  .mobile-only {
    display: block;
  }
  
  .modal-content {
    margin: 1rem;
    max-width: none;
  }
}
</style>