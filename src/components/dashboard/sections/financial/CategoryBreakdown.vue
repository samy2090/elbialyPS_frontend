<template>
  <div class="category-breakdown">
    <div class="category-breakdown__panel">
      <header class="category-breakdown__header">
        <h3 class="category-breakdown__title">Revenue Sources</h3>
        <p class="category-breakdown__subtitle">
          Rental time vs in-session products — with per-period product gross margin
        </p>
      </header>
      <div v-if="!revenueBreakdown" class="category-breakdown__empty">No revenue data.</div>
      <div v-else class="revenue-split">
        <div class="revenue-split__row">
          <div class="revenue-split__label">
            <span class="revenue-split__dot" style="background:#a78bfa"></span>
            Rental (play time)
          </div>
          <div class="revenue-split__values">
            <span class="revenue-split__amount">{{ formatEGP(revenueBreakdown.rental_revenue) }}</span>
            <span class="revenue-split__share">{{ formatPct(revenueBreakdown.rental_share) }}</span>
          </div>
        </div>
        <div class="revenue-split__bar">
          <div
            class="revenue-split__bar-fill rental"
            :style="{ width: `${revenueBreakdown.rental_share ?? 0}%` }"
          ></div>
        </div>

        <div class="revenue-split__row">
          <div class="revenue-split__label">
            <span class="revenue-split__dot" style="background:#06b6d4"></span>
            Products sold
          </div>
          <div class="revenue-split__values">
            <span class="revenue-split__amount">{{ formatEGP(revenueBreakdown.product_revenue) }}</span>
            <span class="revenue-split__share">{{ formatPct(revenueBreakdown.product_share) }}</span>
          </div>
        </div>
        <div class="revenue-split__bar">
          <div
            class="revenue-split__bar-fill products"
            :style="{ width: `${revenueBreakdown.product_share ?? 0}%` }"
          ></div>
        </div>

        <!-- Product profitability sub-block (informational) -->
        <div
          v-if="hasProductActivity"
          class="revenue-split__sub"
          title="Cost of goods sold uses the current product cost. Stock-purchase expenses already deduct from profit when paid; this block is for per-period margin visibility only."
        >
          <div class="revenue-split__sub-row">
            <span class="revenue-split__sub-label">└ Product COGS</span>
            <span class="revenue-split__sub-value cogs">
              {{ formatEGP(revenueBreakdown.product_cogs) }}
            </span>
          </div>
          <div class="revenue-split__sub-row">
            <span class="revenue-split__sub-label">└ Product gross margin</span>
            <span
              class="revenue-split__sub-value"
              :class="marginToneClass(revenueBreakdown.product_gross_margin)"
            >
              {{ formatEGP(revenueBreakdown.product_gross_margin) }}
              <span class="revenue-split__sub-pct">
                ({{ formatPct(revenueBreakdown.product_margin_pct) }})
              </span>
            </span>
          </div>
        </div>

        <div class="revenue-split__total">
          <span class="revenue-split__total-label">Total revenue</span>
          <span class="revenue-split__total-value">{{ formatEGP(revenueBreakdown.total_revenue) }}</span>
        </div>
      </div>
    </div>

    <div class="category-breakdown__panel">
      <header class="category-breakdown__header">
        <h3 class="category-breakdown__title">Expenses by Category</h3>
        <p class="category-breakdown__subtitle">Paid only — fixed (recurring) vs variable (one-off)</p>
      </header>
      <div v-if="!categories?.length" class="category-breakdown__empty">No expenses for this range.</div>
      <div v-else class="category-breakdown__table-wrap desktop-only">
        <table class="category-breakdown__table">
          <thead>
            <tr>
              <th>Category</th>
              <th class="num">Count</th>
              <th class="num">Fixed</th>
              <th class="num">Variable</th>
              <th class="num">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in categories" :key="row.category_id ?? row.category_name">
              <td>{{ row.category_name }}</td>
              <td class="num">{{ row.expense_count }}</td>
              <td class="num fixed">{{ formatEGP(row.fixed_amount) }}</td>
              <td class="num variable">{{ formatEGP(row.variable_amount) }}</td>
              <td class="num total">{{ formatEGP(row.amount) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="categories?.length" class="category-breakdown__cards mobile-only">
        <div
          v-for="row in categories"
          :key="`m-${row.category_id ?? row.category_name}`"
          class="category-card"
        >
          <div class="category-card__head">
            <span class="category-card__name">{{ row.category_name }}</span>
            <span class="category-card__count">{{ row.expense_count }} item(s)</span>
          </div>
          <div class="category-card__row">
            <span class="muted">Fixed</span><span>{{ formatEGP(row.fixed_amount) }}</span>
          </div>
          <div class="category-card__row">
            <span class="muted">Variable</span><span>{{ formatEGP(row.variable_amount) }}</span>
          </div>
          <div class="category-card__row total">
            <span>Total</span><span>{{ formatEGP(row.amount) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatCurrencyEGP } from '@/utils/expenseHelpers'

const props = defineProps({
  revenueBreakdown: { type: Object, default: null },
  categories: { type: Array, default: () => [] },
})

const hasProductActivity = computed(
  () => Number(props.revenueBreakdown?.product_revenue ?? 0) > 0,
)

function formatEGP(v) {
  return formatCurrencyEGP(v ?? 0)
}

function formatPct(v) {
  if (v === null || v === undefined) return '—'
  return `${Number(v).toFixed(1)}%`
}

function marginToneClass(margin) {
  const n = Number(margin)
  if (Number.isNaN(n) || n === 0) return 'margin-neutral'
  return n > 0 ? 'margin-positive' : 'margin-negative'
}
</script>

<style scoped>
.category-breakdown {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 1rem;
}

.category-breakdown__panel {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 1.25rem;
  transition: border-color 0.25s ease, box-shadow 0.25s ease;
}

.category-breakdown__panel:hover {
  border-color: rgba(255, 255, 255, 0.12);
  box-shadow: 0 12px 32px -8px rgba(0, 0, 0, 0.35);
}

.category-breakdown__header {
  margin-bottom: 1rem;
}

.category-breakdown__title {
  font-size: 1rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 0.25rem 0;
  letter-spacing: -0.01em;
}

.category-breakdown__subtitle {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.55);
  margin: 0;
}

.category-breakdown__empty {
  padding: 2rem 1rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.45);
  font-size: 0.875rem;
}

/* Revenue split */
.revenue-split {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.revenue-split__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
}

.revenue-split__label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 600;
}

