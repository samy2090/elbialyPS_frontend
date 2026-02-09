<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { resolveBackendImageUrl } from '@/utils/helpers'
import HeroSection from '@/components/base/ui/HeroSection.vue'
import StatCard from '@/components/base/ui/StatCard.vue'
import FeatureCard from '@/components/base/ui/FeatureCard.vue'
import CtaBlock from '@/components/base/ui/CtaBlock.vue'
import SectionHeader from '@/components/base/ui/SectionHeader.vue'
import FuturisticButton from '@/components/base/ui/FuturisticButton.vue'
import FunHeroVisual from '@/components/site/FunHeroVisual.vue'
import EventCard from '@/components/site/EventCard.vue'
import SpinWheelSection from '@/components/site/SpinWheelSection.vue'
import { ranksApi } from '@/api/ranks'

const authStore = useAuthStore()

/* Leaderboard: Today top 3 (separate) + This month / All time */
const todayTop3 = ref([])
const todayLoading = ref(true)
const todayError = ref(null)

const mainLeaderboard = ref([])
const mainPeriod = ref('month') // 'month' | 'all-time'
const mainLoading = ref(true)
const mainError = ref(null)

const currentMonth = computed(() => new Date().getMonth() + 1)
const currentYear = computed(() => new Date().getFullYear())

function avatarUrl(entry) {
  if (!entry?.avatar_url) return null
  return resolveBackendImageUrl(entry.avatar_url) || null
}

function displayName(entry) {
  return entry?.name || entry?.username || '—'
}

function rankNum(entry, index) {
  return entry?.rank ?? index + 1
}

function rankStatus(rank) {
  if (rank === 1) return 'Top scorer'
  if (rank === 2) return 'Rising player'
  if (rank === 3) return 'New challenger'
  return ''
}

async function loadTodayTop3() {
  todayLoading.value = true
  todayError.value = null
  try {
    const res = await ranksApi.leaderboard({ period: 'today', limit: 3 })
    todayTop3.value = res?.data ?? []
  } catch (e) {
    todayError.value = e?.response?.data?.message || e?.message || 'Could not load today\'s top 3'
    todayTop3.value = []
  } finally {
    todayLoading.value = false
  }
}

async function loadMainLeaderboard() {
  mainLoading.value = true
  mainError.value = null
  try {
    const params =
      mainPeriod.value === 'month'
        ? { period: 'month', month: currentMonth.value, year: currentYear.value, limit: 10 }
        : { period: 'all-time', limit: 10 }
    const res = await ranksApi.leaderboard(params)
    mainLeaderboard.value = res?.data ?? []
  } catch (e) {
    mainError.value = e?.response?.data?.message || e?.message || 'Could not load leaderboard'
    mainLeaderboard.value = []
  } finally {
    mainLoading.value = false
  }
}

function setMainPeriod(period) {
  mainPeriod.value = period
  loadMainLeaderboard()
}

