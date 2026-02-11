/**
 * Posts Admin API — pending, all posts, approve, reject (admin only, Bearer token).
 */

import api from './axios'

const base = '/api'

export const postsAdminApi = {
  getPending(params = {}) {
    return api.get(`${base}/posts/pending`, { params }).then((r) => r.data)
  },
  getAllPosts(params = {}) {
    return api.get(`${base}/admin/posts`, { params }).then((r) => r.data)
  },
  approve(id) {
    return api.post(`${base}/posts/${id}/approve`).then((r) => r.data)
  },
  reject(id) {
    return api.delete(`${base}/posts/${id}`).then((r) => r.data)
  },
}
