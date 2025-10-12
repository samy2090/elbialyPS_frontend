<template>
  <div class="explore-content">
    <div class="search-section">
      <div class="search-container">
        <div class="search-input-wrapper">
          <svg class="search-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
            <path d="M21 21L16.65 16.65" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Search users, reports, analytics..."
            class="search-input"
            @input="onSearch"
          />
        </div>
        <button class="filter-btn" @click="showFilters = !showFilters">
          <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46 22,3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
      
      <div v-if="showFilters" class="filters-panel">
        <div class="filter-group">
          <label>Genre:</label>
          <select v-model="selectedGenre" @change="applyFilters">
            <option value="">All Genres</option>
            <option v-for="genre in genres" :key="genre" :value="genre">{{ genre }}</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Type:</label>
          <select v-model="selectedType" @change="applyFilters">
            <option value="">All Types</option>
            <option value="movie">Movies</option>
            <option value="series">Series</option>
            <option value="music">Music</option>
          </select>
        </div>
      </div>
    </div>

    <div class="categories-section">
      <h2 class="section-title">Browse Categories</h2>
      <div class="categories-grid">
        <div 
          v-for="category in categories"
          :key="category.id"
          class="category-card"
          @click="$emit('category-selected', category)"
        >
          <div class="category-icon">
            <component :is="category.icon" />
          </div>
          <h3 class="category-title">{{ category.name }}</h3>
          <p class="category-count">{{ category.count }} items</p>
        </div>
      </div>
    </div>

    <div class="trending-section">
      <h2 class="section-title">Trending Now</h2>
      <div class="trending-list">
        <div 
          v-for="(item, index) in trendingItems"
          :key="item.id"
          class="trending-item"
          @click="$emit('item-selected', item)"
        >
          <div class="rank">{{ index + 1 }}</div>
          <img :src="item.thumbnail" :alt="item.title" class="item-thumbnail" />
          <div class="item-info">
            <h4 class="item-title">{{ item.title }}</h4>
            <p class="item-meta">{{ item.type }} • {{ item.year }}</p>
            <div class="item-stats">
              <span class="views">{{ item.views }} views</span>
              <span class="rating">★ {{ item.rating }}</span>
            </div>
          </div>
          <div class="trending-indicator">
            <svg class="trend-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 17L17 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M7 7H17V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Category icons
const MovieIcon = {
  template: `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 4L4 4C2.89543 4 2 4.89543 2 6V18C2 19.1046 2.89543 20 4 20H20C21.1046 20 22 19.1046 22 18V6C22 4.89543 21.1046 4 20 4Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M8 4V20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M16 4V20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M2 8H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M2 16H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M16 8H22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M16 16H22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `
}

const SeriesIcon = {
  template: `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
      <path d="M8 21H16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M12 17V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `
}

const MusicIcon = {
  template: `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 18V5L21 3V16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="6" cy="18" r="3" stroke="currentColor" stroke-width="2"/>
      <circle cx="18" cy="16" r="3" stroke="currentColor" stroke-width="2"/>
    </svg>
  `
}

const DocumentaryIcon = {
  template: `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M16 13H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M16 17H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M10 9H9H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `
}

const searchQuery = ref('')
const showFilters = ref(false)
const selectedGenre = ref('')
const selectedType = ref('')

const genres = computed(() => [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Romance', 'Sci-Fi', 'Thriller'
])

const categories = computed(() => [
  { id: 1, name: 'Movies', count: 1247, icon: MovieIcon },
  { id: 2, name: 'TV Series', count: 892, icon: SeriesIcon },
  { id: 3, name: 'Music', count: 2156, icon: MusicIcon },
  { id: 4, name: 'Documentaries', count: 345, icon: DocumentaryIcon }
])

