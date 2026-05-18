/**
 * Financial Analytics — API Service
 * Backend: /api/financial-analytics/* (admin & staff only)
 *
 * Endpoints:
 *   GET /revenues?period=&from=&to=   → time-series of revenue per bucket
 *   GET /profits?period=&from=&to=&mode=actual|smoothed → operating + net profit per bucket
 *   GET /summary?from=&to=             → totals (revenue, expenses, profit, margins)
 *   GET /breakdown?from=&to=           → rental vs product split + expenses by category
 */

import api from './axios'

const base = '/api/financial-analytics'

export const financialAnalyticsApi = {
  getRevenues({ period = 'daily', from, to } = {}) {
    return api
      .get(`${base}/revenues`, { params: pruneParams({ period, from, to }) })
      .then((r) => r.data?.data ?? r.data)
  },

  getProfits({ period = 'daily', from, to, mode = 'actual' } = {}) {
    return api
      .get(`${base}/profits`, { params: pruneParams({ period, from, to, mode }) })
      .then((r) => r.data?.data ?? r.data)
  },

  getSummary({ from, to } = {}) {
    return api
      .get(`${base}/summary`, { params: pruneParams({ from, to }) })
      .then((r) => r.data?.data ?? r.data)
  },

  getBreakdown({ from, to } = {}) {
    return api
      .get(`${base}/breakdown`, { params: pruneParams({ from, to }) })
      .then((r) => r.data?.data ?? r.data)
  },
}

function pruneParams(params) {
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''),
  )
}
