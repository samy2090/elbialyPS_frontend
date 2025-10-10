import { defineStore } from 'pinia'
import UserService from '@/api/users.js'

export const useUserStore = defineStore('user', {
  state: () => ({
    users: [],
    currentUser: null,
    loading: false,
    error: null,
  }),

  getters: {
    getUsers: (state) => state.users,
    getCurrentUser: (state) => state.currentUser,
  },

  actions: {
    /**
     * Fetch all users
     */
    async fetchUsers() {
      this.loading = true
      this.error = null

      try {
        const response = await UserService.getAllUsers()
        this.users = response.data || response
        return response
      } catch (error) {
        console.error('Failed to fetch users:', error)

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
     * Clear error message
     */
    clearError() {
      this.error = null
    }
  },
})