import { defineStore } from 'pinia'
import SessionService from '@/api/sessions.js'

export const useSessionStore = defineStore('session', {
  state: () => ({
    sessions: [],
    currentSession: null,
    activities: [], // Activities for current session
    activityUsers: [], // Users for current activity
    loading: false,
    error: null,
    pagination: null,
  }),

  getters: {
    getSessions: (state) => state.sessions,
    getCurrentSession: (state) => state.currentSession,
    getActivities: (state) => state.activities,
    getActivityUsers: (state) => state.activityUsers,
  },

  actions: {
    /**
     * Fetch all sessions
     */
    async fetchSessions(params = {}) {
      this.loading = true
      this.error = null

      try {
        console.log('=== SessionStore: Fetching Sessions ===')
        console.log('Params:', params)
        
        const response = await SessionService.getAllSessions(params)
        
        console.log('=== SessionStore: Processing Response ===')
        console.log('Response type:', typeof response)
        console.log('Response:', response)
        
        // The API service should return { sessions: [...], pagination: {...} }
        if (response && typeof response === 'object') {
          if (response.sessions && Array.isArray(response.sessions)) {
            // Expected format: { sessions: [...], pagination: {...} }
            this.sessions = response.sessions
            this.pagination = response.pagination || null
            console.log('✓ SessionStore: Set sessions from response.sessions array')
            console.log('  Sessions count:', this.sessions.length)
            console.log('  Pagination:', this.pagination)
          } else if (Array.isArray(response)) {
            // Direct array format
            this.sessions = response
            this.pagination = null
            console.log('✓ SessionStore: Set sessions from direct array')
            console.log('  Sessions count:', this.sessions.length)
          } else if (response.data) {
            // Nested data format (fallback)
            if (Array.isArray(response.data)) {
              this.sessions = response.data
              this.pagination = response.pagination || null
              console.log('✓ SessionStore: Set sessions from response.data array')
              console.log('  Sessions count:', this.sessions.length)
            } else if (response.data.sessions && Array.isArray(response.data.sessions)) {
              this.sessions = response.data.sessions
              this.pagination = response.data.pagination || response.pagination || null
              console.log('✓ SessionStore: Set sessions from response.data.sessions')
              console.log('  Sessions count:', this.sessions.length)
            } else {
              console.warn('⚠ SessionStore: Unexpected response.data format')
              console.warn('  response.data:', response.data)
              this.sessions = []
            }
          } else {
            console.warn('⚠ SessionStore: Response object has no sessions or data property')
            console.warn('  Response keys:', Object.keys(response))
            this.sessions = []
          }
        } else {
          console.error('✗ SessionStore: Response is not an object')
          console.error('  Response:', response)
          this.sessions = []
        }
        
        // Final validation: Ensure sessions is always an array
        if (!Array.isArray(this.sessions)) {
          console.error('✗ SessionStore: CRITICAL - Sessions is not an array!')
          console.error('  Sessions value:', this.sessions)
          console.error('  Type:', typeof this.sessions)
          this.sessions = []
        }
        
        // Log final state
        console.log('=== SessionStore: Final State ===')
        console.log('Sessions array length:', this.sessions.length)
        console.log('First session:', this.sessions[0] || 'No sessions')
        console.log('Has pagination:', !!this.pagination)
        console.log('=============================')
        
        return response
      } catch (error) {
        console.error('SessionStore: Failed to fetch sessions:', error)
        console.error('SessionStore: Error details:', {
          message: error.message,
          response: error.response,
          status: error.response?.status
        })

        // Provide more specific error messages
        if (error.message.includes('401') || error.response?.status === 401) {
          this.error = 'You need to be logged in to view sessions. Please login first.'
        } else if (error.message.includes('403') || error.response?.status === 403) {
          this.error = 'You do not have permission to view sessions.'
        } else if (error.message.includes('Network Error') || !error.response) {
          this.error = 'Cannot connect to server. Please check if the backend is running.'
        } else {
          this.error = error.message || 'Failed to fetch sessions'
        }

        // Reset sessions on error
        this.sessions = []
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Fetch session by ID
     * @param {number} id - Session ID
     */
    async fetchSessionById(id) {
      this.loading = true
      this.error = null

      try {
        const response = await SessionService.getSessionById(id)
        const session = response.data || response
        this.currentSession = session
        // Also update the session in the sessions list if it exists
        const index = this.sessions.findIndex(s => s.id === id)
        if (index !== -1) {
          this.sessions[index] = session
        }
        return session
      } catch (error) {
        this.error = error.message || `Failed to fetch session with ID ${id}`
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Create new session
     * @param {Object} sessionData - Session data
     */
    async createSession(sessionData) {
      this.loading = true
      this.error = null

      try {
        console.log('SessionStore: Creating session with data:', sessionData)
        const response = await SessionService.createSession(sessionData)
        console.log('SessionStore: Create session response:', response)
        
        // Handle different response formats from API
        let newSession = null
        if (response?.data) {
          // Response has nested data property
          newSession = response.data
        } else if (response?.session) {
          // Response has session property
          newSession = response.session
        } else if (response?.id) {
          // Response is the session object directly
          newSession = response
        }
        
        if (newSession) {
          // Add the new session to the sessions list
          this.sessions.push(newSession)
        } else {
          console.warn('SessionStore: Could not extract session from response:', response)
        }
        
        return response
      } catch (error) {
        console.error('SessionStore: Failed to create session:', error)
        this.error = error.message || 'Failed to create session'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Update session
     * @param {number} id - Session ID
     * @param {Object} sessionData - Session data
     */
    async updateSession(id, sessionData) {
      this.loading = true
      this.error = null

      try {
        console.log('SessionStore: Updating session', id, 'with data:', sessionData)
        const response = await SessionService.updateSession(id, sessionData)
        console.log('SessionStore: Update session response:', response)
        
        // Handle different response formats from API
        let updatedSession = null
        if (response?.data) {
          updatedSession = response.data
        } else if (response?.session) {
          updatedSession = response.session
        } else if (response?.id) {
          updatedSession = response
        }

        if (updatedSession) {
          // Update the session in the sessions list
          const index = this.sessions.findIndex(s => s.id === id)
          if (index !== -1) {
            this.sessions[index] = updatedSession
          }

          // If we're updating the current session, update that too
          if (this.currentSession && this.currentSession.id === id) {
            this.currentSession = { ...this.currentSession, ...updatedSession }
          }
        } else {
          console.warn('SessionStore: Could not extract session from update response:', response)
        }

        return response
      } catch (error) {
        console.error('SessionStore: Failed to update session:', error)
        this.error = error.message || 'Failed to update session'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Delete session
     * @param {number} id - Session ID
     */
    async deleteSession(id) {
      this.loading = true
      this.error = null

      try {
        const response = await SessionService.deleteSession(id)

        // Remove the session from the sessions list
        this.sessions = this.sessions.filter(s => s.id !== id)

        // Clear current session if it was deleted
        if (this.currentSession && this.currentSession.id === id) {
          this.currentSession = null
        }

        return response
      } catch (error) {
        this.error = error.message || 'Failed to delete session'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * End session
     * @param {number} id - Session ID
     * @param {Object} data - Optional data
     */
    async endSession(id, data = {}) {
      this.loading = true
      this.error = null

      try {
        const response = await SessionService.endSession(id, data)
        // Refresh the session
        await this.fetchSessionById(id)
        return response
      } catch (error) {
        this.error = error.message || 'Failed to end session'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Pause session
     * @param {number} id - Session ID
     */
    async pauseSession(id) {
      this.loading = true
      this.error = null

      try {
        const response = await SessionService.pauseSession(id)
        // Refresh the session
        await this.fetchSessionById(id)
        return response
      } catch (error) {
        this.error = error.message || 'Failed to pause session'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Resume session
     * @param {number} id - Session ID
     */
    async resumeSession(id) {
      this.loading = true
      this.error = null

      try {
        const response = await SessionService.resumeSession(id)
        // Refresh the session
        await this.fetchSessionById(id)
        return response
      } catch (error) {
        this.error = error.message || 'Failed to resume session'
        throw error
      } finally {
        this.loading = false
      }
    },

    // ==================== Activity Actions ====================

    /**
     * Fetch activities for a session
     * @param {number} sessionId - Session ID
     */
    async fetchSessionActivities(sessionId) {
      this.loading = true
      this.error = null

      try {
        const response = await SessionService.getSessionActivities(sessionId)
        const activities = Array.isArray(response) ? response : (response.data || [])
        this.activities = activities
        return activities
      } catch (error) {
        this.error = error.message || 'Failed to fetch session activities'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Fetch activity by ID
     * @param {number} sessionId - Session ID
     * @param {number} activityId - Activity ID
     */
    async fetchActivityById(sessionId, activityId) {
      this.loading = true
      this.error = null

      try {
        const response = await SessionService.getActivityById(sessionId, activityId)
        const activity = response.data || response
        // Update in activities array if it exists
        const index = this.activities.findIndex(a => a.id === activityId)
        if (index !== -1) {
          this.activities[index] = activity
        }
        return activity
      } catch (error) {
        this.error = error.message || `Failed to fetch activity with ID ${activityId}`
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Create new activity
     * @param {number} sessionId - Session ID
     * @param {Object} activityData - Activity data
     */
    async createActivity(sessionId, activityData) {
      this.loading = true
      this.error = null

      try {
        const response = await SessionService.createActivity(sessionId, activityData)
        const newActivity = response.data || response
        this.activities.push(newActivity)
        // Also refresh the current session to update activities
        if (this.currentSession && this.currentSession.id === sessionId) {
          await this.fetchSessionById(sessionId)
        }
        return response
      } catch (error) {
        this.error = error.message || 'Failed to create activity'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Update activity
     * @param {number} sessionId - Session ID
     * @param {number} activityId - Activity ID
     * @param {Object} activityData - Activity data
     */
    async updateActivity(sessionId, activityId, activityData) {
      this.loading = true
      this.error = null

      try {
        const response = await SessionService.updateActivity(sessionId, activityId, activityData)
        const updatedActivity = response.data || response

        // Update the activity in the activities list
        const index = this.activities.findIndex(a => a.id === activityId)
        if (index !== -1) {
          this.activities[index] = updatedActivity
        }

        // Refresh the current session to update activities
        if (this.currentSession && this.currentSession.id === sessionId) {
          await this.fetchSessionById(sessionId)
        }

        return response
      } catch (error) {
        this.error = error.message || 'Failed to update activity'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Delete activity
     * @param {number} sessionId - Session ID
     * @param {number} activityId - Activity ID
     */
    async deleteActivity(sessionId, activityId) {
      this.loading = true
      this.error = null

      try {
        const response = await SessionService.deleteActivity(sessionId, activityId)

        // Remove the activity from the activities list
        this.activities = this.activities.filter(a => a.id !== activityId)

        // Refresh the current session to update activities
        if (this.currentSession && this.currentSession.id === sessionId) {
          await this.fetchSessionById(sessionId)
        }

        return response
      } catch (error) {
        this.error = error.message || 'Failed to delete activity'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Update activity status
     * @param {number} sessionId - Session ID
     * @param {number} activityId - Activity ID
     * @param {string} status - Status (active, paused, ended)
     */
    async updateActivityStatus(sessionId, activityId, status) {
      this.loading = true
      this.error = null

      try {
        const response = await SessionService.updateActivityStatus(sessionId, activityId, status)
        // Refresh the activity
        await this.fetchActivityById(sessionId, activityId)
        // Refresh the current session to update activities
        if (this.currentSession && this.currentSession.id === sessionId) {
          await this.fetchSessionById(sessionId)
        }
        return response
      } catch (error) {
        this.error = error.message || 'Failed to update activity status'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * End activity
     * @param {number} sessionId - Session ID
     * @param {number} activityId - Activity ID
     * @param {Object} data - Optional data
     */
    async endActivity(sessionId, activityId, data = {}) {
      this.loading = true
      this.error = null

      try {
        const response = await SessionService.endActivity(sessionId, activityId, data)
        // Refresh the activity
        await this.fetchActivityById(sessionId, activityId)
        // Refresh the current session to update activities
        if (this.currentSession && this.currentSession.id === sessionId) {
          await this.fetchSessionById(sessionId)
        }
        return response
      } catch (error) {
        this.error = error.message || 'Failed to end activity'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Calculate activity duration
     * @param {number} sessionId - Session ID
     * @param {number} activityId - Activity ID
     */
    async calculateActivityDuration(sessionId, activityId) {
      this.loading = true
      this.error = null

      try {
        const response = await SessionService.calculateActivityDuration(sessionId, activityId)
        // Refresh the activity
        await this.fetchActivityById(sessionId, activityId)
        // Refresh the current session to update activities
        if (this.currentSession && this.currentSession.id === sessionId) {
          await this.fetchSessionById(sessionId)
        }
        return response
      } catch (error) {
        this.error = error.message || 'Failed to calculate activity duration'
        throw error
      } finally {
        this.loading = false
      }
    },

    // ==================== Activity User Actions ====================

    /**
     * Add user to activity
     * @param {number} sessionId - Session ID
     * @param {number} activityId - Activity ID
     * @param {Object} data - User data (user_id, duration_hours, cost_share)
     */
    async addUserToActivity(sessionId, activityId, data) {
      this.loading = true
      this.error = null

      try {
        const response = await SessionService.addUserToActivity(sessionId, activityId, data)
        const newUser = response.data || response
        this.activityUsers.push(newUser)
        // Refresh the activity to get updated users
        await this.fetchActivityById(sessionId, activityId)
        // Refresh the current session to update activities
        if (this.currentSession && this.currentSession.id === sessionId) {
          await this.fetchSessionById(sessionId)
        }
        return response
      } catch (error) {
        this.error = error.message || 'Failed to add user to activity'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Remove user from activity
     * @param {number} sessionId - Session ID
     * @param {number} activityId - Activity ID
     * @param {number} userId - User ID
     */
    async removeUserFromActivity(sessionId, activityId, userId) {
      this.loading = true
      this.error = null

      try {
        const response = await SessionService.removeUserFromActivity(sessionId, activityId, userId)

        // Remove the user from the activityUsers list
        this.activityUsers = this.activityUsers.filter(u => u.user_id !== userId)

        // Refresh the activity to get updated users
        await this.fetchActivityById(sessionId, activityId)
        // Refresh the current session to update activities
        if (this.currentSession && this.currentSession.id === sessionId) {
          await this.fetchSessionById(sessionId)
        }

        return response
      } catch (error) {
        this.error = error.message || 'Failed to remove user from activity'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Clear error message
     */
    clearError() {
      this.error = null
    },
  },
})



