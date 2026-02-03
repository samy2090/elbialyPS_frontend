<template>
  <button
    type="button"
    class="confirm-payment-btn"
    :disabled="loading"
    @click="onClick"
  >
    <span v-if="loading" class="confirm-payment-btn__spinner"></span>
    <span v-else class="confirm-payment-btn__text">{{ label }}</span>
  </button>
</template>

<script setup>
defineProps({
  loading: { type: Boolean, default: false },
  label: { type: String, default: 'Confirm payment' },
})

const emit = defineEmits(['click'])

function onClick() {
  emit('click')
}
</script>

<style scoped>
.confirm-payment-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, rgba(52, 211, 153, 0.25), rgba(16, 185, 129, 0.2));
  border: 1px solid rgba(52, 211, 153, 0.5);
  border-radius: 10px;
  color: #6ee7b7;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.confirm-payment-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(52, 211, 153, 0.35), rgba(16, 185, 129, 0.3));
  border-color: rgba(52, 211, 153, 0.7);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(52, 211, 153, 0.25);
}

.confirm-payment-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.confirm-payment-btn__spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(110, 231, 183, 0.3);
  border-top-color: #6ee7b7;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
