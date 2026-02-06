import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as deviceApi from '@/api/devices'

export const useDeviceStore = defineStore('device', () => {
    // State
    const devices = ref([])
    const loading = ref(false)
    const error = ref(null)

    // Getters
    const getDevices = computed(() => devices.value)
    const getDeviceById = computed(() => (id) =>
        devices.value.find(device => device.id === id)
    )

    // Actions
    const fetchDevices = async () => {
        loading.value = true
        error.value = null
        try {
            const response = await deviceApi.getAllDevices()

            // The API now returns { devices: [...], pagination: {...} }
            // Handle the processed response from the API
            if (response && response.devices) {
                devices.value = Array.isArray(response.devices) ? response.devices : []
            } else if (Array.isArray(response)) {
                // Fallback: if response is directly an array
                devices.value = response
            } else {
                // Try to extract devices from various possible structures
                devices.value = response?.data?.devices ||
                    response?.data?.data ||
                    response?.devices ||
                    (Array.isArray(response?.data) ? response.data : []) ||
                    []
            }
        } catch (err) {
            error.value = err.response?.data?.message || err.message || 'Failed to fetch devices'
            devices.value = []
            throw err // Re-throw error for component handling
        } finally {
            loading.value = false
        }
    }

    const createDevice = async (deviceData) => {
        loading.value = true
        error.value = null
        try {
            const response = await deviceApi.createDevice(deviceData)
            // Handle Laravel API response structure for single device
            const newDevice = response.data?.device || response.data || response
            devices.value.push(newDevice)
            return newDevice
        } catch (err) {
            console.error('Error creating device:', err)
            error.value = err.response?.data?.message || err.message || 'Failed to create device'
            throw err
        } finally {
            loading.value = false
        }
    }

    const updateDevice = async (id, deviceData) => {
        loading.value = true
        error.value = null
        try {
            const response = await deviceApi.updateDevice(id, deviceData)
            // Handle Laravel API response structure for single device
            const updatedDevice = response.data?.device || response.data || response
            const index = devices.value.findIndex(device => device.id === id)
            if (index !== -1) {
                devices.value[index] = updatedDevice
            }
            return updatedDevice
        } catch (err) {
            error.value = err.response?.data?.message || err.message || 'Failed to update device'
            throw err
        } finally {
            loading.value = false
        }
    }

    const deleteDevice = async (id) => {
        loading.value = true
        error.value = null
        try {
            await deviceApi.deleteDevice(id)
            devices.value = devices.value.filter(device => device.id !== id)
        } catch (err) {
            error.value = err.response?.data?.message || err.message || 'Failed to delete device'
            throw err
        } finally {
            loading.value = false
        }
    }

    const updateDeviceStatus = async (id, status) => {
        loading.value = true
        error.value = null
        try {
            const response = await deviceApi.updateDeviceStatus(id, status)
            // Handle Laravel API response structure for single device
            const updatedDevice = response.data?.device || response.data || response
            const index = devices.value.findIndex(device => device.id === id)
            if (index !== -1) {
                // Update the active field based on your API structure
                devices.value[index] = { ...devices.value[index], active: status === 'active' }
            }
            return updatedDevice
        } catch (err) {
            error.value = err.response?.data?.message || err.message || 'Failed to update device status'
            throw err
        } finally {
            loading.value = false
        }
    }

    const clearError = () => {
        error.value = null
    }

    return {
        // State
        devices,
        loading,
        error,
        // Getters
        getDevices,
        getDeviceById,
        // Actions
        fetchDevices,
        createDevice,
        updateDevice,
        deleteDevice,
        updateDeviceStatus,
        clearError
    }
})