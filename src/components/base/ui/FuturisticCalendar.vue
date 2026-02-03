<template>
  <div class="futuristic-calendar" :class="{ 'futuristic-calendar--compact': compact }">
    <div class="calendar-header">
      <button @click="previousMonth" class="nav-btn prev" type="button" aria-label="Previous month">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="nav-icon" style="display: block; width: 22px; height: 22px; color: #8b5cf6;">
          <path d="M15 18L9 12L15 6" stroke="#8b5cf6" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" fill="none" style="stroke: #8b5cf6;"/>
        </svg>
      </button>
      <div class="month-year-display">
        <select v-model.number="selectedMonth" @change="updateDate" class="month-select">
          <option v-for="(month, index) in months" :key="index" :value="index">
            {{ month }}
          </option>
        </select>
        <select v-model.number="selectedYear" @change="updateDate" class="year-select">
          <option v-for="year in availableYears" :key="year" :value="year">
            {{ year }}
          </option>
        </select>
      </div>
      <button @click="nextMonth" class="nav-btn next" type="button" aria-label="Next month">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="nav-icon" style="display: block; width: 22px; height: 22px; color: #8b5cf6;">
          <path d="M9 18L15 12L9 6" stroke="#8b5cf6" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" fill="none" style="stroke: #8b5cf6;"/>
        </svg>
      </button>
    </div>

    <div class="calendar-weekdays">
      <div v-for="day in weekDays" :key="day" class="weekday">{{ day }}</div>
    </div>

    <div class="calendar-days">
      <button
        v-for="(day, index) in calendarDays"
        :key="`day-${index}-${day.date.getTime()}`"
        @click="selectDate(day.date)"
        :class="[
          'calendar-day',
          {
            'other-month': day.otherMonth,
            'today': day.isToday,
            'selected': day.isSelected,
            'in-range': day.inRange,
            'range-start': day.isRangeStart,
            'range-end': day.isRangeEnd
          }
        ]"
        :disabled="day.disabled"
        type="button"
      >
        <span class="day-number">{{ day.number }}</span>
        <div class="day-glow"></div>
      </button>
    </div>

    <div class="calendar-footer">
      <button @click="selectToday" class="today-btn" type="button">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        Today
      </button>
      <button @click="clearSelection" class="clear-btn" type="button" v-if="selectedDate || rangeStart">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <path d="M15 9L9 15M9 9L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        Clear
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  compact: {
    type: Boolean,
    default: false
  },
  modelValue: {
    type: String,
    default: null
  },
  rangeStart: {
    type: String,
    default: null
  },
  rangeEnd: {
    type: String,
    default: null
  },
  minDate: {
    type: String,
    default: null
  },
  maxDate: {
    type: String,
    default: null
  },
  mode: {
    type: String,
    default: 'single' // 'single' or 'range'
  }
})

const emit = defineEmits(['update:modelValue', 'select', 'range-start', 'range-end'])

const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const currentDate = ref(new Date())
const selectedDate = ref(props.modelValue ? new Date(props.modelValue) : null)
const selectedMonth = ref(new Date().getMonth())
const selectedYear = ref(new Date().getFullYear())

// Watch for changes to ensure month/year stay in sync
watch([selectedMonth, selectedYear], () => {
  // Ensure values are numbers
  if (typeof selectedMonth.value !== 'number') {
    selectedMonth.value = Number(selectedMonth.value)
  }
  if (typeof selectedYear.value !== 'number') {
    selectedYear.value = Number(selectedYear.value)
  }
}, { immediate: true })

const availableYears = computed(() => {
  const years = []
  const currentYear = new Date().getFullYear()
  for (let i = currentYear - 100; i <= currentYear + 10; i++) {
    years.push(i)
  }
  return years
})

const calendarDays = computed(() => {
  const year = selectedYear.value
  const month = selectedMonth.value
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()

  const days = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Previous month days
  const prevMonth = new Date(year, month, 0)
  const daysInPrevMonth = prevMonth.getDate()
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, daysInPrevMonth - i)
    days.push(createDayObject(date, true))
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    days.push(createDayObject(date, false))
  }

  // Next month days - ensure we always have exactly 42 days (6 weeks)
  const remainingDays = 42 - days.length // 6 weeks * 7 days = 42
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(year, month + 1, day)
    days.push(createDayObject(date, true))
  }

  // Ensure we have exactly 42 days
  if (days.length !== 42) {
    console.warn(`Calendar days count mismatch: expected 42, got ${days.length}`)
  }

  return days
})

