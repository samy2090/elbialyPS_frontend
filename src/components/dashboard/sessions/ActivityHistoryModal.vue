<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="visible" class="activity-history-modal-overlay" @click="handleOverlayClick">
        <div class="activity-history-modal" @click.stop>
          <!-- Modal Header -->
          <div class="modal-header">
            <div class="header-content">
              <div class="header-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="currentColor"/>
                </svg>
              </div>
              <div class="header-text">
                <h2 class="modal-title">Activity History</h2>
                <p class="modal-subtitle">Activity ID: {{ activityId }}</p>
              </div>
            </div>
            <button @click="close" class="close-btn">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="modal-body loading-state">
            <div class="loading-spinner">
              <div class="spinner-ring"></div>
            </div>
            <p>Loading history...</p>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="modal-body error-state">
            <div class="error-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
                <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <p class="error-message">{{ error }}</p>
            <button @click="loadHistory" class="retry-btn">Retry</button>
          </div>

          <!-- History Content -->
          <div v-else-if="historyData" class="modal-body">
            <!-- Total Price Summary -->
            <div class="history-summary">
              <div class="summary-card">
                <div class="summary-label">Total Price</div>
                <div class="summary-value">${{ formatPrice(historyData.total_price) }}</div>
                <div v-if="getActivityDate()" class="summary-date">{{ getActivityDate() }}</div>
              </div>
            </div>

            <!-- History Timeline -->
            <div class="history-timeline">
              <div 
                v-for="(item, index) in historyData.history" 
                :key="index"
                class="timeline-item"
                :class="getItemTypeClass(item.type)"
              >
                <div class="timeline-connector"></div>
                <div class="timeline-content">
                  <div class="timeline-header">
                    <span class="timeline-type-badge" :class="getItemTypeClass(item.type)">
                      {{ formatType(item.type) }}
                    </span>
                    <span v-if="item.type !== 'end' || getEndTime(item)" class="timeline-time">{{ formatTime(item.type === 'end' ? getEndTime(item) : (item.from || item.at)) }}</span>
                    <span v-else class="timeline-time not-ended">Not Ended Yet</span>
                  </div>
                  
                  <div class="timeline-details">
                    <!-- Mode Type -->
                    <div v-if="item.type === 'mode'" class="detail-row">
                      <span class="detail-label">Mode:</span>
                      <span class="detail-value mode-value">{{ item.mode === 'single' ? 'Single' : 'Multi' }} Player</span>
                    </div>
                    
                    <!-- Duration (for mode and paused) -->
                    <div v-if="item.duration_minutes" class="detail-row">
                      <span class="detail-label">Duration:</span>
                      <span class="detail-value">{{ formatDuration(item.duration_minutes) }}</span>
                    </div>
                    
                    <!-- Time Range (for mode and paused) -->
                    <div v-if="item.from && item.to" class="detail-row">
                      <span class="detail-label">Period:</span>
                      <span class="detail-value">
                        {{ formatTime(item.from) }} → {{ formatTime(item.to) }}
                      </span>
                    </div>
                    
                    <!-- Product Type -->
                    <div v-if="item.type === 'product'" class="detail-row">
                      <span class="detail-label">Product:</span>
                      <span class="detail-value">{{ item.product_name }}</span>
                    </div>
                    
                    <div v-if="item.type === 'product' && item.quantity" class="detail-row">
                      <span class="detail-label">Quantity:</span>
                      <span class="detail-value">{{ item.quantity }}</span>
                    </div>
                    
                    <div v-if="item.type === 'product' && item.user_name" class="detail-row">
                      <span class="detail-label">User:</span>
                      <span class="detail-value">{{ item.user_name }}</span>
                    </div>
                    
                    <!-- End Type -->
                    <div v-if="item.type === 'end'" class="detail-row">
                      <span class="detail-label">Ended At:</span>
                      <span v-if="getEndTime(item)" class="detail-value">{{ formatTime(getEndTime(item)) }}</span>
                      <span v-else class="detail-value not-ended-value">Not ended yet</span>
                    </div>
                    
                    <!-- Price -->
                    <div v-if="item.price !== undefined" class="detail-row price-row">
                      <span class="detail-label">Price:</span>
                      <span class="detail-value price-value">${{ formatPrice(item.price) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty state when no data (fallback) -->
          <div v-else class="modal-body empty-state">
            <div class="empty-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 8V16M8 12H16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
            <p class="empty-message">No history data available</p>
            <button @click="loadHistory" class="retry-btn">Retry</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue'
import SessionService from '@/api/sessions'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  sessionId: {
    type: [Number, String],
    required: true
  },
  activityId: {
    type: [Number, String],
    required: true
  },
  activityEndedAt: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['close'])

const loading = ref(false)
const error = ref(null)
const historyData = ref(null)

// Lock body scroll when modal is open
const lockBodyScroll = () => {
  document.body.style.overflow = 'hidden'
}

const unlockBodyScroll = () => {
  document.body.style.overflow = ''
}

// Cleanup on unmount
onUnmounted(() => {
  unlockBodyScroll()
})

const close = () => {
  emit('close')
}

const handleOverlayClick = (e) => {
  if (e.target === e.currentTarget) {
    close()
  }
}

const loadHistory = async () => {
  if (!props.sessionId || !props.activityId) return
  
  loading.value = true
  error.value = null
  
  try {
    const data = await SessionService.getActivityHistory(props.sessionId, props.activityId)
    historyData.value = data
  } catch (err) {
    error.value = err.message || 'Failed to load activity history'
    console.error('Error loading activity history:', err)
  } finally {
    loading.value = false
  }
}

const formatType = (type) => {
  const types = {
    'mode': 'Mode Change',
    'paused': 'Paused',
    'product': 'Product Order',
    'end': 'Ended'
  }
  return types[type] || type.charAt(0).toUpperCase() + type.slice(1)
}

const getItemTypeClass = (type) => {
  return `type-${type}`
}

const formatTime = (timeString) => {
  if (!timeString) return 'N/A'
  // Handle "now" as a special case
  if (timeString === 'now' || timeString.toLowerCase() === 'now') {
    return 'till now'
  }
  try {
    const date = new Date(timeString)
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'till now'
    }
    return date.toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  } catch (error) {
    // If parsing fails, return "till now"
    return 'till now'
  }
}

