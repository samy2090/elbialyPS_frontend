<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { postsApi } from '@/api/posts'
import UserService from '@/api/users.js'
import PostComposer from './PostComposer.vue'
import PostCard from './PostCard.vue'
import AuthRequiredModal from '@/components/base/ui/AuthRequiredModal.vue'

const authStore = useAuthStore()

const PER_PAGE = 5
const SORT_OPTIONS = [
  { value: 'newest', label: 'Recent' },
  { value: 'most_reacted', label: 'Most reacted' },
  { value: 'most_commented', label: 'Most commented' },
]

const posts = ref([])
const meta = ref({ next_cursor: null, has_more: false })
const loading = ref(false)
const loadingMore = ref(false)
const sort = ref('newest')
const authorId = ref(null)
const authorSearchQuery = ref('')
const authorSearchResults = ref([])
const authorSearchOpen = ref(false)
const authorSearchLoading = ref(false)
const selectedAuthor = ref(null)
const showAuthModal = ref(false)
const feedError = ref(null)
const showComposer = ref(false)

const isLoggedIn = computed(() => authStore.isAuthenticated)

let authorSearchDebounce = null
watch(authorSearchQuery, (q) => {
  clearTimeout(authorSearchDebounce)
  if (!q || q.trim().length < 2) {
    authorSearchResults.value = []
    authorSearchOpen.value = false
    return
  }
  authorSearchDebounce = setTimeout(() => {
    authorSearchLoading.value = true
    UserService.searchUsers(q.trim())
      .then((list) => {
        authorSearchResults.value = list
        authorSearchOpen.value = true
      })
      .finally(() => { authorSearchLoading.value = false })
  }, 300)
})

function loadFeed(cursor = null, append = false) {
  if (cursor === null && !append) loading.value = true
  else loadingMore.value = true
  feedError.value = null
  const params = { sort: sort.value, per_page: PER_PAGE }
  if (authorId.value != null) params.author_id = authorId.value
  if (cursor != null) params.cursor = cursor

  postsApi
    .getFeed(params)
    .then(({ data, meta: m }) => {
      if (append) {
        posts.value = [...posts.value, ...data]
      } else {
        posts.value = data ?? []
      }
      meta.value = m ?? { next_cursor: null, has_more: false }
    })
    .catch((e) => {
      feedError.value = e?.response?.data?.message || e?.message || 'Could not load feed'
      if (!append) posts.value = []
    })
    .finally(() => {
      loading.value = false
      loadingMore.value = false
    })
}

function setSort(s) {
  sort.value = s
  loadFeed()
}

function selectAuthor(u) {
  selectedAuthor.value = u
  authorId.value = u?.id ?? null
  authorSearchQuery.value = ''
  authorSearchOpen.value = false
  loadFeed()
}

function clearAuthor() {
  selectedAuthor.value = null
  authorId.value = null
  loadFeed()
}

function onPostCreated(created) {
  if (created) posts.value = [created, ...posts.value]
  else loadFeed()
}

function onPostUpdated(updated) {
  if (!updated?.id) return
  const i = posts.value.findIndex((p) => p.id === updated.id)
  if (i === -1) return
  const prev = posts.value[i]
  const next = { ...prev, ...updated }
  if (updated.reaction_counts !== undefined) {
    next.reaction_counts = typeof updated.reaction_counts === 'object' && updated.reaction_counts !== null
      ? { ...updated.reaction_counts }
      : {}
  }
  if (updated.reactions_count !== undefined) {
    next.reactions_count = Number(updated.reactions_count) || 0
  }
  posts.value = [...posts.value.slice(0, i), next, ...posts.value.slice(i + 1)]
}

function onRequireAuth() {
  showAuthModal.value = true
}

let scrollObserver = null

function setupInfiniteScroll() {
  const sentinel = document.querySelector('.posts-feed__sentinel')
  if (!sentinel) return
  scrollObserver = new IntersectionObserver(
    (entries) => {
      const e = entries[0]
      if (!e?.isIntersecting || loading.value || loadingMore.value || !meta.value.has_more) return
      loadFeed(meta.value.next_cursor, true)
    },
    { rootMargin: '200px', threshold: 0 }
  )
  scrollObserver.observe(sentinel)
}

