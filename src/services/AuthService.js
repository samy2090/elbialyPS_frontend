import ApiService from './ApiService'

class AuthService {
  /**
   * Get CSRF cookie from Laravel Sanctum
   * @returns {Promise}
   */
  static async getCsrfCookie() {
    try {
      // Use axios to get CSRF cookie
      const response = await ApiService.get('/sanctum/csrf-cookie');
      console.log('CSRF Cookie Response:', response);

      // Extract CSRF token from cookie if needed
      // The cookie should be automatically handled by the browser with withCredentials: true
      // But we can also extract it manually if needed
      const csrfToken = this.extractCsrfTokenFromCookie();
      if (csrfToken) {
        ApiService.setCsrfToken(csrfToken);
      }

      return response;
    } catch (error) {
      console.error('Failed to get CSRF cookie:', error);
      console.error('CSRF Error Details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        headers: error.response?.headers
      });
      throw error;
    }
  }

  /**
   * Extract CSRF token from document cookies
   * @returns {string|null}
   */
  static extractCsrfTokenFromCookie() {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'XSRF-TOKEN') {
        return decodeURIComponent(value);
      }
    }
    return null;
  }

  /**
   * User registration
   * @param {Object} userData - User registration data
   * @returns {Promise}
   */
  static async register(userData) {
    try {
      // First get CSRF cookie
      await this.getCsrfCookie();

      const response = await ApiService.post('/api/register', userData);
      return response.data;
    } catch (error) {
      console.error('Registration Error:', error);
      throw new Error(error.response?.data?.message || 'Registration failed');
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
      await this.getCsrfCookie();

      const response = await ApiService.post('/api/login', credentials);

      // Store user data if needed
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error) {
      console.error('Login Error:', error);
      console.error('Login Error Details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers
      });
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }

  /**
   * User login (alias for login method)
   * @param {Object} credentials - Login credentials
   * @returns {Promise}
   */
  static async userLogin(credentials) {
    // This is an alias for the login method
    return this.login(credentials);
  }

  /**
   * Admin login
   * @param {Object} credentials - Admin login credentials
   * @returns {Promise}
   */
  static async adminLogin(credentials) {
    try {
      // First get CSRF cookie
      await this.getCsrfCookie();

      const response = await ApiService.post('/api/admins-login', credentials);

      // Store user data if needed
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error) {
      console.error('Admin Login Error:', error);
      throw new Error(error.response?.data?.message || 'Admin login failed');
    }
  }

  /**
   * Logout user
   * @returns {Promise}
   */
  static async logout() {
    try {
      // First get CSRF cookie
      await this.getCsrfCookie();

      const response = await ApiService.post('/api/logout');

      // Clear local storage
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');

      return response.data;
    } catch (error) {
      // Even if API fails, clear local storage
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
      throw new Error(error.response?.data?.message || 'Logout failed');
    }
  }

  /**
   * Get authenticated user
   * @returns {Promise}
   */
  static async getUser() {
    try {
      // First get CSRF cookie
      await this.getCsrfCookie();

      const response = await ApiService.get('/api/user');
      return response.data;
    } catch (error) {
      // If we get a 401, clear the user data
      if (error.response?.status === 401) {
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch user');
    }
  }
}

export default AuthService