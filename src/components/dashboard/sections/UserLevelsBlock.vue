<template>
  <div class="user-levels-block">
    <div class="settings-section levels-section">
      <!-- Header: compact on mobile, no overlapping decoration -->
      <div class="section-header">
        <div class="section-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="section-title-row">
          <h2 class="section-title">User Levels (Loyalty Tiers)</h2>
          <p class="section-description">Levels are based on total points; users get the highest level where their points ≥ min points.</p>
          <button type="button" class="add-level-btn" @click="openCreate">
            <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Add Level
          </button>
        </div>
      </div>

      <!-- Toast message (mobile-friendly, auto-dismiss) -->
      <Transition name="toast">
        <div v-if="levelsMessage" class="levels-toast" :class="levelsMessageType" role="status">
          <span class="toast-icon" aria-hidden="true">
            <svg v-if="levelsMessageType === 'success'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </span>
          {{ levelsMessage }}
        </div>
      </Transition>

      <div v-if="levelsError" class="alert alert-error">
        {{ levelsError }}
        <button type="button" class="retry-btn" @click="loadLevels">Retry</button>
      </div>

      <div v-if="levelsLoading" class="levels-loading">
        <div class="loading-spinner" aria-hidden="true"></div>
        <p>Loading levels…</p>
      </div>

      <!-- Empty state: clear CTA for mobile -->
      <div v-else-if="levels.length === 0" class="empty-state">
        <div class="empty-state-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h3 class="empty-state-title">No levels yet</h3>
        <p class="empty-state-desc">Create loyalty tiers like Bronze, Silver, and Gold so users can earn rewards by points.</p>
        <button type="button" class="empty-state-cta" @click="openCreate">
          <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Create first level
        </button>
      </div>

      <!-- When we have levels: table on desktop, cards on mobile -->
      <template v-else>
        <div class="levels-table-wrap desktop-only">
          <table class="levels-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Min points</th>
                <th>Perks</th>
                <th>Order</th>
                <th class="th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="level in levels" :key="level.id">
                <td>{{ level.name }}</td>
                <td>{{ formatMinPoints(level.min_points) }}</td>
                <td>{{ formatPerks(level.perks) }}</td>
                <td>{{ level.sort_order }}</td>
                <td class="td-actions">
                  <button type="button" class="btn-action btn-edit" @click="openEdit(level)" title="Edit">Edit</button>
                  <button type="button" class="btn-action btn-delete" @click="confirmDelete(level)" title="Delete">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="levels-cards mobile-only">
          <div
            v-for="(level, index) in levels"
            :key="level.id"
            class="level-card"
            role="button"
            tabindex="0"
            @click="openEdit(level)"
            @keydown.enter="openEdit(level)"
            @keydown.space.prevent="openEdit(level)"
          >
            <div class="level-card-tier" :class="getTierClass(index)">{{ level.sort_order }}</div>
            <div class="level-card-main">
              <div class="level-card-header">
                <span class="level-card-name">{{ level.name }}</span>
                <span class="level-card-perks-pill" v-if="hasPerks(level.perks)">{{ formatPerks(level.perks) }}</span>
              </div>
              <div class="level-card-meta">
                <span class="level-card-points">{{ formatMinPoints(level.min_points) }} pts min</span>
              </div>
              <div class="level-card-actions" @click.stop>
                <button type="button" class="btn-card btn-edit" @click="openEdit(level)" :aria-label="'Edit ' + level.name">
                  <svg class="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  Edit
                </button>
                <button type="button" class="btn-card btn-delete" @click="confirmDelete(level)" :aria-label="'Delete ' + level.name">
                  <svg class="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M10 11v6M14 11v6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                  Delete
                </button>
              </div>
            </div>
            <div class="level-card-chevron" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Create/Edit Modal (bottom-sheet on mobile) -->
    <Teleport to="body">
      <Transition name="modal-slide">
        <div v-if="showFormModal" class="level-modal-overlay" @click="closeFormModal">
          <div class="level-modal level-form-modal" @click.stop>
            <div class="modal-sheet-handle" aria-hidden="true"></div>
            <div class="modal-header">
              <h3>{{ editingLevel ? 'Edit Level' : 'Add Level' }}</h3>
              <button type="button" class="close-btn" @click="closeFormModal" aria-label="Close">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
            <div class="modal-body">
              <div v-if="formError" class="alert alert-error">{{ formError }}</div>
              <form class="level-form" @submit.prevent="submitForm">
                <div class="form-row">
                  <label for="level-name">Name <span class="required">*</span></label>
                  <input
                    id="level-name"
                    v-model="form.name"
                    type="text"
                    maxlength="255"
                    placeholder="e.g. Bronze, Silver, Gold"
                    class="setting-input"
                    :class="{ 'input-error': fieldError('name') }"
                  />
                  <span v-if="fieldError('name')" class="field-error">{{ fieldError('name') }}</span>
                </div>
                <div class="form-row">
                  <label for="level-min-points">Minimum points <span class="required">*</span></label>
                  <input
                    id="level-min-points"
                    v-model.number="form.min_points"
                    type="number"
                    min="0"
                    placeholder="0"
                    class="setting-input"
                    :class="{ 'input-error': fieldError('min_points') }"
                  />
                  <span v-if="fieldError('min_points')" class="field-error">{{ fieldError('min_points') }}</span>
                </div>
                <div class="form-row">
                  <label for="level-discount">Discount % (perk)</label>
                  <input
                    id="level-discount"
                    v-model.number="form.discount_percent"
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    placeholder="Leave empty for no discount"
                    class="setting-input"
                  />
                  <p class="form-hint mobile-hide">Stored as perks: {"discount_percent": value}. Empty = no discount.</p>
                </div>
                <div class="form-row">
                  <label for="level-sort-order">Sort order</label>
                  <input
                    id="level-sort-order"
                    v-model.number="form.sort_order"
                    type="number"
                    min="0"
                    placeholder="0"
                    class="setting-input"
                    :class="{ 'input-error': fieldError('sort_order') }"
                  />
                  <span v-if="fieldError('sort_order')" class="field-error">{{ fieldError('sort_order') }}</span>
                </div>
                <div class="modal-actions modal-actions-sticky">
                  <button type="button" class="btn-secondary" @click="closeFormModal">Cancel</button>
                  <button type="submit" class="btn-primary" :disabled="formSaving">
                    <span v-if="formSaving" class="spinner-small"></span>
                    {{ formSaving ? 'Saving…' : (editingLevel ? 'Update' : 'Create') }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Delete confirmation (bottom sheet on mobile) -->
    <Teleport to="body">
      <Transition name="modal-slide">
        <div v-if="showDeleteModal && deletingLevel" class="level-modal-overlay" @click="closeDeleteModal">
          <div class="level-modal delete-modal delete-sheet" @click.stop>
            <div class="modal-sheet-handle" aria-hidden="true"></div>
            <div class="modal-header">
              <h3>Delete Level</h3>
              <button type="button" class="close-btn" @click="closeDeleteModal">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
            <div class="modal-body">
              <p>Are you sure you want to delete the level "{{ deletingLevel.name }}"?</p>
              <p class="warning-text">This action cannot be undone.</p>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn-secondary" @click="closeDeleteModal">Cancel</button>
              <button type="button" class="btn-danger" :disabled="deleteSaving" @click="doDelete">
                <span v-if="deleteSaving" class="spinner-small"></span>
                {{ deleteSaving ? 'Deleting…' : 'Delete' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { userLevelsApi } from '@/api/userLevels'
import { useBodyScrollLock } from '@/composables/useBodyScrollLock'

const levels = ref([])
const levelsLoading = ref(true)
const levelsError = ref(null)
const levelsMessage = ref('')
const levelsMessageType = ref('success')
const showFormModal = ref(false)
const showDeleteModal = ref(false)
const editingLevel = ref(null)
const deletingLevel = ref(null)
const formSaving = ref(false)
const deleteSaving = ref(false)
const validationErrors = ref({})
const formError = ref('')

const form = reactive({
  name: '',
  min_points: 0,
  discount_percent: null,
  sort_order: 0,
})

const isAnyModalOpen = computed(() => showFormModal.value || (showDeleteModal.value && !!deletingLevel.value))
useBodyScrollLock(isAnyModalOpen)

function formatMinPoints(val) {
  const n = Number(val)
  if (Number.isNaN(n)) return '—'
  return Number.isInteger(n) ? String(n) : String(Math.round(n))
}

function formatPerks(perks) {
  if (perks == null || typeof perks !== 'object') return '—'
  const pct = perks.discount_percent
  if (typeof pct === 'number' && pct > 0) return `${pct}% discount`
  return JSON.stringify(perks)
}

function hasPerks(perks) {
  if (perks == null || typeof perks !== 'object') return false
  const pct = perks.discount_percent
  return typeof pct === 'number' && pct > 0
}

function getTierClass(index) {
  const classes = ['tier-1', 'tier-2', 'tier-3', 'tier-4']
  return classes[index] || 'tier-default'
}

function fieldError(name) {
  return validationErrors.value[name]?.[0] ?? null
}

async function loadLevels() {
  levelsLoading.value = true
  levelsError.value = null
  try {
    const data = await userLevelsApi.list()
    levels.value = Array.isArray(data) ? data : []
  } catch (err) {
    levelsError.value = err.response?.data?.message ?? err.message ?? 'Failed to load levels.'
  } finally {
  levelsLoading.value = false
  }
}

function openCreate() {
  editingLevel.value = null
  form.name = ''
  form.min_points = 0
  form.discount_percent = null
  form.sort_order = 0
  validationErrors.value = {}
  formError.value = ''
  showFormModal.value = true
}

function openEdit(level) {
  editingLevel.value = level
  form.name = level.name
  form.min_points = level.min_points
  form.discount_percent = level.perks?.discount_percent ?? null
  form.sort_order = level.sort_order ?? 0
  validationErrors.value = {}
  formError.value = ''
  showFormModal.value = true
}

function closeFormModal() {
  showFormModal.value = false
  editingLevel.value = null
}

function buildPayload() {
  const payload = {
    name: String(form.name).trim(),
    min_points: Number(form.min_points) >= 0 ? Number(form.min_points) : 0,
    sort_order: Number(form.sort_order) >= 0 ? Number(form.sort_order) : 0,
  }
  const pct = form.discount_percent
  if (pct != null && pct !== '' && !Number.isNaN(Number(pct)) && Number(pct) >= 0) {
    payload.perks = { discount_percent: Number(pct) }
  } else {
    payload.perks = null
  }
  return payload
}

async function submitForm() {
  validationErrors.value = {}
  formError.value = ''
  if (!form.name?.trim()) {
    validationErrors.value = { name: ['The name field is required.'] }
    return
  }
  formSaving.value = true
  try {
    if (editingLevel.value) {
      await userLevelsApi.update(editingLevel.value.id, buildPayload())
      levelsMessage.value = 'Level updated successfully.'
    } else {
      await userLevelsApi.create(buildPayload())
      levelsMessage.value = 'Level created successfully.'
    }
    levelsMessageType.value = 'success'
    closeFormModal()
    await loadLevels()
    setTimeout(() => { levelsMessage.value = '' }, 3500)
  } catch (err) {
    if (err.response?.status === 422 && err.response?.data?.errors) {
      validationErrors.value = err.response.data.errors
      formError.value = err.response?.data?.message ?? 'Validation failed. Please check the fields.'
    } else {
      formError.value = err.response?.data?.message ?? err.message ?? 'Failed to save level.'
    }
  } finally {
    formSaving.value = false
  }
}

function confirmDelete(level) {
  deletingLevel.value = level
  showDeleteModal.value = true
}

function closeDeleteModal() {
  showDeleteModal.value = false
  deletingLevel.value = null
}

async function doDelete() {
  if (!deletingLevel.value) return
  deleteSaving.value = true
  try {
    await userLevelsApi.delete(deletingLevel.value.id)
    levelsMessage.value = 'Level deleted.'
    levelsMessageType.value = 'success'
    closeDeleteModal()
    await loadLevels()
    setTimeout(() => { levelsMessage.value = '' }, 3500)
  } catch (err) {
    formError.value = err.response?.data?.message ?? err.message ?? 'Failed to delete level.'
    levelsMessage.value = formError.value
    levelsMessageType.value = 'error'
  } finally {
    deleteSaving.value = false
  }
}

onMounted(loadLevels)
</script>

<style scoped>
.user-levels-block {
  margin-top: 0;
  position: relative;
  z-index: 1;
}

.levels-section {
  position: relative;
  z-index: 1;
}

.section-title-row {
  flex: 1;
  min-width: 0;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
  margin: 0 0 0.25rem 0;
  line-height: 1.3;
}

.section-description {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 0.25rem;
  line-height: 1.4;
}

.section-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.add-level-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.25rem;
  background: linear-gradient(135deg, #8b5cf6, #06b6d4);
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  white-space: nowrap;
  margin-top: 0.75rem;
}

.add-level-btn:hover {
  opacity: 0.95;
  transform: translateY(-1px);
}

.add-level-btn .icon {
  width: 1.125rem;
  height: 1.125rem;
}

/* Toast (mobile-friendly, fixed position) */
.levels-toast {
  position: fixed;
  top: 1rem;
  left: 1rem;
  right: 1rem;
  padding: 0.875rem 1rem;
  border-radius: 14px;
  font-size: 0.9375rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  z-index: 9999;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  max-width: calc(100vw - 2rem);
}
.levels-toast.success {
  background: rgba(34, 197, 94, 0.95);
  border: 1px solid rgba(34, 197, 94, 0.5);
  color: #fff;
}
.levels-toast.error {
  background: rgba(239, 68, 68, 0.95);
  border: 1px solid rgba(239, 68, 68, 0.5);
  color: #fff;
}
.toast-icon {
  flex-shrink: 0;
  width: 1.25rem;
  height: 1.25rem;
}
.toast-enter-active,
.toast-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.toast-enter-from,
.toast-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 2rem 1.5rem;
  padding-bottom: calc(2rem + env(safe-area-inset-bottom, 0px));
}
.empty-state-icon {
  width: 4rem;
  height: 4rem;
  margin: 0 auto 1.25rem;
  color: rgba(139, 92, 246, 0.5);
}
.empty-state-icon svg {
  width: 100%;
  height: 100%;
}
.empty-state-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
  margin: 0 0 0.5rem;
}
.empty-state-desc {
  font-size: 0.9375rem;
  color: rgba(255, 255, 255, 0.65);
  line-height: 1.5;
  margin: 0 0 1.5rem;
  max-width: 280px;
  margin-left: auto;
  margin-right: auto;
}
.empty-state-cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 48px;
  padding: 0.875rem 1.5rem;
  background: linear-gradient(135deg, #8b5cf6, #06b6d4);
  border: none;
  border-radius: 14px;
  color: white;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(139, 92, 246, 0.35);
}
.empty-state-cta .icon {
  width: 1.25rem;
  height: 1.25rem;
}
.empty-state-cta:hover {
  opacity: 0.95;
  transform: translateY(-1px);
}
.empty-state-cta:active {
  transform: translateY(0);
}

.levels-loading {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  color: rgba(255, 255, 255, 0.8);
}

.loading-spinner {
  width: 28px;
  height: 28px;
  border: 2px solid rgba(139, 92, 246, 0.3);
  border-top-color: #8b5cf6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.spinner-small {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.empty-levels {
  color: rgba(255, 255, 255, 0.7);
  padding: 1rem 0;
}

.levels-table-wrap {
  overflow-x: auto;
}

.levels-table {
  width: 100%;
  border-collapse: collapse;
}

.levels-table th,
.levels-table td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.levels-table th {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
}

.levels-table td {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9375rem;
}

.th-actions,
.td-actions {
  text-align: right;
  white-space: nowrap;
}

.btn-action {
  padding: 0.4rem 0.75rem;
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  margin-left: 0.5rem;
}

.btn-edit {
  background: rgba(139, 92, 246, 0.25);
  color: #c4b5fd;
}

.btn-edit:hover {
  background: rgba(139, 92, 246, 0.4);
}

.btn-delete {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
}

.btn-delete:hover {
  background: rgba(239, 68, 68, 0.35);
}

.alert {
  padding: 1rem 1.25rem;
  border-radius: 12px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.alert-error {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.4);
  color: #fca5a5;
}

.retry-btn {
  padding: 0.5rem 1rem;
  background: rgba(239, 68, 68, 0.3);
  border: 1px solid rgba(239, 68, 68, 0.5);
  border-radius: 8px;
  color: #fca5a5;
  cursor: pointer;
  font-weight: 600;
}

/* Modal */
.level-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.level-modal {
  background: linear-gradient(135deg, rgba(15, 15, 23, 0.98), rgba(30, 30, 45, 0.98));
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 20px;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.level-modal .modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.level-modal .modal-header h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
  margin: 0;
}

.level-modal .modal-sheet-handle {
  display: none;
  width: 40px;
  height: 4px;
  margin: 0.75rem auto 0;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 2px;
}

.level-modal .close-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  padding: 0.5rem;
  min-width: 44px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  -webkit-tap-highlight-color: transparent;
}

