# tonex

Turn one brand seed color into a complete light + dark theme with guaranteed WCAG contrast — shadcn, design.md, Material, or JSON — via Google's [Material Color Utilities](https://github.com/material-foundation/material-color-utilities). Stop hand-picking hex.

Tonex maps a single seed onto a full set of perceptual color roles, so every surface, foreground, border, and chart series is derived rather than guessed. The same engine runs in three places: a [web editor](https://tonex.dev/), a [CLI](#cli), and an [agent skill](#use-it-with-an-ai-agent).

This project is an exercise in [Skills For Real Engineers](https://github.com/mattpocock/skills): most of the code is written by Claude, with architectural decisions recorded in [`docs/adr/`](./docs/adr/). Code is heavily commented with the *why* and ADR pointers, so a cold-start agent has the context it needs.

## Web app

The full editor lives at **[tonex.dev](https://tonex.dev/)** — pick a seed, toggle the authored layers, and audit contrast live.

## CLI

```bash
npx tonex@latest generate --seed "#6A9CFF" > globals.css
```

One seed in, a role-mapped color system out. The output target can be shadcn CSS, Material JSON, a DESIGN.md color block, or the raw Tonex role set.

| Command | Use it to |
| --- | --- |
| `generate` | Derive a theme from a seed and print it. |
| `check` | Audit WCAG contrast for a theme or explicit pairs (exits `1` on a failing text pair). |
| `adjust` | Shift named tokens by relative HCT tone/chroma deltas. |
| `describe` | Print the machine-readable CLI surface as JSON. |

Run `npx tonex@latest --help` for usage, or see the [CLI docs](https://tonex.dev/docs/cli/introduction).

## Use it with an AI agent

Install the tonex skill, then just describe the theme you want — the agent drives the `tonex` CLI from one brand color and never hand-picks a hex:

```bash
npx skills add patrick-xin/tonex
```

In **Claude Code** or **Cursor**, install the `tonex` plugin from the marketplace instead — the skill auto-loads from [`skills/tonex/`](./skills/tonex/).

## Structure

This is a pnpm + turbo monorepo.

- [`packages/core`](./packages/core) (`@tonex/core`) — the engine. Pure color math, grounded in Material Color Utilities.
- [`packages/mcu`](./packages/mcu) (`@tonex/mcu`) — vendored Material Color Utilities.
- [`packages/color-utils`](./packages/color-utils) (`@tonex/color-utils`) — the color conversion firewall (culori-backed, CSS Color 4 gamut mapping).
- [`packages/core-react`](./packages/core-react) (`@tonex/core-react`) — React bindings over the engine.
- [`packages/cli`](./packages/cli) (`tonex`) — the terminal surface and agent contract.
- [`apps/www`](./apps/www) — the Next.js editor and docs site.

## Local dev

```bash
pnpm install
pnpm --filter @tonex/core test   # run the engine tests
pnpm typecheck
pnpm --filter @tonex/www dev      # run the web app
```

Common root scripts: `pnpm build`, `pnpm test`, `pnpm lint`, `pnpm format`.

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for the reading order, conventions, and PR rules.

## License

[Apache-2.0](./LICENSE).

