<template>
  <div class="date-range-picker" :class="customClass">
    <div class="date-picker-wrapper">
      <!-- Toggle Button -->
      <button 
        ref="triggerRef"
        @click="togglePicker" 
        class="date-picker-trigger"
        :class="{ 'active': isOpen, 'has-value': hasValue }"
        :disabled="disabled"
      >
        <div class="trigger-content">
          <svg class="trigger-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
            <path d="M3 10H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M8 2V6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M16 2V6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <span class="trigger-text">
            <span v-if="!startDate && !endDate" class="placeholder">{{ placeholder }}</span>
            <span v-else-if="startDate && !endDate" class="date-display">
              {{ formatDate(startDate) }}
            </span>
            <span v-else-if="startDate && endDate && startDate === endDate" class="date-display">
              {{ formatDate(startDate) }}
            </span>
            <span v-else class="date-display">
              {{ formatDate(startDate) }} - {{ formatDate(endDate) }}
            </span>
          </span>
        </div>
        <div class="trigger-glow"></div>
        <div class="trigger-pulse"></div>
      </button>

      <!-- Date Picker Dropdown -->
      <Teleport to="body">
        <Transition name="date-picker-fade">
          <div 
            v-if="isOpen" 
            class="date-picker-dropdown" 
            :style="dropdownStyle"
            @click.stop
            ref="dropdownRef"
            :class="{ 'positioned': dropdownStyle.top }"
          >
            <div class="dropdown-header">
              <h3 class="dropdown-title">{{ title }}</h3>
              <button @click="clearDates" class="clear-btn" v-if="startDate || endDate">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                  <path d="M15 9L9 15M9 9L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                Clear
              </button>
            </div>

            <div class="date-picker-content">
              <!-- Mode Toggle -->
              <div class="mode-toggle" v-if="allowModeToggle">
                <button 
                  @click="mode = 'single'" 
                  class="mode-btn"
                  :class="{ 'active': mode === 'single' }"
                >
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                    <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                  Single Date
                </button>
                <button 
                  @click="mode = 'range'" 
                  class="mode-btn"
                  :class="{ 'active': mode === 'range' }"
                >
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
                    <path d="M3 10H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <path d="M8 2V6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <path d="M16 2V6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                  Date Range
                </button>
              </div>

              <!-- Custom Calendar Component -->
              <FuturisticCalendar
                v-if="showCalendar"
                :model-value="singleDateInput || startDateInput"
                :range-start="mode === 'range' ? startDateInput : null"
                :range-end="mode === 'range' ? endDateInput : null"
                :min-date="minDate"
                :max-date="maxDate"
                :mode="mode"
                @update:model-value="handleCalendarSelect"
                @select="handleCalendarSelect"
                @range-start="handleRangeStart"
                @range-end="handleRangeEnd"
              />

              <!-- Fallback: Native Date Inputs (for browsers that need it) -->
              <div v-else class="native-date-inputs">
                <!-- Single Date Mode -->
                <div v-if="mode === 'single'" class="single-date-picker">
                  <div class="date-input-group">
                    <label class="date-label">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
                        <path d="M3 10H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                      </svg>
                      Select Date
                    </label>
                    <input 
                      type="date" 
                      v-model="singleDateInput"
                      @change="handleSingleDateChange"
                      class="date-input"
                      :max="maxDate"
                      :min="minDate"
                    />
                  </div>
                </div>

                <!-- Range Date Mode -->
                <div v-else class="range-date-picker">
                  <div class="date-input-group">
                    <label class="date-label">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
                        <path d="M3 10H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                      </svg>
                      Start Date
                    </label>
                    <input 
                      type="date" 
                      v-model="startDateInput"
                      @change="handleStartDateChange"
                      class="date-input"
                      :max="endDateInput || maxDate"
                      :min="minDate"
                    />
                  </div>
                  <div class="date-separator">
                    <div class="separator-line"></div>
                    <svg class="separator-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <div class="separator-line"></div>
                  </div>
                  <div class="date-input-group">
                    <label class="date-label">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
                        <path d="M3 10H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                      </svg>
                      End Date
                    </label>
                    <input 
                      type="date" 
                      v-model="endDateInput"
                      @change="handleEndDateChange"
                      class="date-input"
                      :max="maxDate"
                      :min="startDateInput || minDate"
                    />
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="date-picker-actions" v-if="!autoApply">
                <button @click="applyDates" class="apply-btn" :disabled="!canApply">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  {{ applyButtonText }}
                </button>
                <button @click="cancelPicker" class="cancel-btn">
                  {{ cancelButtonText }}
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>
    </div>

    <!-- Backdrop -->
    <Teleport to="body">
      <Transition name="backdrop-fade">
        <div v-if="isOpen" class="date-picker-backdrop" @click="closePicker"></div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import FuturisticCalendar from './FuturisticCalendar.vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ startDate: null, endDate: null })
  },
  minDate: {
    type: String,
    default: null
  },
  maxDate: {
    type: String,
    default: () => {
      const today = new Date()
      return today.toISOString().split('T')[0]
    }
  },
  placeholder: {
    type: String,
    default: 'Select Date'
  },
  title: {
    type: String,
    default: 'Select Date Range'
  },
  applyButtonText: {
    type: String,
    default: 'Apply Filter'
  },
  cancelButtonText: {
    type: String,
    default: 'Cancel'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  autoApply: {
    type: Boolean,
    default: false
  },
  allowModeToggle: {
    type: Boolean,
    default: true
  },
  defaultMode: {
    type: String,
    default: 'single',
    validator: (value) => ['single', 'range'].includes(value)
  },
  customClass: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const isOpen = ref(false)
const mode = ref(props.defaultMode)
const startDate = ref(props.modelValue?.startDate || null)
const endDate = ref(props.modelValue?.endDate || null)
const startDateInput = ref(startDate.value || '')
const endDateInput = ref(endDate.value || '')
const singleDateInput = ref(startDate.value || '')

// Use custom calendar by default, fallback to native inputs if needed
const showCalendar = ref(true)

// Dropdown positioning
const dropdownRef = ref(null)
const triggerRef = ref(null)
const dropdownStyle = ref({})

// Computed
const hasValue = computed(() => {
  return !!(startDate.value || endDate.value)
})

const canApply = computed(() => {
  if (mode.value === 'single') {
    return !!singleDateInput.value
  } else {
    return !!startDateInput.value && !!endDateInput.value
  }
})

// Methods
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date)
}