.level-modal .close-btn svg {
  width: 1.5rem;
  height: 1.5rem;
}

.level-modal .modal-body {
  padding: 1.5rem;
  overflow-y: auto;
}

.level-form .form-row {
  margin-bottom: 1.25rem;
}

.level-form .form-row label {
  display: block;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 0.5rem;
  font-size: 0.9375rem;
}

.required {
  color: #f87171;
}

.form-hint {
  font-size: 0.8125rem;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 0.25rem;
}

.setting-input {
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9375rem;
}

.setting-input.input-error {
  border-color: rgba(239, 68, 68, 0.6);
}

.field-error {
  display: block;
  font-size: 0.8125rem;
  color: #fca5a5;
  margin-top: 0.25rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-primary {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #8b5cf6, #06b6d4);
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-secondary {
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
  cursor: pointer;
}

.btn-danger {
  padding: 0.75rem 1.5rem;
  background: rgba(239, 68, 68, 0.3);
  border: 1px solid rgba(239, 68, 68, 0.5);
  border-radius: 12px;
  color: #fca5a5;
  font-weight: 600;
  cursor: pointer;
}

.btn-danger:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.warning-text {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 0.5rem;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* Bottom-sheet style transition (mobile) */
.modal-slide-enter-active,
.modal-slide-leave-active {
  transition: opacity 0.3s ease;
}
.modal-slide-enter-active .level-modal,
.modal-slide-leave-active .level-modal {
  transition: transform 0.35s cubic-bezier(0.32, 0.72, 0, 1);
}
.modal-slide-enter-from,
.modal-slide-leave-to {
  opacity: 0;
}
.modal-slide-enter-from .level-modal,
.modal-slide-leave-to .level-modal {
  transform: translateY(100%);
}
@media (min-width: 769px) {
  .modal-slide-enter-from .level-modal,
  .modal-slide-leave-to .level-modal {
    transform: scale(0.96);
  }
}

/* Mobile card list – tap-friendly, tier badges */
.levels-cards {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-bottom: env(safe-area-inset-bottom, 0);
}

.level-card {
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
.level-card:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(139, 92, 246, 0.25);
}
.level-card:active {
  transform: scale(0.99);
}

.level-card-tier {
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
.level-card-tier.tier-1 { color: #cd7f32; background: rgba(205, 127, 50, 0.15); }
.level-card-tier.tier-2 { color: #c0c0c0; background: rgba(192, 192, 192, 0.15); }
.level-card-tier.tier-3 { color: #ffd700; background: rgba(255, 215, 0, 0.12); }
.level-card-tier.tier-4 { color: #e5e4e2; background: rgba(229, 228, 226, 0.2); }
.level-card-tier.tier-default { color: rgba(139, 92, 246, 0.9); background: rgba(139, 92, 246, 0.12); }

.level-card-main {
  flex: 1;
  min-width: 0;
  padding: 1rem 0.75rem 1rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.level-card-header {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.level-card-name {
  font-size: 1.0625rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
  line-height: 1.3;
}

.level-card-perks-pill {
  font-size: 0.75rem;
  font-weight: 600;
  color: #86efac;
  background: rgba(34, 197, 94, 0.2);
  padding: 0.2rem 0.5rem;
  border-radius: 8px;
}

.level-card-meta {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.55);
}

.level-card-points {
  font-weight: 500;
}

.level-card-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.btn-card {
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

.btn-card .btn-icon {
  width: 1.125rem;
  height: 1.125rem;
  flex-shrink: 0;
}

.btn-card.btn-edit {
  background: rgba(139, 92, 246, 0.22);
  color: #c4b5fd;
}
.btn-card.btn-edit:hover,
.btn-card.btn-edit:focus-visible {
  background: rgba(139, 92, 246, 0.35);
}

.btn-card.btn-delete {
  background: rgba(239, 68, 68, 0.15);
  color: #fca5a5;
}
.btn-card.btn-delete:hover,
.btn-card.btn-delete:focus-visible {
  background: rgba(239, 68, 68, 0.28);
}

.level-card-chevron {
  display: flex;
  align-items: center;
  padding: 0 0.75rem;
  color: rgba(255, 255, 255, 0.35);
}
.level-card-chevron svg {
  width: 1.25rem;
  height: 1.25rem;
}

/* Desktop: show table, hide cards. Mobile: show cards, hide table. */
.desktop-only {
  display: block;
}

.mobile-only {
  display: none;
}

/* Mobile: modals as bottom sheet, larger touch targets */
@media (max-width: 768px) {
  .mobile-hide {
    display: none !important;
  }

  .level-modal-overlay {
    align-items: flex-end;
    padding: 0;
  }

  .level-modal {
    max-height: 92vh;
    height: auto;
    border-radius: 24px 24px 0 0;
    border-bottom: none;
    padding-bottom: env(safe-area-inset-bottom, 0);
  }

  .level-form-modal {
    max-height: 92vh;
    display: flex;
    flex-direction: column;
  }

  .level-form-modal .modal-body {
    flex: 1;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    padding: 1rem 1.25rem 1.25rem;
  }

  .modal-actions-sticky {
    position: sticky;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(180deg, transparent, rgba(15, 15, 23, 0.98));
    padding: 1rem 1.25rem;
    padding-bottom: calc(1rem + env(safe-area-inset-bottom, 0px));
    margin-top: 0;
    gap: 0.75rem;
  }

  .modal-actions-sticky .btn-secondary,
  .modal-actions-sticky .btn-primary {
    min-height: 48px;
    padding: 0.875rem 1.25rem;
    font-size: 1rem;
    border-radius: 14px;
    flex: 1;
  }

  .level-form .form-row {
    margin-bottom: 1.5rem;
  }

  .level-form .setting-input {
    min-height: 48px;
    padding: 0.875rem 1rem;
    font-size: 1rem;
    border-radius: 14px;
  }

  .level-form .form-row label {
    font-size: 1rem;
    margin-bottom: 0.5rem;
  }

  .delete-sheet .modal-body {
    padding: 1.5rem 1.25rem;
    padding-bottom: calc(1.5rem + env(safe-area-inset-bottom, 0px));
  }

  .delete-sheet .modal-actions {
    flex-direction: column;
    gap: 0.75rem;
    padding-bottom: env(safe-area-inset-bottom, 0);
  }

  .delete-sheet .btn-secondary,
  .delete-sheet .btn-danger {
    min-height: 48px;
    width: 100%;
    border-radius: 14px;
    font-size: 1rem;
  }

  .levels-toast {
    top: calc(72px + 0.5rem);
    left: 0.75rem;
    right: 0.75rem;
    max-width: none;
  }

  .level-modal .modal-sheet-handle {
    display: block;
  }
}

@media (max-width: 768px) {
  .desktop-only {
    display: none !important;
  }

  .mobile-only {
    display: flex !important;
  }

  .levels-cards.mobile-only {
    display: flex !important;
    flex-direction: column;
  }

  .section-header {
    flex-direction: row;
    align-items: flex-start;
    gap: 0.75rem;
    margin-bottom: 1.25rem;
  }

  .section-icon {
    width: 1.5rem;
    height: 1.5rem;
    flex-shrink: 0;
    margin-top: 0.15rem;
    color: rgba(139, 92, 246, 0.9);
  }

  .section-title-row {
    flex: 1;
    min-width: 0;
  }

  .section-title {
    font-size: 1.125rem;
    font-weight: 700;
  }

  .section-description {
    font-size: 0.8125rem;
    margin-top: 0.2rem;
  }

  .add-level-btn {
    margin-top: 0.5rem;
    width: 100%;
    justify-content: center;
    min-height: 48px;
    padding: 0.875rem 1rem;
    font-size: 1rem;
    border-radius: 14px;
  }
}

@media (min-width: 769px) {
  .section-title {
    font-size: 1.25rem;
  }

  .levels-table th,
  .levels-table td {
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
  }

  .btn-action {
    margin-left: 0.25rem;
    padding: 0.35rem 0.65rem;
  }
}
</style>
