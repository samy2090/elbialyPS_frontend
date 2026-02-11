<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { resolveBackendImageUrl } from '@/utils/helpers'
import ProfileSection from '@/components/dashboard/sections/ProfileSection.vue'
import Lightbox from '@/components/base/ui/Lightbox.vue'
import ProfilePostsSection from '@/components/site/posts/ProfilePostsSection.vue'
import { userPointBalancesApi } from '@/api/userPointBalancesApi'
import { userLevelsApi } from '@/api/userLevels'
import { ranksApi } from '@/api/ranks'
import { spinWheelApi } from '@/api/spinWheelUser'

const authStore = useAuthStore()

/* User avatar for hero (same resolution as ProfileSection) */
const profileAvatarUrl = computed(() => {
  const u = authStore.user
  if (!u) return null
  const raw = u.avatar ?? u.avatar_url ?? u.profile_image ?? u.picture ?? null
  const url = resolveBackendImageUrl(raw)
  if (url) return url
  const name = u.name ?? u.full_name ?? ''
  const initials = name
    ? name.split(/\s+/).map(s => s[0]).slice(0, 2).join('').toUpperCase()
    : (u.email ? u.email[0].toUpperCase() : '?')
  return `https://via.placeholder.com/160x160/1a0a2e/8b5cf6?text=${encodeURIComponent(initials)}`
})

const profileInitials = computed(() => {
  const name = authStore.user?.name ?? authStore.user?.full_name ?? ''
  if (!name || typeof name !== 'string') return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase().slice(0, 2)
  return name.slice(0, 2).toUpperCase()
})

/* Dynamic points & level data */
const pointsLoading = ref(true)
const pointsError = ref(null)
const myBalance = ref(null)
const levelsList = ref([])

function getTotalPointsFromBalance(bal) {
  if (!bal) return 0
  const row = bal.user_point_balance ?? bal.balance ?? bal
  return Number(row?.total_points ?? bal.total_points ?? 0) || 0
}

function getLevelFromBalance(bal) {
  if (!bal) return null
  return bal.user_level ?? bal.level ?? bal.user?.user_level ?? null
}

const stats = computed(() => {
  const pointsEarned = myBalance.value != null
    ? getTotalPointsFromBalance(myBalance.value)
    : Number(authStore.user?.points_balance ?? authStore.user?.total_points ?? authStore.user?.point_balance ?? 0) || 0
  const levels = Array.isArray(levelsList.value) ? levelsList.value : (levelsList.value?.data ?? [])
  const sortedLevels = [...levels].sort((a, b) => (a.min_points ?? 0) - (b.min_points ?? 0))
  const nextLevel = sortedLevels.find((l) => (l.min_points ?? 0) > pointsEarned)
  const nextRankAt = nextLevel ? (nextLevel.min_points ?? 0) : pointsEarned || 1
  const currentLevel = sortedLevels
    .filter((l) => (l.min_points ?? 0) <= pointsEarned)
    .pop() ?? sortedLevels[0] ?? null
  const currentLevelMinPoints = currentLevel != null ? (currentLevel.min_points ?? 0) : 0
  const nextLevelMinPoints = nextLevel != null ? (nextLevel.min_points ?? 0) : currentLevelMinPoints

  return {
    totalSpent: '₦12,450',
    mostUsedDevice: 'PlayStation 5',
    favoriteDrink: 'Iced Mocha',
    favoriteSnack: 'Loaded Fries',
    favoriteFood: 'Pepperoni Pizza',
    pointsEarned,
    pointsToNextRank: nextLevel ? Math.max(0, nextRankAt - pointsEarned) : 0,
    nextRankAt,
    currentRank: currentLevel?.name ?? '—',
    nextRank: nextLevel?.name ?? 'Max',
    currentLevelMinPoints,
    nextLevelMinPoints,
  }
})

/* My Rank (leaderboard position) – three stat-tiles: Today, This month, All time */
const myRankTiles = ref({
  today: null,
  month: null,
  'all-time': null,
})
const myRankLoading = ref(false)
const myRankError = ref(null)

const rankPeriods = [
  { key: 'today', label: 'Today' },
  { key: 'month', label: 'This month' },
  { key: 'all-time', label: 'All time' },
]

async function loadMyRank() {
  myRankLoading.value = true
  myRankError.value = null
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()
  try {
    const [todayRes, monthRes, allTimeRes] = await Promise.all([
      ranksApi.myRank({ period: 'today' }),
      ranksApi.myRank({ period: 'month', month, year }),
      ranksApi.myRank({ period: 'all-time' }),
    ])
    myRankTiles.value = { today: todayRes, month: monthRes, 'all-time': allTimeRes }
  } catch (e) {
    myRankError.value = e?.response?.data?.message || e?.message || 'Could not load your rank'
    myRankTiles.value = { today: null, month: null, 'all-time': null }
  } finally {
    myRankLoading.value = false
  }
}

function formatRankValue(data) {
  if (!data) return '—'
  if (data.in_leaderboard) return `#${data.rank} of ${data.total_users}`
  return data.message || 'No activity'
}

