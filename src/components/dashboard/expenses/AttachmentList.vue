<template>
  <div class="attachment-list">
    <div class="attachment-list__header">
      <h4 class="attachment-list__title">Attachments</h4>
      <label v-if="!readOnly" class="attachment-list__upload-btn">
        <input
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt,.csv"
          class="attachment-list__file-input"
          @change="onFileSelect"
        />
        <span class="upload-btn-text">Upload file</span>
      </label>
    </div>
    <p v-if="uploadError" class="attachment-list__error">{{ uploadError }}</p>
    <ul v-if="attachments.length" class="attachment-list__list">
      <li v-for="att in attachments" :key="att.id" class="attachment-list__item">
        <template v-if="getAttachmentUrl(att)">
          <a
            v-if="readOnly && isImageAttachment(att)"
            href="#"
            class="attachment-list__link"
            @click.prevent="openLightbox(getAttachmentUrl(att))"
          >
            {{ att.original_name || att.name }}
          </a>
          <a
            v-else
            :href="getAttachmentUrl(att)"
            target="_blank"
            rel="noopener noreferrer"
            class="attachment-list__link"
          >
            {{ att.original_name || att.name }}
          </a>
        </template>
        <span v-else class="attachment-list__name">{{ att.original_name || att.name }}</span>
        <span class="attachment-list__meta">{{ att.file_size_human || formatSize(att.file_size) }}</span>
        <button
          v-if="getAttachmentUrl(att)"
          type="button"
          class="attachment-list__download"
          :class="{ 'attachment-list__download--done': downloadedIds.has(att.id) }"
          :title="downloadedIds.has(att.id) ? 'Download again' : 'Download'"
          :aria-label="downloadedIds.has(att.id) ? 'Download again' : 'Download'"
          :disabled="downloadingId === att.id"
          @click="downloadAttachment(att)"
        >
          <span v-if="downloadingId === att.id" class="download-spinner"></span>
          <svg v-else-if="downloadedIds.has(att.id)" class="download-check-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <button
          v-if="!readOnly"
          type="button"
          class="attachment-list__delete"
          :disabled="deletingId === att.id"
          :aria-label="'Delete ' + (att.original_name || att.name)"
          @click="$emit('delete', att)"
        >
          <span v-if="deletingId === att.id" class="delete-spinner"></span>
          <svg v-else viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M10 11v6M14 11v6M9 6h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </li>
    </ul>
    <p v-else class="attachment-list__empty">No attachments yet.</p>

    <!-- Lightbox for images (view modal) -->
    <Teleport to="body">
      <Transition name="lightbox-fade">
        <div
          v-if="lightboxImageUrl"
          class="attachment-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
          @click.self="closeLightbox"
          @keydown.esc="closeLightbox"
        >
          <button type="button" class="attachment-lightbox__close" aria-label="Close" @click="closeLightbox">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <img :src="lightboxImageUrl" alt="Preview" class="attachment-lightbox__img" @click.self="closeLightbox" />
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { resolveAttachmentUrl } from '@/utils/expenseHelpers'

const props = defineProps({
  attachments: { type: Array, default: () => [] },
  uploadError: { type: String, default: '' },
  deletingId: { type: Number, default: null },
  /** When true, hide upload button and delete button; files are clickable to open only */
  readOnly: { type: Boolean, default: false },
})

const emit = defineEmits(['upload', 'delete'])

const lightboxImageUrl = ref(null)
const downloadingId = ref(null)
const downloadedIds = ref(new Set())

function getAttachmentUrl(att) {
  return resolveAttachmentUrl(att)
}

function getFetchUrl(url) {
  if (!url || typeof url !== 'string') return url
  try {
    const base = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '')
    if (url.startsWith(base)) {
      const path = url.slice(base.length)
      return path.startsWith('/') ? path : '/' + path
    }
  } catch (_) {}
  return url
}

