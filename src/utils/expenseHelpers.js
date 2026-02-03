/**
 * Expense formatting and validation helpers (EGP, Y-m-d display, attachment URLs).
 */

import { resolveBackendImageUrl } from './helpers'

/**
 * Get raw URL string from an attachment object (same pattern as avatars/images elsewhere).
 * Checks file_url, url, path, storage_path, file_path, and nested file.url / file.file_url / file.path.
 * @param {Object} attachment - Attachment from API
 * @returns {string|null}
 */
export function getAttachmentRawUrl(attachment) {
  if (!attachment || typeof attachment !== 'object') return null
  const file = attachment.file
  const url =
    attachment.file_url ||
    attachment.url ||
    attachment.path ||
    attachment.storage_path ||
    attachment.file_path ||
    (file && (file.url || file.file_url || file.path))
  return url && typeof url === 'string' ? url : null
}

/**
 * Resolve attachment URL to a full URL for <img src> or <a href>.
 * Uses the same resolveBackendImageUrl pattern as profile avatars so expense images load correctly.
 * @param {Object} attachment - Attachment from API
 * @returns {string|null} Full URL or null
 */
export function resolveAttachmentUrl(attachment) {
  const raw = getAttachmentRawUrl(attachment)
  return raw ? resolveBackendImageUrl(raw) : null
}

/**
 * Format amount as EGP (2 decimals, thousands separator).
 * @param {number} amount
 * @returns {string} e.g. "1,234.56 EGP"
 */
export function formatCurrencyEGP(amount) {
  if (amount == null || Number.isNaN(Number(amount))) return '0.00 EGP'
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount)) + ' EGP'
}

/**
 * Format API date (Y-m-d or ISO) for display (locale-friendly).
 * @param {string|Date} date
 * @param {Object} [opts] - Intl options
 * @returns {string}
 */
export function formatExpenseDate(date, opts = {}) {
  if (!date) return '—'
  const d = typeof date === 'string' ? new Date(date) : date
  if (Number.isNaN(d.getTime())) return '—'
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...opts,
  }).format(d)
}

/** Allowed attachment extensions (no gif). */
export const ATTACHMENT_EXTENSIONS = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'txt', 'csv']
/** Max attachment size 50 MB */
export const ATTACHMENT_MAX_BYTES = 50 * 1024 * 1024

/**
 * Validate attachment file type and size.
 * @param {File} file
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateAttachment(file) {
  const ext = (file.name.split('.').pop() || '').toLowerCase()
  if (!ATTACHMENT_EXTENSIONS.includes(ext)) {
    return { valid: false, error: `Allowed types: ${ATTACHMENT_EXTENSIONS.join(', ')}. No gif.` }
  }
  if (file.size > ATTACHMENT_MAX_BYTES) {
    return { valid: false, error: 'Max file size is 50 MB.' }
  }
  return { valid: true }
}
