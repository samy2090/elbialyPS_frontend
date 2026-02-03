<template>
  <nav v-if="links && links.length" class="pagination-bar" aria-label="Pagination">
    <div class="pagination-bar__inner">
      <button
        type="button"
        class="pagination-bar__btn"
        :disabled="!prevPageUrl"
        aria-label="Previous page"
        @click="goTo(currentPage - 1)"
      >
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <div class="pagination-bar__pages">
        <button
          v-for="(link, i) in pageLinks"
          :key="i"
          type="button"
          class="pagination-bar__page"
          :class="{ active: link.active }"
          :disabled="!link.url"
          :aria-label="'Page ' + link.label"
          @click="goToPage(link)"
        >
          {{ link.label }}
        </button>
      </div>
      <button
        type="button"
        class="pagination-bar__btn"
        :disabled="!nextPageUrl"
        aria-label="Next page"
        @click="goTo(currentPage + 1)"
      >
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
    <p v-if="total != null" class="pagination-bar__meta">
      {{ from }}–{{ to }} of {{ total }}
    </p>
  </nav>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentPage: { type: Number, default: 1 },
  lastPage: { type: Number, default: 1 },
  prevPageUrl: { type: String, default: null },
  nextPageUrl: { type: String, default: null },
  from: { type: Number, default: 0 },
  to: { type: Number, default: 0 },
  total: { type: Number, default: null },
  links: { type: Array, default: () => [] },
})

const emit = defineEmits(['page-change'])

const pageLinks = computed(() => {
  const list = props.links || []
  return list.filter((l) => l.label !== '&laquo; Previous' && l.label !== 'Next &raquo;' && l.label !== '...')
})

function goTo(page) {
  if (page < 1 || page > props.lastPage) return
  emit('page-change', page)
}

function goToPage(link) {
  if (!link.url || link.active) return
  const match = link.url.match(/[?&]page=(\d+)/)
  const page = match ? parseInt(match[1], 10) : null
  if (page != null) emit('page-change', page)
}
</script>

<style scoped>
.pagination-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1rem 0;
}

.pagination-bar__inner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pagination-bar__btn {
  width: 2.25rem;
  height: 2.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-bar__btn:hover:not(:disabled) {
  background: rgba(139, 92, 246, 0.2);
  border-color: rgba(139, 92, 246, 0.5);
  color: #c4b5fd;
}

.pagination-bar__btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pagination-bar__btn svg {
  width: 1.25rem;
  height: 1.25rem;
}

.pagination-bar__pages {
  display: flex;
  gap: 0.25rem;
}

.pagination-bar__page {
  min-width: 2.25rem;
  height: 2.25rem;
  padding: 0 0.5rem;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-bar__page:hover:not(:disabled):not(.active) {
  background: rgba(139, 92, 246, 0.15);
  border-color: rgba(139, 92, 246, 0.4);
  color: #c4b5fd;
}

.pagination-bar__page.active {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.4), rgba(124, 58, 237, 0.3));
  border-color: rgba(139, 92, 246, 0.6);
  color: #fff;
  cursor: default;
}

.pagination-bar__page:disabled {
  cursor: not-allowed;
}

.pagination-bar__meta {
  font-size: 0.8125rem;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
}
</style>
