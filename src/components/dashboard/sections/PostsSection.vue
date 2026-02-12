<template>
  <div class="posts-section">
    <div class="posts-header">
      <div class="header-info">
        <h1 class="section-title">Posts (Feed)</h1>
        <p class="section-subtitle">Manage feed settings, approve pending posts, and moderate comments</p>
      </div>
    </div>

    <!-- Toast -->
    <div v-if="toastMessage" class="posts-toast" :class="toastType">
      {{ toastMessage }}
    </div>

    <!-- Tabs -->
    <div class="posts-tabs">
      <button
        v-for="t in tabs"
        :key="t.id"
        type="button"
        :class="['tab-btn', { active: activeTab === t.id }]"
        @click="activeTab = t.id"
      >
        {{ t.label }}
      </button>
    </div>

    <!-- Posts require approval toggle (show on Pending or when no tab content) -->
    <div v-if="activeTab === 'pending'" class="posts-settings-block">
      <div class="setting-row">
        <div class="setting-info">
          <label class="setting-label">Posts require approval</label>
          <p class="setting-desc">When enabled, new posts need admin approval before they appear on the public feed.</p>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" v-model="postsRequireApproval" :disabled="settingsLoading" @change="onToggleApproval" />
          <span class="toggle-slider"></span>
        </label>
      </div>
      <p v-if="settingsError" class="settings-error">{{ settingsError }}</p>
    </div>

    <!-- Tab: Pending posts -->
    <div v-show="activeTab === 'pending'" class="pending-block">
      <h2 class="pending-title">Pending posts</h2>
      <p class="pending-subtitle">Posts awaiting approval</p>

      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading pending posts…</p>
      </div>

      <div v-else-if="fetchError" class="error-state">
        <p>{{ fetchError }}</p>
        <button type="button" class="action-btn secondary" @click="loadPending">Retry</button>
      </div>

      <div v-else-if="!posts.length" class="empty-state">
        <p>No pending posts.</p>
      </div>

      <template v-else>
        <div class="posts-list">
          <article
            v-for="post in posts"
            :key="post.id"
            class="post-card"
          >
            <div class="post-card-header">
              <div class="author">
                <img
                  v-if="post.user?.avatar_url"
                  :src="post.user.avatar_url"
                  :alt="post.user.name"
                  class="author-avatar"
                />
                <span v-else class="author-avatar placeholder">{{ authorInitials(post.user) }}</span>
                <div class="author-info">
                  <span class="author-name">{{ post.user?.name || 'Unknown' }}</span>
                  <span class="author-username">@{{ post.user?.username || '—' }}</span>
                </div>
              </div>
              <time class="post-date" :datetime="post.created_at">{{ formatDate(post.created_at) }}</time>
            </div>
            <div class="post-body">
              <p v-if="expandedId !== post.id" class="post-text">{{ truncatedBody(post) }}</p>
              <p v-else class="post-text full">{{ post.body || '' }}</p>
              <button
                v-if="post.body && post.body.length > 200"
                type="button"
                class="read-more-btn"
                @click="toggleExpand(post.id)"
              >
                {{ expandedId === post.id ? 'Show less' : 'Read more' }}
              </button>
            </div>
            <div v-if="post.tagged_users?.length" class="post-tagged">
              Tagged: <span v-for="(u, i) in post.tagged_users" :key="u.id">
                @{{ u.username }}<template v-if="i < post.tagged_users.length - 1">, </template>
              </span>
            </div>
            <div v-if="post.media?.length" class="post-media">
              <a
                v-for="m in post.media.slice(0, 4)"
                :key="m.id"
                :href="m.url"
                target="_blank"
                rel="noopener noreferrer"
                class="media-thumb"
              >
                <img :src="m.url" :alt="'Attachment'" />
              </a>
              <span v-if="post.media.length > 4" class="media-more">+{{ post.media.length - 4 }}</span>
            </div>
            <div class="post-actions">
              <button type="button" class="action-btn secondary" @click="openCommentsModal(post)">View comments</button>
              <button
                type="button"
                class="action-btn primary"
                :disabled="actioningId === post.id"
                @click="approvePost(post)"
              >
                <span v-if="actioningId === post.id" class="btn-spinner"></span>
                <span v-else>Approve</span>
              </button>
              <button
                type="button"
                class="action-btn danger"
                :disabled="actioningId === post.id"
                @click="confirmReject(post)"
              >
                <span v-if="actioningId === post.id" class="btn-spinner"></span>
                <span v-else>Reject</span>
              </button>
            </div>
          </article>
        </div>

        <div v-if="meta.last_page > 1" class="pagination">
          <button
            type="button"
            class="pagination-btn"
            :disabled="meta.current_page <= 1"
            @click="goToPage(meta.current_page - 1)"
          >
            Previous
          </button>
          <span class="pagination-info">Page {{ meta.current_page }} of {{ meta.last_page }}</span>
          <button
            type="button"
            class="pagination-btn"
            :disabled="meta.current_page >= meta.last_page"
            @click="goToPage(meta.current_page + 1)"
          >
            Next
          </button>
        </div>
      </template>
    </div>

    <!-- Tab: All posts -->
    <div v-show="activeTab === 'all'" class="all-posts-block">
      <h2 class="pending-title">All posts</h2>
      <p class="pending-subtitle">Filter and view all posts</p>
      <div class="filters-row">
        <div class="filter-group">
          <label class="filter-label">Status</label>
          <CustomDropdown
            v-model="allPostsFilters.status"
            :options="allPostsStatusOptions"
            option-value="value"
            option-label="label"
            placeholder="All statuses"
            :show-placeholder-in-menu="false"
          />
        </div>
        <div class="filter-group">
          <label class="filter-label">User</label>
          <div class="user-search-wrapper">
            <input
              v-model="allPostsUserSearchQuery"
              @input="handleAllPostsUserSearch"
              @focus="showAllPostsUserDropdown = true"
              @blur="handleAllPostsUserBlur"
              type="text"
              class="filter-input user-search-input"
              placeholder="Type to search users..."
              autocomplete="off"
            />
            <div v-if="allPostsUserSearchLoading" class="search-loading-inline">
              <div class="loading-spinner small"></div>
            </div>
            <div
              v-if="showAllPostsUserDropdown && (allPostsUserSearchResults.length || allPostsUserSearchQuery.length)"
              class="user-dropdown"
            >
              <div v-if="allPostsUserSearchLoading" class="dropdown-item loading-item">
                <div class="loading-spinner small"></div>
                <span>Searching…</span>
              </div>
              <div
                v-else-if="!allPostsUserSearchResults.length && allPostsUserSearchQuery.trim().length"
                class="dropdown-item no-results"
              >
                No users found
              </div>
              <div
                v-for="u in allPostsUserSearchResults"
                :key="u.id"
                class="dropdown-item"
                :class="{ selected: allPostsFilters.user_id === u.id }"
                @mousedown.prevent="selectAllPostsUser(u)"
              >
                <div class="user-option">
                  <span class="user-name">{{ u.name }}</span>
                  <span class="user-username">@{{ u.username }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="filter-group filter-group--date">
          <label class="filter-label">Date range</label>
          <DateRangePicker
            v-model="allPostsDateRange"
            placeholder="Select date range"
            title="Filter by date"
            class="filter-date-picker"
            :auto-apply="true"
            :allow-mode-toggle="true"
            default-mode="range"
          />
        </div>
        <button type="button" class="action-btn primary filters-apply-btn" @click="applyAllPostsFilters">Apply</button>
      </div>
      <div v-if="allPostsLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading posts…</p>
      </div>
      <div v-else-if="allPostsError" class="error-state">
        <p>{{ allPostsError }}</p>
        <button type="button" class="action-btn secondary" @click="loadAllPosts">Retry</button>
      </div>
      <div v-else-if="!allPostsList.length" class="empty-state">
        <p>No posts found.</p>
      </div>
      <template v-else>
        <div class="posts-list">
          <article v-for="post in allPostsList" :key="post.id" class="post-card">
            <div class="post-card-header">
              <div class="author">
                <img v-if="post.user?.avatar_url" :src="post.user.avatar_url" :alt="post.user.name" class="author-avatar" />
                <span v-else class="author-avatar placeholder">{{ authorInitials(post.user) }}</span>
                <div class="author-info">
                  <span class="author-name">{{ post.user?.name || 'Unknown' }}</span>
                  <span class="author-username">@{{ post.user?.username || '—' }}</span>
                </div>
              </div>
              <div class="post-header-right">
                <span class="status-badge" :class="post.status">{{ post.status }}</span>
                <time class="post-date" :datetime="post.created_at">{{ formatDate(post.created_at) }}</time>
              </div>
            </div>
            <div class="post-body">
              <p v-if="expandedAllId !== post.id" class="post-text">{{ truncateBody(post.body, 200) }}</p>
              <p v-else class="post-text full">{{ post.body || '' }}</p>
              <button v-if="post.body && post.body.length > 200" type="button" class="read-more-btn" @click="expandedAllId = expandedAllId === post.id ? null : post.id">
                {{ expandedAllId === post.id ? 'Show less' : 'Read more' }}
              </button>
            </div>
            <div v-if="post.tagged_users?.length" class="post-tagged">
              Tagged: <span v-for="(u, i) in post.tagged_users" :key="u.id">@{{ u.username }}<template v-if="i < post.tagged_users.length - 1">, </template></span>
            </div>
            <div v-if="post.media?.length" class="post-media">
              <a v-for="m in post.media.slice(0, 4)" :key="m.id" :href="m.url" target="_blank" rel="noopener noreferrer" class="media-thumb">
                <img :src="m.url" :alt="'Attachment'" />
              </a>
              <span v-if="post.media.length > 4" class="media-more">+{{ post.media.length - 4 }}</span>
            </div>
            <div class="post-actions">
              <button type="button" class="action-btn secondary" @click="openCommentsModal(post)">View comments</button>
              <button
                type="button"
                class="action-btn secondary"
                @click="openEditPost(post)"
              >
                Edit post
              </button>
              <button
                type="button"
                class="action-btn danger"
                :disabled="deletingPostId === post.id"
                @click="confirmDeletePost(post)"
              >
                Delete post
              </button>
            </div>
          </article>
        </div>
        <div v-if="allPostsMeta.last_page > 1" class="pagination">
          <button type="button" class="pagination-btn" :disabled="allPostsMeta.current_page <= 1" @click="goToAllPostsPage(allPostsMeta.current_page - 1)">Previous</button>
          <span class="pagination-info">Page {{ allPostsMeta.current_page }} of {{ allPostsMeta.last_page }}</span>
          <button type="button" class="pagination-btn" :disabled="allPostsMeta.current_page >= allPostsMeta.last_page" @click="goToAllPostsPage(allPostsMeta.current_page + 1)">Next</button>
        </div>
      </template>
    </div>

    <!-- Tab: All comments -->
    <div v-show="activeTab === 'comments'" class="all-comments-block">
      <h2 class="pending-title">All comments</h2>
      <p class="pending-subtitle">Filter and view all comments</p>
      <div class="filters-row">
        <div class="filter-group">
          <label class="filter-label">User</label>
          <div class="user-search-wrapper">
            <input
              v-model="commentsUserSearchQuery"
              @input="handleCommentsUserSearch"
              @focus="showCommentsUserDropdown = true"
              @blur="handleCommentsUserBlur"
              type="text"
              class="filter-input user-search-input"
              placeholder="Type to search users..."
              autocomplete="off"
            />
            <div v-if="commentsUserSearchLoading" class="search-loading-inline">
              <div class="loading-spinner small"></div>
            </div>
            <div
              v-if="showCommentsUserDropdown && (commentsUserSearchResults.length || commentsUserSearchQuery.length)"
              class="user-dropdown"
            >
              <div v-if="commentsUserSearchLoading" class="dropdown-item loading-item">
                <div class="loading-spinner small"></div>
                <span>Searching…</span>
              </div>
              <div
                v-else-if="!commentsUserSearchResults.length && commentsUserSearchQuery.trim().length"
                class="dropdown-item no-results"
              >
                No users found
              </div>
              <div
                v-for="u in commentsUserSearchResults"
                :key="u.id"
                class="dropdown-item"
                :class="{ selected: commentsFilters.user_id === u.id }"
                @mousedown.prevent="selectCommentsUser(u)"
              >
                <div class="user-option">
                  <span class="user-name">{{ u.name }}</span>
                  <span class="user-username">@{{ u.username }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="filter-group">
          <label class="filter-label">Post ID</label>
          <input v-model.number="commentsFilters.post_id" type="number" min="1" placeholder="Post ID" class="filter-input narrow" />
        </div>
        <div class="filter-group filter-group--date">
          <label class="filter-label">Date range</label>
          <DateRangePicker
            v-model="commentsDateRange"
            placeholder="Select date range"
            title="Filter comments by date"
            class="filter-date-picker"
            :auto-apply="true"
            :allow-mode-toggle="true"
            default-mode="range"
          />
        </div>
        <button type="button" class="action-btn primary filters-apply-btn" @click="applyCommentsFilters">Apply</button>
      </div>
      <div v-if="commentsLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading comments…</p>
      </div>
      <div v-else-if="commentsError" class="error-state">
        <p>{{ commentsError }}</p>
        <button type="button" class="action-btn secondary" @click="loadAllComments">Retry</button>
      </div>
      <div v-else-if="!commentsList.length" class="empty-state">
        <p>No comments found.</p>
      </div>
      <template v-else>
        <!-- Desktop table -->
        <div class="comments-table-wrap desktop-only">
          <table class="comments-table">
            <thead>
              <tr>
                <th>Author</th>
                <th>Comment</th>
                <th>Post</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in commentsList" :key="c.id">
                <td>
                  <span class="comment-author-cell">{{ c.user?.name || '—' }} @{{ c.user?.username || '—' }}</span>
                </td>
                <td><span class="comment-body-cell">{{ truncateBody(c.body, 80) }}</span></td>
                <td>#{{ c.post_id }} <span v-if="c.post?.body" class="post-excerpt">{{ truncateBody(c.post.body, 40) }}</span></td>
                <td>{{ formatDate(c.created_at) }}</td>
                <td>
                  <button
                    type="button"
                    class="action-btn danger"
                    :disabled="deletingCommentId === c.id"
                    @click="confirmDeleteComment(c)"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile cards -->
        <div class="comments-cards mobile-only">
          <article
            v-for="c in commentsList"
            :key="c.id"
            class="comment-card"
          >
            <div class="comment-card-header">
              <div class="comment-card-author">
                <div class="comment-avatar">
                  <span>{{ authorInitials(c.user) }}</span>
                </div>
                <div class="comment-author-info">
                  <span class="comment-author-name">{{ c.user?.name || '—' }}</span>
                  <span class="comment-author-username">@{{ c.user?.username || '—' }}</span>
                </div>
              </div>
              <time class="comment-card-date" :datetime="c.created_at">
                {{ formatDate(c.created_at) }}
              </time>
            </div>
            <div class="comment-card-body">
              <p class="comment-card-text">
                {{ truncateBody(c.body, 120) }}
              </p>
            </div>
            <div class="comment-card-meta">
              <span class="comment-card-post-label">Post #{{ c.post_id }}</span>
              <span v-if="c.post?.body" class="comment-card-post-excerpt">
                {{ truncateBody(c.post.body, 60) }}
              </span>
            </div>
            <div class="comment-card-actions">
              <button
                type="button"
                class="comment-card-btn danger"
                :disabled="deletingCommentId === c.id"
                @click="confirmDeleteComment(c)"
              >
                Delete comment
              </button>
            </div>
          </article>
        </div>

        <div v-if="commentsMeta.last_page > 1" class="pagination">
          <button type="button" class="pagination-btn" :disabled="commentsMeta.current_page <= 1" @click="goToCommentsPage(commentsMeta.current_page - 1)">Previous</button>
          <span class="pagination-info">Page {{ commentsMeta.current_page }} of {{ commentsMeta.last_page }}</span>
          <button type="button" class="pagination-btn" :disabled="commentsMeta.current_page >= commentsMeta.last_page" @click="goToCommentsPage(commentsMeta.current_page + 1)">Next</button>
        </div>
      </template>
    </div>

    <!-- Delete comment confirm modal -->
    <div v-if="deleteCommentTarget" class="modal-overlay" @click.self="deleteCommentTarget = null">
      <div class="modal-box">
        <h3 class="modal-title">Delete comment</h3>
        <p class="modal-text">Delete this comment? This action cannot be undone.</p>
        <div class="modal-actions">
          <button type="button" class="action-btn secondary" @click="deleteCommentTarget = null">Cancel</button>
          <button
            type="button"
            class="action-btn danger"
            :disabled="deletingCommentId === deleteCommentTarget?.id"
            @click="deleteCommentConfirm"
          >
            Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Delete post confirm modal (All posts tab) -->
    <div v-if="deletePostTarget" class="modal-overlay" @click.self="deletePostTarget = null">
      <div class="modal-box">
        <h3 class="modal-title">Delete post</h3>
        <p class="modal-text">Delete this post? This action cannot be undone.</p>
        <div class="modal-actions">
          <button type="button" class="action-btn secondary" @click="deletePostTarget = null">Cancel</button>
          <button
            type="button"
            class="action-btn danger"
            :disabled="deletingPostId === deletePostTarget?.id"
            @click="deletePostConfirm"
          >
            Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Edit post modal -->
    <div v-if="editPostModalVisible" class="modal-overlay" @click.self="closeEditPostModal">
      <div class="modal-box">
        <h3 class="modal-title">Edit post</h3>
        <div class="modal-text">
          Update the post text. Media and tagged users stay the same.
        </div>
        <div class="modal-body edit-post-body">
          <textarea
            v-model="editPostBody"
            class="edit-post-textarea"
            rows="6"
            placeholder="Post content"
          />
        </div>
        <div class="modal-actions">
          <button type="button" class="action-btn secondary" @click="closeEditPostModal">Cancel</button>
          <button
            type="button"
            class="action-btn primary"
            :disabled="editPostSaving"
            @click="saveEditedPost"
          >
            {{ editPostSaving ? 'Saving…' : 'Save changes' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Reject confirm modal -->
    <div v-if="rejectPost" class="modal-overlay" @click.self="rejectPost = null">
      <div class="modal-box">
        <h3 class="modal-title">Reject post?</h3>
        <p class="modal-text">This post will be deleted. This action cannot be undone.</p>
        <div class="modal-actions">
          <button type="button" class="action-btn secondary" @click="rejectPost = null">Cancel</button>
          <button
            type="button"
            class="action-btn danger"
            :disabled="actioningId === rejectPost?.id"
            @click="rejectPostConfirm"
          >
            {{ actioningId === rejectPost?.id ? 'Rejecting…' : 'Reject' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Comments modal (for View comments from Pending or All posts) -->
    <Teleport to="body">
      <PostCommentsModal
        :visible="commentsModalVisible"
        :post-id="commentsModalPostId"
        :post-body="commentsModalPostBody"
        @close="commentsModalVisible = false"
      />
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { postsAdminApi } from '@/api/postsAdmin'
import { commentsAdminApi } from '@/api/commentsAdmin'
import { siteSettingsApi } from '@/api/siteSettings'
import UserService from '@/api/users'
import { postsApi } from '@/api/posts'
import CustomDropdown from '@/components/base/ui/CustomDropdown.vue'
import DateRangePicker from '@/components/base/ui/DateRangePicker.vue'
import PostCommentsModal from './PostCommentsModal.vue'

const PER_PAGE = 15
const BODY_TRUNCATE = 200

const props = defineProps({
  section: { type: String, default: 'posts-pending' },
})

const tabs = [
  { id: 'pending', label: 'Pending' },
  { id: 'all', label: 'All posts' },
  { id: 'comments', label: 'All comments' },
]
const activeTab = ref(props.section === 'posts-all' ? 'all' : props.section === 'posts-comments' ? 'comments' : 'pending')
watch(() => props.section, (s) => {
  if (s === 'posts-all') activeTab.value = 'all'
  else if (s === 'posts-comments') activeTab.value = 'comments'
  else if (s === 'posts-pending') activeTab.value = 'pending'
})

const commentsModalVisible = ref(false)
const commentsModalPostId = ref(null)
const commentsModalPostBody = ref('')
function openCommentsModal(post) {
  commentsModalPostId.value = post.id
  commentsModalPostBody.value = post.body || ''
  commentsModalVisible.value = true
}

const userOptions = ref([])

const loading = ref(true)
const fetchError = ref(null)
const posts = ref([])
const meta = ref({
  current_page: 1,
  last_page: 1,
  per_page: PER_PAGE,
  total: 0,
})
const actioningId = ref(null)
const expandedId = ref(null)
const expandedAllId = ref(null)
const toastMessage = ref('')
const toastType = ref('success')
const rejectPost = ref(null)

const postsRequireApproval = ref(false)
const settingsLoading = ref(false)
const settingsError = ref('')

function showToast(message, type = 'success') {
  toastMessage.value = message
  toastType.value = type
  setTimeout(() => {
    toastMessage.value = ''
  }, 4000)
}

function authorInitials(user) {
  if (!user?.name) return '?'
  const parts = user.name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase().slice(0, 2)
  return user.name.slice(0, 2).toUpperCase()
}

function formatDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { dateStyle: 'medium' }) + ' ' + d.toLocaleTimeString(undefined, { timeStyle: 'short' })
}

function truncatedBody(post) {
  const body = post.body || ''
  if (expandedId.value === post.id) return body
  return body.length > BODY_TRUNCATE ? body.slice(0, BODY_TRUNCATE) + '…' : body
}

function truncateBody(text, len) {
  const t = text || ''
  return t.length > len ? t.slice(0, len) + '…' : t
}

function toggleExpand(id) {
  expandedId.value = expandedId.value === id ? null : id
}

async function loadSettings() {
  settingsLoading.value = true
  settingsError.value = ''
  try {
    const data = await siteSettingsApi.get()
    postsRequireApproval.value = data.posts_require_approval ?? false
  } catch (err) {
    settingsError.value = err.response?.data?.message ?? err.message ?? 'Failed to load settings'
  } finally {
    settingsLoading.value = false
  }
}

async function onToggleApproval() {
  settingsError.value = ''
  settingsLoading.value = true
  try {
    await siteSettingsApi.update({ posts_require_approval: postsRequireApproval.value })
    showToast('Setting saved.')
  } catch (err) {
    settingsError.value = err.response?.data?.message ?? err.message ?? 'Failed to save'
    postsRequireApproval.value = !postsRequireApproval.value
  } finally {
    settingsLoading.value = false
  }
}

async function loadPending() {
  loading.value = true
  fetchError.value = null
  expandedId.value = null
  try {
    const res = await postsAdminApi.getPending({
      page: meta.value.current_page,
      per_page: PER_PAGE,
    })
    posts.value = res.data ?? []
    meta.value = res.meta ?? meta.value
  } catch (err) {
    fetchError.value = err.response?.data?.message ?? err.message ?? 'Failed to load pending posts'
    if (err.response?.status === 403) fetchError.value = 'Access denied. Admin only.'
  } finally {
    loading.value = false
  }
}

function goToPage(page) {
  if (page < 1 || page > meta.value.last_page) return
  meta.value = { ...meta.value, current_page: page }
  loadPending()
}

async function approvePost(post) {
  actioningId.value = post.id
  try {
    await postsAdminApi.approve(post.id)
    showToast('Post approved.')
    posts.value = posts.value.filter((p) => p.id !== post.id)
    meta.value = { ...meta.value, total: Math.max(0, (meta.value.total ?? 0) - 1) }
  } catch (err) {
    showToast(err.response?.data?.message ?? err.message ?? 'Failed to approve', 'error')
  } finally {
    actioningId.value = null
  }
}

function confirmReject(post) {
  rejectPost.value = post
}

async function rejectPostConfirm() {
  if (!rejectPost.value) return
  const post = rejectPost.value
  actioningId.value = post.id
  try {
    await postsAdminApi.reject(post.id)
    showToast('Post rejected.')
    rejectPost.value = null
    posts.value = posts.value.filter((p) => p.id !== post.id)
    meta.value = { ...meta.value, total: Math.max(0, (meta.value.total ?? 0) - 1) }
  } catch (err) {
    showToast(err.response?.data?.message ?? err.message ?? 'Failed to reject', 'error')
  } finally {
    actioningId.value = null
  }
}

// All posts tab
const allPostsFilters = ref({
  status: 'all',
  user_id: '',
  date_from: '',
  date_to: '',
})
const allPostsDateRange = ref({
  startDate: '',
  endDate: '',
})
const allPostsStatusOptions = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'published', label: 'Published' },
]
const allPostsUserSearchQuery = ref('')
const allPostsUserSearchResults = ref([])
const allPostsUserSearchLoading = ref(false)
const showAllPostsUserDropdown = ref(false)
const allPostsList = ref([])
const allPostsMeta = ref({ current_page: 1, last_page: 1, per_page: PER_PAGE, total: 0 })
const allPostsLoading = ref(false)
const allPostsError = ref(null)

function buildAllPostsParams() {
  const p = { page: allPostsMeta.value.current_page, per_page: PER_PAGE }
  if (allPostsFilters.value.status !== 'all') p.status = allPostsFilters.value.status
  if (allPostsFilters.value.user_id) p.user_id = allPostsFilters.value.user_id
  if (allPostsFilters.value.date_from) p.date_from = allPostsFilters.value.date_from
  if (allPostsFilters.value.date_to) p.date_to = allPostsFilters.value.date_to
  return p
}

watch(
  allPostsDateRange,
  (range) => {
    allPostsFilters.value.date_from = range.startDate || ''
    allPostsFilters.value.date_to = range.endDate || range.startDate || ''
  },
  { deep: true }
)

function handleAllPostsUserSearch() {
  const q = allPostsUserSearchQuery.value.trim().toLowerCase()
  if (!q) {
    allPostsUserSearchResults.value = []
    allPostsFilters.value.user_id = ''
    return
  }

  allPostsUserSearchLoading.value = true
  setTimeout(() => {
    const base = userOptions.value || []
    allPostsUserSearchResults.value = base.filter((u) => {
      const name = (u.name || '').toLowerCase()
      const username = (u.username || '').toLowerCase()
      const email = (u.email || '').toLowerCase()
      return name.includes(q) || username.includes(q) || email.includes(q)
    })
    allPostsUserSearchLoading.value = false
  }, 80)
}

function selectAllPostsUser(user) {
  allPostsFilters.value.user_id = user?.id || ''
  allPostsUserSearchQuery.value = user ? user.name || user.username || '' : ''
  showAllPostsUserDropdown.value = false
}

function handleAllPostsUserBlur() {
  setTimeout(() => {
    showAllPostsUserDropdown.value = false
  }, 150)
}

async function loadAllPosts() {
  allPostsLoading.value = true
  allPostsError.value = null
  try {
    const res = await postsAdminApi.getAllPosts(buildAllPostsParams())
    allPostsList.value = res.data ?? []
    allPostsMeta.value = res.meta ?? allPostsMeta.value
  } catch (err) {
    allPostsError.value = err.response?.data?.message ?? err.message ?? 'Failed to load posts'
  } finally {
    allPostsLoading.value = false
  }
}

function applyAllPostsFilters() {
  allPostsMeta.value = { ...allPostsMeta.value, current_page: 1 }
  loadAllPosts()
}

function goToAllPostsPage(page) {
  if (page < 1 || page > allPostsMeta.value.last_page) return
  allPostsMeta.value = { ...allPostsMeta.value, current_page: page }
  loadAllPosts()
}

// All comments tab
const commentsFilters = ref({
  user_id: '',
  post_id: '',
  date_from: '',
  date_to: '',
})
const commentsDateRange = ref({
  startDate: '',
  endDate: '',
})
const commentsUserSearchQuery = ref('')
const commentsUserSearchResults = ref([])
const commentsUserSearchLoading = ref(false)
const showCommentsUserDropdown = ref(false)
const commentsList = ref([])
const commentsMeta = ref({ current_page: 1, last_page: 1, per_page: PER_PAGE, total: 0 })
const commentsLoading = ref(false)
const commentsError = ref(null)
const deletingCommentId = ref(null)
const deleteCommentTarget = ref(null)
const deletingPostId = ref(null)
const deletePostTarget = ref(null)
const editPostModalVisible = ref(false)
const editingPost = ref(null)
const editPostBody = ref('')
const editPostSaving = ref(false)

function buildCommentsParams() {
  const p = { page: commentsMeta.value.current_page, per_page: PER_PAGE }
  if (commentsFilters.value.user_id) p.user_id = commentsFilters.value.user_id
  if (commentsFilters.value.post_id) p.post_id = commentsFilters.value.post_id
  if (commentsFilters.value.date_from) p.date_from = commentsFilters.value.date_from
  if (commentsFilters.value.date_to) p.date_to = commentsFilters.value.date_to
  return p
}

watch(
  commentsDateRange,
  (range) => {
    commentsFilters.value.date_from = range.startDate || ''
    commentsFilters.value.date_to = range.endDate || range.startDate || ''
  },
  { deep: true }
)

function handleCommentsUserSearch() {
  const q = commentsUserSearchQuery.value.trim().toLowerCase()
  if (!q) {
    commentsUserSearchResults.value = []
    commentsFilters.value.user_id = ''
    return
  }

  commentsUserSearchLoading.value = true
  setTimeout(() => {
    const base = userOptions.value || []
    commentsUserSearchResults.value = base.filter((u) => {
      const name = (u.name || '').toLowerCase()
      const username = (u.username || '').toLowerCase()
      const email = (u.email || '').toLowerCase()
      return name.includes(q) || username.includes(q) || email.includes(q)
    })
    commentsUserSearchLoading.value = false
  }, 80)
}

function selectCommentsUser(user) {
  commentsFilters.value.user_id = user?.id || ''
  commentsUserSearchQuery.value = user ? user.name || user.username || '' : ''
  showCommentsUserDropdown.value = false
}

function handleCommentsUserBlur() {
  setTimeout(() => {
    showCommentsUserDropdown.value = false
  }, 150)
}

function confirmDeleteComment(comment) {
  deleteCommentTarget.value = comment
}

async function deleteCommentConfirm() {
  if (!deleteCommentTarget.value) return
  const comment = deleteCommentTarget.value
  deletingCommentId.value = comment.id
  try {
    await commentsAdminApi.deleteComment(comment.id)
    commentsList.value = commentsList.value.filter((c) => c.id !== comment.id)
    commentsMeta.value = {
      ...commentsMeta.value,
      total: Math.max(0, (commentsMeta.value.total ?? 1) - 1),
    }
    showToast('Comment deleted.')
    deleteCommentTarget.value = null
  } catch (err) {
    showToast(err.response?.data?.message ?? err.message ?? 'Failed to delete comment', 'error')
  } finally {
    deletingCommentId.value = null
  }
}

function confirmDeletePost(post) {
  deletePostTarget.value = post
}

async function deletePostConfirm() {
  if (!deletePostTarget.value) return
  const post = deletePostTarget.value
  deletingPostId.value = post.id
  try {
    await postsAdminApi.reject(post.id)
    allPostsList.value = allPostsList.value.filter((p) => p.id !== post.id)
    allPostsMeta.value = {
      ...allPostsMeta.value,
      total: Math.max(0, (allPostsMeta.value.total ?? 1) - 1),
    }
    showToast('Post deleted.')
    deletePostTarget.value = null
  } catch (err) {
    showToast(err.response?.data?.message ?? err.message ?? 'Failed to delete post', 'error')
  } finally {
    deletingPostId.value = null
  }
}

function openEditPost(post) {
  editingPost.value = post
  editPostBody.value = post.body || ''
  editPostModalVisible.value = true
}

function closeEditPostModal() {
  editPostModalVisible.value = false
  editingPost.value = null
  editPostBody.value = ''
}

async function saveEditedPost() {
  if (!editingPost.value) return
  const trimmed = (editPostBody.value || '').trim()
  if (!trimmed) {
    showToast('Post text cannot be empty.', 'error')
    return
  }
  editPostSaving.value = true
  try {
    const updated = await postsApi.update(editingPost.value.id, { body: trimmed })
    allPostsList.value = allPostsList.value.map((p) =>
      p.id === editingPost.value.id ? { ...p, ...updated } : p,
    )
    posts.value = posts.value.map((p) =>
      p.id === editingPost.value.id ? { ...p, ...updated } : p,
    )
    showToast('Post updated.')
    closeEditPostModal()
  } catch (err) {
    showToast(err.response?.data?.message ?? err.message ?? 'Failed to update post', 'error')
  } finally {
    editPostSaving.value = false
  }
}

async function loadAllComments() {
  commentsLoading.value = true
  commentsError.value = null
  try {
    const res = await commentsAdminApi.getAllComments(buildCommentsParams())
    commentsList.value = res.data ?? []
    commentsMeta.value = res.meta ?? commentsMeta.value
  } catch (err) {
    commentsError.value = err.response?.data?.message ?? err.message ?? 'Failed to load comments'
  } finally {
    commentsLoading.value = false
  }
}

function applyCommentsFilters() {
  commentsMeta.value = { ...commentsMeta.value, current_page: 1 }
  loadAllComments()
}

function goToCommentsPage(page) {
  if (page < 1 || page > commentsMeta.value.last_page) return
  commentsMeta.value = { ...commentsMeta.value, current_page: page }
  loadAllComments()
}

watch(activeTab, (tab) => {
  if (tab === 'all' && !allPostsList.value.length && !allPostsLoading.value) loadAllPosts()
  if (tab === 'comments' && !commentsList.value.length && !commentsLoading.value) loadAllComments()
})

onMounted(async () => {
  loadSettings()
  loadPending()
  try {
    const { users } = await UserService.getAllUsers({ per_page: 200 })
    userOptions.value = users ?? []
  } catch {
    userOptions.value = []
  }
  if (activeTab.value === 'all') loadAllPosts()
  if (activeTab.value === 'comments') loadAllComments()
})
</script>

<style scoped>
.posts-section {
  max-width: 960px;
  margin: 0 auto;
}

.posts-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.tab-btn {
  padding: 0.625rem 1.25rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.2s;
}

.tab-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.95);
}