function formatRankPoints(data) {
  if (!data?.in_leaderboard) return ''
  const pts = data.points ?? 0
  return pts.toLocaleString() + ' pts'
}

const progressPercent = computed(() => {
  const earned = stats.value.pointsEarned
  const start = stats.value.currentLevelMinPoints
  const end = stats.value.nextRankAt
  if (!end || end <= start) return 100
  return Math.min(100, Math.max(0, ((earned - start) / (end - start)) * 100))
})

async function loadPointsAndLevels() {
  pointsLoading.value = true
  pointsError.value = null
  try {
    const [balanceRes, levelsRes] = await Promise.all([
      userPointBalancesApi.getMyBalance().catch((err) => {
        if (err?.response?.status === 404) return null
        throw err
      }),
      userLevelsApi.list().catch(() => []),
    ])
    myBalance.value = balanceRes && typeof balanceRes === 'object' ? balanceRes : null
    levelsList.value = Array.isArray(levelsRes) ? levelsRes : (levelsRes?.data ?? [])
  } catch (e) {
    pointsError.value = e?.response?.data?.message ?? e?.message ?? 'Failed to load points'
    myBalance.value = null
    levelsList.value = []
  } finally {
    pointsLoading.value = false
  }
}

/* Spin wheel: claimed rewards only */
const myClaims = ref([])
const myClaimsLoading = ref(false)
const myClaimsError = ref(null)

function formatClaimDate(s) {
  if (!s) return '—'
  const d = new Date(s)
  return isNaN(d.getTime()) ? s : d.toLocaleString()
}

function claimStatusBadge(status) {
  if (status === 'granted') return { text: 'Received', class: 'profile-claim-badge--success' }
  if (status === 'pending') return { text: 'Pending', class: 'profile-claim-badge--warning' }
  if (status === 'fulfilled') return { text: 'Fulfilled', class: 'profile-claim-badge--info' }
  return { text: status || '—', class: 'profile-claim-badge--muted' }
}

async function loadMyClaims() {
  if (!authStore.user?.id) return
  myClaimsLoading.value = true
  myClaimsError.value = null
  try {
    const res = await spinWheelApi.getMyClaims({ limit: 20 })
    myClaims.value = res?.data ?? []
  } catch (e) {
    myClaimsError.value = e?.response?.data?.message ?? e?.message ?? 'Could not load claims'
    myClaims.value = []
  } finally {
    myClaimsLoading.value = false
  }
}

onMounted(() => {
  if (authStore.user?.id) authStore.fetchUser?.()
  loadPointsAndLevels()
  loadMyRank()
  loadMyClaims()
})

const topItems = ref([
  { type: 'drink', label: 'Top drink', name: 'Iced Mocha', icon: '🥤', variant: 'cyan' },
  { type: 'snack', label: 'Top snack', name: 'Loaded Fries', icon: '🍟', variant: 'orange' },
  { type: 'device', label: 'Top device', name: 'PlayStation 5', icon: '🎮', variant: 'purple' },
])

const recommendations = ref([
  { text: 'Try this drink next time!', item: 'Matcha Latte', icon: '🍵', tag: 'Trending' },
  { text: 'Your friend loved this snack!', item: 'Churros', icon: '🥨', tag: 'Popular' },
  { text: 'Level up your gaming—try this.', item: 'VR Booth', icon: '🥽', tag: 'New' },
])

/* Toggle account / update-info section (ProfileView only) */
const showAccountSection = ref(false)
function toggleAccountSection() {
  showAccountSection.value = !showAccountSection.value
}

/* Lightbox for avatar photo */
const lightboxImageUrl = ref(null)
function openAvatarLightbox() {
  if (profileAvatarUrl.value) lightboxImageUrl.value = profileAvatarUrl.value
}
</script>

