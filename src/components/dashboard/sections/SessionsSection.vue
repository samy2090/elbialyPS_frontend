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
      <!-- Futuristic Stats Section -->
      <div v-if="showStatsSection" class="sessions-stats-section">
        <div class="stats-container">
          <div class="stat-card active-stat" :class="{ 'stat-card-clicked': clickedCard === 'active' }" @click="triggerRipple('active')">
            <div class="stat-ripple"></div>
            <div class="stat-ripple stat-ripple-2"></div>
            <div class="stat-ripple stat-ripple-3"></div>
            <div class="stat-icon-wrapper">
              <div class="stat-icon active-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                  <path d="M8 12L11 15L16 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="stat-pulse"></div>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ activeSessionsCount }}</div>
              <div class="stat-label">Active Sessions</div>
            </div>
            <div class="stat-glow active-glow"></div>
          </div>
          <div class="stat-card paused-stat" :class="{ 'stat-card-clicked': clickedCard === 'paused' }" @click="triggerRipple('paused')">
            <div class="stat-ripple"></div>
            <div class="stat-ripple stat-ripple-2"></div>
            <div class="stat-ripple stat-ripple-3"></div>
            <div class="stat-icon-wrapper">
              <div class="stat-icon paused-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                  <rect x="9" y="9" width="2" height="6" fill="currentColor"/>
                  <rect x="13" y="9" width="2" height="6" fill="currentColor"/>
                </svg>
              </div>
              <div class="stat-pulse paused-pulse"></div>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ pausedSessionsCount }}</div>
              <div class="stat-label">Paused Sessions</div>
            </div>
            <div class="stat-glow paused-glow"></div>
          </div>
        </div>
      </div>
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
              <tr v-for="session in sortedSessions" :key="session.id" class="session-row">
                <td>
                  <div class="session-info">
                    <div class="session-avatar">
                      {{ getSessionInitials(session.id) }}
                    </div>
                    <div class="session-details">
                      <span class="session-name">Session #{{ session.id }}</span>
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
          v-for="session in sortedSessions" 
          :key="session.id" 
          class="session-card"
          :class="{ 'expanded': expandedSessionId === session.id }"
        >
          <div class="session-card-header" @click="toggleSessionExpand(session)">
            <div class="session-avatar">
              {{ getSessionInitials(session.id) }}
            </div>
            <div class="session-info">
              <h3 class="session-name">Session #{{ session.id }}</h3>
              <p class="session-customer">Customer: {{ session.customer?.name || 'N/A' }}</p>
            </div>
            <div class="expand-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
          <div class="session-card-content">
            <div class="session-badges">
              <span :class="getStatusClass(session)" class="status-badge">
                {{ session.status || 'N/A' }}
              </span>
            </div>
            <!-- Timer Display for Single Activity Sessions -->
            <div v-if="shouldShowSessionTimer(session) && session.activities && session.activities[0] && calculateTime(session.activities[0])" class="session-timer-wrapper">
              <div class="futuristic-timer" :class="{ 'timer-expired': calculateTime(session.activities[0])?.expired }">
                <div class="timer-display">
                  <div class="timer-unit">
                    <span class="timer-value">{{ String(calculateTime(session.activities[0])?.hours || 0).padStart(2, '0') }}</span>
                    <span class="timer-label">H</span>
                  </div>
                  <span class="timer-separator">:</span>
                  <div class="timer-unit">
                    <span class="timer-value">{{ String(calculateTime(session.activities[0])?.minutes || 0).padStart(2, '0') }}</span>
                    <span class="timer-label">M</span>
                  </div>
                  <span v-if="calculateTime(session.activities[0])?.isCountdown && !calculateTime(session.activities[0])?.expired" class="timer-countdown-indicator">▼</span>
                  <span v-else-if="calculateTime(session.activities[0])?.expired" class="timer-expired-indicator" title="Time's up!">⏰</span>
                  <span v-else class="timer-countup-indicator">▲</span>
                </div>
                <div v-if="calculateTime(session.activities[0])?.expired" class="timer-expired-message">Time's Up!</div>
              </div>
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
              <button @click.stop="editSession(session)" class="action-btn small primary">
                Edit
              </button>
              <button v-if="session.status === 'active'" @click.stop="pauseSession(session)" class="action-btn small warning">
                Pause
              </button>
              <button v-if="session.status === 'paused'" @click.stop="resumeSession(session)" class="action-btn small success">
                Resume
              </button>
              <button v-if="session.status !== 'ended'" @click.stop="endSession(session)" class="action-btn small danger">
                End
              </button>
            </div>
          </div>
          
          <!-- Expanded Content -->
          <transition name="expand">
            <div v-if="expandedSessionId === session.id" class="session-expanded-content">
              <div class="expanded-divider"></div>
              
              <!-- Session Details Section -->
              <div class="expanded-section">
                <h4 class="expanded-section-title">
                  <span class="title-icon">⚡</span>
                  Session Information
                </h4>
                <div class="expanded-details-grid">
                  <div class="expanded-detail-item">
                    <span class="expanded-label">Session ID</span>
                    <span class="expanded-value">{{ session.id }}</span>
                  </div>
                  <div class="expanded-detail-item">
                    <span class="expanded-label">Customer</span>
                    <span class="expanded-value">{{ session.customer?.name || 'N/A' }}</span>
                  </div>
                  <div class="expanded-detail-item">
                    <span class="expanded-label">Creator</span>
                    <span class="expanded-value">{{ session.creator?.name || 'N/A' }}</span>
                  </div>
                  <div class="expanded-detail-item">
                    <span class="expanded-label">Status</span>
                    <span :class="getStatusClass(session)" class="status-badge">
                      {{ session.status || 'N/A' }}
                    </span>
                  </div>
                  <div class="expanded-detail-item">
                    <span class="expanded-label">Session Type</span>
                    <span class="expanded-value">{{ getSessionType(session) }}</span>
                  </div>
                  <div class="expanded-detail-item">
                    <span class="expanded-label">Started At</span>
                    <span class="expanded-value">{{ formatDateTime(session.started_at) }}</span>
                  </div>
                  <div class="expanded-detail-item">
                    <span class="expanded-label">Ended At</span>
                    <span class="expanded-value">{{ formatDateTime(session.ended_at) || 'N/A' }}</span>
                  </div>
                  <div class="expanded-detail-item">
                    <span class="expanded-label">Subtotal</span>
                    <span class="expanded-value">${{ parseFloat((session.total_price || 0) + (session.discount || 0)).toFixed(2) }}</span>
                  </div>
                  <div v-if="session.discount" class="expanded-detail-item">
                    <span class="expanded-label">Discount</span>
                    <span class="expanded-value discount">-${{ parseFloat(session.discount || 0).toFixed(2) }}</span>
                  </div>
                  <div class="expanded-detail-item highlight">
                    <span class="expanded-label">Total Price</span>
                    <span class="expanded-value">${{ parseFloat(session.total_price || 0).toFixed(2) }}</span>
                  </div>
                </div>
              </div>

              <!-- Activities Section -->
              <div class="expanded-section">
                <h4 class="expanded-section-title">
                  <span class="title-icon">🎮</span>
                  Activities ({{ session.activities?.length || 0 }})
                </h4>
                <div v-if="session.activities && session.activities.length > 0" class="expanded-activities-list">
                  <div 
                    v-for="activity in session.activities" 
                    :key="activity.id"
                    class="expanded-activity-item"
                  >
                    <div class="activity-card-header">
                      <div class="activity-card-info">
                        <h5 class="activity-card-title">
                          {{ activity.device?.name || activity.device_name || (activity.activity_type === 'chillout' ? 'No Device' : 'Unknown Device') }}
                        </h5>
                        <span class="activity-card-type">
                          {{ activity.activity_type === 'playing' ? 'Playing' : activity.activity_type === 'chillout' ? 'Chillout' : activity.activity_type }}
                          <span v-if="activity.mode"> • {{ activity.mode === 'single' ? 'Single' : 'Multi' }} Player</span>
                        </span>
                      </div>
                      <div class="activity-header-right">
                      <span :class="getActivityStatusClass(activity)" class="status-badge small">
                        {{ activity.status }}
                      </span>
                        <!-- Timer Display for Activities -->
                        <div v-if="shouldShowActivityTimer(activity) && calculateTime(activity)" class="activity-timer-wrapper">
                          <div class="futuristic-timer small" :class="{ 'timer-expired': calculateTime(activity)?.expired }">
                            <div class="timer-display">
                              <div class="timer-unit">
                                <span class="timer-value">{{ String(calculateTime(activity)?.hours || 0).padStart(2, '0') }}</span>
                                <span class="timer-label">H</span>
                              </div>
                              <span class="timer-separator">:</span>
                              <div class="timer-unit">
                                <span class="timer-value">{{ String(calculateTime(activity)?.minutes || 0).padStart(2, '0') }}</span>
                                <span class="timer-label">M</span>
                              </div>
                              <span v-if="calculateTime(activity)?.isCountdown && !calculateTime(activity)?.expired" class="timer-countdown-indicator">▼</span>
                              <span v-else-if="calculateTime(activity)?.expired" class="timer-expired-indicator" title="Time's up!">⏰</span>
                              <span v-else class="timer-countup-indicator">▲</span>
                            </div>
                            <div v-if="calculateTime(activity)?.expired" class="timer-expired-message">Time's Up!</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="activity-card-details">
                      <div class="activity-card-meta">
                        <div class="activity-meta-item">
                          <span class="meta-icon">🕐</span>
                          <span>Started: {{ formatDateTime(activity.started_at) }}</span>
                        </div>
                        <div v-if="activity.ended_at" class="activity-meta-item">
                          <span class="meta-icon">🏁</span>
                          <span>Ended: {{ formatDateTime(activity.ended_at) }}</span>
                        </div>
                        <div v-if="activity.duration_hours" class="activity-meta-item">
                          <span class="meta-icon">⏱️</span>
                          <span>Duration: {{ formatDuration(activity.duration_hours) || activity.duration_formatted }}</span>
                        </div>
                        <div class="activity-meta-item">
                          <span class="meta-icon">💰</span>
                          <span>Price: ${{ parseFloat(activity.total_price || 0).toFixed(2) }}</span>
                        </div>
                      </div>
                      <!-- Users Section -->
                      <div class="activity-card-users">
                        <div class="users-label">Users:</div>
                        <div v-if="activity.activity_users && activity.activity_users.length > 0">
                          <template v-for="au in activity.activity_users" :key="au.id">
                            <div class="activity-user-card">
                              <span 
                                @click="toggleUserProducts(session, activity, au.user_id)"
                                class="user-name-clickable"
                                :class="{ 'expanded': isUserProductsExpanded(session, activity, au.user_id) }"
                              >
                                {{ au.user?.name || 'Unknown' }}
                              </span>
                              <span v-if="au.duration_hours" class="user-duration">({{ formatDuration(au.duration_hours) || au.duration_formatted }})</span>
                              <button 
                                v-if="canRemoveUserFromActivity(session, activity, au.user_id)"
                                @click.stop="removeUserFromActivity(session, activity, au.user_id)" 
                                class="user-remove-btn"
                                title="Remove user"
                              >
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
                                  <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
                                </svg>
                              </button>
                            </div>
                            <!-- User Products Section - Direct child of activity-card-users -->
                            <div 
                              v-if="isUserProductsExpanded(session, activity, au.user_id)"
                              class="user-products-section"
                            >
                              <!-- Section Title -->
                              <h4 class="user-products-title">PRODUCTS FOR {{ (au.user?.name || 'User').toUpperCase() }}</h4>
                              
                              <!-- Product Selection Form -->
                              <div class="product-form">
                                <div class="form-row">
                                  <div class="form-field">
                                    <label class="field-label">Select Product</label>
                                    <div class="product-dropdown-wrapper">
                                      <div 
                                        class="product-dropdown-futuristic"
                                        :class="{ 'open': getShowProductDropdown(session, activity, au.user_id), 'has-selection': getSelectedProduct(session, activity, au.user_id) }"
                                        @click.stop="toggleProductDropdown(session, activity, au.user_id)"
                                      >
                                        <span class="dropdown-selected-text">
                                          {{ getSelectedProductText(session, activity, au.user_id) || 'Choose a product...' }}
                                        </span>
                                        <svg class="dropdown-arrow" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                          <path d="M8 11L3 6h10z" fill="currentColor"/>
                                        </svg>
                                      </div>
                                      <div 
                                        v-if="getShowProductDropdown(session, activity, au.user_id)"
                                        class="product-dropdown-menu"
                                        @click.stop
                                      >
                                        <div 
                                          class="dropdown-item"
                                          :class="{ 'selected': !getSelectedProduct(session, activity, au.user_id) }"
                                          @click="selectProduct(session, activity, au.user_id, null)"
                                        >
                                          <span>Choose a product...</span>
                                        </div>
                                        <div 
                                          v-for="product in productStore.getProducts" 
                                          :key="product.id"
                                          class="dropdown-item"
                                          :class="{ 'selected': getSelectedProduct(session, activity, au.user_id) === product.id }"
                                          @click="selectProduct(session, activity, au.user_id, product.id)"
                                        >
                                          <div class="product-option-info">
                                            <span class="product-option-name">{{ product.name }}</span>
                                            <span class="product-option-price">${{ parseFloat(product.price || 0).toFixed(2) }}</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div class="form-field">
                                    <label class="field-label">Quantity</label>
                                    <div class="quantity-counter-wrapper">
                                      <button 
                                        @click="setProductQuantity(session, activity, au.user_id, Math.max(1, getProductQuantity(session, activity, au.user_id) - 1))"
                                        class="quantity-btn quantity-btn-minus"
                                        type="button"
                                      >
                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                          <path d="M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        </svg>
                                      </button>
                                      <span class="quantity-display">{{ getProductQuantity(session, activity, au.user_id) }}</span>
                                      <button 
                                        @click="setProductQuantity(session, activity, au.user_id, getProductQuantity(session, activity, au.user_id) + 1)"
                                        class="quantity-btn quantity-btn-plus"
                                        type="button"
                                      >
                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                          <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        </svg>
                                      </button>
                                    </div>
                                  </div>
                                  
                                  <div class="form-field">
                                    <button 
                                      @click="addProductToUser(session, activity, au.user_id)"
                                      :disabled="!canAddProduct(session, activity, au.user_id) || getAddingProduct(session, activity, au.user_id)"
                                      class="add-product-btn"
                                    >
                                      <svg v-if="!getAddingProduct(session, activity, au.user_id)" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                      </svg>
                                      <div v-else class="loading-spinner small"></div>
                                      <span>{{ getAddingProduct(session, activity, au.user_id) ? 'Adding...' : 'Add' }}</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                              
                              <!-- User Products List -->
                              <div class="user-products-list">
                                <div v-if="getLoadingUserProducts(session, activity, au.user_id)" class="loading-state">
                                  <div class="loading-spinner"></div>
                                  <span>Loading products...</span>
                                </div>
                                <div v-else-if="getUserProducts(session, activity, au.user_id).length === 0" class="no-products-message">
                                  <span>No products added yet</span>
                                </div>
                                <div v-else class="products-grid">
                                  <div 
                                    v-for="productOrder in getUserProducts(session, activity, au.user_id)" 
                                    :key="productOrder.id"
                                    class="product-order-item"
                                  >
                                    <div class="product-info">
                                      <span class="product-name">{{ productOrder.product?.name || 'Unknown Product' }}</span>
                                      <span class="product-details">
                                        Qty: {{ productOrder.quantity }} × ${{ parseFloat(productOrder.price || 0).toFixed(2) }} = ${{ parseFloat(productOrder.total_price || 0).toFixed(2) }}
                                      </span>
                                    </div>
                                    <button 
                                      @click="deleteProductFromUser(session, activity, au.user_id, productOrder.id)"
                                      class="delete-product-btn"
                                      title="Remove product"
                                    >
                                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
                                        <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </template>
                        </div>
                        <div v-else class="no-users-message">
                          <span>No users assigned</span>
                        </div>
                        
                        <!-- Add User Input (only for active/paused activities) -->
                        <div v-if="canAddUsersToActivity(activity)" class="add-user-section">
                          <div class="user-search-wrapper customer-search-wrapper">
                            <input 
                              :value="getUserSearchQuery(session, activity)"
                              @input="handleUserSearch(session, activity, $event)"
                              @focus="handleUserSearchFocus(session, activity)"
                              @blur="handleUserSearchBlur(session, activity)"
                              type="text"
                              class="form-input user-search-input"
                              :class="{ 'has-selection': getSelectedUser(session, activity) }"
                              :data-key="getUserDropdownKey(session, activity)"
                              placeholder="Type to search users..."
                              autocomplete="off"
                            />
                            <div v-if="getUserSearchLoading(session, activity)" class="search-loading">
                              <div class="loading-spinner small"></div>
                            </div>
                            <Teleport to="body">
                              <div 
                                v-if="getShowUserSearchDropdown(session, activity) && (getUserSearchResults(session, activity).length > 0 || getUserSearchQuery(session, activity).length > 0)"
                                class="user-search-dropdown customer-dropdown fixed-dropdown"
                                :style="getDropdownStyle(session, activity)"
                              >
                              <div 
                                v-if="getUserSearchLoading(session, activity)"
                                class="dropdown-item loading-item"
                              >
                                <div class="loading-spinner small"></div>
                                <span>Searching...</span>
                              </div>
                              <div 
                                v-else-if="getUserSearchResults(session, activity).length === 0 && getUserSearchQuery(session, activity).length > 0 && canCreateNewUser(session, activity)"
                                class="dropdown-item create-new-customer"
                                @mousedown.prevent="createAndSelectUser(session, activity)"
                              >
                                <svg class="create-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                                  <path d="M12 8V16M8 12H16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                </svg>
                                <span>Create new user: <strong>{{ getUserSearchQuery(session, activity).trim() }}</strong></span>
                              </div>
                              <div 
                                v-else-if="getUserSearchResults(session, activity).length === 0 && getUserSearchQuery(session, activity).length > 0 && !canCreateNewUser(session, activity)"
                                class="dropdown-item no-results"
                              >
                                No users found
                              </div>
                              <div
                                v-for="user in getUserSearchResults(session, activity)"
                                :key="user.id"
                                @mousedown.prevent="user.is_available && !user.in_active_activity ? selectUserForActivity(session, activity, user) : null"
                                class="dropdown-item"
                                :class="{ 
                                  'disabled': user.in_active_activity || !user.is_available,
                                  'selected': getSelectedUser(session, activity)?.id === user.id
                                }"
              >
                                <div class="customer-info">
                                  <span class="customer-name">{{ user.name }}</span>
                                  <span class="customer-email">{{ user.email }}</span>
                                  <span v-if="user.in_active_activity" class="user-status-badge" style="font-size: 0.7rem; color: #f59e0b; margin-top: 0.25rem;">
                                    (In active activity - cannot select)
                                  </span>
                                </div>
                              </div>
                              </div>
                            </Teleport>
                          </div>
                        </div>
                      </div>
                      <div class="activity-card-actions">
                        <button 
                          @click.stop="editActivityFromExpanded(session, activity)" 
                          class="action-btn icon-only primary"
                          title="Edit Activity"
                        >
                          <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M18.5 2.50023C18.8978 2.10243 19.4374 1.87891 20 1.87891C20.5626 1.87891 21.1022 2.10243 21.5 2.50023C21.8978 2.89804 22.1213 3.43762 22.1213 4.00023C22.1213 4.56284 21.8978 5.10243 21.5 5.50023L12 15.0002L8 16.0002L9 12.0002L18.5 2.50023Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          </svg>
                        </button>
                        <button 
                          v-if="activity.status === 'active'"
                          @click.stop="pauseActivityFromExpanded(session, activity)" 
                          class="action-btn icon-only warning"
                          title="Pause Activity"
                        >
                          <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="6" y="4" width="4" height="16" fill="currentColor"/>
                            <rect x="14" y="4" width="4" height="16" fill="currentColor"/>
                          </svg>
                        </button>
                        <button 
                          v-if="activity.status === 'paused'"
                          @click.stop="resumeActivityFromExpanded(session, activity)" 
                          class="action-btn icon-only success"
                          title="Resume Activity"
                        >
                          <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <polygon points="5,3 19,12 5,21" fill="currentColor"/>
                          </svg>
                        </button>
                        <button 
                          v-if="activity.status !== 'ended'"
                          @click.stop="endActivityFromExpanded(session, activity)" 
                          class="action-btn icon-only danger"
                          title="End Activity"
                        >
                          <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="6" y="6" width="12" height="12" rx="2" stroke="currentColor" stroke-width="2"/>
                            <path d="M9 9L15 15M15 9L9 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                          </svg>
                        </button>
                        <!-- Mode Toggle Switch -->
                        <div 
                          v-if="activity.status !== 'ended' && (activity.activity_type === 'playing' || activity.device_id)"
                          class="mode-toggle-wrapper"
                          :class="{ 'disabled': activity.status === 'paused' }"
                          :title="activity.status === 'paused' ? 'Mode toggle is disabled when activity is paused' : `Switch to ${(activity.mode || 'single') === 'single' ? 'Multi' : 'Single'} mode`"
                        >
                          <label class="mode-toggle-label">
                            <input 
                              type="checkbox" 
                              :checked="(activity.mode || 'single') === 'multi'"
                              :disabled="activity.status === 'paused'"
                              @change="toggleActivityMode(session, activity)"
                              class="mode-toggle-input"
                            />
                            <span class="mode-toggle-slider">
                              <span class="mode-toggle-text">{{ (activity.mode || 'single') === 'single' ? 'S' : 'M' }}</span>
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="expanded-empty-activities">
                  <p>No activities in this session.</p>
                </div>
                <!-- Create Activity Button (shown when session is active or paused) -->
                <div v-if="session.status === 'active' || session.status === 'paused'" class="create-activity-section">
                  <button 
                    @click.stop="openCreateActivityForSession(session)" 
                    class="action-btn primary create-activity-btn"
                  >
                    <svg class="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 5V19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Create New Activity
                  </button>
                </div>
              </div>
            </div>
          </transition>
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
            <p><strong>{{ activeActivitiesCount }} active activity(ies)</strong> will also be ended.</p>
          </div>
          <div v-else>
            <p>End Session #{{ endingSession?.id }}?</p>
          </div>
        </div>
        <div class="modal-actions">
          <button @click="closeEndSessionModal" class="action-btn secondary">Cancel</button>
          <button @click="confirmEndSession" :disabled="sessionStore.loading" class="action-btn danger">
            End Session{{ activeActivitiesCount > 0 ? ' & Activities' : '' }}
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
          <p>Delete Session #{{ deletingSession?.id }}? <span class="warning-text">Cannot be undone.</span></p>
        </div>
        <div class="modal-actions">
          <button @click="closeDeleteModal" class="action-btn secondary">Cancel</button>
          <button @click="confirmDeleteSession" :disabled="sessionStore.loading" class="action-btn danger">Delete</button>
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

    <!-- Remove User Warning Modal -->
    <div v-if="showRemoveUserWarningModal && removingUserInfo" class="session-modal-overlay" @click="closeRemoveUserWarningModal">
      <div class="session-modal delete-modal" @click.stop>
        <div class="modal-header">
          <h3>Cannot Remove User</h3>
          <button @click="closeRemoveUserWarningModal" class="close-btn">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
        </div>
        <div class="modal-content">
          <div class="warning-message">
            <svg class="warning-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M12 8V12M12 16H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <p><strong>{{ removingUserInfo?.userName || 'User' }}</strong> has products assigned.</p>
            <p>Remove all products first.</p>
          </div>
        </div>
        <div class="modal-actions">
          <button @click="closeRemoveUserWarningModal" class="action-btn primary">OK</button>
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
                      <span v-if="activity.duration_hours">Duration: {{ formatDuration(activity.duration_hours) || activity.duration_formatted }}</span>
                      <span>Price: ${{ parseFloat(activity.total_price || 0).toFixed(2) }}</span>
                    </div>
                    <!-- Activity Users -->
                    <div class="activity-users">
                      <strong>Users:</strong>
                      <div v-if="activity.activity_users && activity.activity_users.length > 0">
                        <template v-for="au in activity.activity_users" :key="au.id">
                          <div class="activity-user-item">
                            <span 
                              @click="toggleUserProducts(editingSession, activity, au.user_id)"
                              class="user-name-clickable"
                              :class="{ 'expanded': isUserProductsExpanded(editingSession, activity, au.user_id) }"
                            >
                              {{ au.user?.name || 'Unknown' }}
                            </span>
                            <span v-if="au.duration_hours">({{ formatDuration(au.duration_hours) || au.duration_formatted }})</span>
                            <button 
                              v-if="canRemoveUserFromActivity(editingSession, activity, au.user_id)"
                              @click="removeUserFromActivityInEditModal(editingSession, activity, au.user_id)" 
                              class="user-remove-btn small"
                              title="Remove user"
                            >
                              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
                                <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
                              </svg>
                            </button>
                          </div>
                          <!-- User Products Section - Direct child of activity-card-users -->
                          <div 
                            v-if="isUserProductsExpanded(editingSession, activity, au.user_id)"
                            class="user-products-section"
                          >
                            <!-- Section Title -->
                            <h4 class="user-products-title">PRODUCTS FOR {{ (au.user?.name || 'User').toUpperCase() }}</h4>
                            
                            <!-- Product Selection Form -->
                            <div class="product-form">
                              <div class="form-row">
                                <div class="form-field">
                                  <label class="field-label">Select Product</label>
                                  <div class="product-dropdown-wrapper">
                                    <div 
                                      class="product-dropdown-futuristic"
                                      :class="{ 'open': getShowProductDropdown(editingSession, activity, au.user_id), 'has-selection': getSelectedProduct(editingSession, activity, au.user_id) }"
                                      @click.stop="toggleProductDropdown(editingSession, activity, au.user_id)"
                                    >
                                      <span class="dropdown-selected-text">
                                        {{ getSelectedProductText(editingSession, activity, au.user_id) || 'Choose a product...' }}
                                      </span>
                                      <svg class="dropdown-arrow" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M8 11L3 6h10z" fill="currentColor"/>
                                      </svg>
                                    </div>
                                    <div 
                                      v-if="getShowProductDropdown(editingSession, activity, au.user_id)"
                                      class="product-dropdown-menu"
                                      @click.stop
                                    >
                                      <div 
                                        class="dropdown-item"
                                        :class="{ 'selected': !getSelectedProduct(editingSession, activity, au.user_id) }"
                                        @click="selectProduct(editingSession, activity, au.user_id, null)"
                                      >
                                        <span>Choose a product...</span>
                                      </div>
                                      <div 
                                        v-for="product in productStore.getProducts" 
                                        :key="product.id"
                                        class="dropdown-item"
                                        :class="{ 'selected': getSelectedProduct(editingSession, activity, au.user_id) === product.id }"
                                        @click="selectProduct(editingSession, activity, au.user_id, product.id)"
                                      >
                                        <div class="product-option-info">
                                          <span class="product-option-name">{{ product.name }}</span>
                                          <span class="product-option-price">${{ parseFloat(product.price || 0).toFixed(2) }}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                <div class="form-field">
                                  <label class="field-label">Quantity</label>
                                  <div class="quantity-counter-wrapper">
                                    <button 
                                      @click="setProductQuantity(editingSession, activity, au.user_id, Math.max(1, getProductQuantity(editingSession, activity, au.user_id) - 1))"
                                      class="quantity-btn quantity-btn-minus"
                                      type="button"
                                    >
                                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                      </svg>
                                    </button>
                                    <span class="quantity-display">{{ getProductQuantity(editingSession, activity, au.user_id) }}</span>
                                    <button 
                                      @click="setProductQuantity(editingSession, activity, au.user_id, getProductQuantity(editingSession, activity, au.user_id) + 1)"
                                      class="quantity-btn quantity-btn-plus"
                                      type="button"
                                    >
                                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                                
                                <div class="form-field">
                                  <button 
                                    @click="addProductToUser(editingSession, activity, au.user_id)"
                                    :disabled="!canAddProduct(editingSession, activity, au.user_id) || getAddingProduct(editingSession, activity, au.user_id)"
                                    class="add-product-btn"
                                  >
                                    <svg v-if="!getAddingProduct(editingSession, activity, au.user_id)" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                    </svg>
                                    <div v-else class="loading-spinner small"></div>
                                    <span>{{ getAddingProduct(editingSession, activity, au.user_id) ? 'Adding...' : 'Add' }}</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                            
                            <!-- User Products List -->
                            <div class="user-products-list">
                              <div v-if="getLoadingUserProducts(editingSession, activity, au.user_id)" class="loading-state">
                                <div class="loading-spinner"></div>
                                <span>Loading products...</span>
                              </div>
                              <div v-else-if="getUserProducts(editingSession, activity, au.user_id).length === 0" class="no-products-message">
                                <span>No products added yet</span>
                              </div>
                              <div v-else class="products-grid">
                                <div 
                                  v-for="productOrder in getUserProducts(editingSession, activity, au.user_id)" 
                                  :key="productOrder.id"
                                  class="product-order-item"
                                >
                                  <div class="product-info">
                                    <span class="product-name">{{ productOrder.product?.name || 'Unknown Product' }}</span>
                                    <span class="product-details">
                                      Qty: {{ productOrder.quantity }} × ${{ parseFloat(productOrder.price || 0).toFixed(2) }} = ${{ parseFloat(productOrder.total_price || 0).toFixed(2) }}
                                    </span>
                                  </div>
                                  <button 
                                    @click="deleteProductFromUser(editingSession, activity, au.user_id, productOrder.id)"
                                    class="delete-product-btn"
                                    title="Remove product"
                                  >
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
                                      <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </template>
                      </div>
                      <div v-else class="no-users-message">
                        <span>No users assigned</span>
                      </div>
                      
                      <!-- Add User Input (only for active/paused activities) -->
                      <div v-if="editingSession && canAddUsersToActivity(activity)" class="add-user-section">
                          <div class="user-search-wrapper customer-search-wrapper">
                            <input 
                              :value="getUserSearchQuery(editingSession, activity)"
                              @input="handleUserSearch(editingSession, activity, $event)"
                              @focus="handleUserSearchFocus(editingSession, activity)"
                              @blur="handleUserSearchBlur(editingSession, activity)"
                              type="text"
                              class="form-input user-search-input"
                              :class="{ 'has-selection': getSelectedUser(editingSession, activity) }"
                              :data-key="getUserDropdownKey(editingSession, activity)"
                              placeholder="Type to search users..."
                              autocomplete="off"
                            />
                          <div v-if="getUserSearchLoading(editingSession, activity)" class="search-loading">
                            <div class="loading-spinner small"></div>
                          </div>
                          <Teleport to="body">
                            <div 
                              v-if="getShowUserSearchDropdown(editingSession, activity) && (getUserSearchResults(editingSession, activity).length > 0 || getUserSearchQuery(editingSession, activity).length > 0)"
                              class="user-search-dropdown customer-dropdown fixed-dropdown"
                              :style="getDropdownStyle(editingSession, activity)"
                            >
                            <div 
                              v-if="getUserSearchLoading(editingSession, activity)"
                              class="dropdown-item loading-item"
                            >
                              <div class="loading-spinner small"></div>
                              <span>Searching...</span>
                            </div>
                            <div 
                              v-else-if="getUserSearchResults(editingSession, activity).length === 0 && getUserSearchQuery(editingSession, activity).length > 0 && canCreateNewUser(editingSession, activity)"
                              class="dropdown-item create-new-customer"
                              @mousedown.prevent="createAndSelectUserInEdit(editingSession, activity)"
                            >
                              <svg class="create-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                                <path d="M12 8V16M8 12H16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                              </svg>
                              <span>Create new user: <strong>{{ getUserSearchQuery(editingSession, activity).trim() }}</strong></span>
                            </div>
                            <div 
                              v-else-if="getUserSearchResults(editingSession, activity).length === 0 && getUserSearchQuery(editingSession, activity).length > 0 && !canCreateNewUser(editingSession, activity)"
                              class="dropdown-item no-results"
                            >
                              No users found
                            </div>
                            <div
                              v-for="user in getUserSearchResults(editingSession, activity)"
                              :key="user.id"
                              @mousedown.prevent="user.is_available && !user.in_active_activity ? selectUserForActivityInEdit(editingSession, activity, user) : null"
                              class="dropdown-item"
                              :class="{ 
                                'disabled': user.in_active_activity || !user.is_available,
                                'selected': getSelectedUser(editingSession, activity)?.id === user.id
                              }"
                            >
                              <div class="customer-info">
                                <span class="customer-name">{{ user.name }}</span>
                                <span class="customer-email">{{ user.email }}</span>
                                <span v-if="user.in_active_activity" class="user-status-badge" style="font-size: 0.7rem; color: #f59e0b; margin-top: 0.25rem;">
                                  (In active activity - cannot select)
                                </span>
                              </div>
                            </div>
                            </div>
                          </Teleport>
                        </div>
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
import { ref, onMounted, computed, onUnmounted, nextTick } from 'vue'
import { useSessionStore } from '@/stores/sessionStore'
import { useUserStore } from '@/stores/userStore'
import { useProductStore } from '@/stores/productStore'
import SessionForm from '@/components/dashboard/sessions/SessionForm.vue'
import ActivityForm from '@/components/dashboard/sessions/ActivityForm.vue'
import { formatDuration } from '@/utils/helpers'
import UserService from '@/api/users'
import SessionService from '@/api/sessions'
import { useBodyScrollLock } from '@/composables/useBodyScrollLock'

