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
      const response = await api.get('/api/users', { params })

      // Handle different Laravel response formats
      let usersData = null

      // Format 1: Laravel Resource Collection with success wrapper
      // { success: true, data: [...], message: "..." } OR { status: "success", data: [...] }
      if ((response.data?.success || response.data?.status === 'success') && Array.isArray(response.data.data)) {
        usersData = {
          users: response.data.data,
          pagination: response.data.meta || response.data.pagination || null
        }
      }
      // Format 2: Laravel Paginated Response (most common)
      // { data: [...], current_page, total, per_page, last_page, ... }
      else if (response.data?.data && Array.isArray(response.data.data) && response.data.current_page !== undefined) {
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
        usersData = {
          users: response.data,
          pagination: null
        }
      }
      // Format 4: Nested users property
      // { users: [...], pagination: {...} }
      else if (response.data?.users && Array.isArray(response.data.users)) {
        usersData = {
          users: response.data.users,
          pagination: response.data.pagination || response.data.meta || null
        }
      }
      // Format 5: Resource Collection (Laravel API Resource)
      // { data: [...], meta: {...}, links: {...} }
      else if (response.data?.data && Array.isArray(response.data.data) && response.data.meta) {
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
        usersData = {
          users: response.data.data.data,
          pagination: response.data.data.pagination || response.data.pagination || null
        }
      }
      // Format 7: Single user object (shouldn't happen but handle it)
      else if (response.data && typeof response.data === 'object' && response.data.id && !Array.isArray(response.data)) {
        usersData = {
          users: [response.data],
          pagination: null
        }
      }
      // Fallback: try to extract any array from response
      else {
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

      return usersData
    } catch (error) {
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
   * Get user options for dropdowns (roles, statuses, avatar_options).
   * GET /api/users/options/dropdown
   * @returns {Promise<{ roles: Object, statuses: Object, avatar_options: Array }>}
   */
  static async getUserOptionsDropdown() {
    try {
      const response = await api.get('/api/users/options/dropdown')
      const data = response.data?.data ?? response.data
      return {
        roles: data?.roles ?? {},
        statuses: data?.statuses ?? {},
        avatar_options: Array.isArray(data?.avatar_options) ? data.avatar_options : []
      }
    } catch (error) {
      return {
        roles: {},
        statuses: {},
        avatar_options: []
      }
    }
  }

  /**
   * Get user options (roles, statuses, avatar_options) – uses dropdown endpoint.
   * @returns {Promise}
   */
  static async getUserOptions() {
    return UserService.getUserOptionsDropdown()
  }

  /**
   * Get user by ID
   * @param {number} id - User ID
   * @returns {Promise}
   */
  static async getUserById(id) {
    try {
      const response = await api.get(`/api/users/${id}`)

      // Handle different response formats
      if (response.data?.data) {
        return response.data.data
      } else if (response.data?.user) {
        return response.data.user
      }
      return response.data
    } catch (error) {
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
   * Create guest user (minimal data - name and role only)
   * @param {Object} userData - User data with name and role
   * @returns {Promise}
   */
  static async createGuestUser(userData) {
    try {
      const response = await api.post('/api/users/guest', userData)
      return response.data
    } catch (error) {
      console.error('Create Guest User Error:', error)
      throw new Error(error.response?.data?.message || 'Failed to create guest user')
    }
  }

  /**
   * Update user.
   * - Preset avatar: send JSON { avatar: "avatars/avatar2.svg", name, email, ... }.
   * - Upload avatar: send multipart/form-data with field "avatar" (image file); other fields can be included.
   * @param {number} id - User ID
   * @param {Object} userData - User data. If userData.avatar is a File, sends multipart.
   * @returns {Promise<{ data: object }>} API response with updated user in response.data
   */
  static async updateUser(id, userData) {
    try {
      const isAvatarFile = userData.avatar instanceof File
      if (isAvatarFile) {
        const formData = new FormData()
        formData.append('_method', 'PATCH')
        formData.append('avatar', userData.avatar)
        for (const [key, value] of Object.entries(userData)) {
          if (key === 'avatar' || value === undefined || value === null) continue
          if (value instanceof File) continue
          formData.append(key, typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value))
        }
        // Use POST for file upload so the body is sent correctly (PATCH + multipart can fail in some environments)
        const response = await api.post(`/api/users/${id}`, formData)
        return response.data
      }
      const { avatar, ...rest } = userData
      const payload = { ...rest }
      if (avatar != null && avatar !== '') payload.avatar = avatar
      const response = await api.patch(`/api/users/${id}`, payload)
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
   * Get authenticated user (GET /api/user).
   * Response may include avatar_options: [{ path, url }, ...] for profile avatar picker.
   * @returns {Promise<{ user?: object, data?: object }>}
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
   * Get preset avatars (GET /api/avatars).
   * Use when avatar_options are not included in GET /api/user.
   * @returns {Promise<Array<{ path: string, url: string }>>}
   */
  static async getAvatars() {
    try {
      const response = await api.get('/api/avatars')
      const data = response.data?.data ?? response.data
      return Array.isArray(data) ? data : []
    } catch (error) {
      console.error('Get Avatars Error:', error)
      return []
    }
  }

  /**
   * Update current authenticated user's profile.
   * Uses only: PUT/PATCH /api/user for JSON, POST /api/user for FormData (avatar upload).
   * @param {Object} userData - Profile data (name, email, phone, password, password_confirmation, avatar).
   *   If avatar is a File, sends POST /api/user with FormData; otherwise PATCH /api/user with JSON.
   * @returns {Promise<{ user?: object, data?: object }>}
   */
  static async updateCurrentUserProfile(userData) {
    try {
      const isAvatarFile = userData.avatar instanceof File
      if (isAvatarFile) {
        const formData = new FormData()
        formData.append('avatar', userData.avatar)
        for (const [key, value] of Object.entries(userData)) {
          if (key === 'avatar' || value === undefined || value === null) continue
          if (value instanceof File) continue
          formData.append(key, typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value))
        }
        const response = await api.post('/api/user', formData)
        return response.data
      }
      const { avatar, ...rest } = userData
      const payload = { ...rest }
      if (avatar != null && avatar !== '') payload.avatar = avatar
      const response = await api.patch('/api/user', payload)
      return response.data
    } catch (error) {
      console.error('Update Current User Profile Error:', error)
      throw new Error(error.response?.data?.message || 'Failed to update profile')
    }
  }

  /**
   * Update user profile (legacy) – PUT /api/user/profile
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

  /**
   * Upload user avatar (current user or by id).
   * POST multipart/form-data to /api/user/avatar or /api/users/:id/avatar.
   * @param {File} file - Image file
   * @param {number} [userId] - User ID (omit for current user)
   * @returns {Promise}
   */
  static async uploadAvatar(file, userId = null) {
    try {
      const url = userId ? `/api/users/${userId}/avatar` : '/api/user/avatar'
      const response = await api.postForm(url, { avatar: file })
      return response.data
    } catch (error) {
      console.error('Upload Avatar Error:', error)
      throw new Error(error.response?.data?.message || 'Failed to upload avatar')
    }
  }
}

export default UserService