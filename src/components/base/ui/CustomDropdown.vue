<template>
  <div class="custom-dropdown-wrapper" :class="{ 'has-selection': hasSelection }">
    <div 
      class="custom-dropdown-futuristic"
      :class="{ 'open': isOpen, 'has-selection': hasSelection, 'disabled': disabled }"
      @click="toggleDropdown"
    >
      <span class="dropdown-selected-text">
        {{ displayText || placeholder }}
      </span>
      <svg class="dropdown-arrow" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 11L3 6h10z" fill="currentColor"/>
      </svg>
    </div>
    <div 
      v-if="isOpen"
      class="custom-dropdown-menu"
      @click.stop
      ref="dropdownMenu"
    >
      <div 
        v-if="showPlaceholderInMenu && placeholder"
        class="dropdown-item"
        :class="{ 'selected': !modelValue }"
        @click="selectOption(null)"
      >
        <span>{{ placeholder }}</span>
      </div>
      <div 
        v-for="option in options"
        :key="getOptionValue(option)"
        class="dropdown-item"
        :class="{ 
          'selected': isOptionSelected(option),
          'disabled': isOptionDisabled(option)
        }"
        @click="!isOptionDisabled(option) && selectOption(option)"
      >
        <slot name="option" :option="option" :selected="isOptionSelected(option)">
          <div class="option-content">
            <span class="option-name">{{ getOptionLabel(option) }}</span>
            <span v-if="getOptionSuffix(option)" class="option-suffix">
              {{ getOptionSuffix(option) }}
            </span>
          </div>
        </slot>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

export default {
  name: 'CustomDropdown',
  props: {
    modelValue: {
      type: [String, Number, Boolean, Object, null],
      default: null
    },
    options: {
      type: Array,
      required: true,
      default: () => []
    },
    // Function to extract value from option object, or property name
    optionValue: {
      type: [String, Function],
      default: 'id'
    },
    // Function to extract label from option object, or property name
    optionLabel: {
      type: [String, Function],
      default: 'name'
    },
    // Function to extract suffix (like price) from option object, or property name
    optionSuffix: {
      type: [String, Function],
      default: null
    },
    // Function to format the display text when an option is selected
    formatDisplayText: {
      type: Function,
      default: null
    },
    placeholder: {
      type: String,
      default: 'Choose an option...'
    },
    showPlaceholderInMenu: {
      type: Boolean,
      default: true
    },
    disabled: {
      type: Boolean,
      default: false
    },
    searchable: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'change', 'open', 'close'],
  setup(props, { emit }) {
    const isOpen = ref(false)
    const dropdownMenu = ref(null)
    
    // Check if an option is selected
    const isOptionSelected = (option) => {
      // Handle empty string as a valid value (for duration "No limit")
      if (props.modelValue === null || props.modelValue === undefined) {
        return false
      }
      // If modelValue is empty string, check if this is the placeholder option
      if (props.modelValue === '' && option === null) {
        return true
      }
      const optionValue = getOptionValue(option)
      return optionValue === props.modelValue || String(optionValue) === String(props.modelValue)
    }
    
    // Check if has a selection (empty string is considered a selection for duration)
    const hasSelection = computed(() => {
      return props.modelValue !== null && props.modelValue !== undefined
    })
    
    // Get selected option
    const selectedOption = computed(() => {
      // Handle empty string case (for duration "No limit")
      if (props.modelValue === '') {
        return null // Placeholder is selected
      }
      if (!hasSelection.value) return null
      return props.options.find(opt => {
        const optValue = getOptionValue(opt)
        return optValue === props.modelValue || String(optValue) === String(props.modelValue)
      })
    })
    
    // Display text for selected option
    const displayText = computed(() => {
      // Handle empty string case (for duration "No limit")
      if (props.modelValue === '') {
        return props.placeholder || ''
      }
      
      if (!hasSelection.value) return null
      
      if (props.formatDisplayText && typeof props.formatDisplayText === 'function') {
        return props.formatDisplayText(selectedOption.value)
      }
      
      if (!selectedOption.value) return null
      
      const label = getOptionLabel(selectedOption.value)
      const suffix = getOptionSuffix(selectedOption.value)
      
      if (suffix) {
        return `${label} - ${suffix}`
      }
      
      return label
    })
    
    // Get option value
    const getOptionValue = (option) => {
      if (typeof option === 'string' || typeof option === 'number' || typeof option === 'boolean') {
        return option
      }
      
      if (typeof props.optionValue === 'function') {
        return props.optionValue(option)
      }
      
      return option[props.optionValue] ?? option.value ?? option.id
    }
    
    // Get option label
    const getOptionLabel = (option) => {
      if (typeof option === 'string' || typeof option === 'number' || typeof option === 'boolean') {
        return String(option)
      }
      
      if (typeof props.optionLabel === 'function') {
        return props.optionLabel(option)
      }
      
      return option[props.optionLabel] ?? option.label ?? option.name ?? String(option.value ?? option.id)
    }
    
    // Get option suffix (like price)
    const getOptionSuffix = (option) => {
      if (!props.optionSuffix) return null
      if (typeof option === 'string' || typeof option === 'number' || typeof option === 'boolean') {
        return null
      }
      
      if (typeof props.optionSuffix === 'function') {
        return props.optionSuffix(option)
      }
      
      return option[props.optionSuffix] ?? null
    }
    
    // Check if option is disabled
    const isOptionDisabled = (option) => {
      if (typeof option === 'string' || typeof option === 'number' || typeof option === 'boolean') {
        return false
      }
      
      return option.disabled ?? false
    }
    
    // Toggle dropdown
    const toggleDropdown = () => {
      if (props.disabled) return
      isOpen.value = !isOpen.value
      
      if (isOpen.value) {
        emit('open')
      } else {
        emit('close')
      }
    }
    
    // Select an option
    const selectOption = (option) => {
      if (option === null) {
        // For placeholder selection, emit empty string (for duration "No limit" case)
        emit('update:modelValue', '')
        emit('change', '')
      } else {
        const value = getOptionValue(option)
        emit('update:modelValue', value)
        emit('change', value, option)
      }
      
      isOpen.value = false
      emit('close')
    }
    
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownMenu.value && !dropdownMenu.value.contains(event.target)) {
        const wrapper = event.target.closest('.custom-dropdown-wrapper')
        if (!wrapper) {
          isOpen.value = false
          emit('close')
        }
      }
    }
    
    // Close dropdown on escape key
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen.value) {
        isOpen.value = false
        emit('close')
      }
    }
    
    // Watch for outside clicks
    watch(isOpen, (open) => {
      if (open) {
        document.addEventListener('click', handleClickOutside)
        document.addEventListener('keydown', handleEscape)
      } else {
        document.removeEventListener('click', handleClickOutside)
        document.removeEventListener('keydown', handleEscape)
      }
    })
    
    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    })
    
    return {
      isOpen,
      hasSelection,
      displayText,
      selectedOption,
      dropdownMenu,
      toggleDropdown,
      selectOption,
      isOptionSelected,
      isOptionDisabled,
      getOptionValue,
      getOptionLabel,
      getOptionSuffix
    }
  }
}
</script>

