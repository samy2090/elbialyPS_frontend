<template>
  <aside class="sidebar" :class="{ 'is-collapsed': isCollapsed }">
    <!-- Sidebar Header -->
    <div class="sidebar-header">
      <div class="header-brand">
        <div class="brand-logo">
          <div class="logo-circle">
            <i class="logo-icon">🎮</i>
          </div>
        </div>
        <div class="brand-text" v-show="!isCollapsed">
          <span class="brand-title">Entertainment</span>
          <span class="brand-subtitle">Hub</span>
        </div>
      </div>
      <button class="collapse-btn" @click="toggleCollapse">
        <i class="collapse-icon">{{ isCollapsed ? '→' : '←' }}</i>
      </button>
    </div>

    <!-- Navigation -->
    <nav class="sidebar-nav">
      <div class="nav-section">
        <div class="section-title" v-show="!isCollapsed">Main</div>
        <ul class="nav-list">
          <li>
            <router-link to="/dashboard" class="sidebar-link">
              <i class="sidebar-icon">📊</i>
              <span class="link-text" v-show="!isCollapsed">Dashboard</span>
              <div class="link-indicator"></div>
            </router-link>
          </li>
        </ul>
      </div>

      <div class="nav-section" v-if="authStore.isAuthenticated">
        <div class="section-title" v-show="!isCollapsed">Management</div>
        <ul class="nav-list">
          <li>
            <router-link to="/users" class="sidebar-link">
              <i class="sidebar-icon">�</i>
              <span class="link-text" v-show="!isCollapsed">Users</span>
              <div class="link-indicator"></div>
            </router-link>
          </li>
          <li>
            <router-link to="/profile" class="sidebar-link">
              <i class="sidebar-icon">👤</i>
              <span class="link-text" v-show="!isCollapsed">Profile</span>
              <div class="link-indicator"></div>
            </router-link>
          </li>
        </ul>
      </div>

      <div class="nav-section">
        <div class="section-title" v-show="!isCollapsed">Information</div>
        <ul class="nav-list">
          <li>
            <router-link to="/about" class="sidebar-link">
              <i class="sidebar-icon">ℹ</i>
              <span class="link-text" v-show="!isCollapsed">About</span>
              <div class="link-indicator"></div>
            </router-link>
          </li>
        </ul>
      </div>
    </nav>

    <!-- User Info -->
    <div class="sidebar-footer" v-if="authStore.isAuthenticated">
      <div class="user-info">
        <div class="user-avatar">
          <div class="avatar-circle">
            <i class="avatar-icon">👤</i>
          </div>
        </div>
        <div class="user-details" v-show="!isCollapsed">
          <div class="user-name">{{ authStore.user?.name || 'User' }}</div>
          <div class="user-role">Admin</div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'AppSidebar',
  setup() {
    const authStore = useAuthStore()
    const isCollapsed = ref(false)
    
    const toggleCollapse = () => {
      isCollapsed.value = !isCollapsed.value
    }
    
    return {
      authStore,
      isCollapsed,
      toggleCollapse
    }
  }
}
</script>

<style scoped>
.sidebar {
  width: 280px;
  background: linear-gradient(180deg, rgba(15, 15, 35, 0.95), rgba(26, 26, 62, 0.95));
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(139, 92, 246, 0.2);
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  overflow: hidden;
  transition: all 0.3s ease;
  z-index: 900;
  display: flex;
  flex-direction: column;
}

.sidebar.is-collapsed {
  width: 80px;
}

.sidebar::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 1px;
  height: 100%;
  background: linear-gradient(180deg, transparent, rgba(139, 92, 246, 0.5), transparent);
}

/* Header */
.sidebar-header {
  padding: 24px 20px;
  border-bottom: 1px solid rgba(139, 92, 246, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 80px;
}

.header-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.brand-logo {
  flex-shrink: 0;
}

.logo-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(139, 92, 246, 0.3);
  animation: logoFloat 6s ease-in-out infinite;
}

@keyframes logoFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

