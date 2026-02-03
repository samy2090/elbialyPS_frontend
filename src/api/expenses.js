/**
 * Expense Management — API Service
 * Uses project axios instance; paths under /api for Laravel backend.
 */

import api from './axios'

const base = '/api'

// ============ Expense Categories ============
export const expenseCategoriesApi = {
  list() {
    return api.get(`${base}/expense-categories`).then((r) => r.data?.data ?? r.data)
  },
  listPaginated(params = {}) {
    return api.get(`${base}/expense-categories/paginated`, { params }).then((r) => r.data)
  },
  getMain() {
    return api.get(`${base}/expense-categories/main`).then((r) => r.data?.data ?? r.data)
  },
  getActive() {
    return api.get(`${base}/expense-categories/active`).then((r) => r.data?.data ?? r.data)
  },
  getById(id) {
    return api.get(`${base}/expense-categories/${id}`).then((r) => r.data?.data ?? r.data)
  },
  getSubCategories(parentId) {
    return api.get(`${base}/expense-categories/${parentId}/sub-categories`).then((r) => r.data?.data ?? r.data)
  },
  create(body) {
    return api.post(`${base}/expense-categories`, body).then((r) => r.data?.data ?? r.data)
  },
  update(id, body) {
    return api.put(`${base}/expense-categories/${id}`, body).then((r) => r.data?.data ?? r.data)
  },
  delete(id) {
    return api.delete(`${base}/expense-categories/${id}`).then((r) => r.data)
  },
  deactivate(id) {
    return api.patch(`${base}/expense-categories/${id}/deactivate`).then((r) => r.data)
  },
  activate(id) {
    return api.patch(`${base}/expense-categories/${id}/activate`).then((r) => r.data)
  },
}

// ============ Expenses ============
export const expensesApi = {
  list(params = {}) {
    return api.get(`${base}/expenses`, { params }).then((r) => r.data)
  },
  getByDateRange(startDate, endDate, params = {}) {
    return api.get(`${base}/expenses/date-range`, { params: { start_date: startDate, end_date: endDate, ...params } }).then((r) => r.data)
  },
  getByCategory(categoryId, params = {}) {
    return api.get(`${base}/expenses/category/${categoryId}`, { params }).then((r) => r.data)
  },
  getByStatus(status, params = {}) {
    return api.get(`${base}/expenses/status/${status}`, { params }).then((r) => r.data)
  },
  getRecurring(params = {}) {
    return api.get(`${base}/expenses/recurring`, { params }).then((r) => r.data)
  },
  getById(id) {
    return api.get(`${base}/expenses/${id}`).then((r) => r.data?.data ?? r.data)
  },
  create(body) {
    return api.post(`${base}/expenses`, body).then((r) => r.data?.data ?? r.data)
  },
  update(id, body) {
    return api.put(`${base}/expenses/${id}`, body).then((r) => r.data?.data ?? r.data)
  },
  delete(id) {
    return api.delete(`${base}/expenses/${id}`).then((r) => r.data)
  },
  markPaid(id) {
    return api.patch(`${base}/expenses/${id}/mark-paid`).then((r) => r.data)
  },
  markUnpaid(id) {
    return api.patch(`${base}/expenses/${id}/mark-unpaid`).then((r) => r.data)
  },
  getAttachments(expenseId) {
    return api.get(`${base}/expenses/${expenseId}/attachments`).then((r) => r.data?.data ?? r.data)
  },
  uploadAttachment(expenseId, file) {
    const formData = new FormData()
    formData.append('file', file)
    return api.post(`${base}/expenses/${expenseId}/attachments`, formData).then((r) => r.data?.data ?? r.data)
  },
  deleteAttachment(expenseId, attachmentId) {
    return api.delete(`${base}/expenses/${expenseId}/attachments/${attachmentId}`).then((r) => r.data)
  },
}

// ============ Expense Recurrences ============
export const expenseRecurrencesApi = {
  list(params = {}) {
    return api.get(`${base}/expense-recurrences`, { params }).then((r) => r.data)
  },
  getActive() {
    return api.get(`${base}/expense-recurrences/active`).then((r) => r.data?.data ?? r.data)
  },
  getOverdue() {
    return api.get(`${base}/expense-recurrences/overdue`).then((r) => r.data?.data ?? r.data)
  },
  getDueWithin(days = 30) {
    return api.get(`${base}/expense-recurrences/due-within`, { params: { days } }).then((r) => r.data?.data ?? r.data)
  },
  getById(id) {
    return api.get(`${base}/expense-recurrences/${id}`).then((r) => r.data?.data ?? r.data)
  },
  create(body) {
    return api.post(`${base}/expense-recurrences`, body).then((r) => r.data?.data ?? r.data)
  },
  update(id, body) {
    return api.put(`${base}/expense-recurrences/${id}`, body).then((r) => r.data?.data ?? r.data)
  },
  delete(id) {
    return api.delete(`${base}/expense-recurrences/${id}`).then((r) => r.data)
  },
  deactivate(id) {
    return api.patch(`${base}/expense-recurrences/${id}/deactivate`).then((r) => r.data)
  },
  activate(id) {
    return api.patch(`${base}/expense-recurrences/${id}/activate`).then((r) => r.data)
  },
  confirmPayment(id) {
    return api.post(`${base}/expense-recurrences/${id}/confirm-payment`).then((r) => r.data?.data ?? r.data)
  },
}

// ============ Expense Reports ============
export const expenseReportsApi = {
  getSummary(params = {}) {
    return api.get(`${base}/expense-reports/summary`, { params }).then((r) => r.data?.data ?? r.data)
  },
  getByCategory(params = {}) {
    return api.get(`${base}/expense-reports/by-category`, { params }).then((r) => r.data?.data ?? r.data)
  },
  getPaidVsUnpaid(params = {}) {
    return api.get(`${base}/expense-reports/paid-vs-unpaid`, { params }).then((r) => r.data?.data ?? r.data)
  },
  getMonthlySummary(year) {
    return api.get(`${base}/expense-reports/monthly`, { params: { year } }).then((r) => r.data?.data ?? r.data)
  },
  getUpcomingRecurring(days = 30) {
    return api.get(`${base}/expense-reports/upcoming-recurring`, { params: { days } }).then((r) => r.data?.data ?? r.data)
  },
  getOverdueRecurring() {
    return api.get(`${base}/expense-reports/overdue-recurring`).then((r) => r.data?.data ?? r.data)
  },
}
