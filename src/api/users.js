import api from './axios'

/**
 * User API service
 */
class UserService {
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