<template>
  <header class="site-nav-futuristic" :class="{ 'menu-open': isMenuOpen }">
    <div class="site-nav-glow"></div>
    <div class="site-nav-scanline" aria-hidden="true"></div>

    <div class="site-nav-inner">
      <router-link to="/" class="site-nav-brand" @click="closeMenu">
        <div class="site-nav-logo-wrap">
          <div class="site-nav-logo-bg"></div>
          <div class="site-nav-logo-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <span class="site-nav-brand-text">ElbialyPS</span>
        </div>
      </router-link>

      <nav
        class="site-nav-links"
        :class="{ 'is-visible': isMenuOpen }"
        @click.self="closeMenu"
      >
        <div class="site-nav-dropdown-backdrop" aria-hidden="true" @click="closeMenu"></div>
        <div class="site-nav-dropdown-inner" @click.stop>
          <div class="site-nav-dropdown-glow" aria-hidden="true"></div>
          <div class="site-nav-dropdown-hexgrid" aria-hidden="true"></div>
          <div class="site-nav-dropdown-scan" aria-hidden="true"></div>
          <div class="site-nav-dropdown-particles" aria-hidden="true">
            <span v-for="n in 12" :key="n" class="site-nav-particle" :style="{ '--p': n }"></span>
          </div>
          <div class="site-nav-dropdown-links">
            <router-link
              v-for="(item, i) in navItems"
              :key="item.to"
              :to="item.to"
              class="site-nav-link"
              :class="{ 'router-link-active': $route.path === item.to }"
              :style="{ '--i': i }"
              @click="closeMenu"
            >
              <span class="site-nav-link-glow"></span>
              <span class="site-nav-link-icon" :data-icon="item.icon"></span>
              <span class="site-nav-link-label">{{ item.label }}</span>
              <span class="site-nav-link-arrow">→</span>
            </router-link>
          </div>
          <div class="site-nav-dropdown-auth">
            <AuthStatus />
          </div>
        </div>
      </nav>

      <div class="site-nav-actions">
        <AuthStatus />
      </div>

      <button
        type="button"
        class="site-nav-burger"
        :class="{ 'is-active': isMenuOpen }"
        aria-label="Toggle menu"
        :aria-expanded="isMenuOpen"
        @click="toggleMenu"
      >
        <span class="site-nav-burger-line"></span>
        <span class="site-nav-burger-line"></span>
        <span class="site-nav-burger-line"></span>
      </button>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, watch, provide, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AuthStatus from '@/components/site/auth/AuthStatus.vue'

const route = useRoute()
const authStore = useAuthStore()
const isMenuOpen = ref(false)
let scrollLockPosition = 0

function lockBodyScroll() {
  scrollLockPosition = window.scrollY ?? document.documentElement.scrollTop
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
  document.body.style.position = 'fixed'
  document.body.style.top = `-${scrollLockPosition}px`
  document.body.style.left = '0'
  document.body.style.right = '0'
  document.body.style.width = '100%'
  document.body.style.overflow = 'hidden'
  if (scrollbarWidth > 0) {
    document.body.style.paddingRight = `${scrollbarWidth}px`
  }
}

function unlockBodyScroll() {
  const paddingRight = document.body.style.paddingRight
  document.body.style.position = ''
  document.body.style.top = ''
  document.body.style.left = ''
  document.body.style.right = ''
  document.body.style.width = ''
  document.body.style.overflow = ''
  document.body.style.paddingRight = ''
  window.scrollTo(0, scrollLockPosition)
}

function closeMenu() {
  isMenuOpen.value = false
  unlockBodyScroll()
}

provide('closeNavMenu', closeMenu)

const navItems = computed(() => [
  { to: '/', label: 'Home', icon: 'home' },
  { to: '/feed', label: 'Feed', icon: 'feed' },
  { to: '/about', label: 'About', icon: 'info' },
  ...(authStore.isAuthenticated
    ? [
        { to: '/profile', label: 'My Profile', icon: 'profile' },
        ...(authStore.canAccessDashboard ? [{ to: '/dashboard', label: 'Dashboard', icon: 'dashboard' }] : []),
      ]
    : []),
])