const sessionStore = useSessionStore()
const userStore = useUserStore()
const productStore = useProductStore()

// Reactive state
const sessionsLoaded = ref(false)
const selectedSession = ref(null)
const showDeleteModal = ref(false)
const deletingSession = ref(null)
const showEndSessionModal = ref(false)
const showActivityStatusModal = ref(false)
const changingActivity = ref(null)
const newActivityStatus = ref('active')
const showRemoveUserWarningModal = ref(false)
const removingUserInfo = ref(null) // { session, activity, userId, userName }
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
const expandedSessionId = ref(null)
const clickedCard = ref(null)

// Lock body scroll when any modal is open
const isAnyModalOpen = computed(() => 
  showDeleteModal.value || 
  showEndSessionModal.value ||
  showActivityStatusModal.value || 
  showRemoveUserWarningModal.value ||
  showCreateModal.value || 
  showEditModal.value || 
  showCreateActivityModal.value || 
  showEditActivityModal.value
)
useBodyScrollLock(isAnyModalOpen)

// User management state - using searchable input pattern like customer input
const userSearchQuery = ref({}) // Key: `${sessionId}-${activityId}` - search query text
const userSearchResults = ref({}) // Key: `${sessionId}-${activityId}` - filtered search results
const userSearchLoading = ref({}) // Key: `${sessionId}-${activityId}` - loading state
const showUserSearchDropdown = ref({}) // Key: `${sessionId}-${activityId}` - show/hide dropdown
const selectedUser = ref({}) // Key: `${sessionId}-${activityId}` - selected user object
const allUsers = ref([]) // All users loaded from store
const availableUsersCache = ref({}) // Key: `${sessionId}-${activityId}` - cached available users from API
const creatingUser = ref({}) // Key: `${sessionId}-${activityId}` - creating user state
const dropdownPosition = ref({}) // Key: `${sessionId}-${activityId}` - { top, left, width } for fixed positioning
let userSearchDebounceTimer = null // Debounce timer for user search

