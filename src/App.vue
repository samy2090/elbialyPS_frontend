<script setup>
import { RouterView, useRoute } from 'vue-router'
import SiteNavbar from '@/components/site/layout/SiteNavbar.vue'
import { useAuthStore } from '@/stores/auth'
import { onMounted, computed } from 'vue'
import { useViewportDimensions } from '@/composables/useViewportDimensions'

const authStore = useAuthStore()
const route = useRoute()

useViewportDimensions()

onMounted(() => {
  authStore.initAuth()
})

const isDashboardRoute = computed(() => route.name === 'dashboard')
</script>

<template>
  <div v-if="!isDashboardRoute" class="app-container">
    <SiteNavbar />
    <main class="main-content">
      <RouterView />
    </main>
  </div>
  <RouterView v-else />
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  background: var(--bg-primary);
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}

.main-content {
  flex: 1;
  padding: 0;
  max-width: none;
  margin: 0;
  width: 100%;
  overflow-x: hidden;
  min-width: 0;
}

@media (max-width: 768px) {
  .main-content {
    padding: 0;
  }
}
</style>