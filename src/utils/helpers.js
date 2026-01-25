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

/**
 * Format duration hours to "H:MM minutes" format
 * @param {number|string} hours - Duration in hours (e.g., 0.5, 1.5, 2.0)
 * @returns {string} Formatted duration string (e.g., "0:30 minutes", "1:30 minutes", "2:00 minutes")
 */
export function formatDuration(hours) {
  if (hours === null || hours === undefined || hours === '') {
    return null
  }

  const hoursNum = parseFloat(hours)
  if (isNaN(hoursNum)) {
    return null
  }

  const hoursInt = Math.floor(hoursNum)
  const minutes = Math.round((hoursNum - hoursInt) * 60)

  // Handle edge case where minutes round to 60
  const finalHours = minutes >= 60 ? hoursInt + 1 : hoursInt
  const finalMinutes = minutes >= 60 ? 0 : minutes

  return `${finalHours}:${String(finalMinutes).padStart(2, '0')} minutes`
}

export default {
  formatCurrency,
  formatDate,
  truncateText,
  isAdmin,
  isAuthenticated,
  formatDuration
}