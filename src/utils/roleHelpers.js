/**
 * Utility functions for handling user roles
 */

/**
 * Get user role name for display (e.g. "Admin", "Staff").
 * Supports backend shape: user.role = { id, name, permissions }.
 * @param {Object} user - User object
 * @returns {string} Role display name
 */
export const getUserRole = (user) => {
  if (!user) return 'User'

  const raw = getRoleNameRaw(user)
  if (!raw) return 'User'
  const s = String(raw).trim()
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : 'User'
}

/**
 * Get raw role name (lowercase string) from user. Used internally.
 * Backend shape: user.role = { id, name, permissions } → use role.name.
 */
function getRoleNameRaw(user) {
  if (!user) return null
  // Backend: user.role = { id, name, permissions }
  if (user.role && typeof user.role === 'object' && (user.role.name != null || user.role.slug != null)) {
    const name = user.role.name ?? user.role.slug ?? ''
    return name ? String(name).toLowerCase() : null
  }
  if (user.role != null && user.role !== '' && typeof user.role === 'string') {
    return String(user.role).toLowerCase()
  }
  if (user.userType != null && user.userType !== '') {
    return String(user.userType).toLowerCase()
  }
  if (user.roles && user.roles.length > 0) {
    const first = user.roles[0]
    const name = first?.name ?? first?.slug ?? first
    return name ? String(name).toLowerCase() : null
  }
  if (user.is_admin) return 'admin'
  // Fallback: role_id only (e.g. 1 = admin, 2 = staff, 3 = user, 4 = guest - Laravel convention)
  if (user.role_id != null) {
    const id = Number(user.role_id)
    if (id === 1) return 'admin'
    if (id === 2) return 'staff'
    if (id === 3) return 'user'
    if (id === 4) return 'guest'
  }
  return null
}

/**
 * Get CSS class for role badge (e.g. role-admin, role-staff).
 * @param {Object} user - User object
 * @returns {string} CSS class name
 */
export const getRoleClass = (user) => {
  if (!user) return 'role-user'
  const role = getRoleNameRaw(user) || 'user'
  const r = String(role).toLowerCase()
  if (r.includes('admin')) return 'role-admin'
  if (r.includes('staff')) return 'role-staff'
  if (r.includes('guest')) return 'role-guest'
  return 'role-user'
}

/**
 * Convert user object to role string for form/checks (e.g. 'admin', 'staff').
 * Supports backend shape: user.role = { id, name, permissions }.
 * @param {Object} user - User object
 * @returns {string} Role string (lowercase)
 */
export const getUserRoleForForm = (user) => {
  if (!user) return 'user'
  const raw = getRoleNameRaw(user)
  return raw || 'user'
}

/**
 * Role ID mapping (backend convention): 1=admin, 2=staff, 3=user, 4=guest
 */
export const ROLE_IDS = {
  admin: 1,
  staff: 2,
  user: 3,
  guest: 4
}

/**
 * Get all available roles (value = role_id for backend)
 * @returns {Array} Array of role objects { value: number, label, description }
 */
export const getAvailableRoles = () => [
  { value: ROLE_IDS.admin, label: 'Admin', description: 'Full system access' },
  { value: ROLE_IDS.staff, label: 'Staff', description: 'Staff with dashboard access' },
  { value: ROLE_IDS.user, label: 'User', description: 'Standard user with basic permissions' },
  { value: ROLE_IDS.guest, label: 'Guest', description: 'Guest with limited access' }
]

/**
 * Check if role has admin privileges (by name)
 * @param {string} role - Role name
 * @returns {boolean} True if role has admin privileges
 */
export const isAdminRole = (role) => {
  if (role == null) return false
  const r = String(role).toLowerCase()
  return r === 'admin' || r === 'administrator'
}

/**
 * Check if role_id has admin privileges
 * @param {number} roleId - Role ID
 * @returns {boolean} True if role is admin
 */
export const isAdminRoleById = (roleId) => {
  return Number(roleId) === ROLE_IDS.admin
}

/**
 * Get user's role_id for form/API. Prefers user.role_id or user.role.id, else infers from name.
 * @param {Object} user - User object
 * @returns {number} Role ID (1–4)
 */
export const getUserRoleId = (user) => {
  if (!user) return ROLE_IDS.user
  if (user.role_id != null) return Number(user.role_id)
  if (user.role && typeof user.role === 'object' && user.role.id != null) return Number(user.role.id)
  const name = getRoleNameRaw(user)
  if (!name) return ROLE_IDS.user
  const r = name.toLowerCase()
  if (r === 'admin' || r === 'administrator') return ROLE_IDS.admin
  if (r === 'staff') return ROLE_IDS.staff
  if (r === 'guest') return ROLE_IDS.guest
  return ROLE_IDS.user
}

/**
 * Roles allowed to access the dashboard (admin + staff)
 */
const DASHBOARD_ROLES = ['admin', 'administrator', 'staff']

/**
 * Check if role can access dashboard (admin or staff)
 * @param {string} role - Role name
 * @returns {boolean} True if role can access dashboard
 */
export const canAccessDashboard = (role) => {
  if (role == null) return false
  const r = String(role).toLowerCase()
  return DASHBOARD_ROLES.includes(r)
}