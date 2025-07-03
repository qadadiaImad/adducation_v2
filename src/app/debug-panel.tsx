'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { DebugPanel } from '../components/ui/DebugPanel'

export default function DebugPanelContainer() {
  useEffect(() => {
    // This ensures the component only runs on the client side
  }, [])

  // Find the container element
  const container = typeof document !== 'undefined' 
    ? document.getElementById('debug-panel-container') 
    : null

  if (!container) return null

  // Use createPortal to render the DebugPanel into the container
  return createPortal(<DebugPanel />, container)
}
