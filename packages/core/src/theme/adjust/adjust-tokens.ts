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
import { shiftHct } from './shift-hct'

// why: an adjust request names a (mode, token) target and a relative ±HCT delta
// (tone + chroma move TOGETHER; hue is not an axis — see shift-hct). At least
// one axis must be present; an omitted axis is normalized to 0, but a request
// with NEITHER carries no instruction and is an input error (validated below).
export interface AdjustRequest {
  mode: Mode
  token: MdTokenName
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

// why: O(1) membership sets for runtime validation. The TYPE says
// MdTokenName/Mode, but the CLI feeds raw strings, so we must validate at
// runtime regardless — an unknown token would otherwise read `undefined` from
// the derived layer and shiftHct would throw a less legible error. Extended set
// also routes the core-vs-extended layer lookup (extended tokens live in
// derived.md[`${mode}Extended`], not derived.md[mode]).
const MD_TOKEN_SET: ReadonlySet<string> = new Set(MD_TOKEN_NAMES)
const MD_EXTENDED_SET: ReadonlySet<string> = new Set(MD_EXTENDED_TOKEN_NAMES)
const MODE_SET: ReadonlySet<string> = new Set(MODES)
// why: shadcn ROLES are out-of-domain for adjust (it operates on md tokens), but
// they are the single most likely wrong input — an agent copies `--primary` out
// of `generate --to shadcn` output. Detect them so the rejection can point at the
// md token they BIND to instead of a bare "unknown token".
const SHADCN_ROLE_SET: ReadonlySet<string> = new Set(SHADCN_ROLE_NAMES)

// why: the rejection message for an out-of-domain token. Two branches:
// (1) a KNOWN shadcn role → say so and name the md token it binds to under the
//     default bindings (light map is the canonical reference), the token the
//     agent should have adjusted.
// (2) a genuine typo → a did-you-mean over the md vocabulary ONLY (adjust never
//     accepts shadcn roles, so suggesting one would be a wrong recovery path —
//     this is why we can't reuse pairs.ts's ALL_NAMES-spanning suggester).
function unknownTokenError(token: string): string {
  if (SHADCN_ROLE_SET.has(token)) {
    const bound =
      DEFAULT_SHADCN_ROLE_BINDINGS.light[token as keyof typeof DEFAULT_SHADCN_ROLE_BINDINGS.light]
    return `[adjustTokens] ${token} is a shadcn role; adjust takes md tokens — did you mean ${bound}?`
  }
  const best = nearestName(token, MD_TOKEN_NAMES)
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
    // why: validate at the runtime boundary — the type is advisory, the CLI is
    // the real caller. Each branch throws a clear Error the CLI maps to exit 2.
    if (!MODE_SET.has(req.mode)) {
      throw new Error(`[adjustTokens] unknown mode: ${req.mode}`)
    }
    if (!MD_TOKEN_SET.has(req.token)) {
      throw new Error(unknownTokenError(req.token))
    }
    if (req.dTone === undefined && req.dChroma === undefined) {
      throw new Error(
        `[adjustTokens] request for ${req.token} (${req.mode}) has no axis — provide dTone and/or dChroma`,
      )
    }

    // why: extended tokens (fixed/dim/inverse/surface-tint/shadow/scrim) are
    // emitted into the `${mode}Extended` map by deriveTheme's split; core role
    // tokens live in `${mode}`. Reading the wrong map returns undefined →
    // hexFromArgb(undefined) would throw, so the set routes the lookup.
    const layer = MD_EXTENDED_SET.has(req.token)
      ? derived.md[req.mode === 'light' ? 'lightExtended' : 'darkExtended']
      : derived.md[req.mode]
    const argb = layer[req.token]
    const before = hexFromArgb(argb)

    const dTone = req.dTone ?? 0
    const dChroma = req.dChroma ?? 0
    const { hex, achieved } = shiftHct(before, { dTone, dChroma })

    return {
      mode: req.mode,
      token: req.token,
      before,
      after: hex,
      requested: { dTone, dChroma },
      achieved,
    }
  })
}