<template>
  <div class="profile-page">
    <div class="profile-page__bg" aria-hidden="true">
      <div class="profile-page__mesh"></div>
      <div class="profile-page__grid"></div>
      <div class="profile-page__glow profile-page__glow--1"></div>
      <div class="profile-page__glow profile-page__glow--2"></div>
      <div class="profile-page__glow profile-page__glow--3"></div>
    </div>

    <!-- Hero with user image -->
    <header class="profile-hero">
      <div class="profile-hero__inner">
        <div v-if="authStore.user" class="profile-hero__avatar-wrap">
          <div
            class="profile-hero__avatar-frame"
            role="button"
            tabindex="0"
            aria-label="View profile photo"
            @click="openAvatarLightbox"
            @keydown.enter="openAvatarLightbox"
            @keydown.space.prevent="openAvatarLightbox"
          >
            <img
              v-if="profileAvatarUrl"
              :src="profileAvatarUrl"
              :alt="authStore.user.name || 'Profile'"
              class="profile-hero__avatar-img"
            />
            <span v-else class="profile-hero__avatar-initials">{{ profileInitials }}</span>
          </div>
        </div>
        <p class="profile-hero__badge">✨ Your space</p>
        <h1 class="profile-hero__title">My Profile</h1>
        <p class="profile-hero__subtitle">See your stats! Level up your points and explore your activity.</p>
        <div v-if="authStore.user?.name" class="profile-hero__name">{{ authStore.user.name }}</div>
      </div>
    </header>

    <div class="profile-divider" aria-hidden="true"></div>

    <!-- Account: button to reveal update section (futuristic / Gen Z) -->
    <section class="profile-section profile-section--account" aria-label="Your account">
      <div class="profile-section__inner">
        <!-- Futuristic button: click to show update section -->
        <div v-if="!showAccountSection" class="profile-account-toggle">
          <button
            type="button"
            class="profile-account-btn"
            @click="toggleAccountSection"
            aria-expanded="false"
            aria-controls="profile-update-section"
          >
            <span class="profile-account-btn__glow"></span>
            <span class="profile-account-btn__border"></span>
            <span class="profile-account-btn__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
            <span class="profile-account-btn__label">Update your info</span>
            <span class="profile-account-btn__arrow">→</span>
          </button>
          <p class="profile-account-toggle__hint">Edit name, phone, avatar & more</p>
        </div>

        <!-- Reveal: update-information section -->
        <Transition name="profile-account-reveal">
          <div
            v-show="showAccountSection"
            id="profile-update-section"
            class="profile-account-reveal"
            role="region"
            aria-label="Update your profile"
          >
            <div class="profile-account-reveal__header">
              <h2 class="profile-section__title">Your account</h2>
              <p class="profile-section__desc">Update your info or change your avatar.</p>
              <button
                type="button"
                class="profile-account-close"
                @click="toggleAccountSection"
                aria-label="Close"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div class="profile-account-card">
              <ProfileSection />
            </div>
          </div>
        </Transition>
      </div>
    </section>

    <div class="profile-divider" aria-hidden="true"></div>

    <!-- Stats overview -->
    <section class="profile-section" aria-label="Your stats">
      <div class="profile-section__inner">
        <h2 class="profile-section__title">Your stats at a glance</h2>
        <p class="profile-section__desc">Money spent, favorites, points & rank—all in one place.</p>
        <div v-if="pointsLoading && myBalance == null" class="profile-points-loading">
          <div class="profile-points-spinner" aria-hidden="true"></div>
          <p>Loading your points…</p>
        </div>
        <p v-else-if="pointsError" class="profile-points-error">{{ pointsError }}</p>
        <div v-else class="stats-overview">
          <article
            v-for="(val, key, i) in { totalSpent: stats.totalSpent, pointsEarned: stats.pointsEarned }"
            :key="key"
            class="stat-tile"
            :style="{ '--delay': `${i * 0.08}s` }"
          >
            <div class="stat-tile__glow"></div>
            <div class="stat-tile__border"></div>
            <div class="stat-tile__content">
              <span class="stat-tile__value">{{ typeof val === 'number' ? val.toLocaleString() : val }}</span>
              <span class="stat-tile__label">{{ key === 'totalSpent' ? 'Total spent' : 'Total points earned' }}</span>
            </div>
          </article>
        </div>
        <!-- My Rank: three stat-tiles (Today, This month, All time) -->
        <div class="profile-my-rank">
          <h3 class="profile-my-rank__title">My Rank</h3>
          <div v-if="myRankLoading" class="profile-my-rank-loading">
            <div class="profile-points-spinner profile-points-spinner--sm" aria-hidden="true"></div>
            <span>Loading rank…</span>
          </div>
          <p v-else-if="myRankError" class="profile-my-rank-error">{{ myRankError }}</p>
          <div v-else class="stats-overview stats-overview--rank">
            <article
              v-for="(p, i) in rankPeriods"
              :key="p.key"
              class="stat-tile"
              :style="{ '--delay': `${i * 0.08}s` }"
            >
              <div class="stat-tile__glow"></div>
              <div class="stat-tile__border"></div>
              <div class="stat-tile__content">
                <span class="stat-tile__value">{{ formatRankValue(myRankTiles[p.key]) }}</span>
                <span v-if="formatRankPoints(myRankTiles[p.key])" class="stat-tile__sub">{{ formatRankPoints(myRankTiles[p.key]) }}</span>
                <span class="stat-tile__label">{{ p.label }}</span>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>

    <!-- Points progress bar: Level up your points (dynamic) -->
    <section class="profile-section profile-section--progress" aria-label="Level progress">
      <div class="profile-section__inner">
        <h2 class="profile-section__title">Level up your points!</h2>
        <div v-if="pointsLoading && myBalance == null" class="profile-points-loading profile-points-loading--compact">
          <div class="profile-points-spinner" aria-hidden="true"></div>
          <p>Loading level…</p>
        </div>
        <template v-else>
          <p class="profile-section__desc">
            <template v-if="stats.nextRank !== 'Max'">{{ stats.pointsEarned.toLocaleString() }} / {{ stats.nextRankAt.toLocaleString() }} pts to {{ stats.nextRank }} </template>
            <template v-else>{{ stats.pointsEarned.toLocaleString() }} pts · {{ stats.currentRank }} </template>
          </p>
          <div class="rank-bar-wrap">
            <div class="rank-bar">
              <div class="rank-bar__fill" :style="{ width: progressPercent + '%' }"></div>
              <div class="rank-bar__glow" :style="{ width: progressPercent + '%' }"></div>
            </div>
            <div class="rank-badges">
              <span class="rank-badge rank-badge--current">{{ stats.currentRank }} ({{ stats.currentLevelMinPoints.toLocaleString() }} pts)</span>
              <span class="rank-badge rank-badge--next">{{ stats.nextRank }}<template v-if="stats.nextRank !== 'Max'"> ({{ stats.nextLevelMinPoints.toLocaleString() }} pts)</template></span>
            </div>
          </div>
        </template>
      </div>
    </section>

    <!-- My Claims (Claimed Rewards) -->
    <section class="profile-section profile-section--claims" aria-label="Claimed rewards">
      <div class="profile-section__inner">
        <h2 class="profile-section__title">My Rewards</h2>
        <p class="profile-section__desc">Rewards you claimed from the spin wheel.</p>
        <div v-if="myClaimsLoading" class="profile-spin-loading">
          <div class="profile-points-spinner" aria-hidden="true"></div>
          <p>Loading your rewards…</p>
        </div>
        <div v-else-if="myClaimsError" class="profile-spin-error">
          <p>{{ myClaimsError }}</p>
          <button type="button" class="profile-spin-retry" @click="loadMyClaims">Retry</button>
        </div>
        <div v-else-if="!myClaims.length" class="profile-spin-empty">
          <p>No claims yet. Spin the wheel to win rewards!</p>
        </div>
        <div v-else class="profile-claims-grid">
          <article v-for="claim in myClaims" :key="claim.id" class="profile-claim-card">
            <div class="profile-claim-card__glass"></div>
            <span class="profile-claim-card__label">{{ claim.option?.label ?? claim.option?.reward?.label ?? '—' }}</span>
            <span :class="['profile-claim-badge', claimStatusBadge(claim.status).class]">{{ claimStatusBadge(claim.status).text }}</span>
            <span class="profile-claim-card__meta">Claimed: {{ formatClaimDate(claim.created_at) }}</span>
            <span v-if="claim.fulfilled_at" class="profile-claim-card__fulfilled">Fulfilled: {{ formatClaimDate(claim.fulfilled_at) }}</span>
            <p v-else-if="claim.status === 'pending'" class="profile-claim-card__hint">Admin will fulfill your reward soon.</p>
          </article>
        </div>
      </div>
    </section>

    <!-- Top drink / snack / device -->
    <section class="profile-section" aria-label="Top picks">
      <div class="profile-section__inner">
        <h2 class="profile-section__title">Your top picks</h2>
        <p class="profile-section__desc">Highlight reel of what you love most.</p>
        <div class="top-picks-grid">
          <article
            v-for="(item, i) in topItems"
            :key="item.type"
            class="top-pick-card"
            :class="`top-pick-card--${item.variant}`"
            :style="{ '--delay': `${i * 0.1}s` }"
          >
            <div class="top-pick-card__glass"></div>
            <div class="top-pick-card__glow"></div>
            <div class="top-pick-card__icon-wrap">
              <span class="top-pick-card__icon">{{ item.icon }}</span>
            </div>
            <span class="top-pick-card__label">{{ item.label }}</span>
            <span class="top-pick-card__name">{{ item.name }}</span>
          </article>
        </div>
        <div class="favorites-row">
          <div class="favorite-chip">
            <span class="favorite-chip__icon">☕</span>
            <span>Favorite drink: {{ stats.favoriteDrink }}</span>
          </div>
          <div class="favorite-chip">
            <span class="favorite-chip__icon">🍕</span>
            <span>Favorite food: {{ stats.favoriteFood }}</span>
          </div>
          <div class="favorite-chip">
            <span class="favorite-chip__icon">🖥️</span>
            <span>Most used: {{ stats.mostUsedDevice }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Recommendations -->
    <section class="profile-section profile-section--recs" aria-label="Recommendations">
      <div class="profile-section__inner">
        <h2 class="profile-section__title">What to try next</h2>
        <p class="profile-section__desc">Fun suggestions based on your vibe.</p>
        <div class="recs-grid">
          <article
            v-for="(rec, i) in recommendations"
            :key="i"
            class="rec-card"
            :style="{ '--delay': `${i * 0.1}s` }"
          >
            <div class="rec-card__glass"></div>
            <div class="rec-card__glow"></div>
            <span class="rec-card__tag">{{ rec.tag }}</span>
            <p class="rec-card__text">{{ rec.text }}</p>
            <div class="rec-card__item">
              <span class="rec-card__item-icon">{{ rec.icon }}</span>
              <span class="rec-card__item-name">{{ rec.item }}</span>
            </div>
          </article>
        </div>
      </div>
    </section>

    <div class="profile-divider" aria-hidden="true"></div>

    <!-- My posts -->
    <ProfilePostsSection :is-logged-in="!!authStore.user?.id" />

    <div class="profile-divider" aria-hidden="true"></div>

    <!-- CTA -->
    <section class="profile-cta">
      <div class="profile-cta__inner">
        <p class="profile-cta__text">Keep playing, keep earning. See you at the café! 🎮</p>
      </div>
    </section>

    <Lightbox
      v-model="lightboxImageUrl"
      :alt="authStore.user?.name || 'Profile photo'"
      aria-label="Profile photo"
    />
  </div>
</template>

<style scoped>
/* ==============================================
   MY PROFILE – Futuristic, Gen Z, neon/glass
   ============================================== */
.profile-page {
  --neon-cyan: #00f5ff;
  --neon-magenta: #ff0080;
  --neon-purple: #a855f7;
  --neon-green: #00ff88;
  --neon-orange: #ff9f43;
  --fun-bg: #050508;
  position: relative;
  min-height: 100vh;
  background: var(--fun-bg);
  font-family: 'Outfit', var(--font-sans, sans-serif);
}

.profile-page__bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.profile-page__mesh {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 100% 60% at 20% 10%, rgba(0, 245, 255, 0.1) 0%, transparent 50%),
    radial-gradient(ellipse 80% 50% at 80% 80%, rgba(255, 0, 128, 0.08) 0%, transparent 50%),
    radial-gradient(ellipse 60% 40% at 50% 50%, rgba(168, 85, 247, 0.06) 0%, transparent 60%);
  animation: profileMeshPulse 12s ease-in-out infinite;
}

