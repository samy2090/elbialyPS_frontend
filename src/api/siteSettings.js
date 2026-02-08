/**
 * Site Settings — API Service
 * Uses project axios instance (Bearer token, baseURL from env).
 * Admin-only endpoints: GET /api/site-settings, PUT /api/site-settings.
 */

import api from './axios'

const base = '/api'

export const siteSettingsApi = {
  get() {
    return api.get(`${base}/site-settings`).then((r) => r.data?.data ?? r.data)
  },
  update(body) {
    return api.put(`${base}/site-settings`, body).then((r) => r.data?.data ?? r.data)
  },
}
