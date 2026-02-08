<template>
  <div class="points-section">
    <!-- Header -->
    <div class="points-section__header">
      <div class="points-section__header-info">
        <h1 class="points-section__title">Points Transactions</h1>
        <p class="points-section__subtitle">Manage user balances, levels, and view the full transaction ledger</p>
      </div>
    </div>

    <!-- Success Notification -->
    <div v-if="showSuccess" class="points-section__toast success">
      <div class="points-section__toast-content">
        <svg class="points-section__toast-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.7088 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18457 2.99721 7.13633 4.39828 5.49707C5.79935 3.85782 7.69279 2.71867 9.79619 2.24318C11.8996 1.76769 14.1003 1.98245 16.07 2.86" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>{{ successMessage }}</span>
      </div>
    </div>

    <!-- Tabs -->
    <div class="points-section__tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id; onTabChange(tab.id)"
        :class="['points-section__tab', { active: activeTab === tab.id }]"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Tab: Users & Balances -->
    <div v-show="activeTab === 'users'" class="points-section__content">
      <!-- Search & filters -->
      <div class="points-section__filters">
        <SearchInput
          v-model="searchQuery"
          placeholder="Search by name, username, or phone..."
          :debounce="300"
          @search="onBalancesSearch"
          class="points-section__search"
        />
        <CustomDropdown
          v-model="levelFilter"
          :options="levelFilterOptions"
          option-value="id"
          option-label="name"
          placeholder="All levels"
          :show-placeholder-in-menu="false"
          class="points-section__level-dropdown"
          @change="onLevelFilterChange"
        />
      </div>

      <!-- Loading -->
      <div v-if="balancesLoading && !balancesLoaded" class="points-section__loading">
        <div class="points-section__spinner"></div>
        <p class="points-section__loading-text">Loading users...</p>
      </div>

      <!-- Error -->
      <div v-else-if="balancesError && !balancesLoaded" class="points-section__error">
        <div class="points-section__error-card">
          <h3 class="points-section__error-title">Error Loading Balances</h3>
          <p class="points-section__error-message">{{ balancesError }}</p>
          <button @click="loadBalances" class="points-section__action-btn secondary">Retry</button>
        </div>
      </div>

      <!-- Empty -->
      <div v-else-if="balancesLoaded && balancesList.length === 0" class="points-section__empty">
        <h3 class="points-section__empty-title">No Users Found</h3>
        <p class="points-section__empty-message">No users match your search or filter.</p>
      </div>

      <!-- Users table / cards -->
      <div v-else class="points-section__display">
        <!-- Desktop table -->
        <div class="points-section__table-wrap desktop-only">
          <div class="points-section__table-card">
            <table class="points-section__table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Rank</th>
                  <th>Level</th>
                  <th>Total Points</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="row in balancesList" :key="row.user?.id ?? row.id">
                  <tr
                    class="points-section__row"
                    :class="{ expanded: expandedUserId === row.user?.id }"
                    @click="toggleExpandUser(row)"
                  >
                    <td>
                      <div class="points-section__user-info">
                        <div class="points-section__avatar" :class="{ 'has-image': getUserAvatar(row) }">
                          <img v-if="getUserAvatar(row)" :src="getUserAvatar(row)" :alt="getUserName(row)" class="points-section__avatar-img" />
                          <span v-else>{{ getUserInitials(row) }}</span>
                        </div>
                        <div class="points-section__user-details">
                          <span class="points-section__user-name">{{ getUserName(row) }}</span>
                          <span class="points-section__user-meta">{{ getUsernameOrPhone(row) }}</span>
                        </div>
                        <div class="points-section__expand-icon" :class="{ expanded: expandedUserId === row.user?.id }">
                          <svg viewBox="0 0 24 24" fill="none"><path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        </div>
                      </div>
                    </td>
                    <td><span class="points-section__rank-badge">{{ getRankForUser(row) != null ? '#' + getRankForUser(row) : '—' }}</span></td>
                    <td><span class="points-section__level-badge">{{ getLevelName(row) }}</span></td>
                    <td><span class="points-section__points-value">{{ formatPoints(getTotalPoints(row)) }}</span></td>
                    <td @click.stop>
                      <div class="points-section__row-actions">
                        <button @click="openRankModal(row)" class="points-section__action-btn small secondary" title="View rank">Rank</button>
                        <button @click="showUserTransactions(row)" class="points-section__action-btn small secondary" title="Show transactions">Transactions</button>
                        <button @click="openAdjustModal(row)" class="points-section__action-btn small primary" title="Edit balance">Edit</button>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="expandedUserId === row.user?.id" class="points-section__expanded-row">
                    <td colspan="5" class="points-section__expanded-cell">
                      <div class="points-section__expanded-section">
                        <h4 class="points-section__expanded-title">Transactions</h4>
                        <div v-if="loadingTransactions[row.user?.id]" class="points-section__trans-loading">Loading...</div>
                        <div v-else-if="userTransactions[row.user?.id]?.length === 0" class="points-section__trans-empty">No transactions</div>
                        <div v-else class="points-section__trans-list">
                          <div v-for="tx in userTransactions[row.user?.id]" :key="tx.id" class="points-section__trans-item">
                            <span class="points-section__trans-date">{{ formatDate(tx.created_at) }}</span>
                            <span :class="['points-section__trans-type', getTypeClass(tx.type)]">{{ formatType(tx.type) }}</span>
                            <span :class="['points-section__trans-points', tx.points >= 0 ? 'earned' : 'spent']">
                              {{ tx.points >= 0 ? '+' : '' }}{{ formatPoints(tx.points) }}
                            </span>
                            <span class="points-section__trans-desc">{{ tx.description || '—' }}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Mobile: user balance cards -->
        <div class="points-section__balance-cards mobile-only">
          <div
            v-for="row in balancesList"
            :key="row.user?.id ?? row.id"
            class="points-section__balance-card"
            :class="{ expanded: expandedUserId === row.user?.id }"
          >
            <div class="points-section__balance-card-main" @click="toggleExpandUser(row)">
              <div class="points-section__balance-card-header">
                <div class="points-section__avatar" :class="{ 'has-image': getUserAvatar(row) }">
                  <img v-if="getUserAvatar(row)" :src="getUserAvatar(row)" :alt="getUserName(row)" class="points-section__avatar-img" />
                  <span v-else>{{ getUserInitials(row) }}</span>
                </div>
                <div class="points-section__balance-card-info">
                  <h3 class="points-section__balance-card-name">{{ getUserName(row) }}</h3>
                  <span v-if="getRankForUser(row) != null" class="points-section__rank-badge points-section__rank-badge--card">#{{ getRankForUser(row) }}</span>
                  <span class="points-section__level-badge">{{ getLevelName(row) }}</span>
                  <span class="points-section__points-value">{{ formatPoints(getTotalPoints(row)) }} pts</span>
                </div>
                <div class="points-section__expand-icon" :class="{ expanded: expandedUserId === row.user?.id }">
                  <svg viewBox="0 0 24 24" fill="none"><path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </div>
              </div>
              <div class="points-section__balance-card-actions" @click.stop>
                <button @click="openRankModal(row)" class="points-section__card-btn secondary">Rank</button>
                <button @click="showUserTransactions(row)" class="points-section__card-btn secondary">Transactions</button>
                <button @click="openAdjustModal(row)" class="points-section__card-btn primary">Edit balance</button>
              </div>
            </div>
            <div v-if="expandedUserId === row.user?.id" class="points-section__balance-card-expanded">
              <h4 class="points-section__expanded-title">Transactions</h4>
              <div v-if="loadingTransactions[row.user?.id]" class="points-section__trans-loading">Loading...</div>
              <div v-else-if="userTransactions[row.user?.id]?.length === 0" class="points-section__trans-empty">No transactions</div>
              <div v-else class="points-section__trans-list points-section__trans-list--compact">
                <div v-for="tx in userTransactions[row.user?.id]" :key="tx.id" class="points-section__trans-item points-section__trans-item--compact">
                  <span class="points-section__trans-date">{{ formatDate(tx.created_at) }}</span>
                  <span :class="['points-section__trans-type', getTypeClass(tx.type)]">{{ formatType(tx.type) }}</span>
                  <span :class="['points-section__trans-points', tx.points >= 0 ? 'earned' : 'spent']">
                    {{ tx.points >= 0 ? '+' : '' }}{{ formatPoints(tx.points) }}
                  </span>
                  <span class="points-section__trans-desc">{{ tx.description || '—' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination (Sessions style) -->
        <div v-if="balancesLastPage > 1" class="pagination-container">
          <div class="pagination-info">
            <span class="pagination-text">
              Showing {{ balancesData?.from ?? 0 }} to {{ balancesData?.to ?? 0 }} of {{ balancesData?.total ?? 0 }} users
            </span>
          </div>
          <div class="pagination">
            <button
              @click="goToBalancesPage(1)"
              :disabled="balancesPage === 1"
              class="pagination-btn"
              title="First Page"
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 17L6 12L11 7M18 17L13 12L18 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <button
              @click="goToBalancesPage(balancesPage - 1)"
              :disabled="balancesPage === 1"
              class="pagination-btn"
              title="Previous Page"
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <template v-if="balancesLastPage <= 7">
              <button
                v-for="page in balancesLastPage"
                :key="page"
                @click="goToBalancesPage(page)"
                :class="['pagination-btn', 'pagination-page', { active: page === balancesPage }]"
              >
                {{ page }}
              </button>
            </template>
            <template v-else>
              <button
                v-if="balancesPage > 3"
                @click="goToBalancesPage(1)"
                class="pagination-btn pagination-page"
              >
                1
              </button>
              <span v-if="balancesPage > 4" class="pagination-ellipsis">...</span>
              <button
                v-for="page in getBalancesPageNumbers()"
                :key="page"
                @click="goToBalancesPage(page)"
                :class="['pagination-btn', 'pagination-page', { active: page === balancesPage }]"
              >
                {{ page }}
              </button>
              <span v-if="balancesPage < balancesLastPage - 3" class="pagination-ellipsis">...</span>
              <button
                v-if="balancesPage < balancesLastPage - 2"
                @click="goToBalancesPage(balancesLastPage)"
                class="pagination-btn pagination-page"
              >
                {{ balancesLastPage }}
              </button>
            </template>
            <button
              @click="goToBalancesPage(balancesPage + 1)"
              :disabled="balancesPage === balancesLastPage"
              class="pagination-btn"
              title="Next Page"
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <button
              @click="goToBalancesPage(balancesLastPage)"
              :disabled="balancesPage === balancesLastPage"
              class="pagination-btn"
              title="Last Page"
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 17L18 12L13 7M6 17L11 12L6 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab: All Transactions -->
    <div v-show="activeTab === 'transactions'" class="points-section__content">
      <!-- Filter by user bar -->
      <div v-if="transactionsFilterUserId" class="points-section__filter-bar">
        <span class="points-section__filter-label">Showing transactions for:</span>
        <span class="points-section__filter-user">{{ transactionsFilterUserName }}</span>
        <button @click="clearTransactionsFilter" class="points-section__filter-clear">Show all</button>
      </div>
      <div v-if="transactionsLoading && !transactionsLoaded" class="points-section__loading">
        <div class="points-section__spinner"></div>
        <p class="points-section__loading-text">Loading transactions...</p>
      </div>

      <div v-else-if="transactionsError && !transactionsLoaded" class="points-section__error">
        <div class="points-section__error-card">
          <h3 class="points-section__error-title">Error Loading Transactions</h3>
          <p class="points-section__error-message">{{ transactionsError }}</p>
          <button @click="loadAllTransactions" class="points-section__action-btn secondary">Retry</button>
        </div>
      </div>

      <div v-else-if="transactionsLoaded && allTransactions.length === 0" class="points-section__empty">
        <h3 class="points-section__empty-title">No Transactions</h3>
        <p class="points-section__empty-message">No transactions recorded yet.</p>
      </div>

      <div v-else class="points-section__display">
        <div class="points-section__table-wrap desktop-only">
          <div class="points-section__table-card">
            <table class="points-section__table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>User</th>
                  <th>Type</th>
                  <th>Points</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="tx in allTransactions" :key="tx.id" class="points-section__row">
                  <td>{{ formatDate(tx.created_at) }}</td>
                  <td>
                    <div class="points-section__user-info">
                      <div class="points-section__avatar points-section__avatar--sm" :class="{ 'has-image': getTransactionUserAvatar(tx) }">
                        <img v-if="getTransactionUserAvatar(tx)" :src="getTransactionUserAvatar(tx)" :alt="tx.user?.name" class="points-section__avatar-img" />
                        <span v-else>{{ getTransactionUserInitials(tx) }}</span>
                      </div>
                      <span>{{ tx.user?.name || tx.user_id || '—' }}</span>
                    </div>
                  </td>
                  <td><span :class="['points-section__trans-type', getTypeClass(tx.type)]">{{ formatType(tx.type) }}</span></td>
                  <td :class="['points-section__trans-points', tx.points >= 0 ? 'earned' : 'spent']">
                    {{ tx.points >= 0 ? '+' : '' }}{{ formatPoints(tx.points) }}
                  </td>
                  <td class="points-section__trans-desc">{{ tx.description || '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Mobile: transaction cards -->
        <div class="points-section__trans-cards mobile-only">
          <div v-for="tx in allTransactions" :key="tx.id" class="points-section__trans-card">
            <div class="points-section__trans-card-header">
              <div class="points-section__trans-card-user-row">
                <div class="points-section__avatar points-section__avatar--sm" :class="{ 'has-image': getTransactionUserAvatar(tx) }">
                  <img v-if="getTransactionUserAvatar(tx)" :src="getTransactionUserAvatar(tx)" :alt="tx.user?.name" class="points-section__avatar-img" />
                  <span v-else>{{ getTransactionUserInitials(tx) }}</span>
                </div>
                <div class="points-section__trans-card-user-info">
                  <h3 class="points-section__trans-card-user">{{ tx.user?.name || tx.user_id || '—' }}</h3>
                  <span :class="['points-section__trans-type', 'badge', getTypeClass(tx.type)]">{{ formatType(tx.type) }}</span>
                  <span :class="['points-section__trans-points', tx.points >= 0 ? 'earned' : 'spent']">
                    {{ tx.points >= 0 ? '+' : '' }}{{ formatPoints(tx.points) }}
                  </span>
                </div>
              </div>
            </div>
            <p class="points-section__trans-card-desc">{{ tx.description || '—' }}</p>
            <span class="points-section__trans-card-date">{{ formatDate(tx.created_at) }}</span>
          </div>
        </div>

        <!-- Pagination (Sessions style) -->
        <div v-if="transactionsLastPage > 1" class="pagination-container">
          <div class="pagination-info">
            <span class="pagination-text">
              Showing {{ transactionsData?.from ?? 0 }} to {{ transactionsData?.to ?? 0 }} of {{ transactionsData?.total ?? 0 }} transactions
            </span>
          </div>
          <div class="pagination">
            <button
              @click="goToTransactionsPage(1)"
              :disabled="transactionsPage === 1"
              class="pagination-btn"
              title="First Page"
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 17L6 12L11 7M18 17L13 12L18 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <button
              @click="goToTransactionsPage(transactionsPage - 1)"
              :disabled="transactionsPage === 1"
              class="pagination-btn"
              title="Previous Page"
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <template v-if="transactionsLastPage <= 7">
              <button
                v-for="page in transactionsLastPage"
                :key="page"
                @click="goToTransactionsPage(page)"
                :class="['pagination-btn', 'pagination-page', { active: page === transactionsPage }]"
              >
                {{ page }}
              </button>
            </template>
            <template v-else>
              <button
                v-if="transactionsPage > 3"
                @click="goToTransactionsPage(1)"
                class="pagination-btn pagination-page"
              >
                1
              </button>
              <span v-if="transactionsPage > 4" class="pagination-ellipsis">...</span>
              <button
                v-for="page in getTransactionsPageNumbers()"
                :key="page"
                @click="goToTransactionsPage(page)"
                :class="['pagination-btn', 'pagination-page', { active: page === transactionsPage }]"
              >
                {{ page }}
              </button>
              <span v-if="transactionsPage < transactionsLastPage - 3" class="pagination-ellipsis">...</span>
              <button
                v-if="transactionsPage < transactionsLastPage - 2"
                @click="goToTransactionsPage(transactionsLastPage)"
                class="pagination-btn pagination-page"
              >
                {{ transactionsLastPage }}
              </button>
            </template>
            <button
              @click="goToTransactionsPage(transactionsPage + 1)"
              :disabled="transactionsPage === transactionsLastPage"
              class="pagination-btn"
              title="Next Page"
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <button
              @click="goToTransactionsPage(transactionsLastPage)"
              :disabled="transactionsPage === transactionsLastPage"
              class="pagination-btn"
              title="Last Page"
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 17L18 12L13 7M6 17L11 12L6 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Balance Modal -->
    <div v-if="showAdjustModal" class="points-section__modal-overlay" @click.self="closeAdjustModal">
      <div class="points-section__modal">
        <div class="points-section__modal-header">
          <h3>Adjust Point Balance</h3>
          <button @click="closeAdjustModal" class="points-section__modal-close" aria-label="Close">&times;</button>
        </div>
        <form @submit.prevent="submitAdjust" class="points-section__modal-form">
          <p class="points-section__modal-user">{{ adjustUser ? getUserName(adjustUser) : '' }}</p>
          <div class="points-section__form-group">
            <label for="adjust-points">Points</label>
            <div class="points-section__points-input-wrap">
              <input id="adjust-points" v-model.number="adjustForm.pointsAmount" type="number" min="1" step="1" required placeholder="0" class="points-section__form-input points-section__points-amount" />
              <CustomDropdown
                v-model="adjustForm.pointsSign"
                :options="pointsSignOptions"
                option-value="id"
                option-label="name"
                :format-display-text="(opt) => opt?.id ?? ''"
                placeholder="+"
                :show-placeholder-in-menu="false"
                class="points-section__points-sign-dropdown"
              />
            </div>
          </div>
          <div v-if="adjustError" class="points-section__form-error">{{ adjustError }}</div>
          <div class="points-section__modal-actions">
            <button type="button" @click="closeAdjustModal" class="points-section__action-btn secondary">Cancel</button>
            <button type="submit" :disabled="adjusting" class="points-section__action-btn primary">{{ adjusting ? 'Saving…' : 'Save' }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- User Rank Modal -->
    <div v-if="showRankModal" class="points-section__modal-overlay" @click.self="closeRankModal">
      <div class="points-section__modal points-section__modal--rank">
        <div class="points-section__modal-header">
          <h3>User rank</h3>
          <button @click="closeRankModal" class="points-section__modal-close" aria-label="Close">&times;</button>
        </div>
        <div class="points-section__rank-modal-body">
          <p class="points-section__modal-user">{{ rankModalUser ? getUserName(rankModalUser) : '' }}</p>
          <div class="points-section__rank-tabs" role="tablist" aria-label="Rank period">
            <button
              type="button"
              role="tab"
              :aria-selected="rankModalPeriod === 'today'"
              :class="['points-section__rank-tab', { active: rankModalPeriod === 'today' }]"
              @click="setRankModalPeriod('today')"
            >
              Today
            </button>
            <button
              type="button"
              role="tab"
              :aria-selected="rankModalPeriod === 'month'"
              :class="['points-section__rank-tab', { active: rankModalPeriod === 'month' }]"
              @click="setRankModalPeriod('month')"
            >
              This month
            </button>
            <button
              type="button"
              role="tab"
              :aria-selected="rankModalPeriod === 'all-time'"
              :class="['points-section__rank-tab', { active: rankModalPeriod === 'all-time' }]"
              @click="setRankModalPeriod('all-time')"
            >
              All time
            </button>
          </div>
          <div v-if="rankModalPeriod === 'month'" class="points-section__rank-picker">
            <select v-model.number="rankModalMonth" @change="loadUserRankForModal" class="points-section__rank-select" aria-label="Month">
              <option v-for="m in rankModalMonthOptions" :key="m.value" :value="m.value">{{ m.label }}</option>
            </select>
            <select v-model.number="rankModalYear" @change="loadUserRankForModal" class="points-section__rank-select" aria-label="Year">
              <option v-for="y in rankModalYearOptions" :key="y.value" :value="y.value">{{ y.label }}</option>
            </select>
          </div>
          <div v-if="rankModalLoading" class="points-section__rank-modal-loading">
            <div class="points-section__spinner points-section__spinner--sm"></div>
            <span>Loading rank…</span>
          </div>
          <p v-else-if="rankModalError" class="points-section__rank-modal-error">{{ rankModalError }}</p>
          <div v-else-if="rankModalData" class="points-section__rank-modal-result">
            <template v-if="rankModalData.in_leaderboard">
              <span class="points-section__rank-modal-value">#{{ rankModalData.rank }} of {{ rankModalData.total_users }}</span>
              <span class="points-section__rank-modal-points">{{ (rankModalData.points ?? 0).toLocaleString() }} pts</span>
            </template>
            <template v-else>
              <span class="points-section__rank-modal-message">{{ rankModalData.message || 'No activity in this period' }}</span>
            </template>
          </div>
          <div class="points-section__modal-actions">
            <button type="button" @click="closeRankModal" class="points-section__action-btn secondary">Close</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import SearchInput from '@/components/base/ui/SearchInput.vue'
import CustomDropdown from '@/components/base/ui/CustomDropdown.vue'
import { useUserStore } from '@/stores/userStore'
import { resolveBackendImageUrl } from '@/utils/helpers'
import { userPointBalancesApi } from '@/api/userPointBalancesApi'
import { userLevelsApi } from '@/api/userLevels'
import { ranksApi } from '@/api/ranks'

const userStore = useUserStore()

/** All-time top 10 leaderboard: userId -> rank (1–10). Used to show rank in users list. */
const leaderboardRankMap = ref({})

const activeTab = ref('users')
const tabs = [
  { id: 'users', label: 'Users & Balances' },
  { id: 'transactions', label: 'All Transactions' }
]

const searchQuery = ref('')
const levelFilter = ref('')
const showSuccess = ref(false)
const successMessage = ref('')
const userLevels = ref([])

const balancesLoading = ref(false)
const balancesError = ref(null)
const balancesLoaded = ref(false)
const balancesData = ref(null)

const expandedUserId = ref(null)
const userTransactions = ref({})
const loadingTransactions = ref({})
const balancesPage = ref(1)
const balancesLastPage = ref(1)

const transactionsLoading = ref(false)
const transactionsError = ref(null)
const transactionsLoaded = ref(false)
const transactionsData = ref(null)
const transactionsPage = ref(1)
const transactionsLastPage = ref(1)
const transactionsFilterUserId = ref(null)
const transactionsFilterUserName = ref('')

const showAdjustModal = ref(false)
const adjustUser = ref(null)
const adjustForm = ref({ pointsSign: '+', pointsAmount: 0 })
const adjusting = ref(false)
const adjustError = ref('')

const showRankModal = ref(false)
const rankModalUser = ref(null)
const rankModalPeriod = ref('today')
const rankModalMonth = ref(new Date().getMonth() + 1)
const rankModalYear = ref(new Date().getFullYear())
const rankModalData = ref(null)
const rankModalLoading = ref(false)
const rankModalError = ref(null)

const rankModalMonthOptions = computed(() =>
  Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: new Date(2000, i).toLocaleString('default', { month: 'long' })
  }))
)
const rankModalYearOptions = computed(() => {
  const y = new Date().getFullYear()
  return Array.from({ length: 5 }, (_, i) => ({ value: y - i, label: String(y - i) }))
})

const balancesList = computed(() => {
  const d = balancesData.value
  if (!d) return []
  if (Array.isArray(d)) return d
  if (Array.isArray(d.data)) return d.data
  if (d.users && Array.isArray(d.users)) return d.users
  return []
})

const allTransactions = computed(() => {
  const d = transactionsData.value
  if (!d) return []
  if (Array.isArray(d)) return d
  if (d.data && Array.isArray(d.data)) return d.data
  return []
})

const levelFilterOptions = computed(() => {
  const levels = userLevels.value || []
  return [{ id: '', name: 'All levels' }, ...levels.map((l) => ({ id: l.id, name: l.name }))]
})

const pointsSignOptions = [
  { id: '+', name: 'Add (+)' },
  { id: '-', name: 'Reduce (−)' }
]

function getUserName(row) {
  const u = row.user || row
  return u.name || u.username || u.email || 'User #' + (u.id ?? row.user_id)
}

function getUserInitials(row) {
  const name = getUserName(row)
  const parts = String(name).trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase().slice(0, 2)
  return name.slice(0, 2).toUpperCase()
}

function getUsernameOrPhone(row) {
  const u = row.user || row
  return u.username || u.phone || u.email || ''
}

// Same avatar resolution as UsersSection - uses userStore as fallback (user_point_balances API may not include avatar)
function getUserAvatar(row) {
  const u = row.user || row
  const uid = u?.id ?? row.user_id
  // First try avatar from row/user (balances API response)
  let raw = u && (u.avatar ?? u.avatar_url ?? u.profile_image ?? u.photo_url ?? u.profile_photo_url ?? u.picture)
  let url = raw ? resolveBackendImageUrl(raw) : null
  if (url) return url
  // Fallback: lookup full user from userStore (same source as Users list - has avatars)
  if (uid && userStore.getUsers?.length) {
    const fullUser = userStore.getUsers.find((x) => x.id === uid || x.id === Number(uid))
    if (fullUser) {
      raw = fullUser.avatar ?? fullUser.profile_image ?? fullUser.photo_url ?? fullUser.profile_photo_url
      url = raw ? resolveBackendImageUrl(raw) : null
      if (url) return url
    }
  }
  return null
}

function getTransactionUserAvatar(tx) {
  const u = tx.user
  const uid = u?.id ?? tx.user_id
  let raw = u && (u.avatar ?? u.avatar_url ?? u.profile_image ?? u.photo_url ?? u.profile_photo_url ?? u.picture)
  let url = raw ? resolveBackendImageUrl(raw) : null
  if (url) return url
  if (uid && userStore.getUsers?.length) {
    const fullUser = userStore.getUsers.find((x) => x.id === uid || x.id === Number(uid))
    if (fullUser) {
      raw = fullUser.avatar ?? fullUser.profile_image ?? fullUser.photo_url ?? fullUser.profile_photo_url
      url = raw ? resolveBackendImageUrl(raw) : null
      if (url) return url
    }
  }
  return null
}

function getTransactionUserInitials(tx) {
  const name = tx.user?.name || tx.user?.username || tx.user?.email || String(tx.user_id ?? 'U')
  const parts = String(name).trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase().slice(0, 2)
  return name.slice(0, 2).toUpperCase()
}

function getLevelName(row) {
  const lvl = row.user_level || row.level || row.user?.user_level
  return lvl?.name ?? '—'
}

function getRankForUser(row) {
  const uid = row.user?.id ?? row.user_id
  if (uid == null) return null
  const rank = leaderboardRankMap.value[uid] ?? leaderboardRankMap.value[Number(uid)]
  return rank != null ? rank : null
}

async function loadLeaderboardRanks() {
  try {
    const res = await ranksApi.leaderboard({ period: 'all-time', limit: 10 })
    const list = res?.data ?? []
    const map = {}
    list.forEach((entry) => {
      if (entry.id != null && entry.rank != null) map[entry.id] = entry.rank
    })
    leaderboardRankMap.value = map
  } catch {
    leaderboardRankMap.value = {}
  }
}

function getTotalPoints(row) {
  const bal = row.user_point_balance || row.balance || row
  return bal?.total_points ?? row.total_points ?? 0
}

function formatPoints(v) {
  const n = Number(v)
  if (isNaN(n)) return '0'
  return n.toLocaleString()
}

function formatDate(s) {
  if (!s) return '—'
  try {
    const d = new Date(s)
    return d.toLocaleString()
  } catch {
    return s
  }
}

const TYPE_LABELS = {
  play_time: 'Play time',
  product_purchase: 'Product purchase',
  product_refund: 'Product refund',
  adjustment: 'Adjustment',
  redemption: 'Redemption',
  expiry: 'Expiry'
}

function formatType(t) {
  return TYPE_LABELS[t] || (t ? String(t).replace(/_/g, ' ') : '—')
}

function getTypeClass(t) {
  const map = {
    play_time: 'type-play',
    product_purchase: 'type-product',
    product_refund: 'type-refund',
    adjustment: 'type-adjust',
    redemption: 'type-redeem',
    expiry: 'type-expiry'
  }
  return map[t] || ''
}

function toggleExpandUser(row) {
  const uid = row.user?.id ?? row.user_id ?? row.id
  if (expandedUserId.value === uid) {
    expandedUserId.value = null
    return
  }
  expandedUserId.value = uid
  if (!userTransactions.value[uid]) {
    loadUserTransactions(uid)
  }
}

function goToBalancesPage(page) {
  if (page >= 1 && page <= balancesLastPage.value) {
    balancesPage.value = page
    loadBalances()
  }
}

function getBalancesPageNumbers() {
  const current = balancesPage.value
  const last = balancesLastPage.value
  const pages = []
  if (current <= 3) {
    for (let i = 1; i <= Math.min(5, last); i++) pages.push(i)
  } else if (current >= last - 2) {
    for (let i = Math.max(1, last - 4); i <= last; i++) pages.push(i)
  } else {
    for (let i = current - 2; i <= current + 2; i++) pages.push(i)
  }
  return pages
}

function onBalancesSearch() {
  balancesPage.value = 1
  loadBalances()
}

function onLevelFilterChange() {
  balancesPage.value = 1
  loadBalances()
}

function showUserTransactions(row) {
  const uid = row.user?.id ?? row.user_id ?? row.id
  transactionsFilterUserId.value = uid
  transactionsFilterUserName.value = getUserName(row)
  activeTab.value = 'transactions'
  transactionsPage.value = 1
  loadAllTransactions()
}

function clearTransactionsFilter() {
  transactionsFilterUserId.value = null
  transactionsFilterUserName.value = ''
  transactionsPage.value = 1
  loadAllTransactions()
}

function loadUserTransactions(userId) {
  loadingTransactions.value[userId] = true
  userPointBalancesApi.getTransactions(userId)
    .then((res) => {
      const data = res.data ?? res
      userTransactions.value[userId] = Array.isArray(data) ? data : []
    })
    .catch(() => { userTransactions.value[userId] = [] })
    .finally(() => { loadingTransactions.value[userId] = false })
}

async function loadBalances() {
  balancesLoading.value = true
  balancesError.value = null
  try {
    const params = { page: balancesPage.value, per_page: 10 }
    if (searchQuery.value) params.search = searchQuery.value
    const lf = levelFilter.value
    if (lf !== '' && lf != null) params.level_id = lf
    const res = await userPointBalancesApi.list(params)
    balancesData.value = res
    balancesLastPage.value = res.last_page ?? 1
    balancesLoaded.value = true
  } catch (e) {
    balancesError.value = e.response?.data?.message ?? e.message ?? 'Failed to load balances'
  } finally {
    balancesLoading.value = false
  }
}

async function loadAllTransactions() {
  transactionsLoading.value = true
  transactionsError.value = null
  try {
    const params = { page: transactionsPage.value }
    if (transactionsFilterUserId.value) params.user_id = transactionsFilterUserId.value
    const res = await userPointBalancesApi.listAllTransactions(params)
    transactionsData.value = res
    transactionsLastPage.value = res.last_page ?? 1
    transactionsLoaded.value = true
  } catch (e) {
    transactionsError.value = e.response?.data?.message ?? e.message ?? 'Failed to load transactions'
  } finally {
    transactionsLoading.value = false
  }
}

function loadLevels() {
  userLevelsApi.list().then((data) => {
    userLevels.value = Array.isArray(data) ? data : (data?.data ?? [])
  }).catch(() => {})
}

function onTabChange(tabId) {
  if (tabId === 'users' && !balancesLoaded.value) loadBalances()
  if (tabId === 'transactions' && !transactionsLoaded.value) loadAllTransactions()
}

function goToTransactionsPage(page) {
  if (page >= 1 && page <= transactionsLastPage.value) {
    transactionsPage.value = page
    loadAllTransactions()
  }
}

function getTransactionsPageNumbers() {
  const current = transactionsPage.value
  const last = transactionsLastPage.value
  const pages = []
  if (current <= 3) {
    for (let i = 1; i <= Math.min(5, last); i++) pages.push(i)
  } else if (current >= last - 2) {
    for (let i = Math.max(1, last - 4); i <= last; i++) pages.push(i)
  } else {
    for (let i = current - 2; i <= current + 2; i++) pages.push(i)
  }
  return pages
}

function openAdjustModal(row) {
  adjustUser.value = row
  adjustForm.value = { pointsSign: '+', pointsAmount: 0 }
  adjustError.value = ''
  showAdjustModal.value = true
}

function closeAdjustModal() {
  showAdjustModal.value = false
  adjustUser.value = null
  adjustForm.value = { pointsSign: '+', pointsAmount: 0 }
  adjustError.value = ''
}

async function submitAdjust() {
  const user = adjustUser.value
  const uid = user?.user?.id ?? user?.user_id ?? user?.id
  if (!uid) return
  adjusting.value = true
  adjustError.value = ''
  try {
    const amount = Math.abs(Number(adjustForm.value.pointsAmount) || 0)
    const sign = adjustForm.value.pointsSign === '-' ? -1 : 1
    const points = sign * amount
    await userPointBalancesApi.adjust(uid, {
      points,
      description: 'Admin adjustment'
    })
    showSuccess.value = true
    successMessage.value = 'Balance updated successfully.'
    setTimeout(() => { showSuccess.value = false }, 3000)
    closeAdjustModal()
    loadBalances()
    userTransactions.value[uid] = []
    loadUserTransactions(uid)
  } catch (e) {
    adjustError.value = e.response?.data?.message ?? e.message ?? 'Failed to adjust balance'
  } finally {
    adjusting.value = false
  }
}

function openRankModal(row) {
  rankModalUser.value = row
  rankModalPeriod.value = 'today'
  rankModalMonth.value = new Date().getMonth() + 1
  rankModalYear.value = new Date().getFullYear()
  rankModalData.value = null
  rankModalError.value = null
  showRankModal.value = true
  loadUserRankForModal()
}

function closeRankModal() {
  showRankModal.value = false
  rankModalUser.value = null
  rankModalData.value = null
  rankModalError.value = null
}

function setRankModalPeriod(period) {
  rankModalPeriod.value = period
  loadUserRankForModal()
}

async function loadUserRankForModal() {
  const user = rankModalUser.value
  const uid = user?.user?.id ?? user?.user_id ?? user?.id
  if (!uid) return
  rankModalLoading.value = true
  rankModalError.value = null
  try {
    const params = { period: rankModalPeriod.value }
    if (rankModalPeriod.value === 'month') {
      params.month = rankModalMonth.value
      params.year = rankModalYear.value
    }
    rankModalData.value = await ranksApi.userRank(uid, params)
  } catch (e) {
    rankModalError.value = e?.response?.data?.message ?? e?.message ?? 'Could not load rank'
    rankModalData.value = null
  } finally {
    rankModalLoading.value = false
  }
}

onMounted(() => {
  loadLevels()
  loadBalances()
  loadLeaderboardRanks()
  // Load users so we have avatar data (user_point_balances API may not include avatars)
  userStore.fetchUsers().catch(() => {})
})
</script>

<style scoped>
.points-section {
  width: 100%;
  max-width: 100%;
}

.points-section__header {
  margin-bottom: 1.5rem;
}

.points-section__title {
  font-size: 1.75rem;
  font-weight: 800;
  background: linear-gradient(135deg, #8b5cf6, #06b6d4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.25rem;
}

.points-section__subtitle {
  font-size: 0.9375rem;
  color: rgba(255, 255, 255, 0.7);
}

.points-section__toast {
  position: fixed;
  top: 90px;
  right: 1.5rem;
  z-index: 100;
  border-radius: 12px;
  padding: 0.75rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  animation: pointsSlideIn 0.3s ease;
}

.points-section__toast.success {
  background: rgba(34, 197, 94, 0.15);
  border: 1px solid rgba(34, 197, 94, 0.4);
}

.points-section__toast-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #86efac;
}

.points-section__tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.points-section__tab {
  padding: 0.75rem 1.25rem;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  border-radius: 8px 8px 0 0;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s ease;
}

.points-section__tab:hover {
  color: rgba(255, 255, 255, 0.9);
}

.points-section__tab.active {
  color: #8b5cf6;
  border-bottom-color: #8b5cf6;
  background: rgba(139, 92, 246, 0.1);
  font-weight: 600;
}

.points-section__filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.points-section__search {
  flex: 1;
  min-width: 200px;
}

.points-section__level-dropdown {
  min-width: 160px;
}

.points-section__loading,
.points-section__error,
.points-section__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
  text-align: center;
}

.points-section__spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(139, 92, 246, 0.3);
  border-top-color: #8b5cf6;
  border-radius: 50%;
  animation: pointsSpin 0.8s linear infinite;
}