watch(() => route.path, () => {
  closeMenu()
})

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
  if (isMenuOpen.value) {
    lockBodyScroll()
  } else {
    unlockBodyScroll()
  }
}

onUnmounted(() => {
  if (isMenuOpen.value) {
    unlockBodyScroll()
  }
})
</script>

<style scoped>
.site-nav-futuristic {
  --nav-height: 72px;
  --nav-glow: rgba(139, 92, 246, 0.15);
  --nav-accent: #8b5cf6;
  --nav-cyan: #06b6d4;
  position: sticky;
  top: 0;
  z-index: 1000;
  height: var(--nav-height);
  background: rgba(6, 6, 18, 0.92);
  border-bottom: 1px solid rgba(139, 92, 246, 0.12);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

/* Backdrop blur only on desktop (expensive on mobile GPU) */
@media (min-width: 769px) {
  .site-nav-futuristic {
    background: rgba(6, 6, 18, 0.75);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }
}

@media (max-width: 768px) {
  .site-nav-futuristic.menu-open {
    overflow: visible;
  }
}

.site-nav-glow {
  position: absolute;
  top: -60%;
  left: 50%;
  transform: translateX(-50%);
  width: 120%;
  height: 120%;
  background: radial-gradient(ellipse at center, var(--nav-glow) 0%, transparent 70%);
  pointer-events: none;
  opacity: 0.8;
}

.site-nav-scanline {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--nav-cyan), var(--nav-accent), transparent);
  opacity: 0.5;
}

/* Static glow (no animated box-shadow) for performance */
.site-nav-scanline::after {
  content: '';
  position: absolute;
  inset: -2px 0;
  background: rgba(6, 182, 212, 0.2);
  border-radius: 2px;
  z-index: -1;
  pointer-events: none;
}

@media (min-width: 769px) {
  .site-nav-scanline {
    will-change: transform, opacity;
    animation: siteNavScan 3.5s linear infinite;
  }
}

@keyframes siteNavScan {
  0% { transform: translateX(-100%); opacity: 0.3; }
  10% { opacity: 0.8; }
  90% { opacity: 0.8; }
  100% { transform: translateX(100%); opacity: 0.3; }
}

.site-nav-inner {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1.5rem;
  gap: 2rem;
}

.site-nav-brand {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: inherit;
  flex-shrink: 0;
  z-index: 10;
}

.site-nav-logo-wrap {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  position: relative;
}

.site-nav-logo-bg {
  position: absolute;
  inset: -4px;
  background: linear-gradient(135deg, var(--nav-accent), var(--nav-cyan));
  border-radius: 14px;
  opacity: 0.2;
  transition: opacity 0.3s ease;
}

@media (min-width: 769px) {
  .site-nav-logo-bg {
    filter: blur(8px);
  }
}

.site-nav-brand:hover .site-nav-logo-bg {
  opacity: 0.35;
}

.site-nav-logo-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--nav-accent);
}

@media (min-width: 769px) {
  .site-nav-logo-icon {
    filter: drop-shadow(0 0 12px rgba(139, 92, 246, 0.5));
    animation: siteNavLogoFloat 5s ease-in-out infinite;
  }
}

.site-nav-logo-icon svg {
  width: 24px;
  height: 24px;
}

@keyframes siteNavLogoFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

.site-nav-brand-text {
  font-size: 1.35rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, #e0e7ff, #a5b4fc, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  transition: opacity 0.3s ease;
}

.site-nav-brand:hover .site-nav-brand-text {
  opacity: 0.92;
}

.site-nav-links {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex: 1;
  justify-content: center;
}

.site-nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.25rem;
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9rem;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(255, 255, 255, 0.02);
  /* GPU-friendly: only transform + opacity + color (no box-shadow/border/background transition) */
  transition:
    color 0.3s cubic-bezier(0.34, 1.2, 0.64, 1),
    transform 0.3s cubic-bezier(0.34, 1.2, 0.64, 1),
    opacity 0.3s ease,
    border-color 0.35s ease,
    background 0.35s ease;
}

