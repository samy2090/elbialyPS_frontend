<template>
  <span class="currency-display" :class="{ 'currency-display--muted': muted }">
    {{ formatted }}
  </span>
</template>

<script setup>
import { computed } from 'vue'
import { formatCurrencyEGP } from '@/utils/expenseHelpers'

const props = defineProps({
  amount: { type: [Number, String], default: 0 },
  muted: { type: Boolean, default: false },
})

const formatted = computed(() => formatCurrencyEGP(Number(props.amount)))
</script>

<style scoped>
.currency-display {
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  letter-spacing: 0.02em;
  text-shadow: 0 0 20px rgba(139, 92, 246, 0.2);
}

.currency-display--muted {
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  text-shadow: none;
}
</style>
