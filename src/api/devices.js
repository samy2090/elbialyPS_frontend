import api from './axios'

/**
 * Device API service
 */
class DeviceService {
    /**
     * Get all devices
     * @returns {Promise}
     */
    static async getAllDevices() {
        try {
            console.log('=== Devices API Request ===')
            console.log('URL:', api.defaults.baseURL + '/api/devices')
            
            const response = await api.get('/api/devices')
            
            console.log('=== Raw Devices API Response ===')
            console.log('Response object:', response)
            console.log('Response.data:', response.data)
            console.log('Response.data type:', typeof response.data)
            console.log('Is array?', Array.isArray(response.data))
            
            // Handle different Laravel response formats
            let devicesData = null
            
            // Format 1: Laravel Resource Collection with success wrapper
            // { success: true, data: [...], message: "..." }
            if (response.data?.success && Array.isArray(response.data.data)) {
                console.log('Detected format: Success wrapper with data array')
                devicesData = {
                    devices: response.data.data,
                    pagination: response.data.meta || response.data.pagination || null
                }
            }
            // Format 2: Laravel Paginated Response with status wrapper
            // { status: "success", data: { data: [...], current_page, total, ... } }
            else if (response.data?.status === 'success' && response.data?.data?.data && Array.isArray(response.data.data.data) && response.data.data.current_page !== undefined) {
                console.log('Detected format: Laravel paginated response with status wrapper')
                devicesData = {
                    devices: response.data.data.data,
                    pagination: {
                        current_page: response.data.data.current_page,
                        last_page: response.data.data.last_page,
                        per_page: response.data.data.per_page,
                        total: response.data.data.total,
                        from: response.data.data.from,
                        to: response.data.data.to,
                        links: response.data.data.links || null
                    }
                }
            }
            // Format 2b: Laravel Paginated Response (most common)
            // { data: [...], current_page, total, per_page, last_page, ... }
            else if (response.data?.data && Array.isArray(response.data.data) && response.data.current_page !== undefined) {
                console.log('Detected format: Laravel paginated response')
                devicesData = {
                    devices: response.data.data,
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
                devicesData = {
                    devices: response.data,
                    pagination: null
                }
            }
            // Format 4: Nested devices property
            // { devices: [...], pagination: {...} }
            else if (response.data?.devices && Array.isArray(response.data.devices)) {
                console.log('Detected format: Nested devices property')
                devicesData = {
                    devices: response.data.devices,
                    pagination: response.data.pagination || response.data.meta || null
                }
            }
            // Format 5: Resource Collection (Laravel API Resource)
            // { data: [...], meta: {...}, links: {...} }
            else if (response.data?.data && Array.isArray(response.data.data) && response.data.meta) {
                console.log('Detected format: Resource Collection with meta')
                devicesData = {
                    devices: response.data.data,
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
                devicesData = {
                    devices: response.data.data.data,
                    pagination: response.data.data.pagination || response.data.pagination || null
                }
            }
            // Format 7: Single device object (shouldn't happen but handle it)
            else if (response.data && typeof response.data === 'object' && response.data.id && !Array.isArray(response.data)) {
                console.log('Detected format: Single device object (unexpected)')
                devicesData = {
                    devices: [response.data],
                    pagination: null
                }
            }
            // Fallback: try to extract any array from response
            else {
                console.warn('=== UNEXPECTED RESPONSE FORMAT ===')
                console.warn('Full response.data:', JSON.stringify(response.data, null, 2))
                console.warn('Attempting fallback extraction...')
                
                // Try multiple fallback strategies
                const fallbackDevices = 
                    response.data?.data || 
                    response.data?.devices || 
                    (Array.isArray(response.data) ? response.data : []) ||
                    []
                
                devicesData = {
                    devices: Array.isArray(fallbackDevices) ? fallbackDevices : [],
                    pagination: null
                }
            }
            
            console.log('=== Processed Devices Data ===')
            console.log('Devices count:', devicesData.devices?.length || 0)
            console.log('First device sample:', devicesData.devices?.[0] || 'No devices')
            console.log('Pagination:', devicesData.pagination)
            console.log('==================')
            
            return devicesData
        } catch (error) {
            console.error('Get Devices Error Details:', {
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
                throw new Error(error.response?.data?.message || error.message || 'Failed to fetch devices')
            }
        }
    }

    /**
     * Get device by ID
     * @param {number} id - Device ID
     * @returns {Promise}
     */
    static async getDeviceById(id) {
        try {
            const response = await api.get(`/api/devices/${id}`)
            console.log('Get Device By ID Response:', response.data)
            
            // Handle different response formats
            if (response.data?.data) {
                return response.data.data
            } else if (response.data?.device) {
                return response.data.device
            }
            return response.data
        } catch (error) {
            console.error('Get Device Error:', error)
            if (error.response?.status === 404) {
                throw new Error(`Device with ID ${id} not found`)
            }
            throw new Error(error.response?.data?.message || error.message || 'Failed to fetch device')
        }
    }

    /**
     * Create new device
     * @param {Object} deviceData - Device data
     * @returns {Promise}
     */
    static async createDevice(deviceData) {
        try {
            const response = await api.post('/api/devices', deviceData)
            console.log('Create Device Response:', response.data)
            
            // Handle different response formats
            if (response.data?.data) {
                return response.data.data
            } else if (response.data?.device) {
                return response.data.device
            }
            return response.data
        } catch (error) {
            console.error('Create Device Error:', error)
            if (error.response?.status === 422) {
                // Handle validation errors
                const validationErrors = error.response.data?.errors
                if (validationErrors) {
                    const errorMessage = Object.values(validationErrors).flat().join(', ')
                    throw new Error(errorMessage || 'Validation error - please check your input')
                }
                throw new Error(error.response.data?.message || 'Validation error - please check your input')
            }
            throw new Error(error.response?.data?.message || error.message || 'Failed to create device')
        }
    }

    /**
     * Update device
     * @param {number} id - Device ID
     * @param {Object} deviceData - Updated device data
     * @returns {Promise}
     */
    static async updateDevice(id, deviceData) {
        try {
            const response = await api.put(`/api/devices/${id}`, deviceData)
            console.log('Update Device Response:', response.data)
            
            // Handle different response formats
            if (response.data?.data) {
                return response.data.data
            } else if (response.data?.device) {
                return response.data.device
            }
            return response.data
        } catch (error) {
            console.error('Update Device Error:', error)
            if (error.response?.status === 404) {
                throw new Error(`Device with ID ${id} not found`)
            } else if (error.response?.status === 422) {
                // Handle validation errors
                const validationErrors = error.response.data?.errors
                if (validationErrors) {
                    const errorMessage = Object.values(validationErrors).flat().join(', ')
                    throw new Error(errorMessage || 'Validation error - please check your input')
                }
                throw new Error(error.response.data?.message || 'Validation error - please check your input')
            }
            throw new Error(error.response?.data?.message || error.message || 'Failed to update device')
        }
    }

    /**
     * Delete device
     * @param {number} id - Device ID
     * @returns {Promise}
     */
    static async deleteDevice(id) {
        try {
            const response = await api.delete(`/api/devices/${id}`)
            return response.data
        } catch (error) {
            console.error('Delete Device Error:', error)
            if (error.response?.status === 404) {
                throw new Error(`Device with ID ${id} not found`)
            }
            throw new Error(error.response?.data?.message || error.message || 'Failed to delete device')
        }
    }

    /**
     * Update device status
     * @param {number} id - Device ID
     * @param {string} status - New status
     * @returns {Promise}
     */
    static async updateDeviceStatus(id, status) {
        try {
            const response = await api.patch(`/api/devices/${id}/status`, { status })
            return response.data
        } catch (error) {
            console.error('Update Device Status Error:', error)
            if (error.response?.status === 404) {
                throw new Error(`Device with ID ${id} not found`)
            }
            throw new Error(error.response?.data?.message || error.message || 'Failed to update device status')
        }
    }
}

// Export individual methods for backward compatibility
export const getAllDevices = DeviceService.getAllDevices
export const getDeviceById = DeviceService.getDeviceById
export const createDevice = DeviceService.createDevice
export const updateDevice = DeviceService.updateDevice
export const deleteDevice = DeviceService.deleteDevice
export const updateDeviceStatus = DeviceService.updateDeviceStatus

// Export the service class
export default DeviceService