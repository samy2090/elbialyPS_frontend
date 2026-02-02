<template>
  <section class="cta-block" :class="{ 'cta-block--compact': compact }">
    <div class="cta-block__bg">
      <div class="cta-block__grid" aria-hidden="true"></div>
      <div class="cta-block__glow cta-block__glow--1"></div>
      <div class="cta-block__glow cta-block__glow--2"></div>
    </div>
    <div class="cta-block__inner">
      <h2 class="cta-block__title">{{ title }}</h2>
      <p v-if="description" class="cta-block__description">{{ description }}</p>
      <div class="cta-block__actions">
        <slot name="actions"></slot>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  compact: { type: Boolean, default: false },
})
</script>

<style scoped>
.cta-block {
  position: relative;
  padding: clamp(4rem, 10vw, 6rem) 1.5rem;
  text-align: center;
  overflow: hidden;
}

.cta-block__bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(139, 92, 246, 0.06) 0%, rgba(6, 182, 212, 0.03) 100%);
  border-top: 1px solid rgba(139, 92, 246, 0.1);
  border-bottom: 1px solid rgba(139, 92, 246, 0.08);
}

.cta-block__grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse 80% 60% at 50% 50%, black 30%, transparent 70%);
  -webkit-mask-image: radial-gradient(ellipse 80% 60% at 50% 50%, black 30%, transparent 70%);
}

.cta-block__glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.4;
  pointer-events: none;
}

.cta-block__glow--1 {
  width: 400px;
  height: 200px;
  background: rgba(139, 92, 246, 0.2);
  top: -50px;
  left: 50%;
  transform: translateX(-50%);
  animation: ctaGlow1 8s ease-in-out infinite;
}

.cta-block__glow--2 {
  width: 300px;
  height: 150px;
  background: rgba(6, 182, 212, 0.15);
  bottom: -30px;
  right: 10%;
  animation: ctaGlow2 10s ease-in-out infinite;
}

@keyframes ctaGlow1 {
  0%, 100% { opacity: 0.3; transform: translateX(-50%) scale(1); }
  50% { opacity: 0.5; transform: translateX(-50%) scale(1.1); }
}

@keyframes ctaGlow2 {
  0%, 100% { opacity: 0.2; transform: scale(1); }
  50% { opacity: 0.35; transform: scale(1.15); }
}

.cta-block__inner {
  position: relative;
  z-index: 1;
  max-width: 600px;
  margin: 0 auto;
}

.cta-block__title {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 800;
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: 0.75rem;
  letter-spacing: -0.03em;
  line-height: 1.2;
}

.cta-block__description {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.65);
  line-height: 1.6;
  margin-bottom: 2rem;
}

.cta-block__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
}

.cta-block--compact {
  padding: clamp(3rem, 6vw, 4rem) 1.5rem;
}

.cta-block--compact .cta-block__description {
  margin-bottom: 1.5rem;
}

@media (max-width: 768px) {
  .cta-block__actions {
    flex-direction: column;
    align-items: center;
  }
}
</style>
