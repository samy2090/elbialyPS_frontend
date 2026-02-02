<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import HeroSection from '@/components/base/ui/HeroSection.vue'
import StatCard from '@/components/base/ui/StatCard.vue'
import FeatureCard from '@/components/base/ui/FeatureCard.vue'
import CtaBlock from '@/components/base/ui/CtaBlock.vue'
import SectionHeader from '@/components/base/ui/SectionHeader.vue'
import FuturisticButton from '@/components/base/ui/FuturisticButton.vue'

const authStore = useAuthStore()

const features = ref([
  {
    id: 1,
    title: 'Neural Dashboard',
    description: 'Next-gen control center with holographic UI, real-time sync, and adaptive layouts. Built for 2250.',
    icon: '▤',
    link: '/dashboard',
    variant: 'purple',
  },
  {
    id: 2,
    title: 'User Nexus',
    description: 'Unified identity and permissions across the platform. Quantum-grade security and seamless access.',
    icon: '◉',
    link: '/users',
    variant: 'teal',
  },
  {
    id: 3,
    title: 'Analytics Core',
    description: 'Live data streams, predictive insights, and immersive visualizations. See the future of your data.',
    icon: '◈',
    link: '/dashboard',
    variant: 'green',
  },
])

const stats = ref([
  { label: 'Active Users', value: '12.5K', trend: '+15%', variant: 'purple', trendDirection: 'positive' },
  { label: 'Data Streams', value: '8.2K', trend: '+8%', variant: 'cyan', trendDirection: 'positive' },
  { label: 'Monthly Views', value: '1.2M', trend: '+23%', variant: 'green', trendDirection: 'positive' },
  { label: 'Platform Rating', value: '4.9/5', trend: '+0.1', variant: 'orange', trendDirection: 'positive' },
])
</script>

<template>
  <div class="home-page">
    <div class="home-page__bg" aria-hidden="true">
      <div class="home-page__mesh"></div>
      <div class="home-page__grid"></div>
      <div class="home-page__glow home-page__glow--1"></div>
      <div class="home-page__glow home-page__glow--2"></div>
    </div>

    <!-- Hero -->
    <HeroSection
      title="Welcome to "
      title-highlight="ElbialyPS"
      description="The platform reimagined for 2250. Holographic interfaces, neural-speed performance, and a design that feels like the future—today. Join the next wave of digital experience."
    >
      <template #badge>
        <span class="home-badge">✦ Next-gen platform — Est. 2250</span>
      </template>
      <template #actions>
        <FuturisticButton v-if="!authStore.isAuthenticated" :to="{ name: 'login' }" variant="primary" large>
          Enter Portal
        </FuturisticButton>
        <FuturisticButton v-else :to="{ name: 'dashboard' }" variant="primary" large>
          Open Dashboard
        </FuturisticButton>
        <FuturisticButton :to="{ name: 'about' }" variant="secondary" large>
          Discover More
        </FuturisticButton>
      </template>
      <template #visual>
        <div class="hero-visual">
          <div class="hero-visual__card">
            <div class="hero-visual__scan" aria-hidden="true"></div>
            <div class="hero-visual__header">
              <span class="hero-visual__dot hero-visual__dot--r"></span>
              <span class="hero-visual__dot hero-visual__dot--y"></span>
              <span class="hero-visual__dot hero-visual__dot--g"></span>
            </div>
            <div class="hero-visual__body">
              <div class="hero-visual__line hero-visual__line--1"></div>
              <div class="hero-visual__line hero-visual__line--2"></div>
              <div class="hero-visual__line hero-visual__line--3"></div>
              <div class="hero-visual__line hero-visual__line--4"></div>
            </div>
          </div>
        </div>
      </template>
    </HeroSection>

    <div class="home-section-divider" aria-hidden="true"></div>

    <!-- Stats -->
    <section class="home-section home-section--stats" aria-label="Statistics">
      <div class="home-section__inner">
        <div class="stats-grid">
          <StatCard
            v-for="(stat, i) in stats"
            :key="stat.label"
            :value="stat.value"
            :label="stat.label"
            :trend="stat.trend"
            :variant="stat.variant"
            :trend-direction="stat.trendDirection"
            :style="{ '--delay': `${i * 0.12}s` }"
          />
        </div>
      </div>
    </section>

    <div class="home-section-divider" aria-hidden="true"></div>

    <!-- Features -->
    <section class="home-section home-section--features" aria-label="Features">
      <div class="home-section__inner">
        <SectionHeader
          title="Built for 2250"
          description="Neural dashboards, quantum security, and interfaces that adapt to you. Explore what's next."
        />
        <div class="features-grid">
          <FeatureCard
            v-for="(feature, i) in features"
            :key="feature.id"
            :title="feature.title"
            :description="feature.description"
            :icon="feature.icon"
            :variant="feature.variant"
            :link-to="(feature.link === '/dashboard' || feature.link === '/about' || authStore.isAuthenticated) ? feature.link : '/login'"
            :link-text="(feature.link === '/dashboard' || feature.link === '/about' || authStore.isAuthenticated) ? 'Enter →' : 'Login to Access →'"
            :style="{ '--delay': `${i * 0.15}s` }"
          />
        </div>
      </div>
    </section>

    <div class="home-section-divider" aria-hidden="true"></div>

    <!-- CTA -->
    <CtaBlock
      title="Ready to step into 2250?"
      description="Join thousands already on the platform. Create your account and unlock the full experience in seconds."
    >
      <template #actions>
        <FuturisticButton
          v-if="!authStore.isAuthenticated"
          :to="{ name: 'register' }"
          variant="primary"
          large
        >
          Create Account
        </FuturisticButton>
        <FuturisticButton v-else :to="{ name: 'dashboard' }" variant="primary" large>
          Go to Dashboard
        </FuturisticButton>
      </template>
    </CtaBlock>
  </div>
