/**
 * Site Settings — API Service
 * site_name (and other static fields): cached.
 * place_status: never cached, always from latest fetch.
 */

import api from './axios'

const base = '/api'

const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

/** Cached static fields only (excludes place_status) */
let staticCache = {
  data: null,
  timestamp: 0,
}

function isStaticCacheValid() {
  return staticCache.data != null && (Date.now() - staticCache.timestamp) < CACHE_TTL_MS
}

/** Build cacheable object: all fields except place_status */
function toStaticCache(data) {
  if (data == null) return null
  const { place_status, ...rest } = data
  return rest
}

export function invalidateSiteSettingsCache() {
  staticCache = { data: null, timestamp: 0 }
}

export const siteSettingsApi = {
  /**
   * Always fetches from API so place_status is fresh.
   * Updates static cache (site_name, etc.) for getCachedStatic().
   */
  get() {
    return api
      .get(`${base}/site-settings`)
      .then((r) => {
        const data = r.data?.data ?? r.data
        staticCache = { data: toStaticCache(data), timestamp: Date.now() }
        return data
      })
  },

  /**
   * Returns cached static settings only (site_name, etc.) when valid.
   * Does not fetch; place_status is never in cache. Use get() for fresh data.
   */
  getCachedStatic() {
    return Promise.resolve(isStaticCacheValid() ? staticCache.data : null)
  },

  update(body) {
    return api
      .put(`${base}/site-settings`, body)
      .then((r) => {
        const data = r.data?.data ?? r.data
        staticCache = { data: toStaticCache(data), timestamp: Date.now() }
        return data
      })
  },
}
