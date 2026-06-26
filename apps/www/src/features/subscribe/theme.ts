import type { TailwindConfig } from 'react-email'
import plugin from 'tailwindcss/plugin'

// MD3 role tokens, generated from #b8b0a1.
const colors = {
  primary: '#645e51',
  'on-primary': '#fff7ea',
  surface: '#fef8f5',
  'surface-container-lowest': '#ffffff',
  'surface-container': '#f2ede8',
  'on-surface': '#34322f',
  'on-surface-variant': '#625f5a',
  'outline-variant': '#b6b1ac',
} as const

const fontScale = {
  11: {
    fontSize: '11px',
    lineHeight: '1.5',
    letterSpacing: '-0.033px',
    fontWeight: '300',
  },
  13: {
    fontSize: '13px',
    lineHeight: '1.5',
    letterSpacing: '-0.039px',
    fontWeight: '300',
  },
  14: { fontSize: '14px', lineHeight: '1.5' },
  15: {
    fontSize: '15px',
    lineHeight: '1.5',
    letterSpacing: '-0.075px',
    fontWeight: '500',
  },
  20: { fontSize: '20px', lineHeight: '1.2', letterSpacing: '-0.2px' },
  32: { fontSize: '32px', lineHeight: '1.2', letterSpacing: '-0.6px' },
  48: { fontSize: '48px', lineHeight: '1', letterSpacing: '-1.44px' },
  58: { fontSize: '58px', lineHeight: '1', letterSpacing: '-1.74px' },
  88: { fontSize: '88px', lineHeight: '1', letterSpacing: '-2.64px' },
} as const

export const emailTailwindConfig: TailwindConfig = {
  plugins: [
    plugin(({ addUtilities, addVariant }) => {
      addVariant('mobile', '@media (max-width: 600px)')
      const utilities: Record<string, Record<string, string>> = {}
      for (const [step, token] of Object.entries(fontScale)) {
        utilities[`.font-${step}`] = token
      }
      addUtilities(utilities)
    }),
  ],
  theme: {
    extend: {
      colors,
      boxShadow: {
        card: '0px 76px 21px 0px rgba(193,195,193,0), 0px 49px 19px 0px rgba(193,195,193,0.01), 0px 27px 16px 0px rgba(193,195,193,0.05), 0px 12px 12px 0px rgba(193,195,193,0.09), 0px 3px 7px 0px rgba(193,195,193,0.1)',
      },
      // DESIGN.md type voices: Vidaloka (display serif), IBM Plex Sans (UI), IBM Plex Mono (data).
      fontFamily: {
        serif: ['Vidaloka', 'Georgia', 'serif'],
        sans: ['IBM Plex Sans', 'Arial', 'Helvetica', 'sans-serif'],
        mono: ['IBM Plex Mono', 'ui-monospace', 'monospace'],
      },
    },
  },
}
