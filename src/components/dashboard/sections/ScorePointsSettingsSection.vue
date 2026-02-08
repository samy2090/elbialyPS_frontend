<template>
  <div class="score-points-settings">
    <div class="settings-header">
      <h1 class="settings-title">Score Points Settings</h1>
      <p class="settings-subtitle">Configure the points system for play time and product purchases</p>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="loading-wrapper">
      <div class="loading-spinner"></div>
      <p>Loading settings…</p>
    </div>

    <!-- Error fetching -->
    <div v-else-if="fetchError" class="alert alert-error">
      {{ fetchError }}
      <button class="retry-btn" @click="loadSettings">Retry</button>
    </div>

    <template v-else>
      <!-- Success / Error messages -->
      <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>
      <div v-if="errorSummary" class="alert alert-error">{{ errorSummary }}</div>

      <form class="settings-form" @submit.prevent="save">
        <!-- General -->
        <div class="settings-section">
          <div class="section-header">
            <div class="section-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h2 class="section-title">General</h2>
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <label class="setting-label">Enable points system</label>
              <p class="setting-description">When disabled, no new points are granted (play time or products). Reversals on product delete still run.</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" v-model="form.is_active" />
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>

        <!-- Play-time points -->
        <div class="settings-section">
          <div class="section-header">
            <div class="section-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polygon points="5,3 19,12 5,21" fill="currentColor"/>
              </svg>
            </div>
            <h2 class="section-title">Play-time points</h2>
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <label class="setting-label" for="points_per_hour">Points per hour of play</label>
              <p class="setting-description">Points earned per hour of device use. Formula: ceil(duration_hours × points_per_hour)</p>
            </div>
            <input
              id="points_per_hour"
              v-model.number="form.points_per_hour"
              type="number"
              min="0"
              step="0.01"
              class="setting-input"
              :class="{ 'input-error': fieldError('points_per_hour') }"
            />
            <span v-if="fieldError('points_per_hour')" class="field-error">{{ fieldError('points_per_hour') }}</span>
          </div>
        </div>

        <!-- Product points -->
        <div class="settings-section">
          <div class="section-header">
            <div class="section-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 7L12 3L4 7M20 7L12 11M20 7V17L12 21M12 11V21M4 7V17L12 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h2 class="section-title">Product points</h2>
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <label class="setting-label" for="points_money_threshold">Money threshold (EGP)</label>
              <p class="setting-description">Amount spent on products to earn points</p>
            </div>
            <input
              id="points_money_threshold"
              v-model.number="form.points_money_threshold"
              type="number"
              min="0"
              step="0.01"
              class="setting-input"
              :class="{ 'input-error': fieldError('points_money_threshold') }"
            />
            <span v-if="fieldError('points_money_threshold')" class="field-error">{{ fieldError('points_money_threshold') }}</span>
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <label class="setting-label" for="points_per_threshold">Points per threshold</label>
              <p class="setting-description">Points earned when spending the threshold amount. Example: 120 EGP, threshold 50, 5 per threshold → 12 points</p>
            </div>
            <input
              id="points_per_threshold"
              v-model.number="form.points_per_threshold"
              type="number"
              min="0"
              step="0.01"
              class="setting-input"
              :class="{ 'input-error': fieldError('points_per_threshold') }"
            />
            <span v-if="fieldError('points_per_threshold')" class="field-error">{{ fieldError('points_per_threshold') }}</span>
          </div>
        </div>

        <!-- Points expiry -->
        <div class="settings-section">
          <div class="section-header">
            <div class="section-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
            <h2 class="section-title">Points expiry</h2>
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <label class="setting-label">Enable points expiry</label>
              <p class="setting-description">When enabled and date matches, all users' points reset to 0</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" v-model="form.points_expiry_enabled" />
              <span class="toggle-slider"></span>
            </label>
          </div>

          <template v-if="form.points_expiry_enabled">
            <div class="setting-item">
              <div class="setting-info">
                <label class="setting-label">Expiry type</label>
                <p class="setting-description">Monthly: resets every month on chosen day. Specific date: one-time reset.</p>
              </div>
              <div class="radio-group">
                <label class="radio-option">
                  <input
                    type="radio"
                    v-model="form.points_expiry_type"
                    value="monthly"
                  />
                  <span>Monthly</span>
                </label>
                <label class="radio-option">
                  <input
                    type="radio"
                    v-model="form.points_expiry_type"
                    value="specific_date"
                  />
                  <span>Specific date</span>
                </label>
              </div>
            </div>

            <div v-if="form.points_expiry_type === 'monthly'" class="setting-item">
              <div class="setting-info">
                <label class="setting-label" for="points_expiry_day_of_month">Day of month (1–31)</label>
                <p class="setting-description">Resets on this day every month (e.g. 1 = 1st)</p>
              </div>
              <select
                id="points_expiry_day_of_month"
                v-model.number="form.points_expiry_day_of_month"
                class="setting-control"
                :class="{ 'input-error': fieldError('points_expiry_day_of_month') }"
              >
                <option v-for="d in 31" :key="d" :value="d">{{ d }}</option>
              </select>
              <span v-if="fieldError('points_expiry_day_of_month')" class="field-error">{{ fieldError('points_expiry_day_of_month') }}</span>
            </div>

            <div v-if="form.points_expiry_type === 'specific_date'" class="setting-item">
              <div class="setting-info">
                <label class="setting-label" for="points_expiry_specific_date">Specific date</label>
                <p class="setting-description">One-time reset on this date (YYYY-MM-DD)</p>
              </div>
              <input
                id="points_expiry_specific_date"
                v-model="form.points_expiry_specific_date"
                type="date"
                class="setting-input"
                :class="{ 'input-error': fieldError('points_expiry_specific_date') }"
              />
              <span v-if="fieldError('points_expiry_specific_date')" class="field-error">{{ fieldError('points_expiry_specific_date') }}</span>
            </div>
          </template>
        </div>

        <div class="settings-footer">
          <button type="submit" class="save-btn" :disabled="saving">
            <svg v-if="!saving" class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16L21 8V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M17 21V13H7V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M7 3V8H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span v-else class="spinner-small"></span>
            {{ saving ? 'Saving…' : 'Save changes' }}
          </button>
        </div>
      </form>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { scorePointsSettingsApi } from '@/api/scorePointsSettings'

