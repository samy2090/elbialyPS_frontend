<template>
  <aside class="desktop-sidebar" :class="{ collapsed: isCollapsed, 'sidebar-hidden': !visible }">
    <div class="sidebar-content">

      <!-- Collapse toggle button -->
      <button 
        class="collapse-btn"
        @click="$emit('toggle-collapse')"
        :aria-label="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
      >
        <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>

      <!-- Navigation items -->
      <nav class="sidebar-nav">
        <div 
          v-for="item in navigationItems"
          :key="item.id"
          :class="['nav-item', { active: isItemActive(item) }]"
          :title="isCollapsed ? item.label : ''"
        >
          <div 
            @click="handleItemClick(item)"
            class="nav-item-main"
          >
            <div class="nav-icon">
              <component :is="item.icon" />
            </div>
            <span v-if="!isCollapsed" class="nav-label">{{ item.label }}</span>
            <div v-if="item.subItems && !isCollapsed" class="submenu-arrow" :class="{ expanded: expandedMenus.includes(item.id) }">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div v-if="isItemActive(item) && !item.subItems" class="active-indicator"></div>
          </div>
          
          <!-- Submenu -->
          <div v-if="item.subItems && !isCollapsed && expandedMenus.includes(item.id)" class="submenu">
            <div 
              v-for="subItem in item.subItems"
              :key="subItem.id"
              @click="$emit('item-selected', subItem.id)"
              :class="['submenu-item', { active: activeItem === subItem.id }]"
            >
              <div class="submenu-icon">
                <component :is="subItem.icon" />
              </div>
              <span class="submenu-label">{{ subItem.label }}</span>
              <div v-if="activeItem === subItem.id" class="active-indicator"></div>
            </div>
          </div>
        </div>
      </nav>

      <!-- Bottom: user + logout (real data, profile on click) -->
      <div class="sidebar-footer">
        <button
          v-if="!isCollapsed"
          class="user-section"
          type="button"
          @click="goToProfile"
          :aria-label="'Open profile for ' + (displayName || 'User')"
        >
          <div class="user-avatar-wrap">
            <img
              v-if="avatarUrl"
              :src="avatarUrl"
              :alt="displayName"
              class="user-avatar-img"
            />
            <span v-else class="user-avatar-initials">{{ initials }}</span>
          </div>
          <div class="user-info">
            <span class="user-name">{{ displayName }}</span>
            <span class="user-role">{{ displayRole }}</span>
          </div>
          <svg class="user-chevron" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <button
          v-else
          class="user-section-collapsed"
          type="button"
          @click="goToProfile"
          :aria-label="'Open profile'"
        >
          <div class="user-avatar-wrap">
            <img
              v-if="avatarUrl"
              :src="avatarUrl"
              :alt="displayName"
              class="user-avatar-img"
            />
            <span v-else class="user-avatar-initials">{{ initials }}</span>
          </div>
        </button>
        <button
          class="logout-btn"
          type="button"
          @click="handleLogout"
          :aria-label="'Log out'"
          :title="isCollapsed ? 'Log out' : ''"
        >
          <svg class="logout-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M16 17L21 12L16 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M21 12H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span v-if="!isCollapsed" class="logout-label">Log out</span>
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getUserRole } from '@/utils/roleHelpers'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// Track expanded menu items
const expandedMenus = ref([])

// Real user data from auth store
const user = computed(() => authStore.user)
const displayName = computed(() => {
  const u = user.value
  if (!u) return 'Guest'
  return u.name || u.username || (u.email && u.email.split('@')[0]) || 'User'
})
const displayRole = computed(() => getUserRole(user.value))
const avatarUrl = computed(() => {
  const u = user.value
  return u?.avatar_url || u?.avatar || u?.profile_image || u?.picture || null
})
const initials = computed(() => {
  const name = displayName.value
  if (!name || name === 'Guest' || name === 'User') return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase().slice(0, 2)
  return name.slice(0, 2).toUpperCase()
})

function goToProfile() {
  emit('item-selected', 'profile')
}

async function handleLogout() {
  await authStore.logout()
}

// Same icons as mobile navigation
const HomeIcon = {
  template: `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M9 22V12H15V22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `
}

const DashboardIcon = {
  template: `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
      <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
      <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
      <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
    </svg>
  `
}

const ExploreIcon = {
  template: `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
      <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88 16.24,7.76" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `
}

const ProfileIcon = {
  template: `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
    </svg>
  `
}

const SettingsIcon = {
  template: `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
      <path d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.2583 9.77251 19.9887C9.5799 19.7191 9.31074 19.5135 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.74171 9.96512 4.01131 9.77251C4.28091 9.5799 4.48649 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `
}