.logo-icon {
  font-size: 18px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.brand-title {
  font-size: 16px;
  font-weight: 700;
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.brand-subtitle {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
}

.collapse-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(6, 182, 212, 0.1));
  border: 1px solid rgba(139, 92, 246, 0.2);
  color: var(--color-text);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.collapse-btn:hover {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(6, 182, 212, 0.15));
  border-color: rgba(139, 92, 246, 0.4);
  transform: scale(1.05);
}

.collapse-icon {
  font-size: 14px;
  transition: transform 0.3s ease;
}

/* Navigation */
.sidebar-nav {
  flex: 1;
  padding: 20px 0;
  overflow-y: auto;
  overflow-x: hidden;
}

.sidebar-nav::-webkit-scrollbar {
  width: 4px;
}

.sidebar-nav::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: rgba(139, 92, 246, 0.3);
  border-radius: 2px;
}

.nav-section {
  margin-bottom: 32px;
  padding: 0 20px;
}

.section-title {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 12px;
  padding-left: 8px;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-list li {
  margin-bottom: 4px;
}

.sidebar-link {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  gap: 12px;
}

.sidebar-link::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(6, 182, 212, 0.1));
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: -1;
}

.sidebar-link:hover::before {
  opacity: 1;
}

.sidebar-link:hover {
  color: var(--color-text);
  transform: translateX(4px);
  box-shadow: 0 8px 25px rgba(139, 92, 246, 0.2);
}

.sidebar-link.router-link-active {
  color: var(--color-text);
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(6, 182, 212, 0.1));
  border: 1px solid rgba(139, 92, 246, 0.3);
  box-shadow: 0 8px 25px rgba(139, 92, 246, 0.2);
}

.sidebar-link.router-link-active .link-indicator {
  opacity: 1;
  transform: scaleY(1);
}

.sidebar-icon {
  font-size: 18px;
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.sidebar-link:hover .sidebar-icon {
  transform: scale(1.1);
}

.link-text {
  font-weight: 500;
  font-size: 14px;
  transition: opacity 0.3s ease;
}

.link-indicator {
  position: absolute;
  left: 0;
  top: 20%;
  bottom: 20%;
  width: 3px;
  background: linear-gradient(180deg, var(--color-primary), var(--color-secondary));
  border-radius: 0 2px 2px 0;
  opacity: 0;
  transform: scaleY(0);
  transition: all 0.3s ease;
}

/* Footer */
.sidebar-footer {
  padding: 20px;
  border-top: 1px solid rgba(139, 92, 246, 0.1);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.05), rgba(6, 182, 212, 0.05));
  border: 1px solid rgba(139, 92, 246, 0.1);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.user-info:hover {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(6, 182, 212, 0.08));
  border-color: rgba(139, 92, 246, 0.2);
}

.user-avatar {
  flex-shrink: 0;
}

.avatar-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-secondary), var(--color-accent));
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(6, 182, 212, 0.3);
}

.avatar-icon {
  font-size: 16px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Collapsed State */
.sidebar.is-collapsed .sidebar-header {
  padding: 24px 12px;
  justify-content: center;
}

.sidebar.is-collapsed .nav-section {
  padding: 0 12px;
}

.sidebar.is-collapsed .sidebar-link {
  padding: 12px;
  justify-content: center;
}

.sidebar.is-collapsed .sidebar-footer {
  padding: 20px 12px;
}

.sidebar.is-collapsed .user-info {
  justify-content: center;
}

/* Mobile Responsive */
@media (max-width: 1024px) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }
  
  .sidebar.is-open {
    transform: translateX(0);
  }
  
  .sidebar.is-collapsed {
    width: 280px;
  }
}

@media (max-width: 768px) {
  .sidebar {
    width: 280px;
    z-index: 1100;
  }
  
  .sidebar.is-collapsed {
    width: 280px;
  }
  
  .collapse-btn {
    display: none;
  }
}

/* Accessibility */
.sidebar-link:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: -2px;
}

.collapse-btn:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .sidebar,
  .sidebar-link,
  .collapse-btn,
  .logo-circle,
  .sidebar-icon,
  .link-text,
  .link-indicator {
    transition: none;
    animation: none;
  }
}
</style>