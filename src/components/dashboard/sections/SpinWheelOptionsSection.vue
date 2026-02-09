<template>
  <div class="spin-wheel-options">
    <div class="section-header">
      <div class="header-info">
        <h1 class="section-title">Spin Wheel Options</h1>
        <p class="section-subtitle">Manage wheel segments (rewards): label, type, value, weight, and caps</p>
      </div>
      <div class="header-actions">
        <button type="button" class="action-btn primary" @click="openCreate">
          <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Add Option
        </button>
      </div>
    </div>

    <div v-if="toastMessage" class="toast" :class="toastType">{{ toastMessage }}</div>

    <div v-if="loading && !options.length" class="loading-state">
      <div class="spinner"></div>
      <p>Loading options…</p>
    </div>
    <div v-else-if="fetchError" class="error-state">
      <p>{{ fetchError }}</p>
      <button type="button" class="action-btn secondary" @click="loadOptions">Retry</button>
    </div>
    <div v-else-if="!options.length" class="empty-state">
      <p>No options yet. Add your first wheel segment.</p>
      <button type="button" class="action-btn primary" @click="openCreate">Add Option</button>
    </div>
    <div v-else class="content-wrap">
      <div class="table-wrap desktop-only">
        <table class="options-table">
          <thead>
            <tr>
              <th>Label</th>
              <th>Reward type</th>
              <th>Value</th>
              <th>Weight</th>
              <th>Max claims/period</th>
              <th>Order</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="opt in options" :key="opt.id">
              <td>{{ opt.label }}</td>
              <td><span class="badge">{{ rewardTypeLabel(opt.reward_type) }}</span></td>
              <td>{{ valueDisplay(opt) }}</td>
              <td>{{ opt.weight }}</td>
              <td>{{ opt.max_claims_per_period ?? '—' }}</td>
              <td>{{ opt.display_order ?? '—' }}</td>
              <td><span :class="['badge', opt.is_active ? 'badge-success' : 'badge-muted']">{{ opt.is_active ? 'Yes' : 'No' }}</span></td>
              <td>
                <button type="button" class="action-btn small primary" @click="openEdit(opt)" title="Edit">Edit</button>
                <button type="button" class="action-btn small danger" @click="confirmDelete(opt)" title="Delete">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="spin-wheel-options-cards mobile-only">
        <div
          v-for="(opt, index) in options"
          :key="opt.id"
          class="option-card"
          role="button"
          tabindex="0"
          @click="openEdit(opt)"
          @keydown.enter="openEdit(opt)"
          @keydown.space.prevent="openEdit(opt)"
        >
          <div class="option-card-weight" :class="weightTierClass(opt.weight)">{{ opt.weight }}</div>
          <div class="option-card-main">
            <div class="option-card-header">
              <span class="option-card-label">{{ opt.label }}</span>
              <span :class="['option-card-type', opt.is_active ? 'badge-success' : 'badge-muted']">{{ opt.is_active ? 'Active' : 'Inactive' }}</span>
            </div>
            <div class="option-card-meta">
              <span class="option-card-type-badge">{{ rewardTypeLabel(opt.reward_type) }}</span>
              <span class="option-card-value">{{ valueDisplay(opt) }}</span>
              <span v-if="opt.max_claims_per_period != null" class="option-card-cap">Cap: {{ opt.max_claims_per_period }}</span>
            </div>
            <div class="option-card-actions" @click.stop>
              <button type="button" class="btn-card btn-edit" @click="openEdit(opt)" :aria-label="'Edit ' + opt.label">
                <svg class="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Edit
              </button>
              <button type="button" class="btn-card btn-delete" @click="confirmDelete(opt)" :aria-label="'Delete ' + opt.label">
                <svg class="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M10 11v6M14 11v6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                Delete
              </button>
            </div>
          </div>
          <div class="option-card-chevron" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal – same pattern as Add Expense (Teleport, session-form-modal-overlay) -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showModal" class="session-form-modal-overlay" @click.self="closeModal">
          <div class="spin-wheel-options__modal spin-wheel-options__modal--form" @click.stop>
            <div class="spin-wheel-options__modal-header">
              <h3>{{ editingId ? 'Edit option' : 'New option' }}</h3>
              <button type="button" class="spin-wheel-options__modal-close" @click="closeModal" aria-label="Close">×</button>
            </div>
            <div class="spin-wheel-options__modal-body">
              <form @submit.prevent="submitForm" class="modal-form">
          <div class="form-row">
            <label>Label</label>
            <input v-model="form.label" type="text" required placeholder="e.g. 50 Points" />
            <span v-if="formErrors.label" class="field-error">{{ formErrors.label }}</span>
          </div>
          <div class="form-row">
            <label>Reward type</label>
            <select v-model="form.reward_type" @change="onRewardTypeChange">
              <option v-for="rt in rewardTypes" :key="rt.value" :value="rt.value">{{ rt.label }}</option>
            </select>
          </div>
          <div v-if="form.reward_type !== 'free_product'" class="form-row">
            <label>Value</label>
            <input v-model.number="form.value" type="number" min="0" step="0.01" :placeholder="valuePlaceholder" />
            <span v-if="formErrors.value" class="field-error">{{ formErrors.value }}</span>
          </div>
          <div v-if="form.reward_type === 'free_product'" class="form-row">
            <label>Product</label>
            <select v-model="form.product_id">
              <option :value="null">— Select product —</option>
              <option v-for="p in products" :key="p.id" :value="p.id">{{ p.name }} (ID: {{ p.id }})</option>
            </select>
            <span v-if="formErrors.product_id" class="field-error">{{ formErrors.product_id }}</span>
          </div>
          <div class="form-row">
            <label>Weight (probability)</label>
            <input v-model.number="form.weight" type="number" min="1" required />
            <span v-if="formErrors.weight" class="field-error">{{ formErrors.weight }}</span>
          </div>
          <div class="form-row">
            <label>Max claims per period (optional)</label>
            <input v-model.number="form.max_claims_per_period" type="number" min="0" placeholder="Leave empty for no cap" />
          </div>
          <div class="form-row">
            <label>Display order</label>
            <input v-model.number="form.display_order" type="number" min="0" placeholder="0" />
          </div>
          <div class="form-row row-inline">
            <label class="toggle-label">
              <input type="checkbox" v-model="form.is_active" />
              <span>Active (include in wheel)</span>
            </label>
          </div>
                <div class="spin-wheel-options__modal-actions">
                  <button type="button" class="action-btn secondary" @click="closeModal">Cancel</button>
                  <button type="submit" class="action-btn primary" :disabled="saving">{{ saving ? 'Saving…' : 'Save' }}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Delete confirm – same modal style as expenses -->
    <div v-if="deleteTarget" class="spin-wheel-options__modal-overlay" @click.self="deleteTarget = null">
      <div class="spin-wheel-options__modal spin-wheel-options__modal--sm">
        <div class="spin-wheel-options__modal-header">
          <h3>Delete option?</h3>
          <button type="button" class="spin-wheel-options__modal-close" @click="deleteTarget = null" aria-label="Close">×</button>
        </div>
        <div class="spin-wheel-options__modal-body">
          <p class="spin-wheel-options__modal-text">“{{ deleteTarget.label }}” will be removed from the wheel.</p>
          <div class="spin-wheel-options__modal-actions">
            <button type="button" class="action-btn secondary" @click="deleteTarget = null">Cancel</button>
            <button type="button" class="action-btn danger" :disabled="deleting" @click="doDelete">Delete</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { spinWheelAdminApi } from '@/api/spinWheelAdmin'
