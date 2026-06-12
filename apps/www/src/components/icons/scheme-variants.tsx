export const SchemeVariants = () => {
  return (
    <svg aria-hidden="true" viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="collab-g1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.30" />
          <stop offset="100%" stopColor="var(--color-secondary)" stopOpacity="0.55" />
        </linearGradient>
        <linearGradient id="collab-g2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--color-primary-container)" stopOpacity="0.51" />
          <stop offset="100%" stopColor="var(--color-secondary-container)" stopOpacity="0.77" />
        </linearGradient>
        <linearGradient id="collab-g3" x1="100%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="var(--color-surface-container)" stopOpacity="0.26" />
          <stop offset="100%" stopColor="var(--color-tertiary)" stopOpacity="0.47" />
        </linearGradient>
        <filter id="collab-glow" x="-15%" y="-15%" width="130%" height="130%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <circle cx="72" cy="75" r="28" fill="url(#collab-g1)" />
      <circle cx="128" cy="75" r="28" fill="url(#collab-g3)" />
      <circle cx="100" cy="75" r="33" fill="url(#collab-g2)" filter="url(#collab-glow)" />
    </svg>
  )
}
