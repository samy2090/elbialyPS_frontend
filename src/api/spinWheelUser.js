import api from './axios'

/**
 * Spin Wheel User API – requires authenticated user (Bearer token).
 * Base path: /api/spin-wheel
 */
export const spinWheelApi = {
  getStatus() {
    return api.get('/api/spin-wheel/status').then((r) => r.data)
  },

  spin() {
    return api.post('/api/spin-wheel/spin').then((r) => r.data)
  },

  choose() {
    return api.post('/api/spin-wheel/choose').then((r) => r.data)
  },

  getHistory(params = {}) {
    const qs = new URLSearchParams(params).toString()
    return api.get(`/api/spin-wheel/history?${qs}`).then((r) => r.data)
  },

  getMyClaims(params = {}) {
    const qs = new URLSearchParams(params).toString()
    return api.get(`/api/spin-wheel/my-claims?${qs}`).then((r) => r.data)
  }
}
