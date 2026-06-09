import type React from 'react'

export const SourceColor: React.FC = () => {
  return (
    <svg aria-hidden="true" viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="vaults-g1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--color-primary-container)" stopOpacity="0.34" />
          <stop offset="100%" stopColor="var(--color-primary-container)" stopOpacity="0.59" />
        </linearGradient>
        <linearGradient id="vaults-g2" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.42" />
          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.68" />
        </linearGradient>
        <linearGradient id="vaults-g3" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.51" />
          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.77" />
        </linearGradient>
        <filter id="vaults-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <polygon points="100,34 136,54 136,96 100,116 64,96 64,54" fill="url(#vaults-g1)" />
      <polygon points="100,45 125,59 125,91 100,105 75,91 75,59" fill="url(#vaults-g2)" />
      <polygon
        points="100,58 114,66 114,84 100,92 86,84 86,66"
        fill="url(#vaults-g3)"
        filter="url(#vaults-glow)"
      />
    </svg>
  )
}