.tab-btn.active {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.35), rgba(6, 182, 212, 0.25));
  border-color: rgba(139, 92, 246, 0.5);
  color: #fff;
}

.posts-header {
  margin-bottom: 1rem;
}

.section-title {
  font-size: 1.75rem;
  font-weight: 800;
  background: linear-gradient(135deg, #8b5cf6, #06b6d4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.25rem;
}

.section-subtitle {
  font-size: 0.9375rem;
  color: rgba(255, 255, 255, 0.65);
}

.posts-toast {
  padding: 0.75rem 1.25rem;
  border-radius: 12px;
  margin-bottom: 1rem;
  font-weight: 500;
}

.posts-toast.success {
  background: rgba(34, 197, 94, 0.2);
  border: 1px solid rgba(34, 197, 94, 0.4);
  color: #86efac;
}

.posts-toast.error {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.4);
  color: #fca5a5;
}

.posts-settings-block {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
  margin-bottom: 2rem;
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.setting-info {
  flex: 1;
  min-width: 200px;
}

.setting-label {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  display: block;
  margin-bottom: 0.25rem;
}

.setting-desc {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

.settings-error {
  font-size: 0.8125rem;
  color: #fca5a5;
  margin: 0.5rem 0 0;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 56px;
  height: 30px;
  cursor: pointer;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 30px;
  transition: 0.3s;
}

.toggle-slider::before {
  content: '';
  position: absolute;
  height: 22px;
  width: 22px;
  left: 4px;
  bottom: 4px;
  background: white;
  border-radius: 50%;
  transition: 0.3s;
}

.toggle-switch input:checked + .toggle-slider {
  background: linear-gradient(135deg, #8b5cf6, #06b6d4);
}

.toggle-switch input:checked + .toggle-slider::before {
  transform: translateX(26px);
}

.pending-block,
.all-posts-block,
.all-comments-block {
  margin-top: 0.5rem;
}

.filters-row {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.user-search-wrapper {
  position: relative;
  width: 100%;
}

.user-search-input {
  padding-right: 2.5rem;
}

.search-loading-inline {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
}

.user-dropdown {
  position: absolute;
  top: calc(100% + 0.4rem);
  left: 0;
  right: 0;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.98));
  border-radius: 12px;
  border: 1px solid rgba(139, 92, 246, 0.4);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(139, 92, 246, 0.25);
  z-index: 10000;
  max-height: 260px;
  overflow-y: auto;
  padding: 0.25rem 0;
}

.user-dropdown .dropdown-item {
  padding: 0.65rem 0.9rem;
  cursor: pointer;
  font-size: 0.8125rem;
  color: rgba(255, 255, 255, 0.9);
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  transition: all 0.2s ease;
}

.user-dropdown .dropdown-item:last-child {
  border-bottom: none;
}

.user-dropdown .dropdown-item:hover {
  background: rgba(139, 92, 246, 0.18);
}

.user-dropdown .dropdown-item.selected {
  background: rgba(139, 92, 246, 0.28);
}

.user-dropdown .dropdown-item.no-results {
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  font-style: italic;
}

.user-option {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.user-name {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
}

.user-username {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.filter-group--date {
  flex: 1 1 220px;
  min-width: 220px;
}

.filter-label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
}

.filter-select,
.filter-input {
  padding: 0.5rem 0.75rem;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.875rem;
  min-width: 140px;
}

.filter-date-picker {
  width: 100%;
}

.filter-date-picker :deep(.date-picker-trigger) {
  width: 100%;
  min-width: 0;
  justify-content: flex-start;
}

.filter-input.narrow {
  min-width: 90px;
  width: 90px;
}

.filters-apply-btn {
  margin-left: auto;
}

.status-badge {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
}

.status-badge.pending {
  background: rgba(234, 179, 8, 0.25);
  color: #fde047;
}

.status-badge.published {
  background: rgba(34, 197, 94, 0.25);
  color: #86efac;
}

.post-header-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.comments-table-wrap {
  overflow-x: auto;
  margin-bottom: 1rem;
}

.comments-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.comments-table th,
.comments-table td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.comments-table th {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
}

.comment-author-cell {
  white-space: nowrap;
}

.comment-body-cell {
  max-width: 280px;
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.post-excerpt {
  display: block;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 0.25rem;
}

.pending-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 0.25rem;
}

.pending-subtitle {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 1.25rem;
}

.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 2rem;
  color: rgba(255, 255, 255, 0.7);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(139, 92, 246, 0.3);
  border-top-color: #8b5cf6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-state p,
.empty-state p {
  margin-bottom: 1rem;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.action-btn.primary {
  background: linear-gradient(135deg, #8b5cf6, #06b6d4);
  color: white;
  border-color: rgba(139, 92, 246, 0.5);
}

.action-btn.primary:hover:not(:disabled) {
  filter: brightness(1.1);
  box-shadow: 0 4px 16px rgba(139, 92, 246, 0.35);
}

.action-btn.secondary {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.9);
  border-color: rgba(255, 255, 255, 0.2);
}

.action-btn.secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.12);
}

.action-btn.danger {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
  border-color: rgba(239, 68, 68, 0.4);
}

.action-btn.danger:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.3);
}