onMounted(() => {
  loadTodayTop3()
  loadMainLeaderboard()
})

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

    <!-- Spin & Win (visible to all; only logged-in users can spin) -->
    <section class="home-section home-section--spin" aria-label="Spin the wheel">
      <div class="home-section__inner">
        <SpinWheelSection :can-spin="authStore.isAuthenticated" />
      </div>
    </section>

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

    <!-- Today's top 3 – premium mobile-first leaderboard -->
    <section class="home-section home-section--leaderboard-today" aria-label="Today's top players">
      <div class="home-section__inner">
        <div
          class="home-top3-wrap"
          :class="{ 'home-top3-wrap--loading': todayLoading }"
        >
          <div class="home-top3-container">
            <div class="home-top3-bg"></div>
            <header class="home-top3-header">
              <h2 class="home-top3-title">Today's Top 3</h2>
              <p class="home-top3-subtitle">Leading the board today. Play more to climb!</p>
              <div class="home-top3-divider" aria-hidden="true"></div>
            </header>

            <div v-if="todayLoading" class="home-leaderboard-loading">
              <div class="home-leaderboard-spinner" aria-hidden="true"></div>
              <p>Loading…</p>
            </div>
            <p v-else-if="todayError" class="home-leaderboard-error">{{ todayError }}</p>
            <div v-else-if="todayTop3.length === 0" class="home-leaderboard-empty">
              <p>No rankings yet for today.</p>
            </div>
            <div v-else class="home-top3-list">
              <article
                v-for="(entry, i) in todayTop3"
                :key="entry.id"
                class="home-top3-card"
                :class="[
                  `home-top3-card--rank-${rankNum(entry, i)}`,
                  { 'home-top3-card--first': rankNum(entry, i) === 1 }
                ]"
                :style="{ '--delay': `${i * 0.1}s` }"
              >
                <div class="home-top3-card__glass"></div>
                <div class="home-top3-card__glow"></div>
                <div class="home-top3-card__inner">
                  <div class="home-top3-card__rank-badge" :class="`home-top3-card__rank-badge--${rankNum(entry, i)}`">
                    #{{ rankNum(entry, i) }}
                  </div>
                  <div class="home-top3-card__avatar-wrap">
                    <img
                      v-if="avatarUrl(entry)"
                      :src="avatarUrl(entry)"
                      :alt="displayName(entry)"
                      class="home-top3-card__avatar"
                    />
                    <span v-else class="home-top3-card__initials">{{ (displayName(entry) || '?').slice(0, 2).toUpperCase() }}</span>
                  </div>
                  <div class="home-top3-card__player">
                    <span class="home-top3-card__name">{{ displayName(entry) }}</span>
                    <span class="home-top3-card__status">{{ rankStatus(rankNum(entry, i)) }}</span>
                  </div>
                  <div class="home-top3-card__points-pill">
                    {{ (entry.points ?? 0).toLocaleString() }} pts
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="home-section-divider" aria-hidden="true"></div>

    <!-- Top players: This month / All time -->
    <section class="home-section home-section--leaderboard-main" aria-label="Top players">
      <div class="home-section__inner">
        <SectionHeader
          title="Top players"
          description="See who's leading this month or all time."
        />
        <div class="home-leaderboard-tabs" role="tablist" aria-label="Leaderboard period">
          <button
            type="button"
            role="tab"
            :aria-selected="mainPeriod === 'month'"
            :class="['home-leaderboard-tab', { active: mainPeriod === 'month' }]"
            @click="setMainPeriod('month')"
          >
            This month
          </button>
          <button
            type="button"
            role="tab"
            :aria-selected="mainPeriod === 'all-time'"
            :class="['home-leaderboard-tab', { active: mainPeriod === 'all-time' }]"
            @click="setMainPeriod('all-time')"
          >
            All time
          </button>
        </div>
        <div v-if="mainLoading" class="home-leaderboard-loading">
          <div class="home-leaderboard-spinner" aria-hidden="true"></div>
          <p>Loading…</p>
        </div>
        <p v-else-if="mainError" class="home-leaderboard-error">{{ mainError }}</p>
        <div v-else-if="mainLeaderboard.length === 0" class="home-leaderboard-empty">
          <p>No rankings yet for this period.</p>
        </div>
        <ul v-else class="home-leaderboard-list">
          <li
            v-for="(entry, i) in mainLeaderboard"
            :key="entry.id"
            class="home-leaderboard-item"
            :style="{ '--delay': `${i * 0.05}s` }"
          >
            <div class="home-leaderboard-item__glass"></div>
            <span class="home-leaderboard-item__rank">#{{ entry.rank }}</span>
            <div class="home-leaderboard-item__avatar-wrap">
              <img
                v-if="avatarUrl(entry)"
                :src="avatarUrl(entry)"
                :alt="displayName(entry)"
                class="home-leaderboard-item__avatar"
              />
              <span v-else class="home-leaderboard-item__initials">{{ (displayName(entry) || '?').slice(0, 2).toUpperCase() }}</span>
            </div>
            <span class="home-leaderboard-item__name">{{ displayName(entry) }}</span>
            <span class="home-leaderboard-item__points">{{ (entry.points ?? 0).toLocaleString() }} pts</span>
          </li>
        </ul>
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

/* Leaderboard: Top players (main) – section header */
.home-section--leaderboard-main .section-header__title {
  background: linear-gradient(120deg, #fff 0%, var(--neon-cyan) 40%, var(--neon-magenta) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 0 20px rgba(0, 245, 255, 0.2));
}

.home-section--leaderboard-main .section-header__description {
  color: rgba(255, 255, 255, 0.7);
}

.home-leaderboard-loading,
.home-leaderboard-error,
.home-leaderboard-empty {
  text-align: center;
  padding: 2rem 1rem;
  color: rgba(255, 255, 255, 0.7);
}

.home-leaderboard-error {
  color: rgba(255, 100, 100, 0.95);
}

.home-leaderboard-spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 0.75rem;
  border: 3px solid rgba(0, 245, 255, 0.2);
  border-top-color: var(--neon-cyan);
  border-radius: 50%;
  animation: homeLeaderboardSpin 0.9s linear infinite;
}

@keyframes homeLeaderboardSpin {
  to { transform: rotate(360deg); }
}

