<script setup>
import { ref, computed, watch, nextTick, onBeforeUnmount } from 'vue'
import { resolveBackendImageUrl } from '@/utils/helpers'
import Lightbox from '@/components/base/ui/Lightbox.vue'
import { postsApi } from '@/api/posts'

const PICKER_OFFSET_ABOVE = 8
const PICKER_HEIGHT_ESTIMATE = 52

const props = defineProps({
  post: { type: Object, required: true },
  isLoggedIn: { type: Boolean, default: false },
  showEditDelete: { type: Boolean, default: false },
})

const emit = defineEmits(['requireAuth', 'edit', 'delete', 'updated'])

const REACTION_TYPES = [
  { type: 'like', label: 'Like', emoji: '👍' },
  { type: 'love', label: 'Love', emoji: '❤️' },
  { type: 'haha', label: 'Haha', emoji: '😂' },
  { type: 'wow', label: 'Wow', emoji: '😮' },
  { type: 'sad', label: 'Sad', emoji: '😢' },
  { type: 'angry', label: 'Angry', emoji: '😡' },
]

const lightboxUrl = ref(null)
const showReactionPicker = ref(false)
const commentsOpen = ref(false)
const commentsLoaded = ref(false)
const comments = ref([])
const commentsMeta = ref({ next_cursor: null, has_more: false })
const commentsLoading = ref(false)
const commentBody = ref('')
const commentSubmitting = ref(false)
const replyingToCommentId = ref(null)
const replyBody = ref('')
const replySubmitting = ref(false)
const reactLoading = ref(false)
const reactBtnRef = ref(null)
const pickerRef = ref(null)
const pickerFixedStyle = ref({})
let scrollResizeCleanup = null
let clickOutsideCleanup = null

function updatePickerFixedPosition() {
  const btn = reactBtnRef.value
  if (!btn) return
  const rect = btn.getBoundingClientRect()
  const top = rect.top - PICKER_HEIGHT_ESTIMATE - PICKER_OFFSET_ABOVE
  pickerFixedStyle.value = {
    position: 'fixed',
    left: '50%',
    transform: 'translateX(-50%)',
    top: `${Math.max(12, top)}px`,
    zIndex: 10000,
  }
}

function setupScrollResizeListeners() {
  const update = () => updatePickerFixedPosition()
  window.addEventListener('scroll', update, true)
  window.addEventListener('resize', update)
  scrollResizeCleanup = () => {
    window.removeEventListener('scroll', update, true)
    window.removeEventListener('resize', update)
    scrollResizeCleanup = null
  }
}

function clearPickerFixedStyle() {
  pickerFixedStyle.value = {}
  if (scrollResizeCleanup) {
    scrollResizeCleanup()
  }
}

function removeClickOutsideListener() {
  if (clickOutsideCleanup) {
    clickOutsideCleanup()
    clickOutsideCleanup = null
  }
}

watch(showReactionPicker, (open) => {
  if (open) {
    nextTick(() => {
      updatePickerFixedPosition()
      setupScrollResizeListeners()
      // Close picker when clicking outside (button or picker). Use setTimeout so the opening click doesn't close it.
      setTimeout(() => {
        const onDocumentClick = (e) => {
          if (!showReactionPicker.value) return
          const btn = reactBtnRef.value
          const picker = pickerRef.value
          if (btn?.contains(e.target) || picker?.contains(e.target)) return
          showReactionPicker.value = false
          removeClickOutsideListener()
        }
        document.addEventListener('click', onDocumentClick, true)
        clickOutsideCleanup = () => {
          document.removeEventListener('click', onDocumentClick, true)
        }
      }, 0)
    })
  } else {
    removeClickOutsideListener()
    clearPickerFixedStyle()
  }
})

onBeforeUnmount(() => {
  removeClickOutsideListener()
  clearPickerFixedStyle()
})

const sortedMedia = computed(() => {
  const m = props.post?.media ?? []
  return [...m].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
})

