<template>
  <div class="loading-spinner">
    <div class="loading-spinner-container">
      <div class="loading-spinner-rings">
        <div class="loading-ring-1"></div>
        <div class="loading-ring-2"></div>
        <div class="loading-ring-3"></div>
      </div>
      <div class="loading-spinner-center">
        <i class="loading-center-icon">⚡</i>
      </div>
    </div>
    <div class="loading-dots">
      <span class="loading-dot"></span>
      <span class="loading-dot"></span>
      <span class="loading-dot"></span>
    </div>
    <p v-if="message" class="loading-message">{{ message }}</p>
  </div>
</template>

<script>
export default {
  name: 'LoadingSpinner',
  props: {
    message: {
      type: String,
      default: 'Loading...'
    }
  }
}
</script>