/* Today Top 3 – premium mobile-first leaderboard (glass / neumorphic) */
.home-top3-wrap {
  max-width: 420px;
  margin: 0 auto;
}

.home-top3-container {
  --top3-base: #0B0F1A;
  --top3-gold: #f0c14b;
  --top3-cyan: #00d4ff;
  --top3-purple: #b366ff;
  position: relative;
  border-radius: 22px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.06),
    inset 0 -1px 0 rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(255, 255, 255, 0.06),
    0 12px 40px -12px rgba(0, 0, 0, 0.5),
    0 0 60px -20px rgba(100, 150, 255, 0.15);
}

.home-top3-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(165deg, rgba(11, 15, 26, 0.85) 0%, rgba(30, 25, 50, 0.4) 50%, rgba(20, 30, 50, 0.3) 100%);
  pointer-events: none;
}

.home-top3-header {
  position: relative;
  padding: 1.25rem 1rem 1rem;
  text-align: center;
}

.home-top3-title {
  font-size: clamp(1.5rem, 4vw, 1.75rem);
  font-weight: 800;
  color: #fff;
  margin: 0 0 0.35em;
  letter-spacing: -0.02em;
  text-shadow: 0 0 24px rgba(255, 255, 255, 0.25), 0 0 48px rgba(0, 212, 255, 0.15);
}

.home-top3-subtitle {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
  letter-spacing: 0.04em;
  margin: 0;
  line-height: 1.4;
}

.home-top3-divider {
  height: 1px;
  margin: 1rem 1.5rem 0;
  background: linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.35), rgba(179, 102, 255, 0.25), transparent);
  box-shadow: 0 0 12px rgba(0, 212, 255, 0.2);
}

.home-top3-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 1rem;
  padding-top: 1.25rem;
}

.home-top3-card {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  animation: homeRevealUp 0.6s cubic-bezier(0.34, 1.2, 0.64, 1) both;
  animation-delay: var(--delay, 0s);
}

.home-top3-card--first {
  transform: scale(1.03);
}

.home-top3-card--first:hover,
.home-top3-card--first:focus-within {
  transform: scale(1.05);
}

@media (prefers-reduced-motion: no-preference) {
  .home-top3-card--first {
    animation: homeTop3Float 4s ease-in-out infinite;
    animation-delay: var(--delay, 0s);
  }
}

@keyframes homeTop3Float {
  0%, 100% { transform: scale(1.03) translateY(0); }
  50% { transform: scale(1.03) translateY(-3px); }
}

.home-top3-card:hover,
.home-top3-card:focus-within {
  transform: scale(1.02);
}

.home-top3-card--first:hover,
.home-top3-card--first:focus-within {
  transform: scale(1.05) translateY(-2px);
}

.home-top3-card__glass {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    inset 0 -2px 8px rgba(0, 0, 0, 0.15),
    0 6px 20px -8px rgba(0, 0, 0, 0.35);
}

.home-top3-card__glow {
  position: absolute;
  inset: -1px;
  border-radius: 21px;
  opacity: 0.5;
  pointer-events: none;
  transition: opacity 0.25s ease;
}

.home-top3-card:hover .home-top3-card__glow,
.home-top3-card:focus-within .home-top3-card__glow {
  opacity: 0.85;
}

.home-top3-card--rank-1 .home-top3-card__glow {
  background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(240, 193, 75, 0.25), transparent 70%);
  box-shadow: 0 0 24px -4px rgba(240, 193, 75, 0.2);
}

.home-top3-card--rank-2 .home-top3-card__glow {
  background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0, 212, 255, 0.2), transparent 70%);
  box-shadow: 0 0 24px -4px rgba(0, 212, 255, 0.2);
}

.home-top3-card--rank-3 .home-top3-card__glow {
  background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(179, 102, 255, 0.2), transparent 70%);
  box-shadow: 0 0 24px -4px rgba(179, 102, 255, 0.2);
}

.home-top3-card__inner {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  min-height: 72px;
}

.home-top3-card--first .home-top3-card__inner {
  padding: 16px 18px;
  min-height: 80px;
}

.home-top3-card__rank-badge {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  font-weight: 800;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 4px 12px rgba(0, 0, 0, 0.25);
  transition: box-shadow 0.25s ease;
}

