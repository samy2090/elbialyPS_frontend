<script setup>
import { ref, computed, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { resolveBackendImageUrl } from '@/utils/helpers'
import { postsApi } from '@/api/posts'
import UserService from '@/api/users.js'
import PostCard from './PostCard.vue'

const props = defineProps({
  isLoggedIn: { type: Boolean, default: true },
})

const authStore = useAuthStore()
const currentUserId = computed(() => authStore.user?.id ?? null)

const posts = ref([])
const meta = ref({ next_cursor: null, has_more: false })
const loading = ref(false)
const loadingMore = ref(false)
const loadError = ref(null)
const expandedId = ref(null)
const editingId = ref(null)
const editBody = ref('')
const editTagged = ref([])
const editTagSearch = ref('')
const editTagResults = ref([])
/** Existing media from the post (user can remove); each has { id, url, order } */
const editExistingMedia = ref([])
const editImages = ref([]) // File[] for new uploads
const editImagePreviews = ref([]) // object URLs for new files (same length as editImages)
const editSubmitting = ref(false)
const deleteConfirmId = ref(null)

const PER_PAGE = 10
const MAX_IMAGES = 4

function loadMyPosts(cursor = null, append = false) {
  const authorId = currentUserId.value
  if (authorId == null) return
  if (!append) loading.value = true
  else loadingMore.value = true
  loadError.value = null
  postsApi
    .getFeed({ author_id: authorId, per_page: PER_PAGE, cursor, sort: 'newest' })
    .then(({ data, meta: m }) => {
      const list = Array.isArray(data) ? data : []
      if (append) posts.value = [...posts.value, ...list]
      else posts.value = list
      meta.value = m ?? { next_cursor: null, has_more: false }
    })
    .catch((e) => {
      loadError.value = e?.response?.data?.message || e?.message || 'Could not load your posts'
      if (!append) posts.value = []
    })
    .finally(() => {
      loading.value = false
      loadingMore.value = false
    })
}

function toggleExpand(post) {
  if (expandedId.value === post.id) {
    expandedId.value = null
    editingId.value = null
  } else {
    expandedId.value = post.id
  }
}

function startEdit(post) {
  editingId.value = post.id
  editBody.value = post.body ?? ''
  editTagged.value = [...(post.tagged_users ?? [])]
  const media = post.media ?? []
  editExistingMedia.value = [...media].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  editImages.value = []
  editTagSearch.value = ''
  editTagResults.value = []
}

function cancelEdit() {
  editingId.value = null
  editBody.value = ''
  editTagged.value = []
  editExistingMedia.value = []
  editImages.value = []
  editImagePreviews.value.forEach((url) => URL.revokeObjectURL(url))
  editImagePreviews.value = []
}

function removeEditExistingImage(index) {
  editExistingMedia.value = editExistingMedia.value.filter((_, i) => i !== index)
}

let tagDebounce = null
function onEditTagSearch(q) {
  clearTimeout(tagDebounce)
  if (!q || q.length < 2) {
    editTagResults.value = []
    return
  }
  tagDebounce = setTimeout(() => {
    UserService.searchUsers(q).then((list) => {
      editTagResults.value = list.filter((u) => !editTagged.value.some((t) => t.id === u.id))
    })
  }, 250)
}

function addEditTag(u) {
  if (editTagged.value.length >= 10) return
  if (editTagged.value.some((t) => t.id === u.id)) return
  editTagged.value = [...editTagged.value, u]
  editTagSearch.value = ''
  editTagResults.value = []
}

function removeEditTag(id) {
  editTagged.value = editTagged.value.filter((t) => t.id !== id)
}

const totalEditImageCount = computed(() => editExistingMedia.value.length + editImages.value.length)

function onEditFileChange(e) {
  const files = Array.from(e.target?.files ?? [])
  let remaining = MAX_IMAGES - totalEditImageCount.value
  const newFiles = []
  const newPreviews = []
  for (const file of files) {
    if (remaining <= 0) break
    if (file.size > 10 * 1024 * 1024) continue
    newFiles.push(file)
    newPreviews.push(URL.createObjectURL(file))
    remaining--
  }
  editImages.value = [...editImages.value, ...newFiles]
  editImagePreviews.value = [...editImagePreviews.value, ...newPreviews]
  e.target.value = ''
}

function removeEditImage(i) {
  if (editImagePreviews.value[i]) URL.revokeObjectURL(editImagePreviews.value[i])
  editImages.value = editImages.value.filter((_, idx) => idx !== i)
  editImagePreviews.value = editImagePreviews.value.filter((_, idx) => idx !== i)
}

/**
 * Fetch image from URL and return as a File (for re-upload with kept + new).
 * Uses same-origin path when possible so Vite dev proxy avoids CORS.
 */
function fetchImageAsFile(url, index) {
  const fullUrl = resolveBackendImageUrl(url) || url
  const apiBase = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '')
  let fetchUrl = fullUrl
  if (typeof window !== 'undefined' && fullUrl.startsWith(apiBase)) {
    const path = fullUrl.slice(apiBase.length)
    fetchUrl = path.startsWith('/') ? path : `/${path}`
  }
  return fetch(fetchUrl, { credentials: 'include' })
    .then((r) => { if (!r.ok) throw new Error(r.statusText); return r.blob() })
    .then((blob) => {
      const ext = (blob.type || '').split('/')[1] || 'jpg'
      return new File([blob], `image-${index}.${ext}`, { type: blob.type })
    })
}