@keyframes pointsSpin {
  to { transform: rotate(360deg); }
}

.points-section__loading-text,
.points-section__error-message,
.points-section__empty-message {
  color: rgba(255, 255, 255, 0.7);
  margin-top: 1rem;
}

.points-section__error-card {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 16px;
  padding: 2rem;
  max-width: 400px;
}

.points-section__error-title,
.points-section__empty-title {
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 0.5rem;
}

.points-section__action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
}

.points-section__action-btn.primary {
  background: linear-gradient(135deg, #8b5cf6, #06b6d4);
  border: none;
  color: white;
}

.points-section__action-btn.secondary {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.9);
}

.points-section__action-btn.small {
  padding: 0.375rem 0.75rem;
  font-size: 0.8125rem;
}

.points-section__table-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  overflow: hidden;
}

.points-section__table {
  width: 100%;
  border-collapse: collapse;
}

.points-section__table th,
.points-section__table td {
  padding: 0.875rem 1rem;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.points-section__table th {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(255, 255, 255, 0.5);
}

.points-section__row {
  cursor: pointer;
  transition: background 0.2s ease;
}

.points-section__row:hover {
  background: rgba(255, 255, 255, 0.03);
}

.points-section__user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.points-section__avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.4), rgba(6, 182, 212, 0.3));
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.8125rem;
  color: rgba(255, 255, 255, 0.95);
  overflow: hidden;
  flex-shrink: 0;
}

