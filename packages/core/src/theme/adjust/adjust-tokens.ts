import { hexFromArgb } from '@tonex/mcu'
import { deriveTheme } from '../derive'
import { nearestName } from '../edit-distance'
import { MODES, type Mode } from '../mode'
import {
  DEFAULT_SHADCN_ROLE_BINDINGS,
  MD_EXTENDED_TOKEN_NAMES,
  MD_TOKEN_NAMES,
  type MdTokenName,
  type PortableTheme,
  SHADCN_ROLE_NAMES,
} from '../schema'
import { BARE_MD_ROLE_NAMES, bareMdName, COLOR_PREFIX, canonicalMdName } from '../token-vocab'
import { shiftHct } from './shift-hct'

// why: an adjust request names a (mode, token) target and a relative ±HCT delta
// (tone + chroma move TOGETHER; hue is not an axis — see shift-hct). `token` is
// the PUBLIC bare md role name the agent read from `--to colors` (`primary`,
// `on-surface`); adjustTokens canonicalizes it. Typed `string` because the CLI
// feeds raw input validated at runtime — the bare form is not the canonical
// MdTokenName union. At least one axis must be present; an omitted axis is
// normalized to 0, but a request with NEITHER carries no instruction and is an
// input error (validated below).
export interface AdjustRequest {
  mode: Mode
  token: string
  dTone?: number
  dChroma?: number
}

// why: the per-request FACT the CLI surfaces. `before`/`after` are hex
// projections of the resolved color before and after the shift; `requested` is
// the normalized delta we asked for; `achieved` is shiftHct's HONEST delta
// re-derived from the result (gamut-clamped truth, not the request — so the
// agent sees what the engine could actually deliver).
export interface AdjustResult {
  mode: Mode
  token: MdTokenName
  before: string
  after: string
  requested: { dTone: number; dChroma: number }
  achieved: { dTone: number; dChroma: number }
}

// why: O(1) membership sets for runtime validation. The CLI feeds raw strings,
// so we validate at runtime — an unknown token would otherwise read `undefined`
// from the derived layer and shiftHct would throw a less legible error. The set
// keys on CANONICAL `--color-` ids (the internal token vocabulary); the public
// bare input is canonicalized through token-vocab before lookup. Extended set
// also routes the core-vs-extended layer lookup (extended tokens live in
// derived.md[`${mode}Extended`], not derived.md[mode]).
const MD_TOKEN_SET: ReadonlySet<string> = new Set(MD_TOKEN_NAMES)
const MD_EXTENDED_SET: ReadonlySet<string> = new Set(MD_EXTENDED_TOKEN_NAMES)
const MODE_SET: ReadonlySet<string> = new Set(MODES)
// why: shadcn ROLES are out-of-domain for adjust (it operates on md tokens), but
// they are the single most likely wrong input — an agent copies `--primary` out
// of `generate --to shadcn` output. Detect them so the rejection can point at the
// md role they BIND to instead of a bare "unknown token".
const SHADCN_ROLE_SET: ReadonlySet<string> = new Set(SHADCN_ROLE_NAMES)

