import api from './axios'

/**
 * Admin API for user point balances and score_points_transactions
 * GET /api/user-point-balances - List users with balances (search, level_id, page)
 * GET /api/user-point-balances/me - Current user's balance & level (for profile)
 * POST /api/user-point-balances/{userId}/adjust - Adjust points
 * GET /api/user-point-balances/{userId}/transactions - User's transactions
 * GET /api/score-points-transactions - All transactions (admin ledger)
 */
export const userPointBalancesApi = {
  list(params = {}) {
    return api.get('/api/user-point-balances', { params }).then((r) => r.data)
  },
  /** Current authenticated user's balance and level (for profile page). */
  getMyBalance() {
    return api.get('/api/user-point-balances/me').then((r) => r.data?.data ?? r.data)
  },
  adjust(userId, body) {
    return api.post(`/api/user-point-balances/${userId}/adjust`, body).then((r) => r.data)
  },
  getTransactions(userId, params = {}) {
    return api
      .get('/api/score-points-transactions', { params: { user_id: userId, ...params } })
      .then((r) => r.data)
      .catch(() => ({ data: [], current_page: 1, last_page: 1, total: 0 }))
  },
  /** All transactions in the system (admin ledger) */
  listAllTransactions(params = {}) {
    return api
      .get('/api/score-points-transactions', { params })
      .then((r) => r.data)
      .catch(() => ({ data: [], current_page: 1, last_page: 1, total: 0 }))
  }
}
