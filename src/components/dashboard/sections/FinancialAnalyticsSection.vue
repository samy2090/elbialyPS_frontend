<template>
  <div class="financial-section">
    <!-- Header -->
    <div class="financial-section__header">
      <div class="financial-section__header-info">
        <h1 class="financial-section__title">Financial Analytics</h1>
        <p class="financial-section__subtitle">
          Revenues and profits across daily, weekly, monthly, and yearly views — operating profit excludes
          fixed (recurring) costs to give a fair daily picture.
        </p>
      </div>
    </div>

    <!-- Top filter bar -->
    <div class="financial-section__filters">
      <DateRangePicker
        v-model="dateRange"
        :default-mode="'range'"
        :allow-mode-toggle="false"
        :auto-apply="true"
        placeholder="Date range"
        title="Filter by date"
        class="financial-section__filter-date"
        @change="onDateRangeChange"
      />
      <CustomDropdown
        v-model="period"
        :options="periodOptions"
        option-value="id"
        option-label="name"
        :show-placeholder-in-menu="false"
        placeholder="Daily"
        class="financial-section__filter-period"
        @change="onFiltersChange"
      />
      <button
        type="button"
        class="financial-section__refresh"
        :disabled="anyLoading"
        @click="loadAll"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
          <path
            d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
          />
        </svg>
        Refresh
      </button>
    </div>

    <!-- Quick-range presets -->
    <div class="financial-section__presets">
      <button
        v-for="preset in presets"
        :key="preset.id"
        type="button"
        class="preset-btn"
        :class="{ active: activePreset === preset.id }"
        @click="applyPreset(preset)"
      >
        {{ preset.label }}
      </button>
      <span class="financial-section__active-range">
        Showing
        <strong>{{ effectiveRange.from || '—' }}</strong>
        to
        <strong>{{ effectiveRange.to || '—' }}</strong>
        <span v-if="lastReloadAt" class="financial-section__last-update">
          · updated {{ lastReloadAt }}
        </span>
      </span>
    </div>

    <!-- Summary KPIs -->
    <div class="financial-section__kpis">
      <div v-if="summaryLoading" class="financial-section__inline-loading">
        <div class="spinner"></div><span>Loading summary…</span>
      </div>
      <div v-else-if="summaryError" class="financial-section__inline-error">
        <span>{{ summaryError }}</span>
        <button type="button" class="btn-retry" @click="loadSummary">Retry</button>
      </div>
      <div v-else class="financial-section__kpi-grid">
        <MetricCard
          label="Net Revenue"
          :value="summary?.revenue?.net_revenue ?? 0"
          variant="revenue"
          :secondary="summary?.revenue?.session_count != null ? `${summary.revenue.session_count} sessions` : ''"
        />
        <MetricCard
          label="Product COGS"
          :value="summary?.cogs?.product_cogs ?? 0"
          variant="expenses"
          secondary="Cost of products sold"
        />
        <MetricCard
          label="Operating Expenses (paid)"
          :value="summary?.expenses?.total_amount ?? 0"
          variant="expenses"
          :secondary="expensesBreakdownLine"
        />
        <MetricCard
          label="Operating Profit"
          :value="summary?.profit?.operating_profit ?? 0"
          :variant="(summary?.profit?.operating_profit ?? 0) >= 0 ? 'profit' : 'profit-negative'"
          :secondary="formatMargin(summary?.profit?.operating_margin)"
          :secondary-tone="marginTone(summary?.profit?.operating_margin)"
        />
        <MetricCard
          label="Net Profit"
          :value="summary?.profit?.net_profit ?? 0"
          :variant="(summary?.profit?.net_profit ?? 0) >= 0 ? 'profit' : 'profit-negative'"
          :secondary="formatMargin(summary?.profit?.net_margin)"
          :secondary-tone="marginTone(summary?.profit?.net_margin)"
        />
      </div>
    </div>

    <!-- Revenue time-series -->
    <section class="financial-section__chart-block">
      <div v-if="revenuesLoading" class="financial-section__inline-loading">
        <div class="spinner"></div><span>Loading revenue chart…</span>
      </div>
      <div v-else-if="revenuesError" class="financial-section__inline-error">
        <span>{{ revenuesError }}</span>
        <button type="button" class="btn-retry" @click="loadRevenues">Retry</button>
      </div>
      <TimeSeriesChart
        v-else
        :title="`Revenue — ${periodLabel}`"
        subtitle="Gross revenue, discount, and net revenue per bucket"
        :labels="revenueLabels"
        :tooltip-labels="revenueRawLabels"
        :datasets="revenueDatasets"
      />
    </section>

    <!-- Profit time-series with mode toggle -->
    <section class="financial-section__chart-block">
      <div v-if="profitsLoading" class="financial-section__inline-loading">
        <div class="spinner"></div><span>Loading profit chart…</span>
      </div>
      <div v-else-if="profitsError" class="financial-section__inline-error">
        <span>{{ profitsError }}</span>
        <button type="button" class="btn-retry" @click="loadProfits">Retry</button>
      </div>
      <TimeSeriesChart
        v-else
        :title="`Profit — ${periodLabel}`"
        :subtitle="profitSubtitle"
        :labels="profitLabels"
        :tooltip-labels="profitRawLabels"
        :datasets="profitDatasets"
      >
        <template #actions>
          <div v-if="canToggleMode" class="financial-section__mode-toggle">
            <button
              v-for="opt in modeOptions"
              :key="opt.id"
              type="button"
              class="mode-toggle__btn"
              :class="{ active: mode === opt.id }"
              @click="setMode(opt.id)"
            >
              {{ opt.name }}
            </button>
          </div>
        </template>
      </TimeSeriesChart>
    </section>

    <!-- Breakdown -->
    <section class="financial-section__breakdown-block">
      <div v-if="breakdownLoading" class="financial-section__inline-loading">
        <div class="spinner"></div><span>Loading breakdown…</span>
      </div>
      <div v-else-if="breakdownError" class="financial-section__inline-error">
        <span>{{ breakdownError }}</span>
        <button type="button" class="btn-retry" @click="loadBreakdown">Retry</button>
      </div>
      <CategoryBreakdown
        v-else
        :revenue-breakdown="breakdown?.revenue_breakdown ?? null"
        :categories="breakdown?.expenses_by_category ?? []"
      />
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { financialAnalyticsApi } from '@/api/financialAnalytics'
import DateRangePicker from '@/components/base/ui/DateRangePicker.vue'
import CustomDropdown from '@/components/base/ui/CustomDropdown.vue'
import MetricCard from '@/components/dashboard/sections/financial/MetricCard.vue'
import TimeSeriesChart from '@/components/dashboard/sections/financial/TimeSeriesChart.vue'
import CategoryBreakdown from '@/components/dashboard/sections/financial/CategoryBreakdown.vue'
import { formatCurrencyEGP } from '@/utils/expenseHelpers'

