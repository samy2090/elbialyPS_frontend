/**
 * Public posts API (feed, single post, create, react, comments).
 * Uses project axios instance (Bearer token when logged in, baseURL from env).
 * Feed and single post work without auth; create/react/comment require auth.
 */
import api from './axios'

const base = '/api'

export const postsApi = {
  /**
   * Get paginated feed.
   * @param {Object} params - { sort: 'newest'|'most_reacted'|'most_commented', author_id?, cursor?, per_page? }
   * @returns {Promise<{ data: Array, meta: { next_cursor, has_more } }>}
   */
  getFeed(params = {}) {
    const { sort = 'newest', author_id, cursor, per_page = 5 } = params
    const query = { sort, per_page }
    if (author_id != null) query.author_id = author_id
    if (cursor != null) query.cursor = cursor
    return api.get(`${base}/posts`, { params: query }).then((r) => {
      const data = r.data?.data ?? r.data ?? []
      const meta = r.data?.meta ?? { next_cursor: null, has_more: false }
      return { data: Array.isArray(data) ? data : [], meta }
    })
  },

  /**
   * Get single post by id.
   * @param {number} id - Post id
   * @returns {Promise<Object>}
   */
  getPost(id) {
    return api.get(`${base}/posts/${id}`).then((r) => r.data?.data ?? r.data ?? r)
  },

  /**
   * Create post (auth required). multipart/form-data if images.
   * @param {Object} payload - { body, tagged_user_ids?, images? (File[]) }
   * @returns {Promise<Object>}
   */
  create(payload) {
    const hasFiles = payload.images?.length
    const timeout = 60000 // 60s for create/post (uploads can be slow)
    if (hasFiles) {
      const form = new FormData()
      form.append('body', payload.body ?? '')
      if (payload.tagged_user_ids?.length) {
        payload.tagged_user_ids.forEach((id) => form.append('tagged_user_ids[]', id))
      }
      payload.images.forEach((file) => form.append('images[]', file))
      return api.post(`${base}/posts`, form, { timeout }).then((r) => r.data?.data ?? r.data ?? r)
    }
    return api
      .post(`${base}/posts`, {
        body: payload.body ?? '',
        tagged_user_ids: payload.tagged_user_ids ?? [],
      }, { timeout })
      .then((r) => r.data?.data ?? r.data ?? r)
  },

  /**
   * Update post (auth, owner). multipart/form-data if sending new images (replaces all).
   * @param {number} id - Post id
   * @param {Object} payload - { body?, tagged_user_ids?, images? (File[]) }
   * @returns {Promise<Object>}
   */
  update(id, payload) {
    const hasFiles = payload.images?.length
    const timeout = 60000
    if (hasFiles) {
      const form = new FormData()
      form.append('_method', 'PUT')
      if (payload.body != null) form.append('body', payload.body)
      if (payload.tagged_user_ids?.length) {
        payload.tagged_user_ids.forEach((uid) => form.append('tagged_user_ids[]', uid))
      }
      payload.images.forEach((file) => form.append('images[]', file))
      return api.post(`${base}/posts/${id}`, form, { timeout }).then((r) => r.data?.data ?? r.data ?? r)
    }
    const body = {
      body: payload.body,
      tagged_user_ids: payload.tagged_user_ids,
    }
    if (Array.isArray(payload.images) && payload.images.length === 0) {
      body.remove_all_media = true
    }
    return api.put(`${base}/posts/${id}`, body, { timeout }).then((r) => r.data?.data ?? r.data ?? r)
  },

  /**
   * Delete post (auth, owner).
   * @param {number} id - Post id
   * @returns {Promise<void>}
   */
  delete(id) {
    return api.delete(`${base}/posts/${id}`).then(() => {})
  },

  /**
   * Add or change reaction (auth required).
   * @param {number} postId - Post id
   * @param {string} reactionType - 'like'|'love'|'haha'|'wow'|'sad'
   * @returns {Promise<Object>}
   */
  react(postId, reactionType) {
    return api.post(`${base}/posts/${postId}/react`, { reaction_type: reactionType }).then((r) => r.data?.data ?? r.data ?? r)
  },

  /**
   * Remove current user's reaction from a post (auth required).
   * API: DELETE /api/posts/{id}/react
   * @param {number} postId - Post id
   * @returns {Promise<void>}
   */
  removeReact(postId) {
    return api.delete(`${base}/posts/${postId}/react`).then(() => {})
  },

  /**
   * Get comments for a post (paginated).
   * @param {number} postId - Post id
   * @param {Object} params - { per_page?, cursor? }
   * @returns {Promise<{ data: Array, meta: { next_cursor, has_more } }>}
   */
  getComments(postId, params = {}) {
    const { per_page = 10, cursor } = params
    const query = { per_page }
    if (cursor != null) query.cursor = cursor
    return api.get(`${base}/posts/${postId}/comments`, { params: query }).then((r) => {
      const data = r.data?.data ?? r.data ?? []
      const meta = r.data?.meta ?? { next_cursor: null, has_more: false }
      return { data: Array.isArray(data) ? data : [], meta }
    })
  },

  /**
   * Add comment (auth required).
   * @param {number} postId - Post id
   * @param {Object} payload - { body, parent_id? }
   * @returns {Promise<Object>}
   */
  addComment(postId, payload) {
    return api.post(`${base}/posts/${postId}/comments`, payload).then((r) => r.data?.data ?? r.data ?? r)
  },

  /**
   * Get current user's posts (auth required).
   * @param {Object} params - { per_page?, cursor? }
   * @returns {Promise<{ data: Array, meta: { next_cursor, has_more } }>}
   */
  getMyPosts(params = {}) {
    const { per_page = 10, cursor } = params
    const query = { per_page }
    if (cursor != null) query.cursor = cursor
    return api.get(`${base}/posts/my`, { params: query }).then((r) => {
      const body = r.data ?? {}
      const data =
        Array.isArray(body.data) ? body.data
        : Array.isArray(body.posts) ? body.posts
        : Array.isArray(body.my_posts) ? body.my_posts
        : Array.isArray(body) ? body
        : []
      const meta = body.meta ?? { next_cursor: null, has_more: false }
      return { data, meta }
    })
  },
}