const createDayObject = (date, otherMonth) => {
  const dateStr = formatDateString(date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dateCopy = new Date(date)
  dateCopy.setHours(0, 0, 0, 0)

  let isSelected = false
  let inRange = false
  let isRangeStart = false
  let isRangeEnd = false

  if (props.mode === 'single') {
    isSelected = selectedDate.value && formatDateString(selectedDate.value) === dateStr
  } else if (props.mode === 'range') {
    const startStr = props.rangeStart
    const endStr = props.rangeEnd
    isRangeStart = startStr === dateStr
    isRangeEnd = endStr === dateStr
    if (startStr && endStr) {
      const start = new Date(startStr)
      const end = new Date(endStr)
      inRange = dateCopy >= start && dateCopy <= end
    } else if (startStr) {
      isRangeStart = startStr === dateStr
    }
  }

  const isToday = dateCopy.getTime() === today.getTime()
  const disabled = isDateDisabled(date)

  return {
    date: dateCopy,
    number: date.getDate(),
    otherMonth,
    isToday,
    isSelected,
    inRange,
    isRangeStart,
    isRangeEnd,
    disabled
  }
}

const isDateDisabled = (date) => {
  if (props.minDate) {
    const min = new Date(props.minDate)
    min.setHours(0, 0, 0, 0)
    if (date < min) return true
  }
  if (props.maxDate) {
    const max = new Date(props.maxDate)
    max.setHours(23, 59, 59, 999)
    if (date > max) return true
  }
  return false
}

const formatDateString = (date) => {
  if (!date) return null
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const selectDate = (date) => {
  if (isDateDisabled(date)) return

  const dateStr = formatDateString(date)
  
  if (props.mode === 'single') {
    selectedDate.value = date
    emit('update:modelValue', dateStr)
    emit('select', dateStr)
  } else {
    // Range mode - handle start/end selection
    if (!props.rangeStart || (props.rangeStart && props.rangeEnd)) {
      // Start new range
      emit('range-start', dateStr)
    } else if (props.rangeStart && !props.rangeEnd) {
      // Complete range
      const start = new Date(props.rangeStart)
      if (date >= start) {
        emit('range-end', dateStr)
      } else {
        // If selected date is before start, make it the new start
        emit('range-start', dateStr)
        emit('range-end', null)
      }
    }
  }
}

const selectToday = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (!isDateDisabled(today)) {
    selectDate(today)
  }
}

const clearSelection = () => {
  selectedDate.value = null
  emit('update:modelValue', null)
  emit('select', null)
  emit('range-start', null)
  emit('range-end', null)
}

const previousMonth = () => {
  if (selectedMonth.value === 0) {
    selectedMonth.value = 11
    selectedYear.value--
  } else {
    selectedMonth.value--
  }
  updateDate()
}

const nextMonth = () => {
  if (selectedMonth.value === 11) {
    selectedMonth.value = 0
    selectedYear.value++
  } else {
    selectedMonth.value++
  }
  updateDate()
}

const updateDate = () => {
  currentDate.value = new Date(selectedYear.value, selectedMonth.value, 1)
}

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    const date = new Date(newValue)
    selectedDate.value = date
    selectedMonth.value = date.getMonth()
    selectedYear.value = date.getFullYear()
  }
}, { immediate: true })

// Watch rangeStart to sync month/year when range changes
watch(() => props.rangeStart, (newValue) => {
  if (newValue && props.mode === 'range') {
    const date = new Date(newValue)
    selectedMonth.value = date.getMonth()
    selectedYear.value = date.getFullYear()
  }
}, { immediate: true })
</script>

<style scoped>
.futuristic-calendar {
  --calendar-padding: 20px;
  --calendar-gap: 12px;
  --calendar-day-size: 36px;
  --calendar-nav-size: 40px;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%);
  border: 2px solid rgba(139, 92, 246, 0.4);
  border-radius: 16px;
  padding: var(--calendar-padding);
  box-shadow: 
    0 25px 70px rgba(0, 0, 0, 0.6),
    0 0 50px rgba(139, 92, 246, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.15),
    inset 0 -1px 0 rgba(139, 92, 246, 0.1);
  backdrop-filter: blur(20px);
  position: relative;
  overflow: visible;
  width: 100%;
  min-width: 0;
  max-width: 100%;
  min-height: fit-content;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  animation: calendarPulse 4s ease-in-out infinite;
}

