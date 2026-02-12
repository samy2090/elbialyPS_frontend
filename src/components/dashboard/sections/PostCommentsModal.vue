<template>
  <div v-if="visible" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-box comments-modal">
      <div class="modal-header">
        <h3 class="modal-title">Comments for post #{{ postId }}{{ postBody ? `: ${postExcerpt}` : '' }}</h3>
        <button type="button" class="modal-close" aria-label="Close" @click="$emit('close')">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
      <div class="modal-body">
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Loading comments…</p>
        </div>
        <div v-else-if="error" class="error-state">
          <p>{{ error }}</p>
          <button type="button" class="action-btn secondary" @click="loadComments">Retry</button>
        </div>
        <div v-else-if="!comments.length" class="empty-state">
          <p>No comments yet.</p>
        </div>
        <template v-else>
          <ul class="comments-list">
            <li v-for="group in nestedComments" :key="group.id" class="comment-item comment-thread">
              <div class="comment-row">
                <div class="comment-main">
                  <div class="comment-author">
                    <img
                      v-if="group.user?.avatar_url"
                      :src="group.user.avatar_url"
                      :alt="group.user.name"
                      class="comment-avatar"
                    />
                    <span v-else class="comment-avatar placeholder">{{ authorInitials(group.user) }}</span>
                    <div class="comment-meta">
                      <span class="comment-name">{{ group.user?.name || 'Unknown' }}</span>
                      <span class="comment-username">@{{ group.user?.username || '—' }}</span>
                      <time class="comment-date">{{ formatDate(group.created_at) }}</time>
                    </div>
                  </div>
                  <p class="comment-body">{{ group.body }}</p>
                </div>
                <button
                  type="button"
                  class="comment-delete-btn"
                  :disabled="deletingCommentId === group.id"
                  @click="deleteComment(group)"
                >
                  Delete
                </button>
              </div>

              <ul v-if="group.replies?.length" class="replies-list">
                <li v-for="r in group.replies" :key="r.id" class="reply-item">
                  <div class="comment-row">
                    <div class="comment-main">
                      <div class="comment-author">
                        <img
                          v-if="r.user?.avatar_url"
                          :src="r.user.avatar_url"
                          :alt="r.user.name"
                          class="comment-avatar"
                        />
                        <span v-else class="comment-avatar placeholder">{{ authorInitials(r.user) }}</span>
                        <div class="comment-meta">
                          <span class="comment-name">{{ r.user?.name || 'Unknown' }}</span>
                          <span class="comment-username">@{{ r.user?.username || '—' }}</span>
                          <time class="comment-date">{{ formatDate(r.created_at) }}</time>
                        </div>
                      </div>
                      <p class="comment-body comment-body--reply">{{ r.body }}</p>
                    </div>
                    <button
                      type="button"
                      class="comment-delete-btn comment-delete-btn--reply"
                      :disabled="deletingCommentId === r.id"
                      @click="deleteComment(r)"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              </ul>
            </li>
          </ul>
          <div v-if="hasMore" class="load-more-wrap">
            <button
              type="button"
              class="action-btn secondary"
              :disabled="loadingMore"
              @click="loadMore"
            >
              <span v-if="loadingMore" class="btn-spinner"></span>
              <span v-else>Load more</span>
            </button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { commentsAdminApi } from '@/api/commentsAdmin'
import { normalizeCommentsResponse, buildNestedComments } from '@/utils/comments'

const PER_PAGE = 10

const props = defineProps({
  visible: { type: Boolean, default: false },
  postId: { type: [Number, String], default: null },
  postBody: { type: String, default: '' },
})

defineEmits(['close'])

const loading = ref(false)
const loadingMore = ref(false)
const error = ref(null)
const comments = ref([])
const nextCursor = ref(null)
const hasMore = ref(false)
const deletingCommentId = ref(null)

const nestedComments = computed(() => buildNestedComments(comments.value || []))

const postExcerpt = computed(() => {
  const b = props.postBody || ''
  return b.length > 50 ? b.slice(0, 50) + '…' : b
})

function authorInitials(user) {
  if (!user?.name) return '?'
  const parts = user.name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase().slice(0, 2)
  return user.name.slice(0, 2).toUpperCase()
}

function formatDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { dateStyle: 'medium' }) + ' ' + d.toLocaleTimeString(undefined, { timeStyle: 'short' })
}

async function loadComments() {
  if (!props.postId) return
  loading.value = true
  error.value = null
  comments.value = []
  nextCursor.value = null
  hasMore.value = false
  try {
    const res = await commentsAdminApi.getCommentsForPost(props.postId, { per_page: PER_PAGE })
    comments.value = normalizeCommentsResponse(res)
    nextCursor.value = res?.meta?.next_cursor ?? null
    hasMore.value = !!res?.meta?.has_more
  } catch (err) {
    error.value = err.response?.data?.message ?? err.message ?? 'Failed to load comments'
  } finally {
    loading.value = false
  }
}

async function loadMore() {
  if (!props.postId || !nextCursor.value || loadingMore.value) return
  loadingMore.value = true
  try {
    const res = await commentsAdminApi.getCommentsForPost(props.postId, {
      per_page: PER_PAGE,
      cursor: nextCursor.value,
    })
    const newComments = normalizeCommentsResponse(res)
    comments.value = [...comments.value, ...newComments]
    nextCursor.value = res?.meta?.next_cursor ?? null
    hasMore.value = !!res?.meta?.has_more
  } catch (err) {
    error.value = err.response?.data?.message ?? err.message ?? 'Failed to load more'
  } finally {
    loadingMore.value = false
  }
}

async function deleteComment(comment) {
  if (!comment?.id) return
  // Simple inline confirmation to avoid extra modal nesting
  if (!window.confirm('Delete this comment? This action cannot be undone.')) return

  deletingCommentId.value = comment.id
  try {
    await commentsAdminApi.deleteComment(comment.id)
    // If top-level (no parent), also remove its direct replies for a clean thread
    const parentId = getParentId(comment)
    if (!parentId) {
      comments.value = comments.value.filter(
        (c) => c.id !== comment.id && getParentId(c) !== comment.id,
      )
    } else {
      comments.value = comments.value.filter((c) => c.id !== comment.id)
    }
  } catch (err) {
    error.value = err.response?.data?.message ?? err.message ?? 'Failed to delete comment'
  } finally {
    deletingCommentId.value = null
  }
}

watch(
  () => [props.visible, props.postId],
  ([visible, postId]) => {
    if (visible && postId) loadComments()
  },
  { immediate: true }
)
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 1400;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-box.comments-modal {
  background: rgba(18, 18, 28, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  max-width: 520px;
  width: 100%;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
  margin: 0;
}

.modal-close {
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.1);
}

.modal-close svg {
  width: 1.25rem;
  height: 1.25rem;
}

.modal-body {
  padding: 1.25rem 1.5rem;
  overflow-y: auto;
}

.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 1.5rem;
  color: rgba(255, 255, 255, 0.7);
}

.loading-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid rgba(139, 92, 246, 0.3);
  border-top-color: #8b5cf6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 0.75rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.9);
}

.action-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.12);
}

.btn-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.comments-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.comment-item {
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.comment-item:last-child {
  border-bottom: none;
}

.replies-list {
  list-style: none;
  margin: 0.5rem 0 0 2.25rem;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.comment-author {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.comment-avatar {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  object-fit: cover;
  background: rgba(139, 92, 246, 0.2);
}

.comment-avatar.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
}

.comment-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.5rem;
}

.comment-name {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
}

.comment-username {
  font-size: 0.8125rem;
  color: rgba(255, 255, 255, 0.55);
}

.comment-date {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
}

.comment-body {
  font-size: 0.9375rem;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.5;
  margin: 0 0 0.25rem 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.comment-body--reply {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.82);
}

.comment-row {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.comment-main {
  flex: 1 1 auto;
  min-width: 0;
}

.comment-delete-btn {
  flex-shrink: 0;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  border: 1px solid rgba(248, 113, 113, 0.5);
  background: rgba(248, 113, 113, 0.12);
  color: #fecaca;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
}

.comment-delete-btn:hover:not(:disabled) {
  background: rgba(248, 113, 113, 0.2);
}

.comment-delete-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.comment-delete-btn--reply {
  align-self: center;
}

.load-more-wrap {
  margin-top: 1rem;
  text-align: center;
}
</style>