const formatDate = (timeString) => {
  if (!timeString) return null
  // Handle "now" as a special case - use current date
  if (timeString === 'now' || timeString.toLowerCase() === 'now') {
    const date = new Date()
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  try {
    const date = new Date(timeString)
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return null
    }
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch (error) {
    return null
  }
}

const getEndTime = (item) => {
  if (item.type === 'end') {
    // Use activity's ended_at prop if available, otherwise use item.at from history
    return props.activityEndedAt || item.at || null
  }
  return null
}

const getActivityDate = () => {
  if (!historyData.value || !historyData.value.history || historyData.value.history.length === 0) {
    return null
  }
  // Get date from the first history item
  const firstItem = historyData.value.history[0]
  const timeString = firstItem.from || firstItem.at
  return formatDate(timeString)
}

const formatPrice = (value) => {
  if (value === null || value === undefined) return '0.00'
  return parseFloat(value).toFixed(2)
}

const formatDuration = (minutes) => {
  if (!minutes) return '00:00:00'
  // Convert minutes to total seconds
  const totalSeconds = Math.floor(parseFloat(minutes) * 60)
  const hours = Math.floor(totalSeconds / 3600)
  const mins = Math.floor((totalSeconds % 3600) / 60)
  const secs = totalSeconds % 60
  
  // Format as HH:MM:SS with leading zeros
  const formatNumber = (num) => String(num).padStart(2, '0')
  return `${formatNumber(hours)}:${formatNumber(mins)}:${formatNumber(secs)}`
}

watch(() => props.visible, (newVal) => {
  if (newVal) {
    lockBodyScroll()
    loadHistory()
  } else {
    unlockBodyScroll()
    // Reset state when modal closes
    historyData.value = null
    error.value = null
  }
}, { immediate: true })
</script>

<style scoped>
.activity-history-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(10px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  animation: overlayFadeIn 0.3s ease;
}

@keyframes overlayFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.activity-history-modal {
  background: linear-gradient(135deg, rgba(15, 15, 23, 0.98) 0%, rgba(30, 30, 45, 0.98) 100%);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 24px;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(139, 92, 246, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  animation: modalSlideIn 0.3s ease;
  overflow: hidden;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid rgba(139, 92, 246, 0.2);
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(15, 15, 23, 0.5) 100%);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(168, 85, 247, 0.3) 100%);
  border: 1px solid rgba(139, 92, 246, 0.4);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a855f7;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.2);
}

.header-icon svg {
  width: 24px;
  height: 24px;
}

.header-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
  margin: 0;
  background: linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.8) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.modal-subtitle {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

.close-btn {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(139, 92, 246, 0.5);
  color: #a855f7;
  transform: rotate(90deg);
}

.close-btn svg {
  width: 20px;
  height: 20px;
}

.modal-body {
  padding: 2rem;
  overflow-y: auto;
  flex: 1;
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  gap: 1.5rem;
}

.empty-icon {
  width: 64px;
  height: 64px;
  color: rgba(255, 255, 255, 0.4);
}

.empty-icon svg {
  width: 100%;
  height: 100%;
}

.empty-message {
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
  margin: 0;
}

.loading-spinner {
  position: relative;
  width: 60px;
  height: 60px;
}

.spinner-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 3px solid transparent;
  border-top: 3px solid #a855f7;
  border-right: 3px solid #a855f7;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-icon {
  width: 64px;
  height: 64px;
  color: #ef4444;
}