@keyframes calendarPulse {
  0%, 100% {
    box-shadow: 
      0 25px 70px rgba(0, 0, 0, 0.6),
      0 0 50px rgba(139, 92, 246, 0.25),
      inset 0 1px 0 rgba(255, 255, 255, 0.15),
      inset 0 -1px 0 rgba(139, 92, 246, 0.1);
  }
  50% {
    box-shadow: 
      0 25px 70px rgba(0, 0, 0, 0.6),
      0 0 60px rgba(139, 92, 246, 0.35),
      inset 0 1px 0 rgba(255, 255, 255, 0.15),
      inset 0 -1px 0 rgba(139, 92, 246, 0.15);
  }
}

.futuristic-calendar::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(139, 92, 246, 0.3) 20%,
    rgba(168, 85, 247, 0.6) 50%,
    rgba(139, 92, 246, 0.3) 80%,
    transparent 100%);
  animation: scanLine 3s ease-in-out infinite;
  border-radius: 16px 16px 0 0;
  box-shadow: 0 2px 10px rgba(139, 92, 246, 0.4);
}

.futuristic-calendar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 16px;
  padding: 2px;
  background: linear-gradient(135deg, 
    rgba(139, 92, 246, 0.2) 0%,
    rgba(168, 85, 247, 0.1) 50%,
    rgba(139, 92, 246, 0.2) 100%);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
  opacity: 0.6;
}

@keyframes scanLine {
  0%, 100% {
    opacity: 0.4;
    transform: translateX(-100%);
  }
  50% {
    opacity: 1;
    transform: translateX(0%);
  }
}

/* Header */
.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px; /* Add gap between elements */
  margin-bottom: 16px;
  padding: 0 4px 14px 4px; /* Add horizontal padding */
  border-bottom: 1px solid rgba(139, 92, 246, 0.25);
  position: relative;
  width: 100%;
  box-sizing: border-box;
  /* Prevent overlap */
  min-width: 0;
}

.calendar-header::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, 
    transparent 0%,
    rgba(139, 92, 246, 0.5) 50%,
    transparent 100%);
}

.nav-btn {
  width: 40px;
  height: 40px;
  min-width: 40px; /* Prevent shrinking */
  max-width: 40px; /* Prevent growing */
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(168, 85, 247, 0.15) 100%);
  border: 2px solid rgba(139, 92, 246, 0.5);
  border-radius: 10px;
  color: #8b5cf6;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0; /* Never shrink */
  flex-grow: 0; /* Never grow */
  position: relative;
  overflow: visible;
  box-shadow: 
    0 2px 8px rgba(139, 92, 246, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  /* Ensure both buttons are identical */
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* Ensure prev and next buttons have identical styling */
.nav-btn.prev,
.nav-btn.next {
  width: 40px !important;
  height: 40px !important;
  min-width: 40px !important;
  max-width: 40px !important;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(168, 85, 247, 0.15) 100%);
  border: 2px solid rgba(139, 92, 246, 0.5);
  border-radius: 10px;
  color: #8b5cf6;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0 !important;
  flex-grow: 0 !important;
  position: relative;
  overflow: visible;
  box-shadow: 
    0 2px 8px rgba(139, 92, 246, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.nav-btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%);
  transform: translate(-50%, -50%);
  transition: width 0.4s ease, height 0.4s ease;
  z-index: 0; /* Ensure it's behind the icon */
}

