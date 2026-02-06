<script setup>
import { onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  /** Image URL to display. When null/empty, lightbox is closed. Use v-model for two-way binding. */
  modelValue: { type: String, default: null },
  /** Alt text for the image */
  alt: { type: String, default: 'Image preview' },
  /** aria-label for the dialog */
  ariaLabel: { type: String, default: 'Image preview' },
})

const emit = defineEmits(['update:modelValue'])

function close() {
  emit('update:modelValue', null)
}

function onKeydown(e) {
  if (e.key === 'Escape') close()
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="lightbox-fade">
      <div
        v-if="modelValue"
        class="lightbox"
        role="dialog"
        aria-modal="true"
        :aria-label="ariaLabel"
        @click.self="close"
        @keydown.esc="close"
      >
        <button type="button" class="lightbox__close" aria-label="Close" @click="close">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter"/>
          </svg>
        </button>
        <img :src="modelValue" :alt="alt" class="lightbox__img" @click.self="close" />
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.lightbox {
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

.lightbox__close {
  --close-glow: #00e5ff;
  --close-glow-dim: rgba(0, 229, 255, 0.4);
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(160deg, rgba(10, 25, 47, 0.85), rgba(15, 35, 60, 0.75));
  backdrop-filter: blur(12px);
  border: 1px solid var(--close-glow-dim);
  border-radius: 50%;
  color: var(--close-glow);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.25s ease, border-color 0.2s ease, color 0.2s ease;
  z-index: 10;
  box-shadow:
    0 0 20px var(--close-glow-dim),
    0 0 40px rgba(0, 229, 255, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.lightbox__close:hover {
  transform: scale(1.06);
  border-color: var(--close-glow);
  color: #fff;
  box-shadow:
    0 0 28px rgba(0, 229, 255, 0.5),
    0 0 56px rgba(0, 229, 255, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.lightbox__close:active {
  transform: scale(0.97);
  box-shadow:
    0 0 12px var(--close-glow-dim),
    inset 0 0 12px rgba(0, 0, 0, 0.3);
}

.lightbox__close:focus-visible {
  outline: none;
  border-color: var(--close-glow);
  box-shadow:
    0 0 24px var(--close-glow-dim),
    0 0 0 2px rgba(0, 229, 255, 0.4);
}

.lightbox__close svg {
  width: 1.375rem;
  height: 1.375rem;
  flex-shrink: 0;
  filter: drop-shadow(0 0 6px var(--close-glow-dim));
}

.lightbox__img {
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
