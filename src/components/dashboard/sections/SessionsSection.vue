<template>
  <div class="sessions-content">
    <!-- Header Section -->
    <div class="sessions-header">
      <div class="header-info">
        <h1 class="section-title">Sessions Management</h1>
        <p class="section-subtitle">Manage gaming sessions, activities, and users</p>
      </div>
      <div class="header-actions">
        <button @click="showCreateModal = true" class="action-btn primary">
          <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5V19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Add New Session
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

    <!-- Loading State -->
    <div v-if="sessionStore.loading && !sessionsLoaded" class="loading-state">
      <div class="loading-spinner">
        <div class="spinner"></div>
      </div>
      <p class="loading-text">Loading sessions...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="sessionStore.error && !sessionsLoaded" class="error-state">
      <div class="error-card">
        <div class="error-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
            <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>
        <h3 class="error-title">Error Loading Sessions</h3>
        <p class="error-message">{{ sessionStore.error }}</p>
        <button @click="loadSessions" class="action-btn secondary">
          <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 4V10H7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M23 20V14H17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14L18.36 18.36A9 9 0 0 1 3.51 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Retry
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="sessionsLoaded && sessionStore.getSessions.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" stroke-width="2"/>
          <path d="M3 10H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>
      <h3 class="empty-title">No Sessions Found</h3>
      <p class="empty-message">Get started by creating your first gaming session.</p>
      <button @click="showCreateModal = true" class="action-btn primary">
        <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 5V19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Create Your First Session
      </button>
    </div>

    <!-- Sessions Table/Cards -->
    <div v-else-if="sessionStore.getSessions.length > 0" class="sessions-display">
      <!-- Desktop Table View -->
      <div class="sessions-table-container desktop-only">
        <div class="table-card">
          <table class="sessions-table">
            <thead>
              <tr>
                <th>Session</th>
                <th>Customer</th>
                <th>Creator</th>
                <th>Status</th>
                <th>Started At</th>
                <th>Ended At</th>
                <th>Total Price</th>
                <th>Activities</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="session in sessionStore.getSessions" :key="session.id" class="session-row">
                <td>
                  <div class="session-info">
                    <div class="session-avatar">
                      {{ getSessionInitials(session.id) }}
                    </div>
                    <div class="session-details">
                      <button @click="viewSession(session)" class="session-name">
                        Session #{{ session.id }}
                      </button>
                      <span class="session-id">ID: {{ session.id }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="session-customer">{{ session.customer?.name || 'N/A' }}</span>
                </td>
                <td>
                  <span class="session-creator">{{ session.creator?.name || 'N/A' }}</span>
                </td>
                <td>
                  <span :class="getStatusClass(session)" class="status-badge">
                    {{ session.status || 'N/A' }}
                  </span>
                </td>
                <td>
                  <span class="session-date">{{ formatDateTime(session.started_at) }}</span>
                </td>
                <td>
                  <span class="session-date">{{ formatDateTime(session.ended_at) }}</span>
                </td>
                <td>
                  <span class="session-price">${{ parseFloat(session.total_price || 0).toFixed(2) }}</span>
                  <span v-if="session.discount" class="session-discount" style="display: block; font-size: 0.75rem; color: #f59e0b;">
                    Discount: ${{ parseFloat(session.discount || 0).toFixed(2) }}
                  </span>
                </td>
                <td>
                  <span class="activities-count">{{ session.activities?.length || 0 }} activity(ies)</span>
                  <span class="session-type" style="display: block; font-size: 0.75rem; color: #6b7280; margin-top: 0.25rem;">
                    Type: {{ getSessionType(session) }}
                  </span>
                </td>
                <td>
                  <div class="session-actions">
                    <button @click="viewSession(session)" class="action-btn small secondary" title="View Session">
                      <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                      </svg>
                    </button>
                    <button @click="editSession(session)" class="action-btn small primary" title="Edit Session">
                      <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M18.5 2.50023C18.8978 2.10243 19.4374 1.87891 20 1.87891C20.5626 1.87891 21.1022 2.10243 21.5 2.50023C21.8978 2.89804 22.1213 3.43762 22.1213 4.00023C22.1213 4.56284 21.8978 5.10243 21.5 5.50023L12 15.0002L8 16.0002L9 12.0002L18.5 2.50023Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </button>
                    <button v-if="session.status === 'active'" @click="pauseSession(session)" class="action-btn small warning" title="Pause Session">
                      <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="6" y="4" width="4" height="16" fill="currentColor"/>
                        <rect x="14" y="4" width="4" height="16" fill="currentColor"/>
                      </svg>
                    </button>
                    <button v-if="session.status === 'paused'" @click="resumeSession(session)" class="action-btn small success" title="Resume Session">
                      <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <polygon points="5,3 19,12 5,21" fill="currentColor"/>
                      </svg>
                    </button>
                    <button v-if="session.status !== 'ended'" @click="endSession(session)" class="action-btn small danger" title="End Session">
                      <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="6" y="6" width="12" height="12" rx="2" stroke="currentColor" stroke-width="2"/>
                        <path d="M9 9L15 15M15 9L9 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                      </svg>
                    </button>
                    <button @click="deleteSession(session)" :disabled="sessionStore.loading" class="action-btn small danger" title="Delete Session">
                      <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 6H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
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
      <div class="sessions-cards-container mobile-only">
        <div 
          v-for="session in sessionStore.getSessions" 
          :key="session.id" 
          class="session-card"
        >
          <div class="session-card-header">
            <div class="session-avatar">
              {{ getSessionInitials(session.id) }}
            </div>
            <div class="session-info">
              <h3 class="session-name">Session #{{ session.id }}</h3>
              <p class="session-customer">Customer: {{ session.customer?.name || 'N/A' }}</p>
            </div>
          </div>
          <div class="session-card-content">
            <div class="session-badges">
              <span :class="getStatusClass(session)" class="status-badge">
                {{ session.status || 'N/A' }}
              </span>
            </div>
            <div class="session-meta">
              <div class="meta-item">
                <span class="meta-label">Creator:</span>
                <span class="meta-value">{{ session.creator?.name || 'N/A' }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Started:</span>
                <span class="meta-value">{{ formatDateTime(session.started_at) }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Price:</span>
                <span class="meta-value">${{ parseFloat(session.total_price || 0).toFixed(2) }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Activities:</span>
                <span class="meta-value">{{ session.activities?.length || 0 }}</span>
              </div>
            </div>
            <div class="session-actions">
              <button @click="viewSession(session)" class="action-btn small secondary">
                View
              </button>
              <button @click="editSession(session)" class="action-btn small primary">
                Edit
              </button>
              <button v-if="session.status === 'active'" @click="pauseSession(session)" class="action-btn small warning">
                Pause
              </button>
              <button v-if="session.status === 'paused'" @click="resumeSession(session)" class="action-btn small success">
                Resume
              </button>
              <button v-if="session.status !== 'ended'" @click="endSession(session)" class="action-btn small danger">
                End
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Session Detail Modal -->
    <div v-if="selectedSession" class="session-modal-overlay" @click="closeSessionModal">
      <div class="session-modal session-detail-modal" @click.stop>
        <div class="modal-header">
          <h3>Session Details</h3>
          <button @click="closeSessionModal" class="close-btn">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
        </div>
        <div class="modal-content modal-detail-content">
          <div class="modal-session-header">
            <div class="session-avatar large">
              {{ getSessionInitials(selectedSession.id) }}
            </div>
            <div class="modal-session-info">
              <h4>Session #{{ selectedSession.id }}</h4>
              <p>Customer: {{ selectedSession.customer?.name || 'N/A' }}</p>
              <p>Creator: {{ selectedSession.creator?.name || 'N/A' }}</p>
              <div class="session-badges">
                <span :class="getStatusClass(selectedSession)" class="status-badge">
                  {{ selectedSession.status || 'N/A' }}
                </span>
              </div>
            </div>
          </div>

          <div class="modal-details-grid">
            <div class="modal-detail-section">
              <h5 class="modal-section-title">Session Information</h5>
              <div class="modal-detail-card">
                <div class="modal-detail-item">
                  <span class="modal-detail-label">Session ID</span>
                  <span class="modal-detail-value">{{ selectedSession.id }}</span>
                </div>
                <div class="modal-detail-item">
                  <span class="modal-detail-label">Customer</span>
                  <span class="modal-detail-value">{{ selectedSession.customer?.name || 'N/A' }}</span>
                </div>
                <div class="modal-detail-item">
                  <span class="modal-detail-label">Creator</span>
                  <span class="modal-detail-value">{{ selectedSession.creator?.name || 'N/A' }}</span>
                </div>
                <div class="modal-detail-item">
                  <span class="modal-detail-label">Status</span>
                  <span class="modal-detail-value">
                    <span :class="getStatusClass(selectedSession)" class="status-badge">
                      {{ selectedSession.status || 'N/A' }}
                    </span>
                  </span>
                </div>
                <div class="modal-detail-item">
                  <span class="modal-detail-label">Session Type</span>
                  <span class="modal-detail-value">
                    <span class="status-badge" :class="getSessionType(selectedSession) === 'Playing' ? 'status-active' : 'status-paused'">
                      {{ getSessionType(selectedSession) }}
                    </span>
                  </span>
                </div>
                <div class="modal-detail-item">
                  <span class="modal-detail-label">Started At</span>
                  <span class="modal-detail-value">{{ formatDateTime(selectedSession.started_at) }}</span>
                </div>
                <div class="modal-detail-item">
                  <span class="modal-detail-label">Ended At</span>
                  <span class="modal-detail-value">{{ formatDateTime(selectedSession.ended_at) }}</span>
                </div>
                <div class="modal-detail-item">
                  <span class="modal-detail-label">Subtotal (Activities)</span>
                  <span class="modal-detail-value">
                    ${{ parseFloat((selectedSession.total_price || 0) + (selectedSession.discount || 0)).toFixed(2) }}
                  </span>
                </div>
                <div class="modal-detail-item" v-if="selectedSession.discount">
                  <span class="modal-detail-label">Discount</span>
                  <span class="modal-detail-value" style="color: #f59e0b;">
                    -${{ parseFloat(selectedSession.discount || 0).toFixed(2) }}
                  </span>
                </div>
                <div class="modal-detail-item">
                  <span class="modal-detail-label">Total Price</span>
                  <span class="modal-detail-value" style="font-weight: 600; font-size: 1.1rem;">
                    ${{ parseFloat(selectedSession.total_price || 0).toFixed(2) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Activities Section -->
            <div class="modal-detail-section">
              <div class="modal-section-header">
                <h5 class="modal-section-title">Activities ({{ selectedSession.activities?.length || 0 }})</h5>
                <button 
                  v-if="selectedSession && selectedSession.id" 
                  @click="openCreateActivityModal" 
                  class="action-btn small primary"
                  :disabled="!selectedSession || !selectedSession.id"
                >
                  <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5V19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  Add Activity
                </button>
              </div>
              <div class="activities-list">
                <div 
                  v-for="activity in selectedSession.activities || []" 
                  :key="activity.id"
                  class="activity-item"
                >
                  <div class="activity-header">
                    <div class="activity-info">
                      <h6 class="activity-title">{{ activity.device?.name || activity.device_name || (activity.activity_type === 'chillout' ? 'No Device' : 'Unknown Device') }}</h6>
                      <span class="activity-type">
                        {{ activity.activity_type === 'playing' ? 'Playing' : activity.activity_type === 'chillout' ? 'Chillout' : activity.activity_type }}
                        <span v-if="activity.mode"> - {{ activity.mode === 'single' ? 'Single' : 'Multi' }} Player</span>
                      </span>
                    </div>
                    <span :class="getActivityStatusClass(activity)" class="status-badge small">
                      {{ activity.status }}
                    </span>
                  </div>
                  <div class="activity-details">
                    <div class="activity-meta">
                      <span>Started: {{ formatDateTime(activity.started_at) }}</span>
                      <span v-if="activity.ended_at">Ended: {{ formatDateTime(activity.ended_at) }}</span>
                      <span v-if="activity.duration_hours">Duration: {{ activity.duration_hours }}h</span>
                      <span>Price: ${{ parseFloat(activity.total_price || 0).toFixed(2) }}</span>
                    </div>
                    <!-- Activity Users -->
                    <div v-if="activity.activity_users && activity.activity_users.length > 0" class="activity-users">
                      <strong>Users:</strong>
                      <div v-for="au in activity.activity_users" :key="au.id" class="activity-user-item">
                        <span>{{ au.user?.name || 'Unknown' }}</span>
                        <span v-if="au.duration_hours">({{ au.duration_hours }}h)</span>
                        <span v-if="au.cost_share"> - ${{ parseFloat(au.cost_share).toFixed(2) }}</span>
                      </div>
                    </div>
                    <div class="activity-actions">
                      <button @click="viewActivity(activity)" class="action-btn small secondary">View</button>
                      <button @click="editActivity(activity)" class="action-btn small primary">Edit</button>
                      <button 
                        v-if="activity.status !== 'ended'" 
                        @click="changeActivityStatus(activity)"
                        class="action-btn small warning"
                      >
                        Change Status
                      </button>
                      <button 
                        v-if="activity.status !== 'ended'" 
                        @click="endActivity(activity)"
                        class="action-btn small danger"
                      >
                        End
                      </button>
                      <button 
                        v-if="activity.ended_at" 
                        @click="calculateActivityDuration(activity)"
                        class="action-btn small success"
                      >
                        Calculate Duration
                      </button>
                      <button @click="deleteActivity(activity)" class="action-btn small danger">Delete</button>
                    </div>
                  </div>
                </div>
                <div v-if="!selectedSession.activities || selectedSession.activities.length === 0" class="empty-activities">
                  <p>No activities in this session.</p>
                  <button 
                    v-if="selectedSession && selectedSession.id" 
                    @click="openCreateActivityModal" 
                    class="action-btn small primary"
                    style="margin-top: 1rem;"
                  >
                    <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 5V19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Add First Activity
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- End Session Confirmation Modal -->
    <div v-if="showEndSessionModal" class="session-modal-overlay" @click="closeEndSessionModal">
      <div class="session-modal delete-modal" @click.stop>
        <div class="modal-header">
          <h3>End Session</h3>
          <button @click="closeEndSessionModal" class="close-btn">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
        </div>
        <div class="modal-content">
          <div v-if="activeActivitiesCount > 0" class="warning-message">
            <svg class="warning-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M12 8V12M12 16H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <p><strong>Warning: There are {{ activeActivitiesCount }} active activity(ies) in this session.</strong></p>
            <p>Ending the session will also end all active activities at the same time.</p>
            <p class="warning-text">Are you sure you want to proceed?</p>
          </div>
          <div v-else>
            <p>Are you sure you want to end Session #{{ endingSession?.id }}?</p>
          </div>
        </div>
        <div class="modal-actions">
          <button @click="closeEndSessionModal" class="action-btn secondary">Cancel</button>
          <button @click="confirmEndSession" :disabled="sessionStore.loading" class="action-btn danger">
            End Session{{ activeActivitiesCount > 0 ? ' and All Activities' : '' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="session-modal-overlay" @click="closeDeleteModal">
      <div class="session-modal delete-modal" @click.stop>
        <div class="modal-header">
          <h3>Delete Session</h3>
          <button @click="closeDeleteModal" class="close-btn">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
        </div>
        <div class="modal-content">
          <p>Are you sure you want to delete Session #{{ deletingSession?.id }}?</p>
          <p class="warning-text">This action cannot be undone.</p>
        </div>
        <div class="modal-actions">
          <button @click="closeDeleteModal" class="action-btn secondary">Cancel</button>
          <button @click="confirmDeleteSession" :disabled="sessionStore.loading" class="action-btn danger">Delete Session</button>
        </div>
      </div>
    </div>

    <!-- Activity Status Change Modal -->
    <div v-if="showActivityStatusModal && changingActivity" class="session-modal-overlay" @click="closeActivityStatusModal">
      <div class="session-modal" @click.stop>
        <div class="modal-header">
          <h3>Change Activity Status</h3>
          <button @click="closeActivityStatusModal" class="close-btn">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
        </div>
        <div class="modal-content">
          <div class="form-group">
            <label>New Status</label>
            <select v-model="newActivityStatus" class="form-input">
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="ended">Ended</option>
            </select>
          </div>
        </div>
        <div class="modal-actions">
          <button @click="closeActivityStatusModal" class="action-btn secondary">Cancel</button>
          <button @click="confirmChangeActivityStatus" :disabled="sessionStore.loading" class="action-btn primary">Change Status</button>
        </div>
      </div>
    </div>

    <!-- Create/Edit Session Modal -->
    <div v-if="showCreateModal || (showEditModal && editingSession)" class="session-modal-overlay" @click="closeSessionFormModal">
      <div class="session-modal edit-modal" @click.stop>
        <div class="modal-header">
          <h3>{{ editingSession ? 'Edit Session' : 'Create New Session' }}</h3>
          <button @click="closeSessionFormModal" class="close-btn">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
        </div>
        <div class="modal-content">
          <div class="edit-session-container">
            <div class="edit-session-form-section">
              <SessionForm 
                :session="editingSession"
                @session-created="onSessionCreated"
                @session-updated="onSessionUpdated"
                @cancel="closeSessionFormModal"
              />
            </div>
            
            <!-- Activities Section (only shown when editing) -->
            <div v-if="editingSession && editingSession.id" class="edit-session-activities">
              <div class="modal-section-header">
                <h5 class="modal-section-title">Session Activities ({{ editingSession.activities?.length || 0 }})</h5>
                <button 
                  @click="openCreateActivityModalFromEdit" 
                  class="action-btn small primary"
                >
                  <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5V19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  Add New Activity
                </button>
              </div>
              <div class="activities-list">
                <div 
                  v-for="activity in editingSession.activities || []" 
                  :key="activity.id"
                  class="activity-item"
                >
                  <div class="activity-header">
                    <div class="activity-info">
                      <h6 class="activity-title">{{ activity.device?.name || activity.device_name || (activity.activity_type === 'chillout' ? 'No Device' : 'Unknown Device') }}</h6>
                      <span class="activity-type">
                        {{ activity.activity_type === 'playing' ? 'Playing' : activity.activity_type === 'chillout' ? 'Chillout' : activity.activity_type }}
                        <span v-if="activity.mode"> - {{ activity.mode === 'single' ? 'Single' : 'Multi' }} Player</span>
                      </span>
                    </div>
                    <span :class="getActivityStatusClass(activity)" class="status-badge small">
                      {{ activity.status }}
                    </span>
                  </div>
                  <div class="activity-details">
                    <div class="activity-meta">
                      <span>Started: {{ formatDateTime(activity.started_at) }}</span>
                      <span v-if="activity.ended_at">Ended: {{ formatDateTime(activity.ended_at) }}</span>
                      <span v-if="activity.duration_hours">Duration: {{ activity.duration_hours }}h</span>
                      <span>Price: ${{ parseFloat(activity.total_price || 0).toFixed(2) }}</span>
                    </div>
                    <!-- Activity Users -->
                    <div v-if="activity.activity_users && activity.activity_users.length > 0" class="activity-users">
                      <strong>Users:</strong>
                      <div v-for="au in activity.activity_users" :key="au.id" class="activity-user-item">
                        <span>{{ au.user?.name || 'Unknown' }}</span>
                        <span v-if="au.duration_hours">({{ au.duration_hours }}h)</span>
                        <span v-if="au.cost_share"> - ${{ parseFloat(au.cost_share).toFixed(2) }}</span>
                      </div>
                    </div>
                    <div class="activity-actions">
                      <button @click="editActivityFromEditModal(activity)" class="action-btn small primary">Edit</button>
                      <button 
                        v-if="activity.status !== 'ended'" 
                        @click="endActivityFromEditModal(activity)"
                        class="action-btn small danger"
                      >
                        End
                      </button>
                      <button @click="deleteActivityFromEditModal(activity)" class="action-btn small danger">Delete</button>
                    </div>
                  </div>
                </div>
                <div v-if="!editingSession.activities || editingSession.activities.length === 0" class="empty-activities">
                  <p>No activities in this session.</p>
                  <button 
                    @click="openCreateActivityModalFromEdit" 
                    class="action-btn small primary"
                    style="margin-top: 1rem;"
                  >
                    <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 5V19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Add First Activity
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Activity Modal -->
    <div v-if="(showCreateActivityModal && getCurrentSessionId) || (showEditActivityModal && editingActivity)" class="session-modal-overlay" @click="closeActivityFormModal">
      <div class="session-modal edit-modal" @click.stop>
        <div class="modal-header">
          <h3>{{ editingActivity ? 'Edit Activity' : 'Create New Activity' }}</h3>
          <button @click="closeActivityFormModal" class="close-btn">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
        </div>
        <div class="modal-content">
          <ActivityForm 
            v-if="getCurrentSessionId"
            :activity="editingActivity"
            :session-id="getCurrentSessionId"
            @activity-created="onActivityCreated"
            @activity-updated="onActivityUpdated"
            @cancel="closeActivityFormModal"
          />
          <div v-else class="error-alert">
            <p>Error: Invalid session ID. Please close and try again.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="sessionStore.pagination && sessionStore.pagination.last_page > 1" class="pagination-container">
      <div class="pagination-info">
        <span class="pagination-text">
          Showing {{ sessionStore.pagination.from || 0 }} to {{ sessionStore.pagination.to || 0 }} of {{ sessionStore.pagination.total || 0 }} sessions
        </span>
      </div>
      <div class="pagination">
        <button
          @click="goToPage(1)"
          :disabled="sessionStore.pagination.current_page === 1"
          class="pagination-btn"
          title="First Page"
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11 17L6 12L11 7M18 17L13 12L18 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <button
          @click="goToPage(sessionStore.pagination.current_page - 1)"
          :disabled="sessionStore.pagination.current_page === 1"
          class="pagination-btn"
          title="Previous Page"
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

        <template v-if="sessionStore.pagination.last_page <= 7">
          <button
            v-for="page in sessionStore.pagination.last_page"
            :key="page"
            @click="goToPage(page)"
            :class="['pagination-btn', 'pagination-page', { active: page === sessionStore.pagination.current_page }]"
          >
            {{ page }}
          </button>
        </template>
        <template v-else>
          <button
            v-if="sessionStore.pagination.current_page > 3"
            @click="goToPage(1)"
            class="pagination-btn pagination-page"
          >
            1
          </button>
          <span v-if="sessionStore.pagination.current_page > 4" class="pagination-ellipsis">...</span>
          
          <button
            v-for="page in getPageNumbers()"
            :key="page"
            @click="goToPage(page)"
            :class="['pagination-btn', 'pagination-page', { active: page === sessionStore.pagination.current_page }]"
          >
            {{ page }}
          </button>
          
          <span v-if="sessionStore.pagination.current_page < sessionStore.pagination.last_page - 3" class="pagination-ellipsis">...</span>
          <button
            v-if="sessionStore.pagination.current_page < sessionStore.pagination.last_page - 2"
            @click="goToPage(sessionStore.pagination.last_page)"
            class="pagination-btn pagination-page"
          >
            {{ sessionStore.pagination.last_page }}
          </button>
        </template>

        <button
          @click="goToPage(sessionStore.pagination.current_page + 1)"
          :disabled="sessionStore.pagination.current_page === sessionStore.pagination.last_page"
          class="pagination-btn"
          title="Next Page"
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <button
          @click="goToPage(sessionStore.pagination.last_page)"
          :disabled="sessionStore.pagination.current_page === sessionStore.pagination.last_page"
          class="pagination-btn"
          title="Last Page"
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 17L18 12L13 7M6 17L11 12L6 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useSessionStore } from '@/stores/sessionStore'
import SessionForm from '@/components/dashboard/sessions/SessionForm.vue'
import ActivityForm from '@/components/dashboard/sessions/ActivityForm.vue'

const sessionStore = useSessionStore()

// Reactive state
const sessionsLoaded = ref(false)
const selectedSession = ref(null)
const showDeleteModal = ref(false)
const deletingSession = ref(null)
const showActivityStatusModal = ref(false)
const changingActivity = ref(null)
const newActivityStatus = ref('active')
const showCreateModal = ref(false)
const showEditModal = ref(false)
const editingSession = ref(null)
const showCreateActivityModal = ref(false)
const showEditActivityModal = ref(false)
const editingActivity = ref(null)
const successMessage = ref('')
const showSuccess = ref(false)
const currentPage = ref(1)
const perPage = ref(10)

// Methods
const loadSessions = async (page = 1) => {
  try {
    console.log('SessionsSection: Loading sessions...', { page, perPage: perPage.value })
    sessionsLoaded.value = false
    currentPage.value = page
    await sessionStore.fetchSessions({
      page: page,
      per_page: perPage.value
    })
    sessionsLoaded.value = true
    console.log('SessionsSection: Sessions loaded. Count:', sessionStore.getSessions.length)
    
    if (sessionStore.getSessions.length === 0) {
      console.warn('SessionsSection: Sessions array is empty after fetch')
    }
  } catch (error) {
    console.error('SessionsSection: Error loading sessions:', error)
    sessionsLoaded.value = true
  }
}

const goToPage = (page) => {
  if (page >= 1 && page <= (sessionStore.pagination?.last_page || 1)) {
    loadSessions(page)
  }
}

const getPageNumbers = () => {
  const current = sessionStore.pagination?.current_page || 1
  const last = sessionStore.pagination?.last_page || 1
  const pages = []
  
  if (current <= 3) {
    // Show first 5 pages
    for (let i = 1; i <= Math.min(5, last); i++) {
      pages.push(i)
    }
  } else if (current >= last - 2) {
    // Show last 5 pages
    for (let i = Math.max(1, last - 4); i <= last; i++) {
      pages.push(i)
    }
  } else {
    // Show 2 pages before and after current
    for (let i = current - 2; i <= current + 2; i++) {
      pages.push(i)
    }
  }
  
  return pages
}

const getSessionInitials = (id) => {
  return `S${id}`
}

const getStatusClass = (session) => {
  const status = (session.status || '').toLowerCase()
  if (status === 'active') return 'status-active'
  if (status === 'paused') return 'status-paused'
  if (status === 'ended') return 'status-ended'
  return 'status-unknown'
}

const getActivityStatusClass = (activity) => {
  const status = (activity.status || '').toLowerCase()
  if (status === 'active') return 'status-active'
  if (status === 'paused') return 'status-paused'
  if (status === 'ended') return 'status-ended'
  return 'status-unknown'
}

// Get session type based on activities
const getSessionType = (session) => {
  if (!session.activities || session.activities.length === 0) {
    return 'Unknown'
  }
  // Check first activity type
  const firstActivity = session.activities[0]
  if (firstActivity.activity_type === 'playing') {
    return 'Playing'
  } else if (firstActivity.activity_type === 'chillout') {
    return 'Chillout'
  }
  // Fallback: check if there's a device in any activity
  const hasDevice = session.activities.some(activity => activity.device_id || activity.device)
  return hasDevice ? 'Playing' : 'Chillout'
}

// Get current session ID for activity form (computed to ensure it's valid)
const getCurrentSessionId = computed(() => {
  const sessionId = selectedSession.value?.id || editingSession.value?.id || editingActivity.value?.session_id
  // Ensure sessionId is a valid number (not 0, null, or undefined)
  if (!sessionId || sessionId === 0 || isNaN(Number(sessionId))) {
    return null
  }
  return Number(sessionId)
})

const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const viewSession = async (session) => {
  try {
    // Fetch full session details
    await sessionStore.fetchSessionById(session.id)
    selectedSession.value = sessionStore.getCurrentSession || session
  } catch (error) {
    console.error('Failed to fetch session details:', error)
    selectedSession.value = session
  }
}

const closeSessionModal = () => {
  selectedSession.value = null
}

const pauseSession = async (session) => {
  try {
    await sessionStore.pauseSession(session.id)
    showSuccessMessage('Session paused successfully!')
    loadSessions(currentPage.value)
  } catch (error) {
    console.error('Failed to pause session:', error)
  }
}

const resumeSession = async (session) => {
  try {
    await sessionStore.resumeSession(session.id)
    showSuccessMessage('Session resumed successfully!')
    loadSessions(currentPage.value)
  } catch (error) {
    console.error('Failed to resume session:', error)
  }
}

// State for ending session confirmation
const showEndSessionModal = ref(false)
const endingSession = ref(null)
const activeActivitiesCount = ref(0)

const endSession = async (session) => {
  try {
    // Fetch full session details to check for active activities
    await sessionStore.fetchSessionById(session.id)
    const fullSession = sessionStore.getCurrentSession || session
    
    // Check if there are any active activities
    const activeActivities = (fullSession.activities || []).filter(
      activity => activity.status === 'active'
    )
    
    if (activeActivities.length > 0) {
      // Show confirmation modal
      endingSession.value = fullSession
      activeActivitiesCount.value = activeActivities.length
      showEndSessionModal.value = true
    } else {
      // No active activities, end session directly
      await confirmEndSession()
    }
  } catch (error) {
    console.error('Failed to check session activities:', error)
    // Fallback: try to end session anyway
    try {
      await sessionStore.endSession(session.id)
      showSuccessMessage('Session ended successfully!')
      loadSessions(currentPage.value)
    } catch (endError) {
      console.error('Failed to end session:', endError)
    }
  }
}

const confirmEndSession = async () => {
  if (!endingSession.value) return
  
  try {
    // End session - backend should handle ending all active activities
    await sessionStore.endSession(endingSession.value.id, {
      end_all_activities: true
    })
    showSuccessMessage('Session and all activities ended successfully!')
    closeEndSessionModal()
    loadSessions(currentPage.value)
    if (selectedSession.value && selectedSession.value.id === endingSession.value.id) {
      await viewSession(endingSession.value)
    }
  } catch (error) {
    console.error('Failed to end session:', error)
    sessionStore.error = error.message || 'Failed to end session'
  }
}

const closeEndSessionModal = () => {
  showEndSessionModal.value = false
  endingSession.value = null
  activeActivitiesCount.value = 0
}

const deleteSession = (session) => {
  deletingSession.value = session
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  deletingSession.value = null
}

const confirmDeleteSession = async () => {
  if (deletingSession.value) {
    try {
      await sessionStore.deleteSession(deletingSession.value.id)
      // If we're on the last page and it becomes empty, go to previous page
      const pagination = sessionStore.pagination
      if (pagination && pagination.current_page > 1 && sessionStore.getSessions.length === 1) {
        loadSessions(currentPage.value - 1)
      } else {
        loadSessions(currentPage.value)
      }
      showSuccessMessage('Session deleted successfully!')
      closeDeleteModal()
      if (selectedSession.value && selectedSession.value.id === deletingSession.value.id) {
        closeSessionModal()
      }
    } catch (error) {
      console.error('Failed to delete session:', error)
      closeDeleteModal()
    }
  }
}

const viewActivity = (activity) => {
  // For now, just show activity details in console or expand in modal
  console.log('View activity:', activity)
}

const editActivity = (activity) => {
  editingActivity.value = activity
  showEditActivityModal.value = true
}

const openCreateActivityModal = () => {
  // Ensure we have a selected session with an ID
  const sessionId = selectedSession.value?.id || editingSession.value?.id
  if (!sessionId || sessionId === 0) {
    showSuccessMessage('Please select a valid session first')
    console.error('Cannot create activity: Invalid session ID', { 
      selectedSession: selectedSession.value, 
      editingSession: editingSession.value 
    })
    return
  }
  showCreateActivityModal.value = true
}

const closeActivityFormModal = () => {
  showCreateActivityModal.value = false
  showEditActivityModal.value = false
  editingActivity.value = null
}

const onActivityCreated = async () => {
  closeActivityFormModal()
  // Refresh both selectedSession (for view modal) and editingSession (for edit modal)
  if (selectedSession.value && selectedSession.value.id) {
    await viewSession(selectedSession.value)
  }
  if (editingSession.value && editingSession.value.id) {
    await sessionStore.fetchSessionById(editingSession.value.id)
    editingSession.value = sessionStore.getCurrentSession || editingSession.value
  }
  showSuccessMessage('Activity created successfully!')
}

const onActivityUpdated = async () => {
  closeActivityFormModal()
  // Refresh both selectedSession (for view modal) and editingSession (for edit modal)
  if (selectedSession.value && selectedSession.value.id) {
    await viewSession(selectedSession.value)
  }
  if (editingSession.value && editingSession.value.id) {
    await sessionStore.fetchSessionById(editingSession.value.id)
    editingSession.value = sessionStore.getCurrentSession || editingSession.value
  }
  showSuccessMessage('Activity updated successfully!')
}

const closeSessionFormModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  editingSession.value = null
}

const onSessionCreated = async () => {
  closeSessionFormModal()
  // Go to first page to show the new session
  await loadSessions(1)
  showSuccessMessage('Session created successfully!')
}

const onSessionUpdated = async () => {
  closeSessionFormModal()
  await loadSessions(currentPage.value)
  if (selectedSession.value && editingSession.value && selectedSession.value.id === editingSession.value.id) {
    await viewSession(editingSession.value)
  }
  showSuccessMessage('Session updated successfully!')
}

const editSession = async (session) => {
  try {
    // Fetch full session details with activities
    await sessionStore.fetchSessionById(session.id)
    const fetchedSession = sessionStore.getCurrentSession || session
    // Ensure activities are included (they should be from the API response)
    editingSession.value = {
      ...fetchedSession,
      activities: fetchedSession.activities || session.activities || []
    }
    showEditModal.value = true
  } catch (error) {
    console.error('Failed to fetch session details:', error)
    // Fallback to the session data from the list (which includes activities from API)
    editingSession.value = {
      ...session,
      activities: session.activities || []
    }
    showEditModal.value = true
  }
}

const changeActivityStatus = (activity) => {
  changingActivity.value = activity
  newActivityStatus.value = activity.status || 'active'
  showActivityStatusModal.value = true
}

const closeActivityStatusModal = () => {
  showActivityStatusModal.value = false
  changingActivity.value = null
  newActivityStatus.value = 'active'
}

const confirmChangeActivityStatus = async () => {
  if (changingActivity.value && selectedSession.value) {
    try {
      await sessionStore.updateActivityStatus(
        selectedSession.value.id,
        changingActivity.value.id,
        newActivityStatus.value
      )
      showSuccessMessage('Activity status updated successfully!')
      await viewSession(selectedSession.value)
      closeActivityStatusModal()
    } catch (error) {
      console.error('Failed to change activity status:', error)
    }
  }
}

const endActivity = async (activity) => {
  if (selectedSession.value) {
    try {
      await sessionStore.endActivity(selectedSession.value.id, activity.id)
      showSuccessMessage('Activity ended successfully!')
      await viewSession(selectedSession.value)
    } catch (error) {
      console.error('Failed to end activity:', error)
    }
  }
}

const calculateActivityDuration = async (activity) => {
  if (selectedSession.value) {
    try {
      await sessionStore.calculateActivityDuration(selectedSession.value.id, activity.id)
      showSuccessMessage('Activity duration calculated successfully!')
      await viewSession(selectedSession.value)
    } catch (error) {
      console.error('Failed to calculate activity duration:', error)
    }
  }
}

const deleteActivity = async (activity) => {
  if (selectedSession.value && confirm(`Are you sure you want to delete this activity?`)) {
    try {
      await sessionStore.deleteActivity(selectedSession.value.id, activity.id)
      showSuccessMessage('Activity deleted successfully!')
      await viewSession(selectedSession.value)
    } catch (error) {
      console.error('Failed to delete activity:', error)
    }
  }
}

// Functions for handling activities in edit modal
const openCreateActivityModalFromEdit = () => {
  // Get the session ID from editingSession
  const sessionId = editingSession.value?.id
  if (!sessionId || sessionId === 0) {
    showSuccessMessage('Please select a valid session first')
    console.error('Cannot create activity: Invalid session ID', { 
      editingSession: editingSession.value 
    })
    return
  }
  // Set selectedSession to editingSession so the activity form can access it
  selectedSession.value = editingSession.value
  showCreateActivityModal.value = true
}

const editActivityFromEditModal = (activity) => {
  editingActivity.value = activity
  // Ensure we have the session ID
  if (!selectedSession.value && editingSession.value) {
    selectedSession.value = editingSession.value
  }
  showEditActivityModal.value = true
}

const endActivityFromEditModal = async (activity) => {
  if (editingSession.value && editingSession.value.id) {
    try {
      await sessionStore.endActivity(editingSession.value.id, activity.id)
      showSuccessMessage('Activity ended successfully!')
      // Refresh the editing session to update activities
      await sessionStore.fetchSessionById(editingSession.value.id)
      editingSession.value = sessionStore.getCurrentSession || editingSession.value
    } catch (error) {
      console.error('Failed to end activity:', error)
      showSuccessMessage('Failed to end activity')
    }
  }
}

const deleteActivityFromEditModal = async (activity) => {
  if (editingSession.value && editingSession.value.id) {
    if (confirm(`Are you sure you want to delete this activity?`)) {
      try {
        await sessionStore.deleteActivity(editingSession.value.id, activity.id)
        showSuccessMessage('Activity deleted successfully!')
        // Refresh the editing session to update activities
        await sessionStore.fetchSessionById(editingSession.value.id)
        editingSession.value = sessionStore.getCurrentSession || editingSession.value
      } catch (error) {
        console.error('Failed to delete activity:', error)
        showSuccessMessage('Failed to delete activity')
      }
    }
  }
}

const showSuccessMessage = (message) => {
  successMessage.value = message
  showSuccess.value = true
  setTimeout(() => {
    showSuccess.value = false
  }, 3000)
}

// Lifecycle
onMounted(() => {
  console.log('SessionsSection: Component mounted, loading sessions...')
  loadSessions(1)
})

// Emit events to parent component
defineEmits(['session-selected', 'session-created', 'session-updated'])
</script>

<style scoped>
/* Responsive */
@media (max-width: 768px) {
  .desktop-only {
    display: none !important;
  }
  
  .mobile-only {
    display: block !important;
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


