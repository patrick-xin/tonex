import { DEFAULT_SHADCN_ROLE_BINDINGS, type ShadcnRoleBindings } from '@tonex/core/schema'
import { describe, expect, it } from 'vitest'
import { isSoftBorderOn } from './predicate'

// why: "soft border on" is the structural condition both --border and --input
// in BOTH modes resolve to --color-outline-variant. The predicate is the
// single read site for the switch's checked state and for any future feature
// that needs to know edge style — keeping it pure means the test asserts the
// rule, not a snapshot.
describe('isSoftBorderOn', () => {
  it('is false for the project defaults (border/input → outline)', () => {
    expect(isSoftBorderOn(DEFAULT_SHADCN_ROLE_BINDINGS)).toBe(false)
  })

  it('is true when both modes bind --border, --input, --sidebar-border to outline-variant', () => {
    const both: { light: ShadcnRoleBindings; dark: ShadcnRoleBindings } = {
      light: {
        ...DEFAULT_SHADCN_ROLE_BINDINGS.light,
        '--border': '--color-outline-variant',
        '--input': '--color-outline-variant',
        '--sidebar-border': '--color-outline-variant',
      },
      dark: {
        ...DEFAULT_SHADCN_ROLE_BINDINGS.dark,
        '--border': '--color-outline-variant',
        '--input': '--color-outline-variant',
        '--sidebar-border': '--color-outline-variant',
      },
    }
    expect(isSoftBorderOn(both)).toBe(true)
  })

  it('is false when only one mode is soft (asymmetric state)', () => {
    const lightOnly: { light: ShadcnRoleBindings; dark: ShadcnRoleBindings } = {
      light: {
        ...DEFAULT_SHADCN_ROLE_BINDINGS.light,
        '--border': '--color-outline-variant',
        '--input': '--color-outline-variant',
        '--sidebar-border': '--color-outline-variant',
      },
      dark: DEFAULT_SHADCN_ROLE_BINDINGS.dark,
    }
    expect(isSoftBorderOn(lightOnly)).toBe(false)
  })

  it('is false when only --border (not --input) is soft', () => {
    const borderOnly: { light: ShadcnRoleBindings; dark: ShadcnRoleBindings } = {
      light: { ...DEFAULT_SHADCN_ROLE_BINDINGS.light, '--border': '--color-outline-variant' },
      dark: { ...DEFAULT_SHADCN_ROLE_BINDINGS.dark, '--border': '--color-outline-variant' },
    }
    expect(isSoftBorderOn(borderOnly)).toBe(false)
  })

  it('is false when --border and --input are soft but --sidebar-border is not', () => {
    const noSidebar: { light: ShadcnRoleBindings; dark: ShadcnRoleBindings } = {
      light: {
        ...DEFAULT_SHADCN_ROLE_BINDINGS.light,
        '--border': '--color-outline-variant',
        '--input': '--color-outline-variant',
      },
      dark: {
        ...DEFAULT_SHADCN_ROLE_BINDINGS.dark,
        '--border': '--color-outline-variant',
        '--input': '--color-outline-variant',
      },
    }
    expect(isSoftBorderOn(noSidebar)).toBe(false)
  })
})
