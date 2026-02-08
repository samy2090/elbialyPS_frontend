<template>
  <div class="site-settings">
    <div class="settings-header">
      <h1 class="settings-title">Site Settings</h1>
      <p class="settings-subtitle">Configure site name, logo, place status, maintenance mode, and discount</p>
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
                <path d="M21 16V8C20.9996 7.64928 20.9071 7.30481 20.7315 7.00116C20.556 6.69751 20.3037 6.44536 20 6.27L13 2.27C12.696 2.09446 12.3511 2.00205 12 2.00205C11.6489 2.00205 11.304 2.09446 11 2.27L4 6.27C3.69626 6.44536 3.44398 6.69751 3.26846 7.00116C3.09294 7.30481 3.00036 7.64928 3 8V16C3.00036 16.3507 3.09294 16.6952 3.26846 16.9988C3.44398 17.3025 3.69626 17.5546 4 17.73L11 21.73C11.304 21.9055 11.6489 21.9979 12 21.9979C12.3511 21.9979 12.696 21.9055 13 21.73L20 17.73C20.3037 17.5546 20.556 17.3025 20.7315 16.9988C20.9071 16.6952 20.9996 16.3507 21 16Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h2 class="section-title">General</h2>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <label class="setting-label" for="site_name">Site name</label>
              <p class="setting-description">Name of the place or site</p>
            </div>
            <input
              id="site_name"
              v-model="form.site_name"
              type="text"
              maxlength="255"
              class="setting-input"
              :class="{ 'input-error': fieldError('site_name') }"
              placeholder="e.g. El Bialy PS"
            />
            <span v-if="fieldError('site_name')" class="field-error">{{ fieldError('site_name') }}</span>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <label class="setting-label" for="site_logo">Site logo</label>
              <p class="setting-description">Path to logo file (e.g. logos/site-logo.png). After uploading elsewhere, enter the path here.</p>
            </div>
            <div class="logo-row">
              <input
                id="site_logo"
                v-model="form.site_logo"
                type="text"
                maxlength="500"
                class="setting-input logo-input"
                :class="{ 'input-error': fieldError('site_logo') }"
                placeholder="logos/site-logo.png"
              />
              <div v-if="logoPreviewUrl" class="logo-preview">
                <img :src="logoPreviewUrl" alt="Site logo" @error="logoPreviewError = true" />
              </div>
              <div v-else-if="form.site_logo && logoPreviewError" class="logo-preview logo-preview-fail">
                <span>Preview unavailable</span>
              </div>
            </div>
            <span v-if="fieldError('site_logo')" class="field-error">{{ fieldError('site_logo') }}</span>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <label class="setting-label">Place status</label>
              <p class="setting-description">Whether the place is open for business</p>
            </div>
            <div class="radio-group">
              <label class="radio-option">
                <input type="radio" v-model="form.place_status" value="open" />
                <span>Open</span>
              </label>
              <label class="radio-option">
                <input type="radio" v-model="form.place_status" value="closed" />
                <span>Closed</span>
              </label>
            </div>
            <span v-if="fieldError('place_status')" class="field-error">{{ fieldError('place_status') }}</span>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <label class="setting-label">Maintenance mode</label>
              <p class="setting-description">When enabled, users may see a maintenance message</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" v-model="form.maintenance_mode" />
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>

        <!-- Discount -->
        <div class="settings-section">
          <div class="section-header">
            <div class="section-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h2 class="section-title">Discount</h2>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <label class="setting-label" for="discount_percent">Discount percentage</label>
              <p class="setting-description">Discount applied during the validity period (0–100). Leave empty for no discount.</p>
            </div>
            <input
              id="discount_percent"
              v-model.number="form.discount_percent"
              type="number"
              min="0"
              max="100"
              step="1"
              class="setting-input"
              :class="{ 'input-error': fieldError('discount_percent') }"
              placeholder="e.g. 10"
            />
            <span v-if="fieldError('discount_percent')" class="field-error">{{ fieldError('discount_percent') }}</span>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <label class="setting-label" for="discount_start_at">Discount start date</label>
              <p class="setting-description">Start of discount period (YYYY-MM-DD)</p>
            </div>
            <input
              id="discount_start_at"
              v-model="form.discount_start_at"
              type="date"
              class="setting-input"
              :class="{ 'input-error': fieldError('discount_start_at') }"
            />
            <span v-if="fieldError('discount_start_at')" class="field-error">{{ fieldError('discount_start_at') }}</span>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <label class="setting-label" for="discount_end_at">Discount end date</label>
              <p class="setting-description">End of discount period (must be on or after start date)</p>
            </div>
            <input
              id="discount_end_at"
              v-model="form.discount_end_at"
              type="date"
              class="setting-input"
              :class="{ 'input-error': fieldError('discount_end_at') }"
            />
            <span v-if="fieldError('discount_end_at')" class="field-error">{{ fieldError('discount_end_at') }}</span>
            <span v-if="clientDateError" class="field-error">{{ clientDateError }}</span>
          </div>
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
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { siteSettingsApi } from '@/api/siteSettings'

