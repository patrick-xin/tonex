import { describe, expect, it } from 'vitest'
import { filterSteps, type GuideStep, getSteps } from './tour-steps'

// why: layer filtering is the one real piece of logic in the tour scaffold —
// you tour *your* workspace, so an md-only step must never surface on shadcn
// and vice versa, while a shared step appears in both. Everything else in the
// tour is presentational. filterSteps is the pure rule; getSteps binds it to
// the live TOUR_STEPS so the seed-color tracer step is asserted end-to-end.
describe('filterSteps', () => {
  const steps: GuideStep[] = [
    { key: 'md-only', layers: ['md'], title: 'Md', description: '', anchorKey: 'a' },
    { key: 'shadcn-only', layers: ['shadcn'], title: 'Shadcn', description: '', anchorKey: 'b' },
    { key: 'both', layers: ['md', 'shadcn'], title: 'Both', description: '', anchorKey: 'c' },
  ]

  it('keeps an md-only step for md and drops it for shadcn', () => {
    expect(filterSteps(steps, 'md').map((s) => s.key)).toContain('md-only')
    expect(filterSteps(steps, 'shadcn').map((s) => s.key)).not.toContain('md-only')
  })

  it('keeps a shadcn-only step for shadcn and drops it for md', () => {
    expect(filterSteps(steps, 'shadcn').map((s) => s.key)).toContain('shadcn-only')
    expect(filterSteps(steps, 'md').map((s) => s.key)).not.toContain('shadcn-only')
  })

  it('keeps a both-layers step in both layers', () => {
    expect(filterSteps(steps, 'md').map((s) => s.key)).toContain('both')
    expect(filterSteps(steps, 'shadcn').map((s) => s.key)).toContain('both')
  })
})

describe('getSteps', () => {
  it('includes the seed-color tracer step in both layers', () => {
    expect(getSteps('md').map((s) => s.anchorKey)).toContain('seed-color')
    expect(getSteps('shadcn').map((s) => s.anchorKey)).toContain('seed-color')
  })

  // why: the rail diverges by layer — binding preset, token overrides, and role
  // bindings are shadcn-only controls, palette override is md-only. A step that
  // surfaced in the wrong layer would spotlight a control that isn't on screen.
  it('gates shadcn-only rail steps to shadcn', () => {
    for (const key of ['binding-preset', 'token-overrides', 'role-bindings']) {
      expect(getSteps('shadcn').map((s) => s.key)).toContain(key)
      expect(getSteps('md').map((s) => s.key)).not.toContain(key)
    }
  })

  it('gates the palette-override rail step to md', () => {
    expect(getSteps('md').map((s) => s.key)).toContain('palette-override')
    expect(getSteps('shadcn').map((s) => s.key)).not.toContain('palette-override')
  })
})
