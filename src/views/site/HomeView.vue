<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import HeroSection from '@/components/base/ui/HeroSection.vue'
import StatCard from '@/components/base/ui/StatCard.vue'
import FeatureCard from '@/components/base/ui/FeatureCard.vue'
import CtaBlock from '@/components/base/ui/CtaBlock.vue'
import SectionHeader from '@/components/base/ui/SectionHeader.vue'
import FuturisticButton from '@/components/base/ui/FuturisticButton.vue'
import FunHeroVisual from '@/components/site/FunHeroVisual.vue'
import EventCard from '@/components/site/EventCard.vue'

const authStore = useAuthStore()

/* Games & Entertainment */
const games = ref([
  {
    id: 1,
    title: 'Arcade Games',
    description: 'Classic cabinets, racing sims, and rhythm games. Level up and chase high scores.',
    icon: '🕹️',
    variant: 'purple',
  },
  {
    id: 2,
    title: 'VR Experiences',
    description: 'Step into another world. Immersive VR setups for solo or squad sessions.',
    icon: '🥽',
    variant: 'teal',
  },
  {
    id: 3,
    title: 'Table Games',
    description: 'Pool, foosball, board games & more. Compete with friends or make new ones.',
    icon: '🎲',
    variant: 'green',
  },
])

/* Food & Drink – playful captions */
const foodDrink = ref([
  {
    id: 1,
    title: 'Fuel your fun',
    description: 'Pizza, burgers, loaded fries & more. No need to leave—grab a bite and get back in the game.',
    icon: '🍕',
    variant: 'orange',
  },
  {
    id: 2,
    title: 'Snack like a pro',
    description: 'Smoothies, sodas, energy drinks & late-night coffee. Stay charged, stay winning.',
    icon: '🥤',
    variant: 'blue',
  },
])

/* Fun stats */
const stats = ref([
  { label: 'Games', value: '50+', trend: '', variant: 'purple', trendDirection: 'positive' },
  { label: 'Open late', value: '✓', trend: '', variant: 'cyan', trendDirection: 'positive' },
  { label: 'Vibes', value: '100%', trend: '', variant: 'green', trendDirection: 'positive' },
  { label: 'Good times', value: '∞', trend: '', variant: 'orange', trendDirection: 'positive' },
])

/* Events / Community */
const events = ref([
  { id: 1, title: 'Friday Night Tournaments', description: 'Arcade & VR brackets. Prizes and bragging rights.', day: 'Fri', month: 'Weekly', linkTo: '/about' },
  { id: 2, title: 'Chill & Play Sundays', description: 'Board games, pizza deals, and hangout vibes.', day: 'Sun', month: 'Weekly', linkTo: '/about' },
  { id: 3, title: 'Late Night Lock-in', description: 'Extended hours, special menu, and exclusive games.', day: 'Sat', month: 'Monthly', linkTo: '/about' },
])
</script>

