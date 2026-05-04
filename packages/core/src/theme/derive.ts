import { argbFromHex, Hct, hexFromArgb, MaterialDynamicColors, TonalPalette } from '@tonex/mcu'
import { variants } from '../variants'
import type { PortableTheme, ShadcnRoleBindings } from './schema'
import { applySurfaceDesaturate } from './surfaceDesaturate'
import { applySurfaceTint } from './surfaceTint'

// TODO(slice 2): emit OKLCH instead of hex. shadcn v4 + Tailwind v4 conventions
// expect oklch(...) values; hex is the slice-1 placeholder. Migration also
// requires re-baselining globals.css and the drift-guard.

export type TokenMap = Record<string, string>

export interface ResolvedLayer {
  light: TokenMap
  dark: TokenMap
}

// why: lean spine — `md` and `shadcn` are the two layers the export path
// emits. Surface-treatment algorithms run inline below (between md emit and
// shadcn bind) so applyDom AND formatCss reflect the same treated tokens by
// construction. ADR-0017 holds because preview === export both consume the
// same DerivedTheme; treatment is a transform on `md`, not a parallel field.
export interface DerivedTheme {
  md: ResolvedLayer
  shadcn: ResolvedLayer
  warnings: string[]
}

const mdc = new MaterialDynamicColors()

// why: bindings are data, not code — the mapping rule is now a runtime
// lookup against md emitted tokens. Mode-keyed because slice 7 will admit
// cross-mode divergence. ADR-0017.
function bindShadcn(mdLayer: TokenMap, bindings: ShadcnRoleBindings): TokenMap {
  const primary = mdLayer[bindings['--primary']]
  const primaryFg = mdLayer[bindings['--primary-foreground']]
  if (primary === undefined || primaryFg === undefined) {
    throw new Error(`[bindShadcn] binding references missing md token: ${JSON.stringify(bindings)}`)
  }
  return { '--primary': primary, '--primary-foreground': primaryFg }
}

