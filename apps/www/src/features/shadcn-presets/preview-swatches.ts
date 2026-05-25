import { deriveTheme, type Mode, type TokenMap } from '@tonex/core'
import { hexString } from '@tonex/core/oklch'
import {
  DEFAULT_INPUTS,
  type PortableTheme,
  type Seed,
  SHADCN_PRESETS,
  type ShadcnPresetName,
} from '@tonex/core/schema'

export type Swatches = {
  bg: string
  card: string
  primary: string
  secondary: string
  accent: string
}
export type PresetSwatches = Record<Mode, Swatches>

// why: the source inputs the recipe is derived against. Defaults to the
// preset's own curated seed/contrast; callers pass the *resolved* source (what
// a default preset-apply would land on — preset's seed when untouched, the
// user's when kept) so the preview mirrors the click outcome instead of an
// identity the live theme no longer has.
// why: contrastLevel is per-mode (#123) at the theme level. The override
// carries the resolved per-mode pair (what a preset-apply would land on); the
// preset's own curated contrast is a single scalar, expanded to both modes.
export type PresetSource = { seed: Seed; contrastLevel: { light: number; dark: number } }

function presetSource(name: ShadcnPresetName, override?: PresetSource): PortableTheme {
  const p = SHADCN_PRESETS[name]
  return {
    ...DEFAULT_INPUTS,
    seed: { ...(override?.seed ?? p.seed) },
    contrastLevel: override?.contrastLevel ?? { light: p.contrastLevel, dark: p.contrastLevel },
    variant: p.variant,
    surfaceAlgo: p.surfaceAlgo,
    surfacePaletteName: p.surfacePaletteName,
    surfaceTintLevel: { ...p.surfaceTintLevel },
    surfaceTintTextLevel: { ...p.surfaceTintTextLevel },
    surfaceDesaturateLevel: { ...p.surfaceDesaturateLevel },
    shadcnRoleBindings: {
      light: { ...p.shadcnRoleBindings.light },
      dark: { ...p.shadcnRoleBindings.dark },
    },
  }
}

// TokenMap is argb-canonical (ADR-0021); project to hex at the read site.
function readSwatches(layer: TokenMap): Swatches {
  return {
    bg: hexString(layer['--background']),
    card: hexString(layer['--card']),
    primary: hexString(layer['--primary']),
    secondary: hexString(layer['--secondary']),
    accent: hexString(layer['--accent']),
  }
}

// Derivation is the expensive step, so memoize by (preset + resolved source).
// The curated case (no override) keys on the name alone and stays a one-time
// derive; a kept user seed adds one entry per distinct seed/contrast tried.
const cache = new Map<string, PresetSwatches>()

function cacheKey(name: ShadcnPresetName, override?: PresetSource): string {
  if (!override) return name
  const { seed, contrastLevel } = override
  return `${name}|${seed.hue},${seed.chroma},${seed.tone},${seed.exactHex ?? ''}|${contrastLevel.light},${contrastLevel.dark}`
}

export function presetSwatches(name: ShadcnPresetName, override?: PresetSource): PresetSwatches {
  const key = cacheKey(name, override)
  const hit = cache.get(key)
  if (hit) return hit
  const derived = deriveTheme(presetSource(name, override))
  const value: PresetSwatches = {
    light: readSwatches(derived.shadcn.light),
    dark: readSwatches(derived.shadcn.dark),
  }
  cache.set(key, value)
  return value
}
