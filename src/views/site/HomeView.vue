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
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title">
            Welcome to <span class="text-gradient">ElbialyPS</span>
          </h1>
          <p class="hero-description">
            A modern dashboard platform with responsive design, dark theme, and smooth user experience.
            Discover amazing content and manage your digital world with style.
          </p>
          <div class="hero-actions">
            <router-link v-if="!authStore.isAuthenticated" to="/login" class="btn btn-primary">
              Get Started
            </router-link>
            <router-link v-else to="/dashboard" class="btn btn-primary">
              Open Dashboard
            </router-link>
            <router-link to="/about" class="btn btn-secondary">
              Learn More
            </router-link>
          </div>
        </div>
        <div class="hero-visual">
          <div class="hero-card">
            <div class="card-header">
              <div class="card-dots">
                <span class="dot red"></span>
                <span class="dot yellow"></span>
                <span class="dot green"></span>
              </div>
            </div>
            <div class="card-content">
              <div class="content-lines">
                <div class="line long gradient-purple"></div>
                <div class="line medium gradient-teal"></div>
                <div class="line short gradient-blue"></div>
                <div class="line medium gradient-green"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="stats-section">
      <div class="stats-grid">
        <div v-for="stat in stats" :key="stat.label" class="stat-card">
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
          <div class="stat-trend positive">{{ stat.trend }}</div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section">
      <div class="section-header">
        <h2 class="section-title">Explore Features</h2>
        <p class="section-description">
          Discover what makes our platform unique and powerful
        </p>
      </div>
      
      <div class="features-grid">
        <div 
          v-for="feature in features" 
          :key="feature.id"
          class="feature-card"
          :class="`feature-${feature.color}`"
        >
          <div class="feature-icon">{{ feature.icon }}</div>
          <h3 class="feature-title">{{ feature.title }}</h3>
          <p class="feature-description">{{ feature.description }}</p>
          <router-link 
            v-if="feature.link && (feature.link === '/dashboard' || feature.link === '/about' || authStore.isAuthenticated)" 
            :to="feature.link" 
            class="feature-link"
          >
            Explore →
          </router-link>
          <router-link 
            v-else-if="feature.link" 
            to="/login" 
            class="feature-link"
          >
            Login to Access →
          </router-link>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="cta-content">
        <h2 class="cta-title">Ready to Get Started?</h2>
        <p class="cta-description">
          Join thousands of users who are already enjoying our platform
        </p>
        <div class="cta-actions">
          <router-link v-if="!authStore.isAuthenticated" to="/register" class="btn btn-primary btn-large">
            Create Account
          </router-link>
          <router-link v-else to="/dashboard" class="btn btn-primary btn-large">
            Go to Dashboard
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-page {
  min-height: 100vh;
  padding: 0;
}

.hero-section {
  min-height: 80vh;
  display: flex;
  align-items: center;
  padding: 4rem 0;
  background: radial-gradient(ellipse at top, rgba(139, 92, 246, 0.1) 0%, transparent 50%);
}

.hero-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.hero-text {
  display: flex;
  flex-direction: column;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.1;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
}

.hero-description {
  font-size: 1.25rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 2rem;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 2rem;
  border-radius: var(--radius-lg);
  font-weight: 600;
  text-decoration: none;
  transition: all var(--transition-normal);
  border: 1px solid;
  cursor: pointer;
}

.btn-primary {
  background: var(--gradient-primary);
  border-color: transparent;
  color: white;
  box-shadow: var(--shadow-md);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.btn-secondary {
  background: transparent;
  border-color: var(--border-primary);
  color: var(--text-secondary);
}

.btn-secondary:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.btn-large {
  padding: 1.25rem 2.5rem;
  font-size: 1.125rem;
}

.hero-visual {
  display: flex;
  justify-content: center;
  align-items: center;
}

.hero-card {
  width: 300px;
  height: 200px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-xl);
  backdrop-filter: blur(20px);
}

.card-header {
  padding: 1rem;
  border-bottom: 1px solid var(--border-secondary);
}

.card-dots {
  display: flex;
  gap: 0.5rem;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.dot.red { background: #ef4444; }
.dot.yellow { background: #f59e0b; }
.dot.green { background: #10b981; }

.card-content {
  padding: 2rem 1rem;
}

.content-lines {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.line {
  height: 8px;
  border-radius: 4px;
  animation: pulse 2s infinite;
}

.line.long { width: 100%; }
.line.medium { width: 70%; }
.line.short { width: 40%; }

.gradient-purple { background: linear-gradient(90deg, var(--primary-purple), rgba(139, 92, 246, 0.3)); }
.gradient-teal { background: linear-gradient(90deg, var(--primary-teal), rgba(6, 182, 212, 0.3)); }
.gradient-blue { background: linear-gradient(90deg, var(--primary-blue), rgba(59, 130, 246, 0.3)); }
.gradient-green { background: linear-gradient(90deg, var(--primary-green), rgba(16, 185, 129, 0.3)); }

.stats-section {
  padding: 4rem 2rem;
  background: rgba(255, 255, 255, 0.02);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  max-width: 1000px;
  margin: 0 auto;
}

.stat-card {
  text-align: center;
  padding: 2rem;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  transition: all var(--transition-normal);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
  border-color: var(--border-accent);
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--primary-purple);
  margin-bottom: 0.5rem;
}

.stat-label {
  color: var(--text-secondary);
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.stat-trend {
  font-size: 0.875rem;
  font-weight: 600;
}

.stat-trend.positive {
  color: var(--primary-green);
}

.features-section {
  padding: 6rem 2rem;
}

.section-header {
  text-align: center;
  margin-bottom: 4rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.section-description {
  font-size: 1.125rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  padding: 2.5rem;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-xl);
  transition: all var(--transition-normal);
  text-align: center;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-lg);
  border-color: var(--border-accent);
}

.feature-purple:hover { border-color: rgba(139, 92, 246, 0.5); }
.feature-teal:hover { border-color: rgba(6, 182, 212, 0.5); }
.feature-blue:hover { border-color: rgba(59, 130, 246, 0.5); }
.feature-green:hover { border-color: rgba(16, 185, 129, 0.5); }

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1.5rem;
}

.feature-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.feature-description {
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 2rem;
}

.feature-link {
  color: var(--primary-purple);
  text-decoration: none;
  font-weight: 600;
  transition: all var(--transition-fast);
}

.feature-link:hover {
  color: var(--primary-purple-dark);
}

.cta-section {
  padding: 6rem 2rem;
  background: rgba(139, 92, 246, 0.05);
  text-align: center;
}

.cta-content {
  max-width: 600px;
  margin: 0 auto;
}

.cta-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.cta-description {
  font-size: 1.125rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
  line-height: 1.6;
}

.cta-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .hero-content {
    grid-template-columns: 1fr;
    gap: 3rem;
    text-align: center;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-description {
    font-size: 1.125rem;
  }
  
  .hero-actions {
    justify-content: center;
  }
  
  .hero-card {
    width: 250px;
    height: 160px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .cta-title {
    font-size: 2rem;
  }
  
  .cta-actions {
    flex-direction: column;
    align-items: center;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .btn {
    width: 100%;
    max-width: 280px;
  }
}
</style>