.site-nav-link::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(6, 182, 212, 0.06) 100%);
  opacity: 0;
  transition: opacity 0.35s cubic-bezier(0.34, 1.2, 0.64, 1);
  border-radius: inherit;
}

.site-nav-link::after {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%) scaleY(0);
  width: 3px;
  height: 60%;
  background: linear-gradient(180deg, var(--nav-cyan), var(--nav-accent));
  border-radius: 0 3px 3px 0;
  transition: transform 0.35s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.site-nav-link:hover {
  color: #fff;
  border-color: rgba(139, 92, 246, 0.3);
  background: rgba(255, 255, 255, 0.04);
  transform: translateY(-1px);
}

.site-nav-link:hover::before {
  opacity: 1;
}

.site-nav-link:hover::after {
  transform: translateY(-50%) scaleY(1);
}

.site-nav-link.router-link-active {
  color: #fff;
  border-color: rgba(139, 92, 246, 0.4);
  background: rgba(139, 92, 246, 0.08);
}

.site-nav-link.router-link-active::before {
  opacity: 1;
}

.site-nav-link.router-link-active::after {
  transform: translateY(-50%) scaleY(1);
}

.site-nav-link-glow,
.site-nav-link-arrow {
  display: none;
}

.site-nav-link-line {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%) scaleX(0);
  width: 70%;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--nav-accent), var(--nav-cyan), transparent);
  border-radius: 2px;
  transition: transform 0.35s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.site-nav-link:hover .site-nav-link-line,
.site-nav-link.router-link-active .site-nav-link-line {
  transform: translateX(-50%) scaleX(1);
}

.site-nav-link-icon {
  width: 1.1rem;
  height: 1.1rem;
  font-size: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.7);
  transition: color 0.3s ease, transform 0.3s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.site-nav-link:hover .site-nav-link-icon,
.site-nav-link.router-link-active .site-nav-link-icon {
  color: rgba(255, 255, 255, 0.95);
}

.site-nav-link:hover .site-nav-link-icon {
  transform: scale(1.08);
}

.site-nav-link-icon[data-icon="home"]::before { content: '⌂'; font-size: 1rem; font-family: inherit; }
.site-nav-link-icon[data-icon="feed"]::before { content: '≋'; font-size: 1rem; font-family: inherit; }
.site-nav-link-icon[data-icon="info"]::before { content: 'ℹ'; font-size: 1rem; font-family: inherit; }
.site-nav-link-icon[data-icon="profile"]::before { content: '◇'; font-size: 1rem; font-family: inherit; }
.site-nav-link-icon[data-icon="dashboard"]::before { content: '▤'; font-size: 1rem; font-family: inherit; }

.site-nav-link-label {
  white-space: nowrap;
}

.site-nav-actions {
  flex-shrink: 0;
  z-index: 10;
}

/* Desktop: dropdown inner is just the nav row; auth in dropdown hidden */
.site-nav-dropdown-inner {
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;
  position: relative;
}

.site-nav-dropdown-glow,
.site-nav-dropdown-grid {
  display: none;
}

.site-nav-dropdown-links {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.site-nav-dropdown-auth {
  display: none;
}

.site-nav-burger {
  display: none;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 44px;
  height: 44px;
  padding: 0;
  background: rgba(139, 92, 246, 0.1);
  border: 1px solid rgba(139, 92, 246, 0.25);
  border-radius: 10px;
  cursor: pointer;
  gap: 5px;
  z-index: 1001;
  transition: all 0.3s ease;
}

.site-nav-burger:hover {
  background: rgba(139, 92, 246, 0.2);
  border-color: rgba(139, 92, 246, 0.4);
}

.site-nav-burger-line {
  width: 20px;
  height: 2px;
  background: linear-gradient(90deg, var(--nav-accent), var(--nav-cyan));
  border-radius: 2px;
  transition: transform 0.4s cubic-bezier(0.34, 1.2, 0.64, 1), opacity 0.35s ease;
}

.site-nav-burger.is-active .site-nav-burger-line:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}

.site-nav-burger.is-active .site-nav-burger-line:nth-child(2) {
  opacity: 0;
  transform: scaleX(0);
}

.site-nav-burger.is-active .site-nav-burger-line:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

