import api from './axios'

/**
 * Spin Wheel Admin API – requires admin Bearer token (Sanctum).
 * Base path: /api/spin-wheel
 */
export const spinWheelAdminApi = {
  getSettings() {
    return api.get('/api/spin-wheel/settings').then((r) => r.data)
  },

  updateSettings(body) {
    return api.put('/api/spin-wheel/settings', body).then((r) => r.data)
  },

  getOptions() {
    return api.get('/api/spin-wheel/options').then((r) => r.data)
  },

  getOption(id) {
    return api.get(`/api/spin-wheel/options/${id}`).then((r) => r.data)
  },

  createOption(body) {
    return api.post('/api/spin-wheel/options', body).then((r) => r.data)
  },

  updateOption(id, body) {
    return api.put(`/api/spin-wheel/options/${id}`, body).then((r) => r.data)
  },

  deleteOption(id) {
    return api.delete(`/api/spin-wheel/options/${id}`).then((r) => r.data)
  },

  getHistory(params = {}) {
    const qs = new URLSearchParams(params).toString()
    return api.get(`/api/spin-wheel/admin/history?${qs}`).then((r) => r.data)
  },

  getClaims(params = {}) {
    const qs = new URLSearchParams(params).toString()
    return api.get(`/api/spin-wheel/claims?${qs}`).then((r) => r.data)
  },

  getClaim(id) {
    return api.get(`/api/spin-wheel/claims/${id}`).then((r) => r.data)
  },

  fulfillClaim(id, body = {}) {
    return api.patch(`/api/spin-wheel/claims/${id}/fulfill`, body).then((r) => r.data)
  }
}