// Activity Products state management
const expandedUserProducts = ref({}) // Key: `${sessionId}-${activityId}-${userId}` - track expanded state
const userProducts = ref({}) // Key: `${sessionId}-${activityId}-${userId}` - store products for each user
const selectedProduct = ref({}) // Key: `${sessionId}-${activityId}-${userId}` - selected product ID
const productQuantity = ref({}) // Key: `${sessionId}-${activityId}-${userId}` - quantity input
const addingProduct = ref({}) // Key: `${sessionId}-${activityId}-${userId}` - loading state
const loadingUserProducts = ref({}) // Key: `${sessionId}-${activityId}-${userId}` - loading products
const showProductDropdown = ref({}) // Key: `${sessionId}-${activityId}-${userId}` - show/hide dropdown

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
    
    // Clear expired activities handled set when sessions are refreshed
    // This allows re-checking activities after refresh
    expiredActivitiesHandled.value.clear()
    
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

// Count active and paused sessions
const activeSessionsCount = computed(() => {
  return sessionStore.getSessions.filter(session => {
    const status = (session.status || '').toLowerCase()
    return status === 'active'
  }).length
})

const pausedSessionsCount = computed(() => {
  return sessionStore.getSessions.filter(session => {
    const status = (session.status || '').toLowerCase()
    return status === 'paused'
  }).length
})