const UsersIcon = {
  template: `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
      <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `
}

const ProductsIcon = {
  template: `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 7L12 3L4 7M20 7L12 11M20 7V17L12 21M12 11V21M4 7V17L12 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `
}

const ExpensesIcon = {
  template: `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `
}

const SessionsIcon = {
  template: `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" stroke-width="2"/>
      <path d="M3 10H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M7 4V8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M17 4V8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <circle cx="9" cy="14" r="1" fill="currentColor"/>
      <circle cx="15" cy="14" r="1" fill="currentColor"/>
      <path d="M12 14V18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `
}

// Submenu icons
const SiteIcon = {
  template: `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 16V8C20.9996 7.64928 20.9071 7.30481 20.7315 7.00116C20.556 6.69751 20.3037 6.44536 20 6.27L13 2.27C12.696 2.09446 12.3511 2.00205 12 2.00205C11.6489 2.00205 11.304 2.09446 11 2.27L4 6.27C3.69626 6.44536 3.44398 6.69751 3.26846 7.00116C3.09294 7.30481 3.00036 7.64928 3 8V16C3.00036 16.3507 3.09294 16.6952 3.26846 16.9988C3.44398 17.3025 3.69626 17.5546 4 17.73L11 21.73C11.304 21.9055 11.6489 21.9979 12 21.9979C12.3511 21.9979 12.696 21.9055 13 21.73L20 17.73C20.3037 17.5546 20.556 17.3025 20.7315 16.9988C20.9071 16.6952 20.9996 16.3507 21 16Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <polyline points="3.27,6.96 12,12.01 20.73,6.96" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="12" y1="22.08" x2="12" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `
}

const DevicesIcon = {
  template: `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" stroke-width="2"/>
      <path d="M6 8H18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M6 12H14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M6 16H10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `
}

const ScorePointsIcon = {
  template: `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `
}

const SpinWheelIcon = {
  template: `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
      <path d="M12 2L12 12L18 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M12 12L12 22L6 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M12 12L2 12L8 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M12 12L22 12L16 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `
}

const SettingsWheelIcon = {
  template: `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
      <path d="M12 2V4M12 20V22M4 12H2M22 12H20M19.07 4.93L17.66 6.34M6.34 17.66L4.93 19.07M19.07 19.07L17.66 17.66M6.34 6.34L4.93 4.93" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `
}

const ListIcon = {
  template: `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 6H21M8 12H21M8 18H21M3 6H3.01M3 12H3.01M3 18H3.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `
}

const FeedIcon = {
  template: `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M7 12H21M7 16H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `
}

const PendingIcon = {
  template: `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
      <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `
}

const GiftIcon = {
  template: `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="8" width="18" height="4" rx="1" stroke="currentColor" stroke-width="2"/>
      <path d="M12 8V21M12 8C12 8 10 6 8 6C6 6 4 8 4 8M12 8C12 8 14 6 16 6C18 6 20 8 20 8M12 21H4V12H12M12 21H20V12H12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M12 8C10.5 8 9 6.5 9 5C9 4 10 3 12 3C14 3 15 4 15 5C15 6.5 13.5 8 12 8Z" stroke="currentColor" stroke-width="2"/>
      <path d="M12 8C13.5 8 15 6.5 15 5C15 4 14 3 12 3C10 3 9 4 9 5C9 6.5 10.5 8 12 8Z" stroke="currentColor" stroke-width="2"/>
    </svg>
  `
}

const HistoryIcon = {
  template: `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 8V12L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>
    </svg>
  `
}