const periodOptions = [
  { id: 'daily', name: 'Daily' },
  { id: 'weekly', name: 'Weekly' },
  { id: 'monthly', name: 'Monthly' },
  { id: 'yearly', name: 'Yearly' },
]

const modeOptions = [
  { id: 'actual', name: 'Actual' },
  { id: 'smoothed', name: 'Smoothed' },
]

const presets = buildPresets()

// Default filter: current calendar month, daily granularity
const dateRange = ref(rangeFor('this-month'))
const activePreset = ref('this-month')
const period = ref('daily')
const mode = ref('actual')

const summary = ref(null)
const revenues = ref(null)
const profits = ref(null)
const breakdown = ref(null)

const summaryLoading = ref(false)
const revenuesLoading = ref(false)
const profitsLoading = ref(false)
const breakdownLoading = ref(false)

const summaryError = ref('')
const revenuesError = ref('')
const profitsError = ref('')
const breakdownError = ref('')

const anyLoading = computed(
  () => summaryLoading.value || revenuesLoading.value || profitsLoading.value || breakdownLoading.value,
)

const canToggleMode = computed(() => period.value === 'daily' || period.value === 'weekly')

const periodLabel = computed(() => {
  const opt = periodOptions.find((o) => o.id === period.value)
  return opt ? opt.name : 'Daily'
})

const profitSubtitle = computed(() => {
  const base =
    'Operating profit = revenue − product COGS − variable expenses · ' +
    'Net profit = operating profit − fixed expenses'
  if (!canToggleMode.value) return `${base} · Mode: Actual`
  return `${base} · Mode: ${mode.value === 'smoothed' ? 'Smoothed (fixed costs amortized)' : 'Actual'}`
})

