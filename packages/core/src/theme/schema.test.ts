import { describe, expect, it } from 'vitest'
import {
  DEFAULT_INPUTS,
  MD_CORE_TOKEN_NAMES,
  MD_EXTENDED_TOKEN_NAMES,
  MD_TOKEN_NAMES,
  type PortableTheme,
  parsePortableTheme,
  SCHEMA_VERSION,
} from './schema'

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

  it('rejects malformed seed (ADR-0028)', () => {
    expect(
      parsePortableTheme({ ...DEFAULT_INPUTS, seed: { hue: 999, chroma: 0, tone: 50 } }).ok,
    ).toBe(false)
    expect(
      parsePortableTheme({ ...DEFAULT_INPUTS, seed: { hue: 0, chroma: -1, tone: 50 } }).ok,
    ).toBe(false)
    expect(
      parsePortableTheme({ ...DEFAULT_INPUTS, seed: { hue: 0, chroma: 0, tone: 999 } }).ok,
    ).toBe(false)
    // exactHex must be a valid hex when present (optional, so omission is ok)
    expect(
      parsePortableTheme({
        ...DEFAULT_INPUTS,
        seed: { hue: 0, chroma: 0, tone: 50, exactHex: 'not-a-hex' },
      }).ok,
    ).toBe(false)
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
  // why: #123 — contrastLevel is per-mode `{ light, dark }`; each mode is
  // bounded [0, 1] independently. A scalar (the pre-#123 shape) must now fail.
  it('contrastLevel must be a per-mode pair with each mode within [0, 1]', () => {
    expect(parsePortableTheme({ ...DEFAULT_INPUTS, contrastLevel: { light: 0, dark: 0 } }).ok).toBe(
      true,
    )
    expect(
      parsePortableTheme({ ...DEFAULT_INPUTS, contrastLevel: { light: 0.5, dark: 1 } }).ok,
    ).toBe(true)
    expect(
      parsePortableTheme({ ...DEFAULT_INPUTS, contrastLevel: { light: -0.01, dark: 0 } }).ok,
    ).toBe(false)
    expect(
      parsePortableTheme({ ...DEFAULT_INPUTS, contrastLevel: { light: 0, dark: 1.01 } }).ok,
    ).toBe(false)
    // a bare scalar is the old shape — rejected
    expect(parsePortableTheme({ ...DEFAULT_INPUTS, contrastLevel: 0.5 }).ok).toBe(false)
    // a half-populated pair is rejected
    expect(parsePortableTheme({ ...DEFAULT_INPUTS, contrastLevel: { light: 0.5 } }).ok).toBe(false)
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
    expect(
      parsePortableTheme({
        ...DEFAULT_INPUTS,
        chart: { ...DEFAULT_INPUTS.chart, scheme: 'categorical' },
      }).ok,
    ).toBe(true)
    expect(
      parsePortableTheme({
        ...DEFAULT_INPUTS,
        chart: { ...DEFAULT_INPUTS.chart, scheme: 'sequential' },
      }).ok,
    ).toBe(true)
    expect(
      parsePortableTheme({
        ...DEFAULT_INPUTS,
        chart: { ...DEFAULT_INPUTS.chart, scheme: 'diverging' },
      } as unknown).ok,
    ).toBe(false)
    expect(
      parsePortableTheme({
        ...DEFAULT_INPUTS,
        chart: { ...DEFAULT_INPUTS.chart, scheme: 'foo' },
      } as unknown).ok,
    ).toBe(false)
  })

  // why: ADR-0027 c.3 — chart.hueSpread is degrees of hue rotation between
  // chart-1 and chart-N under sequential. Bounded [0, 360]: 0 = single-hue
  // opt-in; 360 = full-wheel rotation (degenerates back to chart-1's hue at
  // the far slot but the algorithm tolerates it). Negative or > 360 falls
  // outside the supported range — reject so persisted blobs can't carry
  // pathological values into the engine.
  it('chart.hueSpread accepts [0, 360]; rejects out-of-range', () => {
    const make = (hueSpread: number) => ({
      ...DEFAULT_INPUTS,
      chart: { ...DEFAULT_INPUTS.chart, hueSpread },
    })
    expect(parsePortableTheme(make(0)).ok).toBe(true)
    expect(parsePortableTheme(make(80)).ok).toBe(true)
    expect(parsePortableTheme(make(360)).ok).toBe(true)
    expect(parsePortableTheme(make(-1)).ok).toBe(false)
    expect(parsePortableTheme(make(361)).ok).toBe(false)
  })

  // why: ADR-0027 c.3 — chart.hueAnchor picks which slot pins to the seed
  // hue under multi-hue (hueSpread > 0). Two strategies — chart-1 anchor
  // preserves chart-i hue identity across modes; prominent-edge anchor
  // preserves the "brand at the deep end" mental model. Schema enforces the
  // closed picklist so unknown strategies don't silently degrade to a
  // default at the engine seam.
  it('chart.hueAnchor picklist is chart-1 and prominent-edge only', () => {
    const make = (hueAnchor: string) => ({
      ...DEFAULT_INPUTS,
      chart: { ...DEFAULT_INPUTS.chart, hueAnchor },
    })
    expect(parsePortableTheme(make('chart-1')).ok).toBe(true)
    expect(parsePortableTheme(make('prominent-edge')).ok).toBe(true)
    expect(parsePortableTheme(make('chart-N')).ok).toBe(false)
    expect(parsePortableTheme(make('foo')).ok).toBe(false)
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