const props = defineProps({
  isCollapsed: {
    type: Boolean,
    default: false
  },
  activeItem: {
    type: String,
    default: 'home'
  },
  visible: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['toggle-collapse', 'item-selected'])

const navigationItems = computed(() => [
  { id: 'site-home', label: 'Home', icon: HomeIcon, href: '/' },
  { id: 'home', label: 'Dashboard', icon: DashboardIcon, href: '/dashboard' },
  { id: 'sessions', label: 'Sessions', icon: SessionsIcon },
  { id: 'explore', label: 'Explore', icon: ExploreIcon },
  { id: 'users', label: 'Users', icon: UsersIcon },
  { id: 'products', label: 'Products', icon: ProductsIcon },
  { id: 'expenses', label: 'Expenses', icon: ExpensesIcon },
  {
    id: 'posts',
    label: 'Posts',
    icon: FeedIcon,
    subItems: [
      { id: 'posts-pending', label: 'Pending', icon: PendingIcon },
      { id: 'posts-all', label: 'All posts', icon: ListIcon },
      { id: 'posts-comments', label: 'All comments', icon: FeedIcon }
    ]
  },
  {
    id: 'spin-wheel',
    label: 'Spin Wheel',
    icon: SpinWheelIcon,
    subItems: [
      { id: 'spin-wheel-settings', label: 'Settings', icon: SettingsWheelIcon },
      { id: 'spin-wheel-options', label: 'Options', icon: ListIcon },
      { id: 'spin-wheel-claims', label: 'Claims', icon: GiftIcon },
      { id: 'spin-wheel-history', label: 'History', icon: HistoryIcon }
    ]
  },
  { id: 'profile', label: 'Profile', icon: ProfileIcon },
  {
    id: 'points',
    label: 'Points',
    icon: ScorePointsIcon,
    subItems: [
      { id: 'settings-score-points', label: 'Score Points', icon: ScorePointsIcon },
      { id: 'settings-points-transactions', label: 'Points Transactions', icon: ScorePointsIcon }
    ]
  },
  { 
    id: 'settings', 
    label: 'Settings', 
    icon: SettingsIcon,
    subItems: [
      { id: 'settings-site', label: 'Site', icon: SiteIcon },
      { id: 'settings-devices', label: 'Devices', icon: DevicesIcon }
    ]
  }
])

function isItemActive(item) {
  if (item.id === 'site-home') return route.path === '/'
  return props.activeItem === item.id || (item.subItems && item.subItems.some(sub => props.activeItem === sub.id))
}

const handleItemClick = (item) => {
  if (item.href) {
    // Dashboard: if already on dashboard, switch to home section; else navigate
    if (item.id === 'home' && route.path === '/dashboard') {
      emit('item-selected', 'home')
      return
    }
    router.push(item.href)
    return
  }
  if (item.subItems) {
    const index = expandedMenus.value.indexOf(item.id)
    if (index > -1) {
      expandedMenus.value.splice(index, 1)
    } else {
      expandedMenus.value.push(item.id)
    }
  } else {
    emit('item-selected', item.id)
  }
}
</script>

<style scoped>
.desktop-sidebar {
  position: fixed !important;
  left: 0;
  top: 72px;
  bottom: 0;
  width: 280px;
  background: linear-gradient(180deg, rgba(15, 15, 23, 0.98) 0%, rgba(20, 20, 28, 0.95) 100%);
  backdrop-filter: blur(40px) saturate(180%);
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 
    8px 0 32px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.03) inset,
    0 0 60px rgba(139, 92, 246, 0.05);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 90;
  display: none;
  height: calc(100vh - 72px);
  max-height: calc(100vh - 72px);
  overflow-y: auto;
  overflow-x: hidden;
  will-change: transform;
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
}

.desktop-sidebar::-webkit-scrollbar {
  width: 4px;
}

.desktop-sidebar::-webkit-scrollbar-track {
  background: transparent;
}

.desktop-sidebar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.desktop-sidebar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}

.desktop-sidebar.collapsed {
  width: 80px;
}

.desktop-sidebar.sidebar-hidden {
  transform: translateX(-100%);
}

.sidebar-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 1.75rem 1.25rem;
  gap: 1.25rem;
}

.collapse-btn {
  align-self: flex-start;
  padding: 0;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 40px;
  position: relative;
  overflow: hidden;
  
}

.collapse-btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(139, 92, 246, 0.2);
  transform: translate(-50%, -50%);
  transition: width 0.3s ease, height 0.3s ease;
}

.collapse-btn:hover::before {
  width: 100%;
  height: 100%;
}

