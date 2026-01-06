<template>
  <div class="activity-form-container">
    <div class="form-card large">
      <div class="form-header large">
        <h2 class="form-title">{{ isEditing ? 'Edit Activity' : 'Create New Activity' }}</h2>
        <p class="form-subtitle">{{ isEditing ? 'Update activity information' : 'Create a new activity for this session' }}</p>
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

      <form @submit.prevent="handleSubmit" class="activity-form form-container">
        <!-- Activity Type Field -->
        <div class="form-field">
          <label class="field-label">
            <svg class="label-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" stroke-width="2"/>
              <path d="M3 10H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            Activity Type
            <span class="required">*</span>
          </label>
          <select 
            v-model="form.activity_type" 
            class="form-input"
            required
            @change="onActivityTypeChange"
          >
            <option value="playing">Playing (with device)</option>
            <option value="chillout">Chillout (drinks/snacks only)</option>
          </select>
          <small class="field-hint">
            <span v-if="form.activity_type === 'playing'">Customer will use a device</span>
            <span v-else>Customer will have drinks/snacks only</span>
          </small>
        </div>

        <!-- Device Field (Required for playing type) -->
        <div class="form-field">
          <label class="field-label">
            <svg class="label-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="5" y="2" width="14" height="20" rx="2" stroke="currentColor" stroke-width="2"/>
              <path d="M12 18H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            Device
            <span v-if="form.activity_type === 'playing'" class="required">*</span>
          </label>
          <select 
            v-model="form.device_id" 
            class="form-input"
            :required="form.activity_type === 'playing'"
            :disabled="form.activity_type === 'chillout'"
          >
            <option value="">{{ form.activity_type === 'chillout' ? 'No device needed' : 'Select a device' }}</option>
            <option v-for="device in availableDevices" :key="device.id" :value="device.id">
              {{ device.name }} ({{ device.type }})
              <span v-if="device.status === 'in_use'"> - In Use</span>
            </option>
          </select>
          <small v-if="form.activity_type === 'chillout'" class="field-hint">No device needed for chillout activities</small>
          <small v-else-if="form.activity_type === 'playing' && !form.device_id" class="field-hint" style="color: #ef4444;">
            Device is required for playing activities
          </small>
        </div>

        <!-- Mode Field -->
        <div class="form-field">
          <label class="field-label">
            <svg class="label-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <circle cx="12" cy="12" r="6" stroke="currentColor" stroke-width="2"/>
              <circle cx="12" cy="12" r="2" fill="currentColor"/>
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
        </div>

        <!-- Started At Field (Auto-set for new activities) -->
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
          <small v-if="!isEditing" class="field-hint">Activity will start at the current time when created</small>
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
            {{ sessionStore.loading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Activity' : 'Create Activity') }}
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
import { ref, onMounted, computed } from 'vue'
import { useSessionStore } from '@/stores/sessionStore'
import { useDeviceStore } from '@/stores/deviceStore'

export default {
  name: 'ActivityForm',
  props: {
    activity: {
      type: Object,
      default: null
    },
    sessionId: {
      type: Number,
      required: true
    }
  },
  emits: ['activity-created', 'activity-updated', 'cancel'],
  setup(props, { emit }) {
    const sessionStore = useSessionStore()
    const deviceStore = useDeviceStore()
    
    const isEditing = ref(!!props.activity)
    const devices = ref([])
    
    // Filter available devices (those not currently in use in active activities)
    const availableDevices = computed(() => {
      return devices.value.filter(device => {
        // Show available devices or those that can be used
        // Backend will validate device availability
        return device.status === 'available' || device.status === 'in_use'
      })
    })
    
    // Handle activity type change
    const onActivityTypeChange = () => {
      // If changing to chillout, clear device selection
      if (form.value.activity_type === 'chillout') {
        form.value.device_id = ''
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
      activity_type: 'playing', // Default to playing
      device_id: '',
      mode: 'single',
      started_at: getCurrentDateTime()
    })
    
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
    
    // Populate form if editing existing activity
    onMounted(async () => {
      await loadDevices()
      
      if (props.activity) {
        form.value.activity_type = props.activity.activity_type || 'playing'
        form.value.device_id = props.activity.device_id || props.activity.device?.id || ''
        form.value.mode = props.activity.mode || 'single'
        form.value.started_at = props.activity.started_at ? convertToDatetimeLocal(props.activity.started_at) : getCurrentDateTime()
      } else {
        // For new activities, start time will be set by backend to current time
        form.value.started_at = ''
      }
    })
    
    const handleSubmit = async () => {
      try {
        sessionStore.clearError()
        
        // Validate session ID
        if (!props.sessionId || props.sessionId === 0) {
          sessionStore.error = 'Invalid session ID. Please select a valid session.'
          console.error('Invalid sessionId:', props.sessionId)
          return
        }
        
        // Validate required fields
        if (form.value.activity_type === 'playing' && !form.value.device_id) {
          sessionStore.error = 'Device is required for playing activities'
          return
        }
        
        // Validate activity_type
        if (!form.value.activity_type || !['playing', 'chillout'].includes(form.value.activity_type)) {
          sessionStore.error = 'Please select a valid activity type'
          return
        }
        
        // Prepare submit data
        // Laravel validation 'exists:sessions,id' typically works with integer
        // Ensure activity_type is lowercase for enum validation
        const submitData = {
          session_id: parseInt(props.sessionId, 10), // Send as integer for Laravel exists validation
          activity_type: String(form.value.activity_type || 'playing').toLowerCase(), // Ensure lowercase
          mode: String(form.value.mode || 'single').toLowerCase(),
        }
        
        console.log('ActivityForm: Preparing submit data', {
          sessionId: props.sessionId,
          sessionIdType: typeof props.sessionId,
          submitDataSessionId: submitData.session_id,
          submitDataSessionIdType: typeof submitData.session_id,
          activity_type: submitData.activity_type,
          activity_typeType: typeof submitData.activity_type
        })
        
        // Add device_id if activity type is playing
        if (form.value.activity_type === 'playing' && form.value.device_id) {
          submitData.device_id = Number(form.value.device_id)
        } else if (form.value.activity_type === 'chillout') {
          // For chillout, ensure no device is set (don't include device_id at all)
          // Don't set device_id to null, just omit it
        }
        
        // For new activities, don't send started_at - backend sets it to current time
        // For editing, allow changing started_at
        if (isEditing.value && form.value.started_at) {
          submitData.started_at = convertToApiFormat(form.value.started_at)
        }
        
        console.log('ActivityForm: Submitting data:', {
          sessionId: props.sessionId,
          isEditing: isEditing.value,
          submitData
        })
        
        if (isEditing.value) {
          // Editing existing activity
          await sessionStore.updateActivity(props.sessionId, props.activity.id, submitData)
          emit('activity-updated')
        } else {
          // Creating new activity
          await sessionStore.createActivity(props.sessionId, submitData)
          emit('activity-created')
        }
      } catch (error) {
        console.error('Failed to save activity:', error)
        // Show more detailed error message
        if (error.response?.data?.errors) {
          const errors = error.response.data.errors
          const errorMessages = Object.entries(errors).map(([field, messages]) => {
            return `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`
          }).join('; ')
          sessionStore.error = errorMessages || error.message || 'Failed to save activity'
        } else {
          sessionStore.error = error.message || 'Failed to save activity'
        }
      }
    }
    
    return {
      form,
      isEditing,
      sessionStore,
      devices,
      availableDevices,
      onActivityTypeChange,
      handleSubmit
    }
  }
}
</script>


