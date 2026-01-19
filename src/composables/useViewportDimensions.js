import { ref, onMounted, onUnmounted } from 'vue'

/**
 * Composable to track viewport dimensions and navbar/bottom nav heights
 * Sets CSS custom properties for use in modal positioning
 * Handles dynamic viewport changes (mobile browser UI showing/hiding)
 */
export function useViewportDimensions() {
  const viewportHeight = ref(0)
  const navbarHeight = ref(80)
  const bottomNavHeight = ref(80)

  const updateDimensions = () => {
    if (typeof window === 'undefined') return
    
    // Use window.innerHeight for accurate viewport (accounts for browser UI)
    // This is more reliable than 100vh on mobile devices
    const currentViewportHeight = window.innerHeight
    viewportHeight.value = currentViewportHeight
    
    // Get actual navbar height from DOM
    // Try multiple selectors to find navbar
    const navbar = document.querySelector('.dashboard-navbar') || 
                   document.querySelector('.site-navbar') ||
                   document.querySelector('nav[class*="navbar"]')
    
    if (navbar && navbar.offsetHeight > 0) {
      navbarHeight.value = navbar.offsetHeight
    } else {
      // Fallback: use default or check if we're on mobile
      navbarHeight.value = window.innerWidth <= 768 ? 80 : 80
    }
    
    // Get actual bottom nav height from DOM (only on mobile)
    const bottomNav = document.querySelector('.mobile-bottom-nav')
    if (bottomNav && window.innerWidth <= 768 && bottomNav.offsetHeight > 0) {
      bottomNavHeight.value = bottomNav.offsetHeight
    } else {
      // No bottom nav on desktop or if not found
      bottomNavHeight.value = window.innerWidth <= 768 ? 80 : 0
    }
    
    // Calculate available height (viewport minus navbar and bottom nav)
    const available = currentViewportHeight - navbarHeight.value - bottomNavHeight.value
    
    // Set CSS custom properties for use in CSS
    // These are used by modal CSS for proper positioning
    document.documentElement.style.setProperty('--viewport-height', `${currentViewportHeight}px`)
    document.documentElement.style.setProperty('--navbar-height', `${navbarHeight.value}px`)
    document.documentElement.style.setProperty('--bottom-nav-height', `${bottomNavHeight.value}px`)
    document.documentElement.style.setProperty('--available-height', `${available}px`)
  }

  // Initial update immediately (don't wait for mount)
  // Use nextTick to ensure DOM is ready
  if (typeof window !== 'undefined') {
    // Update immediately
    updateDimensions()
    
    // Also update after a short delay to catch any late-rendering elements
    setTimeout(updateDimensions, 100)
    setTimeout(updateDimensions, 500)
  }

  onMounted(() => {
    // Update on mount (DOM should be ready)
    updateDimensions()
    
    // Update on resize (handles browser UI changes)
    window.addEventListener('resize', updateDimensions)
    window.addEventListener('orientationchange', updateDimensions)
    
    // Update when viewport changes (mobile browser UI)
    // Use visualViewport API if available (better for mobile)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateDimensions)
      window.visualViewport.addEventListener('scroll', updateDimensions)
    }
    
    // Fallback: Update periodically to catch dynamic changes
    // This is a safety net for browsers without visualViewport support
    const intervalId = setInterval(() => {
      const currentHeight = window.innerHeight
      if (currentHeight !== viewportHeight.value) {
        updateDimensions()
      }
    }, 250) // Reduced frequency for better performance
    
    // Store interval ID for cleanup
    window.__viewportInterval = intervalId
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateDimensions)
    window.removeEventListener('orientationchange', updateDimensions)
    
    if (window.visualViewport) {
      window.visualViewport.removeEventListener('resize', updateDimensions)
      window.visualViewport.removeEventListener('scroll', updateDimensions)
    }
    
    if (window.__viewportInterval) {
      clearInterval(window.__viewportInterval)
      delete window.__viewportInterval
    }
  })

  return {
    viewportHeight,
    navbarHeight,
    bottomNavHeight,
    updateDimensions
  }
}
