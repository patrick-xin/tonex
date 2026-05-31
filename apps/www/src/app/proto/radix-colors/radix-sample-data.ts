// THROWAWAY PROTOTYPE DATA — not wired to core, safe to delete this whole folder.
// Only `tomato` is user-canonical. The other scales are best-effort Radix values
// for evaluating picker LAYOUTS; replace with @radix-ui/colors before any real use.
import { MODES, type Mode } from '@tonex/core'

export type RadixBand = 'background' | 'component' | 'border' | 'solid' | 'text'

export type StepRole = {
  step: number
  band: RadixBand
  label: string
}

// why: the whole point of the prototype — each of the 12 steps has a JOB.
// Tailwind's 50→950 carries none of this; Radix's does. The picker exists to
// make this legible, so the metadata is first-class data, not a tooltip string.
export const STEP_ROLES: StepRole[] = [
  { step: 1, band: 'background', label: 'App background' },
  { step: 2, band: 'background', label: 'Subtle background' },
  { step: 3, band: 'component', label: 'UI element background' },
  { step: 4, band: 'component', label: 'Hovered UI element' },
  { step: 5, band: 'component', label: 'Active / selected element' },
  { step: 6, band: 'border', label: 'Subtle border / separator' },
  { step: 7, band: 'border', label: 'UI element border / focus ring' },
  { step: 8, band: 'border', label: 'Hovered UI element border' },
  { step: 9, band: 'solid', label: 'Solid background' },
  { step: 10, band: 'solid', label: 'Hovered solid background' },
  { step: 11, band: 'text', label: 'Low-contrast text' },
  { step: 12, band: 'text', label: 'High-contrast text' },
]

export type BandDef = {
  key: RadixBand
  name: string
  steps: number[]
  blurb: string
}

export const BANDS: BandDef[] = [
  { key: 'background', name: 'Backgrounds', steps: [1, 2], blurb: 'Page & subtle fills' },
  { key: 'component', name: 'Component', steps: [3, 4, 5], blurb: 'Element bg / hover / active' },
  { key: 'border', name: 'Borders', steps: [6, 7, 8], blurb: 'Separators, borders, focus' },
  { key: 'solid', name: 'Solid', steps: [9, 10], blurb: 'The brand color + its hover' },
  { key: 'text', name: 'Text', steps: [11, 12], blurb: 'Low- & high-contrast text' },
]

// why: step 9 is the identity step — most-saturated, the "this is the color"
// swatch (Radix's analog to Tailwind 500). Pickers default the eye here.
export const IDENTITY_STEP = 9

export function roleFor(step: number): StepRole {
  return STEP_ROLES[step - 1]
}

export function bandFor(step: number): BandDef {
  const role = roleFor(step)
  // non-null: every STEP_ROLES.band has a matching BANDS entry by construction
  return BANDS.find((b) => b.key === role.band) as BandDef
}

export type RadixScale = {
  name: string
  kind: 'accent' | 'gray'
  // index 0 = step 1 … index 11 = step 12, per mode
  ramp: Record<Mode, string[]>
}

export function stepHex(scale: RadixScale, mode: Mode, step: number): string {
  return scale.ramp[mode][step - 1]
}

