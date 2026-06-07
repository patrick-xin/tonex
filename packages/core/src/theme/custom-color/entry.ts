import { isValidHex } from '@tonex/color-utils'
import { MD_TOKEN_NAMES, SHADCN_ROLE_NAMES } from '../schema'

// why: customColors are first-class dual-layer entries — they emit their
// own md tokens (4 per entry: --color-{slug}, --color-on-{slug}, --color-
// {slug}-container, --color-on-{slug}-container) AND their own shadcn
// tokens (2 per entry: --{slug}, --{slug}-foreground), all derived from a
// single user-supplied hex via MCU's customColor(). They do NOT participate
// in shadcnRoleBindings — the role surface stays closed at SHADCN_ROLE_NAMES.
// `id` is the stable CRUD identity; `name` is freely editable and the slug
// is derived from it at emission time. `shadcnSource` picks which md pair
// feeds the shadcn pair: 'color' → --{slug} ← --color-{slug}; 'container'
// → --{slug} ← --color-{slug}-container (foreground follows the on-* twin).
export interface CustomColorEntry {
  id: string
  name: string
  description?: string
  hex: string
  blend: boolean
  shadcnSource: 'color' | 'container'
}

// why: slug derives from name. Lowercase, non-alphanumeric runs collapse to
// a single dash, edge dashes trimmed. Renaming is allowed (standard CRUD on
// id) — consumers of the OLD slug in exported CSS will break, by design;
// docs flag this. Empty slug after slugification is a validation failure.
export function slugifyCustomColorName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// why: any kebab name a custom-color slug would emit MUST NOT collide with
// an existing md token or shadcn role. Two collision sources: (1) the slug
// itself maps to --color-{slug} (md) AND --{slug} (shadcn), so we derive
// each blocked-slug from the kebab token name minus its `--color-`/`--`
// prefix; (2) the partner tokens we auto-emit (`--color-on-{slug}`,
// `--color-{slug}-container`, `--{slug}-foreground`) would collide if the
// user picks a slug starting with `on-` or ending in `-container` /
// `-foreground` — those patterns are blocked outright as a slug.
//
// Memoized on first call: entry.ts and ../schema.ts form an import cycle
// (schema's valibot pipe captures validateCustomColorEntry; this file reads
// MD_TOKEN_NAMES + SHADCN_ROLE_NAMES from schema). A top-level
// `new Set([...MD_TOKEN_NAMES.map(...)])` would TDZ-trip during module load
// when schema.ts is loaded first (the common path via the outer barrel),
// because schema's exports are pending until its body finishes evaluating.
// Deferring to first call sidesteps the TDZ window — by then both modules
// are loaded and the live binding resolves.
let _reservedSlugs: ReadonlySet<string> | undefined
function reservedSlugs(): ReadonlySet<string> {
  if (!_reservedSlugs) {
    _reservedSlugs = new Set<string>([
      ...MD_TOKEN_NAMES.map((t) => t.slice('--color-'.length)),
      ...SHADCN_ROLE_NAMES.map((t) => t.slice('--'.length)),
    ])
  }
  return _reservedSlugs
}

// why: returns null on success, an error message on failure. Caller decides
// whether to throw, surface in UI, or both. `existingSlugs` lets the
// caller exclude self when validating an edit (compare by id, gather slugs
// of the OTHER entries). Pure, no I/O — UI and store both call this.
export function validateCustomColorEntry(
  entry: { name: string; hex: string },
  existingSlugs: ReadonlySet<string>,
): string | null {
  const slug = slugifyCustomColorName(entry.name)
  if (slug.length === 0) return 'name must contain at least one alphanumeric character'
  if (slug.startsWith('on-'))
    return `name cannot produce a slug starting with "on-" (got "${slug}")`
  if (slug.endsWith('-container'))
    return `name cannot produce a slug ending with "-container" (got "${slug}")`
  if (slug.endsWith('-foreground'))
    return `name cannot produce a slug ending with "-foreground" (got "${slug}")`
  // why: `tnx-` is our reserved vendor namespace for INTERNAL app-chrome
  // semantic tokens (--color-tnx-success / -warning / -info, hand-authored in
  // globals.css, never seed-derived). Custom colours emit --color-{slug} into
  // the live `.md` scope, which — since <body class="md"> — would override our
  // global --color-tnx-* and hijack the app's own status colours. Reserving the
  // whole prefix (vs the bare words) keeps `success`/`warning`/`info` free for
  // users while making the collision structurally impossible. Like `--tw-`.
  if (slug.startsWith('tnx-')) return `name cannot use the reserved "tnx-" prefix (got "${slug}")`
  if (reservedSlugs().has(slug)) return `name "${slug}" collides with a reserved md or shadcn token`
  if (existingSlugs.has(slug)) return `name "${slug}" duplicates an existing custom color`
  if (!isValidHex(entry.hex)) return `hex must be a 6-digit "#rrggbb" value`
  return null
}