watch(
  () => posts.value.length,
  (len) => {
    if (len > 0 && !scrollObserver) nextTick(setupInfiniteScroll)
  },
  { immediate: true }
)

onMounted(() => {
  loadFeed()
})

onBeforeUnmount(() => {
  if (scrollObserver) scrollObserver.disconnect()
})
</script>

<template>
  <section class="posts-feed" aria-label="Posts feed">
    <div class="posts-feed__inner">
      <h2 class="posts-feed__title">Feed</h2>
      <p class="posts-feed__desc">Share and see what’s happening.</p>

      <!-- Composer: hidden by default; show when user clicks "Add new post" -->
      <div class="posts-feed__composer-wrap">
        <button
          v-if="!showComposer"
          type="button"
          class="posts-feed__add-post-btn"
          @click="showComposer = true"
        >
          Add new post
        </button>
        <Transition name="posts-feed-composer">
            <div v-if="showComposer" class="posts-feed__composer-open">
            <PostComposer
              :is-logged-in="isLoggedIn"
              @created="onPostCreated"
              @require-auth="onRequireAuth"
            />
            <button type="button" class="posts-feed__composer-cancel" @click="showComposer = false">
              Cancel
            </button>
          </div>
        </Transition>
      </div>

      <!-- Sort + Author filter -->
      <div class="posts-feed__toolbar">
        <div class="posts-feed__sort">
          <button
            v-for="opt in SORT_OPTIONS"
            :key="opt.value"
            type="button"
            class="posts-feed__sort-btn"
            :class="{ active: sort === opt.value }"
            @click="setSort(opt.value)"
          >
            {{ opt.label }}
          </button>
        </div>
        <div class="posts-feed__author-filter">
          <div v-if="selectedAuthor" class="posts-feed__author-chip">
            <span>{{ selectedAuthor.name || selectedAuthor.username }}</span>
            <button type="button" aria-label="Clear filter" @click="clearAuthor">×</button>
          </div>
          <div v-else class="posts-feed__author-search-wrap">
            <input
              v-model="authorSearchQuery"
              type="text"
              class="posts-feed__author-input"
              placeholder="Search by author..."
              autocomplete="off"
              @focus="authorSearchOpen = authorSearchResults.length > 0"
            />
            <div v-if="authorSearchOpen && (authorSearchResults.length || authorSearchLoading)" class="posts-feed__author-dropdown">
              <div v-if="authorSearchLoading" class="posts-feed__author-loading">Searching…</div>
              <button
                v-for="u in authorSearchResults"
                :key="u.id"
                type="button"
                class="posts-feed__author-option"
                @click="selectAuthor(u)"
              >
                {{ u.name || u.username }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="loading" class="posts-feed__loading">
        <div class="posts-feed__spinner" aria-hidden="true"></div>
        <p>Loading feed…</p>
      </div>
      <p v-else-if="feedError" class="posts-feed__error">{{ feedError }}</p>
      <div v-else-if="!posts.length" class="posts-feed__empty">
        <p>No posts yet. Be the first to post!</p>
      </div>
      <template v-else>
        <div class="posts-feed__list">
          <PostCard
            v-for="post in posts"
            :key="post.id"
            :post="post"
            :is-logged-in="isLoggedIn"
            :show-edit-delete="false"
            @require-auth="onRequireAuth"
            @updated="onPostUpdated($event)"
          />
        </div>
        <div class="posts-feed__sentinel" aria-hidden="true"></div>
        <div v-if="loadingMore" class="posts-feed__loading-more">
          <div class="posts-feed__spinner posts-feed__spinner--sm" aria-hidden="true"></div>
          <span>Loading more…</span>
        </div>
      </template>
    </div>

    <AuthRequiredModal v-if="showAuthModal" @close="showAuthModal = false" />
  </section>
</template>

<style scoped>
.posts-feed {
  position: relative;
  z-index: 1;
  padding: clamp(2.5rem, 6vw, 4rem) 1.5rem;
}

.posts-feed__inner {
  max-width: 640px;
  margin: 0 auto;
  width: 100%;
  min-width: 0;
}

.posts-feed__title {
  font-size: clamp(1.5rem, 4vw, 2rem);
  font-weight: 800;
  color: #fff;
  margin-bottom: 0.25rem;
}

.posts-feed__desc {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.65);
  margin-bottom: 1.5rem;
}

