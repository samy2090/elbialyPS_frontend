<template>
  <div class="category-select">
    <label v-if="label" class="category-select__label">{{ label }}</label>
    <select
      :value="modelValue"
      class="category-select__input"
      :disabled="disabled"
      :required="required"
      @change="onChange"
    >
      <option value="" disabled>{{ placeholder }}</option>
      <option
        v-for="cat in flatCategories"
        :key="cat.id"
        :value="cat.id"
      >
        {{ cat.full_path || cat.name }}
      </option>
    </select>
    <p v-if="error" class="category-select__error">{{ error }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: [Number, String], default: '' },
  categories: { type: Array, default: () => [] },
  label: { type: String, default: '' },
  placeholder: { type: String, default: 'Select category' },
  disabled: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  error: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])

function flattenWithPath(items, prefix = '') {
  const out = []
  for (const item of items) {
    const path = prefix ? `${prefix} → ${item.name}` : item.name
    out.push({ ...item, full_path: path })
    if (item.children && item.children.length) {
      out.push(...flattenWithPath(item.children, path))
    }
  }
  return out
}

const flatCategories = computed(() => {
  const list = Array.isArray(props.categories) ? props.categories : []
  return flattenWithPath(list)
})

function onChange(e) {
  const v = e.target.value
  emit('update:modelValue', v === '' ? null : Number(v))
}
</script>

<style scoped>
.category-select {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.category-select__label {
  font-size: 0.875rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
}

.category-select__input {
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.95);
  font-size: 0.9375rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.category-select__input:focus {
  outline: none;
  border-color: rgba(139, 92, 246, 0.6);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2);
}

.category-select__input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.category-select__error {
  font-size: 0.75rem;
  color: #f87171;
  margin: 0;
}
</style>
