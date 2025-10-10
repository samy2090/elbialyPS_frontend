import { defineStore } from 'pinia'
import AuthService from '@/api/auth.js'
import UserService from '@/api/users.js'
import router from '@/router'

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

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: loadAuthData(), // Load user data from localStorage on init
    token: localStorage.getItem('auth_token'), // Load token from localStorage
    isAuthenticated: !!loadAuthData(), // Set auth state based on stored data
    loading: false,
    error: null,
  }),

  getters: {
    isAdmin: (state) => {
      // For now, we'll allow any authenticated user to access admin features
      // In a real app, you might want to check specific permissions
      return state.isAuthenticated;
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
        this.user = response.user || response.data?.user || response
        this.isAuthenticated = true

        // Save user data to localStorage
        saveAuthData(this.user)

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

        // Handle the response structure based on your backend
        if (response.data && response.data.user) {
          this.user = response.data.user
          this.token = response.data.token
        } else if (response.user) {
          this.user = response.user
          this.token = response.token
        } else {
          this.user = response
          this.token = response.token
        }

        this.isAuthenticated = true

        // Save user data and token to localStorage
        saveAuthData({ ...this.user, token: this.token })

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