const trendingItems = computed(() => [
  {
    id: 1,
    title: "Galactic Warriors",
    type: "Movie",
    year: 2024,
    views: "2.1M",
    rating: 4.8,
    thumbnail: "https://via.placeholder.com/80x120/6366f1/ffffff?text=GW"
  },
  {
    id: 2,
    title: "Midnight City",
    type: "Series",
    year: 2024,
    views: "1.8M",
    rating: 4.7,
    thumbnail: "https://via.placeholder.com/80x120/8b5cf6/ffffff?text=MC"
  },
  {
    id: 3,
    title: "Electric Dreams",
    type: "Music",
    year: 2024,
    views: "3.2M",
    rating: 4.9,
    thumbnail: "https://via.placeholder.com/80x120/06b6d4/ffffff?text=ED"
  },
  {
    id: 4,
    title: "Ocean Depths",
    type: "Documentary",
    year: 2024,
    views: "950K",
    rating: 4.6,
    thumbnail: "https://via.placeholder.com/80x120/10b981/ffffff?text=OD"
  },
  {
    id: 5,
    title: "Neon Pulse",
    type: "Movie",
    year: 2024,
    views: "1.5M",
    rating: 4.5,
    thumbnail: "https://via.placeholder.com/80x120/f59e0b/ffffff?text=NP"
  }
])

const onSearch = () => {
  // Emit search event
  console.log('Searching for:', searchQuery.value)
}

const applyFilters = () => {
  // Emit filter event
  console.log('Applying filters:', { genre: selectedGenre.value, type: selectedType.value })
}

defineEmits(['category-selected', 'item-selected'])
</script>

<style scoped>
.explore-content {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.search-section {
  margin-bottom: 3rem;
}

.search-container {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.search-input-wrapper {
  position: relative;
  flex: 1;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.25rem;
  height: 1.25rem;
  color: rgba(255, 255, 255, 0.5);
}

.search-input {
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: rgba(139, 92, 246, 0.5);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.filter-btn {
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
}

.icon {
  width: 1.25rem;
  height: 1.25rem;
}

.filters-panel {
  margin-top: 1rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  color: rgba(255, 255, 255, 0.8);
  font-weight: 600;
  font-size: 0.875rem;
}

.filter-group select {
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
}

.section-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 1.5rem;
}

.categories-section {
  margin-bottom: 3rem;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.category-card {
  padding: 2rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.category-card:hover {
  transform: translateY(-8px);
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(139, 92, 246, 0.3);
  box-shadow: 0 20px 40px rgba(139, 92, 246, 0.15);
}

.category-icon {
  width: 3rem;
  height: 3rem;
  margin: 0 auto 1rem;
  color: #8b5cf6;
  filter: drop-shadow(0 0 8px rgba(139, 92, 246, 0.3));
}

.category-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 0.5rem;
}

.category-count {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
}

.trending-section {
  margin-top: 3rem;
}

.trending-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.trending-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.trending-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(139, 92, 246, 0.3);
  transform: translateX(8px);
}

.rank {
  font-size: 1.5rem;
  font-weight: 800;
  color: #8b5cf6;
  min-width: 2rem;
  text-align: center;
}

.item-thumbnail {
  width: 60px;
  height: 90px;
  border-radius: 8px;
  object-fit: cover;
}

.item-info {
  flex: 1;
}

.item-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 0.25rem;
}

.item-meta {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.item-stats {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
}

.views {
  color: rgba(255, 255, 255, 0.7);
}

.rating {
  color: #fbbf24;
  font-weight: 600;
}

.trending-indicator {
  color: #10b981;
}

.trend-icon {
  width: 1.25rem;
  height: 1.25rem;
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .explore-content {
    padding: 1rem;
  }
  
  .search-container {
    flex-direction: column;
  }
  
  .filter-btn {
    align-self: stretch;
  }
  
  .filters-panel {
    flex-direction: column;
    gap: 1rem;
  }
  
  .categories-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .trending-item {
    flex-direction: column;
    text-align: center;
  }
  
  .item-info {
    order: 2;
  }
  
  .rank {
    order: 1;
  }
  
  .item-thumbnail {
    order: 3;
    width: 100px;
    height: 150px;
  }
}
</style>