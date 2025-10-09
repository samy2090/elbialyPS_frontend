import { defineStore } from 'pinia'
import AuthService from '@/api/auth.js'
import UserService from '@/api/users.js'
import router from '@/router'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  }),

  getters: {
    isAdmin: (state) => state.user && state.user.is_admin,
    isUser: (state) => state.user && !state.user.is_admin,
  },

  actions: {
    /**
     * Admin login
     * @param {Object} credentials - Admin login credentials
     */
    async adminLogin(credentials) {
      this.loading = true
      this.error = null

      try {
        const response = await AuthService.adminLogin(credentials)
        this.user = response.user || response.data?.user || response
        this.isAuthenticated = true

        // Redirect to dashboard
        router.push('/dashboard')
        return response
      } catch (error) {
        this.error = error.message || 'Admin login failed'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * User login
     * @param {Object} credentials - User login credentials
     */
    async userLogin(credentials) {
      this.loading = true
      this.error = null

      try {
        const response = await AuthService.login(credentials)
        this.user = response.user || response.data?.user || response
        this.isAuthenticated = true

        // Redirect to dashboard
        router.push('/dashboard')
        return response
      } catch (error) {
        this.error = error.message || 'User login failed'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Generic login
     * @param {Object} credentials - Login credentials
     */
    async login(credentials) {
      this.loading = true
      this.error = null

      try {
        const response = await AuthService.login(credentials)
        this.user = response.user || response.data?.user || response
        this.isAuthenticated = true

        // Redirect to dashboard
        router.push('/dashboard')
        return response
      } catch (error) {
        this.error = error.message || 'Login failed'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * User registration
     * @param {Object} userData - User registration data
     */
    async register(userData) {
      this.loading = true
      this.error = null

      try {
        const response = await AuthService.register(userData)
        this.user = response.user || response.data?.user || response
        this.isAuthenticated = true

        // Redirect to dashboard
        router.push('/dashboard')
        return response
      } catch (error) {
        this.error = error.message || 'Registration failed'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Logout user
     */
    async logout() {
      this.loading = true
      this.error = null

      try {
        await AuthService.logout()
        this.user = null
        this.isAuthenticated = false

        // Redirect to login page
        router.push('/login')
        return { success: true }
      } catch (error) {
        this.error = error.message || 'Logout failed'
        // Still logout locally even if API fails
        this.user = null
        this.isAuthenticated = false
        router.push('/login')
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Fetch authenticated user
     */
    async fetchUser() {
      this.loading = true
      this.error = null

      try {
        const response = await UserService.getAuthenticatedUser()
        this.user = response.user || response.data || response
        this.isAuthenticated = true
        return response
      } catch (error) {
        this.error = error.message || 'Failed to fetch user'
        this.user = null
        this.isAuthenticated = false
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