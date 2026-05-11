import { describe, expect, it } from 'vitest'
import {
  DEFAULT_INPUTS,
  isValidHex,
  MD_CORE_TOKEN_NAMES,
  MD_EXTENDED_TOKEN_NAMES,
  MD_TOKEN_NAMES,
  type PortableTheme,
  parsePortableTheme,
  SCHEMA_VERSION,
  slugifyCustomColorName,
  validateCustomColorEntry,
} from './schema'

describe('slugifyCustomColorName', () => {
  it('lowercases and collapses non-alphanumeric runs to single dash', () => {
    expect(slugifyCustomColorName('Brand X')).toBe('brand-x')
    expect(slugifyCustomColorName('Brand   X')).toBe('brand-x')
    expect(slugifyCustomColorName('Brand_X!')).toBe('brand-x')
  })

  it('trims leading and trailing dashes', () => {
    expect(slugifyCustomColorName('  Brand  ')).toBe('brand')
    expect(slugifyCustomColorName('!!!Brand!!!')).toBe('brand')
  })

  it('returns empty string when name has no alphanumeric chars', () => {
    expect(slugifyCustomColorName('')).toBe('')
    expect(slugifyCustomColorName('   ')).toBe('')
    expect(slugifyCustomColorName('!!!')).toBe('')
  })
})

describe('validateCustomColorEntry', () => {
  const empty = new Set<string>()

  it('accepts a valid entry', () => {
    expect(validateCustomColorEntry({ name: 'Success', hex: '#22c55e' }, empty)).toBeNull()
  })

  it('rejects empty slug', () => {
    expect(validateCustomColorEntry({ name: '', hex: '#22c55e' }, empty)).toMatch(/at least one/)
    expect(validateCustomColorEntry({ name: '!!!', hex: '#22c55e' }, empty)).toMatch(/at least one/)
  })

  it('rejects collision with reserved md token roots', () => {
    expect(validateCustomColorEntry({ name: 'primary', hex: '#000000' }, empty)).toMatch(/reserved/)
    expect(validateCustomColorEntry({ name: 'surface', hex: '#000000' }, empty)).toMatch(/reserved/)
  })

  it('rejects collision with reserved shadcn role names', () => {
    expect(validateCustomColorEntry({ name: 'accent', hex: '#000000' }, empty)).toMatch(/reserved/)
    expect(validateCustomColorEntry({ name: 'destructive', hex: '#000000' }, empty)).toMatch(
      /reserved/,
    )
    expect(validateCustomColorEntry({ name: 'background', hex: '#000000' }, empty)).toMatch(
      /reserved/,
    )
  })

  it('rejects slugs starting with "on-" (would collide with on-* partner)', () => {
    expect(validateCustomColorEntry({ name: 'On Brand', hex: '#000000' }, empty)).toMatch(/on-/)
  })

  it('rejects slugs ending with "-container" or "-foreground"', () => {
    expect(validateCustomColorEntry({ name: 'Brand Container', hex: '#000000' }, empty)).toMatch(
      /-container/,
    )
    expect(validateCustomColorEntry({ name: 'Brand Foreground', hex: '#000000' }, empty)).toMatch(
      /-foreground/,
    )
  })

  it('rejects duplicate slug against existing set', () => {
    const existing = new Set(['success'])
    expect(validateCustomColorEntry({ name: 'Success', hex: '#22c55e' }, existing)).toMatch(
      /duplicates/,
    )
    // case + punctuation differences still slug to the same value
    expect(validateCustomColorEntry({ name: 'success!', hex: '#22c55e' }, existing)).toMatch(
      /duplicates/,
    )
  })

  it('rejects malformed hex', () => {
    expect(validateCustomColorEntry({ name: 'Brand', hex: '22c55e' }, empty)).toMatch(/hex/)
    expect(validateCustomColorEntry({ name: 'Brand', hex: '#22c' }, empty)).toMatch(/hex/)
    expect(validateCustomColorEntry({ name: 'Brand', hex: '#zzzzzz' }, empty)).toMatch(/hex/)
  })
})

