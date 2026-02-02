<template>
  <div class="site-auth-status">
    <div v-if="authStore.isAuthenticated && authStore.user" class="site-user-info">
      <div class="site-user-avatar">
        <div class="site-avatar-circle">
          <img
            v-if="avatarUrl"
            :src="avatarUrl"
            alt=""
            class="site-avatar-img"
          />
          <span v-else class="site-avatar-initials">{{ initials }}</span>
        </div>
      </div>
      <div class="site-user-details">
        <span class="site-welcome-text">Welcome back</span>
        <span class="site-user-name">{{ authStore.user.name }}</span>
      </div>
      <button
        @click="onLogoutClick"
        class="site-logout-btn"
        :disabled="authStore.loading"
      >
        <span class="site-logout-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </span>
        <span class="site-logout-label">{{ authStore.loading ? 'Logging out...' : 'Logout' }}</span>
      </button>
    </div>
    <div v-else class="site-auth-links">
      <RouterLink to="/login" class="site-auth-link site-login-link" @click="onNavClick">
        <span class="site-link-icon" aria-hidden="true">🔐</span>
        Login
      </RouterLink>
      <RouterLink to="/register" class="site-auth-link site-register-link" @click="onNavClick">
        <span class="site-link-icon" aria-hidden="true">✨</span>
        Register
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { inject, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { resolveBackendImageUrl } from '@/utils/helpers'

const authStore = useAuthStore()
const router = useRouter()
const closeNavMenu = inject('closeNavMenu', null)

const avatarUrl = computed(() => {
  const u = authStore.user
  if (!u) return null
  const raw = u.avatar_url ?? u.avatar ?? u.profile_image ?? u.picture ?? null
  return resolveBackendImageUrl(raw)
})

const initials = computed(() => {
  const name = authStore.user?.name
  if (!name || typeof name !== 'string') return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase().slice(0, 2)
  }
  return name.slice(0, 2).toUpperCase()
})

function onNavClick() {
  closeNavMenu?.()
}

async function onLogoutClick() {
  closeNavMenu?.()
  try {
    await authStore.logout()
    router.push('/')
  } catch (error) {
    console.error('Logout failed:', error)
  }
}
</script>