.nav-btn:hover,
.nav-btn.prev:hover,
.nav-btn.next:hover {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(168, 85, 247, 0.2) 100%);
  border-color: rgba(139, 92, 246, 0.6);
  transform: scale(1.08);
  box-shadow: 
    0 4px 12px rgba(139, 92, 246, 0.4),
    0 0 20px rgba(139, 92, 246, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.nav-btn:hover svg,
.nav-btn.prev:hover svg,
.nav-btn.next:hover svg,
.nav-btn:hover .nav-icon,
.nav-btn.prev:hover .nav-icon,
.nav-btn.next:hover .nav-icon {
  opacity: 1 !important;
  visibility: visible !important;
  color: #8b5cf6 !important;
  stroke: #8b5cf6 !important;
}

.nav-btn:hover::before,
.nav-btn.prev:hover::before,
.nav-btn.next:hover::before {
  width: 100px;
  height: 100px;
}

.nav-btn:active,
.nav-btn.prev:active,
.nav-btn.next:active {
  transform: scale(0.95);
}

.nav-btn svg,
.nav-btn .nav-icon,
.nav-btn.prev svg,
.nav-btn.next svg,
.nav-btn.prev .nav-icon,
.nav-btn.next .nav-icon {
  width: 22px !important;
  height: 22px !important;
  position: relative !important;
  z-index: 100 !important;
  color: #8b5cf6 !important;
  stroke: #8b5cf6 !important;
  fill: none !important;
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
  pointer-events: none;
}

.nav-btn svg path,
.nav-btn .nav-icon path,
.nav-btn.prev svg path,
.nav-btn.next svg path {
  stroke: #8b5cf6 !important;
  stroke-width: 3.5 !important;
  stroke-linecap: round !important;
  stroke-linejoin: round !important;
  fill: none !important;
  opacity: 1 !important;
  visibility: visible !important;
}

.month-year-display {
  display: flex;
  gap: 10px;
  align-items: center;
  flex: 1 1 auto; /* Allow flex to grow and shrink */
  justify-content: center;
  min-width: 0; /* Allow shrinking */
  flex-wrap: nowrap;
  padding: 0;
  /* Prevent overflow */
  max-width: 100%;
  overflow: hidden;
}

.month-select,
.year-select {
  /* Premium gradient background: dark navy → charcoal */
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%);
  /* Custom arrow icon - closed state: low contrast, soft gray with slight transparency */
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 14 14'%3E%3Cpath fill='%23a0a0af' fill-opacity='0.5' d='M7 10L2 5h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 14px 14px;
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 14px;
  padding: 10px 38px 10px 14px;
  color: rgba(255, 255, 255, 0.95);
  font-size: 14px;
  font-weight: 500;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;
  /* Width settings - responsive and prevent overlap */
  min-width: 100px;
  width: 100%;
  max-width: 140px;
  flex: 1 1 auto;
  /* Ensure select displays value properly */
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  /* Show full text */
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  /* Soft inner shadow + light outer glow for depth */
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(139, 92, 246, 0.1),
    inset 0 1px 1px rgba(255, 255, 255, 0.05),
    inset 0 -1px 1px rgba(0, 0, 0, 0.2);
  text-align: left;
  line-height: 1.4;
  text-indent: 0;
  letter-spacing: 0.01em;
  box-sizing: border-box;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
}

/* Glassmorphism overlay effect */
.month-select::before,
.year-select::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.03) 0%, rgba(168, 85, 247, 0.03) 100%);
  opacity: 0;
  transition: opacity 0.25s ease;
  pointer-events: none;
  z-index: 0;
  border-radius: 14px;
}

/* Month selector can be slightly wider */
.month-select {
  max-width: 160px;
  min-width: 110px;
}

/* Year selector can be narrower */
.year-select {
  max-width: 100px;
  min-width: 80px;
}

.month-select:hover,
.year-select:hover {
  border-color: rgba(139, 92, 246, 0.4);
  /* Enhanced shadow expansion on hover */
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(139, 92, 246, 0.25),
    0 0 20px rgba(139, 92, 246, 0.15),
    inset 0 1px 1px rgba(255, 255, 255, 0.08),
    inset 0 -1px 1px rgba(0, 0, 0, 0.25);
  background: linear-gradient(135deg, rgba(15, 23, 42, 1) 0%, rgba(30, 41, 59, 1) 100%);
  /* Hover: Arrow becomes brighter, scales up slightly, subtle glow */
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 14 14'%3E%3Cdefs%3E%3Cfilter id='glow'%3E%3CfeGaussianBlur stdDeviation='1.5' result='coloredBlur'/%3E%3CfeMerge%3E%3CfeMergeNode in='coloredBlur'/%3E%3CfeMergeNode in='SourceGraphic'/%3E%3C/feMerge%3E%3C/filter%3E%3C/defs%3E%3Cpath fill='%23a855f7' fill-opacity='0.9' filter='url(%23glow)' d='M7 10L2 5h10z'/%3E%3C/svg%3E");
  background-size: 14.7px 14.7px; /* Slight scale up (1.05x) */
  transform: translateY(-1px);
  color: rgba(255, 255, 255, 1);
}

.month-select:hover::before,
.year-select:hover::before {
  opacity: 1;
}