<style scoped>
.custom-dropdown-wrapper {
  position: relative;
  width: 100%;
}

.custom-dropdown-futuristic {
  width: 100%;
  padding: 0.75rem 1rem;
  padding-right: 2.75rem;
  /* Premium gradient background: dark navy → charcoal */
  background: linear-gradient(135deg, rgb(15 15 23) 0%, rgb(27 14 42) 100%);
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 14px;
  color: rgba(255, 255, 255, 0.95);
  font-size: 0.875rem;
  font-weight: 500;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  /* Soft inner shadow + light outer glow for depth */
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(139, 92, 246, 0.1),
    inset 0 1px 1px rgba(255, 255, 255, 0.05),
    inset 0 -1px 1px rgba(0, 0, 0, 0.2);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 42px;
  box-sizing: border-box;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  overflow: hidden;
}

/* Glassmorphism overlay effect */
.custom-dropdown-futuristic::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgb(15 15 23) 0%, rgb(27 14 42) 100%);
  opacity: 0;
  transition: opacity 0.25s ease;
  pointer-events: none;
  z-index: 0;
}

.custom-dropdown-futuristic.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.custom-dropdown-futuristic .dropdown-selected-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  position: relative;
  z-index: 1;
  letter-spacing: 0.01em;
}

.custom-dropdown-futuristic .dropdown-arrow {
  width: 14px;
  height: 14px;
  /* Closed state: Low contrast, soft gray with slight transparency */
  color: rgba(160, 160, 175, 0.6);
  transition: all 0.225s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
  margin-left: 0.75rem;
  position: relative;
  z-index: 1;
  transform-origin: center;
  /* No filter initially for low contrast */
  filter: none;
}

/* Hover state */
.custom-dropdown-futuristic:hover:not(.disabled) {
  border-color: rgba(139, 92, 246, 0.4);
  /* Enhanced shadow expansion */
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(139, 92, 246, 0.25),
    0 0 20px rgba(139, 92, 246, 0.15),
    inset 0 1px 1px rgba(255, 255, 255, 0.08),
    inset 0 -1px 1px rgba(0, 0, 0, 0.25);
  background: linear-gradient(135deg, rgba(15, 23, 42, 1) 0%, rgba(30, 41, 59, 1) 100%);
  transform: translateY(-1px);
}

.custom-dropdown-futuristic:hover:not(.disabled)::before {
  opacity: 1;
}

