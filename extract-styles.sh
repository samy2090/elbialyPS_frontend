#!/bin/bash

# Style Extraction Automation Script
# This script helps automate the process of moving styles from Vue components to CSS files

echo "Style Extraction Helper Script"
echo "=============================="

# Function to extract styles from a Vue file
extract_styles() {
    local vue_file="$1"
    local css_file="$2"
    local prefix="$3"
    
    echo "Processing: $vue_file"
    echo "Target CSS: $css_file"
    echo "Prefix: $prefix"
    echo ""
    
    # Check if the Vue file has styles
    if grep -q "<style" "$vue_file"; then
        echo "✅ Found styles in $vue_file"
        echo "📝 Manual extraction required:"
        echo "   1. Read styles from $vue_file"
        echo "   2. Add to $css_file with prefix '$prefix-'"
        echo "   3. Update template class names"
        echo "   4. Remove <style> block"
        echo ""
    else
        echo "❌ No styles found in $vue_file"
        echo ""
    fi
}

# Site components
echo "=== SITE COMPONENTS ==="
extract_styles "src/views/site/AboutView.vue" "src/assets/site.css" "site-about"
extract_styles "src/views/site/auth/LoginView.vue" "src/assets/site.css" "site-login"
extract_styles "src/views/site/auth/RegisterView.vue" "src/assets/site.css" "site-register"
extract_styles "src/views/site/auth/ForgotPasswordView.vue" "src/assets/site.css" "site-forgot"

echo "=== DASHBOARD COMPONENTS ==="
extract_styles "src/components/dashboard/layout/DesktopSidebar.vue" "src/assets/dashboard.css" "dashboard-sidebar"
extract_styles "src/components/dashboard/layout/MobileBottomNav.vue" "src/assets/dashboard.css" "dashboard-mobile"
extract_styles "src/components/dashboard/sections/HomeSection.vue" "src/assets/dashboard.css" "dashboard-home"
extract_styles "src/components/dashboard/sections/ExploreSection.vue" "src/assets/dashboard.css" "dashboard-explore"
extract_styles "src/components/dashboard/sections/ProfileSection.vue" "src/assets/dashboard.css" "dashboard-profile"
extract_styles "src/components/dashboard/sections/SettingsSection.vue" "src/assets/dashboard.css" "dashboard-settings"
extract_styles "src/components/dashboard/sections/UsersSection.vue" "src/assets/dashboard.css" "dashboard-users"
extract_styles "src/components/dashboard/users/UserForm.vue" "src/assets/dashboard.css" "dashboard-user-form"

echo "=== DASHBOARD VIEWS ==="
extract_styles "src/views/dashboard/DashboardView.vue" "src/assets/dashboard.css" "dashboard-view"
extract_styles "src/views/dashboard/EntertainmentDashboard.vue" "src/assets/dashboard.css" "dashboard-entertainment"
extract_styles "src/views/dashboard/Users/UserListView.vue" "src/assets/dashboard.css" "dashboard-user-list"
extract_styles "src/views/dashboard/Users/UserDetailView.vue" "src/assets/dashboard.css" "dashboard-user-detail"
extract_styles "src/views/dashboard/Users/UserEditView.vue" "src/assets/dashboard.css" "dashboard-user-edit"

echo "=== BASE COMPONENTS ==="
extract_styles "src/components/base/ui/LoadingSpinner.vue" "src/assets/main.css" "loading-spinner"

echo ""
echo "🎉 Style extraction planning complete!"
echo "📋 Next steps:"
echo "   1. Follow the guide above for each file"
echo "   2. Use the style-extraction-guide.md for detailed instructions"
echo "   3. Test each component after extraction"
echo "   4. Ensure all <style> blocks are removed"