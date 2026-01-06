<template>
  <div class="session-form-container">
    <div class="form-card large">
      <div class="form-header large">
        <h2 class="form-title">{{ isEditing ? 'Edit Session' : 'Create New Session' }}</h2>
        <p class="form-subtitle">{{ isEditing ? 'Update session information' : 'Create a new gaming session' }}</p>
      </div>

      <!-- Error Alert -->
      <div v-if="sessionStore.error" class="error-alert">
        <div class="alert-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
            <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>
        <span class="alert-message">{{ sessionStore.error }}</span>
      </div>

      <!-- Success Alert -->
      <div v-if="successMessage" class="success-alert">
        <div class="alert-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <polyline points="9,12 11,14 15,10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span class="alert-message">{{ successMessage }}</span>
      </div>

      <form @submit.prevent="handleSubmit" class="session-form form-container">
        <!-- Customer Field -->
        <div class="form-field">
          <label class="field-label">
            <svg class="label-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
            </svg>
            Customer
            <span class="required">*</span>
          </label>
          <div class="customer-search-wrapper">
            <input 
              v-model="customerSearchQuery"
              @input="handleCustomerSearch"
              @focus="showCustomerDropdown = true"
              @blur="handleCustomerBlur"
              type="text"
              class="form-input"
              :class="{ 'has-selection': selectedCustomer }"
              placeholder="Type to search customers..."
              required
              autocomplete="off"
            />
            <div v-if="customerSearchLoading" class="search-loading">
              <div class="loading-spinner small"></div>
            </div>
            <div 
              v-if="showCustomerDropdown && (customerSearchResults.length > 0 || customerSearchQuery.length > 0)"
              class="customer-dropdown"
            >
              <div 
                v-if="customerSearchLoading"
                class="dropdown-item loading-item"
              >
                <div class="loading-spinner small"></div>
                <span>Searching...</span>
              </div>
              <div 
                v-else-if="customerSearchResults.length === 0 && customerSearchQuery.length > 0 && canCreateNewCustomer"
                class="dropdown-item create-new-customer"
                @mousedown.prevent="createAndSelectCustomer"
              >
                <svg class="create-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                  <path d="M12 8V16M8 12H16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <span>Create new customer: <strong>{{ customerSearchQuery.trim() }}</strong></span>
              </div>
              <div 
                v-else-if="customerSearchResults.length === 0 && customerSearchQuery.length > 0 && !canCreateNewCustomer"
                class="dropdown-item no-results"
              >
                No customers found
              </div>
              <div
                v-for="customer in customerSearchResults"
                :key="customer.id"
                @mousedown.prevent="selectCustomer(customer)"
                class="dropdown-item"
                :class="{ 'selected': form.customer_id === customer.id }"
              >
                <div class="customer-info">
                  <span class="customer-name">{{ customer.name }}</span>
                  <span class="customer-email">{{ customer.email }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Device Field (Optional) -->
        <div class="form-field">
          <label class="field-label">
            <svg class="label-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="5" y="2" width="14" height="20" rx="2" stroke="currentColor" stroke-width="2"/>
              <path d="M12 18H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            Device
            <span class="field-hint" style="font-weight: normal;">(Optional - for chillout sessions without device)</span>
          </label>
          <select 
            v-model="form.device_id" 
            class="form-input"
          >
            <option value="">No device (Chillout session)</option>
            <option v-for="device in availableDevices" :key="device.id" :value="device.id">
              {{ device.name }} ({{ device.type }})
            </option>
          </select>
          <small v-if="!devices.length" class="field-hint">Loading devices...</small>
          <small v-else-if="form.device_id" class="field-hint" style="color: #10b981;">
            Playing session - Customer will use a device
          </small>
          <small v-else class="field-hint" style="color: #f59e0b;">
            Chillout session - Customer will have drinks/snacks only
          </small>
        </div>

        <!-- Mode Field (Only shown when device is selected) -->
        <div class="form-field" v-if="form.device_id">
          <label class="field-label">
            <svg class="label-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
              <path d="M9 9H15M9 15H15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            Mode
          </label>
          <select 
            v-model="form.mode" 
            class="form-input"
          >
            <option value="single">Single</option>
            <option value="multi">Multi</option>
          </select>
          <small class="field-hint">
            Select whether this is a single or multi-player session
          </small>
        </div>

        <!-- Duration Field (Only shown when device is selected) -->
        <div class="form-field" v-if="form.device_id">
          <label class="field-label">
            <svg class="label-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <polyline points="12,6 12,12 16,14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Session Duration (Optional)
          </label>
          <select 
            v-model="form.duration_hours" 
            class="form-input"
          >
            <option value="">No limit</option>
            <option v-for="hours in durationOptions" :key="hours" :value="hours">
              {{ formatDuration(hours) }}
            </option>
          </select>
          <small class="field-hint">
            Select how long the customer will use the device (0.5 to 3 hours)
          </small>
        </div>

        <!-- Started At Field (Auto-set to current time for new sessions) -->
        <div class="form-field" v-if="isEditing">
          <label class="field-label">
            <svg class="label-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <polyline points="12,6 12,12 16,14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Started At
          </label>
          <input 
            v-model="form.started_at" 
            type="datetime-local" 
            class="form-input"
            :disabled="!isEditing"
          />
          <small v-if="!isEditing" class="field-hint">Session will start at the current time when created</small>
        </div>

        <!-- Status Field -->
        <div class="form-field">
          <label class="field-label">
            <svg class="label-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <polyline points="9,12 11,14 15,10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Status
          </label>
          <select 
            v-model="form.status" 
            class="form-input"
          >
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="ended">Ended</option>
          </select>
        </div>

        <!-- Price and Discount Row (only shown when status is "ended") -->
        <div class="form-row" v-if="form.status === 'ended'">
          <div class="form-field">
            <label class="field-label">
              <svg class="label-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2V22M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Total Price
            </label>
            <input 
              v-model="form.total_price" 
              type="number" 
              step="0.01"
              min="0"
              class="form-input" 
              placeholder="0.00"
            />
          </div>

          <div class="form-field">
            <label class="field-label">
              <svg class="label-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2V22M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Discount
            </label>
            <input 
              v-model="form.discount" 
              type="number" 
              step="0.01"
              min="0"
              class="form-input" 
              placeholder="0.00"
            />
          </div>
        </div>

        <!-- Form Actions -->
        <div class="form-actions">
          <button 
            type="submit" 
            class="action-btn primary"
            :disabled="sessionStore.loading"
          >
            <svg v-if="!sessionStore.loading" class="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 21L5 21C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3L16 3L21 8V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M17 21V13H7V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M7 3V8H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <div v-else class="loading-spinner"></div>
            {{ sessionStore.loading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Session' : 'Create Session') }}
          </button>
          <button 
            type="button" 
            class="action-btn secondary" 
            @click="$emit('cancel')"
          >
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, watch } from 'vue'
import { useSessionStore } from '@/stores/sessionStore'
import { useUserStore } from '@/stores/userStore'
import { useDeviceStore } from '@/stores/deviceStore'
import { useAuthStore } from '@/stores/auth'
import UserService from '@/api/users'

export default {
  name: 'SessionForm',
  props: {
    session: {
      type: Object,
      default: null
    }
  },
  emits: ['session-created', 'session-updated', 'cancel'],
  setup(props, { emit }) {
    const sessionStore = useSessionStore()
    const userStore = useUserStore()
    const deviceStore = useDeviceStore()
    const authStore = useAuthStore()
    
    const isEditing = ref(!!props.session)
    const users = ref([])
    const devices = ref([])
    
    // Customer search state
    const customerSearchQuery = ref('')
    const customerSearchResults = ref([])
    const customerSearchLoading = ref(false)
    const showCustomerDropdown = ref(false)
    const selectedCustomer = ref(null)
    const creatingCustomer = ref(false)
    const successMessage = ref('')
    let searchDebounceTimer = null
    
    // Filter available devices (those not in use in active activities)
    const availableDevices = computed(() => {
      return devices.value.filter(device => {
        // For now, show all devices - backend will validate availability
        // You can enhance this by checking device status
        return device.status === 'available' || device.status === 'in_use'
      })
    })
    
    // Duration options from 0.5 to 3 hours, incrementing by 0.5
    const durationOptions = computed(() => {
      const options = []
      for (let hours = 0.5; hours <= 3; hours += 0.5) {
        options.push(hours)
      }
      return options
    })
    
    // Format duration for display
    const formatDuration = (hours) => {
      if (hours === 0.5) {
        return '30 minutes'
      } else if (hours === 1) {
        return '1 hour'
      } else {
        return `${hours} hours`
      }
    }
    
    // Calculate ended_at based on started_at and duration_hours
    const calculateEndDate = (durationHours) => {
      if (!durationHours) {
        return null
      }
      
      try {
        // For new sessions, use current time (backend will set started_at to current time)
        // For editing, use the started_at from the form
        let startDate
        if (isEditing.value && form.value.started_at) {
          startDate = new Date(form.value.started_at)
        } else {
          // For new sessions, backend sets started_at to current time, so we use current time too
          startDate = new Date()
        }
        
        // Add the duration hours (convert to milliseconds)
        const endDate = new Date(startDate.getTime() + (parseFloat(durationHours) * 60 * 60 * 1000))
        
        // Convert to API format (Y-m-d H:i:s)
        const year = endDate.getFullYear()
        const month = String(endDate.getMonth() + 1).padStart(2, '0')
        const day = String(endDate.getDate()).padStart(2, '0')
        const hours = String(endDate.getHours()).padStart(2, '0')
        const minutes = String(endDate.getMinutes()).padStart(2, '0')
        const seconds = String(endDate.getSeconds()).padStart(2, '0')
        
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
      } catch (error) {
        console.error('Error calculating end date:', error)
        return null
      }
    }
    
    // Get current date/time in format YYYY-MM-DDTHH:mm for datetime-local input
    const getCurrentDateTime = () => {
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      return `${year}-${month}-${day}T${hours}:${minutes}`
    }
    
    // Convert API datetime to datetime-local format
    const convertToDatetimeLocal = (dateString) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      return `${year}-${month}-${day}T${hours}:${minutes}`
    }
    
    // Convert datetime-local to API format (Y-m-d H:i:s)
    const convertToApiFormat = (datetimeLocal) => {
      if (!datetimeLocal) return null
      const date = new Date(datetimeLocal)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    }
    
    const form = ref({
      customer_id: '',
      device_id: '',
      started_at: getCurrentDateTime(),
      status: 'active',
      total_price: '',
      discount: '',
      duration_hours: '',
      mode: 'single'
    })
    
    // Load users for customer dropdown
    const loadUsers = async () => {
      try {
        await userStore.fetchUsers()
        users.value = userStore.getUsers || []
      } catch (error) {
        console.error('Failed to load users:', error)
        users.value = []
      }
    }
    
    // Check if a customer with the same name (case-insensitive) exists
    const customerNameExists = (name) => {
      if (!name || name.trim().length === 0) return false
      
      const searchName = name.toLowerCase().trim()
      const allUsers = users.value.length > 0 ? users.value : (userStore.getUsers || [])
      
      return allUsers.some(user => {
        const userName = user.name?.toLowerCase().trim()
        return userName === searchName
      })
    }
    
    // Computed property to check if we can create a new customer
    const canCreateNewCustomer = computed(() => {
      if (!customerSearchQuery.value || customerSearchQuery.value.trim().length === 0) {
        return false
      }
      
      // Only allow creation if no customer with the same name exists (case-insensitive)
      return !customerNameExists(customerSearchQuery.value)
    })
    
    // Search customers with debouncing (local filtering for performance)
    const searchCustomers = async (query) => {
      if (!query || query.trim().length === 0) {
        customerSearchResults.value = []
        return
      }
      
      customerSearchLoading.value = true
      
      // Use setTimeout to allow UI to update before filtering
      setTimeout(() => {
        try {
          // Filter customers locally (case-insensitive partial match)
          const searchLower = query.toLowerCase().trim()
          const allUsers = users.value.length > 0 ? users.value : (userStore.getUsers || [])
          
          customerSearchResults.value = allUsers.filter(user => {
            const nameMatch = user.name?.toLowerCase().includes(searchLower)
            const emailMatch = user.email?.toLowerCase().includes(searchLower)
            return nameMatch || emailMatch
          })
        } catch (error) {
          console.error('Failed to search customers:', error)
          customerSearchResults.value = []
        } finally {
          customerSearchLoading.value = false
        }
      }, 50) // Small delay to show loading state
    }
    
    // Debounced search handler
    const handleCustomerSearch = () => {
      // Clear existing timer
      if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer)
      }
      
      // If query is empty, clear results
      if (!customerSearchQuery.value || customerSearchQuery.value.trim().length === 0) {
        customerSearchResults.value = []
        selectedCustomer.value = null
        form.value.customer_id = ''
        showCustomerDropdown.value = false
        return
      }
      
      // Show dropdown when user starts typing
      showCustomerDropdown.value = true
      
      // Set new timer for debounced search
      searchDebounceTimer = setTimeout(() => {
        searchCustomers(customerSearchQuery.value)
      }, 300) // 300ms debounce delay
    }
    
    // Select customer from dropdown
    const selectCustomer = (customer) => {
      selectedCustomer.value = customer
      form.value.customer_id = customer.id
      customerSearchQuery.value = customer.name
      customerSearchResults.value = []
      showCustomerDropdown.value = false
    }
    
    // Handle blur event (with delay to allow click on dropdown items)
    const handleCustomerBlur = () => {
      // Delay hiding dropdown to allow click events on dropdown items
      setTimeout(() => {
        showCustomerDropdown.value = false
      }, 200)
    }
    
    // Create new customer and select it
    const createAndSelectCustomer = async () => {
      const customerName = customerSearchQuery.value.trim()
      
      if (!customerName || customerName.length === 0) {
        return
      }
      
      // Double-check that customer doesn't exist (case-insensitive)
      if (customerNameExists(customerName)) {
        sessionStore.error = 'A customer with this name already exists'
        return
      }
      
      creatingCustomer.value = true
      customerSearchLoading.value = true
      
      try {
        // Create new guest customer with name and role="guest" only
        const newCustomerData = {
          name: customerName,
          role: 'guest'
        }
        
        // Use the guest user endpoint which only requires name and role
        const response = await UserService.createGuestUser(newCustomerData)
        const newCustomer = response.data || response.user || response
        
        // Refresh users list from store to include the new customer
        await loadUsers()
        
        // Ensure we have the new customer with all its properties
        const createdCustomer = users.value.find(u => u.id === newCustomer.id) || newCustomer
        
        // Select the newly created customer
        selectedCustomer.value = createdCustomer
        form.value.customer_id = createdCustomer.id
        customerSearchQuery.value = createdCustomer.name
        customerSearchResults.value = []
        showCustomerDropdown.value = false
        
        // Show success message
        successMessage.value = `Customer "${customerName}" created successfully`
        setTimeout(() => {
          successMessage.value = ''
        }, 3000)
        
      } catch (error) {
        console.error('Failed to create customer:', error)
        sessionStore.error = error.message || 'Failed to create customer'
      } finally {
        creatingCustomer.value = false
        customerSearchLoading.value = false
      }
    }
    
    // Load devices for device dropdown
    const loadDevices = async () => {
      try {
        await deviceStore.fetchDevices()
        devices.value = deviceStore.getDevices || []
      } catch (error) {
        console.error('Failed to load devices:', error)
        devices.value = []
      }
    }
    
    // Watch device_id to clear duration_hours and reset mode when device is removed
    watch(() => form.value.device_id, (newDeviceId) => {
      if (!newDeviceId) {
        form.value.duration_hours = ''
        form.value.mode = 'single'
      }
    })
    
    // Populate form if editing existing session
    onMounted(async () => {
      await Promise.all([loadUsers(), loadDevices()])
      
      if (props.session) {
        const customerId = props.session.customer_id || props.session.customer?.id || ''
        form.value.customer_id = customerId
        
        // Set selected customer name if editing
        if (customerId) {
          const customer = users.value.find(u => u.id === customerId)
          if (customer) {
            selectedCustomer.value = customer
            customerSearchQuery.value = customer.name
          }
        }
        
        form.value.device_id = props.session.device_id || (props.session.activities?.[0]?.device_id) || (props.session.activities?.[0]?.device?.id) || ''
        form.value.started_at = props.session.started_at ? convertToDatetimeLocal(props.session.started_at) : getCurrentDateTime()
        form.value.status = props.session.status || 'active'
        form.value.total_price = props.session.total_price || ''
        form.value.discount = props.session.discount || ''
        form.value.duration_hours = ''
        form.value.mode = props.session.activities?.[0]?.mode || 'single'
      }
    })
    
    const handleSubmit = async () => {
      try {
        sessionStore.clearError()
        
        // Validate required fields for creation
        if (!isEditing.value) {
          if (!form.value.customer_id) {
            sessionStore.error = 'Please select a customer'
            return
          }
          // Device is now optional - session can be "chillout" without device
        }
        
        // Determine session type based on device selection
        const sessionType = form.value.device_id ? 'playing' : 'chillout'
        
        // Prepare submit data
        const submitData = {
          customer_id: Number(form.value.customer_id),
          status: form.value.status || 'active',
        }
        
        // For new sessions, started_at will be set by backend to current time
        // The backend will also create the first activity automatically
        if (isEditing.value) {
          // When editing, allow changing started_at
          if (form.value.started_at) {
            submitData.started_at = convertToApiFormat(form.value.started_at)
          }
        }
        // When creating new session, don't send started_at - backend sets it to current time
        
        // Add device_id if selected (optional)
        if (form.value.device_id) {
          submitData.device_id = Number(form.value.device_id)
        }
        
        // Add duration field at root level (backend expects this to calculate ended_at)
        if (form.value.duration_hours && form.value.duration_hours !== '') {
          submitData.duration = parseFloat(form.value.duration_hours)
          console.log('Sending duration to backend:', {
            duration_hours: form.value.duration_hours,
            duration: submitData.duration
          })
        }
        
        // Add activity data for the first activity (only when creating)
        // Note: Backend only extracts mode from activity_data, then discards it
        // The duration field above is used by backend to calculate ended_at
        if (!isEditing.value) {
          submitData.activity_data = {
            activity_type: sessionType,
            device_id: form.value.device_id ? Number(form.value.device_id) : null,
            mode: form.value.mode || 'single',
          }
        }
        
        // Add created_by if creating new session
        if (!isEditing.value && authStore.user) {
          submitData.created_by = authStore.user.id
        }
        
        // Add optional fields only if they have values
        if (form.value.total_price) {
          submitData.total_price = parseFloat(form.value.total_price)
        }
        if (form.value.discount) {
          submitData.discount = parseFloat(form.value.discount)
        }
        
        // Debug: Log the data being sent
        console.log('Submitting session data:', JSON.stringify(submitData, null, 2))
        
        if (isEditing.value) {
          // Editing existing session
          await sessionStore.updateSession(props.session.id, submitData)
          emit('session-updated')
        } else {
          // Creating new session
          await sessionStore.createSession(submitData)
          emit('session-created')
        }
      } catch (error) {
        console.error('Failed to save session:', error)
      }
    }
    
    return {
      form,
      isEditing,
      sessionStore,
      users,
      devices,
      availableDevices,
      durationOptions,
      formatDuration,
      handleSubmit,
      customerSearchQuery,
      customerSearchResults,
      customerSearchLoading,
      showCustomerDropdown,
      selectedCustomer,
      canCreateNewCustomer,
      creatingCustomer,
      successMessage,
      handleCustomerSearch,
      selectCustomer,
      handleCustomerBlur,
      createAndSelectCustomer
    }
  }
}
</script>

