<template>
  <div class="time-series-chart" :class="{ 'time-series-chart--compact': compact }">
    <div class="time-series-chart__header">
      <div>
        <h3 class="time-series-chart__title">{{ title }}</h3>
        <p v-if="subtitle" class="time-series-chart__subtitle">{{ subtitle }}</p>
      </div>
      <slot name="actions" />
    </div>
    <div
      class="time-series-chart__scroll-area"
      :class="{ 'is-scrollable': isScrollable }"
    >
      <div
        class="time-series-chart__canvas-wrap"
        :class="{ 'is-single-bucket': isSingleBucket }"
        :style="{ minWidth: canvasMinWidth }"
      >
        <!-- One bucket → grouped bar chart (line chart with a single dot looks empty). -->
        <Bar
          v-if="hasData && isSingleBucket"
          :data="barChartData"
          :options="barOptions"
        />
        <!-- 2+ buckets → line chart with scroll/auto-skip behavior. -->
        <Line
          v-else-if="hasData"
          :data="chartData"
          :options="chartOptions"
        />
        <div v-else class="time-series-chart__empty">No data for the selected range.</div>
      </div>
    </div>
    <div v-if="isScrollable && hasData" class="time-series-chart__scroll-hint">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      Swipe horizontally to see all {{ labels.length }} points
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Line, Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Filler,
} from 'chart.js'
import { formatCurrencyEGP } from '@/utils/expenseHelpers'

ChartJS.register(
  Title, Tooltip, Legend,
  LineElement, PointElement, BarElement,
  CategoryScale, LinearScale, Filler,
)

const props = defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  labels: { type: Array, default: () => [] }, // x-axis labels (short, what's displayed)
  tooltipLabels: { type: Array, default: () => [] }, // full date strings for hover (optional)
  datasets: { type: Array, default: () => [] }, // [{ label, data, color, fill? }]
  compact: { type: Boolean, default: false },
  valueFormatter: { type: Function, default: (v) => formatCurrencyEGP(v) },
  // Minimum horizontal space each bucket gets. When labels × minBucketWidth >
  // available width, the chart becomes horizontally scrollable.
  minBucketWidth: { type: Number, default: 48 },
  scrollThreshold: { type: Number, default: 14 }, // start scrolling beyond this many buckets
})

const hasData = computed(
  () => props.labels.length > 0 && props.datasets.some((ds) => Array.isArray(ds.data) && ds.data.length),
)

const isSingleBucket = computed(() => props.labels.length === 1)

const isScrollable = computed(() => props.labels.length > props.scrollThreshold)

const canvasMinWidth = computed(() => {
  if (!isScrollable.value) return '100%'
  return `${props.labels.length * props.minBucketWidth}px`
})

const chartData = computed(() => ({
  labels: props.labels,
  datasets: props.datasets.map((ds) => ({
    label: ds.label,
    data: ds.data,
    borderColor: ds.color,
    backgroundColor: ds.fill ? hexToRgba(ds.color, 0.18) : 'transparent',
    pointBackgroundColor: ds.color,
    pointBorderColor: ds.color,
    pointRadius: 3,
    pointHoverRadius: 6,
    pointHitRadius: 12,
    borderWidth: 2,
    fill: ds.fill ?? false,
    tension: 0.3,
  })),
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  plugins: {
    legend: {
      position: 'top',
      labels: {
        color: 'rgba(255, 255, 255, 0.75)',
        usePointStyle: true,
        boxWidth: 8,
        padding: 16,
        font: { size: 12, weight: '600' },
      },
    },
    tooltip: {
      backgroundColor: 'rgba(15, 15, 23, 0.95)',
      borderColor: 'rgba(139, 92, 246, 0.5)',
      borderWidth: 1,
      titleColor: 'rgba(255, 255, 255, 0.9)',
      bodyColor: 'rgba(255, 255, 255, 0.85)',
      padding: 12,
      cornerRadius: 8,
      callbacks: {
        title: (ctx) => {
          if (!ctx || !ctx.length) return ''
          const i = ctx[0].dataIndex
          // Prefer the full date when caller provided it; fall back to the display label.
          return props.tooltipLabels?.[i] || ctx[0].label || ''
        },
        label: (ctx) => {
          const v = props.valueFormatter ? props.valueFormatter(ctx.parsed.y) : ctx.parsed.y
          return ` ${ctx.dataset.label}: ${v}`
        },
      },
    },
  },
  scales: {
    x: {
      ticks: {
        color: 'rgba(255, 255, 255, 0.55)',
        font: { size: 11 },
        maxRotation: 0,
        autoSkip: !isScrollable.value, // in scroll mode, show every label
        autoSkipPadding: 16,
      },
      grid: { color: 'rgba(255, 255, 255, 0.04)' },
    },
    y: {
      ticks: {
        color: 'rgba(255, 255, 255, 0.55)',
        font: { size: 11 },
        callback: (v) => (props.valueFormatter ? props.valueFormatter(v) : v),
      },
      grid: { color: 'rgba(255, 255, 255, 0.06)' },
    },
  },
}))