const expensesBreakdownLine = computed(() => {
  if (!summary.value?.expenses) return ''
  const f = Number(summary.value.expenses.fixed_amount ?? 0)
  const v = Number(summary.value.expenses.variable_amount ?? 0)
  return `Fixed ${formatCurrencyEGP(f)} · Variable ${formatCurrencyEGP(v)}`
})

const revenueRawLabels = computed(() => (revenues.value?.buckets || []).map((b) => b.label))
const revenueLabels = computed(() => formatBucketLabels(revenueRawLabels.value, period.value))

const revenueDatasets = computed(() => {
  const buckets = revenues.value?.buckets || []
  return [
    { label: 'Gross revenue', data: buckets.map((b) => Number(b.gross_revenue ?? 0)), color: '#a78bfa', fill: true },
    { label: 'Net revenue',   data: buckets.map((b) => Number(b.net_revenue   ?? 0)), color: '#06b6d4' },
    { label: 'Discount',      data: buckets.map((b) => Number(b.discount      ?? 0)), color: '#fbbf24' },
  ]
})

const profitRawLabels = computed(() => (profits.value?.buckets || []).map((b) => b.label))
const profitLabels = computed(() => formatBucketLabels(profitRawLabels.value, period.value))

const profitDatasets = computed(() => {
  const buckets = profits.value?.buckets || []
  return [
    { label: 'Operating profit', data: buckets.map((b) => Number(b.operating_profit ?? 0)), color: '#34d399', fill: true },
    { label: 'Net profit',       data: buckets.map((b) => Number(b.net_profit       ?? 0)), color: '#a78bfa' },
    { label: 'Product COGS',     data: buckets.map((b) => Number(b.product_cogs     ?? 0)), color: '#f97316' },
    { label: 'Fixed expenses',   data: buckets.map((b) => Number(b.fixed_expenses   ?? 0)), color: '#fbbf24' },
  ]
})

const effectiveRange = computed(() => ({
  from: normalizeDate(dateRange.value?.startDate),
  to: normalizeDate(dateRange.value?.endDate),
}))

function paramsForTimeSeries() {
  return {
    period: period.value,
    from: effectiveRange.value.from || undefined,
    to: effectiveRange.value.to || undefined,
  }
}

function paramsForRange() {
  return {
    from: effectiveRange.value.from || undefined,
    to: effectiveRange.value.to || undefined,
  }
}

function normalizeDate(v) {
  if (!v) return ''
  if (v instanceof Date) return toISO(v)
  if (typeof v === 'string') {
    if (/^\d{4}-\d{2}-\d{2}/.test(v)) return v.slice(0, 10)
    const d = new Date(v)
    return Number.isNaN(d.getTime()) ? '' : toISO(d)
  }
  return ''
}

function applyPreset(preset) {
  activePreset.value = preset.id
  dateRange.value = rangeFor(preset.id)
}

// Receives the emitted payload directly from DateRangePicker — independent of
// v-model reactivity. Reassigns the ref and triggers reload explicitly so we
// don't depend on any single reactive path firing correctly.
function onDateRangeChange(payload) {
  const start = normalizeDate(payload?.startDate)
  const end = normalizeDate(payload?.endDate) || start
  if (!start && !end) return

  dateRange.value = {
    startDate: start || end,
    endDate: end || start,
  }
  activePreset.value = null
  loadAll()
}

function buildPresets() {
  return [
    { id: 'today',       label: 'Today' },
    { id: 'this-week',   label: 'This week' },
    { id: 'this-month',  label: 'This month' },
    { id: 'last-month',  label: 'Last month' },
    { id: 'last-30',     label: 'Last 30 days' },
    { id: 'last-90',     label: 'Last 90 days' },
    { id: 'this-year',   label: 'This year' },
    { id: 'all-time',    label: 'All time' },
  ]
}