function submitEdit(post) {
  if (!post?.can_edit) return
  editSubmitting.value = true
  const payload = {
    body: editBody.value.trim(),
    tagged_user_ids: editTagged.value.map((u) => u.id),
  }
  const newFiles = editImages.value
  const keptExisting = editExistingMedia.value
  const originalCount = (post.media ?? []).length
  const userRemovedSome = keptExisting.length < originalCount

  const buildPayloadAndUpdate = (imagesToSend) => {
    if (imagesToSend && imagesToSend.length > 0) payload.images = imagesToSend
    else if (keptExisting.length === 0 && originalCount > 0) payload.images = []
    postsApi
      .update(post.id, payload)
      .then((updated) => {
        const idx = posts.value.findIndex((p) => p.id === post.id)
        if (idx !== -1 && updated) posts.value[idx] = { ...posts.value[idx], ...updated }
        cancelEdit()
      })
      .finally(() => { editSubmitting.value = false })
  }

  if (keptExisting.length > 0 && (newFiles.length > 0 || userRemovedSome)) {
    Promise.all(keptExisting.map((m, i) => fetchImageAsFile(m.url, i)))
      .then((keptFiles) => buildPayloadAndUpdate([...keptFiles, ...newFiles]))
      .catch((e) => {
        loadError.value = e?.message || 'Failed to prepare images'
        editSubmitting.value = false
      })
  } else if (newFiles.length > 0) {
    buildPayloadAndUpdate(newFiles)
  } else if (keptExisting.length === 0 && originalCount > 0) {
    buildPayloadAndUpdate([])
  } else {
    buildPayloadAndUpdate(null)
  }
}

function confirmDelete(post) {
  deleteConfirmId.value = post.id
}

function cancelDelete() {
  deleteConfirmId.value = null
}

function doDelete(post) {
  if (!post?.can_delete) return
  postsApi.delete(post.id).then(() => {
    posts.value = posts.value.filter((p) => p.id !== post.id)
    if (expandedId.value === post.id) expandedId.value = null
    deleteConfirmId.value = null
  })
}

function onPostUpdated(updated) {
  if (!updated?.id) return
  const i = posts.value.findIndex((p) => p.id === updated.id)
  if (i === -1) return
  const prev = posts.value[i]
  const next = { ...prev, ...updated }
  if (updated.reaction_counts !== undefined) {
    next.reaction_counts = typeof updated.reaction_counts === 'object' && updated.reaction_counts !== null
      ? { ...updated.reaction_counts }
      : {}
  }
  if (updated.reactions_count !== undefined) {
    next.reactions_count = Number(updated.reactions_count) || 0
  }
  posts.value = [...posts.value.slice(0, i), next, ...posts.value.slice(i + 1)]
}

function loadMore() {
  if (!meta.value.has_more || loadingMore.value) return
  loadMyPosts(meta.value.next_cursor, true)
}

function previewText(post) {
  const b = post?.body ?? ''
  const first = b.split('\n')[0].trim()
  return first.length > 80 ? first.slice(0, 80) + '…' : first || 'No text'
}

