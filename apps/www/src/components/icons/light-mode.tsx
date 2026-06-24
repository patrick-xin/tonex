import type React from 'react'

export const LightMode: React.FC = () => {
  return (
    <svg aria-hidden="true" viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="waste-g1" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.38" />
          <stop
            offset="100%"
            stopColor="var(--color-surface-container-highest)"
            stopOpacity="0.59"
          />
        </linearGradient>
        <linearGradient id="waste-g2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--color-surface-container-lowest)" stopOpacity="0.38" />
          <stop
            offset="100%"
            stopColor="var(--color-surface-container-lowest)"
            stopOpacity="0.59"
          />
        </linearGradient>
        <filter id="waste-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <rect x="60" y="65" width="52" height="52" rx="4.5" fill="url(#waste-g1)" />
      <rect x="88" y="37" width="52" height="52" rx="4.5" fill="var(--color-surface)" />
      <rect
        x="88"
        y="37"
        width="52"
        height="52"
        rx="4.5"
        fill="url(#waste-g2)"
        filter="url(#waste-glow)"
      />
    </svg>
  )
}