function rangeFor(id) {
  const today = new Date()
  switch (id) {
    case 'today': {
      return { startDate: toISO(today), endDate: toISO(today) }
    }
    case 'this-week': {
      // Saturday-start week (Egypt) — match the backend.
      const dow = today.getDay() // 0=Sun..6=Sat
      const daysSinceSat = (dow + 1) % 7
      const start = addDays(today, -daysSinceSat)
      return { startDate: toISO(start), endDate: toISO(today) }
    }
    case 'this-month': {
      const start = new Date(today.getFullYear(), today.getMonth(), 1)
      return { startDate: toISO(start), endDate: toISO(today) }
    }
    case 'last-month': {
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      const end = new Date(today.getFullYear(), today.getMonth(), 0)
      return { startDate: toISO(start), endDate: toISO(end) }
    }
    case 'last-30': {
      return { startDate: toISO(addDays(today, -29)), endDate: toISO(today) }
    }
    case 'last-90': {
      return { startDate: toISO(addDays(today, -89)), endDate: toISO(today) }
    }
    case 'this-year': {
      const start = new Date(today.getFullYear(), 0, 1)
      return { startDate: toISO(start), endDate: toISO(today) }
    }
    case 'all-time': {
      return { startDate: '2020-01-01', endDate: toISO(today) }
    }
    default:
      return { startDate: toISO(today), endDate: toISO(today) }
  }
}

function addDays(date, days) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Convert bucket-start labels ('2026-02-18', '2026-02', '2026') into short,
// user-friendly axis labels. Year is shown only when the range spans multiple
// years, or always for yearly. Tooltips still get the full date elsewhere.
function formatBucketLabels(rawLabels, period) {
  if (!Array.isArray(rawLabels) || rawLabels.length === 0) return []
  const years = new Set()
  for (const l of rawLabels) {
    const y = String(l).slice(0, 4)
    if (y) years.add(y)
  }
  const multiYear = years.size > 1
  return rawLabels.map((label) => formatOneBucketLabel(label, period, multiYear))
}

function formatOneBucketLabel(label, period, multiYear) {
  if (!label) return ''
  const s = String(label)
  const parts = s.split('-')
  const year = parts[0] || ''
  const month = parts[1] ? Number(parts[1]) : null
  const day = parts[2] ? Number(parts[2]) : null
  const mShort = month ? MONTHS_SHORT[month - 1] : ''
  const yearShort = year ? `'${year.slice(2)}` : ''

  switch (period) {
    case 'daily':
      // "18 Feb" or "18 Feb '26" when range spans years
      if (!day || !mShort) return s
      return multiYear ? `${day} ${mShort} ${yearShort}` : `${day} ${mShort}`
    case 'weekly':
      // Week label = its Saturday start, same format as daily
      if (!day || !mShort) return s
      return multiYear ? `${day} ${mShort} ${yearShort}` : `${day} ${mShort}`
    case 'monthly':
      // "Feb 2026"
      if (!mShort) return s
      return `${mShort} ${year}`
    case 'yearly':
      return year || s
    default:
      return s
  }
}

async function loadSummary() {
  summaryLoading.value = true
  summaryError.value = ''
  try {
    summary.value = await financialAnalyticsApi.getSummary(paramsForRange())
  } catch (e) {
    summaryError.value = extractError(e, 'Failed to load summary.')
  } finally {
    summaryLoading.value = false
  }
}

async function loadRevenues() {
  revenuesLoading.value = true
  revenuesError.value = ''
  try {
    revenues.value = await financialAnalyticsApi.getRevenues(paramsForTimeSeries())
  } catch (e) {
    revenuesError.value = extractError(e, 'Failed to load revenue chart.')
  } finally {
    revenuesLoading.value = false
  }
}

async function loadProfits() {
  profitsLoading.value = true
  profitsError.value = ''
  try {
    profits.value = await financialAnalyticsApi.getProfits({
      ...paramsForTimeSeries(),
      mode: canToggleMode.value ? mode.value : 'actual',
    })
  } catch (e) {
    profitsError.value = extractError(e, 'Failed to load profit chart.')
  } finally {
    profitsLoading.value = false
  }
}

async function loadBreakdown() {
  breakdownLoading.value = true
  breakdownError.value = ''
  try {
    breakdown.value = await financialAnalyticsApi.getBreakdown(paramsForRange())
  } catch (e) {
    breakdownError.value = extractError(e, 'Failed to load breakdown.')
  } finally {
    breakdownLoading.value = false
  }
}

function loadAll() {
  lastReloadAt.value = new Date().toLocaleTimeString()
  loadSummary()
  loadRevenues()
  loadProfits()
  loadBreakdown()
}

function onFiltersChange() {
  loadAll()
}

