import { DEFAULT_SHADCN_ROLE_BINDINGS } from '@tonex/core/schema'
import { useSource } from '@tonex/core-react'
import { afterEach, describe, expect, it } from 'vitest'
import { isSoftBorderOn } from './predicate'
import { setSoftBorder } from './toggle'

// why: integration test against the real zustand store. setSoftBorder is the
// www-side composition of setShadcnRoleBinding (4 calls — border/input × light/
// dark) — testing it through useSource.getState() proves the wired behavior
// without mocking the store, which would mock the contract under test.
afterEach(() => {
  useSource.getState().actions.reset()
})

describe('setSoftBorder', () => {
  it('default state is off (predicate matches DEFAULT_SHADCN_ROLE_BINDINGS)', () => {
    expect(isSoftBorderOn(useSource.getState().shadcnRoleBindings)).toBe(false)
  })

  it('setSoftBorder(true) binds --border, --input, --sidebar-border to outline-variant in both modes', () => {
    setSoftBorder(true)
    const b = useSource.getState().shadcnRoleBindings
    expect(b.light['--border']).toBe('--color-outline-variant')
    expect(b.light['--input']).toBe('--color-outline-variant')
    expect(b.light['--sidebar-border']).toBe('--color-outline-variant')
    expect(b.dark['--border']).toBe('--color-outline-variant')
    expect(b.dark['--input']).toBe('--color-outline-variant')
    expect(b.dark['--sidebar-border']).toBe('--color-outline-variant')
    expect(isSoftBorderOn(b)).toBe(true)
  })

  it('setSoftBorder(false) restores --border, --input, --sidebar-border to outline in both modes', () => {
    setSoftBorder(true)
    setSoftBorder(false)
    const b = useSource.getState().shadcnRoleBindings
    expect(b.light['--border']).toBe('--color-outline')
    expect(b.light['--input']).toBe('--color-outline')
    expect(b.light['--sidebar-border']).toBe('--color-outline')
    expect(b.dark['--border']).toBe('--color-outline')
    expect(b.dark['--input']).toBe('--color-outline')
    expect(b.dark['--sidebar-border']).toBe('--color-outline')
    expect(isSoftBorderOn(b)).toBe(false)
  })

  it('does not touch other shadcn roles (e.g. --ring, --primary)', () => {
    setSoftBorder(true)
    const b = useSource.getState().shadcnRoleBindings
    expect(b.light['--ring']).toBe(DEFAULT_SHADCN_ROLE_BINDINGS.light['--ring'])
    expect(b.light['--primary']).toBe(DEFAULT_SHADCN_ROLE_BINDINGS.light['--primary'])
    expect(b.dark['--ring']).toBe(DEFAULT_SHADCN_ROLE_BINDINGS.dark['--ring'])
  })
})