.revenue-split__dot {
  width: 0.625rem;
  height: 0.625rem;
  border-radius: 50%;
  display: inline-block;
}

.revenue-split__values {
  display: flex;
  gap: 0.75rem;
  align-items: baseline;
  font-variant-numeric: tabular-nums;
}

.revenue-split__amount {
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
}

.revenue-split__share {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.55);
  min-width: 3rem;
  text-align: right;
}

.revenue-split__bar {
  height: 6px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.revenue-split__bar-fill {
  height: 100%;
  transition: width 0.4s ease;
}

.revenue-split__bar-fill.rental {
  background: linear-gradient(90deg, #8b5cf6, #a78bfa);
  box-shadow: 0 0 18px rgba(139, 92, 246, 0.45);
}

.revenue-split__bar-fill.products {
  background: linear-gradient(90deg, #06b6d4, #22d3ee);
  box-shadow: 0 0 18px rgba(6, 182, 212, 0.4);
}

.revenue-split__sub {
  margin: 0.1rem 0 0.3rem 1rem;
  padding: 0.5rem 0.75rem;
  background: rgba(6, 182, 212, 0.04);
  border-left: 2px solid rgba(6, 182, 212, 0.4);
  border-radius: 0 8px 8px 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  cursor: help;
}

.revenue-split__sub-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-size: 0.75rem;
}

.revenue-split__sub-label {
  color: rgba(255, 255, 255, 0.55);
  font-weight: 500;
}

.revenue-split__sub-value {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: rgba(255, 255, 255, 0.85);
}

.revenue-split__sub-value.cogs {
  color: #fbbf24;
}

.revenue-split__sub-value.margin-positive {
  color: #34d399;
}

.revenue-split__sub-value.margin-negative {
  color: #f87171;
}

.revenue-split__sub-value.margin-neutral {
  color: rgba(255, 255, 255, 0.7);
}

.revenue-split__sub-pct {
  font-size: 0.7rem;
  font-weight: 600;
  margin-left: 0.2rem;
  color: rgba(255, 255, 255, 0.55);
}

.revenue-split__total {
  margin-top: 0.5rem;
  padding-top: 0.75rem;
  border-top: 1px dashed rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.revenue-split__total-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(255, 255, 255, 0.55);
}

.revenue-split__total-value {
  font-size: 1.125rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: #a78bfa;
  text-shadow: 0 0 18px rgba(139, 92, 246, 0.35);
}

/* Table */
.category-breakdown__table-wrap {
  overflow-x: auto;
}

.category-breakdown__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.category-breakdown__table th,
.category-breakdown__table td {
  padding: 0.6rem 0.75rem;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.category-breakdown__table th {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(255, 255, 255, 0.5);
}

.category-breakdown__table td {
  color: rgba(255, 255, 255, 0.85);
}

.category-breakdown__table .num {
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.category-breakdown__table .fixed {
  color: #fbbf24;
}

.category-breakdown__table .variable {
  color: #34d399;
}

.category-breakdown__table .total {
  color: rgba(255, 255, 255, 0.95);
  font-weight: 700;
}

/* Mobile cards */
.category-breakdown__cards {
  display: none;
  flex-direction: column;
  gap: 0.75rem;
}

.category-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 0.875rem;
}

.category-card__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.category-card__name {
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
}

.category-card__count {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.55);
}

.category-card__row {
  display: flex;
  justify-content: space-between;
  font-size: 0.8125rem;
  padding: 0.25rem 0;
}

.category-card__row .muted {
  color: rgba(255, 255, 255, 0.55);
}

.category-card__row.total {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px dashed rgba(255, 255, 255, 0.1);
  font-weight: 700;
}

.desktop-only {
  display: block;
}
.mobile-only {
  display: none;
}

@media (max-width: 768px) {
  .category-breakdown__panel {
    padding: 1rem;
  }
  .desktop-only {
    display: none;
  }
  .mobile-only {
    display: flex;
  }
}
</style>