const authorAvatarUrl = computed(() => {
  const u = props.post?.user
  if (!u?.avatar_url) return null
  return resolveBackendImageUrl(u.avatar_url) || null
})

const authorName = computed(() => props.post?.user?.name || props.post?.user?.username || '—')

const timeAgo = computed(() => {
  const t = props.post?.created_at
  if (!t) return ''
  const d = new Date(t)
  const now = new Date()
  const s = Math.floor((now - d) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  if (s < 2592000) return `${Math.floor(s / 86400)}d ago`
  return d.toLocaleDateString()
})

const totalReactions = computed(() => props.post?.reactions_count ?? 0)

const activeReactionTypes = computed(() => {
  const counts = props.post?.reaction_counts ?? {}
  return REACTION_TYPES.filter((r) => (counts[r.type] ?? 0) > 0)
})

const commentsCount = computed(() => props.post?.comments_count ?? 0)

/** Top-level comments with replies nested (2 levels only). */
const nestedComments = computed(() => {
  const list = comments.value
  const top = list
    .filter((c) => !c.parent_id)
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
  const byParent = new Map()
  list.forEach((c) => {
    if (c.parent_id) {
      if (!byParent.has(c.parent_id)) byParent.set(c.parent_id, [])
      byParent.get(c.parent_id).push(c)
    }
  })
  return top.map((c) => ({
    ...c,
    replies: (byParent.get(c.id) ?? []).sort(
      (a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0)
    ),
  }))
})

function openLightbox(url) {
  const full = resolveBackendImageUrl(url) || url
  if (full) lightboxUrl.value = full
}

function onReactClick() {
  if (!props.isLoggedIn) {
    emit('requireAuth')
    return
  }
  showReactionPicker.value = !showReactionPicker.value
}

// Track the latest reaction request to handle race conditions
let latestReactionRequestId = 0

function onChooseReaction(type) {
  if (!props.isLoggedIn) return
  showReactionPicker.value = false
  const current = props.post?.current_user_reaction
  if (current === type) return
  if (type === null && !current) return
  const id = props.post?.id
  const counts = { ...(props.post?.reaction_counts ?? {}) }
  const total = Math.max(0, (props.post?.reactions_count ?? 0))
  if (current) {
    counts[current] = Math.max(0, (counts[current] ?? 0) - 1)
  }
  if (type) {
    counts[type] = (counts[type] ?? 0) + 1
  }
  const nextTotal = type ? total + (current ? 0 : 1) : Math.max(0, total - 1)
  const reaction_countsEmit = {}
  REACTION_TYPES.forEach((r) => {
    const n = counts[r.type] ?? 0
    if (n > 0) reaction_countsEmit[r.type] = n
  })
  const optimistic = {
    ...props.post,
    current_user_reaction: type || null,
    reactions_count: nextTotal,
    reaction_counts: reaction_countsEmit,
  }
  const previousPost = { ...props.post }
  emit('updated', optimistic)
  reactLoading.value = true
  
  // Increment request ID to track which request is latest
  const requestId = ++latestReactionRequestId
  const expectedReaction = type || null
  
  const promise = type ? postsApi.react(id, type) : postsApi.removeReact(id)
  promise
    .then(() => postsApi.getPost(id))
    .then((fresh) => {
      if (!fresh) return
      // Only emit if this is still the latest request
      // This prevents older requests from overwriting newer state
      if (requestId !== latestReactionRequestId) return
      // Verify the fresh data matches what we expect
      // If user removed reaction, fresh should show null
      // If user added reaction, fresh should match the type
      if (expectedReaction === null && fresh.current_user_reaction != null) return
      if (expectedReaction !== null && fresh.current_user_reaction !== expectedReaction) return
      emit('updated', fresh)
    })
    .catch(() => {
      // Only rollback if this is still the latest request
      if (requestId === latestReactionRequestId) {
        emit('updated', previousPost)
      }
    })
    .finally(() => {
      // Only clear loading if this is the latest request
      if (requestId === latestReactionRequestId) {
        reactLoading.value = false
      }
    })
}

function loadComments() {
  if (commentsLoaded.value && !commentsMeta.value.has_more) return
  commentsLoading.value = true
  const cursor = commentsLoaded.value ? commentsMeta.value.next_cursor : null
  postsApi
    .getComments(props.post.id, { per_page: 10, cursor })
    .then(({ data, meta }) => {
      if (!commentsLoaded.value) {
        comments.value = data
        commentsLoaded.value = true
      } else {
        comments.value = [...comments.value, ...data]
      }
      commentsMeta.value = meta
    })
    .finally(() => { commentsLoading.value = false })
}

function onShowComments() {
  if (commentsOpen.value) {
    commentsOpen.value = false
    return
  }
  commentsOpen.value = true
  if (!commentsLoaded.value) loadComments()
}

function onSubmitComment() {
  if (!props.isLoggedIn) {
    emit('requireAuth')
    return
  }
  const body = (commentBody.value || '').trim()
  if (!body) return
  commentSubmitting.value = true
  postsApi
    .addComment(props.post.id, { body })
    .then((newComment) => {
      comments.value = [newComment, ...comments.value]
      commentBody.value = ''
      const c = (props.post.comments_count ?? 0) + 1
      emit('updated', { ...props.post, comments_count: c })
    })
    .finally(() => { commentSubmitting.value = false })
}

function onReplyClick(commentId) {
  if (!props.isLoggedIn) {
    emit('requireAuth')
    return
  }
  replyingToCommentId.value = replyingToCommentId.value === commentId ? null : commentId
  if (replyingToCommentId.value) replyBody.value = ''
}

function cancelReply() {
  replyingToCommentId.value = null
  replyBody.value = ''
}

function onSubmitReply(parentId) {
  const body = (replyBody.value || '').trim()
  if (!body) return
  replySubmitting.value = true
  postsApi
    .addComment(props.post.id, { body, parent_id: parentId })
    .then((newComment) => {
      comments.value = [newComment, ...comments.value]
      replyBody.value = ''
      replyingToCommentId.value = null
      const c = (props.post.comments_count ?? 0) + 1
      emit('updated', { ...props.post, comments_count: c })
    })
    .finally(() => { replySubmitting.value = false })
}

function onCommentInputFocus() {
  if (!props.isLoggedIn) emit('requireAuth')
}

watch(() => props.post?.id, () => {
  commentsOpen.value = false
  commentsLoaded.value = false
  comments.value = []
  commentsMeta.value = { next_cursor: null, has_more: false }
})
</script>

<template>
  <article class="post-card">
    <div class="post-card__glass"></div>
    <header class="post-card__header">
      <div class="post-card__author">
        <div class="post-card__avatar-wrap">
          <img
            v-if="authorAvatarUrl"
            :src="authorAvatarUrl"
            :alt="authorName"
            class="post-card__avatar"
          />
          <span v-else class="post-card__avatar-initials">{{ authorName.slice(0, 2).toUpperCase() }}</span>
        </div>
        <div class="post-card__author-info">
          <span class="post-card__author-name">{{ authorName }}</span>
          <span class="post-card__time">{{ timeAgo }}</span>
        </div>
      </div>
      <div v-if="post.tagged_users?.length" class="post-card__tagged">
        <span class="post-card__tagged-label">with</span>
        <div class="post-card__tagged-avatars">
          <div
            v-for="u in post.tagged_users.slice(0, 5)"
            :key="u.id"
            class="post-card__tagged-avatar"
            :title="u.name || u.username"
          >
            <img
              v-if="resolveBackendImageUrl(u.avatar_url)"
              :src="resolveBackendImageUrl(u.avatar_url)"
              :alt="u.name"
            />
            <span v-else>{{ (u.name || u.username || '?').slice(0, 1).toUpperCase() }}</span>
          </div>
        </div>
        <span class="post-card__tagged-names">{{ post.tagged_users.map(u => u.name || u.username).join(', ') }}</span>
      </div>
    </header>

    <div v-if="post.body" class="post-card__body">{{ post.body }}</div>
    <div v-if="post.edited_at" class="post-card__edited">Edited</div>

    <div v-if="sortedMedia.length" class="post-card__media">
      <button
        v-for="(m, i) in sortedMedia"
        :key="m.id || i"
        type="button"
        class="post-card__media-item"
        @click="openLightbox(m.url)"
      >
        <img
          :src="resolveBackendImageUrl(m.url) || m.url"
          :alt="`Image ${i + 1}`"
          class="post-card__media-img"
        />
      </button>
    </div>

    <div class="post-card__actions">
      <div class="post-card__actions-left">
        <button
          ref="reactBtnRef"
          type="button"
          class="post-card__action-stat"
          :class="{ 'post-card__action-stat--reacted': post.current_user_reaction }"
          aria-label="Reactions"
          aria-haspopup="true"
          :aria-expanded="showReactionPicker"
          :disabled="reactLoading"
          @click="isLoggedIn ? onReactClick() : $emit('requireAuth')"
        >
          <!-- Unreacted: Facebook-style outline thumbs-up. Reacted: chosen emoji, saturated -->
          <span
            v-if="!post.current_user_reaction"
            class="post-card__action-icon post-card__action-icon--like post-card__action-icon--outline"
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 11H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3"/>
            </svg>
          </span>
          <span
            v-else
            class="post-card__action-icon post-card__action-icon--like post-card__action-icon--saturated"
            aria-hidden="true"
          >
            {{ REACTION_TYPES.find(r => r.type === post.current_user_reaction)?.emoji }}
          </span>
          <span class="post-card__action-num" :class="{ 'post-card__action-num--reacted': post.current_user_reaction }">{{ totalReactions }}</span>
        </button>
        <button
          type="button"
          class="post-card__action-stat"
          :class="{ 'post-card__action-stat--comments-open': commentsOpen }"
          @click="onShowComments"
          aria-label="Comments"
          :aria-expanded="commentsOpen"
        >
          <span class="post-card__action-icon post-card__action-icon--comment" aria-hidden="true">💬</span>
          <span class="post-card__action-num">{{ commentsCount }}</span>
        </button>
      </div>
      <div class="post-card__actions-right">
        <div v-if="activeReactionTypes.length" class="post-card__reaction-pills">
          <span
            v-for="r in activeReactionTypes"
            :key="r.type"
            class="post-card__reaction-pill"
            :title="r.label"
          >
            {{ r.emoji }}
          </span>
        </div>
        <Teleport v-if="isLoggedIn" to="body">
            <Transition name="picker-fade">
              <div
                v-if="showReactionPicker"
                ref="pickerRef"
                class="post-card__reaction-picker post-card__reaction-picker--fixed"
                role="menu"
                :style="pickerFixedStyle"
              >
                <button
                  v-for="r in REACTION_TYPES"
                  :key="r.type"
                  type="button"
                  role="menuitem"
                  class="post-card__reaction-emoji"
                  :title="r.label"
                  @click="onChooseReaction(r.type)"
                >
                  {{ r.emoji }}
                </button>
                <button
                  v-if="post.current_user_reaction"
                  type="button"
                  role="menuitem"
                  class="post-card__reaction-emoji post-card__reaction-emoji--remove"
                  title="Remove reaction"
                  @click.stop="onChooseReaction(null)"
                >
                  ✕
                </button>
              </div>
            </Transition>
          </Teleport>
      </div>
    </div>

    <div v-if="commentsOpen" class="post-card__comments-outer">
      <div v-if="commentsLoading && !commentsLoaded" class="post-card__comments-loading">Loading comments…</div>
      <div v-else-if="commentsLoaded" class="post-card__comments">
      <template v-for="group in nestedComments" :key="group.id">
        <div class="post-card__comment-thread">
          <div class="post-card__comment post-card__comment--top">
            <div class="post-card__comment-avatar">
              <img
                v-if="resolveBackendImageUrl(group.user?.avatar_url)"
                :src="resolveBackendImageUrl(group.user.avatar_url)"
                :alt="group.user?.name"
              />
              <span v-else>{{ (group.user?.name || group.user?.username || '?').slice(0, 1).toUpperCase() }}</span>
            </div>
            <div class="post-card__comment-body">
              <span class="post-card__comment-author">{{ group.user?.name || group.user?.username || '—' }}</span>
              <span class="post-card__comment-text">{{ group.body }}</span>
              <button
                type="button"
                class="post-card__comment-reply-btn"
                @click="onReplyClick(group.id)"
              >
                Reply
              </button>
            </div>
          </div>
          <div v-if="group.replies?.length" class="post-card__comment-replies">
            <div
              v-for="r in group.replies"
              :key="r.id"
              class="post-card__comment post-card__comment--reply"
            >
              <div class="post-card__comment-avatar">
                <img
                  v-if="resolveBackendImageUrl(r.user?.avatar_url)"
                  :src="resolveBackendImageUrl(r.user.avatar_url)"
                  :alt="r.user?.name"
                />
                <span v-else>{{ (r.user?.name || r.user?.username || '?').slice(0, 1).toUpperCase() }}</span>
              </div>
              <div class="post-card__comment-body">
                <span class="post-card__comment-author">{{ r.user?.name || r.user?.username || '—' }}</span>
                <span class="post-card__comment-text">{{ r.body }}</span>
              </div>
            </div>
          </div>
          <div v-if="replyingToCommentId === group.id" class="post-card__reply-form">
            <p class="post-card__reply-context">Replying to {{ group.user?.name || group.user?.username || '—' }}</p>
            <input
              v-model="replyBody"
              type="text"
              class="post-card__comment-input post-card__reply-input"
              placeholder="Write a reply..."
              maxlength="500"
              @keydown.enter.prevent="onSubmitReply(group.id)"
            />
            <div class="post-card__reply-actions">
              <button
                type="button"
                class="post-card__comment-submit post-card__reply-submit"
                :disabled="!replyBody.trim() || replySubmitting"
                @click="onSubmitReply(group.id)"
              >
                {{ replySubmitting ? 'Posting…' : 'Reply' }}
              </button>
              <button type="button" class="post-card__reply-cancel" @click="cancelReply">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </template>
      <button
        v-if="commentsMeta.has_more"
        type="button"
        class="post-card__load-more-comments"
        :disabled="commentsLoading"
        @click="loadComments"
      >
        {{ commentsLoading ? 'Loading…' : 'Load more comments' }}
      </button>
      <div class="post-card__comment-input-wrap">
        <input
          v-model="commentBody"
          type="text"
          class="post-card__comment-input"
          placeholder="Write a comment..."
          maxlength="500"
          @focus="onCommentInputFocus"
          @keydown.enter.prevent="onSubmitComment"
        />
        <button
          type="button"
          class="post-card__comment-submit"
          :disabled="!commentBody.trim() || commentSubmitting"
          @click="onSubmitComment"
        >
          Post
        </button>
      </div>
      </div>
    </div>

    <Lightbox v-model="lightboxUrl" alt="Post image" aria-label="Post image" />
  </article>
</template>

<style scoped>
.post-card {
  position: relative;
  border-radius: 20px;
  overflow: visible;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.06),
    0 8px 32px -8px rgba(0, 0, 0, 0.4);
  padding: 1.25rem 1rem;
}

