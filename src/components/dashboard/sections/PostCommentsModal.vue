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
            <li v-for="c in comments" :key="c.id" class="comment-item">
              <div class="comment-author">
                <img
                  v-if="c.user?.avatar_url"
                  :src="c.user.avatar_url"
                  :alt="c.user.name"
                  class="comment-avatar"
                />
                <span v-else class="comment-avatar placeholder">{{ authorInitials(c.user) }}</span>
                <div class="comment-meta">
                  <span class="comment-name">{{ c.user?.name || 'Unknown' }}</span>
                  <span class="comment-username">@{{ c.user?.username || '—' }}</span>
                  <time class="comment-date">{{ formatDate(c.created_at) }}</time>
                </div>
              </div>
              <p class="comment-body">{{ c.body }}</p>
              <div v-if="c.replies_count" class="comment-replies-badge">{{ c.replies_count }} {{ c.replies_count === 1 ? 'reply' : 'replies' }}</div>
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
    comments.value = res.data ?? []
    nextCursor.value = res.meta?.next_cursor ?? null
    hasMore.value = !!res.meta?.has_more
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
    const newComments = res.data ?? []
    comments.value = [...comments.value, ...newComments]
    nextCursor.value = res.meta?.next_cursor ?? null
    hasMore.value = !!res.meta?.has_more
  } catch (err) {
    error.value = err.response?.data?.message ?? err.message ?? 'Failed to load more'
  } finally {
    loadingMore.value = false
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
  z-index: 1000;
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
}

.comment-item {
  padding: 1rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.comment-item:last-child {
  border-bottom: none;
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

.comment-replies-badge {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
}

.load-more-wrap {
  margin-top: 1rem;
  text-align: center;
}
</style>
