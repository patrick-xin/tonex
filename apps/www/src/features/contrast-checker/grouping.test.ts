import type { ContrastPair } from '@tonex/core/schema'
import { describe, expect, it } from 'vitest'
import { familyOf } from './grouping'

describe('familyOf', () => {
  it('returns "Chart" for md-chart pairs regardless of bg surface', () => {
    const onSurface: ContrastPair = {
      fg: '--color-chart-1',
      bg: '--color-surface',
      layer: 'md-chart',
      intent: 'non-text',
      threshold: 3,
    }
    const onContainer: ContrastPair = {
      fg: '--color-chart-3',
      bg: '--color-surface-container',
      layer: 'md-chart',
      intent: 'non-text',
      threshold: 3,
    }
    expect(familyOf(onSurface)).toBe('Chart')
    expect(familyOf(onContainer)).toBe('Chart')
  })

  it('returns "Chart" for shadcn-chart pairs regardless of bg surface', () => {
    const onBackground: ContrastPair = {
      fg: '--chart-1',
      bg: '--background',
      layer: 'shadcn-chart',
      intent: 'non-text',
      threshold: 3,
    }
    const onCard: ContrastPair = {
      fg: '--chart-4',
      bg: '--card',
      layer: 'shadcn-chart',
      intent: 'non-text',
      threshold: 3,
    }
    expect(familyOf(onBackground)).toBe('Chart')
    expect(familyOf(onCard)).toBe('Chart')
  })

  it('groups md pairs by fg family via the color-roles-list classifier', () => {
    const pair: ContrastPair = {
      fg: '--color-on-primary',
      bg: '--color-primary',
      layer: 'md',
      intent: 'text',
      threshold: 4.5,
    }
    expect(familyOf(pair)).toBe('Primary')
  })

  it('classifies md pairs by fg, not bg, when the two differ', () => {
    const pair: ContrastPair = {
      fg: '--color-on-surface',
      bg: '--color-primary',
      layer: 'md',
      intent: 'text',
      threshold: 4.5,
    }
    expect(familyOf(pair)).toBe('Surface')
  })

  it('still groups shadcn pairs by bg family', () => {
    const pair: ContrastPair = {
      fg: '--card-foreground',
      bg: '--card',
      layer: 'shadcn',
      intent: 'text',
      threshold: 4.5,
    }
    expect(familyOf(pair)).toBe('Card')
  })
})
