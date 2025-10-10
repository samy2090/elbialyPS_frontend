import axios from 'axios'

// Store the CSRF token once retrieved
let csrfToken = null

// Create axios instance with default configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000', // Use environment variable or default
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest', // Required for Laravel Sanctum
  },
  withCredentials: true, // Required for Sanctum session-based auth
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Ensure X-Requested-With header is always set
    config.headers['X-Requested-With'] = 'XMLHttpRequest'

    // Add CSRF token to headers if available
    if (csrfToken) {
      config.headers['X-XSRF-TOKEN'] = csrfToken
    }

    // Add Bearer token if available
    const authToken = localStorage.getItem('auth_token')
    if (authToken) {
      config.headers['Authorization'] = `Bearer ${authToken}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('API Response received:', response.status, response.statusText)

    // Extract CSRF token from response if available
    if (response.headers['x-xsrf-token']) {
      csrfToken = response.headers['x-xsrf-token']
    } else {
      // Try to extract from cookies
      const cookies = document.cookie.split(';')
      for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=')
        if (name === 'XSRF-TOKEN') {
          try {
            csrfToken = decodeURIComponent(value)
          } catch {
            csrfToken = value
          }
          break
        }
      }
    }

    return response
  },
  (error) => {
    // Handle common error responses
    if (error.response?.status === 401) {
      console.log('Unauthorized - should redirect to login')
      // Don't automatically redirect here, let the component handle it
    }
    return Promise.reject(error)
  }
)

// Method to manually set CSRF token if needed
api.setCsrfToken = (token) => {
  csrfToken = token
}

// Method to get current CSRF token
api.getCsrfToken = () => {
  return csrfToken
}

export default api