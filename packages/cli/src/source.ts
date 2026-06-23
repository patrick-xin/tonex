// why: the shared seed→theme resolver. Every subcommand audits/prints the SAME
// theme `generate` would produce, so the seed/variant/contrast/surface parsing
// lives here once and both `commands/generate` and `commands/check` call it —
// the locality that keeps the input contract from drifting between them.
import { hexFromColorInput } from '@tonex/color-utils'
import { hctFromHex } from '@tonex/core'
import { NEUTRAL_PALETTE_NAMES, type NeutralPaletteName } from '@tonex/core/data'
import {
  CHART_PALETTES,
  type CustomColorEntry,
  chartPaletteToInputs,
  cmfSecondSourceDisabledReason,
  DEFAULT_INPUTS,
  isChartPalette,
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
// canonical `oklch(L C H)`, projected to one sRGB
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

  // why: --contrast / --contrast-light / --contrast-dark surface MCU's contrastLevel.
  // Base flag sets both modes uniformly (the common case, back-compat); per-mode flags
  // override a single mode. Resolution: per-mode wins, base fills the other, absence
  // falls back to the schema default. Out-of-range is exit 2 per flag, not a clamp.
  const contrastArg = flagValue(args, '--contrast')
  const contrastLightArg = flagValue(args, '--contrast-light')
  const contrastDarkArg = flagValue(args, '--contrast-dark')
  let contrastLevel = DEFAULT_INPUTS.contrastLevel
  if (
    contrastArg !== undefined ||
    contrastLightArg !== undefined ||
    contrastDarkArg !== undefined
  ) {
    const resolved = resolveModeLevel(
      contrastArg,
      contrastLightArg,
      contrastDarkArg,
      DEFAULT_INPUTS.contrastLevel.light,
      '--contrast',
      '--contrast-light',
      '--contrast-dark',
    )
    if ('error' in resolved) {
      io.err(resolved.error)
      return USAGE
    }
    contrastLevel = resolved
  }

  // why: --tint / --desaturate expose the surface treatment — tonex's signature
  // departure that pulls tinted MD3 backgrounds back toward neutral. surfaceAlgo is
  // single-valued across modes, so at most one algo applies. Per-mode flags
  // (--tint-light/dark, --desaturate-light/dark) override only their mode; the base
  // flag fills the other; absence falls back to the schema default. Any mix of tint
  // and desaturate flags is a usage error (surface uses one algo).
  const tintArg = flagValue(args, '--tint')
  const tintLightArg = flagValue(args, '--tint-light')
  const tintDarkArg = flagValue(args, '--tint-dark')
  const desaturateArg = flagValue(args, '--desaturate')
  const desaturateLightArg = flagValue(args, '--desaturate-light')
  const desaturateDarkArg = flagValue(args, '--desaturate-dark')
  const paletteArg = flagValue(args, '--tint-palette')
  const tintTextArg = flagValue(args, '--tint-text')
  const tintTextLightArg = flagValue(args, '--tint-text-light')
  const tintTextDarkArg = flagValue(args, '--tint-text-dark')

  const hasTint = tintArg !== undefined || tintLightArg !== undefined || tintDarkArg !== undefined
  const hasDesaturate =
    desaturateArg !== undefined ||
    desaturateLightArg !== undefined ||
    desaturateDarkArg !== undefined
  const hasTintText =
    tintTextArg !== undefined || tintTextLightArg !== undefined || tintTextDarkArg !== undefined

  if (hasTint && hasDesaturate) {
    io.err(`tonex: --tint and --desaturate flags are mutually exclusive (surface uses one algo)\n`)
    return USAGE
  }
  // why: surfaceTintTextLevel is consumed by deriveTheme ONLY under the tint algo
  // (applyTreatment routes desaturate to a path that ignores it). Setting --tint-text
  // without --tint would silently no-op, so we reject it loudly — the same contract as
  // --second-color on a non-cmf variant. "Neutral surfaces + brand text" is reachable
  // as `--tint 0 --tint-text <0..1>` (tint level 0 = max-neutral surfaces).
  if (hasTintText && !hasTint) {
    io.err(
      `tonex: --tint-text requires --tint (text tint is consumed only under the tint surface algo)\n  for neutral surfaces + brand text, use --tint 0 --tint-text <0..1>\n`,
    )
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
  if (paletteArg !== undefined && !hasTint) {
    io.err(`tonex: note — --tint-palette is only consumed when --tint is set\n`)
  }

  let surface: Partial<PortableTheme> = {}
  if (hasTint) {
    const level = resolveModeLevel(
      tintArg,
      tintLightArg,
      tintDarkArg,
      DEFAULT_INPUTS.surfaceTintLevel.light,
      '--tint',
      '--tint-light',
      '--tint-dark',
    )
    if ('error' in level) {
      io.err(level.error)
      return USAGE
    }
    surface = {
      surfaceAlgo: 'tint',
      surfaceTintLevel: level,
      ...(paletteArg !== undefined ? { surfacePaletteName: paletteArg as NeutralPaletteName } : {}),
    }
  } else if (hasDesaturate) {
    const level = resolveModeLevel(
      desaturateArg,
      desaturateLightArg,
      desaturateDarkArg,
      DEFAULT_INPUTS.surfaceDesaturateLevel.light,
      '--desaturate',
      '--desaturate-light',
      '--desaturate-dark',
    )
    if ('error' in level) {
      io.err(level.error)
      return USAGE
    }
    surface = { surfaceAlgo: 'desaturate', surfaceDesaturateLevel: level }
  }

  // why: --tint-text / --tint-text-light / --tint-text-dark surface
  // surfaceTintTextLevel — the brand-accent tint on on-surface/on-surface-variant
  // text. Decoupled from surfaceTintLevel (text can tint while surfaces stay neutral),
  // but consumed only under the tint algo — guarded above so it never silently no-ops.
  if (hasTintText) {
    const level = resolveModeLevel(
      tintTextArg,
      tintTextLightArg,
      tintTextDarkArg,
      DEFAULT_INPUTS.surfaceTintTextLevel.light,
      '--tint-text',
      '--tint-text-light',
      '--tint-text-dark',
    )
    if ('error' in level) {
      io.err(level.error)
      return USAGE
    }
    surface = { ...surface, surfaceTintTextLevel: level }
  }

  // why: --custom adds user color(s) on top of the seed-derived palette. A
  // source-level knob (it shapes the derived theme), so it lives in the shared
  // resolver — generate emits the custom tokens and check gates their pairs off
  // the SAME PortableTheme. Returns the entries or an exit code (already written).
  const customColors = parseCustomColors(args, io)
  if (typeof customColors === 'number') return customColors

  // why: --chart-palette surfaces the chart axis as the single/multi/polychrome
  // vocabulary the www toggle speaks — chartPaletteToInputs is the SHARED map, so
  // CLI and GUI resolve the same label to the same chart.scheme/hueSpread (no
  // duplicated constants). A derivation-source knob, so it lives in the shared
  // resolver: generate emits the chart block and serialize freezes the config off
  // the SAME chart inputs. Absence leaves DEFAULT_INPUTS.chart (the default ramp)
  // untouched; an out-of-set value is a loud usage error, never a silent default.
  // hueAnchor stays at the default — the raw degree knobs aren't exposed (#227).
  const chartPaletteArg = flagValue(args, '--chart-palette')
  let chart = DEFAULT_INPUTS.chart
  if (chartPaletteArg !== undefined) {
    if (!isChartPalette(chartPaletteArg)) {
      io.err(
        `tonex: unknown chart palette "${chartPaletteArg}"\n  one of: ${CHART_PALETTES.join(', ')}\n`,
      )
      return USAGE
    }
    chart = { ...DEFAULT_INPUTS.chart, ...chartPaletteToInputs(chartPaletteArg) }
  }

  return {
    ...DEFAULT_INPUTS,
    variant,
    cmfSecondSourceHex,
    contrastLevel,
    ...surface,
    customColors,
    chart,
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

// why: a [0,1] scalar applied to both modes — used by find-contrast's bisect sweep,
// which searches for a uniform --contrast remedy (per PRD #218: per-mode find-contrast
// is a noted extension). Shared with `commands/check`.
export function uniform(value: number): { light: number; dark: number } {
  return { light: value, dark: value }
}

// why: the per-mode resolver for all four level knobs (contrast/tint/desaturate/tintText).
// Resolution rule: per-mode flag wins for its mode; base flag fills the other mode;
// absence falls back to the schema default. Returns a discriminated result so 0 (a
// valid level) is distinguishable from an exit code — the caller maps { error } to USAGE.
function resolveModeLevel(
  base: string | undefined,
  light: string | undefined,
  dark: string | undefined,
  defaultVal: number,
  baseName: string,
  lightName: string,
  darkName: string,
): { light: number; dark: number } | { error: string } {
  let baseVal: number | undefined
  let lightVal: number | undefined
  let darkVal: number | undefined

  if (base !== undefined) {
    const p = parseUnit(base, baseName)
    if ('error' in p) return p
    baseVal = p.value
  }
  if (light !== undefined) {
    const p = parseUnit(light, lightName)
    if ('error' in p) return p
    lightVal = p.value
  }
  if (dark !== undefined) {
    const p = parseUnit(dark, darkName)
    if ('error' in p) return p
    darkVal = p.value
  }

  return {
    light: lightVal ?? baseVal ?? defaultVal,
    dark: darkVal ?? baseVal ?? defaultVal,
  }
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