export const SCALES: RadixScale[] = [
  {
    name: 'tomato',
    kind: 'accent',
    ramp: {
      light: [
        '#fffcfc',
        '#fff8f7',
        '#feebe7',
        '#ffdcd3',
        '#ffcdc2',
        '#fdbdaf',
        '#f5a898',
        '#ec8e7b',
        '#e54d2e',
        '#dd4425',
        '#d13415',
        '#5c271f',
      ],
      dark: [
        '#181111',
        '#1f1513',
        '#391714',
        '#4e1511',
        '#5e1c16',
        '#6e2920',
        '#853a2d',
        '#ac4d39',
        '#e54d2e',
        '#ec6142',
        '#ff977d',
        '#fbd3cb',
      ],
    },
  },
  {
    name: 'amber',
    kind: 'accent',
    ramp: {
      light: [
        '#fefdfb',
        '#fefbe9',
        '#fff7c2',
        '#ffee9c',
        '#fbe577',
        '#f3d673',
        '#e9c162',
        '#e2a336',
        '#ffc53d',
        '#ffba18',
        '#ab6400',
        '#4f3422',
      ],
      dark: [
        '#16120c',
        '#1d180f',
        '#302008',
        '#3f2700',
        '#4d3000',
        '#5c3d05',
        '#714f19',
        '#8f6424',
        '#ffc53d',
        '#ffd60a',
        '#ffca16',
        '#ffe7b3',
      ],
    },
  },
  {
    name: 'grass',
    kind: 'accent',
    ramp: {
      light: [
        '#fbfefb',
        '#f5fbf5',
        '#e9f6e9',
        '#daf1db',
        '#c9e8ca',
        '#b2ddb5',
        '#94ce9a',
        '#65ba74',
        '#46a758',
        '#3e9b4f',
        '#2a7e3b',
        '#203c25',
      ],
      dark: [
        '#0e1511',
        '#141a15',
        '#1b2a1e',
        '#1d3a24',
        '#25482d',
        '#2d5736',
        '#366740',
        '#3e7949',
        '#46a758',
        '#53b365',
        '#71d083',
        '#c2f0c2',
      ],
    },
  },
  {
    name: 'blue',
    kind: 'accent',
    ramp: {
      light: [
        '#fbfdff',
        '#f4faff',
        '#e6f4fe',
        '#d5efff',
        '#c2e5ff',
        '#acd8fc',
        '#8ec8f6',
        '#5eb1ef',
        '#0090ff',
        '#0588f0',
        '#0d74ce',
        '#113264',
      ],
      dark: [
        '#0d1520',
        '#111927',
        '#0d2847',
        '#003362',
        '#004074',
        '#104d87',
        '#205d9e',
        '#2870bd',
        '#0090ff',
        '#3b9eff',
        '#70b8ff',
        '#c2e6ff',
      ],
    },
  },
  {
    name: 'iris',
    kind: 'accent',
    ramp: {
      light: [
        '#fdfdff',
        '#f8f8ff',
        '#f0f1fe',
        '#e6e7ff',
        '#dadcff',
        '#cbcdff',
        '#b8baf8',
        '#9b9ef0',
        '#5b5bd6',
        '#5151cd',
        '#5753c6',
        '#272962',
      ],
      dark: [
        '#13131e',
        '#171625',
        '#202248',
        '#262a65',
        '#303374',
        '#3d3e82',
        '#4a4a95',
        '#5958b1',
        '#5b5bd6',
        '#6e6ade',
        '#b1a9ff',
        '#e0dffe',
      ],
    },
  },
  {
    name: 'sage',
    kind: 'gray',
    ramp: {
      light: [
        '#fbfdfc',
        '#f7f9f8',
        '#eef1f0',
        '#e6e9e8',
        '#dfe2e1',
        '#d7dbda',
        '#cbd0ce',
        '#b8c0bd',
        '#868f8b',
        '#7c8480',
        '#5f6563',
        '#1a211e',
      ],
      dark: [
        '#101211',
        '#171918',
        '#202221',
        '#272a29',
        '#2e3130',
        '#373b39',
        '#444947',
        '#5b625f',
        '#63706b',
        '#717d79',
        '#adb5b2',
        '#eceeed',
      ],
    },
  },
  {
    name: 'slate',
    kind: 'gray',
    ramp: {
      light: [
        '#fcfcfd',
        '#f9f9fb',
        '#f0f0f3',
        '#e8e8ec',
        '#e0e1e6',
        '#d9d9e0',
        '#cdced6',
        '#b9bbc6',
        '#8b8d98',
        '#80828d',
        '#60646c',
        '#1c2024',
      ],
      dark: [
        '#111113',
        '#18191b',
        '#212225',
        '#272a2d',
        '#2e3135',
        '#363a3f',
        '#43484e',
        '#5a6169',
        '#696e77',
        '#777b84',
        '#b0b4ba',
        '#edeef0',
      ],
    },
  },
]

export type { Mode }
export { MODES }

// why: WCAG relative luminance → pick black/white label ink that stays legible
// across all 12 steps in both modes (steps 1–8 are pale in light, dark in dark).
export function inkOn(hex: string): string {
  const c = hex.replace('#', '')
  const toLin = (v: number) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
  const r = toLin(Number.parseInt(c.slice(0, 2), 16) / 255)
  const g = toLin(Number.parseInt(c.slice(2, 4), 16) / 255)
  const b = toLin(Number.parseInt(c.slice(4, 6), 16) / 255)
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return lum > 0.42 ? '#11181c' : '#ffffff'
}
