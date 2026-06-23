# tonex

One brand color in, a complete contrast-safe theme out — for **Material 3** and **shadcn**, light and dark co-derived so preview and export never drift.

Tonex is agent-first: you describe the theme, the agent drives the `tonex` CLI from a single seed color and never hand-picks a hex. It's built on [Material Color Utilities](https://github.com/material-foundation/material-color-utilities) but takes opinionated departures — the **CMF (2026)** scheme is the default in place of Material You's TonalSpot, and the surface tint is dialable (tint or desaturate) rather than baked in.

## Use it with an AI agent

Install the tonex skill, then describe the theme you want:

```bash
npx skills add patrick-xin/tonex
```

In **Claude Code** or **Cursor**, install the `tonex` plugin from the marketplace instead. The skill assumes the `tonex` CLI is on your `PATH`.

## Structure

- `@tonex/core` — the pure engine: `deriveTheme` maps a seed to role-mapped MD3 + shadcn tokens, plus exporters and the WCAG audit. No React, no DOM.
- `@tonex/core-react` — editor runtime: the source store, hooks, and DOM renderer.
- `@tonex/color-utils` — the color-conversion firewall.
- `@tonex/mcu` — vendored Material Color Utilities.
- `tonex` — the CLI that drives the engine from one seed.
- `apps/www` — the Next.js editor.

## Local dev

```bash
pnpm install
pnpm --filter @tonex/www dev      # editor at http://localhost:3000
pnpm --filter @tonex/core test    # engine tests
pnpm typecheck                    # workspace typecheck
```

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md).

## License

MIT — see [`LICENSE`](./LICENSE).
