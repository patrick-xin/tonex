import type React from 'react'

export const CustomColors: React.FC = () => {
  return (
    <svg aria-hidden="true" viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="custom-g1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--color-tnx-success)" stopOpacity="0.94" />
          <stop offset="100%" stopColor="var(--color-inverse-surface)" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id="custom-g2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--color-tnx-info)" stopOpacity="0.94" />
          <stop offset="100%" stopColor="var(--color-inverse-surface)" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id="custom-g3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--color-tnx-warning)" stopOpacity="0.94" />
          <stop offset="100%" stopColor="var(--color-inverse-surface)" stopOpacity="0.2" />
        </linearGradient>
        <filter id="custom-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <circle cx="64" cy="75" r="17" fill="url(#custom-g1)" />
      <circle cx="100" cy="75" r="17" fill="url(#custom-g2)" />
      <circle cx="136" cy="75" r="17" fill="url(#custom-g3)" />
    </svg>
  )
}
