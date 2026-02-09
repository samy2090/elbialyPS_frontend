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
    <div v-else class="table-wrap">
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

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-card">
        <h3 class="modal-title">{{ editingId ? 'Edit option' : 'New option' }}</h3>
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
          <div class="modal-actions">
            <button type="button" class="action-btn secondary" @click="closeModal">Cancel</button>
            <button type="submit" class="action-btn primary" :disabled="saving">{{ saving ? 'Saving…' : 'Save' }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete confirm -->
    <div v-if="deleteTarget" class="modal-overlay" @click.self="deleteTarget = null">
      <div class="modal-card modal-confirm">
        <h3>Delete option?</h3>
        <p>“{{ deleteTarget.label }}” will be removed from the wheel.</p>
        <div class="modal-actions">
          <button type="button" class="action-btn secondary" @click="deleteTarget = null">Cancel</button>
          <button type="button" class="action-btn danger" :disabled="deleting" @click="doDelete">Delete</button>
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
  max-width: 480px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0 0 1.25rem 0;
  color: rgba(255, 255, 255, 0.95);
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

.modal-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-confirm p {
  margin: 0 0 1rem 0;
  color: rgba(255, 255, 255, 0.8);
}
</style>