@keyframes profileMeshPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.85; }
}

.profile-page__grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(0, 245, 255, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 245, 255, 0.04) 1px, transparent 1px);
  background-size: 64px 64px;
  mask-image: linear-gradient(180deg, transparent 0%, black 15%, black 85%, transparent 100%);
  -webkit-mask-image: linear-gradient(180deg, transparent 0%, black 15%, black 85%, transparent 100%);
  animation: profileGridMove 20s linear infinite;
}

@keyframes profileGridMove {
  0% { transform: translate(0, 0); }
  100% { transform: translate(64px, 64px); }
}

.profile-page__glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.18;
  animation: profileGlowFloat 18s ease-in-out infinite;
}

.profile-page__glow--1 {
  width: 600px;
  height: 600px;
  background: rgba(0, 245, 255, 0.2);
  top: -20%;
  right: -15%;
  animation-delay: 0s;
}

.profile-page__glow--2 {
  width: 500px;
  height: 500px;
  background: rgba(255, 0, 128, 0.15);
  bottom: -25%;
  left: -10%;
  animation-delay: -9s;
}

.profile-page__glow--3 {
  width: 350px;
  height: 350px;
  background: rgba(168, 85, 247, 0.15);
  top: 50%;
  left: 50%;
  animation-delay: -4s;
}

