import { SHADCN_PRESETS, type ShadcnPresetName } from '@tonex/core/schema'
import { describe, expect, it } from 'vitest'
import { presetUsesTertiary } from './hints'

describe('presetUsesTertiary', () => {
  it('is true for presets that bind a role to a --color-tertiary* token', () => {
    expect(presetUsesTertiary('sunset')).toBe(true)
  })

  it('is false for presets that never reference tertiary', () => {
    expect(presetUsesTertiary('default')).toBe(false)
    expect(presetUsesTertiary('stone')).toBe(false)
    expect(presetUsesTertiary('breeze')).toBe(false)
    expect(presetUsesTertiary('enterprise')).toBe(false)
    expect(presetUsesTertiary('sage')).toBe(false)
  })

  it('treats a null (custom/drifted) preset as not-wired', () => {
    expect(presetUsesTertiary(null)).toBe(false)
  })

  // why: forces a conscious test update if a new preset ships, so the picker
  // copy can't silently misreport a freshly-added preset.
  it('covers every shipped preset', () => {
    const expected: Record<ShadcnPresetName, boolean> = {
      default: false,
      stone: false,
      lagoon: false,
      breeze: false,
      paper: false,
      enterprise: false,
      sunset: true,
      sage: false,
      fire: false,
      electron: false,
    }
    for (const name of Object.keys(SHADCN_PRESETS) as ShadcnPresetName[]) {
      expect(presetUsesTertiary(name)).toBe(expected[name])
    }
  })
})
