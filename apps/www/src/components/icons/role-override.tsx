import type React from 'react'

export const RoleOverride: React.FC = () => {
  return (
    <svg aria-hidden="true" viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="override-g1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--color-surface-container-high)" stopOpacity="0.20" />
          <stop offset="100%" stopColor="var(--color-surface-container-high)" stopOpacity="0.32" />
        </linearGradient>
        <linearGradient id="override-g2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--color-tertiary-container)" stopOpacity="0.45" />
          <stop offset="100%" stopColor="var(--color-tertiary-container)" stopOpacity="0.70" />
        </linearGradient>
        <linearGradient id="override-g3" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.80" />
        </linearGradient>
        <filter id="override-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <rect x="58" y="44" width="60" height="58" rx="8" fill="url(#override-g1)" />
      <rect x="72" y="58" width="60" height="58" rx="8" fill="url(#override-g2)" />
    </svg>
  )
}
