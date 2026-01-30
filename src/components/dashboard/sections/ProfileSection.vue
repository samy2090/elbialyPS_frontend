<template>
  <div class="profile-content">
    <!-- Loading -->
    <div v-if="authStore.loading && !authStore.user" class="profile-loading">
      <div class="loading-spinner"></div>
      <p>Loading profile...</p>
    </div>

    <!-- Not logged in -->
    <div v-else-if="!authStore.user" class="profile-empty">
      <p>Please log in to view your profile.</p>
    </div>

    <template v-else>
      <div class="profile-header">
        <div class="profile-avatar-wrap">
          <div class="profile-avatar">
            <img :src="profileData.avatar" :alt="profileData.name" />
          </div>
          <button
            type="button"
            class="edit-avatar-btn"
            @click="showAvatarPicker = true"
            :disabled="avatarUpdating"
            title="Change avatar"
            aria-label="Change avatar"
          >
            <span v-if="avatarUpdating" class="avatar-updating-spinner"></span>
            <svg v-else class="edit-avatar-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        <div class="profile-info">
          <h1 class="profile-name">{{ profileData.name }}</h1>
          <p class="profile-email">{{ profileData.email }}</p>
          <p v-if="profileData.role" class="profile-role">{{ profileData.role }}</p>
          <button
            v-if="!isEditing"
            class="edit-profile-btn"
            @click="startEditing"
          >
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Edit profile
          </button>
        </div>
      </div>

      <!-- Error message -->
      <div v-if="errorMessage" class="profile-error">
        <span>{{ errorMessage }}</span>
        <button type="button" class="dismiss-btn" @click="errorMessage = ''" aria-label="Dismiss">×</button>
      </div>

      <!-- Edit form -->
      <div v-if="isEditing" class="profile-edit-card">
        <h2 class="edit-title">Update your profile</h2>
        <form @submit.prevent="handleSave" class="profile-edit-form">
          <div class="form-field">
            <label class="field-label">Full name</label>
            <input
              v-model="form.name"
              type="text"
              class="form-input"
              placeholder="Your name"
              required
            />
          </div>
          <div class="form-field">
            <label class="field-label">Email</label>
            <input
              v-model="form.email"
              type="email"
              class="form-input"
              placeholder="your@email.com"
              required
            />
          </div>
          <div class="form-field">
            <label class="field-label">Phone <span class="optional">(optional)</span></label>
            <input
              v-model="form.phone"
              type="tel"
              class="form-input"
              placeholder="Phone number"
            />
          </div>
          <div class="form-field">
            <label class="field-label">New password <span class="optional">(leave blank to keep)</span></label>
            <input
              v-model="form.password"
              type="password"
              class="form-input"
              placeholder="New password"
              autocomplete="new-password"
            />
          </div>
          <div v-if="form.password" class="form-field">
            <label class="field-label">Confirm new password</label>
            <input
              v-model="form.password_confirmation"
              type="password"
              class="form-input"
              placeholder="Confirm new password"
              autocomplete="new-password"
            />
          </div>
          <div class="form-actions">
            <button
              type="button"
              class="btn-cancel"
              @click="cancelEditing"
              :disabled="saving"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="btn-save"
              :disabled="saving"
            >
              <span v-if="saving">Saving...</span>
              <span v-else>Save changes</span>
            </button>
          </div>
        </form>
      </div>

      <!-- Avatar picker modal: list from GET /api/users/options/dropdown -->
      <AvatarPicker
        v-model="showAvatarPicker"
        title="Change avatar"
        :current-avatar="profileData.rawAvatar"
        :resolve-url="resolveProfileAvatarUrl"
        :available-avatars="avatarOptions"
        :allow-upload="true"
        :max-size-m-b="2"
        @close="showAvatarPicker = false"
        @select="onAvatarSelect"
      />
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/userStore'
import UserService from '@/api/users.js'
import { getUserRole } from '@/utils/roleHelpers'
import { resolveBackendImageUrl } from '@/utils/helpers'
import AvatarPicker from '@/components/base/ui/AvatarPicker.vue'

const authStore = useAuthStore()
const userStore = useUserStore()
const isEditing = ref(false)
const saving = ref(false)
const errorMessage = ref('')
const showAvatarPicker = ref(false)
const avatarUpdating = ref(false)

const avatarOptions = computed(() => userStore.avatar_options || [])

function resolveProfileAvatarUrl(path) {
  if (!path) return ''
  const opt = userStore.avatar_options?.find((a) => a.path === path)
  return (opt && opt.url) || resolveBackendImageUrl(path) || path
}

const form = ref({
  name: '',
  email: '',
  phone: '',
  password: '',
  password_confirmation: ''
})

const profileData = computed(() => {
  const u = authStore.user
  if (!u) {
    return { name: '', email: '', avatar: '', rawAvatar: '', role: '' }
  }
  const name = u.name ?? u.full_name ?? ''
  const email = u.email ?? ''
  const initials = name
    ? name.split(/\s+/).map(s => s[0]).slice(0, 2).join('').toUpperCase()
    : (email ? email[0].toUpperCase() : '?')
  const rawAvatar = u.avatar ?? u.profile_image ?? u.photo_url ?? u.profile_photo_url
  const avatar = resolveBackendImageUrl(rawAvatar) ?? `https://via.placeholder.com/120x120/8b5cf6/ffffff?text=${encodeURIComponent(initials)}`
  const role = getUserRole(u)
  return { name, email, avatar, rawAvatar, role }
})