function previewThumb(post) {
  const m = post?.media ?? []
  const sorted = [...m].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  const first = sorted[0]
  return first ? (resolveBackendImageUrl(first.url) || first.url) : null
}

function formatDate(post) {
  const t = post?.created_at
  if (!t) return ''
  return new Date(t).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

watch(
  () => [props.isLoggedIn, currentUserId.value],
  ([loggedIn, userId]) => {
    if (loggedIn && userId != null) loadMyPosts()
  },
  { immediate: true }
)
</script>

<template>
  <section class="profile-posts" aria-label="My posts">
    <div class="profile-posts__inner">
      <h2 class="profile-posts__title">My posts</h2>
      <p class="profile-posts__desc">Your posts. Expand to view, edit, or delete.</p>

      <div v-if="!isLoggedIn" class="profile-posts__guest">
        <p>Log in to see your posts.</p>
      </div>
      <div v-else-if="loading && !posts.length" class="profile-posts__loading">
        <div class="profile-posts__spinner" aria-hidden="true"></div>
        <p>Loading your posts…</p>
      </div>
      <div v-else-if="loadError && !posts.length" class="profile-posts__error">
        <p>{{ loadError }}</p>
        <button type="button" class="profile-posts__retry" @click="loadMyPosts()">Retry</button>
      </div>
      <div v-else-if="!posts.length" class="profile-posts__empty">
        <p>You haven’t posted yet.</p>
      </div>
      <template v-else>
        <ul class="profile-posts__list">
          <li v-for="post in posts" :key="post.id" class="profile-posts__item">
            <button
              type="button"
              class="profile-posts__preview"
              :class="{ expanded: expandedId === post.id }"
              @click="toggleExpand(post)"
            >
              <div v-if="previewThumb(post)" class="profile-posts__preview-thumb">
                <img :src="previewThumb(post)" :alt="''" />
              </div>
              <div class="profile-posts__preview-text">{{ previewText(post) }}</div>
              <span class="profile-posts__preview-date">{{ formatDate(post) }}</span>
              <span class="profile-posts__preview-chevron" aria-hidden="true">{{ expandedId === post.id ? '▼' : '▶' }}</span>
            </button>

            <Transition name="profile-posts-expand">
              <div v-if="expandedId === post.id" class="profile-posts__expanded">
                <div v-if="editingId === post.id" class="profile-posts__edit-form">
                  <textarea v-model="editBody" class="profile-posts__edit-body" rows="4" maxlength="700" placeholder="Post text..." />
                  <div class="profile-posts__edit-tagged">
                    <div v-for="u in editTagged" :key="u.id" class="profile-posts__edit-tag">
                      {{ u.name || u.username }}
                      <button type="button" aria-label="Remove" @click="removeEditTag(u.id)">×</button>
                    </div>
                    <input
                      v-model="editTagSearch"
                      type="text"
                      placeholder="Tag people..."
                      class="profile-posts__edit-tag-input"
                      @input="onEditTagSearch($event.target.value)"
                    />
                    <div v-if="editTagResults.length" class="profile-posts__edit-tag-dropdown">
                      <button
                        v-for="u in editTagResults"
                        :key="u.id"
                        type="button"
                        class="profile-posts__edit-tag-opt"
                        @click="addEditTag(u)"
                      >
                        {{ u.name || u.username }}
                      </button>
                    </div>
                  </div>
                  <div class="profile-posts__edit-images">
                    <p class="profile-posts__edit-images-label">Images ({{ totalEditImageCount }}/{{ MAX_IMAGES }}) – remove any or add new</p>
                    <div v-if="editExistingMedia.length || editImages.length" class="profile-posts__edit-existing">
                      <div
                        v-for="(m, i) in editExistingMedia"
                        :key="'ex-' + (m.id || i)"
                        class="profile-posts__edit-existing-item"
                      >
                        <img
                          :src="resolveBackendImageUrl(m.url) || m.url"
                          :alt="''"
                          class="profile-posts__edit-existing-img"
                        />
                        <button
                          type="button"
                          class="profile-posts__edit-existing-remove"
                          aria-label="Remove image"
                          @click="removeEditExistingImage(i)"
                        >
                          ×
                        </button>
                      </div>
                      <div
                        v-for="(url, i) in editImagePreviews"
                        :key="'new-' + i"
                        class="profile-posts__edit-existing-item"
                      >
                        <img :src="url" :alt="''" class="profile-posts__edit-existing-img" />
                        <button
                          type="button"
                          class="profile-posts__edit-existing-remove"
                          aria-label="Remove image"
                          @click="removeEditImage(i)"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                    <label v-if="totalEditImageCount < MAX_IMAGES" class="profile-posts__edit-add-img">
                      Add images
                      <input type="file" accept="image/jpeg,image/png,image/gif,image/webp" multiple @change="onEditFileChange" />
                    </label>
                  </div>
                  <div class="profile-posts__edit-actions">
                    <button type="button" class="profile-posts__edit-cancel" @click="cancelEdit">Cancel</button>
                    <button type="button" class="profile-posts__edit-submit" :disabled="editSubmitting" @click="submitEdit(post)">
                      {{ editSubmitting ? 'Saving…' : 'Save' }}
                    </button>
                  </div>
                </div>
                <template v-else>
                  <PostCard
                    :post="post"
                    :is-logged-in="isLoggedIn"
                    :show-edit-delete="true"
                    @updated="onPostUpdated($event)"
                  />
                  <div v-if="post.can_edit || post.can_delete" class="profile-posts__card-actions">
                    <button v-if="post.can_edit" type="button" class="profile-posts__action-btn profile-posts__action-btn--edit" @click="startEdit(post)">
                      Edit
                    </button>
                    <template v-if="post.can_delete">
                      <button
                        v-if="deleteConfirmId !== post.id"
                        type="button"
                        class="profile-posts__action-btn profile-posts__action-btn--delete"
                        @click="confirmDelete(post)"
                      >
                        Delete
                      </button>
                      <span v-else class="profile-posts__delete-confirm">
                        <button type="button" class="profile-posts__action-btn profile-posts__action-btn--confirm" @click="doDelete(post)">Confirm</button>
                        <button type="button" class="profile-posts__action-btn" @click="cancelDelete">Cancel</button>
                      </span>
                    </template>
                  </div>
                </template>
              </div>
            </Transition>
          </li>
        </ul>
        <div v-if="meta.has_more" class="profile-posts__load-more">
          <button type="button" class="profile-posts__load-more-btn" :disabled="loadingMore" @click="loadMore">
            {{ loadingMore ? 'Loading…' : 'Load more' }}
          </button>
        </div>
      </template>
    </div>
  </section>
</template>

<style scoped>
.profile-posts {
  position: relative;
  z-index: 1;
  padding: clamp(2.5rem, 6vw, 4rem) 1.5rem;
}

.profile-posts__inner {
  max-width: 640px;
  margin: 0 auto;
}

.profile-posts__title {
  font-size: clamp(1.5rem, 4vw, 2rem);
  font-weight: 800;
  color: #fff;
  margin-bottom: 0.25rem;
}

.profile-posts__desc {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.65);
  margin-bottom: 1.5rem;
}