import ProductService from '@/api/products'

const loading = ref(true)
const fetchError = ref(null)
const options = ref([])
const rewardTypesFromApi = ref([])
const toastMessage = ref('')
const toastType = ref('success')
const showModal = ref(false)
const editingId = ref(null)
const saving = ref(false)
const formErrors = ref({})
const deleteTarget = ref(null)
const deleting = ref(false)
const products = ref([])

const form = reactive({
  label: '',
  reward_type: 'points',
  value: null,
  product_id: null,
  weight: 10,
  max_claims_per_period: null,
  display_order: 0,
  is_active: true
})

const rewardTypes = computed(() => {
  const fromApi = rewardTypesFromApi.value
  if (fromApi?.length) return fromApi
  return [
    { value: 'points', label: 'Points' },
    { value: 'percent_discount', label: 'Percent discount' },
    { value: 'free_minutes', label: 'Free minutes' },
    { value: 'free_product', label: 'Free product' }
  ]
})

const valuePlaceholder = computed(() => {
  switch (form.reward_type) {
    case 'points': return 'e.g. 50'
    case 'percent_discount': return 'e.g. 10'
    case 'free_minutes': return 'e.g. 30'
    default: return ''
  }
})

function rewardTypeLabel(type) {
  const r = rewardTypes.value.find((x) => x.value === type)
  return r?.label ?? type
}