const showStatsSection = computed(() => {
  return activeSessionsCount.value > 0 || pausedSessionsCount.value > 0
})

// Sort sessions: active/paused (not ended) first, then by started_at (newer to oldest)
const sortedSessions = computed(() => {
  const sessions = [...sessionStore.getSessions]
  
  // Separate sessions into active/paused and ended
  const activePausedSessions = []
  const endedSessions = []
  
  sessions.forEach(session => {
    const status = (session.status || '').toLowerCase()
    // A session is ended only if status is explicitly 'ended'
    // Don't check ended_at field as it might be set even for active sessions
    const isEnded = status === 'ended'
    const isActiveOrPaused = status === 'active' || status === 'paused'
    
    if (isActiveOrPaused && !isEnded) {
      activePausedSessions.push(session)
    } else {
      endedSessions.push(session)
    }
  })
  
  // Sort active/paused sessions by started_at (newer first)
  activePausedSessions.sort((a, b) => {
    const dateA = a.started_at ? new Date(a.started_at).getTime() : 0
    const dateB = b.started_at ? new Date(b.started_at).getTime() : 0
    return dateB - dateA // Descending order (newer first)
  })
  
  // Sort ended sessions by started_at (newer first)
  endedSessions.sort((a, b) => {
    const dateA = a.started_at ? new Date(a.started_at).getTime() : 0
    const dateB = b.started_at ? new Date(b.started_at).getTime() : 0
    return dateB - dateA // Descending order (newer first)
  })
  
  // Combine: active/paused first, then ended
  const sorted = [...activePausedSessions, ...endedSessions]
  
  return sorted
})

// Toggle session expansion
const toggleSessionExpand = async (session) => {
  if (expandedSessionId.value === session.id) {
    expandedSessionId.value = null
  } else {
    // Fetch full session details if not already loaded
    if (!session.activities || session.activities.length === 0) {
      try {
        await sessionStore.fetchSessionById(session.id)
        const fullSession = sessionStore.getCurrentSession || session
        expandedSessionId.value = fullSession.id
      } catch (error) {
        console.error('Failed to fetch session details:', error)
        expandedSessionId.value = session.id
      }
    } else {
      expandedSessionId.value = session.id
    }
  }
}

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

// Trigger ripple animation on click
const triggerRipple = (cardType) => {
  clickedCard.value = cardType
  // Remove the class after animation completes to allow re-triggering
  setTimeout(() => {
    clickedCard.value = null
  }, 800) // Match animation duration
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
    } catch (error) {
      console.error('Failed to delete session:', error)
      closeDeleteModal()
    }
  }
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
  // Refresh editingSession (for edit modal)
  if (editingSession.value && editingSession.value.id) {
    await sessionStore.fetchSessionById(editingSession.value.id)
    editingSession.value = sessionStore.getCurrentSession || editingSession.value
  }
  // Refresh sessions list to update expanded view
  await loadSessions(currentPage.value)
  showSuccessMessage('Activity created successfully!')
}

