<script setup>
import PostsFeedSection from '@/components/site/posts/PostsFeedSection.vue'
</script>

<template>
  <div class="home-page home-page--fun home-feed-page">
    <div class="home-page__bg" aria-hidden="true">
      <div class="home-page__mesh"></div>
      <div class="home-page__grid"></div>
      <div class="home-page__glow home-page__glow--1"></div>
      <div class="home-page__glow home-page__glow--2"></div>
      <div class="home-page__glow home-page__glow--3"></div>
    </div>

    <section class="home-section home-section--feed" aria-label="Community feed">
      <div class="home-section__inner home-feed-page__inner">
        <PostsFeedSection :is-preview="false" />
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-feed-page {
  min-height: calc(100vh - 80px);
  padding-top: clamp(2rem, 6vw, 4rem);
  padding-bottom: clamp(2rem, 6vw, 4rem);
  position: relative;
}

.home-feed-page__inner {
  position: relative;
  z-index: 1;
}
</style>