.points-section__avatar.has-image {
  background: transparent;
}

.points-section__avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.points-section__avatar--sm {
  width: 32px;
  height: 32px;
  font-size: 0.75rem;
}

.points-section__row-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.points-section__filter-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding: 0.75rem 1rem;
  background: rgba(139, 92, 246, 0.1);
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 12px;
}

.points-section__filter-label {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
}

.points-section__filter-user {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
}

.points-section__filter-clear {
  margin-left: auto;
  padding: 0.375rem 0.75rem;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.points-section__filter-clear:hover {
  background: rgba(255, 255, 255, 0.12);
}

.points-section__trans-card-user-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.points-section__trans-card-user-info {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.points-section__card-btn.secondary {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.9);
}

.points-section__card-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.12);
}

.points-section__balance-card-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.75rem;
}

.points-section__user-details {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.points-section__user-name {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
}

.points-section__user-meta {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
}

.points-section__expand-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: rgba(255, 255, 255, 0.5);
  transition: transform 0.25s ease;
}

.points-section__expand-icon.expanded {
  transform: rotate(180deg);
}

.points-section__level-badge {
  display: inline-block;
  padding: 0.25rem 0.625rem;
  background: rgba(139, 92, 246, 0.2);
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #c084fc;
}

.points-section__rank-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background: rgba(6, 182, 212, 0.2);
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 700;
  color: #22d3ee;
}