const togglePicker = () => {
  if (props.disabled) return
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    nextTick(() => calculateDropdownPosition())
  }
}

const calculateDropdownPosition = () => {
  const trigger = triggerRef.value || document.querySelector('.date-picker-trigger')
  if (!trigger) return

  const rect = trigger.getBoundingClientRect()
  const vw = window.innerWidth
  const vh = window.innerHeight
  const gap = 8
  const margin = 16

  // Fixed max height so dropdown always scrolls when needed (viewport coords only)
  // Calendar needs: header(60) + toggle(50) + cal-header(50) + weekdays(20) + days(6*32+10=202) + footer(50) + padding(36) + gaps(30) ≈ 498px
  const maxH = Math.min(520, Math.floor(vh * 0.85))
  const maxW = Math.min(400, vw - margin * 2)

  let top = rect.bottom + gap
  const spaceBelow = vh - rect.bottom - gap - margin
  const spaceAbove = rect.top - gap - margin

  // Prefer above trigger so it sits higher on screen; else below
  if (spaceAbove >= maxH && (spaceAbove >= spaceBelow || spaceBelow < 280)) {
    top = rect.top - maxH - gap
  } else if (spaceBelow < 280 && spaceAbove >= 200) {
    top = rect.top - maxH - gap
  }

  // Clamp vertical position so dropdown stays in viewport
  if (top < margin) top = margin
  if (top + maxH > vh - margin) top = Math.max(margin, vh - margin - maxH)

  let left = rect.left
  if (left + maxW > vw - margin) left = vw - maxW - margin
  if (left < margin) left = margin

  const isMobile = vw < 768
  const width = isMobile ? `calc(100vw - ${margin * 2}px)` : undefined
  if (isMobile) {
    left = margin
  }
  dropdownStyle.value = {
    position: 'fixed',
    top: `${top}px`,
    left: `${left}px`,
    width,
    maxWidth: isMobile ? undefined : `${maxW}px`,
    maxHeight: `${maxH}px`,
    zIndex: 10000,
    /* Ensure dropdown can scroll */
    overflowY: 'auto',
    overflowX: 'hidden'
  }
}