.post-card__glass {
  position: absolute;
  inset: 0;
  background: linear-gradient(165deg, rgba(255, 255, 255, 0.03) 0%, transparent 50%);
  pointer-events: none;
}

.post-card__header {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.post-card__author {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.post-card__avatar-wrap {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
}

.post-card__avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.post-card__avatar-initials {
  font-size: 1rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.8);
}

.post-card__author-info {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.post-card__author-name {
  font-weight: 700;
  font-size: 1rem;
  color: #fff;
}

.post-card__time {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.55);
}

.post-card__tagged {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.post-card__tagged-label {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
}

.post-card__tagged-avatars {
  display: flex;
  gap: -4px;
}

.post-card__tagged-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.1);
}

.post-card__tagged-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.post-card__tagged-names {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
}

.post-card__body {
  position: relative;
  font-size: 1rem;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 0.5rem;
  white-space: pre-wrap;
  word-break: break-word;
}

.post-card__edited {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.45);
  margin-bottom: 0.5rem;
}

.post-card__media {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.post-card__media-item {
  padding: 0;
  border: none;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  min-height: 120px;
  display: block;
}

.post-card__media-img {
  width: 100%;
  height: 100%;
  min-height: 140px;
  object-fit: cover;
  display: block;
}

/* Facebook-style actions bar: counts left, reaction pills + React button right */
.post-card__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem 1rem;
  padding: 0.5rem 0 0;
  margin-top: 0.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  overflow: visible;
}

