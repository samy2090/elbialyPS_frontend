<template>
  <div class="device-form">
    <form @submit.prevent="handleSubmit" class="form-body">
      <!-- Device Name -->
      <div class="form-group">
        <label for="name" class="form-label">Device Name *</label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          class="form-input"
          placeholder="Enter device name"
          required
          :class="{ error: errors.name }"
        />
        <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
      </div>

      <!-- Device Type -->
      <div class="form-group">
        <label for="type" class="form-label">Device Type *</label>
        <select
          id="type"
          v-model="form.type"
          class="form-input"
          required
          :class="{ error: errors.type }"
        >
          <option value="">Select device type</option>
          <option value="ps5">PlayStation 5</option>
          <option value="ps4">PlayStation 4</option>
          <option value="billiards">Billiards Table</option>
          <option value="computer">Computer</option>
          <option value="other">Other</option>
        </select>
        <span v-if="errors.type" class="error-message">{{ errors.type }}</span>
      </div>

      <!-- Device Status -->
      <div class="form-group">
        <label for="status" class="form-label">Status</label>
        <select
          id="status"
          v-model="form.status"
          class="form-input"
          required
        >
          <option value="">Select status</option>
          <option value="available">Available</option>
          <option value="in_use">In Use</option>
          <option value="maintenance">Maintenance</option>
          <option value="inactive">Inactive</option>
        </select>
        <span v-if="errors.status" class="error-message">{{ errors.status }}</span>
      </div>

      <!-- Description -->
      <div class="form-group">
        <label for="description" class="form-label">Description</label>
        <textarea
          id="description"
          v-model="form.description"
          class="form-input"
          rows="3"
          placeholder="Enter device description (optional)"
        ></textarea>
      </div>

      <!-- Price per Hour -->
      <div class="form-group">
        <label for="price_per_hour" class="form-label">Price per Hour *</label>
        <input
          id="price_per_hour"
          v-model="form.price_per_hour"
          type="number"
          min="0"
          step="0.01"
          class="form-input"
          placeholder="Enter price per hour"
          required
          :class="{ error: errors.price_per_hour }"
        />
        <span v-if="errors.price_per_hour" class="error-message">{{ errors.price_per_hour }}</span>
      </div>

      <!-- Multi Price per Hour -->
      <div class="form-group">
        <label for="multi_price_per_hour" class="form-label">Multi Player Price per Hour</label>
        <input
          id="multi_price_per_hour"
          v-model="form.multi_price_per_hour"
          type="number"
          min="0"
          step="0.01"
          class="form-input"
          placeholder="Enter multi player price per hour"
        />
      </div>

      <!-- Form Actions -->
      <div class="form-actions">
        <button type="button" @click="$emit('close')" class="action-btn secondary">
          Cancel
        </button>
        <button type="submit" :disabled="loading" class="action-btn primary">
          <span v-if="loading" class="loading-spinner"></span>
          {{ isEditing ? 'Update Device' : 'Create Device' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import { useDeviceStore } from '@/stores/deviceStore'

const props = defineProps({
  device: {
    type: Object,
    default: null
  },
  isEditing: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'success'])

const deviceStore = useDeviceStore()
const loading = ref(false)
const errors = reactive({})

const form = reactive({
  name: '',
  type: '',
  status: 'available',
  description: '',
  price_per_hour: 0,
  multi_price_per_hour: 0
})

// Initialize form
const initializeForm = () => {
  if (props.device && props.isEditing) {
    // Map backend field names to form field names
    form.name = props.device.name || ''
    form.type = props.device.device_type || props.device.type || ''
    form.status = props.device.status || (props.device.active ? 'available' : 'inactive') || 'available'
    form.description = props.device.description || ''
    form.price_per_hour = props.device.price_per_hour || 0
    form.multi_price_per_hour = props.device.multi_price || props.device.multi_price_per_hour || 0
  } else {
    // Reset form for new device
    form.name = ''
    form.type = ''
    form.status = 'available'
    form.description = ''
    form.price_per_hour = 0
    form.multi_price_per_hour = 0
  }
  clearErrors()
}

const clearErrors = () => {
  Object.keys(errors).forEach(key => {
    delete errors[key]
  })
}

const validateForm = () => {
  clearErrors()
  let isValid = true

  // Required fields
  if (!form.name.trim()) {
    errors.name = 'Device name is required'
    isValid = false
  }

  if (!form.type) {
    errors.type = 'Device type is required'
    isValid = false
  }

  if (!form.status) {
    errors.status = 'Status is required'
    isValid = false
  }

  // Price validation
  if (form.price_per_hour <= 0) {
    errors.price_per_hour = 'Price per hour must be greater than 0'
    isValid = false
  }

  if (form.multi_price_per_hour < 0) {
    errors.multi_price_per_hour = 'Multi player price cannot be negative'
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) return

  loading.value = true

  try {
    // Map form fields to backend field names
    const deviceData = {
      name: form.name,
      device_type: form.type,
      description: form.description,
      price_per_hour: form.price_per_hour,
      multi_price: form.multi_price_per_hour || null,
      status: form.status
    }

    if (props.isEditing) {
      await deviceStore.updateDevice(props.device.id, deviceData)
      emit('success', `Device "${deviceData.name}" updated successfully!`)
    } else {
      await deviceStore.createDevice(deviceData)
      emit('success', `Device "${deviceData.name}" created successfully!`)
    }
  } catch (error) {
    console.error('Error saving device:', error)
    // Handle specific validation errors from server
    if (error.response?.data?.errors) {
      Object.assign(errors, error.response.data.errors)
    }
  } finally {
    loading.value = false
  }
}

// Watch for prop changes
watch(() => props.device, initializeForm, { immediate: true })

onMounted(() => {
  initializeForm()
})
</script>

<style scoped>
.device-form {
  width: 100%;
}

.form-body {
  padding: 0;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #8b5cf6;
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.form-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.form-input.error {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.05);
}

.form-input.error:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

select.form-input {
  cursor: pointer;
}

select.form-input option {
  background: rgba(15, 15, 23, 0.95);
  color: rgba(255, 255, 255, 0.9);
}

textarea.form-input {
  resize: vertical;
  min-height: 80px;
}

.error-message {
  display: block;
  margin-top: 0.5rem;
  color: #ef4444;
  font-size: 0.875rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1.5rem;
  padding-bottom: 1rem; /* Extra bottom padding to ensure buttons are visible */
  border-top: 1px solid rgba(255, 255, 255, 0.1);
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
  font-size: 0.875rem;
  position: relative;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.action-btn.primary {
  background: linear-gradient(135deg, #8b5cf6, #06b6d4);
  color: white;
}

.action-btn.primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #7c3aed, #0891b2);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
}

.action-btn.secondary {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.action-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.9);
}

.loading-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .form-actions {
    flex-direction: column;
  }
  
  .action-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>