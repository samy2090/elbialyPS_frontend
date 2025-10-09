import ApiService from './ApiService'

class AuthService {
  /**
   * Get CSRF cookie from Laravel Sanctum
   * @returns {Promise}
   */
  static async getCsrfCookie() {
    try {
      console.log('AuthService: Getting CSRF cookie');
      // Use axios to get CSRF cookie
      const response = await ApiService.get('/sanctum/csrf-cookie')
      console.log('AuthService: CSRF cookie response', response);
      console.log('AuthService: Document cookies after request', document.cookie);
      return response
    } catch (error) {
      console.error('AuthService: Failed to get CSRF cookie:', error)
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
      console.log('AuthService: Registering user', userData);
      // First get CSRF cookie
      await this.getCsrfCookie()

      const response = await ApiService.post('/api/register', userData)
      console.log('AuthService: Registration response', response);
      return response.data
    } catch (error) {
      console.error('AuthService: Registration Error:', error)
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
      console.log('AuthService: Logging in user', credentials);
      // First get CSRF cookie
      await this.getCsrfCookie()

      const response = await ApiService.post('/api/login', credentials)
      console.log('AuthService: Login response', response);
      return response.data
    } catch (error) {
      console.error('AuthService: Login Error:', error)
      console.error('AuthService: Login Error Details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers
      })
      throw new Error(error.response?.data?.message || 'Login failed')
    }
  }

  /**
   * User login (alias for login method)
   * @param {Object} credentials - Login credentials
   * @returns {Promise}
   */
  static async userLogin(credentials) {
    console.log('AuthService: User login (alias)', credentials);
    // This is an alias for the login method
    return this.login(credentials)
  }

  /**
   * Admin login
   * @param {Object} credentials - Admin login credentials
   * @returns {Promise}
   */
  static async adminLogin(credentials) {
    try {
      console.log('AuthService: Admin login', credentials);
      // First get CSRF cookie
      await this.getCsrfCookie()

      const response = await ApiService.post('/api/admins-login', credentials)
      console.log('AuthService: Admin login response', response);
      return response.data
    } catch (error) {
      console.error('AuthService: Admin Login Error:', error)
      console.error('AuthService: Admin Login Error Details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers
      })
      throw new Error(error.response?.data?.message || 'Admin login failed')
    }
  }

  /**
   * Logout user
   * @returns {Promise}
   */
  static async logout() {
    try {
      console.log('AuthService: Logging out user');
      // First get CSRF cookie
      await this.getCsrfCookie()

      const response = await ApiService.post('/api/logout')
      console.log('AuthService: Logout response', response);
      return response.data
    } catch (error) {
      console.error('AuthService: Logout Error:', error)
      throw new Error(error.response?.data?.message || 'Logout failed')
    }
  }

  /**
   * Get authenticated user
   * @returns {Promise}
   */
  static async getUser() {
    try {
      console.log('AuthService: Getting authenticated user');
      const response = await ApiService.get('/api/user')
      console.log('AuthService: Get user response', response);
      return response.data
    } catch (error) {
      console.error('AuthService: Get User Error:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch user')
    }
  }
}

export default AuthService