.collapse-btn:hover {
  background: rgba(139, 92, 246, 0.15);
  color: rgba(255, 255, 255, 0.95);
  border-color: rgba(139, 92, 246, 0.4);
  transform: scale(1.05);
  box-shadow: 
    0 4px 16px rgba(139, 92, 246, 0.3),
    0 0 20px rgba(139, 92, 246, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.collapse-btn .icon {
  position: relative;
  z-index: 1;
  transition: transform 0.3s ease;
}

.collapsed .collapse-btn .icon {
  transform: rotate(180deg);
}

.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  overflow-y: auto;
  padding-right: 0.5rem;
  padding-top: 0.25rem;
  min-width: 0;
  /* Hide scrollbar for Chrome, Edge, Safari */
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.nav-item {
  position: relative;
  display: flex;
  flex-direction: column;
  border-radius: 14px;
  color: rgba(255, 255, 255, 0.75);
  cursor: pointer;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid transparent;
  overflow: visible;
  margin-bottom: 0.125rem;
}

.nav-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%) scaleY(0);
  width: 4px;
  height: 0;
  background: linear-gradient(180deg, #8b5cf6 0%, #a855f7 50%, #ec4899 100%);
  border-radius: 0 4px 4px 0;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0;
  box-shadow: 0 0 12px rgba(139, 92, 246, 0.6);
}

.nav-item-main {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.9375rem 1.125rem;
  border-radius: 14px;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 1;
  min-width: 0;
}

.nav-item:hover .nav-item-main {
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%);
  color: rgba(255, 255, 255, 0.95);
  transform: translateX(6px);
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.15),
    0 0 20px rgba(139, 92, 246, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.nav-item.active {
  background: transparent;
  border-color: transparent;
  color: #a855f7;
}

.nav-item.active::before {
  transform: translateY(-50%) scaleY(1);
  height: 65%;
  opacity: 1;
}

.nav-item.active .nav-item-main {
  background: linear-gradient(
    135deg, 
    rgba(139, 92, 246, 0.2) 0%, 
    rgba(168, 85, 247, 0.15) 50%,
    rgba(139, 92, 246, 0.1) 100%
  );
  color: #c084fc;
  font-weight: 600;
  border: 1px solid rgba(139, 92, 246, 0.3);
  box-shadow: 
    0 4px 16px rgba(139, 92, 246, 0.25),
    0 0 24px rgba(139, 92, 246, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    inset 0 -1px 0 rgba(139, 92, 246, 0.2);
  transform: translateX(4px);
}

.nav-item.active .nav-icon {
  color: #c084fc;
  filter: drop-shadow(0 0 6px rgba(139, 92, 246, 0.6));
  transform: scale(1.05);
}

.submenu-arrow {
  width: 1rem;
  height: 1rem;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-left: auto;
  opacity: 0.6;
}

.submenu-arrow.expanded {
  transform: rotate(90deg);
  opacity: 1;
}

.submenu {
  padding-left: 1.5rem;
  margin-top: 0.625rem;
  margin-left: 0.75rem;
  border-left: 2px solid rgba(139, 92, 246, 0.25);
  animation: slideDown 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-15px);
    max-height: 0;
  }
  to {
    opacity: 1;
    transform: translateY(0);
    max-height: 500px;
  }
}

.submenu-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6875rem 1rem;
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  margin-bottom: 0.375rem;
  font-size: 0.875rem;
  border: 1px solid transparent;
}

.submenu-item:hover {
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%);
  color: rgba(255, 255, 255, 0.95);
  transform: translateX(6px);
  padding-left: 1.125rem;
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.1),
    0 0 16px rgba(139, 92, 246, 0.08);
  border-color: rgba(255, 255, 255, 0.05);
}