.points-section__rank-badge--card {
  margin-right: 0.375rem;
}

.points-section__points-value {
  font-weight: 700;
  color: #34d399;
}

.points-section__expanded-cell {
  padding: 0 !important;
  background: rgba(0, 0, 0, 0.2);
}

.points-section__expanded-section {
  padding: 1.25rem 1rem;
}

.points-section__expanded-title {
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: rgba(255, 255, 255, 0.9);
}

.points-section__trans-loading,
.points-section__trans-empty {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.5);
}

.points-section__trans-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.points-section__trans-item {
  display: grid;
  grid-template-columns: 140px 120px 80px 1fr;
  gap: 1rem;
  font-size: 0.8125rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.points-section__trans-item--compact {
  grid-template-columns: 1fr auto auto 1fr;
}

.points-section__trans-type { font-weight: 500; }
.points-section__trans-type.type-play { color: #34d399; }
.points-section__trans-type.type-product { color: #60a5fa; }
.points-section__trans-type.type-refund { color: #f59e0b; }
.points-section__trans-type.type-adjust { color: #a78bfa; }
.points-section__trans-type.type-redeem { color: #f472b6; }
.points-section__trans-type.type-expiry { color: #94a3b8; }

.points-section__trans-points.earned { color: #34d399; }
.points-section__trans-points.spent { color: #f87171; }

.points-section__trans-desc {
  color: rgba(255, 255, 255, 0.6);
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Balance cards (Users tab - mobile) */
.points-section__balance-cards {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.points-section__balance-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  margin-bottom: 10px;
}

.points-section__balance-card:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(139, 92, 246, 0.2);
  box-shadow: 0 4px 16px rgba(139, 92, 246, 0.1);
}

.points-section__balance-card-main {
  padding: 1.25rem;
}

.points-section__balance-card-header {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  margin-bottom: 0.75rem;
}

.points-section__balance-card-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.points-section__balance-card-name {
  width: 100%;
  font-size: 1rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  margin: 0 0 0.25rem 0;
}

.points-section__balance-card-actions {
  margin-top: 0.75rem;
}

.points-section__card-btn {
  padding: 0.5rem 1rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.points-section__card-btn.primary {
  background: rgba(139, 92, 246, 0.2);
  border: 1px solid rgba(139, 92, 246, 0.4);
  color: #c4b5fd;
}

.points-section__card-btn.primary:hover {
  background: rgba(139, 92, 246, 0.3);
}

.points-section__balance-card-expanded {
  padding: 0 1.25rem 1.25rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

/* Transaction cards (All Transactions tab - mobile) */
.points-section__trans-cards {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.points-section__trans-card {
  padding: 1.25rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  transition: all 0.3s ease;
}

.points-section__trans-card:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(139, 92, 246, 0.2);
  box-shadow: 0 4px 16px rgba(139, 92, 246, 0.1);
}

.points-section__trans-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.points-section__trans-card-header .badge {
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
}

.points-section__trans-card-user {
  font-size: 1rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  margin: 0 0 0.25rem 0;
}

.points-section__trans-card-desc {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 0.5rem 0;
}

.points-section__trans-card-date {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.45);
}

/* Modal */
.points-section__modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.points-section__modal {
  background: rgba(15, 15, 23, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  width: 100%;
  max-width: 400px;
  padding: 1.5rem;
}

.points-section__modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.points-section__modal-header h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
}

.points-section__modal-close {
  width: 36px;
  height: 36px;
  border: none;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.5rem;
  cursor: pointer;
  line-height: 1;
}

.points-section__modal-user {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 1rem;
}

.points-section__form-group {
  margin-bottom: 1rem;
}

.points-section__form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 0.375rem;
}

.points-section__form-input {
  width: 100%;
  padding: 0.625rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.95);
  font-size: 0.9375rem;
}

.points-section__points-input-wrap {
  display: flex;
  gap: 0.75rem;
  align-items: stretch;
}

.points-section__points-amount {
  flex: 7;
  min-width: 0;
}

.points-section__points-sign-dropdown {
  flex: 3;
  min-width: 0;
}

/* When selected, show only the sign (+/−), hide the arrow */
.points-section__points-sign-dropdown:deep(.has-selection .dropdown-arrow) {
  display: none;
}

.points-section__form-error {
  font-size: 0.875rem;
  color: #f87171;
  margin-bottom: 1rem;
}

.points-section__modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1.25rem;
}

.points-section__spinner--sm {
  width: 28px;
  height: 28px;
  border-width: 2px;
}

/* Rank modal */
.points-section__modal--rank .points-section__modal-header {
  margin-bottom: 1rem;
}

.points-section__rank-modal-body {
  padding: 0;
}

.points-section__rank-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding: 4px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.points-section__rank-tab {
  flex: 1;
  min-width: 0;
  padding: 0.6rem 0.5rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: color 0.2s ease, background 0.2s ease;
}

.points-section__rank-tab:hover {
  color: rgba(255, 255, 255, 0.9);
}

.points-section__rank-tab.active {
  color: #22d3ee;
  background: rgba(6, 182, 212, 0.15);
}

.points-section__rank-picker {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.points-section__rank-select {
  flex: 1;
  min-width: 0;
  padding: 0.6rem 1rem;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.95);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.6)' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  padding-right: 2rem;
}

.points-section__rank-modal-loading {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.points-section__rank-modal-error {
  margin: 0 0 1rem;
  padding: 0.75rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.25);
  border-radius: 10px;
  color: #fca5a5;
  font-size: 0.9rem;
}

.points-section__rank-modal-result {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.5rem 1rem;
  margin-bottom: 1rem;
}

.points-section__rank-modal-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: #22d3ee;
}

.points-section__rank-modal-points {
  font-size: 0.95rem;
  color: #34d399;
}

.points-section__rank-modal-message {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.7);
}

@media (max-width: 768px) {
  .desktop-only { display: none !important; }
  .mobile-only { display: block; }
  .points-section__trans-item {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 769px) {
  .desktop-only { display: block; }
  .mobile-only { display: none !important; }
}

@keyframes pointsSlideIn {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}
</style>
