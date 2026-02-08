/**
 * Score Points Settings — API Service
 * Uses project axios instance (Bearer token, baseURL from env).
 */

import api from './axios'

const base = '/api'

export const scorePointsSettingsApi = {
  get() {
    return api.get(`${base}/score-points-settings`).then((r) => r.data?.data ?? r.data)
  },
  update(body) {
    return api.put(`${base}/score-points-settings`, body).then((r) => r.data?.data ?? r.data)
  },
}
