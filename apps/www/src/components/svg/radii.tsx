import type { SVGProps } from 'react'

// 1. None (Sharp 90-degree corner)
export const RadiusNoneIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    className="text-on-surface-variant/50 size-4"
    {...props}
  >
    <path
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M4 20V4h16"
    />
  </svg>
)

// 2. Small (Radius: ~6 units)
export const RadiusSmallIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    className="text-on-surface-variant/50 size-4"
    {...props}
  >
    <path
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M4 20v-10C4 6.686 6.686 4 10 4h10"
    />
  </svg>
)

// 3. Medium (Radius: ~11 units - Your original provided SVG)
export const RadiusMediumIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    className="text-on-surface-variant/50 size-4"
    {...props}
  >
    <path
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M4 20v-5C4 8.925 8.925 4 15 4h5"
    />
  </svg>
)

// 4. Large (Radius: ~14 units)
export const RadiusLargeIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    className="text-on-surface-variant/50 size-4"
    {...props}
  >
    <path
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M4 20v-2C4 10.268 10.268 4 18 4h2"
    />
  </svg>
)

// 5. Full (Radius: 16 units - Maximum circle inside the 16x16 safe area)
export const RadiusFullIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    className="text-on-surface-variant/50 size-4"
    {...props}
  >
    <path
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M4 20C4 11.164 11.164 4 20 4"
    />
  </svg>
)