function resetForm() {
  const u = authStore.user
  form.value = {
    name: u?.name ?? u?.full_name ?? '',
    email: u?.email ?? '',
    phone: u?.phone ?? u?.phone_number ?? '',
    password: '',
    password_confirmation: ''
  }
}

function startEditing() {
  resetForm()
  authStore.clearError()
  errorMessage.value = ''
  isEditing.value = true
}

function cancelEditing() {
  isEditing.value = false
  errorMessage.value = ''
}

async function handleSave() {
  if (form.value.password && form.value.password !== form.value.password_confirmation) {
    errorMessage.value = 'Passwords do not match.'
    return
  }
  saving.value = true
  errorMessage.value = ''
  authStore.clearError()
  try {
    const payload = {
      name: form.value.name,
      email: form.value.email
    }
    if (form.value.phone !== undefined && form.value.phone !== null) {
      payload.phone = form.value.phone
    }
    if (form.value.password && form.value.password.trim()) {
      payload.password = form.value.password
      payload.password_confirmation = form.value.password_confirmation
    }
    const res = await UserService.updateUser(authStore.user.id, payload)
    const updated = res?.user ?? res?.data ?? res
    if (updated) {
      authStore.updateCurrentUser(updated)
    } else {
      await authStore.fetchUser()
    }
    isEditing.value = false
  } catch (err) {
    errorMessage.value = err.message || 'Failed to update profile.'
  } finally {
    saving.value = false
  }
}

async function onAvatarSelect(payload) {
  avatarUpdating.value = true
  errorMessage.value = ''
  try {
    if (payload.type === 'preset') {
      const res = await UserService.updateUser(authStore.user.id, { avatar: payload.path })
      const updated = res?.user ?? res?.data ?? res
      if (updated) authStore.updateCurrentUser(updated)
      else await authStore.fetchUser()
    } else if (payload.type === 'upload' && payload.file) {
      const res = await UserService.updateUser(authStore.user.id, { avatar: payload.file })
      const updated = res?.user ?? res?.data ?? res
      if (updated) authStore.updateCurrentUser(updated)
      else await authStore.fetchUser()
    }
  } catch (err) {
    errorMessage.value = err.message || 'Failed to update avatar.'
  } finally {
    avatarUpdating.value = false
  }
}

watch(() => authStore.user, (user) => {
  if (user && isEditing.value) {
    resetForm()
  }
}, { immediate: false })

onMounted(() => {
  if (authStore.user?.id) {
    authStore.fetchUser()
  }
  userStore.fetchUserOptions().catch(() => {})
})
</script>

<style scoped>
.profile-content {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.profile-loading,
.profile-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  gap: 1rem;
  color: rgba(255, 255, 255, 0.7);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #8b5cf6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.profile-header {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  align-items: flex-start;
}

.profile-avatar-wrap {
  position: relative;
  flex-shrink: 0;
}

.profile-avatar {
  display: block;
}

.profile-avatar img {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 3px solid rgba(139, 92, 246, 0.3);
  object-fit: cover;
}

.edit-avatar-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%);
  border: 2px solid rgba(15, 15, 23, 0.9);
  border-radius: 50%;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(139, 92, 246, 0.4);
}

.edit-avatar-btn:hover:not(:disabled) {
  transform: scale(1.1);
  box-shadow: 0 0 24px rgba(139, 92, 246, 0.5);
}

.edit-avatar-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.edit-avatar-icon {
  width: 1rem;
  height: 1rem;
  position: relative;
  z-index: 1;
}

.avatar-updating-spinner {
  position: absolute;
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.profile-info {
  flex: 1;
}

.profile-name {
  font-size: 2rem;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 0.5rem;
}

.profile-email {
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 0.25rem;
}

.profile-role {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.edit-profile-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: #8b5cf6;
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.edit-profile-btn:hover {
  background: #7c3aed;
  transform: translateY(-1px);
}

.btn-icon {
  width: 1.125rem;
  height: 1.125rem;
}

.profile-error {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  margin-bottom: 1.5rem;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.4);
  border-radius: 12px;
  color: #fca5a5;
}

.profile-error .dismiss-btn {
  background: none;
  border: none;
  color: inherit;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0 0.25rem;
  line-height: 1;
}

.profile-edit-card {
  padding: 2rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  margin-top: 1rem;
}

.edit-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 1.5rem 0;
}

.profile-edit-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  max-width: 420px;
}

.profile-edit-form .form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.profile-edit-form .field-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
}

.profile-edit-form .optional {
  font-weight: 400;
  color: rgba(255, 255, 255, 0.5);
}

.profile-edit-form .form-input {
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
}

.profile-edit-form .form-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.profile-edit-form .form-input:focus {
  outline: none;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2);
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

.btn-cancel,
.btn-save {
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancel {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.8);
}

.btn-cancel:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.12);
}

.btn-save {
  background: #8b5cf6;
  border: none;
  color: white;
}

.btn-save:hover:not(:disabled) {
  background: #7c3aed;
  transform: translateY(-1px);
}

.btn-cancel:disabled,
.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

@media (max-width: 768px) {
  .profile-content {
    padding: 0 0.5rem;
  }

  .profile-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .profile-edit-card {
    padding: 1.25rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn-cancel,
  .btn-save {
    width: 100%;
  }
}
</style>
