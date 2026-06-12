import type React from 'react'

export const RoleBindings: React.FC = () => {
  return (
    <svg aria-hidden="true" viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bind-g1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--color-surface-container-high)" stopOpacity="0.42" />
          <stop offset="100%" stopColor="var(--color-surface-container-high)" stopOpacity="0.68" />
        </linearGradient>
        <linearGradient id="bind-g2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.45" />
          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.72" />
        </linearGradient>
        <linearGradient id="bind-g3" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="var(--color-secondary)" stopOpacity="0.51" />
          <stop offset="100%" stopColor="var(--color-secondary)" stopOpacity="0.77" />
        </linearGradient>
        <filter id="bind-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <rect x="30" y="51" width="48" height="48" rx="8" fill="url(#bind-g1)" />
      <rect
        x="122"
        y="51"
        width="48"
        height="48"
        rx="8"
        fill="url(#bind-g3)"
        filter="url(#bind-glow)"
      />
    </svg>
  )
}
