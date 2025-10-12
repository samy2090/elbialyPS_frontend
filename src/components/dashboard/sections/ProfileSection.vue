<template>
  <div class="profile-content">
    <div class="profile-header">
      <div class="profile-avatar">
        <img :src="profileData.avatar" alt="Profile Avatar" />
        <button class="edit-avatar-btn" @click="$emit('edit-avatar')">
          <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
      <div class="profile-info">
        <h1 class="profile-name">{{ profileData.name }}</h1>
        <p class="profile-email">{{ profileData.email }}</p>
        <div class="profile-stats">
          <div class="stat">
            <span class="stat-value">{{ profileData.loginHours }}</span>
            <span class="stat-label">Hours Active</span>
          </div>
          <div class="stat">
            <span class="stat-value">{{ profileData.reportsCreated }}</span>
            <span class="stat-label">Reports Created</span>
          </div>
          <div class="stat">
            <span class="stat-value">{{ profileData.usersManaged }}</span>
            <span class="stat-label">Users Managed</span>
          </div>
        </div>
      </div>
    </div>

    <div class="profile-sections">
      <div class="section-tabs">
        <button 
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="['tab-btn', { active: activeTab === tab.id }]"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="tab-content">
        <!-- Watchlist Tab -->
        <div v-if="activeTab === 'watchlist'" class="watchlist-content">
          <div class="content-grid">
            <div 
              v-for="item in watchlistItems"
              :key="item.id"
              class="content-card"
              @click="$emit('item-selected', item)"
            >
              <img :src="item.poster" :alt="item.title" class="card-image" />
              <div class="card-overlay">
                <h4 class="card-title">{{ item.title }}</h4>
                <p class="card-meta">{{ item.type }} • {{ item.year }}</p>
                <button class="remove-btn" @click.stop="removeFromWatchlist(item.id)">
                  <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- History Tab -->
        <div v-if="activeTab === 'history'" class="history-content">
          <div class="history-list">
            <div 
              v-for="item in historyItems"
              :key="item.id"
              class="history-item"
              @click="$emit('item-selected', item)"
            >
              <img :src="item.thumbnail" :alt="item.title" class="history-thumbnail" />
              <div class="history-info">
                <h4 class="history-title">{{ item.title }}</h4>
                <p class="history-meta">{{ item.type }} • Watched {{ item.watchedAt }}</p>
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: item.progress + '%' }"></div>
                </div>
                <p class="progress-text">{{ item.progress }}% complete</p>
              </div>
              <button class="continue-btn">Continue</button>
            </div>
          </div>
        </div>

        <!-- Reviews Tab -->
        <div v-if="activeTab === 'reviews'" class="reviews-content">
          <div class="reviews-list">
            <div 
              v-for="review in userReviews"
              :key="review.id"
              class="review-card"
            >
              <div class="review-header">
                <img :src="review.contentPoster" :alt="review.contentTitle" class="review-poster" />
                <div class="review-title-section">
                  <h4 class="review-content-title">{{ review.contentTitle }}</h4>
                  <div class="review-rating">
                    <span v-for="star in 5" :key="star" class="star" :class="{ filled: star <= review.rating }">★</span>
                  </div>
                  <p class="review-date">Reviewed {{ review.date }}</p>
                </div>
              </div>
              <p class="review-text">{{ review.text }}</p>
              <div class="review-actions">
                <button class="edit-review-btn" @click="editReview(review.id)">Edit</button>
                <button class="delete-review-btn" @click="deleteReview(review.id)">Delete</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Settings Tab -->
        <div v-if="activeTab === 'settings'" class="settings-content">
          <div class="settings-groups">
            <div class="settings-group">
              <h3 class="group-title">Preferences</h3>
              <div class="setting-item">
                <label class="setting-label">
                  <input type="checkbox" v-model="settings.autoplay" />
                  <span class="checkmark"></span>
                  Enable autoplay
                </label>
              </div>
              <div class="setting-item">
                <label class="setting-label">
                  <input type="checkbox" v-model="settings.notifications" />
                  <span class="checkmark"></span>
                  Push notifications
                </label>
              </div>
              <div class="setting-item">
                <label class="setting-label">Video Quality:</label>
                <select v-model="settings.videoQuality" class="setting-select">
                  <option value="auto">Auto</option>
                  <option value="720p">720p</option>
                  <option value="1080p">1080p</option>
                  <option value="4k">4K</option>
                </select>
              </div>
            </div>

            <div class="settings-group">
              <h3 class="group-title">Privacy</h3>
              <div class="setting-item">
                <label class="setting-label">
                  <input type="checkbox" v-model="settings.publicProfile" />
                  <span class="checkmark"></span>
                  Public profile
                </label>
              </div>
              <div class="setting-item">
                <label class="setting-label">
                  <input type="checkbox" v-model="settings.shareWatching" />
                  <span class="checkmark"></span>
                  Share what I'm watching
                </label>
              </div>
            </div>

            <div class="settings-group">
              <h3 class="group-title">Account</h3>
              <button class="settings-btn">Change Password</button>
              <button class="settings-btn">Export Data</button>
              <button class="settings-btn danger">Delete Account</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const activeTab = ref('watchlist')