.error-message {
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
}

.retry-btn {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%);
  border: 1px solid rgba(139, 92, 246, 0.4);
  border-radius: 10px;
  color: #a855f7;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(168, 85, 247, 0.3) 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.history-summary {
  margin-bottom: 2rem;
}

.summary-card {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 16px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 4px 16px rgba(139, 92, 246, 0.2);
}

.summary-label {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.summary-value {
  font-size: 2rem;
  font-weight: 700;
  color: #a855f7;
  text-shadow: 0 0 20px rgba(168, 85, 247, 0.5);
  margin-bottom: 0.5rem;
}

.summary-date {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
  margin-top: 0.5rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(139, 92, 246, 0.2);
}

.history-timeline {
  position: relative;
  padding-left: 2rem;
}

.timeline-item {
  position: relative;
  margin-bottom: 1.5rem;
  padding-left: 2rem;
}

.timeline-item:last-child {
  margin-bottom: 0;
}

.timeline-connector {
  position: absolute;
  left: -1.5rem;
  top: 0;
  bottom: -1.5rem;
  width: 2px;
  background: linear-gradient(180deg, rgba(139, 92, 246, 0.4) 0%, rgba(139, 92, 246, 0.1) 100%);
}

.timeline-item:last-child .timeline-connector {
  display: none;
}

.timeline-content {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1rem 1.25rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.timeline-content::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(180deg, #a855f7 0%, #8b5cf6 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.timeline-content:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(139, 92, 246, 0.4);
  transform: translateX(4px);
}

.timeline-content:hover::before {
  opacity: 1;
}

.timeline-item.type-mode .timeline-content::before {
  background: linear-gradient(180deg, #3b82f6 0%, #2563eb 100%);
}

.timeline-item.type-paused .timeline-content::before {
  background: linear-gradient(180deg, #f59e0b 0%, #d97706 100%);
}

.timeline-item.type-product .timeline-content::before {
  background: linear-gradient(180deg, #10b981 0%, #059669 100%);
}

.timeline-item.type-end .timeline-content::before {
  background: linear-gradient(180deg, #ef4444 0%, #dc2626 100%);
}

.timeline-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.timeline-type-badge {
  padding: 0.375rem 0.75rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border: 1px solid;
}

.timeline-type-badge.type-mode {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.4);
  color: #60a5fa;
}

.timeline-type-badge.type-paused {
  background: rgba(245, 158, 11, 0.2);
  border-color: rgba(245, 158, 11, 0.4);
  color: #fbbf24;
}

.timeline-type-badge.type-product {
  background: rgba(16, 185, 129, 0.2);
  border-color: rgba(16, 185, 129, 0.4);
  color: #34d399;
}

.timeline-type-badge.type-end {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.4);
  color: #f87171;
}

.timeline-time {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  font-family: 'Courier New', monospace;
}

.timeline-time.not-ended {
  color: rgba(245, 158, 11, 0.8);
  font-style: italic;
}

.not-ended-value {
  color: rgba(245, 158, 11, 0.9);
  font-style: italic;
  font-weight: 600;
}

.timeline-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
}

.detail-label {
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
  min-width: 80px;
}

.detail-value {
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
}

.mode-value {
  color: #60a5fa;
}

.price-value {
  color: #a855f7;
  font-size: 1rem;
  font-weight: 700;
}

.price-row {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* Scrollbar Styling */
.modal-body::-webkit-scrollbar {
  width: 8px;
}

.modal-body::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.modal-body::-webkit-scrollbar-thumb {
  background: rgba(139, 92, 246, 0.5);
  border-radius: 4px;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: rgba(139, 92, 246, 0.7);
}

/* Modal Fade Transition */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .activity-history-modal {
    max-width: 100%;
    max-height: 95vh;
    border-radius: 16px;
  }

  .modal-header {
    padding: 1rem 1.5rem;
  }

  .modal-body {
    padding: 1.5rem;
  }

  .header-icon {
    width: 40px;
    height: 40px;
  }

  .modal-title {
    font-size: 1.25rem;
  }

  .summary-value {
    font-size: 1.5rem;
  }

  .history-timeline {
    padding-left: 1.5rem;
  }

  .timeline-item {
    padding-left: 1.5rem;
  }
}
</style>
