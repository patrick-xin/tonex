import type React from 'react'

export const CustomColors: React.FC = () => {
  return (
    <svg aria-hidden="true" viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="custom-g1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--color-primary-container)" stopOpacity="0.34" />
          <stop offset="100%" stopColor="var(--color-primary-container)" stopOpacity="0.59" />
        </linearGradient>
        <linearGradient id="custom-g2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--color-secondary-container)" stopOpacity="0.34" />
          <stop offset="100%" stopColor="var(--color-secondary-container)" stopOpacity="0.59" />
        </linearGradient>
        <linearGradient id="custom-g3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--color-tertiary-container)" stopOpacity="0.34" />
          <stop offset="100%" stopColor="var(--color-tertiary-container)" stopOpacity="0.59" />
        </linearGradient>
        <linearGradient id="custom-g4" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.51" />
          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.77" />
        </linearGradient>
        <filter id="custom-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <circle cx="48" cy="75" r="17" fill="url(#custom-g1)" />
      <circle cx="84" cy="75" r="17" fill="url(#custom-g2)" />
      <circle cx="120" cy="75" r="17" fill="url(#custom-g3)" />
      <circle cx="162" cy="75" r="17" fill="url(#custom-g4)" filter="url(#custom-glow)" />
    </svg>
  )
}