@keyframes profileGlowFloat {
  0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.18; }
  33% { transform: translate(30px, -30px) scale(1.1); opacity: 0.25; }
  66% { transform: translate(-20px, 20px) scale(0.95); opacity: 0.12; }
}

/* Hero */
.profile-hero {
  position: relative;
  z-index: 1;
  padding: clamp(4rem, 10vw, 7rem) 1.5rem 3rem;
  text-align: center;
}

.profile-hero__inner {
  max-width: 720px;
  margin: 0 auto;
}

.profile-hero__avatar-wrap {
  margin-bottom: 1.25rem;
}

.profile-hero__avatar-frame {
  width: 120px;
  height: 120px;
  margin: 0 auto;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  border: 3px solid rgba(0, 245, 255, 0.4);
  box-shadow:
    0 0 32px -4px rgba(0, 245, 255, 0.35),
    inset 0 0 20px -4px rgba(0, 245, 255, 0.15);
  background: rgba(10, 10, 28, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease;
}

.profile-hero__avatar-frame:hover {
  border-color: rgba(0, 245, 255, 0.6);
  box-shadow: 0 0 40px -2px rgba(0, 245, 255, 0.45);
  transform: scale(1.03);
}

.profile-hero__avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-hero__avatar-initials {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--neon-cyan);
  text-shadow: 0 0 20px rgba(0, 245, 255, 0.5);
}

.profile-hero__badge {
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
  margin-bottom: 1rem;
  animation: profileBadgeBounce 3s ease-in-out infinite;
}

@keyframes profileBadgeBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

.profile-hero__title {
  font-size: clamp(2.25rem, 6vw, 3.5rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  background: linear-gradient(135deg, #fff 0%, var(--neon-cyan) 50%, var(--neon-magenta) 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 200% auto;
  animation: profileTitleShine 6s ease-in-out infinite;
  margin-bottom: 0.75rem;
}

@keyframes profileTitleShine {
  0%, 100% { background-position: 0% center; }
  50% { background-position: 100% center; }
}

.profile-hero__subtitle {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.75);
  line-height: 1.5;
  margin-bottom: 0.5rem;
}

.profile-hero__name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--neon-cyan);
  text-shadow: 0 0 20px rgba(0, 245, 255, 0.4);
}