function valueDisplay(opt) {
  if (opt.reward_type === 'free_product') return opt.product_id ? `Product #${opt.product_id}` : '—'
  return opt.value != null ? opt.value : '—'
}

function weightTierClass(weight) {
  if (weight >= 8) return 'tier-high'
  if (weight >= 4) return 'tier-mid'
  return 'tier-low'
}

function showToast(msg, type = 'success') {
  toastMessage.value = msg
  toastType.value = type
  setTimeout(() => { toastMessage.value = '' }, 4000)
}

async function loadOptions() {
  loading.value = true
  fetchError.value = null
  try {
    const res = await spinWheelAdminApi.getOptions()
    options.value = res?.data ?? (Array.isArray(res) ? res : [])
    rewardTypesFromApi.value = res?.reward_types ?? []
  } catch (err) {
    fetchError.value = err.response?.data?.message ?? err.message ?? 'Failed to load options'
  } finally {
    loading.value = false
  }
}

async function loadProducts() {
  try {
    const data = await ProductService.getAllProducts({ per_page: 500 })
    products.value = data?.products ?? []
  } catch {
    products.value = []
  }
}

function openCreate() {
  editingId.value = null
  form.label = ''
  form.reward_type = 'points'
  form.value = null
  form.product_id = null
  form.weight = 10
  form.max_claims_per_period = null
  form.display_order = options.value.length
  form.is_active = true
  formErrors.value = {}
  showModal.value = true
}

function openEdit(opt) {
  editingId.value = opt.id
  form.label = opt.label ?? ''
  form.reward_type = opt.reward_type ?? 'points'
  form.value = opt.value != null ? opt.value : null
  form.product_id = opt.product_id ?? null
  form.weight = opt.weight ?? 10
  form.max_claims_per_period = opt.max_claims_per_period ?? null
  form.display_order = opt.display_order ?? 0
  form.is_active = opt.is_active ?? true
  formErrors.value = {}
  showModal.value = true
}

function onRewardTypeChange() {
  if (form.reward_type === 'free_product') form.value = null
  else form.product_id = null
}

function closeModal() {
  showModal.value = false
  editingId.value = null
}

function buildPayload() {
  const payload = {
    label: form.label.trim(),
    reward_type: form.reward_type,
    weight: Number(form.weight) || 1,
    max_claims_per_period: form.max_claims_per_period === '' || form.max_claims_per_period == null ? null : Number(form.max_claims_per_period),
    display_order: form.display_order === '' || form.display_order == null ? 0 : Number(form.display_order),
    is_active: form.is_active
  }
  if (form.reward_type === 'free_product') {
    payload.product_id = form.product_id ? Number(form.product_id) : null
    payload.value = null
  } else {
    payload.value = form.value === '' || form.value == null ? null : Number(form.value)
    payload.product_id = null
  }
  return payload
}

async function submitForm() {
  formErrors.value = {}
  saving.value = true
  try {
    const payload = buildPayload()
    if (editingId.value) {
      await spinWheelAdminApi.updateOption(editingId.value, payload)
      showToast('Option updated.')
    } else {
      await spinWheelAdminApi.createOption(payload)
      showToast('Option created.')
    }
    closeModal()
    await loadOptions()
  } catch (err) {
    if (err.response?.status === 422 && err.response?.data?.errors) {
      formErrors.value = err.response.data.errors
      showToast(err.response?.data?.message ?? 'Validation failed.', 'error')
    } else {
      showToast(err.response?.data?.message ?? err.message ?? 'Failed to save.', 'error')
    }
  } finally {
    saving.value = false
  }
}

