# Style Extraction Guide

This guide provides the comprehensive approach to move all embedded styles from Vue components to the appropriate CSS files.

## Files Processed
✅ **Completed:**
- `src/components/site/layout/Navbar.vue` → `site.css` (site-navbar-*)
- `src/components/site/auth/AuthStatus.vue` → `site.css` (site-auth-*)
- `src/views/site/HomeView.vue` → `site.css` (site-home-*)

## Remaining Site Components

### Site Views to Process:
1. `src/views/site/AboutView.vue` → Extract to `site.css` with prefix `site-about-`
2. `src/views/site/auth/LoginView.vue` → Extract to `site.css` with prefix `site-login-`
3. `src/views/site/auth/RegisterView.vue` → Extract to `site.css` with prefix `site-register-`
4. `src/views/site/auth/ForgotPasswordView.vue` → Extract to `site.css` with prefix `site-forgot-`

### Dashboard Components to Process:
1. `src/components/dashboard/layout/DashboardNavbar.vue` → Extract to `dashboard.css` with prefix `dashboard-navbar-`
2. `src/components/dashboard/layout/DesktopSidebar.vue` → Extract to `dashboard.css` with prefix `dashboard-sidebar-`
3. `src/components/dashboard/layout/MobileBottomNav.vue` → Extract to `dashboard.css` with prefix `dashboard-mobile-`
4. `src/components/dashboard/sections/HomeSection.vue` → Extract to `dashboard.css` with prefix `dashboard-home-`
5. `src/components/dashboard/sections/ExploreSection.vue` → Extract to `dashboard.css` with prefix `dashboard-explore-`
6. `src/components/dashboard/sections/ProfileSection.vue` → Extract to `dashboard.css` with prefix `dashboard-profile-`
7. `src/components/dashboard/sections/SettingsSection.vue` → Extract to `dashboard.css` with prefix `dashboard-settings-`
8. `src/components/dashboard/sections/UsersSection.vue` → Extract to `dashboard.css` with prefix `dashboard-users-`
9. `src/components/dashboard/users/UserForm.vue` → Extract to `dashboard.css` with prefix `dashboard-user-form-`

### Dashboard Views to Process:
1. `src/views/DashboardView.vue` → Extract to `dashboard.css` with prefix `dashboard-main-`
2. `src/views/dashboard/DashboardView.vue` → Extract to `dashboard.css` with prefix `dashboard-view-`
3. `src/views/dashboard/EntertainmentDashboard.vue` → Extract to `dashboard.css` with prefix `dashboard-entertainment-`
4. `src/views/dashboard/auth/DashboardView.vue` → Extract to `dashboard.css` with prefix `dashboard-auth-`
5. `src/views/dashboard/Users/UserListView.vue` → Extract to `dashboard.css` with prefix `dashboard-user-list-`
6. `src/views/dashboard/Users/UserDetailView.vue` → Extract to `dashboard.css` with prefix `dashboard-user-detail-`
7. `src/views/dashboard/Users/UserEditView.vue` → Extract to `dashboard.css` with prefix `dashboard-user-edit-`
8. `src/views/dashboard/Users/UserCreateView.vue` → Extract to `dashboard.css` with prefix `dashboard-user-create-`
9. `src/views/dashboard/Users/UserProfileView.vue` → Extract to `dashboard.css` with prefix `dashboard-user-profile-`

### Base Components:
1. `src/components/base/layout/Navbar.vue` → Extract to `site.css` with prefix `base-navbar-`
2. `src/components/base/layout/Sidebar.vue` → Extract to `site.css` with prefix `base-sidebar-`
3. `src/components/base/ui/LoadingSpinner.vue` → Extract to `main.css` with prefix `loading-spinner-`

### App.vue:
1. `src/App.vue` → Determine if styles are global (main.css) or specific (site.css/dashboard.css)

## Process for Each File:

### Step 1: Read the styles
```bash
# Find the <style> section in each .vue file
```

### Step 2: Extract styles with new class names
```css
/* Example transformation from HomeSection.vue */
.section-container → .dashboard-home-section-container
.content-grid → .dashboard-home-content-grid
.card → .dashboard-home-card
```

### Step 3: Update the template
```vue
<!-- Change class names in template -->
<div class="section-container"> → <div class="dashboard-home-section-container">
```

### Step 4: Remove the <style> block
```vue
<!-- Remove entire <style scoped> ... </style> section -->
```

## CSS File Organization:

### site.css
- All site-related components and views
- Public-facing pages
- Authentication pages
- Navigation components used on site

### dashboard.css  
- All dashboard-related components and views
- Admin/user dashboard
- Dashboard navigation
- Dashboard sections and forms

### main.css
- Global base components (LoadingSpinner)
- Global utilities
- CSS variables and root styles

## Naming Convention:
- **Site components**: `site-[component-name]-[element]`
- **Dashboard components**: `dashboard-[component-name]-[element]`  
- **Base components**: `base-[component-name]-[element]`
- **Global utilities**: Keep existing names or use descriptive names

## Verification:
After each file transformation:
1. Ensure template uses new class names
2. Verify styles are in correct CSS file
3. Check that <style> block is completely removed
4. Test the component still works correctly

## Current Progress:
- ✅ Site Navbar component
- ✅ Site AuthStatus component  
- ✅ Site HomeView
- 🔄 Dashboard Navbar (partially done)
- ❌ Remaining 25+ files

## Quick Commands:
```bash
# Find all Vue files with <style> blocks
grep -r "<style" src/ --include="*.vue"

# Count remaining files to process
grep -r "<style" src/ --include="*.vue" | wc -l
```