// Bar chart variant used when there's only one bucket. Each dataset becomes a
// solid colored bar with a rounded top; legend + tooltip behave the same.
const barChartData = computed(() => ({
  labels: props.labels,
  datasets: props.datasets.map((ds) => ({
    label: ds.label,
    data: ds.data,
    backgroundColor: hexToRgba(ds.color, 0.85),
    borderColor: ds.color,
    borderWidth: 0,
    borderRadius: 8,
    borderSkipped: false,
    maxBarThickness: 64,
    categoryPercentage: 0.8,
    barPercentage: 0.9,
  })),
}))

const barOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  plugins: {
    legend: {
      position: 'top',
      labels: {
        color: 'rgba(255, 255, 255, 0.75)',
        usePointStyle: true,
        boxWidth: 8,
        padding: 16,
        font: { size: 12, weight: '600' },
      },
    },
    tooltip: {
      backgroundColor: 'rgba(15, 15, 23, 0.95)',
      borderColor: 'rgba(139, 92, 246, 0.5)',
      borderWidth: 1,
      titleColor: 'rgba(255, 255, 255, 0.9)',
      bodyColor: 'rgba(255, 255, 255, 0.85)',
      padding: 12,
      cornerRadius: 8,
      callbacks: {
        title: (ctx) => {
          if (!ctx || !ctx.length) return ''
          const i = ctx[0].dataIndex
          return props.tooltipLabels?.[i] || ctx[0].label || ''
        },
        label: (ctx) => {
          const v = props.valueFormatter ? props.valueFormatter(ctx.parsed.y) : ctx.parsed.y
          return ` ${ctx.dataset.label}: ${v}`
        },
      },
    },
  },
  scales: {
    x: {
      ticks: {
        color: 'rgba(255, 255, 255, 0.65)',
        font: { size: 13, weight: '600' },
        maxRotation: 0,
      },
      grid: { display: false },
    },
    y: {
      beginAtZero: true,
      ticks: {
        color: 'rgba(255, 255, 255, 0.55)',
        font: { size: 11 },
        callback: (v) => (props.valueFormatter ? props.valueFormatter(v) : v),
      },
      grid: { color: 'rgba(255, 255, 255, 0.06)' },
    },
  },
}))

function hexToRgba(hex, alpha) {
  if (!hex) return `rgba(139, 92, 246, ${alpha})`
  const clean = hex.replace('#', '')
  const bigint = parseInt(
    clean.length === 3
      ? clean.split('').map((c) => c + c).join('')
      : clean,
    16,
  )
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
</script>

<style scoped>
.time-series-chart {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 1.25rem;
  transition: border-color 0.25s ease, box-shadow 0.25s ease;
}

.time-series-chart:hover {
  border-color: rgba(255, 255, 255, 0.12);
  box-shadow: 0 12px 32px -8px rgba(0, 0, 0, 0.35);
}

.time-series-chart__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.time-series-chart__title {
  font-size: 1rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 0.25rem 0;
  letter-spacing: -0.01em;
}

.time-series-chart__subtitle {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.55);
  margin: 0;
}

.time-series-chart__scroll-area {
  position: relative;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
}

/* Scrollbar styling — visible enough to invite scrolling without being loud. */
.time-series-chart__scroll-area.is-scrollable {
  /* Soft fade hint on the right edge so users see there's more content. */
  background:
    linear-gradient(to right, transparent, transparent 95%, rgba(139, 92, 246, 0.06));
  border-radius: 12px;
}

.time-series-chart__scroll-area::-webkit-scrollbar {
  height: 6px;
}

.time-series-chart__scroll-area::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.04);
  border-radius: 999px;
}

.time-series-chart__scroll-area::-webkit-scrollbar-thumb {
  background: rgba(139, 92, 246, 0.5);
  border-radius: 999px;
}

.time-series-chart__scroll-area::-webkit-scrollbar-thumb:hover {
  background: rgba(139, 92, 246, 0.7);
}

.time-series-chart__canvas-wrap {
  position: relative;
  height: 320px;
  transition: min-width 0.2s ease;
}

.time-series-chart--compact .time-series-chart__canvas-wrap {
  height: 240px;
}

/* Single-bucket bar chart: a touch shorter & tinted with a soft inner glow so a
   day-only view feels like a contained KPI panel rather than a stretched chart. */
.time-series-chart__canvas-wrap.is-single-bucket {
  height: 280px;
  padding: 0.5rem 0.5rem 0;
  background:
    radial-gradient(ellipse at top, rgba(139, 92, 246, 0.08), transparent 60%);
  border-radius: 12px;
}

.time-series-chart__empty {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.45);
  font-size: 0.875rem;
}

.time-series-chart__scroll-hint {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin-top: 0.5rem;
  padding: 0.25rem 0.6rem;
  background: rgba(139, 92, 246, 0.12);
  border: 1px solid rgba(139, 92, 246, 0.25);
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 600;
  color: rgba(167, 139, 250, 0.95);
  letter-spacing: 0.02em;
}

@media (max-width: 768px) {
  .time-series-chart {
    padding: 1rem;
  }
  .time-series-chart__canvas-wrap {
    height: 280px;
  }
  /* On mobile, give each bucket a touch-friendly width when scrolling. */
  .time-series-chart__scroll-area.is-scrollable .time-series-chart__canvas-wrap {
    /* Inline style still wins; this only matters if minBucketWidth was somehow 0. */
    min-width: 100%;
  }
}
</style>
