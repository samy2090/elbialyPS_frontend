<template>
  <div class="entertainment-dashboard" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
    <!-- Top Navigation -->
    <EntertainmentNavbar 
      :menu-open="sidebarVisible"
      :notification-count="3"
      @toggle-menu="toggleSidebar"
      @toggle-notifications="toggleNotifications"
    />

    <!-- Desktop Sidebar -->
    <DesktopSidebar 
      :is-collapsed="sidebarCollapsed"
      :active-item="activeSection"
      :visible="sidebarVisible"
      @toggle-collapse="toggleSidebarCollapse"
      @item-selected="selectSection"
    />

    <!-- Main Content Area -->
    <main class="main-content" :class="{ 'with-sidebar': sidebarVisible && !isMobile }">
      <div class="content-container">
        <!-- Home Section -->
        <HomeSection 
          v-if="activeSection === 'home'"
          @content-selected="onContentSelected"
          @action-triggered="onActionTriggered"
        />

        <!-- Explore Section -->
        <ExploreSection 
          v-if="activeSection === 'explore'"
          @category-selected="onCategorySelected"
          @item-selected="onItemSelected"
        />

        <!-- Profile Section -->
        <ProfileSection 
          v-if="activeSection === 'profile'"
          @edit-avatar="onEditAvatar"
          @item-selected="onItemSelected"
        />

        <!-- Settings Section -->
        <SettingsSection 
          v-if="activeSection === 'settings'"
          @change-password="onChangePassword"
          @export-data="onExportData"
          @setup-2fa="onSetup2FA"
          @delete-account="onDeleteAccount"
        />
      </div>
    </main>

    <!-- Mobile Bottom Navigation -->
    <MobileBottomNav 
      :active-tab="activeSection"
      :visible="!sidebarVisible || isMobile"
      @tab-selected="selectSection"
    />

    <!-- Notifications Panel (overlay) -->
    <div v-if="notificationsVisible" class="notifications-overlay" @click="toggleNotifications">
      <div class="notifications-panel" @click.stop>
        <div class="notifications-header">
          <h3>Notifications</h3>
          <button @click="toggleNotifications" class="close-btn">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        <div class="notifications-list">
          <div v-for="notification in notifications" :key="notification.id" class="notification-item">
            <div class="notification-icon">
              <component :is="notification.icon" />
            </div>
            <div class="notification-content">
              <h4>{{ notification.title }}</h4>
              <p>{{ notification.message }}</p>
              <span class="notification-time">{{ notification.time }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import EntertainmentNavbar from '@/components/features/entertainment/EntertainmentNavbar.vue'
import DesktopSidebar from '@/components/base/layout/DesktopSidebar.vue'
import MobileBottomNav from '@/components/base/layout/MobileBottomNav.vue'
import HomeSection from '@/components/features/dashboard/HomeSection.vue'
import ExploreSection from '@/components/features/dashboard/ExploreSection.vue'
import ProfileSection from '@/components/features/dashboard/ProfileSection.vue'
import SettingsSection from '@/components/features/dashboard/SettingsSection.vue'

// Reactive state
const activeSection = ref('home')
const sidebarVisible = ref(true)
const sidebarCollapsed = ref(false)
const notificationsVisible = ref(false)
const windowWidth = ref(window.innerWidth)

// Computed properties
const isMobile = computed(() => windowWidth.value < 768)

// Notification icons
const StarIcon = {
  template: `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `
}

const PlayIcon = {
  template: `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="5,3 19,12 5,21" fill="currentColor"/>
    </svg>
  `
}

const HeartIcon = {
  template: `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20.84 4.61C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.5783 8.50903 2.9987 7.05 2.9987C5.59096 2.9987 4.19169 3.5783 3.16 4.61C2.1283 5.6417 1.5487 7.04097 1.5487 8.5C1.5487 9.95903 2.1283 11.3583 3.16 12.39L12 21.23L20.84 12.39C21.351 11.8792 21.7563 11.2728 22.0329 10.6053C22.3095 9.93789 22.4518 9.22248 22.4518 8.5C22.4518 7.77752 22.3095 7.06211 22.0329 6.39467C21.7563 5.72723 21.351 5.1208 20.84 4.61Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `
}

// Sample notifications
const notifications = ref([
  {
    id: 1,
    title: 'New Episode Available',
    message: 'Tech Mysteries S1E6 is now streaming',
    time: '2 hours ago',
    icon: PlayIcon
  },
  {
    id: 2,
    title: 'Added to Favorites',
    message: 'Cosmic Journey was added to your favorites',
    time: '1 day ago',
    icon: HeartIcon
  },
  {
    id: 3,
    title: 'Weekly Recommendations',
    message: 'Check out your personalized picks for this week',
    time: '2 days ago',
    icon: StarIcon
  }
])

// Methods
const selectSection = (section) => {
  activeSection.value = section
  if (isMobile.value && sidebarVisible.value) {
    sidebarVisible.value = false
  }
}

const toggleSidebar = () => {
  if (isMobile.value) {
    sidebarVisible.value = !sidebarVisible.value
  } else {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }
}

const toggleSidebarCollapse = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const toggleNotifications = () => {
  notificationsVisible.value = !notificationsVisible.value
}

// Event handlers
const onContentSelected = (content) => {
  console.log('Content selected:', content)
}

const onActionTriggered = (actionId) => {
  console.log('Action triggered:', actionId)
}

const onCategorySelected = (category) => {
  console.log('Category selected:', category)
}

const onItemSelected = (item) => {
  console.log('Item selected:', item)
}

const onEditAvatar = () => {
  console.log('Edit avatar requested')
}

const onChangePassword = () => {
  console.log('Change password requested')
}

const onExportData = () => {
  console.log('Export data requested')
}

const onSetup2FA = () => {
  console.log('Setup 2FA requested')
}

const onDeleteAccount = () => {
  console.log('Delete account requested')
}

// Window resize handler
const handleResize = () => {
  windowWidth.value = window.innerWidth
  
  // Auto-hide sidebar on mobile
  if (isMobile.value && sidebarVisible.value && !sidebarCollapsed.value) {
    sidebarVisible.value = false
  } else if (!isMobile.value && !sidebarVisible.value) {
    sidebarVisible.value = true
  }
}

// Lifecycle hooks
onMounted(() => {
  window.addEventListener('resize', handleResize)
  handleResize() // Initial check
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.entertainment-dashboard {
  min-height: 100vh;
  background: radial-gradient(ellipse at top, rgba(139, 92, 246, 0.15) 0%, rgba(15, 15, 23, 1) 50%);
  color: rgba(255, 255, 255, 0.9);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  position: relative;
  overflow-x: hidden;
}

.main-content {
  padding-top: 80px; /* Account for navbar height */
  min-height: calc(100vh - 80px);
  transition: all 0.3s ease;
}

.main-content.with-sidebar {
  margin-left: 280px;
}

.sidebar-collapsed .main-content.with-sidebar {
  margin-left: 80px;
}

.content-container {
  padding-bottom: 100px; /* Account for mobile bottom nav */
}

.notifications-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  z-index: 1001;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding: 80px 20px 20px;
}

.notifications-panel {
  background: rgba(15, 15, 23, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  width: 100%;
  max-width: 400px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.notifications-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.notifications-header h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
}

.close-btn {
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
}

.close-btn svg {
  width: 1rem;
  height: 1rem;
}

.notifications-list {
  padding: 1rem;
}

.notification-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  margin-bottom: 0.75rem;
  transition: all 0.3s ease;
}

.notification-item:hover {
  background: rgba(255, 255, 255, 0.06);
  transform: translateX(4px);
}

.notification-item:last-child {
  margin-bottom: 0;
}

.notification-icon {
  width: 2rem;
  height: 2rem;
  color: #8b5cf6;
  flex-shrink: 0;
  margin-top: 0.25rem;
}

.notification-content {
  flex: 1;
}

.notification-content h4 {
  font-size: 0.875rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 0.25rem 0;
}

.notification-content p {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
}

.notification-time {
  font-size: 0.625rem;
  color: rgba(255, 255, 255, 0.5);
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .main-content.with-sidebar {
    margin-left: 0;
  }
  
  .sidebar-collapsed .main-content.with-sidebar {
    margin-left: 0;
  }
  
  .notifications-overlay {
    padding: 80px 10px 10px;
  }
  
  .notifications-panel {
    max-width: 100%;
  }
}

/* Desktop optimizations */
@media (min-width: 1024px) {
  .main-content.with-sidebar {
    margin-left: 280px;
  }
  
  .sidebar-collapsed .main-content.with-sidebar {
    margin-left: 80px;
  }
}

/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: rgba(139, 92, 246, 0.5);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(139, 92, 246, 0.7);
}

/* Focus styles for accessibility */
button:focus,
input:focus,
select:focus {
  outline: 2px solid rgba(139, 92, 246, 0.5);
  outline-offset: 2px;
}

/* Animation for section transitions */
.content-container > * {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>