// why: resolve a PUBLIC token name to its canonical `--color-` id, or throw a
// legible input error. The public surface is the BARE md role (`primary`); the
// `--` prefix means the agent typed the wrong vocabulary:
// - `--color-*` → the internal id, not the public surface → point at the bare role.
// - any other `--*` → a shadcn slot (out-of-domain); if it's a known role, name
//   the BARE md role it binds to under the default bindings (light = canonical).
// - a bare name → canonicalize; an unknown one gets a did-you-mean over the bare
//   md ROLE vocabulary ONLY (adjust never takes shadcn roles or chart tokens, so
//   suggesting one would be a wrong recovery path).
function resolveAdjustToken(input: string): MdTokenName {
  if (input.startsWith(COLOR_PREFIX)) {
    const bare = bareMdName(input)
    if (canonicalMdName(bare) !== undefined && MD_TOKEN_SET.has(input)) {
      throw new Error(
        `[adjustTokens] ${input} uses the internal --color- id; adjust takes bare role names — did you mean ${bare}?`,
      )
    }
    throw new Error(unknownTokenError(bare))
  }
  if (input.startsWith('--')) {
    if (SHADCN_ROLE_SET.has(input)) {
      const bound =
        DEFAULT_SHADCN_ROLE_BINDINGS.light[input as keyof typeof DEFAULT_SHADCN_ROLE_BINDINGS.light]
      throw new Error(
        `[adjustTokens] ${input} is a shadcn role; adjust takes md tokens — did you mean ${bareMdName(bound)}?`,
      )
    }
    throw new Error(unknownTokenError(input))
  }
  const canonical = canonicalMdName(input)
  if (canonical === undefined || !MD_TOKEN_SET.has(canonical)) {
    throw new Error(unknownTokenError(input))
  }
  return canonical as MdTokenName
}

// why: a did-you-mean over the bare md ROLE vocabulary (the public form adjust
// accepts) — never the internal `--color-` id, which would re-leak the prefix.
function unknownTokenError(token: string): string {
  const best = nearestName(token, BARE_MD_ROLE_NAMES)
  return best
    ? `[adjustTokens] unknown token: ${token} — did you mean ${best}?`
    : `[adjustTokens] unknown token: ${token}`
}

// why: relative ±HCT token adjustment, source-aware (#198). Derives the theme
// ONCE, then resolves each request against that single derived theme. Because
// applyMd3TokenOverrides runs LAST in the md pipeline, the resolved value
// already reflects any existing pin — so adjusting a pinned token compounds
// from the current state for free, no special-casing here.
//
// PURE: reads `source` (deriveTheme is pure) and returns facts; never mutates
// source. The persist seam is applyAdjustments — this function only reports.
export function adjustTokens(
  source: PortableTheme,
  requests: readonly AdjustRequest[],
): AdjustResult[] {
  const derived = deriveTheme(source)

  return requests.map((req) => {
    // why: validate at the runtime boundary — the CLI feeds raw strings. Each
    // branch throws a clear Error the CLI maps to exit 2. resolveAdjustToken
    // canonicalizes the public bare role to the internal `--color-` id the
    // derived layers are keyed by (and the pin map applyAdjustments writes).
    if (!MODE_SET.has(req.mode)) {
      throw new Error(`[adjustTokens] unknown mode: ${req.mode}`)
    }
    const token = resolveAdjustToken(req.token)
    if (req.dTone === undefined && req.dChroma === undefined) {
      throw new Error(
        `[adjustTokens] request for ${req.token} (${req.mode}) has no axis — provide dTone and/or dChroma`,
      )
    }

    // why: extended tokens (fixed/dim/inverse/surface-tint/shadow/scrim) are
    // emitted into the `${mode}Extended` map by deriveTheme's split; core role
    // tokens live in `${mode}`. Reading the wrong map returns undefined →
    // hexFromArgb(undefined) would throw, so the set routes the lookup.
    const layer = MD_EXTENDED_SET.has(token)
      ? derived.md[req.mode === 'light' ? 'lightExtended' : 'darkExtended']
      : derived.md[req.mode]
    const argb = layer[token]
    const before = hexFromArgb(argb)

    const dTone = req.dTone ?? 0
    const dChroma = req.dChroma ?? 0
    const { hex, achieved } = shiftHct(before, { dTone, dChroma })

    // why: the result reports the CANONICAL id (not the bare input) because
    // applyAdjustments folds `token` into md3TokenOverrides, whose keys are
    // canonical MdTokenNames. The CLI bare-ifies it for display.
    return {
      mode: req.mode,
      token,
      before,
      after: hex,
      requested: { dTone, dChroma },
      achieved,
    }
  })
}
