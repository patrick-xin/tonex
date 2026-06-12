import type React from 'react'

export const BindingPreset: React.FC = () => {
  return (
    <svg aria-hidden="true" viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="preset-g1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--color-surface-container-highest)" stopOpacity="0.42" />
          <stop
            offset="100%"
            stopColor="var(--color-surface-container-highest)"
            stopOpacity="0.68"
          />
        </linearGradient>
        <linearGradient id="preset-g2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="var(--color-surface-container-high)" stopOpacity="0.38" />
          <stop offset="100%" stopColor="var(--color-surface-container-high)" stopOpacity="0.64" />
        </linearGradient>
        <linearGradient id="preset-g3" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--color-surface-container)" stopOpacity="0.38" />
          <stop offset="100%" stopColor="var(--color-surface-container)" stopOpacity="0.64" />
        </linearGradient>
        <linearGradient id="preset-g4" x1="100%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="var(--color-surface-container-low)" stopOpacity="0.42" />
          <stop offset="100%" stopColor="var(--color-surface-container-low)" stopOpacity="0.68" />
        </linearGradient>
        <linearGradient id="preset-g5" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.51" />
          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.77" />
        </linearGradient>
        <filter id="preset-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <rect x="50" y="25" width="44" height="44" rx="6" fill="url(#preset-g1)" />
      <rect x="106" y="25" width="44" height="44" rx="6" fill="url(#preset-g2)" />
      <rect x="50" y="81" width="44" height="44" rx="6" fill="url(#preset-g3)" />
      <rect x="106" y="81" width="44" height="44" rx="6" fill="url(#preset-g4)" />
      <rect
        x="80"
        y="55"
        width="40"
        height="40"
        rx="9"
        fill="url(#preset-g5)"
        filter="url(#preset-glow)"
      />
    </svg>
  )
}
