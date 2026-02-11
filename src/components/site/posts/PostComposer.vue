<script setup>
import { ref, watch } from 'vue'
import UserService from '@/api/users.js'
import { postsApi } from '@/api/posts'
import { resolveBackendImageUrl } from '@/utils/helpers'

const props = defineProps({
  isLoggedIn: { type: Boolean, default: false },
})

const emit = defineEmits(['created', 'requireAuth'])

const MAX_BODY = 700
const MAX_IMAGES = 4
const MAX_FILE_MB = 10
const ACCEPT_IMAGES = 'image/jpeg,image/png,image/gif,image/webp'

const body = ref('')
const taggedUsers = ref([])
const tagSearchQuery = ref('')
const tagSearchResults = ref([])
const tagSearchOpen = ref(false)
const tagSearchLoading = ref(false)
const imageFiles = ref([])
const imagePreviews = ref([])
const submitting = ref(false)
const fileInputRef = ref(null)

let searchDebounce = null
let blurCloseTimer = null

// Show dropdown when user types; search with short debounce (like create-session customer input)
watch(tagSearchQuery, (q) => {
  clearTimeout(searchDebounce)
  const trimmed = (q || '').trim()
  if (!trimmed) {
    tagSearchResults.value = []
    tagSearchOpen.value = false
    return
  }
  tagSearchOpen.value = true
  searchDebounce = setTimeout(() => {
    tagSearchLoading.value = true
    UserService.searchUsers(trimmed)
      .then((list) => {
        tagSearchResults.value = list.filter((u) => !taggedUsers.value.some((t) => t.id === u.id))
      })
      .finally(() => { tagSearchLoading.value = false })
  }, 200)
})

function onTagInputFocus() {
  clearTimeout(blurCloseTimer)
  if ((tagSearchQuery.value || '').trim()) tagSearchOpen.value = true
  else tagSearchOpen.value = true // show dropdown on focus so user sees it when they start typing
}

function onTagInputBlur() {
  blurCloseTimer = setTimeout(() => {
    tagSearchOpen.value = false
  }, 200)
}

function addTaggedUser(u) {
  if (taggedUsers.value.length >= 10) return
  if (taggedUsers.value.some((t) => t.id === u.id)) return
  taggedUsers.value = [...taggedUsers.value, u]
  tagSearchQuery.value = ''
  tagSearchResults.value = []
  tagSearchOpen.value = false
}

function removeTaggedUser(id) {
  taggedUsers.value = taggedUsers.value.filter((t) => t.id !== id)
}

function onFileChange(e) {
  const files = Array.from(e.target?.files ?? [])
  const valid = []
  for (const file of files) {
    if (file.size > MAX_FILE_MB * 1024 * 1024) continue
    if (!ACCEPT_IMAGES.split(',').some((t) => file.type === t.trim())) continue
    if (valid.length + imageFiles.value.length >= MAX_IMAGES) break
    valid.push(file)
  }
  imageFiles.value = [...imageFiles.value, ...valid].slice(0, MAX_IMAGES)
  imagePreviews.value = imageFiles.value.map((f) => URL.createObjectURL(f))
  e.target.value = ''
}

function removeImage(i) {
  if (imagePreviews.value[i]) URL.revokeObjectURL(imagePreviews.value[i])
  imageFiles.value = imageFiles.value.filter((_, idx) => idx !== i)
  imagePreviews.value = imagePreviews.value.filter((_, idx) => idx !== i)
}

function submit() {
  if (!props.isLoggedIn) {
    emit('requireAuth')
    return
  }
  const text = (body.value || '').trim()
  if (!text && !imageFiles.value.length) return
  if (text.length > MAX_BODY) return
  submitting.value = true
  postsApi
    .create({
      body: text,
      tagged_user_ids: taggedUsers.value.map((u) => u.id),
      images: imageFiles.value.length ? imageFiles.value : undefined,
    })
    .then((created) => {
      body.value = ''
      taggedUsers.value = []
      imageFiles.value = []
      imagePreviews.value.forEach((url) => URL.revokeObjectURL(url))
      imagePreviews.value = []
      emit('created', created)
    })
    .finally(() => { submitting.value = false })
}
</script>

