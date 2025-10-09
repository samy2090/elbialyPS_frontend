/**
 * Format currency
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

/**
 * Format date
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date))
}

/**
 * Truncate text
 * @param {string} text - Text to truncate
 * @param {number} length - Maximum length
 * @returns {string} Truncated text
 */
export function truncateText(text, length = 100) {
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

/**
 * Check if user is admin
 * @param {Object} user - User object
 * @returns {boolean} True if user is admin
 */
export function isAdmin(user) {
  return user && user.is_admin
}

/**
 * Check if user is authenticated
 * @param {Object} user - User object
 * @returns {boolean} True if user is authenticated
 */
export function isAuthenticated(user) {
  return !!user
}

export default {
  formatCurrency,
  formatDate,
  truncateText,
  isAdmin,
  isAuthenticated
}