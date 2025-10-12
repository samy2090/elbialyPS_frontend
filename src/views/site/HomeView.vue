<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const features = ref([
  {
    id: 1,
    title: 'Dashboard',
    description: 'Experience our modern, responsive dashboard system with dark theme and smooth animations.',
    icon: '📊',
    link: '/dashboard',
    color: 'purple'
  },
  {
    id: 2,
    title: 'User Management',
    description: 'Comprehensive user management system with profiles, permissions, and analytics.',
    icon: '👥',
    link: '/users',
    color: 'teal'
  },
  {
    id: 3,
    title: 'Analytics Dashboard',
    description: 'View detailed analytics and insights with beautiful charts and visualizations.',
    icon: '📊',
    link: '/dashboard',
    color: 'green'
  }
])

const stats = ref([
  { label: 'Active Users', value: '12.5K', trend: '+15%' },
  { label: 'Total Content', value: '8.2K', trend: '+8%' },
  { label: 'Monthly Views', value: '1.2M', trend: '+23%' },
  { label: 'User Rating', value: '4.9/5', trend: '+0.1' }
])
</script>

<template>
  <div class="site-home-page">
    <!-- Hero Section -->
    <section class="site-hero-section">
      <div class="site-hero-content">
        <div class="site-hero-text">
          <h1 class="site-hero-title">
            Welcome to <span class="text-gradient">ElbialyPS</span>
          </h1>
          <p class="site-hero-description">
            A modern dashboard platform with responsive design, dark theme, and smooth user experience.
            Discover amazing content and manage your digital world with style.
          </p>
          <div class="site-hero-actions">
            <router-link v-if="!authStore.isAuthenticated" to="/login" class="site-btn site-btn-primary">
              Get Started
            </router-link>
            <router-link v-else to="/dashboard" class="site-btn site-btn-primary">
              Open Dashboard
            </router-link>
            <router-link to="/about" class="site-btn site-btn-secondary">
              Learn More
            </router-link>
          </div>
        </div>
        <div class="site-hero-visual">
          <div class="site-hero-card">
            <div class="site-card-header">
              <div class="site-card-dots">
                <span class="site-dot red"></span>
                <span class="site-dot yellow"></span>
                <span class="site-dot green"></span>
              </div>
            </div>
            <div class="site-card-content">
              <div class="site-content-lines">
                <div class="site-line long site-gradient-purple"></div>
                <div class="site-line medium site-gradient-teal"></div>
                <div class="site-line short site-gradient-blue"></div>
                <div class="site-line medium site-gradient-green"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="site-stats-section">
      <div class="site-stats-grid">
        <div v-for="stat in stats" :key="stat.label" class="site-stat-card">
          <div class="site-stat-value">{{ stat.value }}</div>
          <div class="site-stat-label">{{ stat.label }}</div>
          <div class="site-stat-trend positive">{{ stat.trend }}</div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="site-features-section">
      <div class="site-section-header">
        <h2 class="site-section-title">Explore Features</h2>
        <p class="site-section-description">
          Discover what makes our platform unique and powerful
        </p>
      </div>
      
      <div class="site-features-grid">
        <div 
          v-for="feature in features" 
          :key="feature.id"
          class="site-feature-card"
          :class="`site-feature-${feature.color}`"
        >
          <div class="site-feature-icon">{{ feature.icon }}</div>
          <h3 class="site-feature-title">{{ feature.title }}</h3>
          <p class="site-feature-description">{{ feature.description }}</p>
          <router-link 
            v-if="feature.link && (feature.link === '/dashboard' || feature.link === '/about' || authStore.isAuthenticated)" 
            :to="feature.link" 
            class="site-feature-link"
          >
            Explore →
          </router-link>
          <router-link 
            v-else-if="feature.link" 
            to="/login" 
            class="site-feature-link"
          >
            Login to Access →
          </router-link>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="site-cta-section">
      <div class="site-cta-content">
        <h2 class="site-cta-title">Ready to Get Started?</h2>
        <p class="site-cta-description">
          Join thousands of users who are already enjoying our platform
        </p>
        <div class="site-cta-actions">
          <router-link v-if="!authStore.isAuthenticated" to="/register" class="site-btn site-btn-primary site-btn-large">
            Create Account
          </router-link>
          <router-link v-else to="/dashboard" class="site-btn site-btn-primary site-btn-large">
            Go to Dashboard
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>
