<template>
  <header class="section-header" :class="{ 'section-header--center': center }">
    <h2 class="section-header__title">{{ title }}</h2>
    <p v-if="description" class="section-header__description">{{ description }}</p>
  </header>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  center: { type: Boolean, default: true },
})
</script>

<style scoped>
.section-header {
  margin-bottom: clamp(2.5rem, 5vw, 4rem);
  max-width: 640px;
}

.section-header--center {
  text-align: center;
  margin-left: auto;
  margin-right: auto;
}

.section-header__title {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 800;
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: 0.5rem;
  letter-spacing: -0.03em;
  line-height: 1.2;
}

.section-header__description {
  font-size: 1.05rem;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.6;
}

@media (max-width: 768px) {
  .section-header {
    margin-bottom: 2rem;
  }
}
</style>
