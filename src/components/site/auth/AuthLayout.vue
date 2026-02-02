<template>
  <div class="auth-layout">
    <div class="auth-layout__bg">
      <div class="auth-layout__orb auth-layout__orb--1" aria-hidden="true"></div>
      <div class="auth-layout__orb auth-layout__orb--2" aria-hidden="true"></div>
      <div class="auth-layout__orb auth-layout__orb--3" aria-hidden="true"></div>
      <div class="auth-layout__grid" aria-hidden="true"></div>
    </div>
    <div class="auth-layout__container">
      <div class="auth-layout__card">
        <div class="auth-layout__card-glow" aria-hidden="true"></div>
        <div class="auth-layout__card-line" aria-hidden="true"></div>
        <div class="auth-layout__card-inner">
          <slot name="header"></slot>
          <div class="auth-layout__body">
            <slot></slot>
          </div>
          <div v-if="$slots.nav" class="auth-layout__nav">
            <slot name="nav"></slot>
          </div>
          <div v-if="$slots.quickLinks" class="auth-layout__quick">
            <slot name="quickLinks"></slot>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineOptions({ name: 'AuthLayout' })
</script>

<style scoped>
.auth-layout {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(1rem, 4vw, 2rem);
  position: relative;
  overflow: hidden;
  background: #050508;
}

.auth-layout__bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
}

.auth-layout__orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(70px);
  opacity: 0.3;
  animation: authOrb 14s ease-in-out infinite;
}

.auth-layout__orb--1 {
  width: 400px;
  height: 400px;
  background: rgba(139, 92, 246, 0.35);
  top: -15%;
  left: -10%;
  animation-delay: 0s;
}

.auth-layout__orb--2 {
  width: 320px;
  height: 320px;
  background: rgba(6, 182, 212, 0.25);
  top: 50%;
  right: -15%;
  animation-delay: -5s;
}

.auth-layout__orb--3 {
  width: 240px;
  height: 240px;
  background: rgba(168, 85, 247, 0.2);
  bottom: -10%;
  left: 20%;
  animation-delay: -10s;
}

@keyframes authOrb {
  0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
  33% { transform: translate(15px, -15px) scale(1.05); opacity: 0.4; }
  66% { transform: translate(-10px, 10px) scale(0.98); opacity: 0.25; }
}

.auth-layout__grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse 80% 70% at 50% 50%, black 25%, transparent 75%);
  -webkit-mask-image: radial-gradient(ellipse 80% 70% at 50% 50%, black 25%, transparent 75%);
}

.auth-layout__container {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 460px;
}

.auth-layout__card {
  position: relative;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  overflow: hidden;
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  box-shadow:
    0 24px 48px -12px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.04),
    0 0 80px -20px rgba(139, 92, 246, 0.15);
}

.auth-layout__card-glow {
  position: absolute;
  top: -50%;
  left: 50%;
  transform: translateX(-50%);
  width: 120%;
  height: 80%;
  background: radial-gradient(ellipse at center, rgba(139, 92, 246, 0.12) 0%, transparent 70%);
  pointer-events: none;
}

.auth-layout__card-line {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.6), rgba(6, 182, 212, 0.4), transparent);
  opacity: 0.8;
}

.auth-layout__card-inner {
  position: relative;
  padding: clamp(2rem, 5vw, 3rem);
}

.auth-layout__body {
  margin-top: 1.5rem;
}