function setMode(next) {
  if (mode.value === next) return
  mode.value = next
  loadProfits()
}

function formatMargin(m) {
  if (m === null || m === undefined) return ''
  return `${Number(m).toFixed(2)}% margin`
}

function marginTone(m) {
  if (m === null || m === undefined) return 'muted'
  return Number(m) >= 0 ? 'positive' : 'negative'
}

function extractError(e, fallback) {
  return e?.response?.data?.message || e?.message || fallback
}

function toISO(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// Safety net: any change to dateRange (including deep mutations) or period
// reloads the page. Belt-and-suspenders alongside the explicit @change handler
// and preset buttons — guarantees we never miss a filter change.
const lastReloadAt = ref(null)

watch(
  () => ({
    from: normalizeDate(dateRange.value?.startDate),
    to: normalizeDate(dateRange.value?.endDate),
    period: period.value,
  }),
  (next, prev) => {
    if (!prev) return
    if (next.from === prev.from && next.to === prev.to && next.period === prev.period) return
    loadAll()
  },
  { deep: true },
)

onMounted(() => {
  loadAll()
})
</script>

<style scoped>
.financial-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.financial-section__header-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.financial-section__title {
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, #a78bfa 0%, #22d3ee 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin: 0;
}

.financial-section__subtitle {
  margin: 0;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
  max-width: 880px;
  line-height: 1.5;
}

.financial-section__filters {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 0.875rem;
}

.financial-section__filter-date {
  flex: 1 1 240px;
  min-width: 220px;
}

.financial-section__filter-period {
  flex: 0 1 180px;
  min-width: 140px;
}

.financial-section__refresh {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.55rem 0.9rem;
  background: rgba(139, 92, 246, 0.15);
  border: 1px solid rgba(139, 92, 246, 0.35);
  color: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.financial-section__refresh:hover:not(:disabled) {
  background: rgba(139, 92, 246, 0.25);
  border-color: rgba(139, 92, 246, 0.5);
}

.financial-section__refresh:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.financial-section__presets {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8125rem;
}

.preset-btn {
  padding: 0.35rem 0.75rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.75);
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.preset-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.95);
  border-color: rgba(255, 255, 255, 0.16);
}

.preset-btn.active {
  background: rgba(139, 92, 246, 0.22);
  border-color: rgba(139, 92, 246, 0.55);
  color: #ffffff;
  box-shadow: 0 0 14px rgba(139, 92, 246, 0.28);
}

.financial-section__active-range {
  margin-left: auto;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.55);
  letter-spacing: 0.02em;
}

.financial-section__active-range strong {
  color: rgba(255, 255, 255, 0.85);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  margin: 0 0.15rem;
}

.financial-section__last-update {
  margin-left: 0.4rem;
  color: rgba(52, 211, 153, 0.65);
  font-size: 0.7rem;
  font-variant-numeric: tabular-nums;
}

.financial-section__kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.financial-section__chart-block,
.financial-section__breakdown-block {
  display: flex;
  flex-direction: column;
}

.financial-section__inline-loading,
.financial-section__inline-error {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
}

.financial-section__inline-error {
  color: #fca5a5;
  flex-direction: column;
  gap: 0.5rem;
}

.btn-retry {
  padding: 0.4rem 0.85rem;
  background: rgba(139, 92, 246, 0.15);
  border: 1px solid rgba(139, 92, 246, 0.35);
  color: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.18);
  border-top-color: #a78bfa;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Mode toggle (inline above profit chart) */
.financial-section__mode-toggle {
  display: inline-flex;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 0.2rem;
  gap: 0.2rem;
}

.mode-toggle__btn {
  padding: 0.35rem 0.85rem;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.65);
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.mode-toggle__btn:hover {
  color: rgba(255, 255, 255, 0.9);
}

.mode-toggle__btn.active {
  background: rgba(139, 92, 246, 0.25);
  color: #ffffff;
  box-shadow: 0 0 12px rgba(139, 92, 246, 0.3);
}

@media (max-width: 768px) {
  .financial-section {
    gap: 1rem;
  }
  .financial-section__filters {
    padding: 0.75rem;
  }
  .financial-section__filter-date,
  .financial-section__filter-period {
    flex: 1 1 100%;
    min-width: 0;
  }
  .financial-section__refresh {
    flex: 1 1 100%;
    justify-content: center;
  }
}
</style>
