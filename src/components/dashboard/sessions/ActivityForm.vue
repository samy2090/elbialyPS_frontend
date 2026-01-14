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
        <!-- Device Field -->
        <div class="form-field">
          <label class="field-label">
            <svg class="label-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="5" y="2" width="14" height="20" rx="2" stroke="currentColor" stroke-width="2"/>
              <path d="M12 18H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            Device
            <span class="field-hint" style="font-weight: normal;">(Optional - for chillout activities without device)</span>
          </label>
          <select 
            v-model="form.device_id" 
            class="form-input"
          >
            <option value="">No device (Chillout activity)</option>
            <option v-for="device in availableDevices" :key="device.id" :value="device.id">
              {{ device.name }} ({{ device.type }})
              <span v-if="device.status === 'in_use'"> - In Use</span>
            </option>
          </select>
          <small v-if="!devices.length" class="field-hint">Loading devices...</small>
          <small v-else-if="form.device_id" class="field-hint" style="color: #10b981;">
            Playing activity - Customer will use a device
          </small>
          <small v-else class="field-hint" style="color: #f59e0b;">
            Chillout activity - Customer will have drinks/snacks only
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
            Select whether this is a single or multi-player activity
          </small>
        </div>

        <!-- Duration Field (Only shown when device is selected) -->
        <div class="form-field" v-if="form.device_id">
          <label class="field-label">
            <svg class="label-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <polyline points="12,6 12,12 16,14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Activity Duration (Optional)
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
import { ref, onMounted, computed, watch } from 'vue'
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
    
    // Duration options from 0.5 to 3 hours, incrementing by 0.5
    const durationOptions = computed(() => {
      const options = []
      for (let hours = 0.5; hours <= 3; hours += 0.5) {
        options.push(hours)
      }
      return options
    })
    
    // Format duration for display (H:MM minutes format)
    const formatDuration = (hours) => {
      if (hours === null || hours === undefined || hours === '') {
        return null
      }

      const hoursNum = parseFloat(hours)
      if (isNaN(hoursNum)) {
        return null
      }

      const hoursInt = Math.floor(hoursNum)
      const minutes = Math.round((hoursNum - hoursInt) * 60)
      
      // Handle edge case where minutes round to 60
      const finalHours = minutes >= 60 ? hoursInt + 1 : hoursInt
      const finalMinutes = minutes >= 60 ? 0 : minutes

      return `${finalHours}:${String(finalMinutes).padStart(2, '0')} minutes`
    }
    
    const form = ref({
      device_id: '',
      mode: 'single',
      started_at: getCurrentDateTime(),
      duration_hours: '',
      status: 'active'
    })
    
    // Watch device_id to clear duration_hours and reset mode when device is removed
    watch(() => form.value.device_id, (newDeviceId) => {
      if (!newDeviceId) {
        form.value.duration_hours = ''
        form.value.mode = 'single'
      }
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
        form.value.device_id = props.activity.device_id || props.activity.device?.id || ''
        form.value.mode = props.activity.mode || 'single'
        form.value.started_at = props.activity.started_at ? convertToDatetimeLocal(props.activity.started_at) : getCurrentDateTime()
        form.value.status = props.activity.status || 'active'
        form.value.duration_hours = ''
      } else {
        // For new activities, start time will be set by backend to current time
        form.value.started_at = ''
        form.value.status = 'active'
        form.value.duration_hours = ''
      }
    })
    
    const handleSubmit = async () => {
      try {
        sessionStore.clearError()
        
        // Validate and convert session ID
        console.log('ActivityForm: Validating session ID:', {
          sessionId: props.sessionId,
          sessionIdType: typeof props.sessionId,
          isNull: props.sessionId === null,
          isUndefined: props.sessionId === undefined,
          isZero: props.sessionId === 0,
          isNaN: isNaN(Number(props.sessionId))
        })
        
        if (!props.sessionId || props.sessionId === 0 || props.sessionId === null || props.sessionId === undefined) {
          sessionStore.error = 'Invalid session ID. Please select a valid session.'
          console.error('Invalid sessionId - missing or zero:', props.sessionId)
          return
        }
        
        // Convert to number
        const sessionIdNum = Number(props.sessionId)
        
        // Validate session ID is a valid positive integer
        if (isNaN(sessionIdNum) || sessionIdNum <= 0 || !Number.isInteger(sessionIdNum)) {
          sessionStore.error = `Invalid session ID: ${props.sessionId}. Please select a valid session.`
          console.error('Invalid sessionId after conversion:', {
            original: props.sessionId,
            converted: sessionIdNum,
            type: typeof sessionIdNum,
            isInteger: Number.isInteger(sessionIdNum)
          })
          return
        }
        
        console.log('ActivityForm: Session ID validated:', {
          sessionId: sessionIdNum,
          sessionIdType: typeof sessionIdNum,
          isInteger: Number.isInteger(sessionIdNum)
        })
        
        // Determine type based on device selection (like SessionForm)
        const type = form.value.device_id ? 'playing' : 'chillout'
        
        const submitData = {
          session_id: sessionIdNum, // Send as integer for Laravel exists validation
          type: type, // 'playing' or 'chillout' based on device selection
          mode: String(form.value.mode || 'single').toLowerCase().trim(),
          status: form.value.status || 'active',
        }
        
        // Add activity_type: 'device_use' when device is selected (for playing type)
        if (form.value.device_id) {
          submitData.activity_type = 'device_use'
          submitData.device_id = Number(form.value.device_id)
        }
        // For chillout (no device), activity_type is nullable so we don't send it
        
        // Add duration field at root level (backend expects this to calculate ended_at)
        if (form.value.duration_hours && form.value.duration_hours !== '') {
          submitData.duration = parseFloat(form.value.duration_hours)
          console.log('Sending duration to backend:', {
            duration_hours: form.value.duration_hours,
            duration: submitData.duration
          })
        }
        
        // For new activities, don't send started_at - backend sets it to current time
        // For editing, allow changing started_at
        if (isEditing.value && form.value.started_at) {
          submitData.started_at = convertToApiFormat(form.value.started_at)
        }
        
        console.log('ActivityForm: Submitting data:', {
          sessionId: sessionIdNum,
          sessionIdType: typeof sessionIdNum,
          isEditing: isEditing.value,
          submitData
        })
        
        if (isEditing.value) {
          // Editing existing activity
          await sessionStore.updateActivity(sessionIdNum, props.activity.id, submitData)
          emit('activity-updated')
        } else {
          // Creating new activity
          console.log('Creating activity with:', {
            sessionId: sessionIdNum,
            submitData,
            url: `/api/sessions/${sessionIdNum}/activities`
          })
          await sessionStore.createActivity(sessionIdNum, submitData)
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
      durationOptions,
      formatDuration,
      handleSubmit
    }
  }
}
</script>


