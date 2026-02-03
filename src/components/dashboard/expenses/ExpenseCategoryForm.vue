<template>
  <form class="expense-category-form futuristic-form" @submit.prevent="onSubmit">
    <div class="form-field">
      <label class="form-label">Name *</label>
      <input
        v-model="form.name"
        type="text"
        class="form-input"
        placeholder="e.g. Office Supplies"
        maxlength="255"
      />
      <p v-if="errors.name" class="form-error">{{ errors.name }}</p>
    </div>
    <div class="form-field">
      <label class="form-label">Parent category</label>
      <CustomDropdown
        v-model="form.parent_id"
        :options="parentCategoryOptions"
        option-value="id"
        option-label="name"
        placeholder="None (main category)"
        :show-placeholder-in-menu="true"
      />
    </div>
    <div class="form-field">
      <label class="form-option">
        <input v-model="form.is_active" type="checkbox" />
        <span>Active</span>
      </label>
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
  mainCategories: { type: Array, default: () => [] },
  submitLabel: { type: String, default: 'Save' },
  saving: { type: Boolean, default: false },
})

const emit = defineEmits(['submit', 'cancel', 'update:modelValue'])

const form = ref({
  name: '',
  parent_id: null,
  is_active: true,
  ...props.modelValue,
})

const errors = ref({})

// Options for parent: exclude current category (can't be own parent), use main categories only
const parentCategoryOptions = computed(() => {
  const main = props.mainCategories || []
  const editingId = form.value.id
  if (!editingId) return main
  return main.filter((c) => c.id !== editingId)
})

watch(() => props.modelValue, (v) => {
  if (v && typeof v === 'object') form.value = { ...form.value, ...v }
}, { deep: true })

function validate() {
  const e = {}
  if (!String(form.value.name).trim()) e.name = 'Name is required.'
  errors.value = e
  return Object.keys(e).length === 0
}

function onSubmit() {
  if (!validate()) return
  const payload = { ...form.value }
  // CustomDropdown emits '' for placeholder; normalize to null for parent_id
  if (payload.parent_id === '' || payload.parent_id === undefined) payload.parent_id = null
  emit('update:modelValue', payload)
  emit('submit', payload)
}
</script>

<style scoped>
.expense-category-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
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
</style>