.post-card__actions-left {
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 0;
}

.post-card__action-stat {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.35rem 0;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
  background: none;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: color 0.15s ease, background 0.15s ease;
}

.post-card__action-stat:hover {
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.05);
}

/* Reaction button: clearer outline icon and count when unreacted */
.post-card__action-stat:first-child {
  color: rgba(255, 255, 255, 0.88);
}

.post-card__action-stat:first-child:hover {
  color: rgba(255, 255, 255, 1);
}

.post-card__action-icon {
  font-size: 1rem;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  opacity: 0.8;
}

/* Unreacted: Facebook-style outline thumbs-up – clear, not faded */
.post-card__action-icon--outline {
  opacity: 1;
  color: inherit;
}

.post-card__action-icon--outline svg {
  width: 1.1em;
  height: 1.1em;
  stroke: currentColor;
}

.post-card__action-icon--like {
  font-size: 1.05rem;
  transition: filter 0.2s ease, opacity 0.2s ease;
}

.post-card__action-icon--like:not(.post-card__action-icon--saturated) {
  filter: grayscale(0.5);
  opacity: 0.85;
}
/* Reacted: show chosen emoji fully saturated (no fade) */
.post-card__action-icon--like.post-card__action-icon--saturated,
.post-card__action-stat--reacted .post-card__action-icon--like {
  filter: none;
  opacity: 1;
}

