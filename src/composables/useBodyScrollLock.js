import { onMounted, onUnmounted, watch } from 'vue'

/**
 * Composable to lock/unlock body scroll when modals are open
 * Prevents background scrolling when modal is displayed
 */
export function useBodyScrollLock(isOpen) {
  const lockBodyScroll = () => {
    // Get the current scroll position
    const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop
    
    // Add class to body to prevent scrolling
    document.body.classList.add('modal-open')
    
    // Set the scroll position as a style to prevent jump
    document.body.style.top = `-${scrollY}px`
    document.body.style.position = 'fixed'
    document.body.style.width = '100%'
    document.body.style.overflow = 'hidden'
    
    // Store scroll position for restoration
    document.body.dataset.scrollY = scrollY.toString()
  }

  const unlockBodyScroll = () => {
    // Remove the lock class
    document.body.classList.remove('modal-open')
    
    // Restore body styles
    document.body.style.top = ''
    document.body.style.position = ''
    document.body.style.width = ''
    document.body.style.overflow = ''
    
    // Restore scroll position
    const scrollY = document.body.dataset.scrollY || '0'
    window.scrollTo(0, parseInt(scrollY, 10))
    
    // Clean up
    delete document.body.dataset.scrollY
  }

  // Watch for changes in isOpen
  if (isOpen !== undefined) {
    watch(
      () => isOpen.value,
      (newValue) => {
        if (newValue) {
          lockBodyScroll()
        } else {
          unlockBodyScroll()
        }
      },
      { immediate: true }
    )
  }

  // Cleanup on unmount
  onUnmounted(() => {
    unlockBodyScroll()
  })

  return {
    lockBodyScroll,
    unlockBodyScroll
  }
}