.profile-posts__guest,
.profile-posts__loading,
.profile-posts__empty,
.profile-posts__error {
  padding: 2rem 1rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.65);
}

.profile-posts__error p {
  margin: 0 0 0.75rem;
}

.profile-posts__retry {
  min-height: 44px;
  padding: 0.5rem 1.25rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: #00f5ff;
  background: rgba(0, 245, 255, 0.1);
  border: 1px solid rgba(0, 245, 255, 0.3);
  border-radius: 12px;
  cursor: pointer;
}

.profile-posts__retry:hover {
  background: rgba(0, 245, 255, 0.18);
}

.profile-posts__spinner {
  width: 32px;
  height: 32px;
  margin: 0 auto 0.75rem;
  border: 3px solid rgba(0, 245, 255, 0.2);
  border-top-color: #00f5ff;
  border-radius: 50%;
  animation: profilePostsSpin 0.8s linear infinite;
}

@keyframes profilePostsSpin {
  to { transform: rotate(360deg); }
}

.profile-posts__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.profile-posts__item {
  position: relative;
  border-radius: 18px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.profile-posts__preview {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  min-height: 56px;
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.9);
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background 0.2s ease, border-color 0.2s ease;
  font-family: inherit;
}

.profile-posts__preview:hover {
  background: rgba(255, 255, 255, 0.04);
}

.profile-posts__preview-thumb {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
  background: rgba(0, 0, 0, 0.2);
}

