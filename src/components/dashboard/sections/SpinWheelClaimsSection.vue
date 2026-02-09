<template>
  <div class="spin-wheel-claims">
    <div class="section-header">
      <div class="header-info">
        <h1 class="section-title">Spin Wheel Claims</h1>
        <p class="section-subtitle">View and fulfill user claims; mark non-points rewards as fulfilled</p>
      </div>
    </div>

    <div v-if="toastMessage" class="toast" :class="toastType">{{ toastMessage }}</div>

    <div class="filters-row">
      <div class="filter-group">
        <label>Status</label>
        <CustomDropdown
          v-model="filters.status"
          :options="statusOptions"
          option-value="value"
          option-label="label"
          placeholder="All"
          class="filter-dropdown"
          @change="fetchClaims(1)"
        />
      </div>
      <div class="filter-group">
        <label>User</label>
        <input
          v-model.trim="filters.user"
          type="text"
          placeholder="Name, username, email or phone"
          @keyup.enter="fetchClaims(1)"
        />
      </div>
      <div class="filter-group">
        <label>Reward type</label>
        <CustomDropdown
          v-model="filters.reward_type"
          :options="rewardTypeOptions"
          option-value="value"
          option-label="label"
          placeholder="All"
          class="filter-dropdown"
          @change="fetchClaims(1)"
        />
      </div>
      <button type="button" class="action-btn primary" @click="fetchClaims(1)">Apply</button>
    </div>

    <div v-if="loading && !claims.length" class="loading-state">
      <div class="spinner"></div>
      <p>Loading claims…</p>
    </div>
    <div v-else-if="fetchError" class="error-state">
      <p>{{ fetchError }}</p>
      <button type="button" class="action-btn secondary" @click="fetchClaims(meta.current_page)">Retry</button>
    </div>
    <div v-else-if="!claims.length" class="empty-state">
      <p>No claims match the filters.</p>
    </div>
    <template v-else>
      <!-- Desktop: table -->
      <div class="table-wrap desktop-only">
        <table class="claims-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Option</th>
              <th>Reward type</th>
              <th>Reward value</th>
              <th>Status</th>
              <th>Created</th>
              <th>Fulfilled</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in claims" :key="c.id">
              <td>
                <span class="user-name">{{ c.user?.name ?? '—' }}</span>
                <span class="user-email">{{ c.user?.email ?? '' }}</span>
              </td>
              <td>{{ c.option?.label ?? '—' }}</td>
              <td><span class="badge">{{ c.reward_type }}</span></td>
              <td>{{ rewardValueLabel(c.reward_value) }}</td>
              <td><span :class="['badge', 'badge-' + statusClass(c.status)]">{{ c.status }}</span></td>
              <td>{{ formatDate(c.created_at) }}</td>
              <td>{{ c.fulfilled_at ? formatDate(c.fulfilled_at) : '—' }}</td>
              <td>
                <button
                  v-if="c.status === 'pending' && c.reward_type !== 'points'"
                  type="button"
                  class="action-btn small primary"
                  @click="openFulfill(c)"
                >
                  Fulfill
                </button>
                <span v-else class="muted">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile: cards -->
      <div class="claims-cards mobile-only">
        <div v-for="c in claims" :key="'card-' + c.id" class="claim-card">
          <div class="claim-card-header">
            <span class="user-name">{{ c.user?.name ?? '—' }}</span>
            <span :class="['badge', 'badge-' + statusClass(c.status)]">{{ c.status }}</span>
          </div>
          <div class="claim-card-body">
            <div class="claim-card-row">
              <span class="claim-card-label">Option</span>
              <span>{{ c.option?.label ?? '—' }}</span>
            </div>
            <div class="claim-card-row">
              <span class="claim-card-label">Reward</span>
              <span><span class="badge">{{ c.reward_type }}</span> {{ rewardValueLabel(c.reward_value) }}</span>
            </div>
            <div class="claim-card-row">
              <span class="claim-card-label">Created</span>
              <span>{{ formatDate(c.created_at) }}</span>
            </div>
            <div v-if="c.fulfilled_at" class="claim-card-row">
              <span class="claim-card-label">Fulfilled</span>
              <span>{{ formatDate(c.fulfilled_at) }}</span>
            </div>
          </div>
          <div class="claim-card-actions">
            <button
              v-if="c.status === 'pending' && c.reward_type !== 'points'"
              type="button"
              class="action-btn primary"
              @click="openFulfill(c)"
            >
              Fulfill
            </button>
          </div>
        </div>
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

    <!-- Fulfill modal -->
    <div v-if="fulfillTarget" class="modal-overlay" @click.self="fulfillTarget = null">
      <div class="modal-card">
        <h3 class="modal-title">Mark as fulfilled</h3>
        <p class="modal-desc">Claim: {{ fulfillTarget.option?.label }} for {{ fulfillTarget.user?.name }}.</p>
        <form @submit.prevent="submitFulfill" class="modal-form">
          <div class="form-row">
            <label>Fulfillment notes (optional, max 500)</label>
            <textarea v-model="fulfillNotes" rows="3" maxlength="500" placeholder="e.g. Code sent via email"></textarea>
          </div>
          <div class="modal-actions">
            <button type="button" class="action-btn secondary" @click="fulfillTarget = null">Cancel</button>
            <button type="submit" class="action-btn primary" :disabled="fulfilling">{{ fulfilling ? 'Saving…' : 'Mark fulfilled' }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { spinWheelAdminApi } from '@/api/spinWheelAdmin'
import CustomDropdown from '@/components/base/ui/CustomDropdown.vue'

const statusOptions = [
  { value: '', label: 'All' },
  { value: 'granted', label: 'Granted' },
  { value: 'fulfilled', label: 'Fulfilled' }
]

const rewardTypeOptions = [
  { value: '', label: 'All' },
  { value: 'points', label: 'Points' },
  { value: 'percent_discount', label: 'Percent discount' },
  { value: 'free_minutes', label: 'Free minutes' },
  { value: 'free_product', label: 'Free product' }
]

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
  user: '',
  reward_type: ''
})

