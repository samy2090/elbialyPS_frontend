/**
 * Comments Admin API — all comments, comments for a post (admin only, Bearer token).
 */

import api from './axios'

const base = '/api'

export const commentsAdminApi = {
  getAllComments(params = {}) {
    return api.get(`${base}/admin/comments`, { params }).then((r) => r.data)
  },
  getCommentsForPost(postId, params = {}) {
    return api.get(`${base}/posts/${postId}/comments`, { params }).then((r) => r.data)
  },
}
