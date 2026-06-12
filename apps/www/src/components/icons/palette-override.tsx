import type React from 'react'

// Customized Auto Reconciliation Component
export const PaletteOverride: React.FC = () => {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 200 150"
      xmlns="http://www.w3.org/2000/svg"
      style={{ background: 'transparent' }}
    >
      <defs>
        <linearGradient id="reconciliation-g1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0284c7" stopOpacity="0.38" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.64" />
        </linearGradient>
        <linearGradient id="reconciliation-g2" x1="100%" y1="0%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.42" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.68" />
        </linearGradient>
        <linearGradient id="reconciliation-g3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0f172a" stopOpacity="0.51" />
          <stop offset="100%" stopColor="#0369a1" stopOpacity="0.77" />
        </linearGradient>
        <filter id="reconciliation-glow" x="-15%" y="-15%" width="130%" height="130%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <rect x="40" y="42" width="120" height="14" rx="7" fill="url(#reconciliation-g1)" />
      <rect x="40" y="94" width="120" height="14" rx="7" fill="url(#reconciliation-g2)" />
      <rect x="40" y="68" width="120" height="14" rx="7" fill="url(#reconciliation-g3)" />
    </svg>
  )
}