.auth-layout__nav {
  text-align: center;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.auth-layout__quick {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

@media (max-width: 480px) {
  .auth-layout__card-inner {
    padding: 1.5rem;
  }
}

/* Futuristic form styles (apply to slotted content) */
:deep(.auth-header),
:deep(.brand-header) {
  text-align: center;
  margin-bottom: 0;
}

:deep(.brand-logo) {
  width: 4rem;
  height: 4rem;
  background: linear-gradient(135deg, #8b5cf6, #06b6d4);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.25rem;
  color: white;
  box-shadow: 0 12px 32px -8px rgba(139, 92, 246, 0.4);
  animation: authLogoFloat 5s ease-in-out infinite;
}

:deep(.brand-logo svg) {
  width: 2rem;
  height: 2rem;
}

:deep(.logo-circle) {
  width: 4rem;
  height: 4rem;
  border-radius: 16px;
  background: linear-gradient(135deg, #8b5cf6, #06b6d4);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.25rem;
  color: white;
  box-shadow: 0 12px 32px -8px rgba(139, 92, 246, 0.4);
  animation: authLogoFloat 5s ease-in-out infinite;
}

:deep(.logo-icon) {
  font-size: 1.75rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

@keyframes authLogoFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

:deep(.auth-title) {
  font-size: clamp(1.5rem, 4vw, 2rem);
  font-weight: 800;
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: 0.35rem;
  letter-spacing: -0.03em;
}

:deep(.auth-subtitle),
:deep(.brand-subtitle) {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.95rem;
  line-height: 1.5;
}

:deep(.error-alert),
:deep(.alert-error) {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.25);
  border-radius: 12px;
  color: #f87171;
  margin-bottom: 1.25rem;
  font-size: 0.875rem;
  font-weight: 500;
}

:deep(.error-alert .alert-icon),
:deep(.alert-error .alert-icon),
:deep(.alert-success .alert-icon) {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.alert-success) {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background: rgba(34, 197, 94, 0.08);
  border: 1px solid rgba(34, 197, 94, 0.25);
  border-radius: 12px;
  color: #4ade80;
  margin-bottom: 1.25rem;
  font-size: 0.875rem;
}

:deep(.alert-content) {
  flex: 1;
  min-width: 0;
}

:deep(.alert-title) {
  font-weight: 600;
  color: inherit;
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
}

:deep(.auth-form),
:deep(.reset-form) {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

:deep(.form-field),
:deep(.form-group) {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

:deep(.form-row) {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

:deep(.field-label),
:deep(.form-label) {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
}

:deep(.label-icon) {
  width: 1.15rem;
  height: 1.15rem;
  color: #a78bfa;
  flex-shrink: 0;
}

:deep(.form-input) {
  width: 100%;
  padding: 0.9rem 1.2rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.95);
  font-size: 0.9rem;
  transition: border-color 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
  box-sizing: border-box;
}

:deep(.form-input::placeholder) {
  color: rgba(255, 255, 255, 0.4);
}

:deep(.form-input:hover:not(:focus)) {
  border-color: rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.05);
}

:deep(.form-input:focus) {
  outline: none;
  border-color: rgba(139, 92, 246, 0.5);
  background: rgba(255, 255, 255, 0.06);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15);
}

:deep(.form-options) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
}

:deep(.remember-me),
:deep(.agreement-checkbox) {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

:deep(.form-checkbox) {
  width: 1rem;
  height: 1rem;
  accent-color: #8b5cf6;
  cursor: pointer;
}

:deep(.checkbox-label) {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.65);
  cursor: pointer;
}

:deep(.forgot-link),
:deep(.agreement-link) {
  font-size: 0.875rem;
  color: #a78bfa;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

:deep(.forgot-link:hover),
:deep(.agreement-link:hover) {
  color: #c4b5fd;
}

:deep(.auth-btn) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
  border: 1px solid rgba(139, 92, 246, 0.4);
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  box-shadow: 0 8px 24px -8px rgba(139, 92, 246, 0.4);
  margin-top: 0.25rem;
}

:deep(.auth-btn:hover:not(:disabled)) {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px -8px rgba(139, 92, 246, 0.5);
}

:deep(.auth-btn:disabled) {
  opacity: 0.65;
  cursor: not-allowed;
  transform: none;
}

:deep(.btn-icon) {
  width: 1.2rem;
  height: 1.2rem;
}

:deep(.loading-spinner) {
  width: 1.2rem;
  height: 1.2rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: authSpin 0.8s linear infinite;
}

@keyframes authSpin {
  to { transform: rotate(360deg); }
}

:deep(.nav-text) {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

:deep(.nav-link) {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #a78bfa;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  transition: color 0.2s ease, transform 0.2s ease;
}

:deep(.nav-link:hover) {
  color: #c4b5fd;
  transform: translateX(2px);
}

:deep(.link-icon) {
  width: 1rem;
  height: 1rem;
}

:deep(.quick-link) {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.25s ease;
}

:deep(.quick-link:hover) {
  background: rgba(255, 255, 255, 0.07);
  border-color: rgba(139, 92, 246, 0.25);
  color: rgba(255, 255, 255, 0.95);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px -4px rgba(139, 92, 246, 0.2);
}

:deep(.quick-link .icon),
:deep(.quick-link svg) {
  width: 1rem;
  height: 1rem;
}

:deep(.form-agreement) {
  margin: 0.25rem 0;
}

:deep(.navigation-links) {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
}

:deep(.navigation-links .nav-link) {
  flex: 1;
  min-width: 120px;
  justify-content: center;
  padding: 0.6rem 1rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.75);
  font-size: 0.85rem;
}

:deep(.navigation-links .nav-link:hover) {
  background: rgba(139, 92, 246, 0.1);
  border-color: rgba(139, 92, 246, 0.2);
  color: #c4b5fd;
  transform: translateY(-1px);
}

:deep(.submit-btn) {
  width: 100%;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
  border: 1px solid rgba(139, 92, 246, 0.4);
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  box-shadow: 0 8px 24px -8px rgba(139, 92, 246, 0.4);
  position: relative;
  overflow: hidden;
}

:deep(.submit-btn:hover:not(:disabled)) {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px -8px rgba(139, 92, 246, 0.5);
}

:deep(.submit-btn:disabled) {
  opacity: 0.65;
  cursor: not-allowed;
}

:deep(.submit-btn .btn-content) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  position: relative;
  z-index: 1;
}

:deep(.submit-btn .btn-icon) {
  font-size: 1.1rem;
}

:deep(.submit-btn .loading-spinner) {
  width: 1.1rem;
  height: 1.1rem;
  border-width: 2px;
  border-color: rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: authSpin 0.8s linear infinite;
}

@media (max-width: 768px) {
  :deep(.form-row) {
    grid-template-columns: 1fr;
  }
  :deep(.form-options) {
    flex-direction: column;
    align-items: flex-start;
  }
  :deep(.quick-link) {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  :deep(.auth-title),
  :deep(.brand-title) {
    font-size: 1.5rem;
  }
  :deep(.brand-logo) {
    width: 3.25rem;
    height: 3.25rem;
  }
  :deep(.brand-logo svg) {
    width: 1.5rem;
    height: 1.5rem;
  }
}
</style>
