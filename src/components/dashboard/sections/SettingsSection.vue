<template>
  <div class="settings-content">
    <div class="settings-header">
      <h1 class="settings-title">Settings</h1>
      <p class="settings-subtitle">Customize your dashboard experience</p>
    </div>

    <div class="settings-grid">
      <!-- Display Settings -->
      <div class="settings-section">
        <div class="section-header">
          <div class="section-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
              <path d="M8 21H16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 17V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h2 class="section-title">Display</h2>
        </div>
        
        <div class="settings-items">
          <div class="setting-item">
            <div class="setting-info">
              <label class="setting-label">Theme</label>
              <p class="setting-description">Choose your preferred color scheme</p>
            </div>
            <select v-model="displaySettings.theme" class="setting-control">
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="auto">Auto</option>
            </select>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <label class="setting-label">Language</label>
              <p class="setting-description">Select your preferred language</p>
            </div>
            <select v-model="displaySettings.language" class="setting-control">
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
            </select>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <label class="setting-label">Animations</label>
              <p class="setting-description">Enable smooth transitions and effects</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" v-model="displaySettings.animations" />
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      <!-- Playback Settings -->
      <div class="settings-section">
        <div class="section-header">
          <div class="section-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polygon points="5,3 19,12 5,21" fill="currentColor"/>
            </svg>
          </div>
          <h2 class="section-title">Playback</h2>
        </div>
        
        <div class="settings-items">
          <div class="setting-item">
            <div class="setting-info">
              <label class="setting-label">Video Quality</label>
              <p class="setting-description">Default video quality for streaming</p>
            </div>
            <select v-model="playbackSettings.videoQuality" class="setting-control">
              <option value="auto">Auto</option>
              <option value="4k">4K Ultra HD</option>
              <option value="1080p">1080p Full HD</option>
              <option value="720p">720p HD</option>
              <option value="480p">480p</option>
            </select>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <label class="setting-label">Autoplay</label>
              <p class="setting-description">Automatically play next episode or recommended content</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" v-model="playbackSettings.autoplay" />
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <label class="setting-label">Skip Intro</label>
              <p class="setting-description">Automatically skip opening credits</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" v-model="playbackSettings.skipIntro" />
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <label class="setting-label">Volume</label>
              <p class="setting-description">Default volume level</p>
            </div>
            <div class="volume-control">
              <input 
                type="range" 
                v-model="playbackSettings.volume" 
                min="0" 
                max="100" 
                class="volume-slider"
              />
              <span class="volume-value">{{ playbackSettings.volume }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Notifications Settings -->
      <div class="settings-section">
        <div class="section-header">
          <div class="section-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 8A6 6 0 0 0 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M13.73 21A2 2 0 0 1 10.27 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h2 class="section-title">Notifications</h2>
        </div>
        
        <div class="settings-items">
          <div class="setting-item">
            <div class="setting-info">
              <label class="setting-label">Push Notifications</label>
              <p class="setting-description">Receive notifications about new content and updates</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" v-model="notificationSettings.pushNotifications" />
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <label class="setting-label">Email Notifications</label>
              <p class="setting-description">Get updates via email</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" v-model="notificationSettings.emailNotifications" />
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <label class="setting-label">New Releases</label>
              <p class="setting-description">Notify when new content is available</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" v-model="notificationSettings.newReleases" />
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <label class="setting-label">Recommendations</label>
              <p class="setting-description">Get personalized content suggestions</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" v-model="notificationSettings.recommendations" />
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      <!-- Privacy Settings -->
      <div class="settings-section">
        <div class="section-header">
          <div class="section-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
              <circle cx="12" cy="16" r="1" stroke="currentColor" stroke-width="2"/>
              <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <h2 class="section-title">Privacy</h2>
        </div>
        
        <div class="settings-items">
          <div class="setting-item">
            <div class="setting-info">
              <label class="setting-label">Public Profile</label>
              <p class="setting-description">Allow others to see your profile and activity</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" v-model="privacySettings.publicProfile" />
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <label class="setting-label">Share Watching Activity</label>
              <p class="setting-description">Let friends see what you're watching</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" v-model="privacySettings.shareActivity" />
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <label class="setting-label">Data Collection</label>
              <p class="setting-description">Allow collection of usage data for improvements</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" v-model="privacySettings.dataCollection" />
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      <!-- Account Settings -->
      <div class="settings-section">
        <div class="section-header">
          <div class="section-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <h2 class="section-title">Account</h2>
        </div>
        
        <div class="settings-items">
          <div class="setting-item action-item">
            <div class="setting-info">
              <label class="setting-label">Change Password</label>
              <p class="setting-description">Update your account password</p>
            </div>
            <button class="action-btn primary" @click="$emit('change-password')">
              Change
            </button>
          </div>

          <div class="setting-item action-item">
            <div class="setting-info">
              <label class="setting-label">Export Data</label>
              <p class="setting-description">Download your account data</p>
            </div>
            <button class="action-btn secondary" @click="$emit('export-data')">
              Export
            </button>
          </div>

          <div class="setting-item action-item">
            <div class="setting-info">
              <label class="setting-label">Two-Factor Authentication</label>
              <p class="setting-description">Add an extra layer of security</p>
            </div>
            <button class="action-btn secondary" @click="$emit('setup-2fa')">
              Setup
            </button>
          </div>

          <div class="setting-item action-item danger-zone">
            <div class="setting-info">
              <label class="setting-label">Delete Account</label>
              <p class="setting-description">Permanently delete your account and all data</p>
            </div>
            <button class="action-btn danger" @click="$emit('delete-account')">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="settings-footer">
      <button class="save-btn" @click="saveSettings">
        <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16L21 8V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M17 21V13H7V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M7 3V8H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Save Changes
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const displaySettings = ref({
  theme: 'dark',
  language: 'en',
  animations: true
})

const playbackSettings = ref({
  videoQuality: 'auto',
  autoplay: true,
  skipIntro: true,
  volume: 75
})

const notificationSettings = ref({
  pushNotifications: true,
  emailNotifications: false,
  newReleases: true,
  recommendations: true
})

const privacySettings = ref({
  publicProfile: true,
  shareActivity: false,
  dataCollection: true
})

const saveSettings = () => {
  console.log('Saving settings...', {
    display: displaySettings.value,
    playback: playbackSettings.value,
    notifications: notificationSettings.value,
    privacy: privacySettings.value
  })
  // Emit save event or call API
}

defineEmits(['change-password', 'export-data', 'setup-2fa', 'delete-account'])
</script>

<style scoped>
.settings-content {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.settings-header {
  text-align: center;
  margin-bottom: 3rem;
}

.settings-title {
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #8b5cf6, #06b6d4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1rem;
}

.settings-subtitle {
  font-size: 1.125rem;
  color: rgba(255, 255, 255, 0.7);
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.settings-section {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2rem;
  transition: all 0.3s ease;
}

.settings-section:hover {
  border-color: rgba(139, 92, 246, 0.2);
  box-shadow: 0 8px 32px rgba(139, 92, 246, 0.1);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.section-icon {
  width: 2.5rem;
  height: 2.5rem;
  color: #8b5cf6;
  filter: drop-shadow(0 0 8px rgba(139, 92, 246, 0.3));
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
}

.settings-items {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.action-item {
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.danger-zone {
  border-color: rgba(239, 68, 68, 0.2);
  background: rgba(239, 68, 68, 0.05);
}

.setting-info {
  flex: 1;
}

.setting-label {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 0.25rem;
  display: block;
}

.setting-description {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.4;
}

.setting-control {
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
}

.setting-control:focus {
  outline: none;
  border-color: rgba(139, 92, 246, 0.5);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 32px;
  cursor: pointer;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 32px;
  transition: 0.3s;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 24px;
  width: 24px;
  left: 4px;
  bottom: 4px;
  background: white;
  border-radius: 50%;
  transition: 0.3s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

input:checked + .toggle-slider {
  background: linear-gradient(135deg, #8b5cf6, #06b6d4);
}

input:checked + .toggle-slider:before {
  transform: translateX(28px);
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 160px;
}

.volume-slider {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  outline: none;
  cursor: pointer;
}

.volume-slider::-webkit-slider-thumb {
  appearance: none;
  width: 18px;
  height: 18px;
  background: linear-gradient(135deg, #8b5cf6, #06b6d4);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.volume-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  background: linear-gradient(135deg, #8b5cf6, #06b6d4);
  border-radius: 50%;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.volume-value {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 600;
  min-width: 40px;
  text-align: right;
}

.action-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid;
  font-size: 0.875rem;
}

.action-btn.primary {
  background: #8b5cf6;
  border-color: #8b5cf6;
  color: white;
}

.action-btn.primary:hover {
  background: #7c3aed;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.action-btn.secondary {
  background: transparent;
  border-color: rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.8);
}

.action-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.5);
  color: white;
}

.action-btn.danger {
  background: transparent;
  border-color: rgba(239, 68, 68, 0.5);
  color: #ef4444;
}

.action-btn.danger:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: #ef4444;
}

.settings-footer {
  text-align: center;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.save-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #8b5cf6, #06b6d4);
  border: none;
  border-radius: 16px;
  color: white;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(139, 92, 246, 0.3);
}

.save-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 30px rgba(139, 92, 246, 0.4);
}

.icon {
  width: 1.25rem;
  height: 1.25rem;
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .settings-content {
    padding: 1rem;
  }
  
  .settings-title {
    font-size: 2rem;
  }
  
  .settings-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .settings-section {
    padding: 1.5rem;
  }
  
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .action-item {
    flex-direction: row;
    align-items: center;
  }
  
  .setting-control,
  .volume-control,
  .toggle-switch {
    align-self: stretch;
  }
  
  .volume-control {
    min-width: auto;
  }
}

@media (max-width: 480px) {
  .settings-grid {
    grid-template-columns: 1fr;
  }
  
  .section-header {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }
}
</style>