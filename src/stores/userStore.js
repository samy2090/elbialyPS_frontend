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