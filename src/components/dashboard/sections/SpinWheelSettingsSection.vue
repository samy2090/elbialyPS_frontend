<template>
  <div class="spin-wheel-settings">
    <div class="settings-header">
      <h1 class="settings-title">Spin Wheel Settings</h1>
      <p class="settings-subtitle">Configure period type, availability, and max spins per period</p>
    </div>

    <div v-if="loading" class="loading-wrapper">
      <div class="loading-spinner"></div>
      <p>Loading settings…</p>
    </div>

    <div v-else-if="fetchError" class="alert alert-error">
      {{ fetchError }}
      <button class="retry-btn" @click="loadSettings">Retry</button>
    </div>

    <template v-else>
      <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>
      <div v-if="errorSummary" class="alert alert-error">{{ errorSummary }}</div>

      <form class="settings-form" @submit.prevent="save">
        <div class="settings-section">
          <div class="section-header">
            <h2 class="section-title">General</h2>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <label class="setting-label">Active</label>
              <p class="setting-description">Enable or disable the spin wheel for users</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" v-model="form.is_active" />
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <label class="setting-label" for="period_type">Period type</label>
              <p class="setting-description">How often users get new spins</p>
            </div>
            <select
              id="period_type"
              v-model="form.period_type"
              class="setting-input"
              :class="{ 'input-error': fieldError('period_type') }"
            >
              <option v-for="opt in periodTypes" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
            <span v-if="fieldError('period_type')" class="field-error">{{ fieldError('period_type') }}</span>
          </div>

          <!-- Period value: days for every_n_days / cooldown_days -->
          <div v-if="form.period_type === 'every_n_days' || form.period_type === 'cooldown_days'" class="setting-item">
            <div class="setting-info">
              <label class="setting-label" for="period_value">{{ form.period_type === 'cooldown_days' ? 'Cooldown days' : 'N (days)' }}</label>
              <p class="setting-description">{{ form.period_type === 'cooldown_days' ? 'Days from last claim until next spin' : 'Calendar interval in days (e.g. 1 = daily)' }}</p>
            </div>
            <input
              id="period_value"
              v-model.number="form.period_value"
              type="number"
              min="1"
              max="365"
              class="setting-input"
              :class="{ 'input-error': fieldError('period_value') }"
            />
            <span v-if="fieldError('period_value')" class="field-error">{{ fieldError('period_value') }}</span>
          </div>

          <!-- Weekday for every_weekday -->
          <div v-if="form.period_type === 'every_weekday'" class="setting-item">
            <div class="setting-info">
              <label class="setting-label" for="period_value_weekday">Weekday</label>
              <p class="setting-description">Which weekday resets spins</p>
            </div>
            <select
              id="period_value_weekday"
              v-model.number="form.period_value"
              class="setting-input"
              :class="{ 'input-error': fieldError('period_value') }"
            >
              <option v-for="opt in weekdayOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
            <span v-if="fieldError('period_value')" class="field-error">{{ fieldError('period_value') }}</span>
          </div>

          <!-- Month: period_value 1-12 or just value -->
          <div v-if="form.period_type === 'every_month'" class="setting-item">
            <div class="setting-info">
              <label class="setting-label" for="period_value_month">Day of month</label>
              <p class="setting-description">Day of the month when spins reset (1–28)</p>
            </div>
            <input
              id="period_value_month"
              v-model.number="form.period_value"
              type="number"
              min="1"
              max="28"
              class="setting-input"
              :class="{ 'input-error': fieldError('period_value') }"
            />
            <span v-if="fieldError('period_value')" class="field-error">{{ fieldError('period_value') }}</span>
          </div>

          <div v-if="form.period_type === 'every_weekday'" class="setting-item">
            <div class="setting-info">
              <label class="setting-label">Weekday only</label>
              <p class="setting-description">Wheel open only on the selected weekday</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" v-model="form.weekday_only" />
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <label class="setting-label" for="start_date">Start date</label>
              <p class="setting-description">Fixed start for calendar periods (YYYY-MM-DD)</p>
            </div>
            <input
              id="start_date"
              v-model="form.start_date"
              type="date"
              class="setting-input"
              :class="{ 'input-error': fieldError('start_date') }"
            />
            <span v-if="fieldError('start_date')" class="field-error">{{ fieldError('start_date') }}</span>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <label class="setting-label" for="max_spins_per_period">Max spins per period</label>
              <p class="setting-description">Maximum spins per user per period (1–10)</p>
            </div>
            <input
              id="max_spins_per_period"
              v-model.number="form.max_spins_per_period"
              type="number"
              min="1"
              max="10"
              class="setting-input"
              :class="{ 'input-error': fieldError('max_spins_per_period') }"
            />
            <span v-if="fieldError('max_spins_per_period')" class="field-error">{{ fieldError('max_spins_per_period') }}</span>
          </div>
        </div>

        <div class="settings-footer">
          <button type="submit" class="save-btn" :disabled="saving">
            <span v-if="saving" class="spinner-small"></span>
            {{ saving ? 'Saving…' : 'Save changes' }}
          </button>
        </div>
      </form>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { spinWheelAdminApi } from '@/api/spinWheelAdmin'

const loading = ref(true)
const fetchError = ref(null)
const saving = ref(false)
const successMessage = ref('')
const errorSummary = ref('')
const validationErrors = ref({})

const periodTypes = ref([])
const weekdayOptions = ref([])

