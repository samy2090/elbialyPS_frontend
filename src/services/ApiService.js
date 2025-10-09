import axios from 'axios'

// Create axios instance with default configuration
const ApiService = axios.create({
  baseURL: 'http://localhost:8000', // Base URL without /api prefix to allow access to /sanctum/csrf-cookie
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest', // Required for Laravel Sanctum
  },
  withCredentials: true, // Required for Sanctum session-based auth
})

// Store the CSRF token once retrieved
let csrfToken = null

// Request interceptor
ApiService.interceptors.request.use(
  (config) => {
    // Add auth token to headers if available
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // If we have a CSRF token, add it to the headers
    if (csrfToken) {
      config.headers['X-XSRF-TOKEN'] = csrfToken
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
ApiService.interceptors.response.use(
  (response) => {
    // Extract CSRF token from response if available
    if (response.headers['x-xsrf-token']) {
      csrfToken = response.headers['x-xsrf-token']
    }
    return response
  },
  (error) => {
    // Handle common error responses
    if (error.response?.status === 401) {
      // Unauthorized - clear auth token and redirect to login
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Method to manually set CSRF token if needed
ApiService.setCsrfToken = (token) => {
  csrfToken = token
}

// Method to get current CSRF token
ApiService.getCsrfToken = () => {
  return csrfToken
}

export default ApiService