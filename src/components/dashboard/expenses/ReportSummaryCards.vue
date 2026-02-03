<template>
  <div class="report-summary-cards">
    <div class="report-summary-cards__grid">
      <article class="summary-card summary-card--total">
        <div class="summary-card__glow"></div>
        <div class="summary-card__content">
          <span class="summary-card__value">{{ formatEGP(totals?.total_amount ?? 0) }}</span>
          <span class="summary-card__label">Total amount</span>
        </div>
      </article>
      <article class="summary-card summary-card--paid">
        <div class="summary-card__glow"></div>
        <div class="summary-card__content">
          <span class="summary-card__value">{{ formatEGP(totals?.paid_amount ?? 0) }}</span>
          <span class="summary-card__label">Paid ({{ totals?.paid_count ?? 0 }})</span>
        </div>
      </article>
      <article class="summary-card summary-card--unpaid">
        <div class="summary-card__glow"></div>
        <div class="summary-card__content">
          <span class="summary-card__value">{{ formatEGP(totals?.unpaid_amount ?? 0) }}</span>
          <span class="summary-card__label">Unpaid ({{ totals?.unpaid_count ?? 0 }})</span>
        </div>
      </article>
      <article class="summary-card summary-card--count">
        <div class="summary-card__glow"></div>
        <div class="summary-card__content">
          <span class="summary-card__value">{{ totals?.total_expenses ?? 0 }}</span>
          <span class="summary-card__label">Expenses</span>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup>
import { formatCurrencyEGP } from '@/utils/expenseHelpers'

defineProps({
  totals: {
    type: Object,
    default: () => ({
      total_expenses: 0,
      total_amount: 0,
      paid_amount: 0,
      unpaid_amount: 0,
      paid_count: 0,
      unpaid_count: 0,
    }),
  },
})

function formatEGP(amount) {
  return formatCurrencyEGP(amount)
}
</script>

<style scoped>
.report-summary-cards {
  margin-bottom: 1.5rem;
}

.report-summary-cards__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1rem;
}

.summary-card {
  position: relative;
  padding: 1.25rem 1rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  overflow: hidden;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}

.summary-card:hover {
  transform: translateY(-4px);
  border-color: rgba(255, 255, 255, 0.12);
  box-shadow: 0 12px 32px -8px rgba(0, 0, 0, 0.35);
}

.summary-card__glow {
  position: absolute;
  top: -50%;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  height: 100%;
  border-radius: 50%;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.25s ease;
}

.summary-card:hover .summary-card__glow {
  opacity: 1;
}

.summary-card__content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.summary-card__value {
  font-size: clamp(1.1rem, 2.5vw, 1.5rem);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
}

.summary-card__label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(255, 255, 255, 0.55);
}

.summary-card--total .summary-card__value {
  color: #a78bfa;
  text-shadow: 0 0 24px rgba(139, 92, 246, 0.35);
}

.summary-card--total .summary-card__glow {
  background: radial-gradient(ellipse at center, rgba(139, 92, 246, 0.12) 0%, transparent 70%);
}

.summary-card--paid .summary-card__value {
  color: #34d399;
  text-shadow: 0 0 20px rgba(52, 211, 153, 0.3);
}

.summary-card--paid .summary-card__glow {
  background: radial-gradient(ellipse at center, rgba(52, 211, 153, 0.08) 0%, transparent 70%);
}

.summary-card--unpaid .summary-card__value {
  color: #fbbf24;
  text-shadow: 0 0 20px rgba(251, 191, 36, 0.25);
}

.summary-card--unpaid .summary-card__glow {
  background: radial-gradient(ellipse at center, rgba(251, 191, 36, 0.08) 0%, transparent 70%);
}

.summary-card--count .summary-card__value {
  color: #06b6d4;
  text-shadow: 0 0 20px rgba(6, 182, 212, 0.3);
}

.summary-card--count .summary-card__glow {
  background: radial-gradient(ellipse at center, rgba(6, 182, 212, 0.08) 0%, transparent 70%);
}
</style>