.post-card__action-icon--comment {
  font-size: 1rem;
}

.post-card__action-num {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: inherit;
}

.post-card__action-num--reacted {
  color: rgba(255, 255, 255, 0.98);
}

.post-card__actions-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

/* Facebook-like overlapping reaction avatars */
.post-card__reaction-pills {
  display: flex;
  align-items: center;
  margin-right: 0.25rem;
}

.post-card__reaction-pill {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin-left: -6px;
  border-radius: 50%;
  font-size: 0.8rem;
  background: rgba(255, 255, 255, 0.12);
  border: 2px solid rgba(15, 20, 35, 0.95);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  line-height: 1;
}

.post-card__reaction-pill:first-child {
  margin-left: 0;
}

.post-card__reaction-picker {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 4px;
  display: flex;
  flex-wrap: nowrap;
  gap: 4px;
  padding: 6px;
  min-width: min-content;
  max-width: min(calc(100vw - 2rem), 100%);
  box-sizing: border-box;
  background: rgba(15, 20, 35, 0.98);
  border: 1px solid rgba(0, 245, 255, 0.2);
  border-radius: 14px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  z-index: 10;
}

.post-card__reaction-picker--fixed {
  position: fixed;
  bottom: auto;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 0;
  max-width: calc(100vw - 2rem);
}

