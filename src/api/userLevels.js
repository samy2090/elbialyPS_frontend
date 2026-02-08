/**
 * User Levels (loyalty tiers) — API Service
 * Uses project axios instance (Bearer token, baseURL from env).
 * Admin-only; all endpoints require Sanctum auth.
 */

import api from './axios'

const base = '/api'

export const userLevelsApi = {
  list() {
    return api.get(`${base}/user-levels`).then((r) => r.data?.data ?? r.data)
  },
  get(id) {
    return api.get(`${base}/user-levels/${id}`).then((r) => r.data?.data ?? r.data)
  },
  create(body) {
    return api.post(`${base}/user-levels`, body).then((r) => r.data?.data ?? r.data)
  },
  update(id, body) {
    return api.put(`${base}/user-levels/${id}`, body).then((r) => r.data?.data ?? r.data)
  },
  delete(id) {
    return api.delete(`${base}/user-levels/${id}`)
  },
}
