import { SHADCN_PRESETS, type ShadcnPresetName } from '@tonex/core/schema'
import { describe, expect, it } from 'vitest'
import { presetUsesTertiary } from './hints'

describe('presetUsesTertiary', () => {
  it('is true for presets that bind a role to a --color-tertiary* token', () => {
    expect(presetUsesTertiary('playful')).toBe(true)
    expect(presetUsesTertiary('tech')).toBe(true)
  })

  it('is false for presets that never reference tertiary', () => {
    expect(presetUsesTertiary('default')).toBe(false)
    expect(presetUsesTertiary('stark')).toBe(false)
    expect(presetUsesTertiary('soft')).toBe(false)
    expect(presetUsesTertiary('warm')).toBe(false)
    expect(presetUsesTertiary('monotone')).toBe(false)
  })

  it('treats a null (custom/drifted) preset as not-wired', () => {
    expect(presetUsesTertiary(null)).toBe(false)
  })

  // why: forces a conscious test update if a new preset ships, so the picker
  // copy can't silently misreport a freshly-added preset.
  it('covers every shipped preset', () => {
    const expected: Record<ShadcnPresetName, boolean> = {
      default: false,
      stark: false,
      soft: false,
      warm: false,
      playful: true,
      monotone: false,
      tech: true,
    }
    for (const name of Object.keys(SHADCN_PRESETS) as ShadcnPresetName[]) {
      expect(presetUsesTertiary(name)).toBe(expected[name])
    }
  })
})