.posts-feed__composer-wrap {
  margin-bottom: 1.5rem;
}

.posts-feed__add-post-btn {
  width: 100%;
  min-height: 52px;
  padding: 0.75rem 1.25rem;
  font-size: 1rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

.posts-feed__add-post-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(0, 245, 255, 0.25);
  color: #00f5ff;
}

.posts-feed__composer-open {
  position: relative;
}

.posts-feed__composer-cancel {
  margin-top: 0.75rem;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.posts-feed__composer-cancel:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.25);
}

.posts-feed-composer-enter-active,
.posts-feed-composer-leave-active {
  transition: opacity 0.25s ease, transform 0.2s ease;
}

.posts-feed-composer-enter-from,
.posts-feed-composer-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.posts-feed__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

@media (max-width: 600px) {
  .posts-feed__toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  .posts-feed__sort {
    width: 100%;
  }
}

.posts-feed__sort {
  display: flex;
  flex-shrink: 0;
  gap: 0.25rem;
  padding: 3px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  width: 100%;
  max-width: 340px;
}

.posts-feed__sort-btn {
  flex: 1;
  min-width: 0;
  min-height: 38px;
  padding: 0.35rem 0.4rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.posts-feed__sort-btn:hover {
  color: rgba(255, 255, 255, 0.9);
}

.posts-feed__sort-btn.active {
  color: #00f5ff;
  background: rgba(0, 245, 255, 0.12);
  box-shadow: 0 0 12px rgba(0, 245, 255, 0.2);
}

.posts-feed__author-filter {
  flex: 1;
  min-width: 0;
  position: relative;
}

.posts-feed__author-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: rgba(0, 245, 255, 0.12);
  border: 1px solid rgba(0, 245, 255, 0.25);
  border-radius: 12px;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.9);
}

.posts-feed__author-chip button {
  padding: 0 0.25rem;
  font-size: 1.1rem;
  line-height: 1;
  color: rgba(255, 255, 255, 0.7);
  background: none;
  border: none;
  cursor: pointer;
}

.posts-feed__author-search-wrap {
  position: relative;
}

.posts-feed__author-input {
  width: 100%;
  min-height: 44px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  color: #fff;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  outline: none;
}

.posts-feed__author-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.posts-feed__author-dropdown {
  position: absolute;
  left: 0;
  right: 0;
  top: 100%;
  margin-top: 4px;
  max-height: 180px;
  overflow-y: auto;
  background: rgba(15, 20, 35, 0.98);
  border: 1px solid rgba(0, 245, 255, 0.2);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  z-index: 10;
}

.posts-feed__author-loading {
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
}

.posts-feed__author-option {
  display: block;
  width: 100%;
  padding: 0.6rem 1rem;
  font-size: 0.95rem;
  color: #fff;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background 0.2s ease;
}

.posts-feed__author-option:hover {
  background: rgba(255, 255, 255, 0.06);
}

.posts-feed__list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.posts-feed__sentinel {
  height: 1px;
  visibility: hidden;
  pointer-events: none;
}

.posts-feed__loading,
.posts-feed__loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 2rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.95rem;
}

.posts-feed__loading-more {
  padding: 1rem;
}

.posts-feed__spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(0, 245, 255, 0.2);
  border-top-color: #00f5ff;
  border-radius: 50%;
  animation: postsFeedSpin 0.8s linear infinite;
}

.posts-feed__spinner--sm {
  width: 24px;
  height: 24px;
  border-width: 2px;
}

@keyframes postsFeedSpin {
  to { transform: rotate(360deg); }
}

.posts-feed__error {
  padding: 1rem 1.25rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 12px;
  color: #fca5a5;
  margin: 0;
}

.posts-feed__empty {
  padding: 2rem 1rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  font-size: 1rem;
}
</style>