.post-card__reaction-emoji {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  background: transparent;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease;
}

.post-card__reaction-emoji:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: scale(1.15);
}

.post-card__reaction-emoji--remove {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
}

.picker-fade-enter-active,
.picker-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.picker-fade-enter-from,
.picker-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(4px);
}

@media (max-width: 768px) {
  .post-card__reaction-picker {
    max-width: min(calc(100vw - 2rem), 100%);
  }
}

@media (max-width: 380px) {
  .post-card__reaction-picker {
    padding: 4px;
    gap: 2px;
    max-width: min(calc(100vw - 1.5rem), 100%);
  }

  .post-card__reaction-emoji {
    width: 32px;
    height: 32px;
    font-size: 1.1rem;
  }

  .post-card__reaction-emoji--remove {
    font-size: 0.8rem;
  }
}

.post-card__comments-toggle {
  min-height: 44px;
  padding: 0.4rem 0.75rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.75);
  background: transparent;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
}

.post-card__comments-toggle:hover {
  background: rgba(255, 255, 255, 0.06);
  color: #00f5ff;
}

/* ---- Comments: mobile-first, clear hierarchy, 44px tap targets ---- */
.post-card__action-stat--comments-open {
  color: rgba(0, 245, 255, 0.95);
}

.post-card__comments-outer {
  margin-top: 0;
}

