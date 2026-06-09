import type React from 'react'

export const Export: React.FC = () => {
  return (
    <svg aria-hidden="true" viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="export-g1" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--color-surface-container-high)" stopOpacity="0.38" />
          <stop offset="100%" stopColor="var(--color-surface-container-high)" stopOpacity="0.64" />
        </linearGradient>
        <linearGradient id="export-g2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--color-primary-container)" stopOpacity="0.42" />
          <stop offset="100%" stopColor="var(--color-primary-container)" stopOpacity="0.68" />
        </linearGradient>
        <linearGradient id="export-g3" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.51" />
          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.80" />
        </linearGradient>
        <filter id="export-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <rect x="48" y="96" width="104" height="22" rx="8" fill="url(#export-g1)" />
      <rect x="80" y="52" width="40" height="40" rx="9" fill="url(#export-g2)" />
      <path
        d="M 100 28 L 116 46 L 108 46 L 108 72 L 92 72 L 92 46 L 84 46 Z"
        fill="url(#export-g3)"
        filter="url(#export-glow)"
      />
    </svg>
  )
}
