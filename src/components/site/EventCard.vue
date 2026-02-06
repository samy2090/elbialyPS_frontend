<template>
  <article class="event-card" :class="{ 'event-card--animated': animated }">
    <div class="event-card__glow" aria-hidden="true"></div>
    <div class="event-card__line"></div>
    <div class="event-card__date">
      <span class="event-card__day">{{ day }}</span>
      <span class="event-card__month">{{ month }}</span>
    </div>
    <div class="event-card__body">
      <h3 class="event-card__title">{{ title }}</h3>
      <p v-if="description" class="event-card__description">{{ description }}</p>
      <div v-if="$slots.default || linkTo" class="event-card__action">
        <slot v-if="$slots.default"></slot>
        <router-link v-else-if="linkTo" :to="linkTo" class="event-card__link">
          Join the vibe →
        </router-link>
      </div>
    </div>
  </article>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  day: { type: String, required: true },
  month: { type: String, required: true },
  linkTo: { type: String, default: '' },
  animated: { type: Boolean, default: true },
})
</script>

<style scoped>
.event-card {
  --event-accent: rgba(0, 245, 255, 0.7);
  position: relative;
  padding: 1.5rem 1.5rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  overflow: hidden;
  display: flex;
  gap: 1.25rem;
  align-items: flex-start;
  transition: transform 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease;
}

.event-card:hover {
  transform: translateY(-6px);
  border-color: rgba(0, 245, 255, 0.25);
  box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.4), 0 0 40px -8px var(--event-accent);
}

.event-card__glow {
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  background: radial-gradient(ellipse 80% 50% at 50% 0%, var(--event-accent) 0%, transparent 60%);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.35s ease;
}

.event-card:hover .event-card__glow {
  opacity: 0.12;
}

.event-card__line {
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(180deg, var(--event-accent), transparent);
  border-radius: 4px 0 0 4px;
  opacity: 0.7;
  transition: opacity 0.35s ease;
}

.event-card:hover .event-card__line {
  opacity: 1;
  box-shadow: 0 0 20px var(--event-accent);
}

.event-card__date {
  flex-shrink: 0;
  width: 56px;
  text-align: center;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.event-card__day {
  display: block;
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--event-accent);
  line-height: 1.1;
  text-shadow: 0 0 20px rgba(0, 245, 255, 0.4);
}

.event-card__month {
  display: block;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(255, 255, 255, 0.6);
}

.event-card__body {
  flex: 1;
  min-width: 0;
}

.event-card__title {
  font-size: 1.15rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: 0.5rem;
  letter-spacing: -0.02em;
}

.event-card__description {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.5;
  margin-bottom: 1rem;
}

.event-card__action {
  margin-top: auto;
}

.event-card__link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: var(--event-accent);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  transition: gap 0.25s ease, color 0.25s ease, text-shadow 0.25s ease;
}

.event-card__link:hover {
  color: #fff;
  gap: 0.5rem;
  text-shadow: 0 0 12px var(--event-accent);
}

.event-card--animated .event-card__date {
  animation: eventDatePulse 4s ease-in-out infinite;
}

@keyframes eventDatePulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.85; }
}

@media (max-width: 768px) {
  .event-card {
    flex-direction: row;
    gap: 1rem;
    padding: 1.25rem;
  }

  .event-card__date {
    width: 52px;
    flex-shrink: 0;
  }

  .event-card__day {
    font-size: 1.25rem;
  }
}
</style>
