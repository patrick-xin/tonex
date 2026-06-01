import { describe, expect, it } from 'vitest'
import { HARD_EDGE_TOKEN, isSoftEdgeWeight, SOFT_EDGE_TOKEN, withSoftEdges } from './edge-weight'
import {
  DEFAULT_SHADCN_ROLE_BINDINGS,
  type MdTokenName,
  SHADCN_EDGE_ROLES,
  type ShadcnRoleBindings,
} from './schema'

// why: the core SSOT for the "edge weight" sub-axis — the three edge roles the
// soft-border toggle flips between --color-outline (hard) and
// --color-outline-variant (soft). isSoftEdgeWeight is the all-or-nothing "soft
// on" predicate (any asymmetry reads as not-soft); withSoftEdges re-asserts the
// soft token onto a bindings pair. Ambient preset-apply uses both to carry a
// sticky soft-border across a preset switch.

type Pair = { light: ShadcnRoleBindings; dark: ShadcnRoleBindings }

// why: default preset ships hard edges, so DEFAULT_SHADCN_ROLE_BINDINGS is a
// ready "hard" fixture. setEdges stamps a chosen token onto the three edge roles
// per mode without touching any other role.
function setEdges(pair: Pair, light: MdTokenName, dark: MdTokenName): Pair {
  const next: Pair = { light: { ...pair.light }, dark: { ...pair.dark } }
  for (const role of SHADCN_EDGE_ROLES) {
    next.light[role] = light
    next.dark[role] = dark
  }
  return next
}

const HARD = DEFAULT_SHADCN_ROLE_BINDINGS

describe('isSoftEdgeWeight', () => {
  it('is true when all three edge roles map to the soft token in BOTH modes', () => {
    expect(isSoftEdgeWeight(setEdges(HARD, SOFT_EDGE_TOKEN, SOFT_EDGE_TOKEN))).toBe(true)
  })

  it('is false for the hard default', () => {
    expect(isSoftEdgeWeight(HARD)).toBe(false)
  })

  it('is false when one mode is soft and the other hard (asymmetry reads as off)', () => {
    expect(isSoftEdgeWeight(setEdges(HARD, SOFT_EDGE_TOKEN, HARD_EDGE_TOKEN))).toBe(false)
  })

  it('is false when a single edge role drifts off the soft token', () => {
    const soft = setEdges(HARD, SOFT_EDGE_TOKEN, SOFT_EDGE_TOKEN)
    soft.light['--input'] = HARD_EDGE_TOKEN
    expect(isSoftEdgeWeight(soft)).toBe(false)
  })

  it('is false for a custom edge (off-outline token)', () => {
    const custom = setEdges(HARD, SOFT_EDGE_TOKEN, SOFT_EDGE_TOKEN)
    custom.light['--border'] = '--color-primary'
    expect(isSoftEdgeWeight(custom)).toBe(false)
  })
})

describe('withSoftEdges', () => {
  it('forces every edge role to the soft token in both modes', () => {
    const out = withSoftEdges(HARD)
    for (const role of SHADCN_EDGE_ROLES) {
      expect(out.light[role]).toBe(SOFT_EDGE_TOKEN)
      expect(out.dark[role]).toBe(SOFT_EDGE_TOKEN)
    }
    expect(isSoftEdgeWeight(out)).toBe(true)
  })

  it('leaves non-edge roles untouched', () => {
    const out = withSoftEdges(HARD)
    expect(out.light['--card']).toBe(HARD.light['--card'])
    expect(out.light['--ring']).toBe(HARD.light['--ring'])
    expect(out.dark['--primary']).toBe(HARD.dark['--primary'])
  })

  it('does not mutate the input pair', () => {
    const input = setEdges(HARD, HARD_EDGE_TOKEN, HARD_EDGE_TOKEN)
    withSoftEdges(input)
    expect(input.light['--border']).toBe(HARD_EDGE_TOKEN)
  })
})