const form = reactive({
  is_active: false,
  period_type: 'every_n_days',
  period_value: 1,
  weekday_only: false,
  start_date: '',
  max_spins_per_period: 3
})

function assignFromResponse(data) {
  if (!data) return
  form.is_active = data.is_active ?? false
  form.period_type = data.period_type ?? 'every_n_days'
  form.period_value = data.period_value ?? 1
  form.weekday_only = data.weekday_only ?? false
  form.start_date = (data.start_date || '').toString().slice(0, 10)
  form.max_spins_per_period = data.max_spins_per_period ?? 3
}

async function loadSettings() {
  loading.value = true
  fetchError.value = null
  try {
    const res = await spinWheelAdminApi.getSettings()
    const data = res?.data ?? res
    periodTypes.value = res?.period_types?.length ? res.period_types : [
      { value: 'every_n_days', label: 'Every N Days (calendar)' },
      { value: 'every_weekday', label: 'Every Weekday' },
      { value: 'every_month', label: 'Every Month' },
      { value: 'cooldown_days', label: 'Cooldown (days from claim)' }
    ]
    weekdayOptions.value = res?.weekday_options?.length ? res.weekday_options : [
      { value: 0, label: 'Sunday' }, { value: 1, label: 'Monday' }, { value: 2, label: 'Tuesday' },
      { value: 3, label: 'Wednesday' }, { value: 4, label: 'Thursday' }, { value: 5, label: 'Friday' }, { value: 6, label: 'Saturday' }
    ]
    assignFromResponse(data)
  } catch (err) {
    fetchError.value = err.response?.data?.message ?? err.message ?? 'Failed to load settings'
    if (err.response?.status === 403) fetchError.value = 'Access denied. Admin only.'
  } finally {
    loading.value = false
  }
}

function fieldError(name) {
  return validationErrors.value[name]?.[0] ?? null
}

function buildPayload() {
  return {
    is_active: form.is_active,
    period_type: form.period_type,
    period_value: Number(form.period_value),
    weekday_only: form.period_type === 'every_weekday' ? form.weekday_only : false,
    start_date: form.start_date?.trim() || null,
    max_spins_per_period: Math.min(10, Math.max(1, Number(form.max_spins_per_period) || 1))
  }
}

async function save() {
  successMessage.value = ''
  errorSummary.value = ''
  validationErrors.value = {}
  saving.value = true
  try {
    await spinWheelAdminApi.updateSettings(buildPayload())
    successMessage.value = 'Settings saved successfully.'
    setTimeout(() => { successMessage.value = '' }, 4000)
  } catch (err) {
    if (err.response?.status === 422 && err.response?.data?.errors) {
      validationErrors.value = err.response.data.errors
      errorSummary.value = err.response?.data?.message ?? 'Validation failed.'
    } else {
      errorSummary.value = err.response?.data?.message ?? err.message ?? 'Failed to save settings.'
    }
  } finally {
    saving.value = false
  }
}

onMounted(loadSettings)
</script>

<style scoped>
.spin-wheel-settings {
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.settings-header {
  margin-bottom: 2rem;
}

.settings-title {
  font-size: 2rem;
  font-weight: 800;
  background: linear-gradient(135deg, #8b5cf6, #06b6d4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
}

.settings-subtitle {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.7);
}

.loading-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem;
  color: rgba(255, 255, 255, 0.8);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(139, 92, 246, 0.3);
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
  margin-right: 0.5rem;
}

.alert {
  padding: 1rem 1.25rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
}

.alert-success {
  background: rgba(34, 197, 94, 0.15);
  border: 1px solid rgba(34, 197, 94, 0.4);
  color: #86efac;
}

.alert-error {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.4);
  color: #fca5a5;
}

.retry-btn {
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(239, 68, 68, 0.3);
  border: 1px solid rgba(239, 68, 68, 0.5);
  border-radius: 8px;
  color: #fca5a5;
  cursor: pointer;
  font-weight: 600;
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.settings-section {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2rem;
}

.section-header {
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
}

.setting-item {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.setting-item:last-child {
  margin-bottom: 0;
}

.setting-info {
  flex: 1;
  min-width: 200px;
}

.setting-label {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 0.25rem;
  display: block;
}

.setting-description {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.4;
}

.setting-input {
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.9);
  min-width: 140px;
  font-size: 0.9375rem;
}

.setting-input:focus {
  outline: none;
  border-color: rgba(139, 92, 246, 0.5);
}

.setting-input.input-error {
  border-color: rgba(239, 68, 68, 0.6);
}

select.setting-input {
  cursor: pointer;
}

.field-error {
  display: block;
  width: 100%;
  font-size: 0.8125rem;
  color: #fca5a5;
  margin-top: 0.25rem;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 32px;
  cursor: pointer;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 32px;
  transition: 0.3s;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 24px;
  width: 24px;
  left: 4px;
  bottom: 4px;
  background: white;
  border-radius: 50%;
  transition: 0.3s;
}

input:checked + .toggle-slider {
  background: linear-gradient(135deg, #8b5cf6, #06b6d4);
}

input:checked + .toggle-slider:before {
  transform: translateX(28px);
}

.settings-footer {
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.save-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #8b5cf6, #06b6d4);
  border: none;
  border-radius: 16px;
  color: white;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.save-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(139, 92, 246, 0.4);
}

.save-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