.profile-posts__preview-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-posts__preview-text {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.profile-posts__preview-date {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
  flex-shrink: 0;
}

.profile-posts__preview-chevron {
  font-size: 0.75rem;
  color: rgba(0, 245, 255, 0.8);
  flex-shrink: 0;
}

.profile-posts__expanded {
  padding: 0 1rem 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.profile-posts-expand-enter-active,
.profile-posts-expand-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.profile-posts-expand-enter-from,
.profile-posts-expand-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.profile-posts__edit-form {
  padding: 1rem 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.profile-posts__edit-body {
  width: 100%;
  min-height: 100px;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  color: #fff;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  resize: vertical;
  font-family: inherit;
}

.profile-posts__edit-tagged {
  position: relative;
}

.profile-posts__edit-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.5rem;
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
  background: rgba(0, 245, 255, 0.12);
  border-radius: 999px;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.9);
}

.profile-posts__edit-tag button {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  padding: 0 0.2rem;
}

.profile-posts__edit-tag-input {
  display: block;
  width: 100%;
  min-height: 40px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  color: #fff;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}

.profile-posts__edit-tag-dropdown {
  margin-top: 4px;
  padding: 4px;
  background: rgba(15, 20, 35, 0.98);
  border: 1px solid rgba(0, 245, 255, 0.2);
  border-radius: 10px;
  max-height: 120px;
  overflow-y: auto;
}

.profile-posts__edit-tag-opt {
  display: block;
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: 0.9rem;
  color: #fff;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
}

.profile-posts__edit-tag-opt:hover {
  background: rgba(255, 255, 255, 0.06);
}

.profile-posts__edit-images {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.profile-posts__edit-images-label {
  margin: 0;
  font-size: 0.85rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
}

.profile-posts__edit-existing {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.profile-posts__edit-existing-item {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 12px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.2);
}

.profile-posts__edit-existing-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.profile-posts__edit-existing-remove {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  padding: 0;
  font-size: 1.1rem;
  line-height: 1;
  color: #fff;
  background: rgba(0, 0, 0, 0.65);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-posts__edit-existing-remove:hover {
  background: rgba(220, 38, 38, 0.9);
}

.profile-posts__edit-add-img {
  padding: 0.4rem 0.75rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  cursor: pointer;
}

.profile-posts__edit-add-img input {
  display: none;
}

.profile-posts__edit-previews {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.profile-posts__edit-preview {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.06);
  border-radius: 8px;
}

.profile-posts__edit-preview-name {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.profile-posts__edit-preview-remove {
  padding: 0 0.2rem;
  font-size: 1rem;
  line-height: 1;
  color: rgba(255, 255, 255, 0.7);
  background: none;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.profile-posts__edit-preview-remove:hover {
  color: #fca5a5;
  background: rgba(239, 68, 68, 0.2);
}

.profile-posts__edit-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.profile-posts__edit-cancel,
.profile-posts__edit-submit {
  min-height: 44px;
  padding: 0.5rem 1.25rem;
  font-size: 0.9rem;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.9);
}

.profile-posts__edit-submit {
  background: linear-gradient(135deg, rgba(0, 245, 255, 0.25), rgba(168, 85, 247, 0.2));
  border-color: rgba(0, 245, 255, 0.35);
  color: #fff;
}

.profile-posts__card-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.profile-posts__action-btn {
  min-height: 44px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.9);
}

.profile-posts__action-btn--edit:hover {
  border-color: rgba(0, 245, 255, 0.35);
  color: #00f5ff;
}

.profile-posts__action-btn--delete:hover {
  border-color: rgba(239, 68, 68, 0.5);
  color: #fca5a5;
}

.profile-posts__action-btn--confirm {
  border-color: rgba(239, 68, 68, 0.5);
  color: #fca5a5;
}

.profile-posts__delete-confirm {
  display: inline-flex;
  gap: 0.5rem;
}

.profile-posts__load-more {
  margin-top: 1rem;
  text-align: center;
}

.profile-posts__load-more-btn {
  min-height: 44px;
  padding: 0.5rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: #00f5ff;
  background: rgba(0, 245, 255, 0.1);
  border: 1px solid rgba(0, 245, 255, 0.3);
  border-radius: 14px;
  cursor: pointer;
}

.profile-posts__load-more-btn:hover:not(:disabled) {
  background: rgba(0, 245, 255, 0.18);
}

.profile-posts__load-more-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