.month-select:focus,
.year-select:focus {
  border-color: rgba(139, 92, 246, 0.5);
  /* Stronger shadow elevation when open/focused */
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(139, 92, 246, 0.4),
    0 0 30px rgba(139, 92, 246, 0.25),
    inset 0 1px 1px rgba(255, 255, 255, 0.1),
    inset 0 -1px 1px rgba(0, 0, 0, 0.3);
  background: linear-gradient(135deg, rgba(15, 23, 42, 1) 0%, rgba(30, 41, 59, 1) 100%);
  /* Open: Arrow rotates 180° upward (simulated with upward-pointing arrow), primary accent color with glow */
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 14 14'%3E%3Cdefs%3E%3Cfilter id='glow-open'%3E%3CfeGaussianBlur stdDeviation='2' result='coloredBlur'/%3E%3CfeMerge%3E%3CfeMergeNode in='coloredBlur'/%3E%3CfeMergeNode in='SourceGraphic'/%3E%3C/feMerge%3E%3C/filter%3E%3C/defs%3E%3Cpath fill='%238b5cf6' filter='url(%23glow-open)' d='M7 4L12 9H2z'/%3E%3C/svg%3E");
  background-size: 14.7px 14.7px; /* Slight scale up (1.05x) */
  color: rgba(255, 255, 255, 1);
  outline: none;
  transform: translateY(-1px);
}

.month-select:focus::before,
.year-select:focus::before {
  opacity: 1;
}

/* Active/Click state - shadow expansion */
.month-select:active,
.year-select:active {
  transform: translateY(0);
  box-shadow: 
    0 2px 12px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(139, 92, 246, 0.3),
    0 0 30px rgba(139, 92, 246, 0.2),
    inset 0 1px 1px rgba(255, 255, 255, 0.1),
    inset 0 -1px 1px rgba(0, 0, 0, 0.3);
  /* Arrow maintains state during click */
  background-size: 14px 14px;
}

/* Style for select options */
.month-select option,
.year-select option {
  background: rgba(15, 23, 42, 0.98);
  color: #e2e8f0;
  padding: 8px 12px;
  font-size: 14px;
  font-weight: 600;
}

.month-select option:hover,
.year-select option:hover {
  background: rgba(139, 92, 246, 0.2);
}

.month-select option:checked,
.year-select option:checked {
  background: rgba(139, 92, 246, 0.3);
  color: #f1f5f9;
}

/* Weekdays */
.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 2px;
  margin-bottom: 6px;
  width: 100%;
  box-sizing: border-box;
}

.weekday {
  text-align: center;
  font-size: 11px;
  font-weight: 700;
  color: rgba(139, 92, 246, 0.8);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 6px 2px;
  min-width: 0;
  overflow: visible;
  white-space: nowrap;
  text-shadow: 0 0 8px rgba(139, 92, 246, 0.3);
  position: relative;
}

.weekday::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.6), transparent);
  transition: width 0.3s ease;
}

.weekday:hover::after {
  width: 60%;
}

/* Calendar Days */
.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr)); /* Use minmax to prevent overflow */
  gap: 4px; /* Increased gap to prevent overlap */
  width: 100%;
  /* Ensure all 6 rows are visible - 6 rows × 36px + 5 gaps × 4px = 236px */
  min-height: 236px;
  /* Prevent any clipping */
  overflow: visible;
  /* Ensure grid creates all necessary rows */
  grid-auto-flow: row;
  /* Row height will be set via inline style, but provide fallback */
  grid-auto-rows: 36px;
  /* Ensure grid fits within container */
  box-sizing: border-box;
  /* Prevent row overlap */
  align-content: start;
}

.calendar-day {
  position: relative;
  height: 36px;
  min-height: 36px; /* Ensure minimum height */
  max-height: 36px; /* Prevent expansion */
  min-width: 0; /* Allow grid item to shrink below content size */
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
  border: 1.5px solid rgba(139, 92, 246, 0.15);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: visible;
  flex-shrink: 0;
  box-sizing: border-box;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
  /* Prevent overlap */
  margin: 0;
  padding: 0;
}

.calendar-day:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(168, 85, 247, 0.15) 100%);
  border-color: rgba(139, 92, 246, 0.5);
  transform: scale(1.05) translateY(-1px);
  box-shadow: 
    0 4px 12px rgba(139, 92, 246, 0.4),
    0 0 20px rgba(139, 92, 246, 0.2),
    inset 0 1px 2px rgba(255, 255, 255, 0.1);
  z-index: 1;
}

