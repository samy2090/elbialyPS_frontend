<template>
  <form class="expense-recurrence-form futuristic-form" @submit.prevent="onSubmit">
    <div class="form-grid">
      <div class="form-field full">
        <label class="form-label">Title *</label>
        <input
          v-model="form.title"
          type="text"
          class="form-input"
          placeholder="e.g. Office Rent"
          maxlength="255"
        />
        <p v-if="errors.title" class="form-error">{{ errors.title }}</p>
      </div>
      <div class="form-field">
        <label class="form-label">Price (EGP) *</label>
        <input
          v-model.number="form.price"
          type="number"
          class="form-input"
          placeholder="0.00"
          step="0.01"
          min="0"
        />
        <p v-if="errors.price" class="form-error">{{ errors.price }}</p>
      </div>
      <div class="form-field">
        <label class="form-label">Main category *</label>
        <CustomDropdown
          v-model="form.main_category_id"
          :options="mainCategoryOptions"
          option-value="id"
          option-label="name"
          placeholder="Select main category"
          :show-placeholder-in-menu="true"
          @change="onMainCategoryChange"
        />
        <p v-if="errors.category_id" class="form-error">{{ errors.category_id }}</p>
      </div>
      <div v-if="subCategoryOptions.length" class="form-field">
        <label class="form-label">Sub-category</label>
        <CustomDropdown
          v-model="form.sub_category_id"
          :options="subCategoryOptions"
          option-value="id"
          option-label="name"
          placeholder="Select sub-category (optional)"
          :show-placeholder-in-menu="true"
        />
      </div>
      <div class="form-field">
        <label class="form-label">Frequency *</label>
        <CustomDropdown
          v-model="form.frequency"
          :options="frequencyOptions"
          option-value="id"
          option-label="name"
          placeholder="Select frequency"
          :show-placeholder-in-menu="true"
        />
      </div>
      <div class="form-field">
        <label class="form-label">Due day (1–31) *</label>
        <input
          v-model.number="form.due_day"
          type="number"
          class="form-input"
          min="1"
          max="31"
        />
        <p v-if="errors.due_day" class="form-error">{{ errors.due_day }}</p>
      </div>
      <div class="form-field">
        <label class="form-label">Start date *</label>
        <input v-model="form.start_date" type="date" class="form-input" />
        <p v-if="errors.start_date" class="form-error">{{ errors.start_date }}</p>
      </div>
      <div class="form-field">
        <label class="form-label">End date (optional)</label>
        <input v-model="form.end_date" type="date" class="form-input" />
        <p v-if="errors.end_date" class="form-error">{{ errors.end_date }}</p>
      </div>
      <div class="form-field full">
        <label class="form-option">
          <input v-model="form.is_active" type="checkbox" />
          <span>Active</span>
        </label>
      </div>
    </div>
    <div class="form-actions">
      <button type="button" class="btn-ghost" @click="$emit('cancel')">Cancel</button>
      <button type="submit" class="btn-primary" :disabled="saving">
        <span v-if="saving" class="btn-spinner"></span>
        <span v-else>{{ submitLabel }}</span>
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import CustomDropdown from '@/components/base/ui/CustomDropdown.vue'

const props = defineProps({
  modelValue: { type: Object, default: () => ({}) },
  categories: { type: Array, default: () => [] },
  submitLabel: { type: String, default: 'Save' },
  saving: { type: Boolean, default: false },
})

const emit = defineEmits(['submit', 'cancel', 'update:modelValue'])

const form = ref({
  title: '',
  price: 0,
  main_category_id: null,
  sub_category_id: null,
  category_id: null,
  frequency: 'monthly',
  due_day: 1,
  start_date: new Date().toISOString().slice(0, 10),
  end_date: '',
  is_active: true,
  ...props.modelValue,
})

const errors = ref({})

const list = computed(() => Array.isArray(props.categories) ? props.categories : [])

const mainCategoryOptions = computed(() => list.value.filter((c) => !c.parent_id))

const subCategoryOptions = computed(() => {
  const mainId = form.value.main_category_id
  if (mainId == null || mainId === '') return []
  return list.value.filter((c) => c.parent_id === mainId)
})

const frequencyOptions = [
  { id: 'monthly', name: 'Monthly' },
  { id: 'yearly', name: 'Yearly' },
]

function onMainCategoryChange() {
  form.value.sub_category_id = null
}

function resolveCategoryId() {
  const sub = form.value.sub_category_id
  const main = form.value.main_category_id
  if (sub != null && sub !== '') return sub
  if (main != null && main !== '') return main
  return null
}

function syncCategoryFromId(categoryId) {
  const catId = categoryId != null ? Number(categoryId) : null
  if (catId === null || Number.isNaN(catId)) return
  const categories = list.value
  if (!categories?.length) return
  const cat = categories.find((c) => Number(c.id) === catId)
  if (!cat) return
  if (cat.parent_id != null && cat.parent_id !== '') {
    form.value.main_category_id = cat.parent_id
    form.value.sub_category_id = catId
  } else {
    form.value.main_category_id = catId
    form.value.sub_category_id = null
  }
}

watch(
  () => [props.modelValue, props.categories],
  ([v]) => {
    if (v && typeof v === 'object') {
      form.value = { ...form.value, ...v }
      syncCategoryFromId(v.category_id)
    }
  },
  { deep: true, immediate: true }
)

watch(
  [() => form.value.main_category_id, () => form.value.sub_category_id],
  () => {
    form.value.category_id = resolveCategoryId()
  },
  { deep: true }
)

function validate() {
  const e = {}
  if (!String(form.value.title).trim()) e.title = 'Title is required.'
  if (form.value.price == null || form.value.price < 0) e.price = 'Price must be ≥ 0.'
  const catId = resolveCategoryId()
  if (catId == null || catId === '') e.category_id = 'Category is required.'
  if (form.value.due_day < 1 || form.value.due_day > 31) e.due_day = 'Due day must be 1–31.'
  if (!form.value.start_date) e.start_date = 'Start date is required.'
  if (form.value.end_date && form.value.start_date && form.value.end_date <= form.value.start_date) {
    e.end_date = 'End date must be after start date.'
  }
  errors.value = e
  return Object.keys(e).length === 0
}

function onSubmit() {
  if (!validate()) return
  const payload = {
    ...form.value,
    category_id: resolveCategoryId(),
  }
  if (!payload.end_date) payload.end_date = null
  emit('update:modelValue', payload)
  emit('submit', payload)
}
</script>

<style scoped>
.expense-recurrence-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

.form-field.full {
  grid-column: 1 / -1;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.95);
  font-size: 0.9375rem;
}

.form-input:focus {
  outline: none;
  border-color: rgba(139, 92, 246, 0.6);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2);
}

.form-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
}

.form-option input {
  accent-color: #8b5cf6;
}

.form-error {
  font-size: 0.75rem;
  color: #f87171;
  margin: 0.35rem 0 0;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 0.5rem;
}

.btn-primary,
.btn-ghost {
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 100px;
}

.btn-primary {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  border: 1px solid rgba(139, 92, 246, 0.5);
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-ghost {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.9);
}

.btn-ghost:hover {
  background: rgba(255, 255, 255, 0.1);
}

.btn-spinner {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 640px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