.submenu-item.active {
  background: linear-gradient(
    135deg, 
    rgba(139, 92, 246, 0.18) 0%, 
    rgba(168, 85, 247, 0.12) 100%
  );
  color: #c084fc;
  font-weight: 600;
  border-left: 3px solid #a855f7;
  padding-left: 0.875rem;
  box-shadow: 
    0 4px 12px rgba(139, 92, 246, 0.2),
    0 0 20px rgba(139, 92, 246, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
  border-color: rgba(139, 92, 246, 0.25);
}

.submenu-item.active .submenu-icon {
  color: #a855f7;
}

.submenu-icon {
  width: 1.125rem;
  height: 1.125rem;
  min-width: 1.125rem;
  flex-shrink: 0;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.submenu-label {
  font-weight: 500;
  font-size: 0.875rem;
}

.nav-icon {
  width: 1.5rem;
  height: 1.5rem;
  min-width: 1.5rem;
  flex-shrink: 0;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  color: currentColor;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-label {
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.9375rem;
  letter-spacing: 0.01em;
  flex: 1;
  min-width: 0;
}

.active-indicator {
  position: absolute;
  right: 1rem;
  width: 6px;
  height: 6px;
  background: linear-gradient(135deg, #8b5cf6, #a855f7);
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(139, 92, 246, 0.8), 0 0 12px rgba(139, 92, 246, 0.4);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.1);
  }
}

/* ---- Sidebar footer: user + logout (futuristic) ---- */
.sidebar-footer {
  margin-top: auto;
  padding-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-width: 0;
  border-top: 1px solid rgba(139, 92, 246, 0.15);
}

.user-section,
.user-section-collapsed {
  border: none;
  background: transparent;
  cursor: pointer;
  font: inherit;
  text-align: left;
  padding: 0;
  margin: 0;
}

.user-section {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  flex-wrap: nowrap;
  padding: 0.875rem 1rem;
  min-width: 0;
  background: linear-gradient(
    145deg,
    rgba(139, 92, 246, 0.08) 0%,
    rgba(139, 92, 246, 0.04) 50%,
    rgba(20, 20, 28, 0.6) 100%
  );
  border-radius: 12px;
  border: 1px solid rgba(139, 92, 246, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow:
    0 2px 12px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.user-section::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.04), transparent);
  transform: translateX(-100%);
  transition: transform 0.5s ease;
  pointer-events: none;
}

.user-section:hover {
  border-color: rgba(139, 92, 246, 0.4);
  box-shadow:
    0 4px 20px rgba(139, 92, 246, 0.2),
    0 0 24px rgba(139, 92, 246, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
  transform: translateY(-2px);
}

.user-section:hover::before {
  transform: translateX(100%);
}

.user-section:active {
  transform: translateY(0);
}

.user-avatar-wrap {
  position: relative;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  overflow: hidden;
  background: linear-gradient(145deg, rgba(139, 92, 246, 0.35), rgba(139, 92, 246, 0.15));
  border: 1px solid rgba(139, 92, 246, 0.4);
  box-shadow: 0 0 16px rgba(139, 92, 246, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-section:hover .user-avatar-wrap {
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15);
  border-color: rgba(139, 92, 246, 0.6);
}

.user-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-avatar-initials {
  font-size: 0.875rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
  letter-spacing: 0.02em;
  text-shadow: 0 0 12px rgba(139, 92, 246, 0.5);
}

.user-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.user-name {
  font-weight: 600;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.95);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: 0.02em;
}

.user-role {
  font-size: 0.75rem;
  color: rgba(139, 92, 246, 0.9);
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.user-chevron {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
  color: rgba(255, 255, 255, 0.5);
  transition: transform 0.25s ease;
}

.user-section:hover .user-chevron {
  color: rgba(139, 92, 246, 0.9);
  transform: translateX(2px);
}

.user-section-collapsed {
  display: flex;
  justify-content: center;
  padding: 0.5rem 0;
}

.user-section-collapsed .user-avatar-wrap {
  width: 36px;
  height: 36px;
}

.user-section-collapsed .user-avatar-initials {
  font-size: 0.75rem;
}

.logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  border: 1px solid rgba(239, 68, 68, 0.25);
  border-radius: 10px;
  background: linear-gradient(180deg, rgba(239, 68, 68, 0.08), rgba(239, 68, 68, 0.04));
  color: rgba(239, 68, 68, 0.9);
  cursor: pointer;
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.logout-btn:hover {
  background: linear-gradient(180deg, rgba(239, 68, 68, 0.18), rgba(239, 68, 68, 0.1));
  border-color: rgba(239, 68, 68, 0.5);
  box-shadow: 0 0 20px rgba(239, 68, 68, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.06);
  transform: translateY(-1px);
}

.logout-btn:active {
  transform: translateY(0);
}

.logout-icon {
  width: 1.125rem;
  height: 1.125rem;
  flex-shrink: 0;
  stroke: currentColor;
}

.collapsed .logout-btn {
  padding: 0.625rem;
}

.logout-label {
  white-space: nowrap;
}

.collapsed .logout-label {
  display: none;
}

.collapsed .sidebar-footer {
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
}

.icon {
  width: 100%;
  height: 100%;
  stroke-width: 2;
}

/* Show on desktop */
@media (min-width: 768px) {
  .desktop-sidebar {
    display: flex;
  }
}

/* Large desktop optimization */
@media (min-width: 1024px) {
  .desktop-sidebar {
    position: fixed !important;
  }
}

/* Mobile responsive - slide in/out */
@media (max-width: 767px) {
  .desktop-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    width: 280px;
    max-width: 85vw;
    height: 100vh;
    z-index: 1000;
    transform: translateX(-100%);
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 
      4px 0 32px rgba(0, 0, 0, 0.5),
      0 0 0 1px rgba(255, 255, 255, 0.05) inset;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .desktop-sidebar:not(.sidebar-hidden) {
    transform: translateX(0);
  }

  .desktop-sidebar.sidebar-hidden {
    transform: translateX(-100%);
  }

  .sidebar-content {
    padding: 1.5rem 1rem;
  }
}

/* Collapsed state adjustments */
.collapsed .nav-label,
.collapsed .submenu-label,
.collapsed .submenu-arrow {
  display: none;
}

.collapsed .nav-item-main {
  justify-content: center;
  padding: 0.875rem;
}

.collapsed .sidebar-nav {
  align-items: center;
}

.collapsed .submenu {
  display: none;
}
</style>