const loading = ref(true)
const fetchError = ref(null)
const saving = ref(false)
const successMessage = ref('')
const errorSummary = ref('')
const validationErrors = ref({})

const form = reactive({
  is_active: true,
  points_per_hour: 10,
  points_money_threshold: 50,
  points_per_threshold: 5,
  points_expiry_enabled: false,
  points_expiry_type: null,
  points_expiry_day_of_month: null,
  points_expiry_specific_date: null,
})

function assignFromResponse(data) {
  if (!data) return
  form.is_active = data.is_active ?? true
  form.points_per_hour = data.points_per_hour ?? 10
  form.points_money_threshold = data.points_money_threshold ?? 50
  form.points_per_threshold = data.points_per_threshold ?? 5
  form.points_expiry_enabled = data.points_expiry_enabled ?? false
  form.points_expiry_type = data.points_expiry_type ?? null
  form.points_expiry_day_of_month = data.points_expiry_day_of_month ?? null
  form.points_expiry_specific_date = data.points_expiry_specific_date ?? null
}

async function loadSettings() {
  loading.value = true
  fetchError.value = null
  try {
    const data = await scorePointsSettingsApi.get()
    assignFromResponse(data)
  } catch (err) {
    const msg = err.response?.data?.message ?? err.message ?? 'Failed to load settings'
    fetchError.value = msg
    if (err.response?.status === 404) {
      fetchError.value = 'Score points settings not found. Ensure the backend is configured.'
    }
  } finally {
    loading.value = false
  }
}

function fieldError(name) {
  return validationErrors.value[name]?.[0] ?? null
}

