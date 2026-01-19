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
  background: rgba(15, 15, 23, 0.95);
  border: 1.5px solid rgba(139, 92, 246, 0.4);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.95);
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.3s ease;
  cursor: pointer;
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 42px;
  box-sizing: border-box;
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
}

.custom-dropdown-futuristic .dropdown-arrow {
  width: 16px;
  height: 16px;
  color: rgba(168, 85, 247, 0.8);
  transition: transform 0.3s ease, filter 0.3s ease;
  flex-shrink: 0;
  margin-left: 0.5rem;
  filter: drop-shadow(0 0 4px rgba(168, 85, 247, 0.6));
}

.custom-dropdown-futuristic:hover:not(.disabled) {
  border-color: rgba(139, 92, 246, 0.6);
  box-shadow: 
    0 4px 20px rgba(139, 92, 246, 0.3),
    0 0 0 1px rgba(139, 92, 246, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  background-color: rgba(15, 15, 23, 1);
  transform: translateY(-1px);
}

.custom-dropdown-futuristic:hover:not(.disabled) .dropdown-arrow {
  filter: drop-shadow(0 0 8px rgba(168, 85, 247, 0.9));
}

.custom-dropdown-futuristic.open {
  border-color: rgba(168, 85, 247, 0.8);
  box-shadow: 
    0 6px 25px rgba(139, 92, 246, 0.4),
    0 0 0 3px rgba(139, 92, 246, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  background-color: rgba(15, 15, 23, 1);
}

.custom-dropdown-futuristic.open .dropdown-arrow {
  transform: rotate(180deg);
  filter: drop-shadow(0 0 12px rgba(168, 85, 247, 1));
}

.custom-dropdown-futuristic.has-selection {
  color: rgba(255, 255, 255, 1);
  font-weight: 600;
}

/* Custom Dropdown Menu */
.custom-dropdown-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  right: 0;
  background: rgba(15, 15, 23, 0.98);
  border: 1.5px solid rgba(139, 92, 246, 0.4);
  border-radius: 8px;
  /* Show exactly 4 options: each item is ~42px (padding 0.875rem top + 0.875rem bottom + text + border) */
  max-height: calc(4 * 42px + 1px);
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 99999;
  box-shadow: 
    0 8px 30px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(139, 92, 246, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  animation: dropdown-appear 0.2s ease-out;
}

@keyframes dropdown-appear {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
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