const closePicker = () => {
  isOpen.value = false
}

const handleCalendarSelect = (dateStr) => {
  if (mode.value === 'single') {
    singleDateInput.value = dateStr
    startDate.value = dateStr
    endDate.value = null
    if (props.autoApply) {
      applyDates()
    }
  }
}

const handleRangeStart = (dateStr) => {
  startDateInput.value = dateStr
  startDate.value = dateStr
  endDateInput.value = ''
  endDate.value = null
}

const handleRangeEnd = (dateStr) => {
  endDateInput.value = dateStr
  endDate.value = dateStr
  if (props.autoApply) {
    applyDates()
  }
}

const handleSingleDateChange = () => {
  if (singleDateInput.value) {
    startDate.value = singleDateInput.value
    endDate.value = null
    if (props.autoApply) {
      applyDates()
    }
  }
}

const handleStartDateChange = () => {
  if (startDateInput.value) {
    startDate.value = startDateInput.value
    if (endDateInput.value && endDateInput.value < startDateInput.value) {
      endDateInput.value = ''
      endDate.value = null
    }
    if (props.autoApply && endDateInput.value) {
      applyDates()
    }
  }
}

const handleEndDateChange = () => {
  if (endDateInput.value) {
    endDate.value = endDateInput.value
    if (startDateInput.value && startDateInput.value > endDateInput.value) {
      startDateInput.value = ''
      startDate.value = null
    }
    if (props.autoApply && startDateInput.value) {
      applyDates()
    }
  }
}

const applyDates = () => {
  if (mode.value === 'single') {
    if (singleDateInput.value) {
      startDate.value = singleDateInput.value
      endDate.value = null
    }
  } else {
    startDate.value = startDateInput.value || null
    endDate.value = endDateInput.value || null
  }

  const dateRange = {
    startDate: startDate.value,
    endDate: endDate.value
  }

  emit('update:modelValue', dateRange)
  emit('change', dateRange)
  closePicker()
}

const clearDates = () => {
  startDate.value = null
  endDate.value = null
  startDateInput.value = ''
  endDateInput.value = ''
  singleDateInput.value = ''

  const dateRange = {
    startDate: null,
    endDate: null
  }

  emit('update:modelValue', dateRange)
  emit('change', dateRange)
}

const cancelPicker = () => {
  startDateInput.value = startDate.value || ''
  endDateInput.value = endDate.value || ''
  singleDateInput.value = startDate.value || ''
  closePicker()
}

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    startDate.value = newValue.startDate || null
    endDate.value = newValue.endDate || null
    startDateInput.value = startDate.value || ''
    endDateInput.value = endDate.value || ''
    singleDateInput.value = startDate.value || ''
  }
}, { deep: true })

// Watch for open state: position on open, resize listener only (no scroll – dropdown is fixed)
watch(() => isOpen.value, (open) => {
  if (open) {
    nextTick(() => {
      calculateDropdownPosition()
      window.addEventListener('resize', calculateDropdownPosition)
    })
  } else {
    window.removeEventListener('resize', calculateDropdownPosition)
  }
})