.calendar-day.other-month {
  color: rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.01);
}

.calendar-day.today {
  border-color: rgba(139, 92, 246, 0.6);
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(168, 85, 247, 0.15) 100%);
  box-shadow: 
    0 0 15px rgba(139, 92, 246, 0.4),
    0 2px 8px rgba(139, 92, 246, 0.3),
    inset 0 1px 2px rgba(255, 255, 255, 0.1);
  animation: todayPulse 2s ease-in-out infinite;
}

@keyframes todayPulse {
  0%, 100% {
    box-shadow: 
      0 0 15px rgba(139, 92, 246, 0.4),
      0 2px 8px rgba(139, 92, 246, 0.3),
      inset 0 1px 2px rgba(255, 255, 255, 0.1);
  }
  50% {
    box-shadow: 
      0 0 20px rgba(139, 92, 246, 0.6),
      0 2px 10px rgba(139, 92, 246, 0.4),
      inset 0 1px 2px rgba(255, 255, 255, 0.15);
  }
}

.calendar-day.today .day-number {
  color: var(--primary-purple);
  font-weight: 700;
  text-shadow: 0 0 10px rgba(139, 92, 246, 0.9), 0 0 20px rgba(139, 92, 246, 0.5);
}

.calendar-day.selected {
  background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #9333ea 100%);
  border-color: rgba(168, 85, 247, 1);
  color: white;
  box-shadow: 
    0 0 20px rgba(139, 92, 246, 0.7),
    0 4px 15px rgba(139, 92, 246, 0.5),
    inset 0 1px 2px rgba(255, 255, 255, 0.3),
    inset 0 -1px 2px rgba(0, 0, 0, 0.2);
  transform: scale(1.08);
  z-index: 2;
  animation: selectedGlow 2s ease-in-out infinite;
}

@keyframes selectedGlow {
  0%, 100% {
    box-shadow: 
      0 0 20px rgba(139, 92, 246, 0.7),
      0 4px 15px rgba(139, 92, 246, 0.5),
      inset 0 1px 2px rgba(255, 255, 255, 0.3),
      inset 0 -1px 2px rgba(0, 0, 0, 0.2);
  }
  50% {
    box-shadow: 
      0 0 25px rgba(139, 92, 246, 0.9),
      0 4px 20px rgba(139, 92, 246, 0.6),
      inset 0 1px 2px rgba(255, 255, 255, 0.4),
      inset 0 -1px 2px rgba(0, 0, 0, 0.2);
  }
}

.calendar-day.selected .day-number {
  color: white;
  font-weight: 700;
  text-shadow: 
    0 0 12px rgba(255, 255, 255, 0.9),
    0 0 24px rgba(255, 255, 255, 0.5);
}

.calendar-day.in-range {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(168, 85, 247, 0.2) 100%);
  border-color: rgba(139, 92, 246, 0.4);
  box-shadow: inset 0 1px 2px rgba(139, 92, 246, 0.2);
}

.calendar-day.range-start,
.calendar-day.range-end {
  background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #9333ea 100%);
  border-color: rgba(168, 85, 247, 1);
  color: white;
  box-shadow: 
    0 0 20px rgba(139, 92, 246, 0.7),
    0 4px 15px rgba(139, 92, 246, 0.5),
    inset 0 1px 2px rgba(255, 255, 255, 0.3),
    inset 0 -1px 2px rgba(0, 0, 0, 0.2);
  z-index: 2;
  transform: scale(1.06);
}

.calendar-day.range-start .day-number,
.calendar-day.range-end .day-number {
  color: white;
  font-weight: 700;
}

.calendar-day:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  background: rgba(255, 255, 255, 0.01);
}

.day-number {
  position: relative;
  z-index: 1;
  transition: all 0.3s ease;
  /* Ensure text is fully visible */
  white-space: nowrap;
  overflow: visible;
  text-overflow: clip;
  /* Ensure number is centered and visible */
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  line-height: 1;
}

.day-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 0;
  height: 0;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.5) 0%, rgba(168, 85, 247, 0.3) 50%, transparent 80%);
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1), height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
  filter: blur(4px);
}

.calendar-day:hover:not(:disabled) .day-glow {
  width: 50px;
  height: 50px;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.6) 0%, rgba(168, 85, 247, 0.4) 50%, transparent 80%);
}

