# Component Styling Guide

This document explains the unified component styling system that ensures consistency across all pages in the application.

## Overview

The `components.css` file contains a comprehensive set of reusable component styles that provide:

- **Consistent appearance** across all pages (site, dashboard, auth, etc.)
- **Responsive design** that works on all devices
- **Dark mode support** with automatic detection
- **Accessibility features** including high contrast mode
- **Modern design system** with CSS custom properties

## CSS Custom Properties

The system uses CSS custom properties (variables) for consistent theming:

```css
:root {
  --primary-color: #8b5cf6;
  --primary-hover: #7c3aed;
  --success-color: #10b981;
  --error-color: #ef4444;
  --warning-color: #f59e0b;
  /* ... and many more */
}
```

## Form Components

### Basic Form Structure

```html
<form class="form-container">
  <div class="form-field">
    <label class="field-label">
      <svg class="label-icon">...</svg>
      Label Text
    </label>
    <input type="text" class="form-input" placeholder="Placeholder text">
  </div>
</form>
```

### Available Form Classes

- **Form Containers**: `.form-container`, `.auth-form`, `.user-form`, `.dashboard-form`, `.site-form`
- **Form Cards**: `.form-card` (with gradient top border and glass effect)
- **Form Fields**: `.form-field`, `.form-group`
- **Form Rows**: `.form-row` (2-column grid layout)
- **Labels**: `.field-label`, `.form-label` (with icon support)
- **Inputs**: `.form-input`, `.form-select` (or use standard HTML elements)

### Input Types Supported

All these input types get consistent styling automatically:
- `input[type="text"]`
- `input[type="email"]`
- `input[type="password"]`
- `input[type="number"]`
- `input[type="tel"]`
- `input[type="url"]`
- `input[type="date"]`
- `textarea`
- `select`

### Input States

- **Focus**: Automatic purple glow and subtle lift effect
- **Hover**: Subtle border and background changes
- **Error**: `.error` class - red border and background tint
- **Success**: `.success` class - green border and background tint

## Button Components

### Basic Button Usage

```html
<button class="btn btn-primary">Primary Button</button>
<button class="btn btn-secondary">Secondary Button</button>
<button class="btn btn-outline">Outline Button</button>
<button class="btn btn-ghost">Ghost Button</button>
```

### Button Variants

- **Primary**: `.btn-primary` or `.btn.primary` - Purple gradient
- **Secondary**: `.btn-secondary` - Gray background
- **Outline**: `.btn-outline` - Transparent with colored border
- **Ghost**: `.btn-ghost` - Transparent background
- **Danger**: `.btn-danger` - Red gradient
- **Success**: `.btn-success` - Green gradient

### Button Sizes

- **Small**: `.btn-sm` - Compact padding
- **Default**: Standard size
- **Large**: `.btn-lg` - Larger padding
- **Extra Large**: `.btn-xl` - Maximum padding

### Button States

- **Disabled**: Add `disabled` attribute or `.disabled` class
- **Loading**: Add `.loading` class (shows spinning animation)

## Alert Components

### Alert Usage

```html
<div class="alert alert-success">
  <div class="alert-icon">
    <svg>...</svg>
  </div>
  <span class="alert-message">Success message here</span>
</div>
```

### Alert Types

- **Success**: `.alert-success` - Green theme
- **Error**: `.alert-error` - Red theme  
- **Warning**: `.alert-warning` - Yellow theme
- **Info**: `.alert-info` - Blue theme

### Legacy Alert Classes

The system also supports existing alert classes:
- `.error-alert`, `.success-alert`, `.warning-alert`, `.info-alert`
- `.dashboard-alert-success`, `.dashboard-alert-error`
- `.site-alert-success`, `.site-alert-error`

## Card Components

### Basic Card Structure

```html
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Card Title</h3>
    <p class="card-subtitle">Optional subtitle</p>
  </div>
  <div class="card-body">
    Card content goes here
  </div>
  <div class="card-footer">
    <button class="btn btn-primary">Action</button>
  </div>
</div>
```

## Migration from Existing Styles

### Automatic Compatibility