<template>
  <div class="post-composer">
    <div class="post-composer__glass"></div>
    <div class="post-composer__inner">
      <textarea
        v-model="body"
        class="post-composer__input"
        placeholder="What's on your mind?"
        rows="3"
        maxlength="700"
      />
      <div class="post-composer__char">{{ body.length }} / {{ MAX_BODY }}</div>
      <div v-if="taggedUsers.length" class="post-composer__tagged">
        <div
          v-for="u in taggedUsers"
          :key="u.id"
          class="post-composer__tag-chip"
        >
          <img
            v-if="resolveBackendImageUrl(u.avatar_url)"
            :src="resolveBackendImageUrl(u.avatar_url)"
            :alt="u.name"
            class="post-composer__tag-avatar"
          />
          <span class="post-composer__tag-name">{{ u.name || u.username }}</span>
          <button type="button" class="post-composer__tag-remove" aria-label="Remove" @click="removeTaggedUser(u.id)">×</button>
        </div>
      </div>
      <div class="post-composer__tag-search-wrap">
        <input
          v-model="tagSearchQuery"
          type="text"
          class="post-composer__tag-input"
          placeholder="Type to search people..."
          autocomplete="off"
          @focus="onTagInputFocus"
          @blur="onTagInputBlur"
        />
        <div
          v-if="tagSearchOpen && (tagSearchQuery.trim().length > 0 || tagSearchResults.length > 0 || tagSearchLoading)"
          class="post-composer__tag-dropdown"
        >
          <div v-if="tagSearchLoading" class="post-composer__tag-loading">Searching…</div>
          <div
            v-else-if="tagSearchResults.length === 0 && tagSearchQuery.trim().length > 0"
            class="post-composer__tag-loading post-composer__tag-no-results"
          >
            No people found
          </div>
          <button
            v-for="u in tagSearchResults"
            :key="u.id"
            type="button"
            class="post-composer__tag-option"
            @mousedown.prevent="addTaggedUser(u)"
          >
            <img
              v-if="resolveBackendImageUrl(u.avatar_url)"
              :src="resolveBackendImageUrl(u.avatar_url)"
              :alt="u.name"
              class="post-composer__tag-option-avatar"
            />
            <span>{{ u.name || u.username }}</span>
          </button>
        </div>
      </div>
      <div v-if="imagePreviews.length" class="post-composer__previews">
        <div v-for="(url, i) in imagePreviews" :key="i" class="post-composer__preview-wrap">
          <img :src="url" :alt="`Preview ${i + 1}`" class="post-composer__preview-img" />
          <button type="button" class="post-composer__preview-remove" aria-label="Remove image" @click="removeImage(i)">×</button>
        </div>
      </div>
      <div class="post-composer__actions">
        <label class="post-composer__add-photos">
          <span>Add photos</span>
          <input
            ref="fileInputRef"
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            multiple
            class="post-composer__file-input"
            @change="onFileChange"
          />
        </label>
        <span class="post-composer__hint">{{ imageFiles.length }} / {{ MAX_IMAGES }} · max {{ MAX_FILE_MB }}MB each</span>
        <button
          type="button"
          class="post-composer__submit"
          :disabled="submitting || ((!body.trim()) && !imageFiles.length)"
          @click="submit()"
        >
          {{ submitting ? 'Posting…' : 'Post' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.post-composer {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 8px 32px -8px rgba(0, 0, 0, 0.35);
  padding: 1.25rem 1rem;
}

.post-composer__glass {
  position: absolute;
  inset: 0;
  background: linear-gradient(165deg, rgba(255, 255, 255, 0.02) 0%, transparent 50%);
  pointer-events: none;
}

.post-composer__inner {
  position: relative;
}

.post-composer__input {
  width: 100%;
  min-height: 80px;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  color: #fff;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  resize: vertical;
  outline: none;
  transition: border-color 0.2s ease;
  font-family: inherit;
}

.post-composer__input::placeholder {
  color: rgba(255, 255, 255, 0.45);
}

.post-composer__input:focus {
  border-color: rgba(0, 245, 255, 0.35);
}

.post-composer__char {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.45);
  margin-top: 0.35rem;
}

.post-composer__tagged {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.post-composer__tag-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.5rem 0.25rem 0.25rem;
  background: rgba(0, 245, 255, 0.12);
  border: 1px solid rgba(0, 245, 255, 0.25);
  border-radius: 999px;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.9);
}

.post-composer__tag-avatar {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  object-fit: cover;
}

.post-composer__tag-name {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.post-composer__tag-remove {
  width: 20px;
  height: 20px;
  padding: 0;
  font-size: 1.1rem;
  line-height: 1;
  color: rgba(255, 255, 255, 0.7);
  background: none;
  border: none;
  border-radius: 50%;
  cursor: pointer;
}

.post-composer__tag-remove:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.15);
}

.post-composer__tag-search-wrap {
  position: relative;
  margin-top: 0.5rem;
}

.post-composer__tag-input {
  width: 100%;
  min-height: 44px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  color: #fff;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  outline: none;
}

.post-composer__tag-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.post-composer__tag-dropdown {
  position: absolute;
  left: 0;
  right: 0;
  top: 100%;
  margin-top: 4px;
  max-height: 200px;
  overflow-y: auto;
  background: rgba(15, 20, 35, 0.98);
  border: 1px solid rgba(0, 245, 255, 0.2);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  z-index: 10;
}

.post-composer__tag-loading {
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
}

.post-composer__tag-no-results {
  color: rgba(255, 255, 255, 0.5);
  font-style: italic;
}

.post-composer__tag-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.6rem 1rem;
  font-size: 0.95rem;
  color: #fff;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background 0.2s ease;
}

.post-composer__tag-option:hover {
  background: rgba(255, 255, 255, 0.06);
}

.post-composer__tag-option-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}

.post-composer__previews {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.post-composer__preview-wrap {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 12px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.3);
}

.post-composer__preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.post-composer__preview-remove {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  padding: 0;
  font-size: 1.1rem;
  line-height: 1;
  color: #fff;
  background: rgba(0, 0, 0, 0.6);
  border: none;
  border-radius: 50%;
  cursor: pointer;
}

.post-composer__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.post-composer__add-photos {
  min-height: 44px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.post-composer__add-photos:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(0, 245, 255, 0.25);
}

.post-composer__file-input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  pointer-events: none;
}

.post-composer__hint {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.45);
}

.post-composer__submit {
  margin-left: auto;
  min-height: 44px;
  padding: 0.5rem 1.25rem;
  font-size: 0.95rem;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, rgba(0, 245, 255, 0.3), rgba(168, 85, 247, 0.25));
  border: 1px solid rgba(0, 245, 255, 0.4);
  border-radius: 14px;
  cursor: pointer;
  box-shadow: 0 0 20px -4px rgba(0, 245, 255, 0.3);
  transition: opacity 0.2s ease, box-shadow 0.2s ease;
}

.post-composer__submit:hover:not(:disabled) {
  box-shadow: 0 0 28px -4px rgba(0, 245, 255, 0.45);
}

.post-composer__submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