.calendar-day.selected .day-glow,
.calendar-day.range-start .day-glow,
.calendar-day.range-end .day-glow {
  width: 45px;
  height: 45px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.2) 50%, transparent 80%);
  filter: blur(3px);
  animation: glowPulse 2s ease-in-out infinite;
}

@keyframes glowPulse {
  0%, 100% {
    opacity: 0.8;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.1);
  }
}

/* Footer */
.calendar-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(139, 92, 246, 0.25);
  flex-shrink: 0;
  position: relative;
}

.calendar-footer::before {
  content: '';
  position: absolute;
  top: -1px;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, 
    transparent 0%,
    rgba(139, 92, 246, 0.5) 50%,
    transparent 100%);
}

.today-btn,
.clear-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(168, 85, 247, 0.1) 100%);
  border: 1.5px solid rgba(139, 92, 246, 0.4);
  border-radius: 8px;
  color: var(--primary-purple);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
}

.today-btn::before,
.clear-btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%);
  transform: translate(-50%, -50%);
  transition: width 0.4s ease, height 0.4s ease;
}

.today-btn:hover,
.clear-btn:hover {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(168, 85, 247, 0.2) 100%);
  border-color: rgba(139, 92, 246, 0.6);
  transform: translateY(-2px);
  box-shadow: 
    0 6px 16px rgba(139, 92, 246, 0.4),
    0 0 25px rgba(139, 92, 246, 0.2),
    inset 0 1px 2px rgba(255, 255, 255, 0.1);
}

.today-btn:hover::before,
.clear-btn:hover::before {
  width: 150px;
  height: 150px;
}

.today-btn:active,
.clear-btn:active {
  transform: translateY(0);
}

.today-btn svg,
.clear-btn svg {
  width: 14px;
  height: 14px;
}

.clear-btn {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.1) 100%);
  border-color: rgba(239, 68, 68, 0.4);
  color: #ef4444;
}

.clear-btn:hover {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.25) 0%, rgba(220, 38, 38, 0.2) 100%);
  border-color: rgba(239, 68, 68, 0.6);
  box-shadow: 
    0 6px 16px rgba(239, 68, 68, 0.4),
    0 0 25px rgba(239, 68, 68, 0.2),
    inset 0 1px 2px rgba(255, 255, 255, 0.1);
}

/* Compact (mobile) variant – reusable when embedded in bottom-sheet or narrow containers */
.futuristic-calendar--compact {
  --calendar-padding: 16px;
  --calendar-gap: 10px;
  --calendar-day-size: 38px;
  --calendar-nav-size: 44px;
  padding: var(--calendar-padding);
  border-width: 1px;
}

.futuristic-calendar--compact .calendar-header {
  gap: 8px;
  margin-bottom: 12px;
  padding-bottom: 12px;
}

.futuristic-calendar--compact .nav-btn,
.futuristic-calendar--compact .nav-btn.prev,
.futuristic-calendar--compact .nav-btn.next {
  width: var(--calendar-nav-size) !important;
  height: var(--calendar-nav-size) !important;
  min-width: var(--calendar-nav-size) !important;
  max-width: var(--calendar-nav-size) !important;
}

.futuristic-calendar--compact .month-select,
.futuristic-calendar--compact .year-select {
  min-width: 90px;
  max-width: 130px;
  padding: 12px 36px 12px 14px;
  font-size: 14px;
}

.futuristic-calendar--compact .year-select {
  min-width: 72px;
  max-width: 88px;
}

.futuristic-calendar--compact .calendar-weekdays {
  margin-bottom: 4px;
}

.futuristic-calendar--compact .weekday {
  font-size: 11px;
  padding: 8px 2px;
}

.futuristic-calendar--compact .calendar-days {
  gap: 4px;
  min-height: auto;
  grid-auto-rows: var(--calendar-day-size);
}

.futuristic-calendar--compact .calendar-day {
  height: var(--calendar-day-size);
  min-height: var(--calendar-day-size);
  max-height: var(--calendar-day-size);
  font-size: 14px;
}

.futuristic-calendar--compact .calendar-footer {
  margin-top: 12px;
  padding-top: 12px;
}

.futuristic-calendar--compact .today-btn,
.futuristic-calendar--compact .clear-btn {
  padding: 12px 16px;
  font-size: 14px;
  min-height: 44px;
}
</style>