The new system is designed to work with existing class names:

#### Forms
- `.site-form-input` → Works with unified input styles
- `.dashboard-form-input` → Works with unified input styles
- `.site-form-label` → Works with unified label styles
- `.dashboard-form-label` → Works with unified label styles

#### Buttons
- `.dashboard-btn` → Works with unified button styles
- `.action-btn` → Works with unified button styles

#### Alerts
- `.dashboard-alert` → Works with unified alert styles
- `.site-alert` → Works with unified alert styles

### Recommended Migration Steps

1. **Phase 1**: Update imports (already done)
   - The `components.css` is now imported in `main.css`
   - All existing styles continue to work

2. **Phase 2**: Gradually adopt new classes
   - Replace specific classes with generic ones
   - Example: Change `.dashboard-form-input` to `.form-input`

3. **Phase 3**: Clean up (optional)
   - Remove redundant styles from component files
   - Consolidate similar classes

## Best Practices

### 1. Use Semantic Class Names
```html
<!-- Good -->
<button class="btn btn-primary">Save Changes</button>

<!-- Also Good -->
<button class="btn primary">Save Changes</button>
```

### 2. Combine with Layout Classes
```html
<div class="form-container">
  <div class="form-card">
    <div class="form-header">
      <h2 class="form-title">Login Form</h2>
    </div>
    <!-- form fields -->
  </div>
</div>
```

### 3. Use State Classes When Needed
```html
<input class="form-input error" v-model="email">
<input class="form-input success" v-model="validatedField">
```

### 4. Leverage CSS Custom Properties
```css
/* In component-specific styles */
.special-button {
  background: var(--primary-color);
  border-radius: var(--border-radius-md);
  transition: all var(--transition-base);
}
```

## Responsive Design

The system includes built-in responsive breakpoints:

- **Mobile** (≤480px): Font size adjustments, full-width layouts
- **Tablet** (≤768px): Single-column forms, adjusted padding
- **Desktop** (>768px): Multi-column layouts, hover effects

## Dark Mode & Accessibility

### Dark Mode
- Automatically detects `prefers-color-scheme: dark`
- Adjusts colors, backgrounds, and borders
- Maintains contrast ratios

### High Contrast Mode
- Responds to `prefers-contrast: high`
- Increases border widths and color contrast
- Ensures accessibility compliance

### Focus Management
- Clear focus indicators on all interactive elements
- Keyboard navigation support
- Screen reader friendly markup

## Customization

### Overriding Colors
```css
:root {
  --primary-color: #your-brand-color;
  --primary-hover: #darker-brand-color;
}
```

### Adding Custom Variants
```css
.btn-brand {
  background: linear-gradient(135deg, var(--primary-color) 0%, #custom-color 100%);
}
```

## Examples

### Complete Login Form
```html
<div class="form-container">
  <div class="form-card">
    <div class="form-header">
      <h2 class="form-title">Welcome Back</h2>
      <p class="form-subtitle">Sign in to your account</p>
    </div>
    
    <form>
      <div class="form-field">
        <label class="field-label">
          <svg class="label-icon"><!-- email icon --></svg>
          Email Address
        </label>
        <input type="email" class="form-input" placeholder="Enter your email">
      </div>
      
      <div class="form-field">
        <label class="field-label">
          <svg class="label-icon"><!-- password icon --></svg>
          Password
        </label>
        <input type="password" class="form-input" placeholder="Enter your password">
      </div>
      
      <button type="submit" class="btn btn-primary" style="width: 100%;">
        Sign In
      </button>
    </form>
  </div>
</div>
```

### Dashboard Card with Actions
```html
<div class="card">
  <div class="card-header">
    <h3 class="card-title">User Statistics</h3>
    <p class="card-subtitle">Overview of user activity</p>
  </div>
  <div class="card-body">
    <!-- stats content -->
  </div>
  <div class="card-footer">
    <button class="btn btn-ghost">Cancel</button>
    <button class="btn btn-primary">View Details</button>
  </div>
</div>
```

This unified system ensures that all components look consistent across your entire application while maintaining flexibility for customization and future updates.