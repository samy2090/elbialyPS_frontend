<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

const emit = defineEmits(['close'])

const router = useRouter()

function close() {
  emit('close')
}

function goLogin() {
  close()
  router.push({ name: 'login' })
}

function goRegister() {
  close()
  router.push({ name: 'register' })
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
    <Transition name="auth-modal-fade">
      <div
        class="auth-required-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        aria-describedby="auth-modal-desc"
        @click.self="close"
      >
        <div class="auth-required-modal__backdrop" aria-hidden="true" @click="close" />
        <div class="auth-required-modal__box">
          <h2 id="auth-modal-title" class="auth-required-modal__title">Log in required</h2>
          <p id="auth-modal-desc" class="auth-required-modal__text">
            Please log in first to do this.
          </p>
          <div class="auth-required-modal__actions">
            <button type="button" class="auth-required-modal__btn auth-required-modal__btn--secondary" @click="close">
              Close
            </button>
            <button type="button" class="auth-required-modal__btn auth-required-modal__btn--primary" @click="goLogin">
              Login
            </button>
            <button type="button" class="auth-required-modal__btn auth-required-modal__btn--primary" @click="goRegister">
              Register
            </button>
          </div>
          <button
            type="button"
            class="auth-required-modal__close"
            aria-label="Close"
            @click="close"
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter"/>
            </svg>
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.auth-required-modal {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.auth-required-modal__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(6px);
}

.auth-required-modal__box {
  position: relative;
  width: 100%;
  max-width: 400px;
  padding: 1.75rem 1.5rem;
  background: rgba(15, 20, 35, 0.95);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(0, 245, 255, 0.2);
  border-radius: 20px;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.06),
    0 24px 48px -12px rgba(0, 0, 0, 0.5),
    0 0 40px -10px rgba(0, 245, 255, 0.15);
}

.auth-required-modal__title {
  margin: 0 0 0.5rem;
  font-size: 1.35rem;
  font-weight: 700;
  color: #fff;
}

.auth-required-modal__text {
  margin: 0 0 1.5rem;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.75);
  line-height: 1.45;
}

.auth-required-modal__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: flex-end;
}

.auth-required-modal__btn {
  min-height: 44px;
  padding: 0.6rem 1.25rem;
  font-size: 0.95rem;
  font-weight: 600;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.auth-required-modal__btn--secondary {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.auth-required-modal__btn--secondary:hover {
  background: rgba(255, 255, 255, 0.12);
}

.auth-required-modal__btn--primary {
  background: linear-gradient(135deg, rgba(0, 245, 255, 0.25), rgba(168, 85, 247, 0.2));
  color: #fff;
  border: 1px solid rgba(0, 245, 255, 0.4);
  box-shadow: 0 0 20px -4px rgba(0, 245, 255, 0.3);
}

.auth-required-modal__btn--primary:hover {
  background: linear-gradient(135deg, rgba(0, 245, 255, 0.35), rgba(168, 85, 247, 0.3));
  box-shadow: 0 0 28px -4px rgba(0, 245, 255, 0.4);
}

.auth-required-modal__close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  border-radius: 10px;
  transition: color 0.2s ease, background 0.2s ease;
}

.auth-required-modal__close:hover {
  color: #00f5ff;
  background: rgba(0, 245, 255, 0.1);
}

.auth-required-modal__close svg {
  width: 1.25rem;
  height: 1.25rem;
}

.auth-modal-fade-enter-active,
.auth-modal-fade-leave-active {
  transition: opacity 0.25s ease;
}

.auth-modal-fade-enter-from,
.auth-modal-fade-leave-to {
  opacity: 0;
}
</style>
