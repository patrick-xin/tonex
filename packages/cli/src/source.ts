// why: the shared seed→theme resolver. Every subcommand audits/prints the SAME
// theme `generate` would produce, so the seed/variant/contrast/surface parsing
// lives here once and both `commands/generate` and `commands/check` call it —
// the locality that keeps the input contract from drifting between them.
import { hexFromColorInput } from '@tonex/color-utils'
import { hctFromHex } from '@tonex/core'
import { NEUTRAL_PALETTE_NAMES, type NeutralPaletteName } from '@tonex/core/data'
import {
  type CustomColorEntry,
  cmfSecondSourceDisabledReason,
  DEFAULT_INPUTS,
  type PortableTheme,
  slugifyCustomColorName,
  validateCustomColorEntry,
} from '@tonex/core/schema'
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

  // why: --second-color surfaces core's cmfSecondSourceHex — the second source the
  // CMF scheme reads to rebuild the tertiary palette + shift the error hue. Same
  // color firewall as --seed (hex or oklch → projected sRGB). Gated by core's
  // cmfSecondSourceDisabledReason (single source of the "cmf only" rule, surfaced
  // not reimplemented): a value on a non-cmf variant would be a silent no-op, so we
  // reject it loudly as a usage error rather than derive a theme unchanged by it.
  const secondColorArg = flagValue(args, '--second-color')
  let cmfSecondSourceHex: string | null = null
  if (secondColorArg !== undefined) {
    const second = hexFromColorInput(secondColorArg)
    if (second === null) {
      io.err(
        `tonex: invalid --second-color "${secondColorArg}" — use a 6-digit hex (#ff8800) or a canonical oklch(L C H)\n`,
      )
      return USAGE
    }
    const disabled = cmfSecondSourceDisabledReason({ ...DEFAULT_INPUTS, variant })
    if (disabled !== null) {
      io.err(`tonex: ${disabled} (current variant: ${variant})\n`)
      return USAGE
    }
    cmfSecondSourceHex = second
  }

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
  if (
    paletteArg !== undefined &&
    !(NEUTRAL_PALETTE_NAMES as readonly string[]).includes(paletteArg)
  ) {
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

  // why: --custom adds user color(s) on top of the seed-derived palette. A
  // source-level knob (it shapes the derived theme), so it lives in the shared
  // resolver — generate emits the custom tokens and check gates their pairs off
  // the SAME PortableTheme. Returns the entries or an exit code (already written).
  const customColors = parseCustomColors(args, io)
  if (typeof customColors === 'number') return customColors

  return {
    ...DEFAULT_INPUTS,
    variant,
    cmfSecondSourceHex,
    contrastLevel,
    ...surface,
    customColors,
    seed: { ...hctFromHex(seed), exactHex: seed },
  }
}

// why: parse --custom into core's CustomColorEntry[]. Agent-first JSON batch,
// mirroring --pairs/--shifts (inline JSON keeps `run` pure). The CLI shape-checks
// the envelope (object entries, string name/hex, optional boolean blend / enum
// shadcnSource), then defers the DOMAIN rules to core's validateCustomColorEntry
// — reserved-name + slug-collision + hex — surfaced, never reimplemented. The
// accumulating `slugs` set threads in-batch duplicate detection (core validates
// one entry at a time against the set of the others). hex takes the --seed color
// contract (hex or oklch) through the same firewall, projected to the sRGB hex
// MCU reads. `id` is the slug (stable, unique post-validation) since the CLI is
// stateless — there is no CRUD identity to preserve across calls.
function parseCustomColors(args: ParsedArgs, io: Io): CustomColorEntry[] | number {
  const raw = flagValue(args, '--custom')
  if (raw === undefined) return []

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    io.err(`tonex: --custom is not valid JSON\n`)
    return USAGE
  }
  if (!Array.isArray(parsed) || parsed.length === 0) {
    io.err(
      `tonex: --custom must be a non-empty JSON array of {name, hex, blend?, shadcnSource?} entries\n`,
    )
    return USAGE
  }

  const entries: CustomColorEntry[] = []
  const slugs = new Set<string>()
  for (const item of parsed) {
    if (typeof item !== 'object' || item === null || Array.isArray(item)) {
      io.err(
        `tonex: each --custom entry must be an object {name, hex, blend?, shadcnSource?}; bad entry ${JSON.stringify(item)}\n`,
      )
      return USAGE
    }
    const e = item as Record<string, unknown>
    if (typeof e.name !== 'string' || typeof e.hex !== 'string') {
      io.err(
        `tonex: each --custom entry needs a string "name" and "hex"; bad entry ${JSON.stringify(item)}\n`,
      )
      return USAGE
    }
    if (e.blend !== undefined && typeof e.blend !== 'boolean') {
      io.err(`tonex: --custom "blend" must be true or false; bad entry ${JSON.stringify(item)}\n`)
      return USAGE
    }
    if (
      e.shadcnSource !== undefined &&
      e.shadcnSource !== 'color' &&
      e.shadcnSource !== 'container'
    ) {
      io.err(
        `tonex: --custom "shadcnSource" must be "color" or "container"; bad entry ${JSON.stringify(item)}\n`,
      )
      return USAGE
    }
    if (e.description !== undefined && typeof e.description !== 'string') {
      io.err(`tonex: --custom "description" must be a string; bad entry ${JSON.stringify(item)}\n`)
      return USAGE
    }
    const hex = hexFromColorInput(e.hex)
    if (hex === null) {
      io.err(
        `tonex: invalid --custom hex "${e.hex}" — use a 6-digit hex (#22c55e) or a canonical oklch(L C H)\n`,
      )
      return USAGE
    }
    const invalid = validateCustomColorEntry({ name: e.name, hex }, slugs)
    if (invalid !== null) {
      io.err(`tonex: --custom — ${invalid}\n`)
      return USAGE
    }
    const slug = slugifyCustomColorName(e.name)
    slugs.add(slug)
    entries.push({
      id: slug,
      name: e.name,
      ...(e.description !== undefined ? { description: e.description as string } : {}),
      hex,
      blend: e.blend === undefined ? true : (e.blend as boolean),
      shadcnSource: (e.shadcnSource as 'color' | 'container' | undefined) ?? 'color',
    })
  }
  return entries
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
