<template>
  <span class="expense-status-badge" :class="statusClass" :title="status">
    <span class="status-dot"></span>
    <span class="status-text">{{ label }}</span>
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: String,
    default: 'unpaid',
    validator: (v) => ['paid', 'unpaid'].includes(v),
  },
})

const label = computed(() => (props.status === 'paid' ? 'Paid' : 'Unpaid'))
const statusClass = computed(() => `expense-status-badge--${props.status}`)
</script>

<style scoped>
.expense-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  border: 1px solid transparent;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.expense-status-badge:hover {
  transform: scale(1.02);
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 0 8px currentColor;
}

.status-text {
  line-height: 1;
}

.expense-status-badge--paid {
  color: #34d399;
  background: rgba(52, 211, 153, 0.12);
  border-color: rgba(52, 211, 153, 0.35);
  box-shadow: 0 0 12px rgba(52, 211, 153, 0.15);
}

.expense-status-badge--paid .status-dot {
  background: #34d399;
}

.expense-status-badge--unpaid {
  color: #fbbf24;
  background: rgba(251, 191, 36, 0.12);
  border-color: rgba(251, 191, 36, 0.35);
  box-shadow: 0 0 12px rgba(251, 191, 36, 0.15);
}

.expense-status-badge--unpaid .status-dot {
  background: #fbbf24;
}
</style>