const profileData = computed(() => ({
  name: 'Alex Johnson',
  email: 'alex.johnson@example.com',
  avatar: 'https://via.placeholder.com/120x120/8b5cf6/ffffff?text=AJ',
  loginHours: '248',
  reportsCreated: '42',
  usersManaged: '18'
}))

const tabs = computed(() => [
  { id: 'activity', label: 'Activity' },
  { id: 'reports', label: 'Reports' },
  { id: 'users', label: 'Users' },
  { id: 'settings', label: 'Settings' }
])

const watchlistItems = computed(() => [
  {
    id: 1,
    title: 'Quantum Realm',
    type: 'Movie',
    year: 2024,
    poster: 'https://via.placeholder.com/200x300/6366f1/ffffff?text=QR'
  },
  {
    id: 2,
    title: 'Digital Horizons',
    type: 'Series',
    year: 2024,
    poster: 'https://via.placeholder.com/200x300/8b5cf6/ffffff?text=DH'
  },
  {
    id: 3,
    title: 'Neon Chronicles',
    type: 'Movie',
    year: 2024,
    poster: 'https://via.placeholder.com/200x300/06b6d4/ffffff?text=NC'
  },
  {
    id: 4,
    title: 'Cyber Dreams',
    type: 'Series',
    year: 2024,
    poster: 'https://via.placeholder.com/200x300/10b981/ffffff?text=CD'
  }
])

const historyItems = computed(() => [
  {
    id: 1,
    title: 'Space Odyssey 2024',
    type: 'Movie',
    watchedAt: '2 days ago',
    progress: 100,
    thumbnail: 'https://via.placeholder.com/80x120/6366f1/ffffff?text=SO'
  },
  {
    id: 2,
    title: 'Tech Mysteries',
    type: 'Series - S1E5',
    watchedAt: '1 week ago',
    progress: 67,
    thumbnail: 'https://via.placeholder.com/80x120/8b5cf6/ffffff?text=TM'
  },
  {
    id: 3,
    title: 'Future World',
    type: 'Documentary',
    watchedAt: '2 weeks ago',
    progress: 85,
    thumbnail: 'https://via.placeholder.com/80x120/06b6d4/ffffff?text=FW'
  }
])

const userReviews = computed(() => [
  {
    id: 1,
    contentTitle: 'Galactic Adventures',
    contentPoster: 'https://via.placeholder.com/60x90/6366f1/ffffff?text=GA',
    rating: 5,
    date: '1 week ago',
    text: 'An absolutely amazing journey through space! The visual effects were stunning and the storyline kept me engaged throughout.'
  },
  {
    id: 2,
    contentTitle: 'Digital Reality',
    contentPoster: 'https://via.placeholder.com/60x90/8b5cf6/ffffff?text=DR',
    rating: 4,
    date: '2 weeks ago',
    text: 'Great concept and execution. Some parts felt a bit slow, but overall a solid watch.'
  }
])

const settings = ref({
  autoplay: true,
  notifications: false,
  videoQuality: '1080p',
  publicProfile: true,
  shareWatching: false
})

const removeFromWatchlist = (itemId) => {
  console.log('Removing item from watchlist:', itemId)
}

const editReview = (reviewId) => {
  console.log('Editing review:', reviewId)
}

const deleteReview = (reviewId) => {
  console.log('Deleting review:', reviewId)
}

defineEmits(['edit-avatar', 'item-selected'])
</script>

