<template>
  <Teleport to="body">
    <Transition name="avatar-picker">
      <div
        v-if="modelValue"
        class="avatar-picker-overlay"
        @click.self="close"
      >
        <div class="avatar-picker-panel">
          <div class="panel-glow"></div>
          <div class="panel-header">
            <h3 class="panel-title">
              <span class="title-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2"/>
                  <path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </span>
              {{ title }}
            </h3>
            <button type="button" class="close-btn" @click="close" aria-label="Close">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>

          <div class="panel-body">
            <!-- Preset avatars -->
            <section v-if="displayAvatars.length" class="section preset-section">
              <h4 class="section-label">Choose avatar</h4>
              <div class="avatars-grid">
                <button
                  v-for="(item, idx) in displayAvatars"
                  :key="item.path || idx"
                  type="button"
                  class="avatar-option"
                  :class="{ selected: isSelected(item.path) }"
                  @click="selectPreset(item.path)"
                >
                  <span class="avatar-option-glow"></span>
                  <img
                    :src="resolveDisplayUrl(item.path)"
                    :alt="item.label || 'Avatar'"
                    class="avatar-option-img"
                    @error="onAvatarError($event, item)"
                  />
                  <span v-if="isSelected(item.path)" class="avatar-check">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 12l5 5L20 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </span>
                </button>
              </div>
            </section>

            <!-- Upload -->
            <section v-if="allowUpload" class="section upload-section">
              <h4 class="section-label">Upload image</h4>
              <div
                class="upload-zone"
                :class="{ 'upload-dragover': isDragging, 'upload-error': uploadError }"
                @dragover.prevent="isDragging = true"
                @dragleave.prevent="isDragging = false"
                @drop.prevent="onDrop"
              >
                <input
                  ref="fileInputRef"
                  type="file"
                  accept="image/*"
                  class="upload-input"
                  @change="onFileChange"
                />
                <div class="upload-content">
                  <div class="upload-icon">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <polyline points="17 8 12 3 7 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                  <p class="upload-text">Drag & drop or click to browse</p>
                  <p class="upload-hint">PNG, JPG, WebP · max {{ maxSizeMB }}MB</p>
                </div>
              </div>
              <p v-if="uploadError" class="upload-error-text">{{ uploadError }}</p>
            </section>
          </div>

          <div class="panel-footer">
            <button type="button" class="btn-cancel" @click="close">Cancel</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: 'Change avatar' },
  /** Current avatar path (for preselection) */
  currentAvatar: { type: String, default: '' },
  /** Preset avatars: [{ path, label? }] or string[]. Paths are passed to resolveUrl. */
  availableAvatars: {
    type: Array,
    default: () => []
  },
  /** Resolve path to full image URL (e.g. backend storage) */
  resolveUrl: { type: Function, default: (u) => u },
  allowUpload: { type: Boolean, default: true },
  maxSizeMB: { type: Number, default: 2 }
})

const emit = defineEmits(['update:modelValue', 'select', 'close'])

const fileInputRef = ref(null)
const isDragging = ref(false)
const uploadError = ref('')

const displayAvatars = computed(() => {
  const raw = props.availableAvatars || []
  if (!raw.length) return defaultPresets
  return raw.map((a) => (typeof a === 'string' ? { path: a, label: null } : { path: a.path, label: a.label }))
})

const defaultPresets = [
  { path: 'avatars/default.png', label: 'Default' },
  { path: 'avatars/avatar-1.png', label: 'Avatar 1' },
  { path: 'avatars/avatar-2.png', label: 'Avatar 2' },
  { path: 'avatars/avatar-3.png', label: 'Avatar 3' },
  { path: 'avatars/avatar-4.png', label: 'Avatar 4' },
  { path: 'avatars/avatar-5.png', label: 'Avatar 5' },
  { path: 'avatars/avatar-6.png', label: 'Avatar 6' }
]

function resolveDisplayUrl(path) {
  if (!path) return ''
  const url = props.resolveUrl(path)
  return (url && String(url)) || path
}

function isSelected(path) {
  const cur = (props.currentAvatar || '').trim()
  if (!cur) return false
  const p = (path || '').trim()
  return p === cur || cur.endsWith(p) || cur.includes(p)
}

function selectPreset(path) {
  uploadError.value = ''
  emit('select', { type: 'preset', path })
  emit('update:modelValue', false)
  emit('close')
}

function onFileChange(e) {
  const file = e.target?.files?.[0]
  if (file) handleFile(file)
  e.target.value = ''
}

function onDrop(e) {
  isDragging.value = false
  uploadError.value = ''
  const file = e.dataTransfer?.files?.[0]
  if (file && file.type.startsWith('image/')) handleFile(file)
  else uploadError.value = 'Please drop an image file (PNG, JPG, WebP).'
}