// Close on outside click
const handleClickOutside = (event) => {
  if (!isOpen.value) return
  if (event.target.closest('.date-range-picker') || event.target.closest('.date-picker-dropdown')) return
  closePicker()
}

// Handle escape key
const handleEscape = (event) => {
  if (event.key === 'Escape' && isOpen.value) {
    closePicker()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleEscape)
  window.removeEventListener('resize', calculateDropdownPosition)
})
</script>

<style scoped>
.date-range-picker {
  position: relative;
  display: inline-block;
}

.date-picker-wrapper {
  position: relative;
}

/* Trigger Button */
.date-picker-trigger {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%);
  border: 2px solid rgba(139, 92, 246, 0.3);
  border-radius: 12px;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  min-width: 220px;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.1);
}

.date-picker-trigger:hover:not(:disabled) {
  border-color: rgba(139, 92, 246, 0.5);
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%);
  box-shadow: 0 6px 20px rgba(139, 92, 246, 0.2);
  transform: translateY(-1px);
}

.date-picker-trigger.active {
  border-color: rgba(139, 92, 246, 0.6);
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%);
  box-shadow: 0 8px 25px rgba(139, 92, 246, 0.3);
}

.date-picker-trigger.has-value {
  border-color: rgba(139, 92, 246, 0.5);
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%);
}

.date-picker-trigger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.trigger-content {
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 2;
  position: relative;
}

.trigger-icon {
  width: 20px;
  height: 20px;
  color: var(--primary-purple);
  filter: drop-shadow(0 0 4px rgba(139, 92, 246, 0.5));
  transition: transform 0.3s ease;
}

.date-picker-trigger:hover:not(:disabled) .trigger-icon {
  transform: rotate(5deg) scale(1.1);
}

.trigger-text {
  display: flex;
  align-items: center;
}

.placeholder {
  color: var(--text-secondary);
  font-style: italic;
}

.date-display {
  color: var(--text-primary);
  font-weight: 500;
}

.trigger-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 0;
  height: 0;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%);
  transition: width 0.4s ease, height 0.4s ease;
  pointer-events: none;
}

.date-picker-trigger:hover:not(:disabled) .trigger-glow {
  width: 200px;
  height: 200px;
}

.date-picker-trigger.active .trigger-glow {
  width: 250px;
  height: 250px;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%);
}

.trigger-pulse {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, transparent 100%);
  opacity: 0;
  animation: pulse 2s infinite;
  pointer-events: none;
}

.date-picker-trigger.active .trigger-pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0;
  }
  50% {
    opacity: 0.3;
  }
}

/* Dropdown – scrollable container; max-height set via inline style */
.date-picker-dropdown {
  position: fixed;
  z-index: 10000;
  min-width: 360px;
  width: max-content;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%);
  border: 2px solid rgba(139, 92, 246, 0.3);
  border-radius: 16px;
  padding: 18px;
  backdrop-filter: blur(20px);
  box-shadow: 
    0 25px 70px rgba(0, 0, 0, 0.6),
    0 0 50px rgba(139, 92, 246, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  animation: dropdownSlide 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow-y: auto;
  overflow-x: hidden;
  transform-origin: top left;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  scrollbar-color: rgba(139, 92, 246, 0.5) rgba(139, 92, 246, 0.1);
}

.date-picker-dropdown::-webkit-scrollbar {
  width: 8px;
}

.date-picker-dropdown::-webkit-scrollbar-track {
  background: rgba(139, 92, 246, 0.1);
  border-radius: 10px;
}

.date-picker-dropdown::-webkit-scrollbar-thumb {
  background: rgba(139, 92, 246, 0.5);
  border-radius: 10px;
  transition: background 0.3s ease;
}

.date-picker-dropdown::-webkit-scrollbar-thumb:hover {
  background: rgba(139, 92, 246, 0.7);
}

