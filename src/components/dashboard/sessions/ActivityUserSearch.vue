<template>
  <div class="user-search-wrapper customer-search-wrapper">
    <input
      :value="bindings.getUserSearchQuery(bindings.session, bindings.activity)"
      @input="bindings.handleUserSearch(bindings.session, bindings.activity, $event)"
      @focus="bindings.handleUserSearchFocus(bindings.session, bindings.activity)"
      @blur="bindings.handleUserSearchBlur(bindings.session, bindings.activity)"
      type="text"
      class="form-input user-search-input"
      :class="{ 'has-selection': bindings.getSelectedUser(bindings.session, bindings.activity) }"
      :data-key="bindings.getUserDropdownKey(bindings.session, bindings.activity)"
      placeholder="Type to search users..."
      autocomplete="off"
    />
    <div v-if="bindings.getUserSearchLoading(bindings.session, bindings.activity)" class="search-loading">
      <div class="loading-spinner small"></div>
    </div>
    <div
      v-if="bindings.getShowUserSearchDropdown(bindings.session, bindings.activity) && (bindings.getUserSearchResults(bindings.session, bindings.activity).length > 0 || bindings.getUserSearchQuery(bindings.session, bindings.activity).length > 0)"
      class="user-search-dropdown customer-dropdown"
    >
      <div
        v-if="bindings.getUserSearchLoading(bindings.session, bindings.activity)"
        class="dropdown-item loading-item"
      >
        <div class="loading-spinner small"></div>
        <span>Searching...</span>
      </div>
      <div
        v-else-if="bindings.getUserSearchResults(bindings.session, bindings.activity).length === 0 && bindings.getUserSearchQuery(bindings.session, bindings.activity).length > 0 && bindings.canCreateNewUser(bindings.session, bindings.activity)"
        class="dropdown-item create-new-customer"
        @mousedown.prevent="bindings.createUser(bindings.session, bindings.activity)"
      >
        <svg class="create-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <path d="M12 8V16M8 12H16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <span>Create new user: <strong>{{ bindings.getUserSearchQuery(bindings.session, bindings.activity).trim() }}</strong></span>
      </div>
      <div
        v-else-if="bindings.getUserSearchResults(bindings.session, bindings.activity).length === 0 && bindings.getUserSearchQuery(bindings.session, bindings.activity).length > 0 && !bindings.canCreateNewUser(bindings.session, bindings.activity)"
        class="dropdown-item no-results"
      >
        No users found
      </div>
      <div
        v-for="user in bindings.getUserSearchResults(bindings.session, bindings.activity)"
        :key="user.id"
        @mousedown.prevent="bindings.isUserSelectable(user) ? bindings.selectUser(bindings.session, bindings.activity, user) : null"
        class="dropdown-item"
        :class="{
          'disabled': !bindings.isUserSelectable(user),
          'selected': bindings.getSelectedUser(bindings.session, bindings.activity)?.id === user.id
        }"
      >
        <div class="customer-info">
          <span class="customer-name">{{ user.name }}</span>
          <span class="customer-email">{{ user.email }}</span>
          <span v-if="user.in_active_activity" class="user-status-badge" style="font-size: 0.7rem; color: #f59e0b; margin-top: 0.25rem;">
            (In active activity - cannot select)
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  bindings: {
    type: Object,
    required: true
  }
})
</script>

<style scoped>
/* Global .customer-search-wrapper, .customer-dropdown from components.css apply; override dropdown stacking */
.user-search-dropdown {
  z-index: 99999 !important;
  -webkit-overflow-scrolling: touch;
}

.dropdown-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: rgba(255, 255, 255, 0.02) !important;
}

.dropdown-item.disabled:hover {
  background: rgba(255, 255, 255, 0.02) !important;
  border-left: none;
}

.user-status-badge {
  display: block;
  font-size: 0.7rem;
  color: #f59e0b;
  margin-top: 0.25rem;
  font-style: italic;
  white-space: normal;
  word-wrap: break-word;
}
</style>
