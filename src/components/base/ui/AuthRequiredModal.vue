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
        v-if="true"
        class="auth-required-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        aria-describedby="auth-modal-desc"
        @click.self="close"
      >
        <div class="auth-required-modal__backdrop" aria-hidden="true" @click="close" />
        <div class="auth-required-modal__box">
          <div class="auth-required-modal__glass"></div>
          <div class="auth-required-modal__content">
            <header class="auth-required-modal__header">
              <div class="auth-required-modal__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <rect
                    x="5"
                    y="10"
                    width="14"
                    height="10"
                    rx="2"
                    ry="2"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                  />
                  <path
                    d="M8 10V8a4 4 0 0 1 8 0v2"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                  />
                </svg>
              </div>
              <div class="auth-required-modal__text-group">
                <h2 id="auth-modal-title" class="auth-required-modal__title">Log in required</h2>
                <p id="auth-modal-desc" class="auth-required-modal__text">
                  Please log in first to do this.
                </p>
              </div>
            </header>
            <div class="auth-required-modal__actions">
              <button
                type="button"
                class="auth-required-modal__btn auth-required-modal__btn--primary"
                @click="goLogin"
              >
                Login
              </button>
              <button
                type="button"
                class="auth-required-modal__btn auth-required-modal__btn--primary"
                @click="goRegister"
              >
                Register
              </button>
            </div>
          </div>
          <button
            type="button"
            class="auth-required-modal__close"
            aria-label="Close"
            @click="close"
          >
            <span class="auth-required-modal__close-x" aria-hidden="true">×</span>
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
  max-width: 420px;
  padding: 1.5rem 1.25rem 1.25rem;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.06),
    0 8px 32px -8px rgba(0, 0, 0, 0.6);
  overflow: hidden;
  backdrop-filter: blur(18px);
}

.auth-required-modal__glass {
  position: absolute;
  inset: 0;
  background: linear-gradient(165deg, rgba(255, 255, 255, 0.03) 0%, transparent 55%);
  pointer-events: none;
}

.auth-required-modal__content {
  position: relative;
}

.auth-required-modal__header {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  margin-bottom: 1.25rem;
}

.auth-required-modal__icon {
  flex-shrink: 0;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at 30% 0, rgba(0, 245, 255, 0.16), transparent 55%),
    rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: rgba(0, 245, 255, 0.9);
  box-shadow: 0 10px 26px -18px rgba(0, 0, 0, 0.9);
}

.auth-required-modal__icon svg {
  width: 1.25rem;
  height: 1.25rem;
}

.auth-required-modal__text-group {
  display: flex;
  flex-direction: column;
}

.auth-required-modal__title {
  margin: 0 0 0.25rem;
  font-size: 1.35rem;
  font-weight: 700;
  color: #fff;
}

.auth-required-modal__text {
  margin: 0;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.75);
  line-height: 1.45;
}

.auth-required-modal__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
  margin-top: 0.75rem;
}

.auth-required-modal__btn {
  min-height: 44px;
  padding: 0.65rem 1.35rem;
  font-size: 0.94rem;
  font-weight: 600;
  border-radius: 999px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.auth-required-modal__btn--secondary {
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.78);
  border-color: rgba(255, 255, 255, 0.14);
}

.auth-required-modal__btn--secondary:hover {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.92);
}

.auth-required-modal__btn--primary {
  background: linear-gradient(135deg, rgba(0, 245, 255, 0.3), rgba(168, 85, 247, 0.25));
  color: #fff;
  border-color: rgba(0, 245, 255, 0.45);
  box-shadow: 0 12px 30px -18px rgba(0, 0, 0, 0.9);
}

.auth-required-modal__btn--primary:hover {
  background: linear-gradient(135deg, rgba(0, 245, 255, 0.36), rgba(168, 85, 247, 0.3));
  box-shadow: 0 14px 34px -18px rgba(0, 0, 0, 0.95);
}

.auth-required-modal__close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.78);
  cursor: pointer;
  border-radius: 999px;
  transition: color 0.2s ease, background 0.2s ease, border-color 0.2s ease, transform 0.15s ease;
}

.auth-required-modal__close:hover {
  color: #fff;
  background: rgba(0, 245, 255, 0.16);
  border-color: rgba(0, 245, 255, 0.5);
  transform: scale(1.02);
}

.auth-required-modal__close-x {
  display: inline-block;
  font-size: 1.25rem;
  line-height: 1;
  transform: translateY(-1px);
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