// why: deriveTheme is THE spine. Both modes co-derive in one call so a
// second `deriveTheme` for "the other mode" cannot exist by construction.
// Source has no top-level `mode` field; mode is owned by next-themes on
// <html class="dark"> and selected via cascade. See ADR-0017.
//
// Cross-layer mapping is now driven by source.shadcnRoleBindings (per-mode).
// Default bindings (DEFAULT_SHADCN_ROLE_BINDINGS) preserve the slice-1
// hardcoded rule: shadcn primary ← md primary-container; foreground ← md
// on-primary-container. Editing the bindings flows directly to the shadcn
// layer without touching md, by construction.
export function deriveTheme(source: PortableTheme): DerivedTheme {
  const seedHct = Hct.fromInt(argbFromHex(source.seedHex))
  const variant = variants[source.variant]

  const lightScheme = variant.build(seedHct, false, source.contrastLevel)
  const darkScheme = variant.build(seedHct, true, source.contrastLevel)

  // why: override applies after MCU emit, mode-keyed (ADR-0017). on-primary-container
  // stays MCU-derived — auto-contrast against the overridden bg is slice 6+ work;
  // for now contrast is the user's responsibility when overriding.
  const overrideLight = source.md3PrimaryContainerOverride.light
  const overrideDark = source.md3PrimaryContainerOverride.dark

  const primaryLight = applyPrimaryLock(
    {
      '--color-primary': hexFromArgb(mdc.primary().getArgb(lightScheme)),
      '--color-on-primary': hexFromArgb(mdc.onPrimary().getArgb(lightScheme)),
      '--color-primary-container':
        overrideLight ?? hexFromArgb(mdc.primaryContainer().getArgb(lightScheme)),
      '--color-on-primary-container': hexFromArgb(mdc.onPrimaryContainer().getArgb(lightScheme)),
    },
    'light',
    source.primaryHexLock.light,
    overrideLight,
  )
  const primaryDark = applyPrimaryLock(
    {
      '--color-primary': hexFromArgb(mdc.primary().getArgb(darkScheme)),
      '--color-on-primary': hexFromArgb(mdc.onPrimary().getArgb(darkScheme)),
      '--color-primary-container':
        overrideDark ?? hexFromArgb(mdc.primaryContainer().getArgb(darkScheme)),
      '--color-on-primary-container': hexFromArgb(mdc.onPrimaryContainer().getArgb(darkScheme)),
    },
    'dark',
    source.primaryHexLock.dark,
    overrideDark,
  )

  const mdLight: TokenMap = {
    ...primaryLight,
    '--color-surface': hexFromArgb(mdc.surface().getArgb(lightScheme)),
    '--color-surface-container': hexFromArgb(mdc.surfaceContainer().getArgb(lightScheme)),
    '--color-surface-container-high': hexFromArgb(mdc.surfaceContainerHigh().getArgb(lightScheme)),
    '--color-on-surface': hexFromArgb(mdc.onSurface().getArgb(lightScheme)),
  }
  const mdDark: TokenMap = {
    ...primaryDark,
    '--color-surface': hexFromArgb(mdc.surface().getArgb(darkScheme)),
    '--color-surface-container': hexFromArgb(mdc.surfaceContainer().getArgb(darkScheme)),
    '--color-surface-container-high': hexFromArgb(mdc.surfaceContainerHigh().getArgb(darkScheme)),
    '--color-on-surface': hexFromArgb(mdc.onSurface().getArgb(darkScheme)),
  }

  // why: treatment runs BEFORE shadcn binds so any binding pointed at a
  // surface token reflects the treated value automatically. Default
  // surfaceAlgo='none' is the zero-cost branch — drift-guard baseline holds.
  const treatedLight = applyTreatment(mdLight, 'light', source)
  const treatedDark = applyTreatment(mdDark, 'dark', source)

  return {
    md: { light: treatedLight, dark: treatedDark },
    shadcn: {
      light: bindShadcn(treatedLight, source.shadcnRoleBindings.light),
      dark: bindShadcn(treatedDark, source.shadcnRoleBindings.dark),
    },
    warnings: [],
  }
}

function applyTreatment(layer: TokenMap, mode: 'light' | 'dark', source: PortableTheme): TokenMap {
  if (source.surfaceAlgo === 'tint') return applySurfaceTint(layer, mode, source.surfaceTintLevel)
  if (source.surfaceAlgo === 'desaturate')
    return applySurfaceDesaturate(layer, source.surfaceDesaturateLevel)
  return layer
}

// why: M3 baseline tones for the primary family. When the user pins primary
// to an exact hex, build a TonalPalette from the locked HCT (preserves hue +
// chroma) and read these tones for the derived siblings. Container-override
// still wins over the lock-derived container — overrides are the lower-level
// escape hatch when the auto-derive doesn't match the user's intent.
const PRIMARY_FAMILY_TONES: Record<
  'light' | 'dark',
  { onPrimary: number; container: number; onContainer: number }
> = {
  light: { onPrimary: 100, container: 90, onContainer: 10 },
  dark: { onPrimary: 20, container: 30, onContainer: 90 },
}

function applyPrimaryLock(
  family: TokenMap,
  mode: 'light' | 'dark',
  lockedHex: string | null,
  containerOverride: string | null,
): TokenMap {
  if (!lockedHex) return family
  const palette = TonalPalette.fromHct(Hct.fromInt(argbFromHex(lockedHex)))
  const tones = PRIMARY_FAMILY_TONES[mode]
  return {
    '--color-primary': lockedHex,
    '--color-on-primary': hexFromArgb(palette.tone(tones.onPrimary)),
    '--color-primary-container': containerOverride ?? hexFromArgb(palette.tone(tones.container)),
    '--color-on-primary-container': hexFromArgb(palette.tone(tones.onContainer)),
  }
}