function buildPayload() {
  const payload = {
    is_active: form.is_active,
    points_per_hour: Number(form.points_per_hour) >= 0 ? Number(form.points_per_hour) : 0,
    points_money_threshold: Number(form.points_money_threshold) >= 0 ? Number(form.points_money_threshold) : 0,
    points_per_threshold: Number(form.points_per_threshold) >= 0 ? Number(form.points_per_threshold) : 0,
    points_expiry_enabled: form.points_expiry_enabled,
  }
  if (form.points_expiry_enabled) {
    payload.points_expiry_type = form.points_expiry_type || null
    if (form.points_expiry_type === 'monthly') {
      payload.points_expiry_day_of_month = form.points_expiry_day_of_month ?? 1
      payload.points_expiry_specific_date = null
    } else if (form.points_expiry_type === 'specific_date') {
      payload.points_expiry_specific_date = form.points_expiry_specific_date || null
      payload.points_expiry_day_of_month = null
    } else {
      payload.points_expiry_day_of_month = null
      payload.points_expiry_specific_date = null
    }
  } else {
    payload.points_expiry_type = null
    payload.points_expiry_day_of_month = null
    payload.points_expiry_specific_date = null
  }
  return payload
}

async function save() {
  successMessage.value = ''
  errorSummary.value = ''
  validationErrors.value = {}
  saving.value = true
  try {
    const payload = buildPayload()
    await scorePointsSettingsApi.update(payload)
    successMessage.value = 'Settings saved successfully.'
    validationErrors.value = {}
  } catch (err) {
    if (err.response?.status === 422 && err.response?.data?.errors) {
      validationErrors.value = err.response.data.errors
      errorSummary.value = err.response?.data?.message ?? 'Validation failed. Please check the fields below.'
    } else {
      errorSummary.value = err.response?.data?.message ?? err.message ?? 'Failed to save settings.'
    }
  } finally {
    saving.value = false
  }
}

// When expiry disabled, clear expiry-specific values
watch(() => form.points_expiry_enabled, (enabled) => {
  if (!enabled) {
    form.points_expiry_type = null
    form.points_expiry_day_of_month = null
    form.points_expiry_specific_date = null
  }
})

// When switching to monthly, ensure we have a valid day; when switching away, clear
watch(() => form.points_expiry_type, (type) => {
  if (type === 'monthly') {
    if (form.points_expiry_day_of_month == null || form.points_expiry_day_of_month < 1 || form.points_expiry_day_of_month > 31) {
      form.points_expiry_day_of_month = 1
    }
    form.points_expiry_specific_date = null
  } else {
    form.points_expiry_day_of_month = null
    if (type === 'specific_date') {
      form.points_expiry_specific_date = form.points_expiry_specific_date || null
    } else {
      form.points_expiry_specific_date = null
    }
  }
})

onMounted(loadSettings)
</script>

<style scoped>
.score-points-settings {
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
}

.alert {
  padding: 1rem 1.25rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
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
  padding: 0.5rem 1rem;
  background: rgba(239, 68, 68, 0.3);
  border: 1px solid rgba(239, 68, 68, 0.5);
  border-radius: 8px;
  color: #fca5a5;
  cursor: pointer;
  font-weight: 600;
}

.retry-btn:hover {
  background: rgba(239, 68, 68, 0.4);
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
  transition: all 0.3s ease;
}

.settings-section:hover {
  border-color: rgba(139, 92, 246, 0.2);
  box-shadow: 0 8px 32px rgba(139, 92, 246, 0.1);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.section-icon {
  width: 2rem;
  height: 2rem;
  color: #8b5cf6;
}

.section-icon svg {
  width: 100%;
  height: 100%;
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

.setting-input,
.setting-control {
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.9);
  min-width: 140px;
  font-size: 0.9375rem;
}

.setting-input:focus,
.setting-control:focus {
  outline: none;
  border-color: rgba(139, 92, 246, 0.5);
}

.setting-input.input-error,
.setting-control.input-error {
  border-color: rgba(239, 68, 68, 0.6);
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

.radio-group {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.9);
}

.radio-option input {
  accent-color: #8b5cf6;
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

.save-btn .icon {
  width: 1.25rem;
  height: 1.25rem;
}

@media (max-width: 768px) {
  .score-points-settings {
    padding: 0.5rem;
  }
  .setting-item {
    flex-direction: column;
    align-items: stretch;
  }
  .setting-input,
  .setting-control {
    min-width: auto;
  }
}
</style>