.profile-divider {
  height: 1px;
  max-width: 1200px;
  margin: 0 auto;
  background: linear-gradient(90deg, transparent, rgba(0, 245, 255, 0.2), rgba(255, 0, 128, 0.15), transparent);
  opacity: 0.8;
  position: relative;
  z-index: 1;
}

/* Sections */
.profile-section {
  position: relative;
  z-index: 1;
  padding: clamp(2.5rem, 6vw, 4rem) 1.5rem;
}

.profile-section__inner {
  max-width: 1100px;
  margin: 0 auto;
}

.profile-section__title {
  font-size: clamp(1.5rem, 4vw, 2rem);
  font-weight: 800;
  color: #fff;
  margin-bottom: 0.35rem;
  letter-spacing: -0.02em;
}

.profile-section__desc {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.65);
  margin-bottom: 1.5rem;
}

/* Account section: futuristic button + reveal (ProfileView only) */
.profile-section--account .profile-section__inner {
  max-width: 720px;
}

.profile-account-toggle {
  text-align: center;
  padding: 0.5rem 0;
}

/* Futuristic / Gen Z style button */
.profile-account-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.75rem;
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(0, 245, 255, 0.35);
  border-radius: 16px;
  cursor: pointer;
  overflow: hidden;
  transition: transform 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease;
  font-family: inherit;
  letter-spacing: 0.02em;
  box-shadow: 0 0 28px -6px rgba(0, 245, 255, 0.3), inset 0 0 24px -12px rgba(168, 85, 247, 0.15);
}

.profile-account-btn:hover {
  transform: translateY(-3px) scale(1.02);
  border-color: rgba(0, 245, 255, 0.6);
  box-shadow: 0 0 40px -4px rgba(0, 245, 255, 0.4), 0 0 60px -12px rgba(168, 85, 247, 0.25), inset 0 0 32px -12px rgba(168, 85, 247, 0.2);
}

.profile-account-btn:active {
  transform: translateY(-1px) scale(1);
}

.profile-account-btn__glow {
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  background: radial-gradient(ellipse 80% 50% at 50% 0%, rgba(0, 245, 255, 0.2) 0%, transparent 60%);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.35s ease;
}

.profile-account-btn:hover .profile-account-btn__glow {
  opacity: 1;
}

.profile-account-btn__border {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--neon-cyan), var(--neon-purple), transparent);
  border-radius: 16px 16px 0 0;
  opacity: 0.6;
  transform: scaleX(0);
  transform-origin: center;
  transition: transform 0.4s ease;
}

.profile-account-btn:hover .profile-account-btn__border {
  transform: scaleX(1);
}

.profile-account-btn__icon {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: var(--neon-cyan);
  filter: drop-shadow(0 0 8px rgba(0, 245, 255, 0.5));
}

.profile-account-btn__icon svg {
  width: 100%;
  height: 100%;
}

.profile-account-btn__label {
  position: relative;
  z-index: 1;
}

.profile-account-btn__arrow {
  position: relative;
  z-index: 1;
  font-size: 1.25rem;
  color: var(--neon-cyan);
  transition: transform 0.3s ease;
}

.profile-account-btn:hover .profile-account-btn__arrow {
  transform: translateX(4px);
}

.profile-account-toggle__hint {
  margin-top: 0.6rem;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
}

/* Reveal section wrapper */
.profile-account-reveal {
  margin-top: 0.5rem;
}

.profile-account-reveal__header {
  position: relative;
  margin-bottom: 1rem;
}

.profile-account-reveal__header .profile-section__title {
  margin-bottom: 0.35rem;
}

.profile-account-reveal__header .profile-section__desc {
  margin-bottom: 0;
  padding-right: 2.5rem;
}

.profile-account-close {
  position: absolute;
  top: 0;
  right: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  line-height: 1;
  color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  cursor: pointer;
  transition: color 0.25s ease, background 0.25s ease, border-color 0.25s ease;
}

.profile-account-close:hover {
  color: var(--neon-cyan);
  background: rgba(0, 245, 255, 0.1);
  border-color: rgba(0, 245, 255, 0.3);
}

/* Transition: section appear on click */
.profile-account-reveal-enter-active,
.profile-account-reveal-leave-active {
  transition: opacity 0.4s ease, transform 0.4s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.profile-account-reveal-enter-from,
.profile-account-reveal-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

.profile-account-reveal-enter-to,
.profile-account-reveal-leave-from {
  opacity: 1;
  transform: translateY(0);
}

/* Account card: dashboard ProfileSection in glass card */
.profile-account-card {
  position: relative;
  padding: clamp(1.5rem, 4vw, 2rem);
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  box-shadow: 0 0 40px -12px rgba(0, 245, 255, 0.15);
  overflow: hidden;
}

.profile-account-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--neon-cyan), var(--neon-purple), transparent);
  opacity: 0.6;
}

/* Points loading / error */
.profile-points-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 2rem;
  color: rgba(255, 255, 255, 0.7);
}

.profile-points-loading--compact {
  padding: 1.25rem;
}

.profile-points-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(0, 245, 255, 0.2);
  border-top-color: var(--neon-cyan);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.profile-points-error {
  padding: 1rem 1.25rem;
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.35);
  border-radius: 12px;
  color: #fca5a5;
  margin: 0;
}

