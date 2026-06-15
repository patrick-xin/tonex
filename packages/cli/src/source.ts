// why: the shared seed→theme resolver. Every subcommand audits/prints the SAME
// theme `generate` would produce, so the seed/variant/contrast/surface parsing
// lives here once and both `commands/generate` and `commands/check` call it —
// the locality that keeps the input contract from drifting between them.
import { hexFromColorInput } from '@tonex/color-utils'
import { hctFromHex } from '@tonex/core'
import { NEUTRAL_PALETTE_NAMES, type NeutralPaletteName } from '@tonex/core/data'
import { DEFAULT_INPUTS, type PortableTheme } from '@tonex/core/schema'
import { DEFAULT_VARIANT, type VariantName, variants } from '@tonex/core/variants'
import { flagValue, type ParsedArgs } from './args'
import { HELP } from './help'
import { type Io, USAGE } from './io'

// why: the shared seed+variant resolver — every subcommand audits/prints the SAME
// theme `generate` would produce. Returns the PortableTheme, or an exit code (after
// writing the error) so callers `if (typeof x === 'number') return x`. All errors
// here are usage errors (the call is wrong), hence exit 2. Seed-only input is the
// settled v0 contract; `exactHex` preserves the user's exact bytes (ADR-0028).
//
// why: the seed accepts core's `hexFromColorInput` contract — a 6-digit hex OR a
// canonical `oklch(L C H)` (the form shadcn/tweakcn emit), projected to one sRGB
// hex. It is safe HERE precisely because the seed is a lossy derivation input, not
// a WYSIWYG-pinned token (an out-of-gamut oklch loses chroma) — `exactHex` records
// the PROJECTED hex, never the raw oklch, mirroring the www seed seam. Surfacing,
// not re-implementing: core owns the firewall (ADR-0025); we never relax it.
export function parseSource(args: ParsedArgs, io: Io): PortableTheme | number {
  const seedInput = flagValue(args, '--seed')
  if (seedInput === undefined) {
    io.err(`tonex: missing required --seed <color>\n\n${HELP}\n`)
    return USAGE
  }
  const seed = hexFromColorInput(seedInput)
  if (seed === null) {
    io.err(
      `tonex: invalid seed "${seedInput}" — use a 6-digit hex (#3b82f6) or a canonical oklch(L C H)\n`,
    )
    return USAGE
  }

  const variantArg = flagValue(args, '--variant')
  if (variantArg !== undefined && !Object.hasOwn(variants, variantArg)) {
    io.err(
      `tonex: unknown variant "${variantArg}"\n  one of: ${Object.keys(variants).join(', ')}\n`,
    )
    return USAGE
  }
  const variant = (variantArg ?? DEFAULT_VARIANT) as VariantName

  // why: --contrast surfaces MCU's existing contrastLevel input — the palette-layer
  // remedy when re-mapping tokens can't reach AAA. One scalar applied uniformly to
  // both modes; the schema bounds it [0,1], so we reject out-of-range rather than
  // derive a theme the persisted shape would refuse.
  const contrastArg = flagValue(args, '--contrast')
  let contrastLevel = DEFAULT_INPUTS.contrastLevel
  if (contrastArg !== undefined) {
    const parsed = parseUnit(contrastArg, '--contrast')
    if ('error' in parsed) {
      io.err(parsed.error)
      return USAGE
    }
    contrastLevel = uniform(parsed.value)
  }

  // why: --tint / --desaturate expose the surface treatment — tonex's signature
  // departure that pulls tinted MD3 backgrounds back toward neutral. surfaceAlgo is
  // single-valued, so at most one applies. Each carries a required [0,1] strength
  // (a bare boolean would be a no-op, since DEFAULT_INPUTS surface is desaturate@0).
  const tintArg = flagValue(args, '--tint')
  const desaturateArg = flagValue(args, '--desaturate')
  const paletteArg = flagValue(args, '--tint-palette')
  if (tintArg !== undefined && desaturateArg !== undefined) {
    io.err(`tonex: --tint and --desaturate are mutually exclusive (surface uses one algo)\n`)
    return USAGE
  }
  if (paletteArg !== undefined && !(NEUTRAL_PALETTE_NAMES as readonly string[]).includes(paletteArg)) {
    io.err(
      `tonex: unknown tint palette "${paletteArg}"\n  one of: ${NEUTRAL_PALETTE_NAMES.join(', ')}\n`,
    )
    return USAGE
  }
  if (paletteArg !== undefined && tintArg === undefined) {
    io.err(`tonex: note — --tint-palette is only consumed when --tint is set\n`)
  }
  let surface: Partial<PortableTheme> = {}
  if (tintArg !== undefined) {
    const parsed = parseUnit(tintArg, '--tint')
    if ('error' in parsed) {
      io.err(parsed.error)
      return USAGE
    }
    surface = {
      surfaceAlgo: 'tint',
      surfaceTintLevel: uniform(parsed.value),
      ...(paletteArg !== undefined ? { surfacePaletteName: paletteArg as NeutralPaletteName } : {}),
    }
  } else if (desaturateArg !== undefined) {
    const parsed = parseUnit(desaturateArg, '--desaturate')
    if ('error' in parsed) {
      io.err(parsed.error)
      return USAGE
    }
    surface = { surfaceAlgo: 'desaturate', surfaceDesaturateLevel: uniform(parsed.value) }
  }

  return {
    ...DEFAULT_INPUTS,
    variant,
    contrastLevel,
    ...surface,
    seed: { ...hctFromHex(seed), exactHex: seed },
  }
}

// why: a [0,1] scalar both modes share — the per-mode split is a www-only
// affordance, so the CLI applies one level uniformly (--contrast/--tint/--desaturate).
// Shared with `commands/check` (find-contrast sweeps contrastLevel through it).
export function uniform(value: number): { light: number; dark: number } {
  return { light: value, dark: value }
}

// why: the shared [0,1]-flag validator. Returns a discriminated result rather than
// the `typeof === 'number'` exit-code trick the caller uses elsewhere — here 0 is a
// VALID level, indistinguishable from exit code 0.
function parseUnit(raw: string, name: string): { value: number } | { error: string } {
  const value = Number(raw)
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    return { error: `tonex: ${name} must be a number in [0, 1], got "${raw}"\n` }
  }
  return { value }
}
