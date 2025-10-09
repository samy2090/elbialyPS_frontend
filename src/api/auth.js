import api from './axios'

/**
 * Authentication API service
 */
class AuthService {
  /**
   * Get CSRF cookie from Laravel Sanctum
   * @returns {Promise}
   */
  static async getCsrfCookie() {
    try {
      // Use axios to get CSRF cookie
      const response = await api.get('/sanctum/csrf-cookie')
      return response
    } catch (error) {
      console.error('Failed to get CSRF cookie:', error)
      throw error
    }
  }

  /**
   * User registration
   * @param {Object} userData - User registration data
   * @returns {Promise}
   */
  static async register(userData) {
    try {
      // First get CSRF cookie
      await this.getCsrfCookie()

      const response = await api.post('/api/register', userData)
      return response.data
    } catch (error) {
      console.error('Registration Error:', error)
      throw new Error(error.response?.data?.message || 'Registration failed')
    }
  }

  /**
   * User login
   * @param {Object} credentials - Login credentials
   * @returns {Promise}
   */
  static async login(credentials) {
    try {
      // First get CSRF cookie
      await this.getCsrfCookie()

      const response = await api.post('/api/login', credentials)
      return response.data
    } catch (error) {
      console.error('Login Error:', error)
      throw new Error(error.response?.data?.message || 'Login failed')
    }
  }

  /**
   * Admin login
   * @param {Object} credentials - Admin login credentials
   * @returns {Promise}
   */
  static async adminLogin(credentials) {
    try {
      // First get CSRF cookie
      await this.getCsrfCookie()

      const response = await api.post('/api/admins-login', credentials)
      return response.data
    } catch (error) {
      console.error('Admin Login Error:', error)
      throw new Error(error.response?.data?.message || 'Admin login failed')
    }
  }

  /**
   * Logout user
   * @returns {Promise}
   */
  static async logout() {
    try {
      // First get CSRF cookie
      await this.getCsrfCookie()

      const response = await api.post('/api/logout')
      return response.data
    } catch (error) {
      console.error('Logout Error:', error)
      throw new Error(error.response?.data?.message || 'Logout failed')
    }
  }
}

export default AuthService