.date-picker-dropdown.positioned {
  animation: dropdownSlidePositioned 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes dropdownSlide {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes dropdownSlidePositioned {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(139, 92, 246, 0.2);
}

.dropdown-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 30px rgba(139, 92, 246, 0.5);
}

.clear-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  color: #ef4444;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.clear-btn svg {
  width: 14px;
  height: 14px;
}

/* Mode Toggle */
.mode-toggle {
  display: flex;
  gap: 8px;
  margin-bottom: 14px;
  background: rgba(255, 255, 255, 0.03);
  padding: 3px;
  border-radius: 10px;
  border: 1px solid rgba(139, 92, 246, 0.2);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

.mode-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  background: transparent;
  border: none;
  border-radius: 7px;
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.mode-btn:hover {
  color: var(--text-primary);
  background: rgba(139, 92, 246, 0.1);
}

.mode-btn.active {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(168, 85, 247, 0.25) 100%);
  color: var(--primary-purple);
  border: 1px solid rgba(139, 92, 246, 0.5);
  box-shadow: 
    0 4px 12px rgba(139, 92, 246, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.mode-btn svg {
  width: 14px;
  height: 14px;
  transition: transform 0.3s ease;
}

.mode-btn.active svg {
  transform: scale(1.05);
  filter: drop-shadow(0 0 3px rgba(139, 92, 246, 0.6));
}

/* Date Inputs (Fallback) */
.date-picker-content {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-height: 0; /* Allow flex child to shrink and enable scrolling */
  overflow: visible;
  flex: 1;
  /* Ensure content doesn't get clipped */
  min-width: 0;
  width: 100%;
}

.native-date-inputs {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.single-date-picker,
.range-date-picker {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.date-input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.date-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
}

.date-label svg {
  width: 16px;
  height: 16px;
  color: var(--primary-purple);
}

.date-input {
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(139, 92, 246, 0.2);
  border-radius: 10px;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  outline: none;
}

.date-input:focus {
  border-color: rgba(139, 92, 246, 0.5);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1), 0 4px 12px rgba(139, 92, 246, 0.2);
}

.date-input::-webkit-calendar-picker-indicator {
  filter: invert(1);
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.date-input::-webkit-calendar-picker-indicator:hover {
  opacity: 1;
}

.date-separator {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 5px 0;
}

.separator-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(139, 92, 246, 0.3) 50%, transparent 100%);
}

.separator-icon {
  width: 20px;
  height: 20px;
  color: var(--primary-purple);
  filter: drop-shadow(0 0 4px rgba(139, 92, 246, 0.5));
}

/* Actions */
.date-picker-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
  padding-top: 12px;
  border-top: 1px solid rgba(139, 92, 246, 0.2);
}

.apply-btn,
.cancel-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 16px;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.apply-btn {
  background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);
}

.apply-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.apply-btn:hover:not(:disabled)::before {
  left: 100%;
}

.apply-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(139, 92, 246, 0.5);
}

.apply-btn:active:not(:disabled) {
  transform: translateY(0);
}

.apply-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.apply-btn svg {
  width: 16px;
  height: 16px;
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  color: var(--text-secondary);
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
  color: var(--text-primary);
  transform: translateY(-1px);
}

/* Backdrop */
.date-picker-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
}

/* Transitions */
.date-picker-fade-enter-active,
.date-picker-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.date-picker-fade-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

.date-picker-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

.backdrop-fade-enter-active,
.backdrop-fade-leave-active {
  transition: opacity 0.3s ease;
}

.backdrop-fade-enter-from,
.backdrop-fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .date-picker-dropdown {
    min-width: calc(100vw - 40px) !important;
    max-width: calc(100vw - 40px) !important;
    width: calc(100vw - 40px) !important;
    padding: 20px;
  }

  .date-picker-trigger {
    min-width: 100%;
  }
}

/* Ensure dropdown is visible and properly positioned */
.date-picker-dropdown {
  will-change: transform, opacity;
}
</style>
