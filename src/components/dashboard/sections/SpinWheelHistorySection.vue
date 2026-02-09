<template>
  <div class="spin-wheel-history">
    <div class="section-header">
      <div class="header-info">
        <h1 class="section-title">Spin Wheel History</h1>
        <p class="section-subtitle">Claim history across all users (spins and rewards)</p>
      </div>
    </div>

    <div v-if="fetchError" class="error-state">
      <p>{{ fetchError }}</p>
      <button type="button" class="action-btn secondary" @click="fetchClaims(1)">Retry</button>
    </div>

    <div class="filters-row">
      <div class="filter-group">
        <label>User ID</label>
        <input v-model.number="filters.user_id" type="number" min="1" placeholder="Optional" @keyup.enter="fetchClaims(1)" />
      </div>
      <div class="filter-group">
        <label>Reward type</label>
        <select v-model="filters.reward_type" @change="fetchClaims(1)">
          <option value="">All</option>
          <option value="points">Points</option>
          <option value="percent_discount">Percent discount</option>
          <option value="free_minutes">Free minutes</option>
          <option value="free_product">Free product</option>
        </select>
      </div>
      <div class="filter-group">
        <label>Status</label>
        <select v-model="filters.status" @change="fetchClaims(1)">
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="granted">Granted</option>
          <option value="fulfilled">Fulfilled</option>
        </select>
      </div>
      <button type="button" class="action-btn primary" @click="fetchClaims(1)">Apply</button>
    </div>

    <div v-if="loading && !claims.length" class="loading-state">
      <div class="spinner"></div>
      <p>Loading history…</p>
    </div>
    <div v-else-if="!claims.length" class="empty-state">
      <p>No claim history yet.</p>
    </div>
    <template v-else>
      <div class="table-wrap">
        <table class="history-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Option / Reward</th>
              <th>Type</th>
              <th>Claimed at</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in claims" :key="c.id">
              <td>
                <span class="user-name">{{ c.user?.name ?? '—' }}</span>
                <span class="user-email">{{ c.user?.email ?? '' }}</span>
              </td>
              <td>{{ c.option?.label ?? rewardValueLabel(c.reward_value) }}</td>
              <td><span class="badge">{{ c.reward_type }}</span></td>
              <td>{{ formatDate(c.created_at) }}</td>
              <td><span :class="['badge', 'badge-' + statusClass(c.status)]">{{ c.status }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="meta.last_page > 1" class="pagination">
        <button type="button" class="action-btn secondary" :disabled="meta.current_page <= 1" @click="fetchClaims(meta.current_page - 1)">
          Previous
        </button>
        <span class="page-info">Page {{ meta.current_page }} of {{ meta.last_page }} ({{ meta.total }} total)</span>
        <button type="button" class="action-btn secondary" :disabled="meta.current_page >= meta.last_page" @click="fetchClaims(meta.current_page + 1)">
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
const claims = ref([])
const meta = reactive({
  current_page: 1,
  last_page: 1,
  per_page: 15,
  total: 0
})

const filters = reactive({
  status: '',
  user_id: '',
  reward_type: ''
})

function rewardValueLabel(rv) {
  if (!rv) return '—'
  return rv.label ?? (rv.value != null ? String(rv.value) : '—')
}

function formatDate(s) {
  if (!s) return '—'
  const d = new Date(s)
  return isNaN(d.getTime()) ? s : d.toLocaleString()
}

function statusClass(status) {
  if (status === 'granted') return 'success'
  if (status === 'pending') return 'warning'
  if (status === 'fulfilled') return 'info'
  return 'muted'
}

async function fetchClaims(page = 1) {
  loading.value = true
  fetchError.value = null
  const params = { page, per_page: 15 }
  if (filters.status) params.status = filters.status
  if (filters.user_id) params.user_id = filters.user_id
  if (filters.reward_type) params.reward_type = filters.reward_type
  try {
    const res = await spinWheelAdminApi.getClaims(params)
    claims.value = res?.data ?? []
    const m = res?.meta ?? res?.pagination ?? {}
    meta.current_page = m.current_page ?? page
    meta.last_page = m.last_page ?? 1
    meta.per_page = m.per_page ?? 15
    meta.total = m.total ?? 0
  } catch (err) {
    fetchError.value = err.response?.data?.message ?? err.message ?? 'Failed to load history'
  } finally {
    loading.value = false
  }
}

onMounted(() => fetchClaims(1))
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

.user-email {
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
</style>
