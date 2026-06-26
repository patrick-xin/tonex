// why: the human-facing usage text, kept out of `run.ts` so dispatch reads as
// dispatch. Shared by the dispatcher (bare / --help / unknown command) and the
// command handlers (which append it to usage errors), so it lives in its own
// leaf both can import. Interpolates the live variant list so the help can't
// drift from the registry. (The MACHINE surface is `tonex describe` — see
// `spec.ts`; this string is the friendly one.)
import { DEFAULT_VARIANT, variants } from '@tonex/core/variants'

export const HELP = `usage: tonex <command> [options]

commands:
  generate --seed <hex> [--variant <name>] [--to colors|shadcn|yaml|json]
           [--mode light|dark] [--contrast <0..1>] [--tint <0..1> | --desaturate <0..1>]
           [--custom '<json>'] [--with-chart] [--with-brand]
           [--chart-palette single|multi|polychrome]
      Derive a theme from a seed hex color and print it.
  check    --seed <hex> [--variant <name>] [--contrast <0..1>] [--mode light|dark] [--aaa] [--json]
      Audit the derived theme's WCAG contrast. Both modes unless --mode
      scopes to one. Exit 0 when it passes (no text failures), 1
      otherwise — failing pairs are enumerated.
  check    --seed <hex> [--variant <name>] [--mode light|dark] [--aaa] --find-contrast [--json]
      Report the minimum --contrast level that clears the target level, in
      one call instead of a manual search. Exit 1 if even --contrast 1
      can't reach it (the level is structurally unreachable for some pairs).
  check    <fg> <bg> [--aaa] [--large] [--json]
      Verify one ad-hoc fg/bg pairing (each a 6-digit hex or canonical
      oklch(L C H)). Exit 0 iff it clears the level.
  check    --foreground <fill> [--aaa] [--large] [--json]
      Derive the AA-safe foreground for one literal fill (hex or oklch) and
      print the on-color, achieved ratio, and verdict. Exit 0 when it clears
      the level, 1 when no foreground can (a mid-tone fill at the luminance
      crossover) — the max-contrast pick is still returned.
  check    --pairs '<json>' [--aaa] [--large] [--json]
      Batch-verify a JSON array of [fg, bg] pairs (hex or oklch); exit 1 if
      any fail, enumerating the offenders and their ratios.
  check    --seed <hex> --pairs '<json>' [--variant <name>] [--mode light|dark] [--aaa] [--json]
      Batch-verify [fg, bg] TOKEN-NAME pairs (the names from generate output)
      against the derived theme; exit 1 if a text pair fails, 2 if a name is
      unknown (with a did-you-mean).
  adjust   --seed <hex> [--variant <name>] [--contrast <0..1>] [--tint <0..1> | --desaturate <0..1>] --shifts '<json>' [--json]
      Shift named md tokens by a relative ±HCT delta (a JSON array of
      {mode, token, dTone?, dChroma?}) and print before/after facts plus
      the gamut-clamped achieved delta. Exit 0 on a clean shift, 2 on a bad
      token name / malformed --shifts. Never gates contrast — run check for that.
  serialize --seed <hex> [--variant <name>] [--contrast <0..1>] [--tint <0..1> | --desaturate <0..1>] [--custom '<json>'] [--chart-palette <name>]
      Freeze the derived theme into the canonical colors.json (a versioned
      PortableTheme) and print it to stdout. Same derivation source as
      generate; no projection knobs (those live on apply). Pipes into apply.
  apply    [<file>|-] [--to colors|shadcn|yaml|json] [--binding <name>] [--soft-borders] [--format <fmt>] [--extended] [--mode light|dark]
      Load a serialized colors.json (a file path, or stdin via - or a pipe)
      and project it into a target (default shadcn), honoring every
      pin/binding/override in the file. Like generate, but from a theme by value.
  apply    [<file>|-] --check [--aaa] [--mode light|dark] [--json]
      Gate the loaded theme's WCAG contrast (the same gate as check --seed).
      Exit 1 on a text-pair failure. A malformed/invalid/version-mismatched
      file is a usage error (exit 2).
  describe
      Print the machine-readable surface (commands, flags, contrast policy).

  --seed       a 6-digit hex (#3b82f6) or a canonical oklch(L C H) brand color.
  --variant    one of: ${Object.keys(variants).join(', ')} (default: ${DEFAULT_VARIANT}).
  --to         output target (default shadcn). colors = the canonical colors.json
               (recipe header + both-mode role values, the artifact other tools
               project from); shadcn = oklch :root/.dark block;
               yaml = single-mode colors: block for a design.md;
               json = Material Theme JSON (a www-shaped export, reused as-is for now).
  --binding    shadcn role→md-token routing preset (--to shadcn only).
               one of: default, clean, mixed, layered, seamless (default: default).
  --soft-borders  soften --border/--input/--sidebar-border to the outline-variant tone
               for faint, shadcn-style borders (--to shadcn only).
  --extended   widen the roster from core (28 roles, the sufficient baseline) to
               core + extended (50). Reach for it only when core doesn't cover the
               target's slots. colors/yaml/json honor it; shadcn is unaffected.
  --tint / --desaturate  surface-treatment strength 0..1 (mutually exclusive).
  --tint-palette  neutral palette the tint algo repaints surfaces with, both modes
               (default zinc). --tint-palette-light / --tint-palette-dark override
               one mode so light and dark can use different families.
               one of: slate, gray, zinc, neutral, stone, taupe, mauve, mist, olive.
  --custom     JSON array of {name, hex, blend?, shadcnSource?} colors added on top
               of the seed palette — each emits a harmonized 4-role md group + a
               shadcn pair (--{slug}/--{slug}-foreground), contrast-gated by check.
               blend defaults true, shadcnSource defaults "color", hex is hex or oklch.
               Rides in every output; colors/json also carry the definitions
               (colors' "custom" block / json's extendedColors).
  --with-chart emit the data-viz chart tokens (--chart-1..5) every real shadcn theme
               carries, derived from the primary palette (generate; shadcn/yaml/json).
  --with-brand emit the seed/brand pair (--brand/--brand-foreground). generate emits it;
               check folds the brand text pair into the gate.
  --chart-palette  pick the chart palette AND emit it (implies --with-chart): single
               (one-hue ramp), multi (one hue + gentle rotation, the default ramp), or
               polychrome (distinct rotated hues). Same vocabulary as the web app; a
               derivation knob, so it also rides on serialize.
  --aaa        raise the WCAG bar to AAA (default AA). --large uses large-text thresholds.
  --contrast   MCU palette contrast level, 0..1 (default 0).
  --mode       light|dark. generate: which mode yaml emits (default light;
               colors/shadcn/json ignore it). check: scope the audit to one mode
               (default both, the stricter union).

exit codes: 0 = clean · 1 = contrast gate failure · 2 = usage/input error.`