/* Tablet */
@media (max-width: 1024px) {
  .site-nav-futuristic {
    --nav-height: 68px;
  }

  .site-nav-inner {
    padding: 0 1.25rem;
    gap: 1rem;
  }

  .site-nav-link {
    padding: 0.5rem 0.9rem;
    font-size: 0.85rem;
  }

  .site-nav-brand-text {
    font-size: 1.2rem;
  }
}

/* Mobile: overlay menu – futuristic dropdown */
@media (max-width: 768px) {
  .site-nav-futuristic {
    --nav-height: 64px;
  }

  .site-nav-actions {
    display: none;
  }

  .site-nav-futuristic.menu-open .site-nav-links {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
    background: rgba(0, 0, 0, 0.78);
    pointer-events: auto;
  }

  .site-nav-futuristic.menu-open .site-nav-links .site-nav-link,
  .site-nav-futuristic.menu-open .site-nav-dropdown-auth {
    opacity: 1;
    transform: translateY(0) scale(1);
  }

  .site-nav-burger {
    display: flex;
  }

  .site-nav-links {
    position: fixed;
    top: var(--nav-height);
    left: 0;
    right: 0;
    width: 100vw;
    height: calc(100vh - var(--nav-height));
    height: calc(100dvh - var(--nav-height));
    max-height: calc(100vh - var(--nav-height));
    max-height: calc(100dvh - var(--nav-height));
    flex-direction: column;
    justify-content: flex-start;
    align-items: stretch;
    gap: 0;
    background: rgba(0, 0, 0, 0.88);
    border-top: none;
    opacity: 0;
    visibility: hidden;
    transform: translateY(-12px);
    transition: opacity 0.45s cubic-bezier(0.34, 1.2, 0.64, 1), visibility 0.45s ease, transform 0.45s cubic-bezier(0.34, 1.2, 0.64, 1);
    z-index: 998;
    padding: 0;
    overflow: hidden;
    pointer-events: none;
  }

  .site-nav-dropdown-backdrop {
    display: block;
    position: absolute;
    inset: 0;
    z-index: 0;
    cursor: pointer;
  }

  .site-nav-dropdown-inner {
    z-index: 1;
    display: flex;
    flex-direction: column;
    flex: 1 1 0;
    min-height: 0;
    height: 100%;
    position: relative;
    width: 100%;
    background: linear-gradient(165deg, rgba(6, 6, 22, 0.99) 0%, rgba(2, 2, 12, 0.995) 50%, rgba(4, 4, 18, 0.99) 100%);
    border-top: 2px solid transparent;
    border-image: linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.8), rgba(139, 92, 246, 0.9), rgba(236, 72, 153, 0.5), transparent) 1;
    box-shadow:
      0 0 0 1px rgba(139, 92, 246, 0.15) inset,
      0 0 80px -20px rgba(139, 92, 246, 0.2),
      0 -40px 100px -30px rgba(6, 182, 212, 0.15);
    animation: navPanelEntrance 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }

  @keyframes navPanelEntrance {
    from {
      opacity: 0;
      transform: scale(0.96) translateY(-20px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  /* Scanline: no animation on mobile to reduce CPU */
  .site-nav-scanline {
    animation: none;
  }

  .site-nav-dropdown-glow,
  .site-nav-dropdown-hexgrid,
  .site-nav-dropdown-scan,
  .site-nav-dropdown-particles {
    display: block;
  }

  .site-nav-dropdown-glow {
    position: absolute;
    top: -40%;
    left: 50%;
    transform: translateX(-50%);
    width: 180%;
    height: 70%;
    background: radial-gradient(ellipse at center, rgba(139, 92, 246, 0.25) 0%, rgba(6, 182, 212, 0.12) 35%, transparent 65%);
    pointer-events: none;
    opacity: 0.9;
  }

  /* Hexgrid: static on mobile (background-position animation is repaint-heavy) */
  .site-nav-dropdown-hexgrid {
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='24' viewBox='0 0 28 24'%3E%3Cpath fill='none' stroke='rgba(139,92,246,0.06)' stroke-width='0.5' d='M14 0l7 4v8l-7 4-7-4V4z'/%3E%3Cpath fill='none' stroke='rgba(6,182,212,0.05)' stroke-width='0.4' d='M0 12l7-4 7 4 7-4'/%3E%3C/svg%3E");
    background-size: 28px 24px;
    mask-image: linear-gradient(180deg, black 0%, transparent 88%);
    -webkit-mask-image: linear-gradient(180deg, black 0%, transparent 88%);
    pointer-events: none;
  }

  .site-nav-dropdown-scan {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.9), rgba(139, 92, 246, 0.9), transparent);
    pointer-events: none;
  }

  .site-nav-dropdown-particles {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
  }

  .site-nav-particle {
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: rgba(139, 92, 246, 0.5);
    left: calc(var(--p, 0) * 8.33%);
    top: 20%;
  }

  /* Fewer particles on mobile: hide 7–12 */
  .site-nav-particle:nth-child(n+7) {
    display: none;
  }

  .site-nav-dropdown-links {
    position: relative;
    flex: 1 1 0;
    min-height: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: clamp(0.5rem, 1.5vh, 1.25rem) 1.25rem;
    width: 100%;
    overflow: hidden;
  }

  /* Futuristic compact nav links: terminal / data-row style */
  .site-nav-links .site-nav-link {
    width: 100%;
    max-width: 260px;
    flex: 0 0 auto;
    min-height: 0;
    height: auto;
    justify-content: space-between;
    align-items: center;
    gap: 0.75rem;
    padding: 0.6rem 1rem;
    font-size: 0.8125rem;
    font-weight: 500;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    border-radius: 6px;
    border: 1px solid rgba(139, 92, 246, 0.18);
    border-left-width: 3px;
    border-left-color: transparent;
    background: rgba(255, 255, 255, 0.02);
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.2) inset;
    opacity: 0;
    transform: translateY(12px);
    transition: opacity 0.35s ease, transform 0.35s ease, border-color 0.25s ease, background 0.25s ease, box-shadow 0.25s ease;
    transition-delay: calc(0.06s * var(--i, 0) + 0.08s);
    position: relative;
    overflow: hidden;
  }

  /* Left accent bar – terminal cursor / active row */
  .site-nav-links .site-nav-link::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: linear-gradient(180deg, var(--nav-cyan), var(--nav-accent));
    opacity: 0;
    transition: opacity 0.25s ease;
  }

  .site-nav-links .site-nav-link .site-nav-link-glow,
  .site-nav-links .site-nav-link .site-nav-link-arrow {
    display: block;
  }

  .site-nav-links .site-nav-link .site-nav-link-glow {
    display: none;
  }

  .site-nav-links .site-nav-link .site-nav-link-label {
    font-weight: 500;
    letter-spacing: 0.06em;
    color: rgba(255, 255, 255, 0.88);
  }

  .site-nav-links .site-nav-link .site-nav-link-icon {
    font-size: 0.9rem;
    opacity: 0.8;
    color: rgba(255, 255, 255, 0.7);
  }

  .site-nav-links .site-nav-link .site-nav-link-arrow {
    font-size: 0.75rem;
    opacity: 0.5;
    color: rgba(255, 255, 255, 0.6);
    transform: translateX(0);
    transition: transform 0.25s ease, opacity 0.25s ease, color 0.2s ease;
    letter-spacing: 0;
  }

  .site-nav-links .site-nav-link:hover {
    border-color: rgba(139, 92, 246, 0.35);
    border-left-color: rgba(6, 182, 212, 0.6);
    background: rgba(255, 255, 255, 0.04);
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.15) inset, 0 0 20px -12px rgba(139, 92, 246, 0.2);
    transform: translateY(0);
  }

  .site-nav-links .site-nav-link:hover::before {
    opacity: 0.7;
  }

  .site-nav-links .site-nav-link:hover .site-nav-link-arrow {
    opacity: 1;
    transform: translateX(2px);
    color: var(--nav-cyan);
  }

  .site-nav-links .site-nav-link.router-link-active {
    border-color: rgba(139, 92, 246, 0.4);
    border-left-color: var(--nav-cyan);
    background: linear-gradient(90deg, rgba(6, 182, 212, 0.08) 0%, rgba(139, 92, 246, 0.04) 100%);
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1) inset, 0 0 24px -10px rgba(6, 182, 212, 0.25);
  }

  .site-nav-links .site-nav-link.router-link-active::before {
    opacity: 1;
  }

  .site-nav-links .site-nav-link.router-link-active .site-nav-link-label {
    font-weight: 600;
    color: rgba(255, 255, 255, 0.98);
  }

  .site-nav-links .site-nav-link.router-link-active .site-nav-link-icon {
    color: var(--nav-cyan);
    opacity: 1;
  }

  .site-nav-links .site-nav-link.router-link-active .site-nav-link-arrow {
    opacity: 1;
    color: var(--nav-cyan);
    transform: translateX(2px);
  }

  .site-nav-link-line,
  .site-nav-links .site-nav-link::after {
    display: none;
  }

  /* Single user card in dropdown: one container, no inner box */
  .site-nav-dropdown-auth {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    flex: 0 1 auto;
    min-height: 0;
    max-height: 45%;
    padding: clamp(0.5rem, 2vh, 1.75rem) 1.5rem clamp(0.5rem, 1.5vh, 1.5rem);
    margin: 0 1.5rem clamp(0.35rem, 1.5vh, 1.25rem);
    border-radius: clamp(12px, 2.5vh, 24px);
    border: 1px solid rgba(139, 92, 246, 0.22);
    background: rgba(12, 12, 28, 0.97);
    box-shadow:
      0 0 0 1px rgba(255, 255, 255, 0.04) inset,
      0 8px 40px -12px rgba(0, 0, 0, 0.5),
      0 0 40px -12px rgba(139, 92, 246, 0.18);
    position: relative;
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.5s cubic-bezier(0.34, 1.2, 0.64, 1) 0.2s, transform 0.5s cubic-bezier(0.34, 1.2, 0.64, 1) 0.2s;
    overflow: hidden;
  }

  .site-nav-dropdown-auth::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.6), rgba(139, 92, 246, 0.7), rgba(236, 72, 153, 0.4), transparent);
    opacity: 0.85;
  }

  .site-nav-inner {
    padding: 0 1rem;
  }

  .site-nav-brand-text {
    font-size: 1.15rem;
  }

  .site-nav-logo-icon {
    width: 36px;
    height: 36px;
  }

  .site-nav-logo-icon svg {
    width: 20px;
    height: 20px;
  }
}