.profile-points-spinner--sm {
  width: 24px;
  height: 24px;
  border-width: 2px;
}

/* My Claims (claimed rewards) */
.profile-spin-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.profile-spin-error {
  padding: 1rem 1.25rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.25);
  border-radius: 12px;
  color: #fca5a5;
  font-size: 0.9rem;
}

.profile-spin-error p {
  margin: 0 0 0.5rem 0;
}

.profile-spin-retry {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
  cursor: pointer;
  font-size: 0.875rem;
}

.profile-spin-retry:hover {
  background: rgba(255, 255, 255, 0.12);
}

.profile-spin-empty {
  padding: 1.5rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.55);
  font-size: 0.95rem;
}

.profile-spin-empty p {
  margin: 0;
}

.profile-claims-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1rem;
}

.profile-claim-card {
  position: relative;
  padding: 1.25rem 1.25rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  overflow: hidden;
}

.profile-claim-card__glass {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(0, 245, 255, 0.03) 0%, transparent 50%);
  pointer-events: none;
}

.profile-claim-card__label {
  font-weight: 700;
  font-size: 1.05rem;
  color: rgba(255, 255, 255, 0.95);
}

.profile-claim-badge {
  display: inline-block;
  width: fit-content;
  padding: 0.3rem 0.65rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
}

.profile-claim-badge--success {
  background: rgba(34, 197, 94, 0.2);
  color: #86efac;
}

.profile-claim-badge--warning {
  background: rgba(234, 179, 8, 0.2);
  color: #fde047;
}

.profile-claim-badge--info {
  background: rgba(59, 130, 246, 0.2);
  color: #93c5fd;
}

.profile-claim-badge--muted {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
}

.profile-claim-card__meta,
.profile-claim-card__fulfilled {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.55);
}

.profile-claim-card__hint {
  margin: 0;
  font-size: 0.8rem;
  color: rgba(234, 179, 8, 0.9);
}

/* My Rank: three stat-tiles */
.profile-my-rank {
  position: relative;
  margin-top: 1.5rem;
}

.profile-my-rank__title {
  font-size: 1.1rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
  margin: 0 0 1rem;
}

.stats-overview--rank {
  margin-top: 0;
}

.profile-my-rank-loading {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.profile-my-rank-error {
  margin: 0;
  padding: 0.75rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.25);
  border-radius: 10px;
  color: #fca5a5;
  font-size: 0.9rem;
}

/* Stats overview tiles */
.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
}

.stat-tile {
  position: relative;
  padding: 1.25rem 1rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
  animation: profileReveal 0.7s cubic-bezier(0.34, 1.2, 0.64, 1) both;
  animation-delay: var(--delay, 0s);
}

.stat-tile:hover {
  transform: translateY(-6px);
  border-color: rgba(0, 245, 255, 0.25);
  box-shadow: 0 12px 32px -8px rgba(0, 0, 0, 0.4), 0 0 40px -10px rgba(0, 245, 255, 0.2);
}

.stat-tile__glow {
  position: absolute;
  top: -50%;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  height: 100%;
  background: radial-gradient(ellipse at center, rgba(0, 245, 255, 0.08) 0%, transparent 70%);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.stat-tile:hover .stat-tile__glow {
  opacity: 1;
}

.stat-tile__border {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--neon-cyan), transparent);
  opacity: 0.6;
  transform: scaleX(0);
  transform-origin: center;
  transition: transform 0.4s ease;
}

.stat-tile:hover .stat-tile__border {
  transform: scaleX(1);
}

.stat-tile__content {
  position: relative;
  z-index: 1;
  text-align: center;
}

.stat-tile__value {
  display: block;
  font-size: clamp(1.25rem, 3vw, 1.75rem);
  font-weight: 800;
  color: var(--neon-cyan);
  text-shadow: 0 0 24px rgba(0, 245, 255, 0.35);
  margin-bottom: 0.15rem;
}

.stat-tile__sub {
  display: block;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.75);
  margin-bottom: 0.15rem;
}

.stat-tile__label {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
}

/* Progress bar */
.profile-section--progress .profile-section__inner {
  max-width: 560px;
}

.rank-bar-wrap {
  animation: profileReveal 0.8s cubic-bezier(0.34, 1.2, 0.64, 1) both;
}

