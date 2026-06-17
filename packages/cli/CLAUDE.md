# @tonex/cli — the `tonex` CLI

A **consumer** of `@tonex/core`. Turns a seed hex into theme output (shadcn / design.md yaml / json) and gates contrast. No color logic of its own.

## Consuming core (the rule for every consumer)

Before walking core's source, read its surface map → [`../core/docs/agents/api/core-surface.md`](../core/docs/agents/api/core-surface.md). Domain terms → [`../core/docs/glossary.md`](../core/docs/glossary.md).

- **Surface, don't reimplement.** Derivation, colour encoding (`ExportOptions.colorFormat`), and the WCAG verdict (`@tonex/core/audit`) all live in core. The CLI projects core's values into flags/output — it never re-derives, re-encodes, or re-scores. (Re-encoding here would also bypass the `@tonex/color-utils` culori firewall.)
- **Need something core can't do yet** Add it to core first, then surface it — don't inline it in the CLI. A runtime tuple the CLI consumes (e.g. `COLOR_FORMATS` behind `--format`) belongs in core. _(ADR-0016)_
- Import from `@tonex/core` or a named subpath, never `@tonex/core/src/...`.

## Where things live (folder-per-concern — open one file, not the package)

The point of this layout is that you change a concern by opening *its* file, with no surrounding noise to read past:

- `run.ts` — **JUST dispatch.** The pure `run(argv, io)` seam + the subcommand switch. Owns nothing else.
- `commands/generate.ts` — the `generate` command: target (`--to`), encoding (`--format`), mode projection.
- `commands/check.ts` — the `check` command: all contrast forms (whole-theme gate, `--find-contrast` oracle, ad-hoc `<fg> <bg>`, `--pairs`) **and their output formatters**. Forms cleave on theme-free (raw hex, color-utils) vs theme-aware (derive + `@tonex/core/audit`). `--pairs` straddles the seam: raw hex without `--seed`, token names *with* it (resolved by core's `resolveContrastPairs`, scored by `auditPairs`) — presence of `--seed` is the switch.
- `source.ts` — the shared seed→`PortableTheme` resolver both commands call (`--seed`/`--variant`/`--contrast`/`--tint`/`--desaturate`). Change the input contract here, once.
- `spec.ts` — flag schema-as-data + the enum membership guards (`isTarget`/`isMode`/`isColorFormat`) + `describe`.
- `args.ts` — the generic parser the schema feeds. `io.ts` — the `Io` seam + exit codes. `help.ts` — the usage text. `cli.ts` — the bin (the only `process.*`).

## Keep exactly (the agent contracts — survive any refactor)

- **Pure `run(argv, io) → exitCode`.** All behaviour is exercised at this boundary (no child process); `cli.ts` is the *only* file that touches `process.*` (argv, exit, streams).
- **Exit taxonomy 0 / 1 / 2.** `0` clean · `1` a contrast **text** pair failed (fix the artifact — apply a color remedy) · `2` usage/input error (fix the call — correct the flags). They demand opposite agent responses; never collapse them.
- **Flags are schema-as-data** (`spec.ts` `FlagSpec` → `args.ts` parser + `describe`). One list feeds parsing *and* introspection — add a flag in `spec.ts`, never hand-parse at a call site. The parser **loudly rejects** unknown/typo'd flags with a did-you-mean: that's a domain requirement (a silent `--varinat` once ran the default theme at exit 0), not boilerplate to soften.
- **Every projection embeds its recipe.** `generate`'s output for any target carries a self-describing, runnable regenerate command — the resolved seed plus every theme-defining knob (resolved values, not just typed flags, so a later default change can't silently re-derive a different theme). The recipe is tonex's one durable source of truth, and it travels *inside* the delivered file: a later agent walks from the colors back to their recipe with nothing else to read. This is the durable artifact — **not** a separate `colors.json` manifest. `colors.json` is just one transient `--to colors` rendering of the role set an agent reads to map roles→slots; nothing in the toolchain reads it back (ADR-0039 Decision 7, amendment 2026-06-17).
- **`tonex describe`** is the machine-readable surface (commands, flags, contrast policy, exit codes). Keep it parseable and complete — it's how an agent learns the contract without the skill doc.
- **The agent-facing skill lives at [`/skills/tonex/`](../../skills/tonex/)** (not under this package) — distributed as a plugin via the root `.claude-plugin` / `.cursor-plugin` / `.codex-plugin` manifests, never bundled by this CLI. `describe` is the source of truth for *facts*; the skill carries *judgment*. Keep them in sync.