async function downloadAttachment(att) {
  const url = getAttachmentUrl(att)
  const filename = att.original_name || att.name || 'download'
  if (!url) return
  downloadingId.value = att.id
  try {
    const fetchUrl = getFetchUrl(url)
    const res = await fetch(fetchUrl, { credentials: 'include', mode: 'cors' })
    if (!res.ok) throw new Error('Download failed')
    const blob = await res.blob()
    const blobUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = blobUrl
    a.download = filename
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(blobUrl)
    downloadedIds.value = new Set([...downloadedIds.value, att.id])
  } catch {
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  } finally {
    downloadingId.value = null
  }
}

function getExtension(name) {
  const parts = (name || '').split('.')
  return parts.length > 1 ? parts.pop().toLowerCase() : ''
}

function isImageAttachment(att) {
  const name = att.original_name || att.name || ''
  const ext = getExtension(name)
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'ico'].includes(ext)) return true
  const mime = (att.mime_type || att.mimeType || att.type || att.file_type || '').toLowerCase()
  return mime.startsWith('image/')
}

function openLightbox(url) {
  lightboxImageUrl.value = url
}

function closeLightbox() {
  lightboxImageUrl.value = null
}

function onKeydown(e) {
  if (e.key === 'Escape') closeLightbox()
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
})

function formatSize(bytes) {
  if (bytes == null || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

function onFileSelect(e) {
  const file = e.target.files?.[0]
  e.target.value = ''
  if (file) emit('upload', file)
}
</script>

<style scoped>
.attachment-list {
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
}

.attachment-list__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.attachment-list__title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
}

.attachment-list__file-input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
}

.attachment-list__upload-btn {
  padding: 0.5rem 1rem;
  background: rgba(139, 92, 246, 0.2);
  border: 1px solid rgba(139, 92, 246, 0.4);
  border-radius: 10px;
  color: #c4b5fd;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.attachment-list__upload-btn:hover {
  background: rgba(139, 92, 246, 0.3);
  border-color: rgba(139, 92, 246, 0.6);
}

.attachment-list__error {
  font-size: 0.75rem;
  color: #f87171;
  margin: 0 0 0.75rem;
}

.attachment-list__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.attachment-list__item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.75rem;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.attachment-list__link,
.attachment-list__name {
  flex: 1;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.9);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.attachment-list__link {
  color: #a78bfa;
  text-decoration: none;
}

.attachment-list__link:hover {
  text-decoration: underline;
}

.attachment-list__meta {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
}

.attachment-list__download {
  padding: 0.35rem;
  background: rgba(34, 197, 94, 0.15);
  border: 1px solid rgba(34, 197, 94, 0.35);
  border-radius: 8px;
  color: #4ade80;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.attachment-list__download:hover:not(:disabled) {
  background: rgba(34, 197, 94, 0.25);
  border-color: rgba(34, 197, 94, 0.5);
}

.attachment-list__download:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.attachment-list__download svg,
.attachment-list__download .download-check-icon {
  width: 1.125rem;
  height: 1.125rem;
}

.attachment-list__download--done {
  color: #4ade80;
  border-color: rgba(34, 197, 94, 0.4);
}

.download-spinner {
  width: 1.125rem;
  height: 1.125rem;
  border: 2px solid rgba(74, 222, 128, 0.3);
  border-top-color: #4ade80;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.attachment-list__delete {
  padding: 0.35rem;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  color: #f87171;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.attachment-list__delete:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.25);
}

.attachment-list__delete:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.attachment-list__delete svg {
  width: 1rem;
  height: 1rem;
}

.delete-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(248, 113, 113, 0.3);
  border-top-color: #f87171;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.attachment-list__empty {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
}

/* Lightbox */
.attachment-lightbox {
  position: fixed;
  inset: 0;
  z-index: 10001;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  cursor: zoom-out;
}

.attachment-lightbox__close {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 1;
}

.attachment-lightbox__close:hover {
  background: rgba(255, 255, 255, 0.2);
}

.attachment-lightbox__close svg {
  width: 1.25rem;
  height: 1.25rem;
}

.attachment-lightbox__img {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.5);
  cursor: default;
}

.lightbox-fade-enter-active,
.lightbox-fade-leave-active {
  transition: opacity 0.25s ease;
}

.lightbox-fade-enter-from,
.lightbox-fade-leave-to {
  opacity: 0;
}
</style>
