/**
 * Utility functions for handling user roles
 */

/**
 * Get user role name from user object
 * @param {Object} user - User object
 * @returns {string} Role name
 */
export const getUserRole = (user) => {
  if (!user) return 'User'
  
  if (user.role) {
    // If user has a specific role field, use it
    return user.role.charAt(0).toUpperCase() + user.role.slice(1)
  } else if (user.roles && user.roles.length > 0) {
    // If user has multiple roles, show the first one or primary role
    const roleName = user.roles[0].name || user.roles[0]
    return roleName.charAt(0).toUpperCase() + roleName.slice(1)
  } else if (user.is_admin !== undefined) {
    // Fallback to is_admin boolean
    return user.is_admin ? 'Administrator' : 'User'
  }
  return 'User' // Default fallback
}

/**
 * Get CSS class for role badge
 * @param {Object} user - User object
 * @returns {string} CSS class name
 */
export const getRoleClass = (user) => {
  if (!user) return 'role-user'
  
  const role = getUserRole(user).toLowerCase()
  if (role.includes('admin')) {
    return 'role-admin'
  } else if (role.includes('manager') || role.includes('moderator')) {
    return 'role-manager'
  } else if (role.includes('editor')) {
    return 'role-editor'
  }
  return 'role-user'
}

/**
 * Convert user object to role string for form usage
 * @param {Object} user - User object
 * @returns {string} Role string
 */
export const getUserRoleForForm = (user) => {
  if (!user) return 'user'
  
  if (user.role) {
    return user.role.toLowerCase()
  } else if (user.roles && user.roles.length > 0) {
    const roleName = user.roles[0].name || user.roles[0]
    return roleName.toLowerCase()
  } else if (user.is_admin) {
    return 'admin'
  }
  return 'user'
}

/**
 * Get all available roles
 * @returns {Array} Array of role objects
 */
export const getAvailableRoles = () => [
  { value: 'user', label: 'User', description: 'Standard user with basic permissions' },
  { value: 'editor', label: 'Editor', description: 'Can create and edit content' },
  { value: 'manager', label: 'Manager', description: 'Can manage users and content' },
  { value: 'admin', label: 'Administrator', description: 'Full system access' }
]

/**
 * Check if role has admin privileges
 * @param {string} role - Role name
 * @returns {boolean} True if role has admin privileges
 */
export const isAdminRole = (role) => {
  return role === 'admin' || role === 'administrator'
}