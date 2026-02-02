<template>
  <div class="search-input-wrapper">
    <span class="search-input-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M21 21L16.65 16.65" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </span>
    <input
      ref="inputRef"
      type="search"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :aria-label="ariaLabel || placeholder"
      autocomplete="off"
      class="search-input form-input"
      @input="onInput"
      @keydown.enter.prevent="onSubmit"
    />
    <button
      v-if="modelValue && clearable"
      type="button"
      class="search-input-clear"
      aria-label="Clear search"
      @click="clear"
    >
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </button>
  </div>
</template>

<script>
import { ref, watch } from 'vue'

/**
 * Reusable search input component.
 * Use with v-model for the search string. Emits 'search' after debounce for API calls.
 * Can be used for users, products, or any list that supports a search query param.
 *
 * @example Users: <SearchInput v-model="searchQuery" placeholder="Search by name, email, username, phone..." @search="loadUsers" />
 * @example Products: <SearchInput v-model="searchQuery" placeholder="Search products..." @search="loadProducts" />
 */
export default {
  name: 'SearchInput',
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: 'Search...'
    },
    /** Debounce delay in ms before emitting "search". Use 0 for no debounce. */
    debounce: {
      type: Number,
      default: 300
    },
    disabled: {
      type: Boolean,
      default: false
    },
    clearable: {
      type: Boolean,
      default: true
    },
    ariaLabel: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue', 'search'],
  setup(props, { emit }) {
    const inputRef = ref(null)
    let debounceTimer = null

    const onInput = (e) => {
      const value = (e.target && e.target.value) || ''
      emit('update:modelValue', value)
      scheduleSearch(value)
    }

    const scheduleSearch = (value) => {
      if (debounceTimer) clearTimeout(debounceTimer)
      if (props.debounce <= 0) {
        emit('search', value)
        return
      }
      debounceTimer = setTimeout(() => {
        emit('search', value)
        debounceTimer = null
      }, props.debounce)
    }

    const clear = () => {
      emit('update:modelValue', '')
      emit('search', '')
      inputRef.value && inputRef.value.focus()
    }

    const onSubmit = () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer)
        debounceTimer = null
      }
      emit('search', props.modelValue)
    }

    watch(() => props.modelValue, (val) => {
      if (val === '' && debounceTimer) {
        clearTimeout(debounceTimer)
        debounceTimer = null
        emit('search', '')
      }
    })

    return {
      inputRef,
      onInput,
      clear,
      onSubmit
    }
  }
}
</script>

<style scoped>
.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 100%;
}

.search-input-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.25rem;
  height: 1.25rem;
  color: var(--text-tertiary, rgba(255, 255, 255, 0.4));
  pointer-events: none;
}

.search-input-icon svg {
  width: 100%;
  height: 100%;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  padding-right: 2.5rem;
  border-radius: var(--radius-md, 12px);
  border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
  background: rgba(255, 255, 255, 0.03);
  color: var(--text-primary, rgba(255, 255, 255, 0.9));
  font-size: 1rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.search-input::placeholder {
  color: var(--text-tertiary, rgba(255, 255, 255, 0.4));
}

.search-input:focus {
  outline: none;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.search-input-clear {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.5rem;
  height: 1.5rem;
  padding: 0;
  border: none;
  background: none;
  color: var(--text-tertiary, rgba(255, 255, 255, 0.4));
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease, background 0.2s ease;
}

.search-input-clear:hover {
  color: var(--text-primary, rgba(255, 255, 255, 0.9));
  background: rgba(255, 255, 255, 0.08);
}

.search-input-clear svg {
  width: 0.875rem;
  height: 0.875rem;
}
</style>
