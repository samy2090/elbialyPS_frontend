import { defineStore } from 'pinia'
import AuthService from '@/api/auth.js'
import UserService from '@/api/users.js'
import router from '@/router'
import { getUserRoleForForm, isAdminRole, canAccessDashboard as canAccessDashboardRole } from '@/utils/roleHelpers'

// Helper functions for localStorage
const STORAGE_KEY = 'auth_user_data'

const saveAuthData = (userData) => {
  try {
    if (userData) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData))
      // Also store the token separately for easy access
      if (userData.token) {
        localStorage.setItem('auth_token', userData.token)
      }
    } else {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem('auth_token')
    }
  } catch (error) {
    console.error('Failed to save auth data to localStorage:', error)
  }
}

const loadAuthData = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('Failed to load auth data from localStorage:', error)
    return null
  }
}

/**
 * Extract user object from login/API response (handles common Laravel shapes).
 * Ensures we get the user with role (user.role = { id, name, permissions }).
 */
function extractUserFromResponse(response) {
  if (!response || typeof response !== 'object') return null
  // { data: { user: {...}, token } }
  if (response.data?.user && response.data.user.id != null) return response.data.user
  // { data: {...user with role...}, token } - data is the user
  if (response.data?.id != null && (response.data.role != null || response.data.role_id != null)) return response.data
  // { user: {...}, token }
  if (response.user && response.user.id != null) return response.user
  // response is the user (e.g. { id, name, role, ... })
  if (response.id != null) return response
  return null
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: loadAuthData(), // Load user data from localStorage on init
    token: localStorage.getItem('auth_token'), // Load token from localStorage
    isAuthenticated: !!loadAuthData(), // Set auth state based on stored data
    loading: false,
    error: null,
  }),

  getters: {
    /** Normalized role of the current user (e.g. 'admin', 'user', 'editor') */
    currentUserRole: (state) => {
      if (!state.user || !state.isAuthenticated) return 'user'
      return getUserRoleForForm(state.user)
    },
    /** True if the current user has admin role */
    isAdmin: (state) => {
      if (!state.user || !state.isAuthenticated) return false
      return isAdminRole(getUserRoleForForm(state.user))
    },
    /** True if the current user can access dashboard (admin or staff) */
    canAccessDashboard: (state) => {
      if (!state.user || !state.isAuthenticated) return false
      return canAccessDashboardRole(getUserRoleForForm(state.user))
    },
    isUser: (state) => state.isAuthenticated,
  },

  actions: {
    /**
     * Mock login for demonstration purposes
     * @param {Object} credentials - Login credentials
     * @param {boolean} isAdmin - Whether to login as admin
     */
    async mockLogin(credentials, isAdmin = false) {
      this.loading = true
      this.error = null

      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500))

        // Create mock user data
        const mockUser = {
          id: isAdmin ? 1 : 2,
          name: credentials.name || credentials.email.split('@')[0],
          email: credentials.email,
          role: isAdmin ? "admin" : "user"
        }

        this.user = mockUser
        this.isAuthenticated = true

        // Save user data to localStorage
        saveAuthData(this.user)

        // Redirect to dashboard
        router.push('/dashboard')
        return { user: mockUser }
      } catch (error) {
        this.error = error.message || 'Mock login failed'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Admin login
     * @param {Object} credentials - Admin login credentials
     */
    async adminLogin(credentials) {
      this.loading = true
      this.error = null

      try {
        const response = await AuthService.adminLogin(credentials)
        const user = extractUserFromResponse(response)
        const token = response.token ?? response.data?.token
        if (!user || !user.id) {
          throw new Error('Invalid login response: user data missing')
        }
        this.user = user
        this.token = token || this.token
        this.isAuthenticated = true

        // Save user data (with role) to localStorage
        saveAuthData({ ...user, token: this.token })

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

        // Save user data to localStorage
        saveAuthData(this.user)

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
        console.log('Login response:', response)

        // Extract user from common Laravel/API response shapes
        const user = extractUserFromResponse(response)
        const token = response.token ?? response.data?.token ?? (response.user && response.user.token) ?? (response.data?.user && response.data.user.token)
        if (!user || !user.id) {
          throw new Error('Invalid login response: user data missing')
        }
        this.user = user
        this.token = token || this.token

        this.isAuthenticated = true

        // Save user data (with role) and token to localStorage
        saveAuthData({ ...user, token: this.token })

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

        // Save user data to localStorage
        saveAuthData(this.user)

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
        this.token = null
        this.isAuthenticated = false

        // Remove user data and token from localStorage
        saveAuthData(null)

        // Redirect to login page
        router.push('/login')
        return { success: true }
      } catch (error) {
        this.error = error.message || 'Logout failed'
        // Still logout locally even if API fails
        this.user = null
        this.token = null
        this.isAuthenticated = false

        // Remove user data and token from localStorage
        saveAuthData(null)

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

        // Save user data to localStorage
        saveAuthData(this.user)

        return response
      } catch (error) {
        this.error = error.message || 'Failed to fetch user'
        this.user = null
        this.isAuthenticated = false

        // Remove user data from localStorage
        saveAuthData(null)

        // Redirect to login page if unauthorized
        if (error.response?.status === 401) {
          router.push('/login')
        }
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Update current user in state (e.g. after profile update)
     * @param {Object} userData - Updated user object
     */
    updateCurrentUser(userData) {
      if (!userData || !this.user) return
      this.user = { ...this.user, ...userData }
      saveAuthData(this.user)
    },

    /**
     * Clear error message
     */
    clearError() {
      this.error = null
    },

    /**
     * Initialize auth state from localStorage
     */
    initAuth() {
      const storedUser = loadAuthData()
      const storedToken = localStorage.getItem('auth_token')

      if (storedUser && storedToken) {
        this.user = storedUser
        this.token = storedToken
        this.isAuthenticated = true
      }
    }
  },
})