.post-card__comments-loading {
  padding: 1.25rem 0;
  text-align: center;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
}

.post-card__comments {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.post-card__comment-thread {
  margin-bottom: 1.25rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.post-card__comment-thread:last-of-type {
  border-bottom: none;
}

.post-card__comment {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0;
  align-items: flex-start;
}

.post-card__comment--top {
  margin-bottom: 0.25rem;
}

.post-card__comment-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
}

.post-card__comment-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.post-card__comment-body {
  flex: 1;
  min-width: 0;
}

.post-card__comment-author {
  font-weight: 600;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.95);
  margin-right: 0.35rem;
}

.post-card__comment-text {
  font-size: 0.95rem;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.85);
  word-break: break-word;
  display: block;
  margin-top: 0.15rem;
}

/* Reply button: tap-friendly, pill style */
.post-card__comment-reply-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  min-width: 44px;
  margin-top: 0.5rem;
  padding: 0.4rem 0.75rem;
  font-size: 0.85rem;
  font-weight: 500;
  color: rgba(0, 245, 255, 0.95);
  background: rgba(0, 245, 255, 0.08);
  border: 1px solid rgba(0, 245, 255, 0.25);
  border-radius: 999px;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
  -webkit-tap-highlight-color: transparent;
}

.post-card__comment-reply-btn:hover {
  background: rgba(0, 245, 255, 0.15);
  border-color: rgba(0, 245, 255, 0.4);
}

.post-card__comment-reply-btn:active {
  transform: scale(0.98);
}

/* Nested replies: clear visual hierarchy */
.post-card__comment-replies {
  margin-top: 0.5rem;
  margin-left: 0.5rem;
  padding-left: 1rem;
  border-left: 3px solid rgba(0, 245, 255, 0.25);
  background: rgba(255, 255, 255, 0.03);
  border-radius: 0 8px 8px 0;
  padding: 0.75rem 0.75rem 0.5rem 1rem;
}

.post-card__comment--reply {
  margin-bottom: 0.75rem;
}

.post-card__comment--reply:last-child {
  margin-bottom: 0;
}

.post-card__comment--reply .post-card__comment-avatar {
  width: 32px;
  height: 32px;
  font-size: 0.8rem;
}

.post-card__comment--reply .post-card__comment-author,
.post-card__comment--reply .post-card__comment-text {
  font-size: 0.9rem;
}

.post-card__comment--reply .post-card__comment-text {
  color: rgba(255, 255, 255, 0.8);
}

/* Reply form: context + input + actions */
.post-card__reply-form {
  margin-top: 0.75rem;
  margin-left: 0.5rem;
  padding: 0.75rem;
  padding-left: 1rem;
  border-left: 3px solid rgba(0, 245, 255, 0.2);
  background: rgba(255, 255, 255, 0.04);
  border-radius: 0 12px 12px 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.post-card__reply-context {
  margin: 0;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
}

.post-card__reply-input {
  flex: 1;
  min-width: 0;
  width: 100%;
  box-sizing: border-box;
}

.post-card__reply-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.post-card__reply-submit {
  flex-shrink: 0;
  min-height: 44px;
  padding-left: 1.25rem;
  padding-right: 1.25rem;
}

.post-card__reply-cancel {
  min-height: 44px;
  padding: 0 1rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.65);
  background: transparent;
  border: none;
  cursor: pointer;
  border-radius: 12px;
  -webkit-tap-highlight-color: transparent;
  transition: color 0.2s ease, background 0.2s ease;
}