const onActivityUpdated = async () => {
  closeActivityFormModal()
  // Refresh editingSession (for edit modal)
  if (editingSession.value && editingSession.value.id) {
    await sessionStore.fetchSessionById(editingSession.value.id)
    editingSession.value = sessionStore.getCurrentSession || editingSession.value
  }
  // Refresh sessions list to update expanded view
  await loadSessions(currentPage.value)
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
      // Refresh the session data
      await sessionStore.fetchSessionById(selectedSession.value.id)
      selectedSession.value = sessionStore.getCurrentSession || selectedSession.value
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
      // Refresh the session data
      await sessionStore.fetchSessionById(selectedSession.value.id)
      selectedSession.value = sessionStore.getCurrentSession || selectedSession.value
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
      // Refresh the session data
      await sessionStore.fetchSessionById(selectedSession.value.id)
      selectedSession.value = sessionStore.getCurrentSession || selectedSession.value
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
      // Refresh the session data
      await sessionStore.fetchSessionById(selectedSession.value.id)
      selectedSession.value = sessionStore.getCurrentSession || selectedSession.value
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

const openCreateActivityForSession = async (session) => {
  try {
    // Ensure we have the full session with ID
    if (!session || !session.id) {
      console.error('Session does not have an ID:', session)
      showSuccessMessage('Error: Session ID is missing')
      return
    }
    
    // Convert session ID to number to ensure it's valid
    const sessionIdNum = Number(session.id)
    if (!sessionIdNum || sessionIdNum <= 0 || isNaN(sessionIdNum)) {
      console.error('Invalid session ID:', session.id, 'Type:', typeof session.id)
      showSuccessMessage('Error: Invalid session ID')
      return
    }
    
    console.log('Opening create activity modal - Initial session:', {
      sessionId: sessionIdNum,
      sessionIdType: typeof sessionIdNum,
      session: session
    })
    
    // Fetch full session details to ensure we have all data and session exists
    await sessionStore.fetchSessionById(sessionIdNum)
    const fullSession = sessionStore.getCurrentSession || session
    
    // Verify the fetched session has a valid ID
    if (!fullSession || !fullSession.id) {
      console.error('Fetched session does not have an ID:', fullSession)
      showSuccessMessage('Error: Session not found')
      return
    }
    
    // Ensure the ID is a number
    const finalSessionId = Number(fullSession.id)
    if (!finalSessionId || finalSessionId <= 0 || isNaN(finalSessionId)) {
      console.error('Fetched session has invalid ID:', fullSession.id)
      showSuccessMessage('Error: Invalid session ID')
      return
    }
    
    // Set selectedSession to the full session so the activity form can access it
    selectedSession.value = {
      ...fullSession,
      id: finalSessionId // Ensure ID is a number
    }
    showCreateActivityModal.value = true
    
    console.log('Opening create activity modal for session:', {
      sessionId: finalSessionId,
      sessionIdType: typeof finalSessionId,
      session: selectedSession.value
    })
  } catch (error) {
    console.error('Failed to open create activity modal:', error)
    showSuccessMessage('Failed to open activity form: ' + (error.message || 'Unknown error'))
  }
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

// Functions for handling activities from expanded card view
const editActivityFromExpanded = async (session, activity) => {
  editingActivity.value = activity
  // Set selectedSession so the activity form can access the session ID
  if (!selectedSession.value || selectedSession.value.id !== session.id) {
    try {
      await sessionStore.fetchSessionById(session.id)
      selectedSession.value = sessionStore.getCurrentSession || session
    } catch (error) {
      console.error('Failed to fetch session details:', error)
      selectedSession.value = session
    }
  }
  showEditActivityModal.value = true
}

const pauseActivityFromExpanded = async (session, activity) => {
  try {
    await sessionStore.updateActivityStatus(session.id, activity.id, 'paused')
    showSuccessMessage('Activity paused successfully!')
    // Refresh the session data in the expanded view
    await refreshExpandedSession(session.id)
  } catch (error) {
    console.error('Failed to pause activity:', error)
    showSuccessMessage('Failed to pause activity')
  }
}

const resumeActivityFromExpanded = async (session, activity) => {
  try {
    await sessionStore.updateActivityStatus(session.id, activity.id, 'active')
    showSuccessMessage('Activity resumed successfully!')
    // Refresh the session data in the expanded view
    await refreshExpandedSession(session.id)
  } catch (error) {
    console.error('Failed to resume activity:', error)
    showSuccessMessage('Failed to resume activity')
  }
}

const endActivityFromExpanded = async (session, activity) => {
  if (confirm(`Are you sure you want to end this activity?`)) {
    try {
      await sessionStore.endActivity(session.id, activity.id)
      showSuccessMessage('Activity ended successfully!')
      // Refresh the session data in the expanded view
      await refreshExpandedSession(session.id)
    } catch (error) {
      console.error('Failed to end activity:', error)
      showSuccessMessage('Failed to end activity')
    }
  }
}

const toggleActivityMode = async (session, activity) => {
  try {
    const currentMode = activity.mode || 'single'
    const newMode = currentMode === 'single' ? 'multi' : 'single'
    
    // Optimistically update the UI
    const activityIndex = session.activities?.findIndex(a => a.id === activity.id)
    if (activityIndex !== -1 && session.activities) {
      session.activities[activityIndex] = { ...activity, mode: newMode }
    }
    
    const response = await sessionStore.updateActivity(session.id, activity.id, { mode: newMode })
    
    // Update with actual response data
    if (response?.data) {
      const updatedActivity = response.data
      if (activityIndex !== -1 && session.activities) {
        session.activities[activityIndex] = updatedActivity
      }
      // Also update the activity object passed to this function
      Object.assign(activity, updatedActivity)
    }
    
    showSuccessMessage(`Activity mode changed to ${newMode} successfully!`)
    
    // Refresh the session data in the expanded view to ensure consistency
    await refreshExpandedSession(session.id)
  } catch (error) {
    console.error('Failed to toggle activity mode:', error)
    // Revert optimistic update on error
    const activityIndex = session.activities?.findIndex(a => a.id === activity.id)
    if (activityIndex !== -1 && session.activities) {
      session.activities[activityIndex] = activity
    }
    showSuccessMessage('Failed to change activity mode')
  }
}

// Helper function to refresh session data in expanded view
const refreshExpandedSession = async (sessionId) => {
  try {
    // Fetch the full session details with activities to update the UI
    await sessionStore.fetchSessionById(sessionId)
  } catch (error) {
    console.error('Failed to refresh session:', error)
  }
}

// User Management Methods
const canAddUsersToActivity = (activity) => {
  // Button only shown if activity is active or paused, NOT ended
  return activity.status === 'active' || activity.status === 'paused'
}

// Check if user can be removed from activity
// Session customer cannot be removed from the first activity
const canRemoveUserFromActivity = (session, activity, userId) => {
  // Check if user is the session customer
  if (session.customer_id === userId) {
    // Check if this is the first activity of the session
    if (session.activities && session.activities.length > 0) {
      // Sort activities by ID (first created will have lowest ID) or by started_at
      const sortedActivities = [...session.activities].sort((a, b) => {
        // First try by ID (lower ID = created first)
        if (a.id && b.id) {
          return a.id - b.id
        }
        // Fallback to started_at
        if (a.started_at && b.started_at) {
          return new Date(a.started_at) - new Date(b.started_at)
        }
        return 0
      })
      
      // Check if current activity is the first one
      const firstActivity = sortedActivities[0]
      if (firstActivity && firstActivity.id === activity.id) {
        // This is the first activity and user is the session customer - cannot remove
        return false
      }
    }
  }
  
  // All other cases - can remove
  return true
}

// Helper methods to access reactive refs with dynamic keys
const getUserDropdownKey = (session, activity) => {
  return `${session.id}-${activity.id}`
}

// Get user search query for an activity
const getUserSearchQuery = (session, activity) => {
  if (!session || !activity || !session.id || !activity.id) return ''
  const key = getUserDropdownKey(session, activity)
  return userSearchQuery.value[key] || ''
}

// Get user search results for an activity
const getUserSearchResults = (session, activity) => {
  if (!session || !activity || !session.id || !activity.id) return []
  const key = getUserDropdownKey(session, activity)
  return userSearchResults.value[key] || []
}

// Get user search loading state
const getUserSearchLoading = (session, activity) => {
  if (!session || !activity || !session.id || !activity.id) return false
  const key = getUserDropdownKey(session, activity)
  return !!userSearchLoading.value[key]
}

// Get show user search dropdown state
const getShowUserSearchDropdown = (session, activity) => {
  if (!session || !activity || !session.id || !activity.id) return false
  const key = getUserDropdownKey(session, activity)
  return !!showUserSearchDropdown.value[key]
}

// Get selected user for an activity
const getSelectedUser = (session, activity) => {
  if (!session || !activity || !session.id || !activity.id) return null
  const key = getUserDropdownKey(session, activity)
  return selectedUser.value[key] || null
}

// Get dropdown style for fixed positioning
const getDropdownStyle = (session, activity) => {
  const key = getUserDropdownKey(session, activity)
  const pos = dropdownPosition.value[key]
  if (pos) {
    return {
      position: 'fixed',
      top: `${pos.top}px`,
      left: `${pos.left}px`,
      width: `${pos.width}px`,
      zIndex: '99999'
    }
  }
  return {}
}

// Load all users from store (for local filtering)
const loadAllUsers = async () => {
  try {
    await userStore.fetchUsers()
    allUsers.value = userStore.getUsers || []
  } catch (error) {
    console.error('Failed to load users:', error)
    allUsers.value = []
  }
}

// Check if a user with the same name (case-insensitive) exists
const userNameExists = (name) => {
  if (!name || name.trim().length === 0) return false
  
  const searchName = name.toLowerCase().trim()
  const allUsersList = allUsers.value.length > 0 ? allUsers.value : (userStore.getUsers || [])
  
  return allUsersList.some(user => {
    const userName = user.name?.toLowerCase().trim()
    return userName === searchName
  })
}

// Computed property to check if we can create a new user (per activity)
const canCreateNewUser = (session, activity) => {
  const key = getUserDropdownKey(session, activity)
  const query = userSearchQuery.value[key]
  
  if (!query || query.trim().length === 0) {
    return false
  }
  
  // Only allow creation if no user with the same name exists (case-insensitive)
  return !userNameExists(query)
}

// Load available users from API (called once when input is focused)
const loadAvailableUsers = async (session, activity) => {
  const key = getUserDropdownKey(session, activity)
  
  // If already cached, don't reload
  if (availableUsersCache.value[key] && availableUsersCache.value[key].length > 0) {
    return availableUsersCache.value[key]
  }
  
  userSearchLoading.value[key] = true
  
  try {
    // Get available users from API (respects business rules, includes all users with metadata)
    const availableUsers = await sessionStore.getAvailableUsersForActivity(session.id, activity.id)
    
    // Cache the results
    availableUsersCache.value[key] = availableUsers || []
    
    return availableUsersCache.value[key]
  } catch (error) {
    console.error('Failed to load available users:', error)
    availableUsersCache.value[key] = []
    return []
  } finally {
    userSearchLoading.value[key] = false
  }
}

// Search users with debouncing (local filtering from cached available users)
// This is synchronous like the customer search - filters from cached data
const searchUsers = (session, activity, query) => {
  const key = getUserDropdownKey(session, activity)
  
  if (!query || query.trim().length === 0) {
    userSearchResults.value[key] = []
    return
  }
  
  // Get cached available users (should already be loaded when input was focused)
  const availableUsers = availableUsersCache.value[key] || []
  
  // If cache is empty, don't search (cache should be loaded by handleUserSearch or handleUserSearchFocus)
  if (availableUsers.length === 0) {
    console.warn('User search: Cache is empty for', key, '- users may still be loading')
    userSearchResults.value[key] = []
    return
  }
  
  userSearchLoading.value[key] = true
  
  // Use setTimeout to allow UI to update before filtering (same as customer search)
  setTimeout(() => {
    try {
      // Filter locally by search query (case-insensitive partial match)
      const searchLower = query.toLowerCase().trim()
      const filtered = availableUsers.filter(user => {
        if (!user) return false
        const nameMatch = user.name?.toLowerCase().includes(searchLower)
        const emailMatch = user.email?.toLowerCase().includes(searchLower)
        return nameMatch || emailMatch
      })
      
      // Sort: available users first, then unavailable users (in active activities) at the end
      const sorted = filtered.sort((a, b) => {
        const aAvailable = a.is_available && !a.in_active_activity
        const bAvailable = b.is_available && !b.in_active_activity
        
        // If both are available or both are unavailable, maintain original order
        if (aAvailable === bAvailable) {
          return 0
        }
        
        // Available users come first (return -1 means a comes before b)
        return aAvailable ? -1 : 1
      })
      
      userSearchResults.value[key] = sorted
    } catch (error) {
      console.error('Failed to search users:', error)
      userSearchResults.value[key] = []
    } finally {
      userSearchLoading.value[key] = false
    }
  }, 50) // Small delay to show loading state
}

// Debounced search handler
const handleUserSearch = async (session, activity, event) => {
  const key = getUserDropdownKey(session, activity)
  const query = event.target.value
  userSearchQuery.value[key] = query
  
  // Clear existing timer
  if (userSearchDebounceTimer) {
    clearTimeout(userSearchDebounceTimer)
  }
  
  // If query is empty, clear results
  if (!query || query.trim().length === 0) {
    userSearchResults.value[key] = []
    selectedUser.value[key] = null
    showUserSearchDropdown.value[key] = false
    return
  }
  
  // Show dropdown when user starts typing
  showUserSearchDropdown.value[key] = true
  
  // Recalculate position
  await nextTick()
  calculateDropdownPosition(session, activity)
  
  // Ensure cache is loaded before searching (loadAvailableUsers handles loading state)
  if (!availableUsersCache.value[key] || availableUsersCache.value[key].length === 0) {
    await loadAvailableUsers(session, activity)
  }
  
  // Set new timer for debounced search
  userSearchDebounceTimer = setTimeout(() => {
    searchUsers(session, activity, query)
  }, 300) // 300ms debounce delay
}

// Calculate dropdown position for fixed positioning
const calculateDropdownPosition = (session, activity) => {
  const key = getUserDropdownKey(session, activity)
  // Find the input element
  const inputSelector = `.user-search-input[data-key="${key}"]`
  const inputElement = document.querySelector(inputSelector)
  
  if (inputElement) {
    const rect = inputElement.getBoundingClientRect()
    dropdownPosition.value[key] = {
      top: rect.bottom + window.scrollY + 8, // 8px gap
      left: rect.left + window.scrollX,
      width: rect.width
    }
  }
}

// Handle focus event - load available users when input is focused
const handleUserSearchFocus = async (session, activity) => {
  const key = getUserDropdownKey(session, activity)
  showUserSearchDropdown.value[key] = true
  
  // Calculate dropdown position
  await nextTick()
  calculateDropdownPosition(session, activity)
  
  // Load available users if not already cached (loadAvailableUsers handles loading state)
  if (!availableUsersCache.value[key] || availableUsersCache.value[key].length === 0) {
    await loadAvailableUsers(session, activity)
  }
  
  // If there's a query, show filtered results immediately
  const query = userSearchQuery.value[key]
  if (query && query.trim().length > 0) {
    searchUsers(session, activity, query)
  }
}

// Handle blur event (with delay to allow click on dropdown items)
const handleUserSearchBlur = (session, activity) => {
  const key = getUserDropdownKey(session, activity)
  // Delay hiding dropdown to allow click events on dropdown items
  setTimeout(() => {
    showUserSearchDropdown.value[key] = false
  }, 200)
}

// Select user from dropdown and add to activity
const selectUserForActivity = async (session, activity, user) => {
  // Don't allow selection if user is in active activity
  if (user.in_active_activity || !user.is_available) {
    return
  }
  
  const key = getUserDropdownKey(session, activity)
  selectedUser.value[key] = user
  userSearchQuery.value[key] = user.name
  userSearchResults.value[key] = []
  showUserSearchDropdown.value[key] = false
  
  // Add user to activity
  await addUserToActivity(session, activity, user.id)
  
  // Clear cache to reload available users (user should now be marked as in_current_activity)
  delete availableUsersCache.value[key]
  
  // Clear selection after adding
  setTimeout(() => {
    selectedUser.value[key] = null
    userSearchQuery.value[key] = ''
  }, 100)
}

// Select user from dropdown and add to activity (edit modal)
const selectUserForActivityInEdit = async (session, activity, user) => {
  // Don't allow selection if user is in active activity
  if (user.in_active_activity || !user.is_available) {
    return
  }
  
  const key = getUserDropdownKey(session, activity)
  selectedUser.value[key] = user
  userSearchQuery.value[key] = user.name
  userSearchResults.value[key] = []
  showUserSearchDropdown.value[key] = false
  
  // Add user to activity
  await addUserToActivityInEditModal(session, activity, user.id)
  
  // Clear cache to reload available users (user should now be marked as in_current_activity)
  delete availableUsersCache.value[key]
  
  // Clear selection after adding
  setTimeout(() => {
    selectedUser.value[key] = null
    userSearchQuery.value[key] = ''
  }, 100)
}

// Create new user and add to activity
const createAndSelectUser = async (session, activity) => {
  const key = getUserDropdownKey(session, activity)
  const userName = userSearchQuery.value[key]?.trim()
  
  if (!userName || userName.length === 0) {
    return
  }
  
  // Double-check that user doesn't exist (case-insensitive)
  if (userNameExists(userName)) {
    showSuccessMessage('A user with this name already exists')
    return
  }
  
  creatingUser.value[key] = true
  userSearchLoading.value[key] = true
  
  try {
    // Create new guest user with name and role="guest" only
    const newUserData = {
      name: userName,
      role: 'guest'
    }
    
    // Use the guest user endpoint which only requires name and role
    const response = await UserService.createGuestUser(newUserData)
    const newUser = response.data || response.user || response
    
    // Refresh users list from store to include the new user
    await loadAllUsers()
    
    // Ensure we have the new user with all its properties
    const createdUser = allUsers.value.find(u => u.id === newUser.id) || newUser
    
    // Add metadata for the new user (should be available since it's new)
    createdUser.in_active_activity = false
    createdUser.in_current_activity = false
    createdUser.is_available = true
    
    // Select the newly created user and add to activity
    selectedUser.value[key] = createdUser
    userSearchQuery.value[key] = createdUser.name
    userSearchResults.value[key] = []
    showUserSearchDropdown.value[key] = false
    
  // Add user to activity
  await addUserToActivity(session, activity, createdUser.id)
  
  // Clear cache to reload available users (new user should now appear)
  delete availableUsersCache.value[key]
  
  // Clear selection after adding
  setTimeout(() => {
    selectedUser.value[key] = null
    userSearchQuery.value[key] = ''
  }, 100)
  
  // Show success message
  showSuccessMessage(`User "${userName}" created and added successfully`)
  } catch (error) {
    console.error('Failed to create user:', error)
    showSuccessMessage('Failed to create user: ' + (error.message || 'Unknown error'))
  } finally {
    creatingUser.value[key] = false
    userSearchLoading.value[key] = false
  }
}

// Create new user and add to activity (edit modal)
const createAndSelectUserInEdit = async (session, activity) => {
  const key = getUserDropdownKey(session, activity)
  const userName = userSearchQuery.value[key]?.trim()
  
  if (!userName || userName.length === 0) {
    return
  }
  
  // Double-check that user doesn't exist (case-insensitive)
  if (userNameExists(userName)) {
    showSuccessMessage('A user with this name already exists')
    return
  }
  
  creatingUser.value[key] = true
  userSearchLoading.value[key] = true
  
  try {
    // Create new guest user with name and role="guest" only
    const newUserData = {
      name: userName,
      role: 'guest'
    }
    
    // Use the guest user endpoint which only requires name and role
    const response = await UserService.createGuestUser(newUserData)
    const newUser = response.data || response.user || response
    
    // Refresh users list from store to include the new user
    await loadAllUsers()
    
    // Ensure we have the new user with all its properties
    const createdUser = allUsers.value.find(u => u.id === newUser.id) || newUser
    
    // Add metadata for the new user (should be available since it's new)
    createdUser.in_active_activity = false
    createdUser.in_current_activity = false
    createdUser.is_available = true
    
    // Select the newly created user and add to activity
    selectedUser.value[key] = createdUser
    userSearchQuery.value[key] = createdUser.name
    userSearchResults.value[key] = []
    showUserSearchDropdown.value[key] = false
    
  // Add user to activity
  await addUserToActivityInEditModal(session, activity, createdUser.id)
  
  // Clear cache to reload available users (new user should now appear)
  delete availableUsersCache.value[key]
  
  // Clear selection after adding
  setTimeout(() => {
    selectedUser.value[key] = null
    userSearchQuery.value[key] = ''
  }, 100)
  
  // Show success message
  showSuccessMessage(`User "${userName}" created and added successfully`)
  } catch (error) {
    console.error('Failed to create user:', error)
    showSuccessMessage('Failed to create user: ' + (error.message || 'Unknown error'))
  } finally {
    creatingUser.value[key] = false
    userSearchLoading.value[key] = false
  }
}

const addUserToActivity = async (session, activity, userId = null) => {
  if (!userId) return
  
  try {
    const response = await sessionStore.addUserToActivity(session.id, activity.id, {
      user_id: userId
    })
    
    // Get the new activity user from response
    const newActivityUser = response?.data || response
    
    // Update local state - add user to activity
    if (!activity.activity_users) {
      activity.activity_users = []
    }
    
    // Add the new user to the activity
    if (newActivityUser && newActivityUser.user) {
      activity.activity_users.push(newActivityUser)
    }
    
    // Refresh the session to ensure all data is up to date
    await refreshExpandedSession(session.id)
    
    // Also update the session in the sessions list
    const sessionIndex = sessionStore.getSessions.findIndex(s => s.id === session.id)
    if (sessionIndex !== -1) {
      const sessionObj = sessionStore.getSessions[sessionIndex]
      if (sessionObj.activities) {
        const activityIndex = sessionObj.activities.findIndex(a => a.id === activity.id)
        if (activityIndex !== -1 && sessionStore.getCurrentSession) {
          const updatedActivity = sessionStore.getCurrentSession.activities?.find(a => a.id === activity.id)
          if (updatedActivity) {
            sessionObj.activities[activityIndex] = updatedActivity
          }
        }
      }
    }
    
    showSuccessMessage('User added successfully!')
  } catch (error) {
    console.error('Error adding user:', error)
    const message = error.message || 'Failed to add user'
    showSuccessMessage(message)
  }
}

const addUserToActivityInEditModal = async (session, activity, userId = null) => {
  if (!userId) return
  
  try {
    await sessionStore.addUserToActivity(session.id, activity.id, {
      user_id: userId
    })
    
    // Refresh the editing session to update activities
    if (editingSession.value && editingSession.value.id === session.id) {
      await sessionStore.fetchSessionById(session.id)
      editingSession.value = sessionStore.getCurrentSession || editingSession.value
    }
    
    showSuccessMessage('User added successfully!')
  } catch (error) {
    console.error('Error adding user:', error)
    const message = error.message || 'Failed to add user'
    showSuccessMessage(message)
  }
}

// Check if user has products in activity
const checkUserHasProducts = async (session, activity, userId) => {
  const key = getUserProductsKey(session, activity, userId)
  if (!key) return false
  
  // If products are already loaded, check them
  if (userProducts.value[key] && userProducts.value[key].length > 0) {
    return true
  }
  
  // Otherwise, load products to check
  try {
    loadingUserProducts.value[key] = true
    const response = await SessionService.getActivityProductsByUser(session.id, activity.id, userId)
    const products = response.data || response || []
    const userProductsList = products.filter(p => p.ordered_by_user_id === userId)
    userProducts.value[key] = userProductsList
    return userProductsList.length > 0
  } catch (error) {
    console.error('Error checking user products:', error)
    return false
  } finally {
    loadingUserProducts.value[key] = false
  }
}

// Show remove user warning modal
const showRemoveUserWarning = (session, activity, userId, userName) => {
  removingUserInfo.value = { session, activity, userId, userName }
  showRemoveUserWarningModal.value = true
}

// Close remove user warning modal
const closeRemoveUserWarningModal = () => {
  showRemoveUserWarningModal.value = false
  removingUserInfo.value = null
}

// Get user name from activity users
const getUserName = (activity, userId) => {
  if (!activity.activity_users) return 'Unknown'
  const activityUser = activity.activity_users.find(au => au.user_id === userId)
  return activityUser?.user?.name || 'Unknown'
}

const removeUserFromActivity = async (session, activity, userId) => {
  // Check if user has products first
  const hasProducts = await checkUserHasProducts(session, activity, userId)
  
  if (hasProducts) {
    // Show warning modal instead of removing
    const userName = getUserName(activity, userId)
    showRemoveUserWarning(session, activity, userId, userName)
    return
  }
  
  // If no products, proceed with normal confirmation
  if (!confirm('Remove this user from activity?')) return
  
  try {
    await sessionStore.removeUserFromActivity(session.id, activity.id, userId)
    
    // Update local state - remove user from activity
    if (activity.activity_users) {
      activity.activity_users = activity.activity_users.filter(
        au => au.user_id !== userId
      )
    }
    
    // Refresh the session data to ensure consistency
    await refreshExpandedSession(session.id)
    
    // Also update the session in the sessions list
    const sessionIndex = sessionStore.getSessions.findIndex(s => s.id === session.id)
    if (sessionIndex !== -1 && sessionStore.getCurrentSession) {
      const sessionObj = sessionStore.getSessions[sessionIndex]
      if (sessionObj.activities) {
        const activityIndex = sessionObj.activities.findIndex(a => a.id === activity.id)
        if (activityIndex !== -1) {
          const updatedActivity = sessionStore.getCurrentSession.activities?.find(a => a.id === activity.id)
          if (updatedActivity) {
            sessionObj.activities[activityIndex] = updatedActivity
          }
        }
      }
    }
    
    showSuccessMessage('User removed successfully!')
  } catch (error) {
    console.error('Error removing user:', error)
    showSuccessMessage('Failed to remove user')
  }
}

const removeUserFromActivityInEditModal = async (session, activity, userId) => {
  // Check if user has products first
  const hasProducts = await checkUserHasProducts(session, activity, userId)
  
  if (hasProducts) {
    // Show warning modal instead of removing
    const userName = getUserName(activity, userId)
    showRemoveUserWarning(session, activity, userId, userName)
    return
  }
  
  // If no products, proceed with normal confirmation
  if (!confirm('Remove this user from activity?')) return
  
  try {
    await sessionStore.removeUserFromActivity(session.id, activity.id, userId)
    
    // Refresh the editing session to update activities
    if (editingSession.value && editingSession.value.id === session.id) {
      await sessionStore.fetchSessionById(session.id)
      editingSession.value = sessionStore.getCurrentSession || editingSession.value
    }
    
    showSuccessMessage('User removed successfully!')
  } catch (error) {
    console.error('Error removing user:', error)
    showSuccessMessage('Failed to remove user')
  }
}

// ==================== Activity Products Methods ====================

// Get key for user products state
const getUserProductsKey = (session, activity, userId) => {
  if (!session || !activity || !userId) return null
  return `${session.id}-${activity.id}-${userId}`
}

// Toggle user products section
const toggleUserProducts = async (session, activity, userId) => {
  const key = getUserProductsKey(session, activity, userId)
  if (!key) return
  
  const isExpanded = expandedUserProducts.value[key] || false
  expandedUserProducts.value[key] = !isExpanded
  
  // Load products if expanding for the first time
  if (!isExpanded && (!userProducts.value[key] || userProducts.value[key].length === 0)) {
    await loadUserProducts(session, activity, userId)
  }
  
  // Load products if not already loaded
  if (!productStore.getProducts || productStore.getProducts.length === 0) {
    await productStore.fetchProducts()
  }
}

// Check if user products section is expanded
const isUserProductsExpanded = (session, activity, userId) => {
  const key = getUserProductsKey(session, activity, userId)
  return key ? (expandedUserProducts.value[key] || false) : false
}

// Get selected product for user
const getSelectedProduct = (session, activity, userId) => {
  const key = getUserProductsKey(session, activity, userId)
  return key ? (selectedProduct.value[key] || null) : null
}

// Set selected product for user
const setSelectedProduct = (session, activity, userId, productId) => {
  const key = getUserProductsKey(session, activity, userId)
  if (key) {
    selectedProduct.value[key] = productId
  }
}

// Get product quantity for user
const getProductQuantity = (session, activity, userId) => {
  const key = getUserProductsKey(session, activity, userId)
  return key ? (productQuantity.value[key] || 1) : 1
}

// Set product quantity for user
const setProductQuantity = (session, activity, userId, quantity) => {
  const key = getUserProductsKey(session, activity, userId)
  if (key) {
    productQuantity.value[key] = parseInt(quantity) || 1
  }
}

// Check if can add product
const canAddProduct = (session, activity, userId) => {
  const productId = getSelectedProduct(session, activity, userId)
  const quantity = getProductQuantity(session, activity, userId)
  return productId && quantity && quantity > 0
}

// Get adding product state
const getAddingProduct = (session, activity, userId) => {
  const key = getUserProductsKey(session, activity, userId)
  return key ? (addingProduct.value[key] || false) : false
}

// Get loading user products state
const getLoadingUserProducts = (session, activity, userId) => {
  const key = getUserProductsKey(session, activity, userId)
  return key ? (loadingUserProducts.value[key] || false) : false
}

// Get user products
const getUserProducts = (session, activity, userId) => {
  const key = getUserProductsKey(session, activity, userId)
  return key ? (userProducts.value[key] || []) : []
}

// Load products for a user
const loadUserProducts = async (session, activity, userId) => {
  const key = getUserProductsKey(session, activity, userId)
  if (!key) return
  
  loadingUserProducts.value[key] = true
  
  try {
    const response = await SessionService.getActivityProductsByUser(session.id, activity.id, userId)
    const products = response.data || response || []
    userProducts.value[key] = products.filter(p => p.ordered_by_user_id === userId)
  } catch (error) {
    console.error('Error loading user products:', error)
    userProducts.value[key] = []
  } finally {
    loadingUserProducts.value[key] = false
  }
}

// Add product to user
const addProductToUser = async (session, activity, userId) => {
  const key = getUserProductsKey(session, activity, userId)
  if (!key) return
  
  const productId = getSelectedProduct(session, activity, userId)
  const quantity = getProductQuantity(session, activity, userId)
  
  if (!productId || !quantity || quantity < 1) {
    showSuccessMessage('Please select a product and enter a quantity')
    return
  }
  
  addingProduct.value[key] = true
  
  try {
    await SessionService.addProductToActivity(session.id, activity.id, {
      product_id: productId,
      quantity: quantity,
      ordered_by_user_id: userId
    })
    
    // Reload user products
    await loadUserProducts(session, activity, userId)
    
    // Clear selection
    selectedProduct.value[key] = null
    productQuantity.value[key] = 1
    
    // Refresh session to update totals
    if (editingSession.value && editingSession.value.id === session.id) {
      await sessionStore.fetchSessionById(session.id)
      editingSession.value = sessionStore.getCurrentSession || editingSession.value
    } else {
      await refreshExpandedSession(session.id)
    }
    
    showSuccessMessage('Product added successfully!')
  } catch (error) {
    console.error('Error adding product:', error)
    showSuccessMessage(error.message || 'Failed to add product')
  } finally {
    addingProduct.value[key] = false
  }
}

// Delete product from user
const deleteProductFromUser = async (session, activity, userId, productOrderId) => {
  if (!confirm('Remove this product order?')) return
  
  try {
    await SessionService.deleteActivityProduct(session.id, activity.id, productOrderId)
    
    // Reload user products
    await loadUserProducts(session, activity, userId)
    
    // Refresh session to update totals
    if (editingSession.value && editingSession.value.id === session.id) {
      await sessionStore.fetchSessionById(session.id)
      editingSession.value = sessionStore.getCurrentSession || editingSession.value
    } else {
      await refreshExpandedSession(session.id)
    }
    
    showSuccessMessage('Product removed successfully!')
  } catch (error) {
    console.error('Error deleting product:', error)
    showSuccessMessage(error.message || 'Failed to remove product')
  }
}

// Custom Product Dropdown Methods
const toggleProductDropdown = (session, activity, userId) => {
  const key = getUserProductsKey(session, activity, userId)
  if (!key) return
  showProductDropdown.value[key] = !showProductDropdown.value[key]
}

const getShowProductDropdown = (session, activity, userId) => {
  const key = getUserProductsKey(session, activity, userId)
  return key ? (showProductDropdown.value[key] || false) : false
}

const selectProduct = (session, activity, userId, productId) => {
  setSelectedProduct(session, activity, userId, productId)
  const key = getUserProductsKey(session, activity, userId)
  if (key) {
    showProductDropdown.value[key] = false
  }
}

const getSelectedProductText = (session, activity, userId) => {
  const productId = getSelectedProduct(session, activity, userId)
  if (!productId) return null
  const product = productStore.getProducts.find(p => p.id === productId)
  return product ? `${product.name} - $${parseFloat(product.price || 0).toFixed(2)}` : null
}


// Timer functionality for real-time updates
const currentTime = ref(new Date())
let timerInterval = null
const expiredActivitiesHandled = ref(new Set()) // Track activities we've already auto-ended

// Update current time every second
const startTimer = () => {
  if (timerInterval) return
  timerInterval = setInterval(() => {
    currentTime.value = new Date()
    // Check for expired activities and auto-end them
    checkAndEndExpiredActivities()
  }, 1000)
}

// Check and auto-end expired activities
const checkAndEndExpiredActivities = async () => {
  if (!sessionStore.getSessions || sessionStore.getSessions.length === 0) return
  
  // Check all sessions and their activities
  for (const session of sessionStore.getSessions) {
    if (!session.activities || session.activities.length === 0) continue
    
    for (const activity of session.activities) {
      // Skip if already handled or already ended
      const activityKey = `${session.id}-${activity.id}`
      if (expiredActivitiesHandled.value.has(activityKey)) continue
      if (activity.status === 'ended') continue
      
      // Check if activity has expired (has ended_at and it's in the past)
      if (activity.ended_at && activity.status === 'active') {
        const endTime = new Date(activity.ended_at)
        const now = currentTime.value
        
        if (endTime.getTime() <= now.getTime()) {
          // Activity has expired - mark as handled and trigger API call
          expiredActivitiesHandled.value.add(activityKey)
          
          try {
            // Call API to end the activity
            await sessionStore.endActivity(session.id, activity.id)
            
            // Refresh the session data to update the UI
            await refreshExpandedSession(session.id)
            
            // Also refresh the sessions list
            await loadSessions(currentPage.value)
          } catch (error) {
            console.error('Failed to auto-end expired activity:', error)
            // Remove from handled set so we can retry
            expiredActivitiesHandled.value.delete(activityKey)
          }
        }
      }
    }
  }
}

// Calculate time display for session or activity
const calculateTime = (item) => {
  if (!item) return null
  
  const now = currentTime.value
  const startTime = item.started_at ? new Date(item.started_at) : null
  const endTime = item.ended_at ? new Date(item.ended_at) : null
  
  // If we have an end time (duration is set), show countdown
  if (endTime) {
    // Count down (has duration limit) - show remaining time
    const diff = endTime.getTime() - now.getTime()
    
    if (diff <= 0) {
      // Time has expired
      return { hours: 0, minutes: 0, isCountdown: true, expired: true }
    }
    
    // Calculate remaining hours and minutes
    const totalMinutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    
    return { 
      hours: Math.max(0, hours), 
      minutes: Math.max(0, minutes), 
      isCountdown: true, 
      expired: false 
    }
  } 
  // If we have a start time but no end time (no limit), count up
  else if (startTime) {
    // Count up (no limit) - show elapsed time from start
    const diff = now.getTime() - startTime.getTime()
    
    if (diff < 0) {
      // Start time is in the future (shouldn't happen, but handle it)
      return { hours: 0, minutes: 0, isCountdown: false, expired: false }
    }
    
    // Calculate elapsed hours and minutes
    const totalMinutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    
    return { 
      hours, 
      minutes, 
      isCountdown: false, 
      expired: false 
    }
  }
  
  // No start time or end time available
  return null
}

// Check if session should show timer (not chillout and has single activity)
const shouldShowSessionTimer = (session) => {
  if (!session.activities || session.activities.length === 0) return false
  if (session.status !== 'active') return false
  const isChillout = getSessionType(session) === 'Chillout'
  if (isChillout) return false
  // Show in session card only if single activity (if multiple, show in activity cards)
  if (session.activities.length === 1) {
    const activity = session.activities[0]
    return shouldShowActivityTimer(activity)
  }
  return false
}

// Check if activity should show timer (playing type and active)
const shouldShowActivityTimer = (activity) => {
  if (!activity) return false
  if (activity.status !== 'active') return false
  // Must be playing type (has device)
  if (!(activity.activity_type === 'playing' || activity.device_id)) return false
  // Must have either started_at or ended_at to calculate time
  return !!(activity.started_at || activity.ended_at)
}

const showSuccessMessage = (message) => {
  successMessage.value = message
  showSuccess.value = true
  setTimeout(() => {
    showSuccess.value = false
  }, 3000)
}

// Close dropdown when clicking outside
const handleClickOutside = (e) => {
  // Close all product dropdowns when clicking outside
  if (!e.target.closest('.product-dropdown-wrapper')) {
    Object.keys(showProductDropdown.value).forEach(key => {
      showProductDropdown.value[key] = false
    })
  }
}

// Lifecycle
onMounted(async () => {
  console.log('SessionsSection: Component mounted, loading sessions...')
  await loadAllUsers() // Load users for search functionality
  // Load products for dropdown
  if (productStore.getProducts.length === 0) {
    await productStore.fetchProducts()
  }
  loadSessions(1)
  startTimer()
  // Add click outside handler
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  // Remove click outside handler
  document.removeEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval)
  }
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

/* Timer expired styles */
.timer-expired {
  animation: pulse-expired 2s ease-in-out infinite;
  border-color: #ef4444 !important;
}

.timer-expired .timer-display {
  color: #ef4444;
}

.timer-expired-indicator {
  color: #ef4444;
  font-size: 1.2em;
  animation: blink 1s ease-in-out infinite;
}

.timer-expired-message {
  font-size: 0.75rem;
  color: #ef4444;
  font-weight: 600;
  text-align: center;
  margin-top: 0.25rem;
  animation: blink 1s ease-in-out infinite;
}

@keyframes pulse-expired {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(239, 68, 68, 0);
  }
}

@keyframes blink {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* User Management Styles */
.activity-card-users {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-left: -3px;
  margin-right: -3px;
}

.users-label {
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: rgba(255, 255, 255, 0.9);
}

.activity-user-card {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.375rem;
  margin-bottom: 0.5rem;
}

.user-name {
  flex: 1;
  color: rgba(255, 255, 255, 0.9);
}

.user-duration {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
}

.user-remove-btn {
  background: transparent;
  border: none;
  color: #ef4444;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  border-radius: 0.25rem;
  transition: background-color 0.2s;
}

.user-remove-btn:hover {
  background: rgba(239, 68, 68, 0.2);
}

.user-remove-btn.small {
  padding: 0.125rem;
}

.user-remove-btn svg {
  width: 16px;
  height: 16px;
}

.no-users-message {
  color: rgba(255, 255, 255, 0.5);
  font-style: italic;
  padding: 0.5rem;
}

.add-user-section {
  margin-top: 0.75rem;
  position: relative;
}

.add-user-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* User Search Input Styles (matching customer search) */
/* User Search Input Styles - reuses customer-search-wrapper and customer-dropdown classes from components.css */
.user-search-dropdown {
  /* Ensure dropdown is properly positioned and visible */
  position: absolute !important;
  z-index: 99999 !important; /* Extremely high z-index to appear above everything */
  /* Ensure dropdown is not clipped by parent containers */
  isolation: isolate !important;
}

/* Ensure parent containers don't clip the dropdown */
.add-user-section,
.activity-card-users,
.activity-card,
.expanded-section {
  overflow: visible !important;
}

.dropdown-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: rgba(255, 255, 255, 0.02) !important;
}

.dropdown-item.disabled:hover {
  background: rgba(255, 255, 255, 0.02) !important;
  border-left: none;
}

.user-status-badge {
  display: block;
  font-size: 0.7rem;
  color: #f59e0b;
  margin-top: 0.25rem;
  font-style: italic;
  white-space: normal;
  word-wrap: break-word;
}


.activity-users {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.activity-user-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.375rem;
  margin-bottom: 0.5rem;
}
</style>