</template>

<style scoped>
.home-page {
  position: relative;
  min-height: 100vh;
  background: #030306;
}

.home-page__bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.home-page__mesh {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 100% 60% at 20% 10%, rgba(139, 92, 246, 0.12) 0%, transparent 50%),
    radial-gradient(ellipse 80% 50% at 80% 80%, rgba(6, 182, 212, 0.08) 0%, transparent 50%),
    radial-gradient(ellipse 60% 40% at 50% 50%, rgba(168, 85, 247, 0.05) 0%, transparent 60%);
  animation: homeMeshPulse 12s ease-in-out infinite;
}

@keyframes homeMeshPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.85; }
}

.home-page__grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(139, 92, 246, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(139, 92, 246, 0.03) 1px, transparent 1px);
  background-size: 64px 64px;
  mask-image: linear-gradient(180deg, transparent 0%, black 15%, black 85%, transparent 100%);
  -webkit-mask-image: linear-gradient(180deg, transparent 0%, black 15%, black 85%, transparent 100%);
  animation: homeGridMove 20s linear infinite;
}

@keyframes homeGridMove {
  0% { transform: translate(0, 0); }
  100% { transform: translate(64px, 64px); }
}

.home-page__glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.2;
  animation: homeGlowFloat 18s ease-in-out infinite;
}

.home-page__glow--1 {
  width: 600px;
  height: 600px;
  background: rgba(139, 92, 246, 0.25);
  top: -20%;
  right: -15%;
  animation-delay: 0s;
}

.home-page__glow--2 {
  width: 500px;
  height: 500px;
  background: rgba(6, 182, 212, 0.2);
  bottom: -25%;
  left: -10%;
  animation-delay: -9s;
}

@keyframes homeGlowFloat {
  0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.2; }
  33% { transform: translate(30px, -30px) scale(1.1); opacity: 0.3; }
  66% { transform: translate(-20px, 20px) scale(0.95); opacity: 0.15; }
}

.home-badge {
  display: inline-block;
  padding: 0.45rem 1rem;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(139, 92, 246, 0.95);
  background: rgba(139, 92, 246, 0.1);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 999px;
  box-shadow: 0 0 24px -4px rgba(139, 92, 246, 0.3);
  animation: homeBadgeGlow 4s ease-in-out infinite;
}

@keyframes homeBadgeGlow {
  0%, 100% { box-shadow: 0 0 24px -4px rgba(139, 92, 246, 0.3); border-color: rgba(139, 92, 246, 0.3); }
  50% { box-shadow: 0 0 36px -4px rgba(139, 92, 246, 0.5); border-color: rgba(139, 92, 246, 0.5); }
}

.home-section-divider {
  height: 1px;
  max-width: 1200px;
  margin: 0 auto;
  background: linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.25), rgba(6, 182, 212, 0.2), transparent);
  opacity: 0.8;
  animation: homeDividerPulse 5s ease-in-out infinite;
}

@keyframes homeDividerPulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

.home-section {
  position: relative;
  z-index: 1;
  padding: clamp(3.5rem, 9vw, 6rem) 1.5rem;
}