.post-card__reply-cancel:hover {
  color: rgba(255, 255, 255, 0.95);
  background: rgba(255, 255, 255, 0.06);
}

/* Load more: tap-friendly */
.post-card__load-more-comments {
  font-size: 0.9rem;
  font-weight: 500;
  color: rgba(0, 245, 255, 0.95);
  background: rgba(0, 245, 255, 0.06);
  border: 1px solid rgba(0, 245, 255, 0.2);
  border-radius: 12px;
  cursor: pointer;
  padding: 0.6rem 1rem;
  min-height: 44px;
  margin-bottom: 0.75rem;
  width: 100%;
  transition: background 0.2s ease, border-color 0.2s ease;
  -webkit-tap-highlight-color: transparent;
}

.post-card__load-more-comments:hover:not(:disabled) {
  background: rgba(0, 245, 255, 0.12);
  border-color: rgba(0, 245, 255, 0.35);
}

.post-card__load-more-comments:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Main comment input row */
.post-card__comment-input-wrap {
  display: flex;
  gap: 0.6rem;
  margin-top: 0.75rem;
  align-items: stretch;
}

.post-card__comment-input {
  flex: 1;
  min-height: 48px;
  padding: 0.65rem 1rem;
  font-size: 1rem;
  color: #fff;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 24px;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  -webkit-tap-highlight-color: transparent;
}

.post-card__comment-input::placeholder {
  color: rgba(255, 255, 255, 0.45);
}

.post-card__comment-input:focus {
  border-color: rgba(0, 245, 255, 0.45);
  box-shadow: 0 0 0 2px rgba(0, 245, 255, 0.12);
}

.post-card__comment-submit {
  min-height: 48px;
  padding: 0.65rem 1.25rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, rgba(0, 245, 255, 0.3), rgba(168, 85, 247, 0.25));
  border: 1px solid rgba(0, 245, 255, 0.4);
  border-radius: 24px;
  cursor: pointer;
  transition: opacity 0.2s ease, transform 0.15s ease;
  flex-shrink: 0;
  -webkit-tap-highlight-color: transparent;
}

.post-card__comment-submit:hover:not(:disabled) {
  opacity: 1.05;
}

.post-card__comment-submit:active:not(:disabled) {
  transform: scale(0.98);
}

.post-card__comment-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Mobile: larger tap targets and spacing */
@media (max-width: 768px) {
  .post-card__comments {
    margin-top: 1rem;
    padding-top: 1rem;
  }

  .post-card__comment-thread {
    margin-bottom: 1.25rem;
    padding: 0.85rem 0;
  }

  .post-card__comment-avatar {
    width: 44px;
    height: 44px;
    font-size: 0.95rem;
  }

  .post-card__comment-reply-btn {
    min-height: 44px;
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }

  .post-card__comment-replies {
    margin-left: 0.25rem;
    padding-left: 0.85rem;
    padding: 0.85rem 0.75rem 0.5rem 1rem;
  }

  .post-card__comment--reply .post-card__comment-avatar {
    width: 36px;
    height: 36px;
  }

  .post-card__reply-form {
    margin-left: 0.25rem;
    padding: 0.85rem;
    padding-left: 1rem;
    gap: 0.75rem;
  }

  .post-card__reply-submit,
  .post-card__reply-cancel {
    min-height: 48px;
  }

  .post-card__comment-input-wrap {
    gap: 0.5rem;
    margin-top: 0.85rem;
  }

  .post-card__comment-input {
    min-height: 48px;
    padding: 0.75rem 1rem;
    font-size: 16px; /* avoids zoom on focus on iOS */
  }

  .post-card__comment-submit {
    min-height: 48px;
    padding: 0.75rem 1.25rem;
  }
}

@media (max-width: 380px) {
  .post-card__comment-input-wrap {
    flex-direction: column;
  }

  .post-card__comment-submit {
    width: 100%;
  }
}
</style>