.rank-bar {
  position: relative;
  height: 14px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 999px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.rank-bar__fill {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  background: linear-gradient(90deg, var(--neon-cyan), var(--neon-purple));
  border-radius: 999px;
  transition: width 1s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.rank-bar__glow {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  background: linear-gradient(90deg, rgba(0, 245, 255, 0.5), rgba(168, 85, 247, 0.5));
  border-radius: 999px;
  filter: blur(8px);
  opacity: 0.7;
  transition: width 1s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.rank-badges {
  display: flex;
  justify-content: space-between;
  margin-top: 0.75rem;
}

.rank-badge {
  font-size: 0.85rem;
  font-weight: 700;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.rank-badge:hover {
  transform: scale(1.05);
}

.rank-badge--current {
  color: var(--neon-cyan);
  background: rgba(0, 245, 255, 0.12);
  border: 1px solid rgba(0, 245, 255, 0.35);
  box-shadow: 0 0 20px -4px rgba(0, 245, 255, 0.3);
}

.rank-badge--next {
  color: var(--neon-magenta);
  background: rgba(255, 0, 128, 0.1);
  border: 1px solid rgba(255, 0, 128, 0.3);
}

/* Top picks cards */
.top-picks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1.25rem;
  margin-bottom: 1.5rem;
}

.top-pick-card {
  position: relative;
  padding: 1.5rem 1.25rem;
  border-radius: 20px;
  overflow: hidden;
  text-align: center;
  transition: transform 0.35s ease, box-shadow 0.35s ease;
  animation: profileReveal 0.7s cubic-bezier(0.34, 1.2, 0.64, 1) both;
  animation-delay: var(--delay, 0s);
}

.top-pick-card:hover {
  transform: translateY(-8px) scale(1.02);
}

.top-pick-card__glass {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.top-pick-card:hover .top-pick-card__glass {
  background: rgba(255, 255, 255, 0.07);
  border-color: rgba(255, 255, 255, 0.15);
}

.top-pick-card__glow {
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  opacity: 0;
  transition: opacity 0.35s ease;
  pointer-events: none;
}

.top-pick-card--cyan:hover .top-pick-card__glow {
  opacity: 1;
  box-shadow: inset 0 0 40px -8px rgba(0, 245, 255, 0.3);
}

.top-pick-card--orange:hover .top-pick-card__glow {
  opacity: 1;
  box-shadow: inset 0 0 40px -8px rgba(255, 159, 67, 0.3);
}

.top-pick-card--purple:hover .top-pick-card__glow {
  opacity: 1;
  box-shadow: inset 0 0 40px -8px rgba(168, 85, 247, 0.3);
}

.top-pick-card__icon-wrap {
  position: relative;
  z-index: 1;
  width: 56px;
  height: 56px;
  margin: 0 auto 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.06);
  transition: transform 0.3s ease;
}

.top-pick-card:hover .top-pick-card__icon-wrap {
  transform: scale(1.1);
}

.top-pick-card__icon {
  font-size: 1.75rem;
}

.top-pick-card__label {
  display: block;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.55);
  margin-bottom: 0.25rem;
}

.top-pick-card__name {
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
}

.top-pick-card--cyan .top-pick-card__name { color: var(--neon-cyan); text-shadow: 0 0 20px rgba(0, 245, 255, 0.3); }
.top-pick-card--orange .top-pick-card__name { color: var(--neon-orange); }
.top-pick-card--purple .top-pick-card__name { color: var(--neon-purple); text-shadow: 0 0 20px rgba(168, 85, 247, 0.3); }

/* Favorites row */
.favorites-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
}

.favorite-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.85);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  transition: border-color 0.25s ease, box-shadow 0.25s ease;
}

.favorite-chip:hover {
  border-color: rgba(0, 245, 255, 0.25);
  box-shadow: 0 0 20px -4px rgba(0, 245, 255, 0.15);
}

.favorite-chip__icon {
  font-size: 1.1rem;
}

/* Recommendations */
.profile-section--recs .recs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.25rem;
}

.rec-card {
  position: relative;
  padding: 1.5rem;
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: transform 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease;
  animation: profileReveal 0.75s cubic-bezier(0.34, 1.2, 0.64, 1) both;
  animation-delay: var(--delay, 0s);
}

.rec-card:hover {
  transform: translateY(-6px);
  border-color: rgba(255, 0, 128, 0.2);
  box-shadow: 0 16px 40px -12px rgba(0, 0, 0, 0.4), 0 0 30px -8px rgba(255, 0, 128, 0.15);
}

.rec-card__glass {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.rec-card__glow {
  position: absolute;
  top: -50%;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  height: 100%;
  background: radial-gradient(ellipse at center, rgba(255, 0, 128, 0.08) 0%, transparent 70%);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.35s ease;
}

.rec-card:hover .rec-card__glow {
  opacity: 1;
}

.rec-card__tag {
  position: relative;
  z-index: 1;
  display: inline-block;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--neon-magenta);
  margin-bottom: 0.5rem;
}

.rec-card__text {
  position: relative;
  z-index: 1;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 0.75rem;
  line-height: 1.45;
}

.rec-card__item {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.75rem;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.rec-card__item-icon {
  font-size: 1.25rem;
}

.rec-card__item-name {
  font-weight: 700;
  color: #fff;
}

/* CTA */
.profile-cta {
  position: relative;
  z-index: 1;
  padding: 3rem 1.5rem;
  text-align: center;
}

.profile-cta__inner {
  max-width: 560px;
  margin: 0 auto;
}

.profile-cta__text {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.75);
  font-weight: 500;
}

/* Reveal animation */
@keyframes profileReveal {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .stats-overview {
    grid-template-columns: repeat(2, 1fr);
  }

  .top-picks-grid {
    grid-template-columns: 1fr;
  }

  .favorites-row {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
