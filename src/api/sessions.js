import api from './axios'

/**
 * Session API service
 */
class SessionService {
    /**
     * Get sessions by date or date range
     * @param {string} date - Start date in Y-m-d format (e.g., '2025-01-27')
     * @param {Object} params - Query parameters (end_date, per_page, page, etc.)
     * @returns {Promise}
     */
    static async getSessionsByDate(date, params = {}) {
        try {
            console.log('=== Session API Request (By Date) ===')
            console.log('URL:', api.defaults.baseURL + `/api/sessions/date/${date}`)
            console.log('Params:', params)

            const response = await api.get(`/api/sessions/date/${date}`, { params })

            console.log('=== Raw API Response (By Date) ===')
            console.log('Response object:', response)
            console.log('Response.data:', response.data)

            // Handle different Laravel response formats (same as getAllSessions)
            let sessionsData = null

            // Format 1: Laravel Paginated Response
            if (response.data?.data && Array.isArray(response.data.data) && response.data.current_page !== undefined) {
                console.log('Detected format: Laravel paginated response')
                sessionsData = {
                    sessions: response.data.data,
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
            // Format 2: Laravel Resource Collection with success wrapper
            else if (response.data?.success && Array.isArray(response.data.data)) {
                console.log('Detected format: Success wrapper with data array')
                sessionsData = {
                    sessions: response.data.data,
                    pagination: response.data.meta || response.data.pagination || null
                }
            }
            // Format 3: Direct array response
            else if (Array.isArray(response.data)) {
                console.log('Detected format: Direct array')
                sessionsData = {
                    sessions: response.data,
                    pagination: null
                }
            }
            // Format 4: Nested sessions property
            else if (response.data?.sessions && Array.isArray(response.data.sessions)) {
                console.log('Detected format: Nested sessions property')
                sessionsData = {
                    sessions: response.data.sessions,
                    pagination: response.data.pagination || response.data.meta || null
                }
            }
            // Format 5: Resource Collection with meta
            else if (response.data?.data && Array.isArray(response.data.data) && response.data.meta) {
                console.log('Detected format: Resource Collection with meta')
                sessionsData = {
                    sessions: response.data.data,
                    pagination: {
                        ...response.data.meta,
                        links: response.data.links || null
                    }
                }
            }
            // Fallback
            else {
                console.warn('=== UNEXPECTED RESPONSE FORMAT (By Date) ===')
                console.warn('Full response.data:', JSON.stringify(response.data, null, 2))
                console.warn('Attempting fallback extraction...')

                const fallbackSessions =
                    response.data?.data ||
                    response.data?.sessions ||
                    (Array.isArray(response.data) ? response.data : []) ||
                    []

                sessionsData = {
                    sessions: Array.isArray(fallbackSessions) ? fallbackSessions : [],
                    pagination: null
                }
            }

            console.log('=== Processed Sessions Data (By Date) ===')
            console.log('Sessions count:', sessionsData.sessions?.length || 0)
            console.log('First session sample:', sessionsData.sessions?.[0] || 'No sessions')
            console.log('Pagination:', sessionsData.pagination)
            console.log('==================')

            return sessionsData
        } catch (error) {
            console.error('Get Sessions By Date Error Details:', {
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
            } else if (error.response?.status === 422) {
                throw new Error(error.response?.data?.message || 'Invalid date format. Please use Y-m-d format (e.g., 2025-01-27)')
            } else if (error.code === 'ERR_NETWORK' || error.code === 'NETWORK_ERROR' || !error.response) {
                throw new Error('Could not connect to server. Please check if backend is running on ' + (api.defaults.baseURL || 'http://localhost:8000'))
            } else if (error.code === 'ERR_FAILED') {
                throw new Error('Connection failed - possible CORS issue or server not responding')
            } else {
                throw new Error(error.response?.data?.message || error.message || 'Failed to fetch sessions by date')
            }
        }
    }

    /**
     * Get all sessions (with pagination support)
     * @param {Object} params - Query parameters (page, per_page, etc.)
     * @returns {Promise}
     */
    static async getAllSessions(params = {}) {
        try {
            console.log('=== Session API Request ===')
            console.log('URL:', api.defaults.baseURL + '/api/sessions')
            console.log('Params:', params)

            const response = await api.get('/api/sessions', { params })

            console.log('=== Raw API Response ===')
            console.log('Response object:', response)
            console.log('Response.data:', response.data)

            // Handle different Laravel response formats
            let sessionsData = null

            // Format 1: Laravel Paginated Response (most common)
            // { data: [...], current_page, total, per_page, last_page, ... }
            if (response.data?.data && Array.isArray(response.data.data) && response.data.current_page !== undefined) {
                console.log('Detected format: Laravel paginated response')
                sessionsData = {
                    sessions: response.data.data,
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
            // Format 2: Laravel Resource Collection with success wrapper
            // { success: true, data: [...], message: "..." }
            else if (response.data?.success && Array.isArray(response.data.data)) {
                console.log('Detected format: Success wrapper with data array')
                sessionsData = {
                    sessions: response.data.data,
                    pagination: response.data.meta || response.data.pagination || null
                }
            }
            // Format 3: Direct array response
            // [...]
            else if (Array.isArray(response.data)) {
                console.log('Detected format: Direct array')
                sessionsData = {
                    sessions: response.data,
                    pagination: null
                }
            }
            // Format 4: Nested sessions property
            // { sessions: [...], pagination: {...} }
            else if (response.data?.sessions && Array.isArray(response.data.sessions)) {
                console.log('Detected format: Nested sessions property')
                sessionsData = {
                    sessions: response.data.sessions,
                    pagination: response.data.pagination || response.data.meta || null
                }
            }
            // Format 5: Resource Collection (Laravel API Resource)
            // { data: [...], meta: {...}, links: {...} }
            else if (response.data?.data && Array.isArray(response.data.data) && response.data.meta) {
                console.log('Detected format: Resource Collection with meta')
                sessionsData = {
                    sessions: response.data.data,
                    pagination: {
                        ...response.data.meta,
                        links: response.data.links || null
                    }
                }
            }
            // Fallback: try to extract any array from response
            else {
                console.warn('=== UNEXPECTED RESPONSE FORMAT ===')
                console.warn('Full response.data:', JSON.stringify(response.data, null, 2))
                console.warn('Attempting fallback extraction...')

                const fallbackSessions =
                    response.data?.data ||
                    response.data?.sessions ||
                    (Array.isArray(response.data) ? response.data : []) ||
                    []

                sessionsData = {
                    sessions: Array.isArray(fallbackSessions) ? fallbackSessions : [],
                    pagination: null
                }
            }

            console.log('=== Processed Sessions Data ===')
            console.log('Sessions count:', sessionsData.sessions?.length || 0)
            console.log('First session sample:', sessionsData.sessions?.[0] || 'No sessions')
            console.log('Pagination:', sessionsData.pagination)
            console.log('==================')

            return sessionsData
        } catch (error) {
            console.error('Get Sessions Error Details:', {
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
                throw new Error(error.response?.data?.message || error.message || 'Failed to fetch sessions')
            }
        }
    }

    /**
     * Get session by ID
     * @param {number} id - Session ID
     * @returns {Promise}
     */
    static async getSessionById(id) {
        try {
            const response = await api.get(`/api/sessions/${id}`)
            console.log('Get Session By ID Response:', response.data)

            // Handle different response formats
            if (response.data?.data) {
                return response.data.data
            } else if (response.data?.session) {
                return response.data.session
            }
            return response.data
        } catch (error) {
            console.error('Get Session Error:', error)
            throw new Error(error.response?.data?.message || 'Failed to fetch session')
        }
    }

    /**
     * Create new session
     * @param {Object} sessionData - Session data
     * @returns {Promise}
     */
    static async createSession(sessionData) {
        try {
            const response = await api.post('/api/sessions', sessionData)
            return response.data
        } catch (error) {
            console.error('Create Session Error:', error)
            throw new Error(error.response?.data?.message || 'Failed to create session')
        }
    }

    /**
     * Update session
     * @param {number} id - Session ID
     * @param {Object} sessionData - Session data
     * @returns {Promise}
     */
    static async updateSession(id, sessionData) {
        try {
            const response = await api.put(`/api/sessions/${id}`, sessionData)
            return response.data
        } catch (error) {
            console.error('Update Session Error:', error)
            throw new Error(error.response?.data?.message || 'Failed to update session')
        }
    }

    /**
     * Delete session
     * @param {number} id - Session ID
     * @returns {Promise}
     */
    static async deleteSession(id) {
        try {
            const response = await api.delete(`/api/sessions/${id}`)
            return response.data
        } catch (error) {
            console.error('Delete Session Error:', error)
            throw new Error(error.response?.data?.message || 'Failed to delete session')
        }
    }

    /**
     * End session
     * @param {number} id - Session ID
     * @param {Object} data - Optional data for ending session
     * @returns {Promise}
     */
    static async endSession(id, data = {}) {
        try {
            const response = await api.patch(`/api/sessions/${id}/end`, data)
            return response.data
        } catch (error) {
            console.error('End Session Error:', error)
            throw new Error(error.response?.data?.message || 'Failed to end session')
        }
    }

    /**
     * Pause session
     * @param {number} id - Session ID
     * @returns {Promise}
     */
    static async pauseSession(id) {
        try {
            const response = await api.patch(`/api/sessions/${id}/pause`)
            return response.data
        } catch (error) {
            console.error('Pause Session Error:', error)
            throw new Error(error.response?.data?.message || 'Failed to pause session')
        }
    }

    /**
     * Resume session
     * @param {number} id - Session ID
     * @returns {Promise}
     */
    static async resumeSession(id) {
        try {
            const response = await api.patch(`/api/sessions/${id}/resume`)
            return response.data
        } catch (error) {
            console.error('Resume Session Error:', error)
            throw new Error(error.response?.data?.message || 'Failed to resume session')
        }
    }

    // ==================== Session Activities Methods ====================

    /**
     * Get all activities in a session
     * @param {number} sessionId - Session ID
     * @returns {Promise}
     */
    static async getSessionActivities(sessionId) {
        try {
            const response = await api.get(`/api/sessions/${sessionId}/activities`)
            console.log('Get Session Activities Response:', response.data)

            // Handle different response formats
            if (response.data?.data) {
                return Array.isArray(response.data.data) ? response.data.data : response.data
            } else if (Array.isArray(response.data)) {
                return response.data
            }
            return response.data
        } catch (error) {
            console.error('Get Session Activities Error:', error)
            throw new Error(error.response?.data?.message || 'Failed to fetch session activities')
        }
    }

    /**
     * Get activity by ID
     * @param {number} sessionId - Session ID
     * @param {number} activityId - Activity ID
     * @returns {Promise}
     */
    static async getActivityById(sessionId, activityId) {
        try {
            const response = await api.get(`/api/sessions/${sessionId}/activities/${activityId}`)
            console.log('Get Activity By ID Response:', response.data)

            // Handle different response formats
            if (response.data?.data) {
                return response.data.data
            } else if (response.data?.activity) {
                return response.data.activity
            }
            return response.data
        } catch (error) {
            console.error('Get Activity Error:', error)
            throw new Error(error.response?.data?.message || 'Failed to fetch activity')
        }
    }

    /**
     * Get activities by type
     * @param {number} sessionId - Session ID
     * @param {string} type - Activity type
     * @returns {Promise}
     */
    static async getActivitiesByType(sessionId, type) {
        try {
            const response = await api.get(`/api/sessions/${sessionId}/activities/type/${type}`)
            return response.data
        } catch (error) {
            console.error('Get Activities By Type Error:', error)
            throw new Error(error.response?.data?.message || 'Failed to fetch activities by type')
        }
    }

    /**
     * Create new activity
     * @param {number} sessionId - Session ID
     * @param {Object} activityData - Activity data (must include session_id)
     * @returns {Promise}
     */
    static async createActivity(sessionId, activityData) {
        try {
            // Validate sessionId
            if (!sessionId || sessionId === 0 || isNaN(Number(sessionId))) {
                throw new Error('Invalid session ID. Session ID must be a valid number.')
            }

            console.log('Create Activity Request:', {
                sessionId,
                activityData,
                url: `/api/sessions/${sessionId}/activities`
            })

            // Prepare request data
            // Laravel validation might need session_id in body for exists:sessions,id validation
            // Try sending as integer first (Laravel exists validation typically works with both int and string)
            const requestData = { ...activityData }

            // Ensure session_id is included as integer (Laravel exists validation works with int)
            // If activityData already has session_id, use that; otherwise use sessionId from URL
            if (!('session_id' in requestData) || requestData.session_id === undefined || requestData.session_id === null) {
                requestData.session_id = parseInt(sessionId, 10)
            } else {
                // Convert to integer if it's already in activityData
                requestData.session_id = parseInt(requestData.session_id, 10)
            }

            // Ensure activity_type is lowercase (Laravel enum validation might be case-sensitive)
            if (requestData.activity_type) {
                requestData.activity_type = String(requestData.activity_type).toLowerCase()
            }

            console.log('Create Activity Request Data:', requestData)
            console.log('Session ID validation:', {
                urlSessionId: sessionId,
                urlSessionIdType: typeof sessionId,
                bodySessionId: requestData.session_id,
                bodySessionIdType: typeof requestData.session_id,
                activity_type: requestData.activity_type
            })

            const response = await api.post(`/api/sessions/${sessionId}/activities`, requestData)
            console.log('Create Activity Response:', response.data)
            return response.data
        } catch (error) {
            console.error('Create Activity Error:', error)
            console.error('Error Details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                errors: error.response?.data?.errors
            })

            // Provide more detailed error messages
            if (error.response?.data?.errors) {
                const errors = error.response.data.errors
                const errorMessages = Object.entries(errors).map(([field, messages]) => {
                    const msg = Array.isArray(messages) ? messages.join(', ') : messages
                    return `${field}: ${msg}`
                }).join('; ')
                throw new Error(errorMessages || error.response.data.message || 'Failed to create activity')
            }

            throw new Error(error.response?.data?.message || error.message || 'Failed to create activity')
        }
    }

    /**
     * Update activity
     * @param {number} sessionId - Session ID
     * @param {number} activityId - Activity ID
     * @param {Object} activityData - Activity data
     * @returns {Promise}
     */
    static async updateActivity(sessionId, activityId, activityData) {
        try {
            const response = await api.put(`/api/sessions/${sessionId}/activities/${activityId}`, activityData)
            return response.data
        } catch (error) {
            console.error('Update Activity Error:', error)
            throw new Error(error.response?.data?.message || 'Failed to update activity')
        }
    }

    /**
     * Delete activity
     * @param {number} sessionId - Session ID
     * @param {number} activityId - Activity ID
     * @returns {Promise}
     */
    static async deleteActivity(sessionId, activityId) {
        try {
            const response = await api.delete(`/api/sessions/${sessionId}/activities/${activityId}`)
            return response.data
        } catch (error) {
            console.error('Delete Activity Error:', error)
            throw new Error(error.response?.data?.message || 'Failed to delete activity')
        }
    }

    /**
     * Update activity status
     * @param {number} sessionId - Session ID
     * @param {number} activityId - Activity ID
     * @param {string} status - Status (active, paused, ended)
     * @returns {Promise}
     */
    static async updateActivityStatus(sessionId, activityId, status) {
        try {
            const response = await api.patch(`/api/sessions/${sessionId}/activities/${activityId}/status`, { status })
            return response.data
        } catch (error) {
            console.error('Update Activity Status Error:', error)
            throw new Error(error.response?.data?.message || 'Failed to update activity status')
        }
    }

    /**
     * End activity
     * @param {number} sessionId - Session ID
     * @param {number} activityId - Activity ID
     * @param {Object} data - Optional data for ending activity
     * @returns {Promise}
     */
    static async endActivity(sessionId, activityId, data = {}) {
        try {
            const response = await api.patch(`/api/sessions/${sessionId}/activities/${activityId}/end`, data)
            return response.data
        } catch (error) {
            console.error('End Activity Error:', error)
            throw new Error(error.response?.data?.message || 'Failed to end activity')
        }
    }

    /**
     * Calculate activity duration
     * @param {number} sessionId - Session ID
     * @param {number} activityId - Activity ID
     * @returns {Promise}
     */
    static async calculateActivityDuration(sessionId, activityId) {
        try {
            const response = await api.patch(`/api/sessions/${sessionId}/activities/${activityId}/calculate-duration`)
            return response.data
        } catch (error) {
            console.error('Calculate Activity Duration Error:', error)
            throw new Error(error.response?.data?.message || 'Failed to calculate activity duration')
        }
    }

    // ==================== Activity Users Methods ====================

    /**
     * Get available users for an activity
     * Handles various Laravel response formats (same as UserService.getAllUsers)
     * @param {number} sessionId - Session ID
     * @param {number} activityId - Activity ID
     * @param {Object} params - Query parameters (paginate, per_page, page, etc.)
     * @returns {Promise<Array>} Array of user objects
     */
    static async getAvailableUsersForActivity(sessionId, activityId, params = {}) {
        try {
            const response = await api.get(`/api/sessions/${sessionId}/activities/${activityId}/users/available`, { params })
            const data = response.data

            // Handle different Laravel response formats (same as users API)
            if (Array.isArray(data)) {
                return data
            }
            if (data?.users && Array.isArray(data.users)) {
                return data.users
            }
            if (data?.data && Array.isArray(data.data)) {
                return data.data
            }
            if (data?.success && Array.isArray(data.data)) {
                return data.data
            }
            // Fallback: try common property names
            const fallback = data?.users ?? data?.data ?? (Array.isArray(data) ? data : [])
            return Array.isArray(fallback) ? fallback : []
        } catch (error) {
            console.error('Get Available Users Error:', error)
            throw new Error(error.response?.data?.message || 'Failed to fetch available users')
        }
    }

    /**
     * Add user to activity
     * @param {number} sessionId - Session ID
     * @param {number} activityId - Activity ID
     * @param {Object} data - User data (user_id, duration_hours, cost_share)
     * @returns {Promise}
     */
    static async addUserToActivity(sessionId, activityId, data) {
        try {
            const response = await api.post(`/api/sessions/${sessionId}/activities/${activityId}/users`, data)
            return response.data
        } catch (error) {
            console.error('Add User To Activity Error:', error)
            throw new Error(error.response?.data?.message || 'Failed to add user to activity')
        }
    }

    /**
     * Remove user from activity
     * @param {number} sessionId - Session ID
     * @param {number} activityId - Activity ID
     * @param {number} userId - User ID
     * @returns {Promise}
     */
    static async removeUserFromActivity(sessionId, activityId, userId) {
        try {
            const response = await api.delete(`/api/sessions/${sessionId}/activities/${activityId}/users/${userId}`)
            return response.data
        } catch (error) {
            console.error('Remove User From Activity Error:', error)
            throw new Error(error.response?.data?.message || 'Failed to remove user from activity')
        }
    }

    // ==================== Activity Products Methods ====================

    /**
     * Get all products for an activity
     * @param {number} sessionId - Session ID
     * @param {number} activityId - Activity ID
     * @returns {Promise}
     */
    static async getActivityProducts(sessionId, activityId) {
        try {
            const response = await api.get(`/api/sessions/${sessionId}/activities/${activityId}/products`)
            return response.data
        } catch (error) {
            console.error('Get Activity Products Error:', error)
            throw new Error(error.response?.data?.message || 'Failed to fetch activity products')
        }
    }

    /**
     * Add product to activity
     * @param {number} sessionId - Session ID
     * @param {number} activityId - Activity ID
     * @param {Object} data - Product data (product_id, quantity, ordered_by_user_id)
     * @returns {Promise}
     */
    static async addProductToActivity(sessionId, activityId, data) {
        try {
            const response = await api.post(`/api/sessions/${sessionId}/activities/${activityId}/products`, data)
            return response.data
        } catch (error) {
            console.error('Add Product To Activity Error:', error)
            throw new Error(error.response?.data?.message || 'Failed to add product to activity')
        }
    }

    /**
     * Update product order in activity
     * @param {number} sessionId - Session ID
     * @param {number} activityId - Activity ID
     * @param {number} productOrderId - Product order ID
     * @param {Object} data - Product data (product_id, quantity, ordered_by_user_id)
     * @returns {Promise}
     */
    static async updateActivityProduct(sessionId, activityId, productOrderId, data) {
        try {
            const response = await api.put(`/api/sessions/${sessionId}/activities/${activityId}/products/${productOrderId}`, data)
            return response.data
        } catch (error) {
            console.error('Update Activity Product Error:', error)
            throw new Error(error.response?.data?.message || 'Failed to update activity product')
        }
    }

    /**
     * Delete product order from activity
     * @param {number} sessionId - Session ID
     * @param {number} activityId - Activity ID
     * @param {number} productOrderId - Product order ID
     * @returns {Promise}
     */
    static async deleteActivityProduct(sessionId, activityId, productOrderId) {
        try {
            const response = await api.delete(`/api/sessions/${sessionId}/activities/${activityId}/products/${productOrderId}`)
            return response.data
        } catch (error) {
            console.error('Delete Activity Product Error:', error)
            throw new Error(error.response?.data?.message || 'Failed to delete activity product')
        }
    }

    /**
     * Get products ordered by a specific user in an activity
     * @param {number} sessionId - Session ID
     * @param {number} activityId - Activity ID
     * @param {number} userId - User ID
     * @returns {Promise}
     */
    static async getActivityProductsByUser(sessionId, activityId, userId) {
        try {
            const response = await api.get(`/api/sessions/${sessionId}/activities/${activityId}/products/user/${userId}`)
            return response.data
        } catch (error) {
            console.error('Get Activity Products By User Error:', error)
            throw new Error(error.response?.data?.message || 'Failed to fetch user products')
        }
    }

    /**
     * Get activity history
     * @param {number} sessionId - Session ID
     * @param {number} activityId - Activity ID
     * @returns {Promise}
     */
    static async getActivityHistory(sessionId, activityId) {
        try {
            const response = await api.get(`/api/sessions/${sessionId}/activities/${activityId}/history`)
            const data = response.data

            // Handle different response formats: { status, data }, { data }, or direct object
            let historyData = data?.data ?? data
            if (!historyData || typeof historyData !== 'object') {
                return { total_price: 0, history: [] }
            }
            // Ensure we have the expected structure (handle snake_case and camelCase)
            const history = historyData.history ?? historyData.activity_history ?? []
            const totalPrice = historyData.total_price ?? historyData.totalPrice ?? 0
            return {
                total_price: totalPrice,
                history: Array.isArray(history) ? history : []
            }
        } catch (error) {
            console.error('Get Activity History Error:', error)
            throw new Error(error.response?.data?.message || 'Failed to fetch activity history')
        }
    }
}

export default SessionService