function confirmDelete(opt) {
  deleteTarget.value = opt
}

async function doDelete() {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    await spinWheelAdminApi.deleteOption(deleteTarget.value.id)
    showToast('Option deleted.')
    deleteTarget.value = null
    await loadOptions()
  } catch (err) {
    showToast(err.response?.data?.message ?? err.message ?? 'Failed to delete.', 'error')
  } finally {
    deleting.value = false
  }
}

watch(showModal, (v) => {
  if (v && form.reward_type === 'free_product') loadProducts()
})

onMounted(loadOptions)
</script>

<style scoped>
.spin-wheel-options {
  max-width: 100%;
}

.section-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
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

.header-actions .action-btn.primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.icon {
  width: 1.25rem;
  height: 1.25rem;
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

.action-btn {
  padding: 0.5rem 1rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s ease;
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

.action-btn.danger {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
  border-color: rgba(239, 68, 68, 0.4);
}

.action-btn.small {
  padding: 0.35rem 0.75rem;
  font-size: 0.8125rem;
  margin-right: 0.5rem;
}

.action-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.table-wrap {
  overflow-x: auto;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
}

.options-table {
  width: 100%;
  border-collapse: collapse;
}

.options-table th,
.options-table td {
  padding: 0.875rem 1rem;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.options-table th {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.8125rem;
  text-transform: uppercase;
}

.options-table tbody tr:hover {
  background: rgba(255, 255, 255, 0.04);
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 500;
}

.badge-success {
  background: rgba(34, 197, 94, 0.2);
  color: #86efac;
}

.badge-muted {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
}

/* Modal – same pattern as Add Expense (overlay uses global .session-form-modal-overlay) */
.spin-wheel-options__modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.spin-wheel-options__modal {
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
  background: linear-gradient(180deg, rgba(20, 20, 28, 0.98) 0%, rgba(15, 15, 23, 0.98) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(139, 92, 246, 0.1);
  animation: spinWheelModalIn 0.3s ease;
}

.spin-wheel-options__modal--form {
  max-width: 600px;
  min-width: 320px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.spin-wheel-options__modal--form .spin-wheel-options__modal-body {
  overflow-y: auto;
  flex: 1 1 auto;
  min-height: 0;
}

.spin-wheel-options__modal--sm {
  max-width: 400px;
}

@keyframes spinWheelModalIn {
  from { opacity: 0; transform: scale(0.96) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.spin-wheel-options__modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.spin-wheel-options__modal-header h3 {
  font-size: 1.125rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
  margin: 0;
}

.spin-wheel-options__modal-close {
  width: 2.25rem;
  height: 2.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.25rem;
  cursor: pointer;
  transition: all 0.2s;
}

.spin-wheel-options__modal-close:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.4);
  color: #f87171;
}

.spin-wheel-options__modal-body {
  padding: 1.5rem;
}

.spin-wheel-options__modal-text {
  margin: 0 0 1rem 0;
  color: rgba(255, 255, 255, 0.8);
}

.spin-wheel-options__modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 0;
  padding-top: 0;
  border-top: none;
}

.spin-wheel-options__modal--form .spin-wheel-options__modal-actions {
  margin-top: 1.25rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
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

.modal-form input,
.modal-form select {
  width: 100%;
  padding: 0.65rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.95);
  font-size: 0.9375rem;
}

.modal-form .row-inline {
  display: flex;
  align-items: center;
}

.modal-form .toggle-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  margin: 0;
}

.modal-form .toggle-label input {
  width: auto;
}

.field-error {
  display: block;
  font-size: 0.8125rem;
  color: #fca5a5;
  margin-top: 0.25rem;
}

/* Desktop: table visible. Mobile: cards visible. */
.content-wrap {
  position: relative;
}
.desktop-only {
  display: block;
}
.mobile-only {
  display: none;
}

/* Mobile option cards – levels-cards style */
.spin-wheel-options-cards {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-bottom: env(safe-area-inset-bottom, 0);
}

.option-card {
  display: flex;
  align-items: stretch;
  min-height: 72px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 18px;
  overflow: hidden;
  transition: background 0.2s ease, border-color 0.2s ease, transform 0.15s ease;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.option-card:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(139, 92, 246, 0.25);
}
.option-card:active {
  transform: scale(0.99);
}

.option-card-weight {
  width: 3rem;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.05);
}
.option-card-weight.tier-high { color: #86efac; background: rgba(34, 197, 94, 0.15); }
.option-card-weight.tier-mid { color: #fcd34d; background: rgba(251, 191, 36, 0.15); }
.option-card-weight.tier-low { color: rgba(139, 92, 246, 0.9); background: rgba(139, 92, 246, 0.12); }

.option-card-main {
  flex: 1;
  min-width: 0;
  padding: 1rem 0.75rem 1rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.option-card-header {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.option-card-label {
  font-size: 1.0625rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
  line-height: 1.3;
}

.option-card-type.badge-success {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.2rem 0.45rem;
  border-radius: 8px;
}
.option-card-type.badge-muted {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.2rem 0.45rem;
  border-radius: 8px;
}

.option-card-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.55);
}

.option-card-type-badge {
  font-weight: 600;
  color: #c4b5fd;
  background: rgba(139, 92, 246, 0.2);
  padding: 0.2rem 0.45rem;
  border-radius: 8px;
}

.option-card-value {
  font-weight: 500;
}

.option-card-cap {
  font-size: 0.8125rem;
  color: rgba(255, 255, 255, 0.45);
}

.option-card-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.option-card-actions .btn-card {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  min-height: 44px;
  padding: 0.5rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  flex: 1;
  -webkit-tap-highlight-color: transparent;
}

.option-card-actions .btn-card .btn-icon {
  width: 1.125rem;
  height: 1.125rem;
  flex-shrink: 0;
}

.option-card-actions .btn-card.btn-edit {
  background: rgba(139, 92, 246, 0.22);
  color: #c4b5fd;
}
.option-card-actions .btn-card.btn-edit:hover,
.option-card-actions .btn-card.btn-edit:focus-visible {
  background: rgba(139, 92, 246, 0.35);
}

.option-card-actions .btn-card.btn-delete {
  background: rgba(239, 68, 68, 0.15);
  color: #fca5a5;
}
.option-card-actions .btn-card.btn-delete:hover,
.option-card-actions .btn-card.btn-delete:focus-visible {
  background: rgba(239, 68, 68, 0.28);
}

.option-card-chevron {
  display: flex;
  align-items: center;
  padding: 0 0.75rem;
  color: rgba(255, 255, 255, 0.35);
}
.option-card-chevron svg {
  width: 1.25rem;
  height: 1.25rem;
}

/* Mobile: show cards, hide table; modal touch targets */
@media (max-width: 768px) {
  .desktop-only {
    display: none !important;
  }

  .mobile-only {
    display: flex !important;
  }

  .spin-wheel-options-cards.mobile-only {
    display: flex !important;
    flex-direction: column;
  }

  .section-header {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }

  .header-actions .action-btn.primary {
    width: 100%;
    justify-content: center;
    min-height: 48px;
    padding: 0.875rem 1rem;
    font-size: 1rem;
    border-radius: 14px;
  }

  .section-title {
    font-size: 1.25rem;
  }

  .section-subtitle {
    font-size: 0.8125rem;
  }

  .spin-wheel-options__modal-overlay {
    padding: 0.5rem;
  }

  .spin-wheel-options__modal {
    max-width: 100%;
    max-height: calc(100vh - 2rem);
    border-radius: 12px;
  }

  .spin-wheel-options__modal-body {
    padding: 1.25rem;
  }

  .modal-form .form-row {
    margin-bottom: 1.25rem;
  }

  .modal-form input,
  .modal-form select {
    min-height: 48px;
    padding: 0.875rem 1rem;
    font-size: 1rem;
    border-radius: 14px;
  }

  .spin-wheel-options__modal-actions {
    padding-bottom: env(safe-area-inset-bottom, 0);
  }

  .spin-wheel-options__modal-actions .action-btn {
    min-height: 48px;
    padding: 0.875rem 1.25rem;
    font-size: 1rem;
    border-radius: 14px;
    flex: 1;
  }
}
</style>