function handleFile(file) {
  const max = props.maxSizeMB * 1024 * 1024
  if (file.size > max) {
    uploadError.value = `File must be under ${props.maxSizeMB}MB.`
    return
  }
  uploadError.value = ''
  emit('select', { type: 'upload', file })
  emit('update:modelValue', false)
  emit('close')
}

function onAvatarError(ev, item) {
  ev.target.style.display = 'none'
}

function close() {
  uploadError.value = ''
  isDragging.value = false
  emit('update:modelValue', false)
  emit('close')
}

watch(() => props.modelValue, (open) => {
  if (open) uploadError.value = ''
})
</script>

<style scoped>
.avatar-picker-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(12px);
}

.avatar-picker-panel {
  position: relative;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow: hidden;
  background: linear-gradient(160deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 50%, rgba(15, 23, 42, 0.98) 100%);
  border: 1px solid rgba(139, 92, 246, 0.45);
  border-radius: 20px;
  box-shadow:
    0 30px 80px rgba(0, 0, 0, 0.6),
    0 0 60px rgba(139, 92, 246, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.12);
  display: flex;
  flex-direction: column;
}

.panel-glow {
  position: absolute;
  top: -60px;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
  height: 120px;
  background: radial-gradient(ellipse, rgba(139, 92, 246, 0.35) 0%, transparent 70%);
  pointer-events: none;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
}

.title-icon {
  display: flex;
  color: #8b5cf6;
}

.title-icon svg {
  width: 1.35rem;
  height: 1.35rem;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.25s ease;
}

.close-btn:hover {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.4);
  color: #fca5a5;
}

.close-btn svg {
  width: 1.1rem;
  height: 1.1rem;
}

.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.section {
  margin-bottom: 1.5rem;
}

.section:last-child {
  margin-bottom: 0;
}

.section-label {
  margin: 0 0 0.75rem 0;
  font-size: 0.8rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.avatars-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
}

.avatar-option {
  position: relative;
  aspect-ratio: 1;
  border-radius: 14px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.04);
  border: 2px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
}

.avatar-option:hover {
  border-color: rgba(139, 92, 246, 0.5);
  transform: scale(1.05);
  box-shadow: 0 0 24px rgba(139, 92, 246, 0.3);
}

.avatar-option.selected {
  border-color: #8b5cf6;
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.4), inset 0 0 20px rgba(139, 92, 246, 0.1);
}

.avatar-option-glow {
  position: absolute;
  inset: -2px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(6, 182, 212, 0.15));
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.avatar-option.selected .avatar-option-glow,
.avatar-option:hover .avatar-option-glow {
  opacity: 1;
}

.avatar-option-img {
  position: relative;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.avatar-check {
  position: absolute;
  bottom: 6px;
  right: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  background: #8b5cf6;
  border-radius: 50%;
  color: white;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.5);
}

.avatar-check svg {
  width: 12px;
  height: 12px;
}

.upload-zone {
  position: relative;
  padding: 1.5rem;
  border-radius: 14px;
  border: 2px dashed rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.02);
  transition: all 0.3s ease;
  cursor: pointer;
}

.upload-zone:hover,
.upload-dragover {
  border-color: rgba(139, 92, 246, 0.5);
  background: rgba(139, 92, 246, 0.08);
  box-shadow: 0 0 30px rgba(139, 92, 246, 0.15);
}

.upload-error {
  border-color: rgba(239, 68, 68, 0.5);
  background: rgba(239, 68, 68, 0.06);
}

.upload-input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.upload-content {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  pointer-events: none;
}

.upload-icon {
  color: rgba(139, 92, 246, 0.8);
}

.upload-icon svg {
  width: 2.5rem;
  height: 2.5rem;
}

.upload-text {
  margin: 0;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.85);
}

.upload-hint {
  margin: 0;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.45);
}

.upload-error-text {
  margin: 0.5rem 0 0 0;
  font-size: 0.8rem;
  color: #fca5a5;
}

.panel-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.btn-cancel {
  padding: 0.6rem 1.25rem;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
}

.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.25);
}

/* Transition */
.avatar-picker-enter-active,
.avatar-picker-leave-active {
  transition: opacity 0.25s ease;
}

.avatar-picker-enter-active .avatar-picker-panel,
.avatar-picker-leave-active .avatar-picker-panel {
  transition: transform 0.3s ease;
}

.avatar-picker-enter-from,
.avatar-picker-leave-to {
  opacity: 0;
}

.avatar-picker-enter-from .avatar-picker-panel,
.avatar-picker-leave-to .avatar-picker-panel {
  transform: scale(0.95) translateY(10px);
}

@media (max-width: 520px) {
  .avatars-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
