import { MD_CHART_TOKEN_NAMES, SHADCN_CHART_TOKEN_NAMES } from '../chart/schema'
import { MD_TOKEN_NAMES, SHADCN_ROLE_NAMES } from './schema'

// why: `--color-` is core's INTERNAL canonical md token id — a Tailwind v4
// `@theme` CSS-var spelling. The PUBLIC vocabulary an agent reads off `generate`
// output is the BARE md role name (`on-surface`, the `--to colors` key) and the
// shadcn `--slot` name (`--foreground`, the `--to shadcn` key). This module is
// the single bare↔canonical bridge the agent-input resolvers (resolveContrastPairs,
// adjustTokens) and the CLI's output projection share, so the internal id never
// leaks to the surface — input, output, or did-you-mean. shadcn slot names are
// shadcn's OWN vocabulary, passed through verbatim; only md tokens carry the
// `--color-` prefix.
export const COLOR_PREFIX = '--color-'

// why: canonical md id (`--color-on-surface`) → bare public role (`on-surface`).
// A name without the prefix (a shadcn slot, or an already-bare role) is returned
// unchanged, so this is safe to apply to any token at the CLI output seam.
export function bareMdName(name: string): string {
  return name.startsWith(COLOR_PREFIX) ? name.slice(COLOR_PREFIX.length) : name
}

// why: bare public md role (`on-surface`) → canonical md id (`--color-on-surface`),
// or undefined when it is not a known md token (core ∪ extended ∪ chart). The
// resolvers canonicalize bare input through here so the resolved pair / shifted
// token indexes the same DerivedTheme TokenMap the scorer reads.
const BARE_MD_TO_CANONICAL = new Map<string, string>(
  [...MD_TOKEN_NAMES, ...MD_CHART_TOKEN_NAMES].map((n) => [bareMdName(n), n]),
)
export function canonicalMdName(bare: string): string | undefined {
  return BARE_MD_TO_CANONICAL.get(bare)
}

// why: the bare md ROLE vocabulary (core ∪ extended, NO chart) for adjust's
// md-only did-you-mean — adjust shifts roles, not chart tokens, so its
// suggestions never range over chart or shadcn names.
export const BARE_MD_ROLE_NAMES: readonly string[] = MD_TOKEN_NAMES.map(bareMdName)

// why: the full PUBLIC suggestion vocabulary for `--pairs` did-you-mean — every
// form an agent actually types (bare md roles incl. chart ∪ shadcn slot names),
// never the internal `--color-` id.
export const PUBLIC_TOKEN_NAMES: readonly string[] = [
  ...BARE_MD_TO_CANONICAL.keys(),
  ...SHADCN_ROLE_NAMES,
  ...SHADCN_CHART_TOKEN_NAMES,
]
