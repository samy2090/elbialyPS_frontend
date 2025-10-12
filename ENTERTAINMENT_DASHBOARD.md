# Entertainment Dashboard

A responsive entertainment system UI that automatically adapts between mobile and desktop layouts, featuring a modern dark theme with creative accents.

## Features

### 🧭 Navigation Bar (Top)
- Clean, translucent navbar with blur effect
- Logo with gradient styling on the left
- Menu button and notification icon on the right
- Responsive design that adapts to screen size

### 📱 Mobile Layout
- Bottom tab navigation with icons and labels
- Four main sections: Home, Explore, Profile, Settings
- Touch-friendly spacing and rounded elements
- Full-screen content sections
- Modern entertainment vibe with gradients and neon effects

### 💻 Desktop Layout
- WhatsApp Web-style layout with sidebar and main content
- Collapsible sidebar on the left
- Main content area on the right
- Consistent dark theme with minimal aesthetic
- Smooth transitions and animations

### 🎨 Styling
- Dark theme with creative color accents (purple, teal, electric blue)
- Rounded corners and smooth transitions
- Glass morphism effects with backdrop blur
- Responsive grid system
- Custom scrollbars and focus styles

## Usage

### Accessing the Dashboard
1. Start the development server: `npm run dev`
2. Navigate to `http://localhost:5173/`
3. Log in to access authenticated routes
4. Click "Entertainment" in the navigation to access the dashboard

### Navigation
- **Mobile**: Use the bottom tab bar to switch between sections
- **Desktop**: Use the sidebar (click items or use the collapse button)
- **Notifications**: Click the bell icon in the top navbar

### Sections

#### Home
- Welcome message and featured content
- Quick actions (Downloads, Watchlist, Share, History)
- Content cards with hover effects and ratings

#### Explore
- Search functionality with filters
- Browse by categories (Movies, TV Series, Music, Documentaries)
- Trending content list with rankings

#### Profile
- User information and statistics
- Watchlist management
- Watch history with progress tracking
- User reviews and settings

#### Settings
- Display preferences (theme, language, animations)
- Playback settings (quality, autoplay, volume)
- Notification preferences
- Privacy controls
- Account management

## Responsive Breakpoints

- **Mobile**: < 768px
  - Bottom navigation
  - Single column layout
  - Touch-optimized spacing
  - Simplified interfaces

- **Tablet**: 768px - 1024px
  - Sidebar navigation
  - Two-column layouts
  - Adaptive content grids

- **Desktop**: > 1024px
  - Full sidebar navigation
  - Multi-column layouts
  - Enhanced interactions
  - Larger content cards

## Customization

### Theme Colors
The dashboard uses CSS custom properties defined in `entertainment-theme.css`:

```css
:root {
  --primary-purple: #8b5cf6;
  --primary-teal: #06b6d4;
  --primary-blue: #3b82f6;
  /* ... more variables */
}
```

### Adding New Sections
1. Create a new component in `src/components/sections/`
2. Import it in `EntertainmentDashboard.vue`
3. Add the section to the navigation arrays in both mobile and desktop components

### Modifying Layouts
- Mobile navigation: `src/components/MobileBottomNav.vue`
- Desktop sidebar: `src/components/DesktopSidebar.vue`
- Main layout: `src/views/EntertainmentDashboard.vue`

## Performance Features

- Lazy loading of route components
- Optimized images with placeholders
- Smooth animations with reduced motion support
- Efficient Vue 3 Composition API usage
- Minimal bundle size with tree shaking

## Accessibility

- Proper ARIA labels and roles
- Keyboard navigation support
- High contrast mode support
- Screen reader friendly
- Focus management
- Reduced motion preferences

## Browser Support

- Modern browsers with CSS Grid and Flexbox support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## File Structure

```
src/
├── components/
│   ├── EntertainmentNavbar.vue       # Top navigation bar
│   ├── MobileBottomNav.vue           # Mobile bottom tabs
│   ├── DesktopSidebar.vue           # Desktop sidebar
│   └── sections/
│       ├── HomeSection.vue          # Home content
│       ├── ExploreSection.vue       # Explore content
│       ├── ProfileSection.vue       # Profile content
│       └── SettingsSection.vue      # Settings content
├── views/
│   └── EntertainmentDashboard.vue   # Main dashboard layout
├── assets/
│   └── entertainment-theme.css      # Dark theme styles
└── router/
    └── index.js                     # Route configuration
```

## Development

To extend the dashboard:

1. **Add new features**: Create components in the appropriate sections
2. **Modify themes**: Update CSS custom properties in `entertainment-theme.css`
3. **Add animations**: Use the predefined animation classes or create new ones
4. **Test responsiveness**: Use browser dev tools to test different screen sizes

The dashboard is built with modern web technologies and follows Vue 3 best practices for maintainability and performance.