.action-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.post-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.25rem;
  transition: border-color 0.2s;
}

.post-card:hover {
  border-color: rgba(139, 92, 246, 0.25);
}

.post-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.author {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.author-avatar {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  object-fit: cover;
  background: rgba(139, 92, 246, 0.2);
}

.author-avatar.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
}

.author-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.author-name {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
}

.author-username {
  font-size: 0.8125rem;
  color: rgba(255, 255, 255, 0.55);
}

.post-date {
  font-size: 0.8125rem;
  color: rgba(255, 255, 255, 0.55);
}

.post-body {
  margin-bottom: 0.75rem;
}

.post-text {
  font-size: 0.9375rem;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.5;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.post-text.full {
  margin-top: 0.5rem;
}

.read-more-btn {
  background: none;
  border: none;
  color: #a78bfa;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.25rem 0;
  margin-top: 0.25rem;
}

.read-more-btn:hover {
  text-decoration: underline;
}

.post-tagged {
  font-size: 0.8125rem;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 0.75rem;
}

.post-media {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.media-thumb {
  width: 72px;
  height: 72px;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.media-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.media-more {
  font-size: 0.8125rem;
  color: rgba(255, 255, 255, 0.5);
  align-self: center;
}

.post-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1.5rem 0;
  flex-wrap: wrap;
}

.pagination-btn {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
  background: rgba(139, 92, 246, 0.2);
  border-color: rgba(139, 92, 246, 0.4);
}

.pagination-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pagination-info {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.65);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-box {
  background: rgba(18, 18, 28, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
  max-width: 400px;
  width: 100%;
}

.modal-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: 0.5rem;
}

.modal-text {
  font-size: 0.9375rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 1.25rem;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.edit-post-body {
  padding: 0;
}

.edit-post-textarea {
  width: 100%;
  min-height: 140px;
  padding: 0.75rem 0.9rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(15, 23, 42, 0.95);
  color: rgba(255, 255, 255, 0.95);
  font-size: 0.9375rem;
  line-height: 1.5;
  resize: vertical;
}

.edit-post-textarea:focus {
  outline: none;
  border-color: rgba(139, 92, 246, 0.6);
  box-shadow: 0 0 0 1px rgba(139, 92, 246, 0.4);
}

@media (max-width: 768px) {
  .posts-tabs {
    padding: 0.375rem;
    border-radius: 12px;
    border: 1px solid rgba(139, 92, 246, 0.2);
    background: linear-gradient(180deg, rgba(15, 15, 23, 0.96), rgba(20, 20, 28, 0.94));
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
    gap: 0.375rem;
  }

  .tab-btn {
    flex: 1 1 calc(33.333% - 0.25rem);
    min-width: 0;
    justify-content: center;
    text-align: center;
    padding: 0.75rem 0.5rem;
    font-size: 0.8125rem;
    border-radius: 999px;
  }

  .filters-row {
    flex-direction: column;
    align-items: stretch;
    padding: 1rem;
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(139, 92, 246, 0.12);
  }

  .filter-group,
  .filter-group--date {
    width: 100%;
  }

  .filter-select,
  .filter-input {
    width: 100%;
    min-width: 0;
  }

  .filter-date-picker :deep(.date-picker-trigger) {
    min-width: 0;
  }

  .filters-apply-btn {
    width: 100%;
    justify-content: center;
    margin-left: 0;
    min-height: 44px;
  }

  .comments-table-wrap.desktop-only {
    display: none;
  }

  .comments-cards.mobile-only {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .comment-card {
    padding: 1rem 0.9rem;
    border-radius: 12px;
    background: linear-gradient(135deg, rgba(20, 20, 28, 0.98), rgba(15, 15, 23, 0.98));
    border: 1px solid rgba(139, 92, 246, 0.35);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
  }

  .comment-card-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.75rem;
    margin-bottom: 0.5rem;
  }

  .comment-card-author {
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }

  .comment-avatar {
    width: 32px;
    height: 32px;
    border-radius: 999px;
    background: rgba(139, 92, 246, 0.25);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 700;
    color: #e9d5ff;
  }

  .comment-author-info {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
  }

  .comment-author-name {
    font-size: 0.875rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
  }

  .comment-author-username {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.6);
  }

  .comment-card-date {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.5);
    text-align: right;
  }

  .comment-card-body {
    margin: 0.35rem 0 0.5rem;
  }

  .comment-card-text {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.9);
    line-height: 1.4;
    margin: 0;
    white-space: pre-wrap;
    word-break: break-word;
    overflow-wrap: anywhere;
  }

  .comment-card-meta {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: 0.75rem;
  }

  .comment-card-post-label {
    font-weight: 600;
    margin-right: 0.25rem;
  }

  .comment-card-post-excerpt {
    display: block;
    margin-top: 0.15rem;
  }

  .comment-card-actions {
    display: flex;
    justify-content: flex-end;
  }

  .comment-card-btn {
    padding: 0.55rem 0.9rem;
    border-radius: 999px;
    font-size: 0.8125rem;
    font-weight: 600;
    border: 1px solid transparent;
    cursor: pointer;
  }

  .comment-card-btn.danger {
    background: rgba(239, 68, 68, 0.2);
    border-color: rgba(239, 68, 68, 0.5);
    color: #fecaca;
  }
}
</style>
