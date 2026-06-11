// why: the human-facing usage text, kept out of `run.ts` so dispatch reads as
// dispatch. Shared by the dispatcher (bare / --help / unknown command) and the
// command handlers (which append it to usage errors), so it lives in its own
// leaf both can import. Interpolates the live variant list so the help can't
// drift from the registry. (The MACHINE surface is `tonex describe` — see
// `spec.ts`; this string is the friendly one.)
import { DEFAULT_VARIANT, variants } from '@tonex/core/variants'

export const HELP = `usage: tonex <command> [options]

commands:
  generate --seed <hex> [--variant <name>] [--to shadcn|yaml|json]
           [--mode light|dark] [--contrast <0..1>] [--tint <0..1> | --desaturate <0..1>]
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
      Verify one ad-hoc fg/bg hex pairing. Exit 0 iff it clears the level.
  check    --pairs '<json>' [--aaa] [--large] [--json]
      Batch-verify a JSON array of [fg, bg] hex pairs; exit 1 if any fail,
      enumerating the offenders and their ratios.
  check    --seed <hex> --pairs '<json>' [--variant <name>] [--mode light|dark] [--aaa] [--json]
      Batch-verify [fg, bg] TOKEN-NAME pairs (the names from generate output)
      against the derived theme; exit 1 if a text pair fails, 2 if a name is
      unknown (with a did-you-mean).
  describe
      Print the machine-readable surface (commands, flags, contrast policy).

  --variant    one of: ${Object.keys(variants).join(', ')} (default: ${DEFAULT_VARIANT}).
  --to         output target (default shadcn). shadcn = oklch :root/.dark block;
               yaml = single-mode colors: block for a design.md;
               json = Material Theme JSON (a www-shaped export, reused as-is for now).
  --tint / --desaturate  surface-treatment strength 0..1 (mutually exclusive).
  --aaa        raise the WCAG bar to AAA (default AA). --large uses large-text thresholds.
  --contrast   MCU palette contrast level, 0..1 (default 0).
  --mode       light|dark. generate: which mode yaml emits (default light;
               shadcn/json ignore it). check: scope the audit to one mode
               (default both, the stricter union).

exit codes: 0 = clean · 1 = contrast gate failure · 2 = usage/input error.`