const toastMessage = ref('')
const toastType = ref('success')
const fulfillTarget = ref(null)
const fulfillNotes = ref('')
const fulfilling = ref(false)

function showToast(msg, type = 'success') {
  toastMessage.value = msg
  toastType.value = type
  setTimeout(() => { toastMessage.value = '' }, 4000)
}

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
  const params = {
    page,
    per_page: 15
  }
  if (filters.status) params.status = filters.status
  if (filters.user) params.user = filters.user
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
    fetchError.value = err.response?.data?.message ?? err.message ?? 'Failed to load claims'
  } finally {
    loading.value = false
  }
}

function openFulfill(claim) {
  fulfillTarget.value = claim
  fulfillNotes.value = ''
}

async function submitFulfill() {
  if (!fulfillTarget.value) return
  fulfilling.value = true
  try {
    await spinWheelAdminApi.fulfillClaim(fulfillTarget.value.id, {
      fulfillment_notes: fulfillNotes.value?.trim() || null
    })
    showToast('Claim marked as fulfilled.')
    fulfillTarget.value = null
    await fetchClaims(meta.current_page)
  } catch (err) {
    showToast(err.response?.data?.message ?? err.message ?? 'Failed to fulfill.', 'error')
  } finally {
    fulfilling.value = false
  }
}

onMounted(() => fetchClaims(1))
</script>

<style scoped>
.spin-wheel-claims {
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

.toast {
  padding: 1rem 1.25rem;
  border-radius: 12px;
  margin-bottom: 1rem;
}

.toast.success {
  background: rgba(34, 197, 94, 0.15);
  border: 1px solid rgba(34, 197, 94, 0.4);
  color: #86efac;
}

.toast.error {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.4);
  color: #fca5a5;
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

.filter-dropdown {
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

.action-btn.small {
  padding: 0.35rem 0.75rem;
  font-size: 0.8125rem;
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

.claims-table {
  width: 100%;
  border-collapse: collapse;
}

.claims-table th,
.claims-table td {
  padding: 0.875rem 1rem;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.claims-table th {
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

.muted {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.875rem;
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

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-card {
  background: rgba(15, 15, 23, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 1.5rem 2rem;
  max-width: 440px;
  width: 100%;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: rgba(255, 255, 255, 0.95);
}

.modal-desc {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 1rem 0;
}

.modal-form .form-row {
  margin-bottom: 1rem;
}

.modal-form label {
  display: block;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 0.35rem;
  font-size: 0.875rem;
}

.modal-form textarea {
  width: 100%;
  padding: 0.65rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.95);
  font-size: 0.9375rem;
  resize: vertical;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* Mobile: cards (shown on small screens) */
.claims-cards.mobile-only {
  display: none;
}

.claim-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  padding: 1rem 1.25rem;
  margin-bottom: 0.75rem;
}

.claim-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.claim-card-body {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.claim-card-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.9);
}

.claim-card-label {
  font-size: 0.8125rem;
  color: rgba(255, 255, 255, 0.55);
  flex-shrink: 0;
}

.claim-card-actions {
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.claim-card-actions .action-btn {
  width: 100%;
  justify-content: center;
}

/* Mobile layout and touch targets */
@media (max-width: 768px) {
  .desktop-only {
    display: none !important;
  }

  .mobile-only {
    display: block !important;
  }

  .claims-cards.mobile-only {
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

  .claim-card-actions .action-btn {
    min-height: 48px;
    padding: 0.875rem 1.25rem;
    font-size: 1rem;
    border-radius: 12px;
  }

  .modal-overlay {
    padding: 0.75rem;
    align-items: flex-end;
  }

  .modal-card {
    max-width: 100%;
    border-radius: 16px 16px 0 0;
    padding: 1.5rem 1.25rem;
    padding-bottom: calc(1.5rem + env(safe-area-inset-bottom, 0));
  }

  .modal-actions {
    flex-direction: column;
    gap: 0.75rem;
    padding-top: 1.25rem;
  }

  .modal-actions .action-btn {
    min-height: 48px;
    padding: 0.875rem 1.25rem;
    font-size: 1rem;
    border-radius: 12px;
    width: 100%;
    justify-content: center;
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
