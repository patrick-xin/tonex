import { describe, expect, it } from 'vitest'
import { SHADCN_BINDING_PRESETS } from './binding-presets'
import { MODES } from './mode'
import { MD_TOKEN_NAMES, SHADCN_ROLE_NAMES } from './schema'

// why: SHADCN_BINDING_PRESETS is hand-authored curated data (entries pasted
// from the preset tuner), so the failure mode is a typo'd md token or a
// dropped role — not an algorithm bug. These assertions are spec-derived from
// the SAME runtime contracts the PortableThemeSchema validator enforces
// (SHADCN_ROLE_NAMES key set, MD_TOKEN_NAMES value domain), so a malformed
// entry fails here at author time instead of silently mis-deriving at runtime.
// They validate well-formedness, deliberately NOT the curator's token choices.

const VALID_TOKENS = new Set<string>(MD_TOKEN_NAMES)
const REQUIRED_ROLES = new Set<string>(SHADCN_ROLE_NAMES)
const PRESET_ENTRIES = Object.entries(SHADCN_BINDING_PRESETS)

it('declares at least one curated binding preset', () => {
  expect(PRESET_ENTRIES.length).toBeGreaterThan(0)
})

describe.each(PRESET_ENTRIES)('binding preset "%s"', (_name, preset) => {
  it('has a non-empty description (users pick by outcome, not token vocabulary)', () => {
    expect(preset.description.trim().length).toBeGreaterThan(0)
  })

  for (const mode of MODES) {
    const bindings = preset.shadcnRoleBindings[mode]

    it(`${mode}: binds exactly the full shadcn role set (no missing, no extra)`, () => {
      expect(new Set(Object.keys(bindings))).toEqual(REQUIRED_ROLES)
    })

    it(`${mode}: every binding targets a real md token`, () => {
      for (const [role, token] of Object.entries(bindings)) {
        expect(VALID_TOKENS, `${role} → ${token}`).toContain(token)
      }
    })
  }
})
