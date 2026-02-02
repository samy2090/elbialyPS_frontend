<template>
  <component
    :is="tag"
    :to="to || undefined"
    :href="href || undefined"
    :type="type"
    class="futuristic-btn"
    :class="[
      `futuristic-btn--${variant}`,
      { 'futuristic-btn--large': large, 'futuristic-btn--block': block }
    ]"
    @click="tag === 'button' ? $emit('click') : undefined"
  >
    <span class="futuristic-btn__shine" aria-hidden="true"></span>
    <span class="futuristic-btn__text">
      <slot></slot>
    </span>
  </component>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps({
  variant: { type: String, default: 'primary' }, // primary | secondary | ghost
  large: { type: Boolean, default: false },
  block: { type: Boolean, default: false },
  to: { type: [String, Object], default: '' },
  href: { type: String, default: '' },
  type: { type: String, default: 'button' },
})

defineEmits(['click'])

const tag = computed(() => {
  if (props.to) return RouterLink
  if (props.href) return 'a'
  return 'button'
})
</script>

<style scoped>
.futuristic-btn {
  --btn-accent: #8b5cf6;
  --btn-cyan: #06b6d4;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 0.85rem 1.75rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.95rem;
  text-decoration: none;
  border: 1px solid transparent;
  cursor: pointer;
  overflow: hidden;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}

.futuristic-btn--large {
  padding: 1.1rem 2.25rem;
  font-size: 1.05rem;
  border-radius: 14px;
}

.futuristic-btn--block {
  width: 100%;
  max-width: 280px;
}

.futuristic-btn__shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.15),
    transparent
  );
  transition: left 0.5s ease;
}

.futuristic-btn:hover .futuristic-btn__shine {
  left: 100%;
}

.futuristic-btn__text {
  position: relative;
  z-index: 1;
}

/* Primary */
.futuristic-btn--primary {
  background: linear-gradient(135deg, var(--btn-accent), #7c3aed);
  color: #fff;
  border-color: rgba(139, 92, 246, 0.4);
  box-shadow: 0 4px 20px -4px rgba(139, 92, 246, 0.4);
}

.futuristic-btn--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px -8px rgba(139, 92, 246, 0.5);
  border-color: rgba(139, 92, 246, 0.6);
}

/* Secondary */
.futuristic-btn--secondary {
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.9);
  border-color: rgba(255, 255, 255, 0.15);
}

.futuristic-btn--secondary:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(139, 92, 246, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px -8px rgba(139, 92, 246, 0.25);
}

/* Ghost */
.futuristic-btn--ghost {
  background: transparent;
  color: rgba(255, 255, 255, 0.8);
  border-color: rgba(255, 255, 255, 0.1);
}

.futuristic-btn--ghost:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.2);
  color: #fff;
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .futuristic-btn {
    padding: 0.75rem 1.5rem;
    font-size: 0.9rem;
  }

  .futuristic-btn--large {
    padding: 1rem 1.75rem;
    font-size: 1rem;
  }
}
</style>
