<template>
  <article
    class="feature-card"
    :class="[`feature-card--${variant}`, { 'feature-card--animated': animated }]"
  >
    <div class="feature-card__glow" aria-hidden="true"></div>
    <div class="feature-card__line"></div>
    <div class="feature-card__icon-wrap">
      <slot name="icon">
        <span class="feature-card__icon" v-if="icon">{{ icon }}</span>
      </slot>
    </div>
    <h3 class="feature-card__title">{{ title }}</h3>
    <p class="feature-card__description">{{ description }}</p>
    <div v-if="$slots.default || linkTo" class="feature-card__action">
      <slot v-if="$slots.default"></slot>
      <router-link v-else-if="linkTo" :to="linkTo" class="feature-card__link">
        {{ linkText }}
        <span class="feature-card__arrow">→</span>
      </router-link>
    </div>
  </article>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, default: '' },
  variant: { type: String, default: 'purple' }, // purple | teal | green | blue | orange
  linkTo: { type: String, default: '' },
  linkText: { type: String, default: 'Explore →' },
  animated: { type: Boolean, default: true },
})
</script>

<style scoped>
.feature-card {
  --feat-accent: rgba(139, 92, 246, 0.6);
  position: relative;
  padding: 2rem 1.75rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 20px;
  text-align: center;
  overflow: hidden;
  transition: transform 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease;
}

.feature-card:hover {
  transform: translateY(-8px);
  border-color: rgba(255, 255, 255, 0.12);
  box-shadow: 0 24px 48px -16px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.04);
}

.feature-card__glow {
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  background: radial-gradient(ellipse 80% 50% at 50% 0%, var(--feat-accent) 0%, transparent 60%);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.4s ease;
}

.feature-card:hover .feature-card__glow {
  opacity: 0.15;
}

.feature-card__line {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--feat-accent), transparent);
  border-radius: 2px;
  opacity: 0.6;
  transition: width 0.4s ease;
}

.feature-card:hover .feature-card__line {
  width: 100%;
}

.feature-card__icon-wrap {
  margin-bottom: 1.25rem;
}

.feature-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  font-size: 2rem;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--feat-accent);
  transition: transform 0.4s ease, box-shadow 0.4s ease;
}

.feature-card:hover .feature-card__icon {
  transform: scale(1.05);
  box-shadow: 0 0 30px -5px var(--feat-accent);
}

.feature-card__title {
  font-size: 1.25rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: 0.75rem;
  letter-spacing: -0.02em;
}

.feature-card__description {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.feature-card__action {
  margin-top: auto;
}

.feature-card__link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--feat-accent);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  transition: gap 0.25s ease, color 0.25s ease;
}

.feature-card__link:hover {
  color: #a78bfa;
  gap: 0.75rem;
}

.feature-card__arrow {
  transition: transform 0.25s ease;
}

.feature-card__link:hover .feature-card__arrow {
  transform: translateX(4px);
}

.feature-card--teal { --feat-accent: rgba(6, 182, 212, 0.8); }
.feature-card--green { --feat-accent: rgba(16, 185, 129, 0.8); }
.feature-card--blue { --feat-accent: rgba(59, 130, 246, 0.8); }
.feature-card--orange { --feat-accent: rgba(245, 158, 11, 0.8); }

.feature-card--animated .feature-card__icon {
  animation: featureIconFloat 4s ease-in-out infinite;
}

@keyframes featureIconFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

@media (max-width: 768px) {
  .feature-card {
    padding: 1.5rem 1.25rem;
  }

  .feature-card__icon {
    width: 56px;
    height: 56px;
    font-size: 1.75rem;
  }

  .feature-card__title {
    font-size: 1.1rem;
  }

  .feature-card__description {
    font-size: 0.9rem;
  }
}
</style>
