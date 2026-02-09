<template>
  <div class="spin-wheel-history">
    <div class="section-header">
      <div class="header-info">
        <h1 class="section-title">Spin Wheel History</h1>
        <p class="section-subtitle">Spin history across all users (spins and rewards)</p>
      </div>
    </div>

    <div v-if="fetchError" class="error-state">
      <p>{{ fetchError }}</p>
      <button type="button" class="action-btn secondary" @click="fetchHistory(1)">Retry</button>
    </div>

    <div class="filters-row">
      <div class="filter-group">
        <label>User ID</label>
        <input v-model.number="filters.user_id" type="number" min="1" placeholder="Optional" @keyup.enter="fetchHistory(1)" />
      </div>
      <div class="filter-group">
        <label>Reward type</label>
        <select v-model="filters.reward_type" @change="fetchHistory(1)">
          <option value="">All</option>
          <option value="points">Points</option>
          <option value="percent_discount">Percent discount</option>
          <option value="free_minutes">Free minutes</option>
          <option value="free_product">Free product</option>
        </select>
      </div>
      <button type="button" class="action-btn primary" @click="fetchHistory(1)">Apply</button>
    </div>

    <div v-if="loading && !historyItems.length" class="loading-state">
      <div class="spinner"></div>
      <p>Loading history…</p>
    </div>
    <div v-else-if="!historyItems.length" class="empty-state">
      <p>No spin history yet.</p>
    </div>
    <template v-else>
      <!-- Desktop: table -->
      <div class="table-wrap desktop-only">
        <table class="history-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Option / Reward</th>
              <th>Type</th>
              <th>Spin #</th>
              <th>Spun at</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in historyItems" :key="item.id">
              <td>
                <span class="user-name">{{ item.user?.name ?? '—' }}</span>
                <span class="user-meta">{{ item.user?.username ? `@${item.user.username}` : '' }}</span>
              </td>
              <td>{{ optionLabel(item) }}</td>
              <td><span class="badge">{{ rewardType(item) }}</span></td>
              <td>{{ item.spin_number ?? '—' }}</td>
              <td>{{ formatDate(item.spun_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile: cards -->
      <div class="history-cards mobile-only">
        <div v-for="item in historyItems" :key="'card-' + item.id" class="history-card">
          <div class="history-card-header">
            <span class="user-name">{{ item.user?.name ?? '—' }}</span>
            <span class="badge">#{{ item.spin_number ?? '—' }}</span>
          </div>
          <div class="history-card-body">
            <div class="history-card-row">
              <span class="history-card-label">Option / Reward</span>
              <span>{{ optionLabel(item) }}</span>
            </div>
            <div class="history-card-row">
              <span class="history-card-label">Type</span>
              <span class="badge">{{ rewardType(item) }}</span>
            </div>
            <div class="history-card-row">
              <span class="history-card-label">Spun at</span>
              <span>{{ formatDate(item.spun_at) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="meta.last_page > 1" class="pagination">
        <button type="button" class="action-btn secondary" :disabled="meta.current_page <= 1" @click="fetchHistory(meta.current_page - 1)">
          Previous
        </button>
        <span class="page-info">Page {{ meta.current_page }} of {{ meta.last_page }} ({{ meta.total }} total)</span>
        <button type="button" class="action-btn secondary" :disabled="meta.current_page >= meta.last_page" @click="fetchHistory(meta.current_page + 1)">
          Next
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { spinWheelAdminApi } from '@/api/spinWheelAdmin'

const loading = ref(false)
const fetchError = ref(null)
const historyItems = ref([])
const meta = reactive({
  current_page: 1,
  last_page: 1,
  per_page: 15,
  total: 0
})

const filters = reactive({
  user_id: '',
  reward_type: ''
})

/** Option label from item.option (label or option.reward.label) */
function optionLabel(item) {
  const opt = item?.option
  if (!opt) return '—'
  return opt.label ?? opt.reward?.label ?? '—'
}

/** Reward type from item.option.reward.type */
function rewardType(item) {
  return item?.option?.reward?.type ?? '—'
}

function formatDate(s) {
  if (!s) return '—'
  const d = new Date(s)
  return isNaN(d.getTime()) ? s : d.toLocaleString()
}

async function fetchHistory(page = 1) {
  loading.value = true
  fetchError.value = null
  const params = { page, per_page: 15 }
  if (filters.user_id) params.user_id = filters.user_id
  if (filters.reward_type) params.reward_type = filters.reward_type
  try {
    const res = await spinWheelAdminApi.getHistory(params)
    const data = res?.data
    historyItems.value = Array.isArray(data) ? data : []
    const m = res?.meta ?? res?.pagination ?? {}
    meta.current_page = m.current_page ?? page
    meta.last_page = m.last_page ?? 1
    meta.per_page = m.per_page ?? 15
    meta.total = m.total ?? historyItems.value.length
  } catch (err) {
    fetchError.value = err.response?.data?.message ?? err.message ?? 'Failed to load history'
  } finally {
    loading.value = false
  }
}

onMounted(() => fetchHistory(1))
</script>

<style scoped>
.spin-wheel-history {
  max-width: 100%;
}

.section-header {
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.75rem;
  font-weight: 800;
  background: linear-gradient(135deg, #8b5cf6, #06b6d4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 0.25rem 0;
}

.section-subtitle {
  font-size: 0.9375rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

.filters-row {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.filter-group label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
}

.filter-group input,
.filter-group select {
  padding: 0.5rem 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.95);
  min-width: 140px;
}

.action-btn {
  padding: 0.5rem 1rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
}

.action-btn.primary {
  background: linear-gradient(135deg, #8b5cf6, #06b6d4);
  color: white;
}

.action-btn.secondary {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
  border-color: rgba(255, 255, 255, 0.2);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 2rem;
  color: rgba(255, 255, 255, 0.8);
}

.spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 1rem;
  border: 3px solid rgba(139, 92, 246, 0.3);
  border-top-color: #8b5cf6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.table-wrap {
  overflow-x: auto;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  margin-bottom: 1rem;
}

.history-table {
  width: 100%;
  border-collapse: collapse;
}

.history-table th,
.history-table td {
  padding: 0.875rem 1rem;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.history-table th {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.8125rem;
  text-transform: uppercase;
}

.user-name {
  display: block;
  font-weight: 500;
}

.user-meta {
  display: block;
  font-size: 0.8125rem;
  color: rgba(255, 255, 255, 0.6);
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
  font-size: 0.8125rem;
}

.badge-success {
  background: rgba(34, 197, 94, 0.2);
  color: #86efac;
}

.badge-warning {
  background: rgba(234, 179, 8, 0.2);
  color: #fde047;
}

.badge-info {
  background: rgba(59, 130, 246, 0.2);
  color: #93c5fd;
}

.badge-muted {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
}

.pagination {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
}

.page-info {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
}

/* Mobile: cards (shown on small screens) */
.history-cards.mobile-only {
  display: none;
}

.history-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  padding: 1rem 1.25rem;
  margin-bottom: 0.75rem;
}

.history-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.history-card-body {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.history-card-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.9);
}

.history-card-label {
  font-size: 0.8125rem;
  color: rgba(255, 255, 255, 0.55);
  flex-shrink: 0;
}

/* Mobile layout and touch targets */
@media (max-width: 768px) {
  .desktop-only {
    display: none !important;
  }

  .mobile-only {
    display: block !important;
  }

  .history-cards.mobile-only {
    display: flex;
    flex-direction: column;
    margin-bottom: 1rem;
  }

  .section-header {
    margin-bottom: 1.25rem;
  }

  .section-title {
    font-size: 1.35rem;
    line-height: 1.25;
  }

  .section-subtitle {
    font-size: 0.8125rem;
    line-height: 1.4;
  }

  .filters-row {
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1.5rem;
    padding: 1.25rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 14px;
  }

  .filter-group {
    width: 100%;
  }

  .filter-group label {
    font-size: 0.875rem;
    margin-bottom: 0.25rem;
  }

  .filter-group input,
  .filter-group select {
    width: 100%;
    min-width: 0;
    min-height: 48px;
    padding: 0.75rem 1rem;
    font-size: 1rem;
    border-radius: 12px;
    -webkit-appearance: none;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.5)' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    padding-right: 2.5rem;
  }

  .filter-group input[type="number"] {
    background-image: none;
    padding-right: 1rem;
  }

  .filters-row .action-btn.primary {
    width: 100%;
    min-height: 48px;
    padding: 0.875rem 1.25rem;
    font-size: 1rem;
    border-radius: 12px;
    margin-top: 0.25rem;
  }

  .loading-state,
  .error-state,
  .empty-state {
    padding: 2.5rem 1.25rem;
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.02);
    margin: 0 0 1rem 0;
  }

  .empty-state p,
  .loading-state p,
  .error-state p {
    font-size: 0.9375rem;
  }

  .error-state .action-btn {
    min-height: 48px;
    padding: 0.875rem 1.25rem;
    font-size: 1rem;
    border-radius: 12px;
  }

  .pagination {
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem 0;
  }

  .pagination .action-btn {
    width: 100%;
    min-height: 48px;
    padding: 0.875rem 1.25rem;
    font-size: 1rem;
    border-radius: 12px;
  }

  .page-info {
    text-align: center;
    font-size: 0.8125rem;
  }
}

@media (min-width: 769px) {
  .desktop-only {
    display: block !important;
  }

  .mobile-only {
    display: none !important;
  }
}
</style>