@media (max-width: 480px) {
  .site-nav-brand-text {
    display: none;
  }

  .site-nav-futuristic {
    --nav-height: 60px;
  }

  .site-nav-links {
    top: 60px;
    height: calc(100vh - 60px);
    height: calc(100dvh - 60px);
    max-height: calc(100vh - 60px);
    max-height: calc(100dvh - 60px);
  }

  .site-nav-dropdown-links {
    padding: clamp(0.35rem, 1.5vh, 1.5rem) 1rem clamp(0.35rem, 1.2vh, 1rem);
  }

  .site-nav-dropdown-auth {
    margin: 0 1rem clamp(0.35rem, 1.2vh, 1rem);
    padding: clamp(0.5rem, 1.5vh, 1rem) 1.25rem clamp(0.5rem, 1.2vh, 1.5rem);
  }
}

/* Mobile dropdown: auth block styling */
@media (max-width: 768px) {
  .site-nav-dropdown-auth :deep(.site-auth-status) {
    width: 100%;
  }

  .site-nav-dropdown-auth :deep(.site-auth-links) {
    flex-direction: column;
    gap: clamp(0.35rem, 1.5vh, 0.75rem);
    width: 100%;
  }

  .site-nav-dropdown-auth :deep(.site-auth-link) {
    width: 100%;
    justify-content: center;
    padding: clamp(0.6rem, 2vh, 1.1rem) clamp(0.75rem, 3vw, 1.35rem);
    border-radius: clamp(10px, 2vh, 14px);
    font-size: clamp(0.9rem, 2.2vw, 1.05rem);
    font-weight: 600;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(255, 255, 255, 0.04);
    transition: border-color 0.35s cubic-bezier(0.34, 1.2, 0.64, 1), box-shadow 0.35s ease, transform 0.35s cubic-bezier(0.34, 1.2, 0.64, 1);
  }

  .site-nav-dropdown-auth :deep(.site-auth-link:active) {
    transform: translateY(0) scale(0.98);
  }

  .site-nav-dropdown-auth :deep(.site-login-link) {
    border-color: rgba(6, 182, 212, 0.3);
    background: rgba(6, 182, 212, 0.08);
  }

  .site-nav-dropdown-auth :deep(.site-login-link:hover) {
    border-color: rgba(6, 182, 212, 0.5);
    transform: translateY(-1px);
  }

  .site-nav-dropdown-auth :deep(.site-register-link) {
    border-color: rgba(139, 92, 246, 0.35);
    background: rgba(139, 92, 246, 0.1);
  }

  .site-nav-dropdown-auth :deep(.site-register-link:hover) {
    border-color: rgba(139, 92, 246, 0.5);
    transform: translateY(-1px);
  }

  /* User block inside dropdown: no second box, vertical card content */
  .site-nav-dropdown-auth :deep(.site-user-info) {
    flex-direction: column;
    gap: clamp(0.5rem, 2vh, 1.25rem);
    padding: 0;
    border: none;
    background: transparent;
    border-radius: 0;
    box-shadow: none;
    align-items: center;
    text-align: center;
  }

  .site-nav-dropdown-auth :deep(.site-user-profile-link) {
    flex-direction: column;
    gap: clamp(0.35rem, 1.5vh, 0.75rem);
  }

  .site-nav-dropdown-auth :deep(.site-user-details) {
    display: flex;
    gap: 0.2rem;
  }

  .site-nav-dropdown-auth :deep(.site-welcome-text) {
    font-size: clamp(0.55rem, 1.5vw, 0.65rem);
  }

  .site-nav-dropdown-auth :deep(.site-user-name) {
    font-size: clamp(0.85rem, 2.2vw, 1rem);
  }

  .site-nav-dropdown-auth :deep(.site-avatar-circle) {
    width: clamp(48px, 12vw, 72px);
    height: clamp(48px, 12vw, 72px);
    border-width: 2px;
    box-shadow:
      0 0 24px -4px rgba(139, 92, 246, 0.45),
      inset 0 0 16px -4px rgba(6, 182, 212, 0.2);
  }

  .site-nav-dropdown-auth :deep(.site-avatar-initials) {
    font-size: clamp(0.9rem, 3vw, 1.25rem);
  }

  .site-nav-dropdown-auth :deep(.site-logout-btn) {
    width: 100%;
    justify-content: center;
    padding: clamp(0.5rem, 1.5vh, 0.75rem) clamp(0.75rem, 3vw, 1.25rem);
    font-size: clamp(0.8rem, 2vw, 0.875rem);
    border-radius: clamp(10px, 2vh, 14px);
    min-width: 0;
    transition: transform 0.25s ease, box-shadow 0.25s ease, background 0.25s ease, border-color 0.25s ease;
  }

  .site-nav-dropdown-auth :deep(.site-logout-btn:active) {
    transform: scale(0.98);
  }
}

@media (prefers-reduced-motion: reduce) {
  .site-nav-scanline,
  .site-nav-logo-icon {
    animation: none !important;
  }

  .site-nav-dropdown-glow,
  .site-nav-dropdown-hexgrid,
  .site-nav-dropdown-scan,
  .site-nav-dropdown-particles {
    animation: none !important;
  }

  .site-nav-particle {
    animation: none !important;
  }

  .site-nav-links .site-nav-link,
  .site-nav-dropdown-auth {
    transition-duration: 0.01s !important;
    transition-delay: 0s !important;
  }

  .site-nav-futuristic.menu-open .site-nav-links .site-nav-link,
  .site-nav-futuristic.menu-open .site-nav-dropdown-auth {
    opacity: 1 !important;
    transform: translateY(0) scale(1) !important;
  }

  .site-nav-dropdown-inner {
    animation: none !important;
    opacity: 1 !important;
    transform: scale(1) translateY(0) !important;
  }
}
</style>
