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
      console.log('Making API request to:', api.defaults.baseURL + '/api/devices')
      const response = await api.get('/api/devices')
      console.log('API Response:', response)
      return response.data
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
      return response.data
    } catch (error) {
      console.error('Create Device Error:', error)
      if (error.response?.status === 422) {
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
      return response.data
    } catch (error) {
      console.error('Update Device Error:', error)
      if (error.response?.status === 404) {
        throw new Error(`Device with ID ${id} not found`)
      } else if (error.response?.status === 422) {
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