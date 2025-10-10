import api from './axios'

/**
 * User API service
 */
class UserService {
  /**
   * Get all users
   * @returns {Promise}
   */
  static async getAllUsers() {
    try {
      console.log('Making API request to:', api.defaults.baseURL + '/api/users')
      const response = await api.get('/api/users')
      console.log('API Response:', response)
      return response.data
    } catch (error) {
      console.error('Get Users Error Details:', {
        message: error.message,
        code: error.code,
        response: error.response,
        request: error.request,
        config: error.config
      })

      // Provide more specific error information
      if (error.response?.status === 401) {
        throw new Error('Authentication required - please login first')
      } else if (error.response?.status === 403) {
        throw new Error('Access denied - insufficient permissions')
      } else if (error.code === 'ERR_NETWORK' || error.code === 'NETWORK_ERROR' || !error.response) {
        throw new Error('Could not connect to server. Please check if backend is running on ' + (api.defaults.baseURL || 'http://localhost:8000'))
      } else if (error.code === 'ERR_FAILED') {
        throw new Error('Connection failed - possible CORS issue or server not responding')
      } else {
        throw new Error(error.response?.data?.message || error.message || 'Failed to fetch users')
      }
    }
  }

  /**
   * Get user by ID
   * @param {number} id - User ID
   * @returns {Promise}
   */
  static async getUserById(id) {
    try {
      const response = await api.get(`/api/users/${id}`)
      return response.data
    } catch (error) {
      console.error('Get User Error:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch user')
    }
  }

  /**
   * Create new user
   * @param {Object} userData - User data
   * @returns {Promise}
   */
  static async createUser(userData) {
    try {
      const response = await api.post('/api/users', userData)
      return response.data
    } catch (error) {
      console.error('Create User Error:', error)
      throw new Error(error.response?.data?.message || 'Failed to create user')
    }
  }

  /**
   * Update user
   * @param {number} id - User ID
   * @param {Object} userData - User data
   * @returns {Promise}
   */
  static async updateUser(id, userData) {
    try {
      const response = await api.put(`/api/users/${id}`, userData)
      return response.data
    } catch (error) {
      console.error('Update User Error:', error)
      throw new Error(error.response?.data?.message || 'Failed to update user')
    }
  }

  /**
   * Delete user
   * @param {number} id - User ID
   * @returns {Promise}
   */
  static async deleteUser(id) {
    try {
      const response = await api.delete(`/api/users/${id}`)
      return response.data
    } catch (error) {
      console.error('Delete User Error:', error)
      throw new Error(error.response?.data?.message || 'Failed to delete user')
    }
  }

  /**
   * Get authenticated user
   * @returns {Promise}
   */
  static async getAuthenticatedUser() {
    try {
      const response = await api.get('/api/user')
      return response.data
    } catch (error) {
      console.error('Get User Error:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch user')
    }
  }

  /**
   * Update user profile
   * @param {Object} userData - User profile data
   * @returns {Promise}
   */
  static async updateUserProfile(userData) {
    try {
      const response = await api.put('/api/user/profile', userData)
      return response.data
    } catch (error) {
      console.error('Update User Profile Error:', error)
      throw new Error(error.response?.data?.message || 'Failed to update profile')
    }
  }
}

export default UserService