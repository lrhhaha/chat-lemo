'use client'

/**
 * Background Effects
 * 
 * Refactored to match Ant Design's clean aesthetic.
 * Removes cyberpunk elements (grids, neon pulses) in favor of a subtle, clean background.
 */
export function BackgroundEffects() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* Subtle top gradient for depth */}
      <div 
        className="absolute top-0 left-0 right-0 h-96 opacity-40 dark:opacity-20"
        style={{
          background: 'radial-gradient(50% 100% at 50% 0%, rgba(22, 119, 255, 0.1) 0%, rgba(22, 119, 255, 0) 100%)'
        }}
      />
    </div>
  )
}