<template>
  <div class="home-page home-page--fun">
    <div class="home-page__bg" aria-hidden="true">
      <div class="home-page__mesh"></div>
      <div class="home-page__grid"></div>
      <div class="home-page__glow home-page__glow--1"></div>
      <div class="home-page__glow home-page__glow--2"></div>
      <div class="home-page__glow home-page__glow--3"></div>
    </div>

    <!-- Hero: Play. Chill. Eat. Repeat. -->
    <HeroSection
      title="Play. Chill. Eat."
      title-highlight="Repeat."
      description="Games, food, drinks & good vibes. The spot where you and your crew come to play, eat, and never stop having fun."
    >
      <template #badge>
        <span class="home-badge">🎮 Games • Drink • Vibes</span>
      </template>
      <template #actions>
        <FuturisticButton
          v-if="!authStore.isAuthenticated"
          :to="{ name: 'login' }"
          variant="primary"
          large
          class="home-cta-primary"
        >
          Book Your Spot
        </FuturisticButton>
        <FuturisticButton
          v-else-if="authStore.canAccessDashboard"
          :to="{ name: 'dashboard' }"
          variant="primary"
          large
          class="home-cta-primary"
        >
          Open Dashboard
        </FuturisticButton>
        <FuturisticButton
          v-else
          :to="{ name: 'profile' }"
          variant="primary"
          large
          class="home-cta-primary"
        >
          Show your profile
        </FuturisticButton>
        <FuturisticButton
          v-if="!authStore.isAuthenticated"
          :to="{ name: 'login' }"
          variant="secondary"
          large
        >
          Join the Fun
        </FuturisticButton>
        <FuturisticButton
          v-else-if="authStore.isAuthenticated && !authStore.canAccessDashboard"
          :to="{ name: 'profile' }"
          variant="secondary"
          large
        >
          Show your profile
        </FuturisticButton>
        <FuturisticButton v-else :to="{ name: 'about' }" variant="secondary" large>
          Join the Fun
        </FuturisticButton>
      </template>
      <template #visual>
        <FunHeroVisual />
      </template>
    </HeroSection>

    <div class="home-section-divider" aria-hidden="true"></div>

    <!-- Fun stats -->
    <section class="home-section home-section--stats" aria-label="Why us">
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
            :style="{ '--delay': `${i * 0.1}s` }"
          />
        </div>
      </div>
    </section>

    <div class="home-section-divider" aria-hidden="true"></div>

    <!-- Games / Entertainment -->
    <section class="home-section home-section--games" aria-label="Games & Entertainment">
      <div class="home-section__inner">
        <SectionHeader
          title="Games & Entertainment"
          description="Arcade, VR, table games & more. Something for every vibe."
        />
        <div class="features-grid">
          <FeatureCard
            v-for="(game, i) in games"
            :key="game.id"
            :title="game.title"
            :description="game.description"
            :icon="game.icon"
            :variant="game.variant"
            :link-to="(authStore.isAuthenticated ? '/dashboard' : '/about')"
            link-text="See more →"
            :style="{ '--delay': `${i * 0.12}s` }"
          >
            <template #icon>
              <span class="fun-card-icon">{{ game.icon }}</span>
            </template>
          </FeatureCard>
        </div>
      </div>
    </section>

    <div class="home-section-divider" aria-hidden="true"></div>

    <!-- Food & Drink -->
    <section class="home-section home-section--food" aria-label="Food & Drink">
      <div class="home-section__inner">
        <SectionHeader
          title="Food & Drink"
          description="Fuel your fun. Snacks, meals & drinks so you never have to leave the vibe."
        />
        <div class="features-grid features-grid--two">
          <FeatureCard
            v-for="(item, i) in foodDrink"
            :key="item.id"
            :title="item.title"
            :description="item.description"
            :icon="item.icon"
            :variant="item.variant"
            :link-to="(authStore.isAuthenticated ? '/dashboard' : '/about')"
            link-text="Check menu →"
            :style="{ '--delay': `${i * 0.12}s` }"
          >
            <template #icon>
              <span class="fun-card-icon">{{ item.icon }}</span>
            </template>
          </FeatureCard>
        </div>
      </div>
    </section>

    <div class="home-section-divider" aria-hidden="true"></div>

    <!-- Events / Community -->
    <section class="home-section home-section--events" aria-label="Events & Community">
      <div class="home-section__inner">
        <SectionHeader
          title="Events & Community"
          description="Tournaments, lock-ins & hangouts. Meet friends, make memories."
        />
        <div class="events-grid">
          <EventCard
            v-for="(event, i) in events"
            :key="event.id"
            :title="event.title"
            :description="event.description"
            :day="event.day"
            :month="event.month"
            :link-to="event.linkTo"
            :style="{ '--delay': `${i * 0.1}s` }"
          />
        </div>
      </div>
    </section>

    <div class="home-section-divider" aria-hidden="true"></div>

    <!-- CTA -->
    <CtaBlock
      title="Ready to play?"
      description="Book your spot, grab your crew, and come have a good time. We can’t wait to see you."
    >
      <template #actions>
        <FuturisticButton
          v-if="!authStore.isAuthenticated"
          :to="{ name: 'login' }"
          variant="primary"
          large
          class="home-cta-primary"
        >
          Book Your Spot
        </FuturisticButton>
        <FuturisticButton
          v-else-if="authStore.canAccessDashboard"
          :to="{ name: 'dashboard' }"
          variant="primary"
          large
        >
          Go to Dashboard
        </FuturisticButton>
        <FuturisticButton v-else :to="{ name: 'profile' }" variant="primary" large>
          Show your profile
        </FuturisticButton>
      </template>
    </CtaBlock>
  </div>
</template>

<style scoped>
/* ==============================================
   GEN Z / FUN VENUE – Style guide (neon, bold, playful)
   ============================================== */
.home-page--fun {
  --neon-cyan: #00f5ff;
  --neon-magenta: #ff0080;
  --neon-purple: #a855f7;
  --neon-green: #00ff88;
  --neon-orange: #ff9f43;
  --fun-bg: #050508;
  --fun-bg-soft: #0a0a0f;
  font-family: 'Outfit', var(--font-sans, sans-serif);
}

.home-page {
  position: relative;
  min-height: 100vh;
  background: var(--fun-bg);
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
    radial-gradient(ellipse 100% 60% at 20% 10%, rgba(0, 245, 255, 0.1) 0%, transparent 50%),
    radial-gradient(ellipse 80% 50% at 80% 80%, rgba(255, 0, 128, 0.08) 0%, transparent 50%),
    radial-gradient(ellipse 60% 40% at 50% 50%, rgba(168, 85, 247, 0.06) 0%, transparent 60%);
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
    linear-gradient(rgba(0, 245, 255, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 245, 255, 0.04) 1px, transparent 1px);
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
  opacity: 0.18;
  animation: homeGlowFloat 18s ease-in-out infinite;
}

