import { defineStore } from 'pinia'
import UserService from '@/api/users.js'

export const useUserStore = defineStore('user', {
  state: () => ({
    users: [],
    currentUser: null,
    loading: false,
    error: null,
    pagination: null,
    roles: [],
    statuses: [],
  }),

  getters: {
    getUsers: (state) => state.users,
    getCurrentUser: (state) => state.currentUser,
  },

  actions: {
    /**
     * Fetch all users
     */
    async fetchUsers(params = {}) {
      this.loading = true
      this.error = null

      try {
        console.log('=== UserStore: Fetching Users ===')
        console.log('Params:', params)
        
        const response = await UserService.getAllUsers(params)
        
        console.log('=== UserStore: Processing Response ===')
        console.log('Response type:', typeof response)
        console.log('Response:', response)
        
        // The API service should return { users: [...], pagination: {...} }
        // But handle all possible formats as a safety net
        if (response && typeof response === 'object') {
          if (response.users && Array.isArray(response.users)) {
            // Expected format: { users: [...], pagination: {...} }
            this.users = response.users
            this.pagination = response.pagination || null
            console.log('✓ UserStore: Set users from response.users array')
            console.log('  Users count:', this.users.length)
            console.log('  Pagination:', this.pagination)
          } else if (Array.isArray(response)) {
            // Direct array format (shouldn't happen after API processing, but handle it)
            this.users = response
            this.pagination = null
            console.log('✓ UserStore: Set users from direct array')
            console.log('  Users count:', this.users.length)
          } else if (response.data) {
            // Nested data format (fallback)
            if (Array.isArray(response.data)) {
              this.users = response.data
              this.pagination = response.pagination || null
              console.log('✓ UserStore: Set users from response.data array')
              console.log('  Users count:', this.users.length)
            } else if (response.data.users && Array.isArray(response.data.users)) {
              this.users = response.data.users
              this.pagination = response.data.pagination || response.pagination || null
              console.log('✓ UserStore: Set users from response.data.users')
              console.log('  Users count:', this.users.length)
            } else {
              console.warn('⚠ UserStore: Unexpected response.data format')
              console.warn('  response.data:', response.data)
              this.users = []
            }
          } else {
            console.warn('⚠ UserStore: Response object has no users or data property')
            console.warn('  Response keys:', Object.keys(response))
            this.users = []
          }
        } else {
          console.error('✗ UserStore: Response is not an object')
          console.error('  Response:', response)
          this.users = []
        }
        
        // Final validation: Ensure users is always an array
        if (!Array.isArray(this.users)) {
          console.error('✗ UserStore: CRITICAL - Users is not an array!')
          console.error('  Users value:', this.users)
          console.error('  Type:', typeof this.users)
          this.users = []
        }
        
        // Log final state
        console.log('=== UserStore: Final State ===')
        console.log('Users array length:', this.users.length)
        console.log('First user:', this.users[0] || 'No users')
        console.log('Has pagination:', !!this.pagination)
        console.log('=============================')
        
        return response
      } catch (error) {
        console.error('UserStore: Failed to fetch users:', error)
        console.error('UserStore: Error details:', {
          message: error.message,
          response: error.response,
          status: error.response?.status
        })

        // Provide more specific error messages
        if (error.message.includes('401') || error.response?.status === 401) {
          this.error = 'You need to be logged in to view users. Please login first.'
        } else if (error.message.includes('403') || error.response?.status === 403) {
          this.error = 'You do not have permission to view users.'
        } else if (error.message.includes('Network Error') || !error.response) {
          this.error = 'Cannot connect to server. Please check if the backend is running.'
        } else {
          this.error = error.message || 'Failed to fetch users'
        }

        // Reset users on error
        this.users = []
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Fetch authenticated user
     */
    async fetchCurrentUser() {
      this.loading = true
      this.error = null

      try {
        const response = await UserService.getAuthenticatedUser()
        this.currentUser = response.user || response.data || response
        return response
      } catch (error) {
        this.error = error.message || 'Failed to fetch user'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Fetch user by ID
     * @param {number} id - User ID
     */
    async fetchUserById(id) {
      this.loading = true
      this.error = null

      try {
        const response = await UserService.getUserById(id)
        return response.data || response
      } catch (error) {
        this.error = error.message || `Failed to fetch user with ID ${id}`
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Create new user
     * @param {Object} userData - User data
     */
    async createUser(userData) {
      this.loading = true
      this.error = null

      try {
        const response = await UserService.createUser(userData)
        // Add the new user to the users list
        const newUser = response.data || response
        this.users.push(newUser)
        return response
      } catch (error) {
        this.error = error.message || 'Failed to create user'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Update user
     * @param {number} id - User ID
     * @param {Object} userData - User data
     */
    async updateUser(id, userData) {
      this.loading = true
      this.error = null

      try {
        const response = await UserService.updateUser(id, userData)
        const updatedUser = response.data || response

        // Update the user in the users list
        const index = this.users.findIndex(user => user.id === id)
        if (index !== -1) {
          this.users[index] = updatedUser
        }

        // If we're updating the current user, update that too
        if (this.currentUser && this.currentUser.id === id) {
          this.currentUser = { ...this.currentUser, ...updatedUser }
        }

        return response
      } catch (error) {
        this.error = error.message || 'Failed to update user'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Delete user
     * @param {number} id - User ID
     */
    async deleteUser(id) {
      this.loading = true
      this.error = null

      try {
        const response = await UserService.deleteUser(id)

        // Remove the user from the users list
        this.users = this.users.filter(user => user.id !== id)

        return response
      } catch (error) {
        this.error = error.message || 'Failed to delete user'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Update user profile
     * @param {Object} userData - User profile data
     */
    async updateProfile(userData) {
      this.loading = true
      this.error = null

      try {
        const response = await UserService.updateUserProfile(userData)
        this.currentUser = response.user || response.data || response
        return response
      } catch (error) {
        this.error = error.message || 'Failed to update profile'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Fetch user options (roles, statuses)
     */
    async fetchUserOptions() {
      try {
        const response = await UserService.getUserOptions()
        this.roles = response.roles || []
        this.statuses = response.statuses || []
        return response
      } catch (error) {
        console.error('Failed to fetch user options:', error)
        // Don't throw, just use empty arrays
        this.roles = []
        this.statuses = []
      }
    },

    /**
     * Clear error message
     */
    clearError() {
      this.error = null
    }
  },
})