const loading = ref(true)
const fetchError = ref(null)
const saving = ref(false)
const successMessage = ref('')
const errorSummary = ref('')
const validationErrors = ref({})
const logoPreviewError = ref(false)

const form = reactive({
  site_name: '',
  site_logo: '',
  place_status: 'open',
  maintenance_mode: false,
  discount_percent: null,
  discount_start_at: '',
  discount_end_at: '',
})

const baseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/api\/?$/, '')

const logoPreviewUrl = computed(() => {
  const path = form.site_logo && form.site_logo.trim()
  if (!path) return null
  const normalized = path.replace(/^\//, '')
  return `${baseUrl}/${normalized}`
})

const clientDateError = computed(() => {
  const start = form.discount_start_at
  const end = form.discount_end_at
  if (!start || !end) return null
  if (end < start) return 'End date must be on or after start date.'
  return null
})

function assignFromResponse(data) {
  if (!data) return
  form.site_name = data.site_name ?? ''
  form.site_logo = data.site_logo ?? ''
  form.place_status = data.place_status ?? 'open'
  form.maintenance_mode = data.maintenance_mode ?? false
  form.discount_percent = data.discount_percent != null ? data.discount_percent : null
  form.discount_start_at = data.discount_start_at ?? ''
  form.discount_end_at = data.discount_end_at ?? ''
}

async function loadSettings() {
  loading.value = true
  fetchError.value = null
  logoPreviewError.value = false
  try {
    const data = await siteSettingsApi.get()
    assignFromResponse(data)
  } catch (err) {
    const msg = err.response?.data?.message ?? err.message ?? 'Failed to load settings'
    fetchError.value = msg
    if (err.response?.status === 403) {
      fetchError.value = 'Access denied. Admin only.'
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
    site_name: form.site_name.trim() || null,
    site_logo: form.site_logo.trim() || null,
    place_status: form.place_status || null,
    maintenance_mode: form.maintenance_mode,
  }
  const pct = form.discount_percent
  payload.discount_percent = pct === '' || pct == null ? null : Number(pct)
  payload.discount_start_at = form.discount_start_at.trim() || null
  payload.discount_end_at = form.discount_end_at.trim() || null
  return payload
}

async function save() {
  successMessage.value = ''
  errorSummary.value = ''
  validationErrors.value = {}
  if (clientDateError.value) {
    errorSummary.value = clientDateError.value
    return
  }
  saving.value = true
  try {
    const payload = buildPayload()
    await siteSettingsApi.update(payload)
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

watch(() => form.site_logo, () => {
  logoPreviewError.value = false
})

onMounted(loadSettings)
</script>

<style scoped>
.site-settings {
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

.logo-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
}

.logo-input {
  flex: 1;
  min-width: 200px;
}

.logo-preview {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-preview img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.logo-preview-fail {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
  padding: 0.5rem;
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
  .site-settings {
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
  .logo-row {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
