import api from './axios'

/**
 * Ranks & Leaderboard API
 * GET /api/points/leaderboard - Public, paginated leaderboard
 * GET /api/points/rank/{userId} - Public, specific user rank
 * GET /api/points/my-rank - Auth required, current user rank
 */
export const ranksApi = {
  /**
   * @param {{ period: 'today'|'month'|'all-time', limit?: number, page?: number, month?: number, year?: number }} params
   */
  leaderboard(params) {
    const qs = new URLSearchParams()
    if (params.period) qs.set('period', params.period)
    if (params.limit != null) qs.set('limit', String(params.limit))
    if (params.page != null) qs.set('page', String(params.page))
    if (params.month != null) qs.set('month', String(params.month))
    if (params.year != null) qs.set('year', String(params.year))
    return api.get(`/api/points/leaderboard?${qs.toString()}`).then((r) => r.data)
  },

  /**
   * @param {number} userId
   * @param {{ period: 'today'|'month'|'all-time', month?: number, year?: number }} params
   */
  userRank(userId, params) {
    const qs = new URLSearchParams()
    if (params.period) qs.set('period', params.period)
    if (params.month != null) qs.set('month', String(params.month))
    if (params.year != null) qs.set('year', String(params.year))
    return api.get(`/api/points/rank/${userId}?${qs.toString()}`).then((r) => r.data?.data ?? r.data)
  },

  /**
   * @param {{ period: 'today'|'month'|'all-time', month?: number, year?: number }} params
   */
  myRank(params) {
    const qs = new URLSearchParams()
    if (params.period) qs.set('period', params.period)
    if (params.month != null) qs.set('month', String(params.month))
    if (params.year != null) qs.set('year', String(params.year))
    return api.get(`/api/points/my-rank?${qs.toString()}`).then((r) => r.data?.data ?? r.data)
  },
}