.home-page__glow--1 {
  width: 600px;
  height: 600px;
  background: rgba(0, 245, 255, 0.2);
  top: -20%;
  right: -15%;
  animation-delay: 0s;
}

.home-page__glow--2 {
  width: 500px;
  height: 500px;
  background: rgba(255, 0, 128, 0.15);
  bottom: -25%;
  left: -10%;
  animation-delay: -9s;
}

.home-page__glow--3 {
  width: 350px;
  height: 350px;
  background: rgba(168, 85, 247, 0.15);
  top: 50%;
  left: 50%;
  animation-delay: -4s;
}

@keyframes homeGlowFloat {
  0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.18; }
  33% { transform: translate(30px, -30px) scale(1.1); opacity: 0.25; }
  66% { transform: translate(-20px, 20px) scale(0.95); opacity: 0.12; }
}

.home-badge {
  display: inline-block;
  padding: 0.45rem 1rem;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--neon-cyan);
  background: rgba(0, 245, 255, 0.08);
  border: 1px solid rgba(0, 245, 255, 0.3);
  border-radius: 999px;
  box-shadow: 0 0 24px -4px rgba(0, 245, 255, 0.25);
  transition: box-shadow 0.35s ease, transform 0.25s ease;
}

.home-badge:hover {
  box-shadow: 0 0 32px -2px rgba(0, 245, 255, 0.4);
  transform: scale(1.02);
}

@media (min-width: 768px) {
  .home-badge {
    animation: homeBadgePulse 4s ease-in-out infinite;
  }
}

@keyframes homeBadgePulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.9; }
}

.home-cta-primary {
  box-shadow: 0 0 28px -4px rgba(0, 245, 255, 0.35);
}

.home-cta-primary:hover {
  box-shadow: 0 0 40px -4px rgba(0, 245, 255, 0.5);
}

.home-section-divider {
  height: 1px;
  max-width: 1200px;
  margin: 0 auto;
  background: linear-gradient(90deg, transparent, rgba(0, 245, 255, 0.2), rgba(255, 0, 128, 0.15), transparent);
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
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1.25rem;
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

.features-grid--two {
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  max-width: 900px;
  margin: 0 auto;
}

.features-grid > * {
  animation: homeRevealUp 0.9s cubic-bezier(0.34, 1.2, 0.64, 1) both;
  animation-delay: var(--delay, 0s);
}

.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.events-grid > * {
  animation: homeRevealUp 0.85s cubic-bezier(0.34, 1.2, 0.64, 1) both;
  animation-delay: var(--delay, 0s);
}

@keyframes homeRevealUp {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fun-card-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  font-size: 2rem;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: transform 0.4s ease, box-shadow 0.4s ease;
}

:deep(.feature-card:hover) .fun-card-icon {
  transform: scale(1.08);
  box-shadow: 0 0 28px -4px rgba(0, 245, 255, 0.3);
}

.home-section--games :deep(.section-header__title),
.home-section--food :deep(.section-header__title),
.home-section--events :deep(.section-header__title) {
  background: linear-gradient(120deg, #fff 0%, var(--neon-cyan) 40%, var(--neon-magenta) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 0 20px rgba(0, 245, 255, 0.2));
}

.home-section--games :deep(.section-header__description),
.home-section--food :deep(.section-header__description),
.home-section--events :deep(.section-header__description) {
  color: rgba(255, 255, 255, 0.7);
}

/* Hero title neon highlight override for fun theme */
.home-page--fun :deep(.hero-section__title-highlight) {
  background: linear-gradient(120deg, var(--neon-cyan) 0%, var(--neon-magenta) 50%, var(--neon-purple) 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 0 20px rgba(0, 245, 255, 0.4));
}

.home-page--fun :deep(.hero-section__title) {
  font-family: 'Outfit', var(--font-sans, sans-serif);
  font-weight: 800;
}

.home-page--fun :deep(.hero-section__description) {
  color: rgba(255, 255, 255, 0.8);
}

@media (max-width: 768px) {
  .home-section {
    padding: 2.5rem 1rem;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .features-grid,
  .features-grid--two {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }

  .events-grid {
    grid-template-columns: 1fr;
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
  .stats-grid > *,
  .features-grid > *,
  .events-grid > * {
    animation: none !important;
  }

  .stats-grid > *,
  .features-grid > *,
  .events-grid > * {
    animation: homeRevealUp 0.5s ease-out both !important;
  }
}
</style>