.home-section__inner {
  max-width: 1200px;
  margin: 0 auto;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.stats-grid > * {
  animation: homeRevealUp 0.8s cubic-bezier(0.34, 1.2, 0.64, 1) both;
  animation-delay: var(--delay, 0s);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.75rem;
}

.features-grid > * {
  animation: homeRevealUp 0.9s cubic-bezier(0.34, 1.2, 0.64, 1) both;
  animation-delay: var(--delay, 0s);
}

.home-section--features :deep(.section-header__title) {
  background: linear-gradient(120deg, rgba(255, 255, 255, 0.98) 0%, rgba(167, 139, 250, 0.95) 40%, rgba(6, 182, 212, 0.95) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 0 24px rgba(139, 92, 246, 0.2));
}

.home-section--features :deep(.section-header__description) {
  color: rgba(255, 255, 255, 0.7);
}

/* Hero visual – 2250 holographic card */
.hero-visual {
  display: flex;
  justify-content: center;
  align-items: center;
}

.hero-visual__card {
  position: relative;
  width: min(320px, 92vw);
  min-height: 220px;
  background: linear-gradient(165deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 20px;
  overflow: hidden;
  box-shadow:
    0 24px 56px -16px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(139, 92, 246, 0.1),
    0 0 60px -20px rgba(139, 92, 246, 0.2);
  animation: heroCardFloat 8s ease-in-out infinite;
}

.hero-visual__scan {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.9), rgba(139, 92, 246, 0.9), transparent);
  box-shadow: 0 0 16px rgba(6, 182, 212, 0.5);
  animation: heroVisualScan 3s linear infinite;
}

@keyframes heroVisualScan {
  0% { transform: translateY(0); opacity: 0.7; }
  100% { transform: translateY(220px); opacity: 0.4; }
}

@keyframes heroCardFloat {
  0%, 100% { transform: translateY(0); box-shadow: 0 24px 56px -16px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(139, 92, 246, 0.1), 0 0 60px -20px rgba(139, 92, 246, 0.2); }
  50% { transform: translateY(-10px); box-shadow: 0 32px 64px -16px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(139, 92, 246, 0.15), 0 0 80px -16px rgba(139, 92, 246, 0.3); }
}

.hero-visual__header {
  display: flex;
  gap: 0.5rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.hero-visual__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.hero-visual__dot--r { background: #ef4444; box-shadow: 0 0 14px rgba(239, 68, 68, 0.6); animation: heroDotPulse 2s ease-in-out infinite; }
.hero-visual__dot--y { background: #f59e0b; box-shadow: 0 0 14px rgba(245, 158, 11, 0.6); animation: heroDotPulse 2s ease-in-out 0.3s infinite; }
.hero-visual__dot--g { background: #10b981; box-shadow: 0 0 14px rgba(16, 185, 129, 0.6); animation: heroDotPulse 2s ease-in-out 0.6s infinite; }

@keyframes heroDotPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.1); }
}

.hero-visual__body {
  padding: 1.5rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.hero-visual__line {
  height: 8px;
  border-radius: 4px;
  background: linear-gradient(90deg, rgba(139, 92, 246, 0.7), rgba(139, 92, 246, 0.15));
  animation: heroLinePulse 2.5s ease-in-out infinite;
}

.hero-visual__line--1 { width: 100%; animation-delay: 0s; }
.hero-visual__line--2 { width: 78%; animation-delay: 0.25s; background: linear-gradient(90deg, #06b6d4 60%, rgba(6, 182, 212, 0.2)); }
.hero-visual__line--3 { width: 48%; animation-delay: 0.5s; background: linear-gradient(90deg, #3b82f6 60%, rgba(59, 130, 246, 0.2)); }
.hero-visual__line--4 { width: 68%; animation-delay: 0.75s; background: linear-gradient(90deg, #10b981 60%, rgba(16, 185, 129, 0.2)); }

@keyframes heroLinePulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.45; }
}

@media (max-width: 768px) {
  .home-section {
    padding: 2.5rem 1rem;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }

  .hero-visual__card {
    min-height: 200px;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .home-page__mesh,
  .home-page__grid,
  .home-page__glow,
  .home-badge,
  .home-section-divider,
  .hero-visual__card,
  .hero-visual__scan,
  .hero-visual__dot,
  .stats-grid > *,
  .features-grid > * {
    animation: none;
  }

  .stats-grid > *,
  .features-grid > * {
    animation: homeRevealUp 0.5s ease-out both;
  }
}
</style>