describe('isValidHex', () => {
  it('accepts 6-digit hex with mixed case', () => {
    expect(isValidHex('#22c55e')).toBe(true)
    expect(isValidHex('#FFFFFF')).toBe(true)
    expect(isValidHex('#000000')).toBe(true)
  })

  it('rejects missing hash, wrong length, non-hex chars', () => {
    expect(isValidHex('22c55e')).toBe(false)
    expect(isValidHex('#22c')).toBe(false)
    expect(isValidHex('#22c55ezz')).toBe(false)
    expect(isValidHex('#zzzzzz')).toBe(false)
    expect(isValidHex('')).toBe(false)
  })
})

// why: ADR-0009 — schema is the v9 contract enforced post-rehydrate. These
// tests exercise the contract directly (not via the rehydrate path) so a
// regression in field-level validation surfaces here without the persist
// machinery in scope. Each rejection test mutates a single field on
// DEFAULT_INPUTS so the failing field is the only variable.
describe('parsePortableTheme', () => {
  it('round-trips DEFAULT_INPUTS', () => {
    const result = parsePortableTheme(DEFAULT_INPUTS)
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.theme).toEqual(DEFAULT_INPUTS)
  })

  it('rejects wrong schema version', () => {
    const bad = { ...DEFAULT_INPUTS, version: 8 } as unknown as PortableTheme
    expect(parsePortableTheme(bad).ok).toBe(false)
  })

  it('rejects malformed seed hex', () => {
    expect(parsePortableTheme({ ...DEFAULT_INPUTS, seedHex: 'not-a-hex' }).ok).toBe(false)
    expect(parsePortableTheme({ ...DEFAULT_INPUTS, seedHex: '#abc' }).ok).toBe(false)
  })

  it('rejects unknown variant name', () => {
    const bad = { ...DEFAULT_INPUTS, variant: 'not-a-variant' } as unknown as PortableTheme
    expect(parsePortableTheme(bad).ok).toBe(false)
  })

  it('rejects unknown surface algo', () => {
    const bad = { ...DEFAULT_INPUTS, surfaceAlgo: 'mystery' } as unknown as PortableTheme
    expect(parsePortableTheme(bad).ok).toBe(false)
  })

  it('rejects shadcn bindings missing a required role', () => {
    const partial = { ...DEFAULT_INPUTS.shadcnRoleBindings.light } as Record<string, string>
    delete partial['--background']
    const bad = {
      ...DEFAULT_INPUTS,
      shadcnRoleBindings: { light: partial, dark: DEFAULT_INPUTS.shadcnRoleBindings.dark },
    } as unknown as PortableTheme
    expect(parsePortableTheme(bad).ok).toBe(false)
  })

  it('rejects shadcn binding pointing at an unknown md token', () => {
    const broken = {
      ...DEFAULT_INPUTS.shadcnRoleBindings.light,
      '--background': '--color-not-real',
    }
    const bad = {
      ...DEFAULT_INPUTS,
      shadcnRoleBindings: { light: broken, dark: DEFAULT_INPUTS.shadcnRoleBindings.dark },
    } as unknown as PortableTheme
    expect(parsePortableTheme(bad).ok).toBe(false)
  })

  it('rejects md3 token override with malformed hex', () => {
    const bad = {
      ...DEFAULT_INPUTS,
      md3TokenOverrides: { light: { '--color-primary': 'not-hex' }, dark: {} },
    } as unknown as PortableTheme
    expect(parsePortableTheme(bad).ok).toBe(false)
  })

  it('rejects palette override under unknown palette name', () => {
    const bad = {
      ...DEFAULT_INPUTS,
      paletteOverrides: { mystery: '#ff0000' },
    } as unknown as PortableTheme
    expect(parsePortableTheme(bad).ok).toBe(false)
  })

  it('rejects custom color with invalid hex', () => {
    const bad = {
      ...DEFAULT_INPUTS,
      customColors: [
        { id: 'a', name: 'Brand', hex: 'not-hex', blend: false, shadcnSource: 'color' },
      ],
    } as unknown as PortableTheme
    expect(parsePortableTheme(bad).ok).toBe(false)
  })

  it('rejects custom color with reserved name', () => {
    const bad = {
      ...DEFAULT_INPUTS,
      customColors: [
        { id: 'a', name: 'primary', hex: '#000000', blend: false, shadcnSource: 'color' },
      ],
    } as unknown as PortableTheme
    expect(parsePortableTheme(bad).ok).toBe(false)
  })

  it('rejects two custom colors that slug to the same value', () => {
    const bad = {
      ...DEFAULT_INPUTS,
      customColors: [
        { id: 'a', name: 'Success', hex: '#22c55e', blend: false, shadcnSource: 'color' },
        { id: 'b', name: 'success!', hex: '#22c55e', blend: false, shadcnSource: 'color' },
      ],
    } as unknown as PortableTheme
    expect(parsePortableTheme(bad).ok).toBe(false)
  })

  it('rejects missing top-level required field', () => {
    const partial = { ...DEFAULT_INPUTS } as Partial<PortableTheme>
    delete partial.surfacePaletteName
    expect(parsePortableTheme(partial).ok).toBe(false)
  })

  it('rejects non-object input', () => {
    expect(parsePortableTheme(null).ok).toBe(false)
    expect(parsePortableTheme(undefined).ok).toBe(false)
    expect(parsePortableTheme('string').ok).toBe(false)
    expect(parsePortableTheme(42).ok).toBe(false)
  })

  // why: ADR-0026 slice override-1 R1 — shadcnRoleOverrides parallels
  // md3TokenOverrides: per-mode partial map of role → hex. Empty default,
  // sparse entries, hex-validated values, role-keyed (closed enum). Each
  // rejection mutates one field to isolate the failing constraint.
  it('shadcnRoleOverrides defaults to empty per-mode maps', () => {
    expect(DEFAULT_INPUTS.shadcnRoleOverrides).toEqual({ light: {}, dark: {} })
    expect(parsePortableTheme(DEFAULT_INPUTS).ok).toBe(true)
  })

  it('accepts sparse shadcnRoleOverrides entries on either mode', () => {
    const ok = {
      ...DEFAULT_INPUTS,
      shadcnRoleOverrides: {
        light: { '--ring': '#abcdef' },
        dark: { '--background': '#112233', '--ring': '#445566' },
      },
    } as PortableTheme
    expect(parsePortableTheme(ok).ok).toBe(true)
  })

  it('rejects shadcnRoleOverrides with malformed hex', () => {
    const bad = {
      ...DEFAULT_INPUTS,
      shadcnRoleOverrides: { light: { '--ring': 'not-hex' }, dark: {} },
    } as unknown as PortableTheme
    expect(parsePortableTheme(bad).ok).toBe(false)
  })

  it('rejects shadcnRoleOverrides under unknown role key', () => {
    const bad = {
      ...DEFAULT_INPUTS,
      shadcnRoleOverrides: { light: { '--not-a-role': '#abcdef' }, dark: {} },
    } as unknown as PortableTheme
    expect(parsePortableTheme(bad).ok).toBe(false)
  })

  // why: ADR-0027 c.6 slice chart-2 — chart override layer mirrors role
  // override schema modulo the key domain (SHADCN_CHART_TOKEN_NAMES vs
  // SHADCN_ROLE_NAMES). Same validation surface, same sparse-default
  // shape, same rejection modes.
  it('shadcnChartOverrides defaults to empty per-mode maps', () => {
    expect(DEFAULT_INPUTS.shadcnChartOverrides).toEqual({ light: {}, dark: {} })
    expect(parsePortableTheme(DEFAULT_INPUTS).ok).toBe(true)
  })

  it('accepts sparse shadcnChartOverrides entries on either mode', () => {
    const ok = {
      ...DEFAULT_INPUTS,
      shadcnChartOverrides: {
        light: { '--chart-1': '#abcdef' },
        dark: { '--chart-2': '#112233', '--chart-5': '#445566' },
      },
    } as PortableTheme
    expect(parsePortableTheme(ok).ok).toBe(true)
  })

  it('rejects shadcnChartOverrides with malformed hex', () => {
    const bad = {
      ...DEFAULT_INPUTS,
      shadcnChartOverrides: { light: { '--chart-1': 'not-hex' }, dark: {} },
    } as unknown as PortableTheme
    expect(parsePortableTheme(bad).ok).toBe(false)
  })

  it('rejects shadcnChartOverrides under unknown chart token key', () => {
    const bad = {
      ...DEFAULT_INPUTS,
      shadcnChartOverrides: { light: { '--chart-99': '#abcdef' }, dark: {} },
    } as unknown as PortableTheme
    expect(parsePortableTheme(bad).ok).toBe(false)
  })

  // why: issue #33 — schema-level range pin. Setter clamps actively;
  // schema rejects so any path that bypasses the setter (rehydration of
  // a stale persisted blob, programmatic state injection) cannot land
  // an inert out-of-range value.
  it('contrastLevel must be within [0, 1]', () => {
    expect(parsePortableTheme({ ...DEFAULT_INPUTS, contrastLevel: 0 }).ok).toBe(true)
    expect(parsePortableTheme({ ...DEFAULT_INPUTS, contrastLevel: 0.5 }).ok).toBe(true)
    expect(parsePortableTheme({ ...DEFAULT_INPUTS, contrastLevel: 1 }).ok).toBe(true)
    expect(parsePortableTheme({ ...DEFAULT_INPUTS, contrastLevel: -0.01 }).ok).toBe(false)
    expect(parsePortableTheme({ ...DEFAULT_INPUTS, contrastLevel: -1 }).ok).toBe(false)
    expect(parsePortableTheme({ ...DEFAULT_INPUTS, contrastLevel: 1.01 }).ok).toBe(false)
    expect(parsePortableTheme({ ...DEFAULT_INPUTS, contrastLevel: 2 }).ok).toBe(false)
  })

  it('cmfSecondSourceHex accepts null OR a valid hex', () => {
    expect(parsePortableTheme({ ...DEFAULT_INPUTS, cmfSecondSourceHex: null }).ok).toBe(true)
    expect(parsePortableTheme({ ...DEFAULT_INPUTS, cmfSecondSourceHex: '#ff8800' }).ok).toBe(true)
    expect(
      parsePortableTheme({ ...DEFAULT_INPUTS, cmfSecondSourceHex: 'not-hex' } as unknown).ok,
    ).toBe(false)
  })

  // why: chart axis is a nested object under `chart` (ADR-0027 c.1). Picklist
  // starts at categorical + sequential per c.2; diverging is reserved in the
  // trajectory but lives in a future slice — schema must reject it now so
  // premature adoption can't slip through a stale persisted blob or test fixture.
  it('chart.scheme picklist is categorical and sequential only', () => {
    expect(parsePortableTheme({ ...DEFAULT_INPUTS, chart: { scheme: 'categorical' } }).ok).toBe(
      true,
    )
    expect(parsePortableTheme({ ...DEFAULT_INPUTS, chart: { scheme: 'sequential' } }).ok).toBe(true)
    expect(parsePortableTheme({ ...DEFAULT_INPUTS, chart: { scheme: 'diverging' } }).ok).toBe(false)
    expect(parsePortableTheme({ ...DEFAULT_INPUTS, chart: { scheme: 'foo' } }).ok).toBe(false)
  })

  // why: SCHEMA_VERSION reference — guards against the literal in the schema
  // drifting from the exported constant.
  it('uses SCHEMA_VERSION as the version literal', () => {
    expect(DEFAULT_INPUTS.version).toBe(SCHEMA_VERSION)
  })
})

describe('md token partitions (ADR-0021)', () => {
  it('CORE and EXTENDED partition MD_TOKEN_NAMES exhaustively (28 + 22 = 50)', () => {
    // why: future md-token additions must land in exactly one tier. Drift
    // here would silently move a token's tier (or drop it from emission); the
    // dual count + union check catches both modes.
    expect(MD_CORE_TOKEN_NAMES.length).toBe(28)
    expect(MD_EXTENDED_TOKEN_NAMES.length).toBe(22)
    expect(MD_TOKEN_NAMES.length).toBe(50)
    const union = new Set<string>([...MD_CORE_TOKEN_NAMES, ...MD_EXTENDED_TOKEN_NAMES])
    expect(union.size).toBe(MD_TOKEN_NAMES.length)
    for (const name of MD_TOKEN_NAMES) expect(union.has(name)).toBe(true)
  })

  it('CORE and EXTENDED do not overlap', () => {
    const coreSet = new Set<string>(MD_CORE_TOKEN_NAMES)
    for (const name of MD_EXTENDED_TOKEN_NAMES) expect(coreSet.has(name)).toBe(false)
  })
})
