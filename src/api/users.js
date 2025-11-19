import api from './axios'

/**
 * User API service
 */
class UserService {
  /**
   * Get all users (with pagination support)
   * @param {Object} params - Query parameters (page, per_page, etc.)
   * @returns {Promise}
   */
  static async getAllUsers(params = {}) {
    try {
      console.log('=== API Request ===')
      console.log('URL:', api.defaults.baseURL + '/api/users')
      console.log('Params:', params)
      
      const response = await api.get('/api/users', { params })
      
      console.log('=== Raw API Response ===')
      console.log('Response object:', response)
      console.log('Response.data:', response.data)
      console.log('Response.data type:', typeof response.data)
      console.log('Is array?', Array.isArray(response.data))
      
      // Handle different Laravel response formats
      let usersData = null
      
      // Format 1: Laravel Resource Collection with success wrapper
      // { success: true, data: [...], message: "..." }
      if (response.data?.success && Array.isArray(response.data.data)) {
        console.log('Detected format: Success wrapper with data array')
        usersData = {
          users: response.data.data,
          pagination: response.data.meta || response.data.pagination || null
        }
      }
      // Format 2: Laravel Paginated Response (most common)
      // { data: [...], current_page, total, per_page, last_page, ... }
      else if (response.data?.data && Array.isArray(response.data.data) && response.data.current_page !== undefined) {
        console.log('Detected format: Laravel paginated response')
        usersData = {
          users: response.data.data,
          pagination: {
            current_page: response.data.current_page,
            last_page: response.data.last_page,
            per_page: response.data.per_page,
            total: response.data.total,
            from: response.data.from,
            to: response.data.to,
            links: response.data.links || null
          }
        }
      }
      // Format 3: Direct array response
      // [...]
      else if (Array.isArray(response.data)) {
        console.log('Detected format: Direct array')
        usersData = {
          users: response.data,
          pagination: null
        }
      }
      // Format 4: Nested users property
      // { users: [...], pagination: {...} }
      else if (response.data?.users && Array.isArray(response.data.users)) {
        console.log('Detected format: Nested users property')
        usersData = {
          users: response.data.users,
          pagination: response.data.pagination || response.data.meta || null
        }
      }
      // Format 5: Resource Collection (Laravel API Resource)
      // { data: [...], meta: {...}, links: {...} }
      else if (response.data?.data && Array.isArray(response.data.data) && response.data.meta) {
        console.log('Detected format: Resource Collection with meta')
        usersData = {
          users: response.data.data,
          pagination: {
            ...response.data.meta,
            links: response.data.links || null
          }
        }
      }
      // Format 6: Nested data.data (double nested)
      // { data: { data: [...] } }
      else if (response.data?.data?.data && Array.isArray(response.data.data.data)) {
        console.log('Detected format: Double nested data.data')
        usersData = {
          users: response.data.data.data,
          pagination: response.data.data.pagination || response.data.pagination || null
        }
      }
      // Format 7: Single user object (shouldn't happen but handle it)
      else if (response.data && typeof response.data === 'object' && response.data.id && !Array.isArray(response.data)) {
        console.log('Detected format: Single user object (unexpected)')
        usersData = {
          users: [response.data],
          pagination: null
        }
      }
      // Fallback: try to extract any array from response
      else {
        console.warn('=== UNEXPECTED RESPONSE FORMAT ===')
        console.warn('Full response.data:', JSON.stringify(response.data, null, 2))
        console.warn('Attempting fallback extraction...')
        
        // Try multiple fallback strategies
        const fallbackUsers = 
          response.data?.data || 
          response.data?.users || 
          (Array.isArray(response.data) ? response.data : []) ||
          []
        
        usersData = {
          users: Array.isArray(fallbackUsers) ? fallbackUsers : [],
          pagination: null
        }
      }
      
      console.log('=== Processed Users Data ===')
      console.log('Users count:', usersData.users?.length || 0)
      console.log('First user sample:', usersData.users?.[0] || 'No users')
      console.log('Pagination:', usersData.pagination)
      console.log('==================')
      
      return usersData
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
   * Get user options (roles, statuses, etc.)
   * @returns {Promise}
   */
  static async getUserOptions() {
    try {
      console.log('Making API request to:', api.defaults.baseURL + '/api/users/options')
      const response = await api.get('/api/users/options')
      console.log('User Options Response:', response.data)
      return response.data
    } catch (error) {
      console.error('Get User Options Error:', error)
      // Don't throw error for options, return empty object instead
      return {
        roles: [],
        statuses: []
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
      console.log('Get User By ID Response:', response.data)
      
      // Handle different response formats
      if (response.data?.data) {
        return response.data.data
      } else if (response.data?.user) {
        return response.data.user
      }
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