.home-top3-card--rank-1 .home-top3-card__rank-badge {
  background: linear-gradient(145deg, rgba(240, 193, 75, 0.35), rgba(200, 150, 50, 0.2));
  box-shadow: 0 0 20px -4px rgba(240, 193, 75, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 4px 12px rgba(0, 0, 0, 0.25);
}

.home-top3-card--rank-2 .home-top3-card__rank-badge {
  background: linear-gradient(145deg, rgba(0, 212, 255, 0.3), rgba(0, 150, 200, 0.15));
  box-shadow: 0 0 20px -4px rgba(0, 212, 255, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 4px 12px rgba(0, 0, 0, 0.25);
}

.home-top3-card--rank-3 .home-top3-card__rank-badge {
  background: linear-gradient(145deg, rgba(179, 102, 255, 0.35), rgba(120, 60, 200, 0.2));
  box-shadow: 0 0 20px -4px rgba(179, 102, 255, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 4px 12px rgba(0, 0, 0, 0.25);
}

.home-top3-card__avatar-wrap {
  position: relative;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 0 16px -4px rgba(0, 212, 255, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.home-top3-card--first .home-top3-card__avatar-wrap {
  width: 48px;
  height: 48px;
  box-shadow: 0 0 20px -4px rgba(240, 193, 75, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.home-top3-card__avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.home-top3-card__initials {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 0.95rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
}

.home-top3-card__player {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.home-top3-card__name {
  font-size: 1rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.98);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.home-top3-card--first .home-top3-card__name {
  font-size: 1.05rem;
}

.home-top3-card__status {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.55);
  letter-spacing: 0.02em;
}

.home-top3-card__points-pill {
  flex-shrink: 0;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 0.9rem;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.25) 0%, rgba(179, 102, 255, 0.2) 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 0 16px -4px rgba(0, 212, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: box-shadow 0.25s ease, transform 0.2s ease;
}

.home-top3-card:hover .home-top3-card__points-pill,
.home-top3-card:focus-within .home-top3-card__points-pill {
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 0 20px -4px rgba(0, 212, 255, 0.35);
}

.home-top3-card:active {
  transform: scale(0.99);
}

.home-top3-card--first:active {
  transform: scale(1.02);
}

/* Top players list – tabs + list */
.home-leaderboard-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  padding: 4px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.2);
  width: fit-content;
  margin-left: auto;
  margin-right: auto;
}

.home-leaderboard-tab {
  padding: 0.65rem 1.25rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  background: transparent;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: color 0.25s ease, background 0.25s ease, box-shadow 0.25s ease;
  min-height: 44px;
}

.home-leaderboard-tab:hover {
  color: rgba(255, 255, 255, 0.9);
}

.home-leaderboard-tab.active {
  color: var(--neon-cyan);
  background: rgba(0, 245, 255, 0.1);
  box-shadow:
    inset 0 1px 2px rgba(255, 255, 255, 0.08),
    0 2px 8px rgba(0, 0, 0, 0.2);
}

.home-leaderboard-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.home-leaderboard-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.9rem 1.25rem;
  border-radius: 16px;
  overflow: hidden;
  min-height: 56px;
  animation: homeRevealUp 0.5s cubic-bezier(0.34, 1.2, 0.64, 1) both;
  animation-delay: var(--delay, 0s);
}

.home-leaderboard-item__glass {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  box-shadow:
    inset 2px 2px 6px rgba(255, 255, 255, 0.04),
    inset -2px -2px 6px rgba(0, 0, 0, 0.12),
    0 6px 20px -6px rgba(0, 0, 0, 0.35);
}

.home-leaderboard-item__rank {
  position: relative;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--neon-cyan);
  min-width: 2.25rem;
}

.home-leaderboard-item__avatar-wrap {
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.home-leaderboard-item__avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.home-leaderboard-item__initials {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 0.85rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
}

.home-leaderboard-item__name {
  position: relative;
  flex: 1;
  font-size: 0.95rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.home-leaderboard-item__points {
  position: relative;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--neon-cyan);
}

@media (max-width: 600px) {
  .home-leaderboard-tabs {
    width: 100%;
    justify-content: center;
  }

  .home-leaderboard-tab {
    flex: 1;
    min-width: 0;
  }

  .home-leaderboard-item {
    padding: 0.75rem 1rem;
    gap: 0.75rem;
  }

  .home-leaderboard-item__name {
    font-size: 0.9rem;
  }
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
  .events-grid > *,
  .home-top3-card,
  .home-top3-card--first,
  .home-leaderboard-item,
  .home-leaderboard-spinner {
    animation: none !important;
  }

  .home-top3-card--first {
    transform: scale(1.03);
  }

  .stats-grid > *,
  .features-grid > *,
  .events-grid > *,
  .home-top3-card,
  .home-leaderboard-item {
    animation: homeRevealUp 0.5s ease-out both !important;
  }
}
</style>
