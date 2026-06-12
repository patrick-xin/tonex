import type React from 'react'

export const SurfaceAdjustment: React.FC = () => {
  return (
    <svg aria-hidden="true" viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ap-g1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--color-primary-container)" stopOpacity="0.42" />
          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.68" />
        </linearGradient>
        <linearGradient id="ap-g2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.38" />
          <stop offset="100%" stopColor="var(--color-surface)" stopOpacity="0.72" />
        </linearGradient>
        <linearGradient id="ap-g3" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--color-surface-container)" stopOpacity="0.47" />
          <stop offset="100%" stopColor="var(--color-surface-container-high)" stopOpacity="0.77" />
        </linearGradient>
        <filter id="ap-glow" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <path d="M 100 82 L 138 98 L 100 114 L 62 98 Z" fill="url(#ap-g3)" />
      <path d="M 100 59 L 138 75 L 100 91 L 62 75 Z" fill="url(#ap-g2)" />
      <path d="M 100 36 L 138 52 L 100 68 L 62 52 Z" fill="url(#ap-g1)" filter="url(#ap-glow)" />
    </svg>
  )
}