<style scoped>
.profile-content {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.profile-header {
  display: flex;
  gap: 2rem;
  margin-bottom: 3rem;
  align-items: flex-start;
}

.profile-avatar {
  position: relative;
  flex-shrink: 0;
}

.profile-avatar img {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 3px solid rgba(139, 92, 246, 0.3);
}

.edit-avatar-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  padding: 0.5rem;
  background: #8b5cf6;
  border: 2px solid rgba(15, 15, 23, 1);
  border-radius: 50%;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.edit-avatar-btn:hover {
  background: #7c3aed;
  transform: scale(1.1);
}

.icon {
  width: 1rem;
  height: 1rem;
}

.profile-info {
  flex: 1;
}

.profile-name {
  font-size: 2rem;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 0.5rem;
}

.profile-email {
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 1.5rem;
}

.profile-stats {
  display: flex;
  gap: 2rem;
}

.stat {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: #8b5cf6;
}

.stat-label {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
}

.section-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.tab-btn {
  padding: 1rem 1.5rem;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 2px solid transparent;
  font-weight: 600;
}

.tab-btn:hover {
  color: rgba(255, 255, 255, 0.8);
}

.tab-btn.active {
  color: #8b5cf6;
  border-bottom-color: #8b5cf6;
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
}

.content-card {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.content-card:hover {
  transform: scale(1.05);
}

.card-image {
  width: 100%;
  height: 300px;
  object-fit: cover;
}

.card-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  padding: 2rem 1rem 1rem;
  color: white;
}

.card-title {
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.card-meta {
  font-size: 0.875rem;
  opacity: 0.8;
}

.remove-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  padding: 0.5rem;
  background: rgba(239, 68, 68, 0.8);
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.content-card:hover .remove-btn {
  opacity: 1;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.history-item:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateX(8px);
}

.history-thumbnail {
  width: 60px;
  height: 90px;
  border-radius: 8px;
  object-fit: cover;
}

.history-info {
  flex: 1;
}

.history-title {
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 0.25rem;
}

.history-meta {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 0.25rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #8b5cf6, #06b6d4);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
}

.continue-btn {
  padding: 0.75rem 1.5rem;
  background: #8b5cf6;
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.continue-btn:hover {
  background: #7c3aed;
  transform: translateY(-2px);
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.review-card {
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.review-header {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.review-poster {
  width: 60px;
  height: 90px;
  border-radius: 8px;
  object-fit: cover;
}

.review-title-section {
  flex: 1;
}

.review-content-title {
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 0.5rem;
}

.review-rating {
  margin-bottom: 0.5rem;
}

.star {
  color: rgba(255, 255, 255, 0.3);
  font-size: 1.125rem;
}

.star.filled {
  color: #fbbf24;
}

.review-date {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
}

.review-text {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  margin-bottom: 1rem;
}

.review-actions {
  display: flex;
  gap: 1rem;
}

.edit-review-btn,
.delete-review-btn {
  padding: 0.5rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: transparent;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.3s ease;
}

.edit-review-btn:hover {
  border-color: #8b5cf6;
  color: #8b5cf6;
}

.delete-review-btn:hover {
  border-color: #ef4444;
  color: #ef4444;
}

.settings-groups {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.settings-group {
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.group-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 1rem;
}

.setting-item {
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.setting-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
}

.setting-label input[type="checkbox"] {
  display: none;
}

.checkmark {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  transition: all 0.3s ease;
  position: relative;
}

.setting-label input[type="checkbox"]:checked + .checkmark {
  background: #8b5cf6;
  border-color: #8b5cf6;
}

.setting-label input[type="checkbox"]:checked + .checkmark::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 0.875rem;
  font-weight: bold;
}

.setting-select {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
}

.settings-btn {
  display: block;
  width: 100%;
  padding: 0.75rem 1rem;
  margin-bottom: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
}

.settings-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.settings-btn.danger {
  border-color: rgba(239, 68, 68, 0.5);
  color: #ef4444;
}

.settings-btn.danger:hover {
  background: rgba(239, 68, 68, 0.1);
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .profile-content {
    padding: 1rem;
  }
  
  .profile-header {
    flex-direction: column;
    text-align: center;
  }
  
  .profile-stats {
    justify-content: center;
  }
  
  .section-tabs {
    overflow-x: auto;
    white-space: nowrap;
  }
  
  .content-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .history-item {
    flex-direction: column;
    text-align: center;
  }
  
  .review-header {
    flex-direction: column;
    text-align: center;
  }
}
</style>