.custom-dropdown-futuristic:hover:not(.disabled) .dropdown-arrow {
  /* Hover: Arrow becomes brighter, scales up, subtle glow */
  color: rgba(168, 85, 247, 0.9);
  transform: scale(1.05);
  filter: drop-shadow(0 0 6px rgba(168, 85, 247, 0.5));
}

/* Active/Click state - shadow expansion */
.custom-dropdown-futuristic:active:not(.disabled) {
  transform: translateY(0);
  box-shadow: 
    0 2px 12px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(139, 92, 246, 0.3),
    0 0 30px rgba(139, 92, 246, 0.2),
    inset 0 1px 1px rgba(255, 255, 255, 0.1),
    inset 0 -1px 1px rgba(0, 0, 0, 0.3);
}

/* Open state */
.custom-dropdown-futuristic.open {
  border-color: rgba(139, 92, 246, 0.5);
  /* Stronger shadow elevation when open */
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(139, 92, 246, 0.4),
    0 0 30px rgba(139, 92, 246, 0.25),
    inset 0 1px 1px rgba(255, 255, 255, 0.1),
    inset 0 -1px 1px rgba(0, 0, 0, 0.3);
  background: linear-gradient(135deg, rgba(15, 23, 42, 1) 0%, rgba(30, 41, 59, 1) 100%);
}

.custom-dropdown-futuristic.open::before {
  opacity: 1;
}

.custom-dropdown-futuristic.open .dropdown-arrow {
  /* Open: Arrow rotates 180° upward, primary accent color with glow */
  transform: rotate(180deg) scale(1.05);
  color: rgba(139, 92, 246, 1);
  filter: drop-shadow(0 0 8px rgba(139, 92, 246, 0.8));
  transition: all 0.225s cubic-bezier(0.4, 0, 0.2, 1);
}

.custom-dropdown-futuristic.has-selection {
  color: rgba(255, 255, 255, 1);
  font-weight: 500;
}

/* Custom Dropdown Menu */
.custom-dropdown-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  right: 0;
  /* Premium glassmorphism background */
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 14px;
  /* Show exactly 4 options: each item is ~42px (padding 0.875rem top + 0.875rem bottom + text + border) */
  max-height: calc(4 * 42px + 1px);
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 99999;
  /* Enhanced depth with soft shadows and glow */
  box-shadow: 
    0 12px 40px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(139, 92, 246, 0.2),
    0 0 40px rgba(139, 92, 246, 0.15),
    inset 0 1px 1px rgba(255, 255, 255, 0.08),
    inset 0 -1px 1px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  /* Smooth fade + slide down animation */
  animation: dropdown-appear 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes dropdown-appear {
  from {
    opacity: 0;
    transform: translateY(-8px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.custom-dropdown-menu .dropdown-item {
  padding: 0.875rem 1.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid rgba(139, 92, 246, 0.1);
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.875rem;
}

.custom-dropdown-menu .dropdown-item:last-child {
  border-bottom: none;
}

.custom-dropdown-menu .dropdown-item:hover:not(.disabled) {
  background: rgba(139, 92, 246, 0.15);
  color: rgba(255, 255, 255, 1);
  padding-left: 1.5rem;
  box-shadow: inset 3px 0 0 rgba(139, 92, 246, 0.6);
}

.custom-dropdown-menu .dropdown-item.selected {
  background: rgba(139, 92, 246, 0.25);
  color: rgba(255, 255, 255, 1);
  font-weight: 600;
  box-shadow: inset 3px 0 0 rgba(168, 85, 247, 1);
}

.custom-dropdown-menu .dropdown-item.selected:hover:not(.disabled) {
  background: rgba(139, 92, 246, 0.3);
}

.custom-dropdown-menu .dropdown-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.option-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.option-name {
  font-weight: 500;
  color: rgba(255, 255, 255, 0.95);
}

.option-suffix {
  font-weight: 600;
  color: rgba(168, 85, 247, 0.9);
  text-shadow: 0 0 8px rgba(168, 85, 247, 0.5);
  white-space: nowrap;
}

/* Scrollbar styling for dropdown menu */
.custom-dropdown-menu::-webkit-scrollbar {
  width: 8px;
}

.custom-dropdown-menu::-webkit-scrollbar-track {
  background: rgba(15, 15, 23, 0.5);
  border-radius: 4px;
  margin: 4px 0;
}

.custom-dropdown-menu::-webkit-scrollbar-thumb {
  background: rgba(139, 92, 246, 0.6);
  border-radius: 4px;
  border: 1px solid rgba(139, 92, 246, 0.2);
}

.custom-dropdown-menu::-webkit-scrollbar-thumb:hover {
  background: rgba(139, 92, 246, 0.8);
}

.custom-dropdown-menu {
  scrollbar-width: thin;
  scrollbar-color: rgba(139, 92, 246, 0.6) rgba(255, 255, 255, 0.05);
}
</style>
