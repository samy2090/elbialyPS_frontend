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
const commentsLoaded = ref(false)
const comments = ref([])
const commentsMeta = ref({ next_cursor: null, has_more: false })
const commentsLoading = ref(false)
const commentBody = ref('')
const commentSubmitting = ref(false)
const reactLoading = ref(false)
const reactBtnRef = ref(null)
const pickerFixedStyle = ref({})
let scrollResizeCleanup = null

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

watch(showReactionPicker, (open) => {
  if (open) {
    nextTick(() => {
      updatePickerFixedPosition()
      setupScrollResizeListeners()
    })
  } else {
    clearPickerFixedStyle()
  }
})

onBeforeUnmount(clearPickerFixedStyle)

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

const reactionCountsText = computed(() => {
  const counts = props.post?.reaction_counts ?? {}
  const parts = REACTION_TYPES.filter((r) => (counts[r.type] ?? 0) > 0).map((r) => `${r.emoji} ${counts[r.type]}`)
  return parts.length ? parts.join(' · ') : ''
})

const totalReactions = computed(() => props.post?.reactions_count ?? 0)

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
  const didRemove = type === null
  const promise = type ? postsApi.react(id, type) : postsApi.removeReact(id)
  promise
    .then(() => postsApi.getPost(id))
    .then((fresh) => {
      if (!fresh) return
      if (didRemove && fresh.current_user_reaction != null) return
      emit('updated', fresh)
    })
    .catch(() => {
      emit('updated', previousPost)
    })
    .finally(() => {
      reactLoading.value = false
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
      if (props.post) props.post.comments_count = c
      emit('updated')
    })
    .finally(() => { commentSubmitting.value = false })
}

function onCommentInputFocus() {
  if (!props.isLoggedIn) emit('requireAuth')
}

watch(() => props.post?.id, () => {
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
      <div class="post-card__reactions">
        <div v-if="totalReactions || isLoggedIn" class="post-card__reactions-row">
          <span v-if="totalReactions" class="post-card__reactions-counts">{{ reactionCountsText }}</span>
          <div class="post-card__reaction-picker-wrap">
            <button
              ref="reactBtnRef"
              type="button"
              class="post-card__reaction-btn"
              :class="{ 'post-card__reaction-btn--active': post.current_user_reaction }"
              :disabled="reactLoading"
              aria-haspopup="true"
              :aria-expanded="showReactionPicker"
              @click="onReactClick"
            >
              {{ post.current_user_reaction ? REACTION_TYPES.find(r => r.type === post.current_user_reaction)?.emoji : '👍' }} React
            </button>
            <Teleport to="body">
              <Transition name="picker-fade">
                <div
                  v-if="showReactionPicker"
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
      </div>
      <button
        type="button"
        class="post-card__comments-toggle"
        @click="onShowComments"
      >
        {{ post.comments_count ? `${post.comments_count} comment(s)` : 'Comment' }}
      </button>
    </div>

    <div v-if="commentsLoaded" class="post-card__comments">
      <div v-for="c in comments" :key="c.id" class="post-card__comment">
        <div class="post-card__comment-avatar">
          <img
            v-if="resolveBackendImageUrl(c.user?.avatar_url)"
            :src="resolveBackendImageUrl(c.user.avatar_url)"
            :alt="c.user?.name"
          />
          <span v-else>{{ (c.user?.name || c.user?.username || '?').slice(0, 1).toUpperCase() }}</span>
        </div>
        <div class="post-card__comment-body">
          <span class="post-card__comment-author">{{ c.user?.name || c.user?.username || '—' }}</span>
          <span class="post-card__comment-text">{{ c.body }}</span>
        </div>
      </div>
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

.post-card__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  overflow: visible;
}

.post-card__reactions {
  flex: 1;
  min-width: 0;
}

.post-card__reactions-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  overflow: visible;
  width: 100%;
}

.post-card__reactions-counts {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.65);
}

.post-card__reaction-picker-wrap {
  position: relative;
  overflow: visible;
  width: 100%;
}

.post-card__reaction-btn {
  min-height: 44px;
  padding: 0.4rem 0.75rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.post-card__reaction-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(0, 245, 255, 0.25);
}

.post-card__reaction-btn--active {
  border-color: rgba(0, 245, 255, 0.4);
  color: #00f5ff;
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

.post-card__comments {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.post-card__comment {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.post-card__comment-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
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
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.9);
  margin-right: 0.35rem;
}

.post-card__comment-text {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  word-break: break-word;
}

.post-card__load-more-comments {
  font-size: 0.85rem;
  color: rgba(0, 245, 255, 0.9);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.35rem 0;
  margin-bottom: 0.5rem;
}

.post-card__load-more-comments:hover:not(:disabled) {
  text-decoration: underline;
}

.post-card__comment-input-wrap {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.post-card__comment-input {
  flex: 1;
  min-height: 44px;
  padding: 0.5rem 1rem;
  font-size: 0.95rem;
  color: #fff;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.post-card__comment-input::placeholder {
  color: rgba(255, 255, 255, 0.45);
}

.post-card__comment-input:focus {
  border-color: rgba(0, 245, 255, 0.4);
  box-shadow: 0 0 0 2px rgba(0, 245, 255, 0.15);
}

.post-card__comment-submit {
  min-height: 44px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, rgba(0, 245, 255, 0.25), rgba(168, 85, 247, 0.2));
  border: 1px solid rgba(0, 245, 255, 0.35);
  border-radius: 12px;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.post-card__comment-submit:hover:not(:disabled) {
  opacity: 1.1;
}

.post-card__comment-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
