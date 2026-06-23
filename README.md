# tonex

Tonex is a colour-authoring engine: one seed colour in, a complete, perceptually-coherent, role-mapped token set out — for both **Material 3** and **shadcn**, light and dark co-derived so preview and export never drift. It's built agent-first: you describe the theme, the agent drives the `tonex` CLI from one brand colour and never hand-picks a hex.

See [`vision.md`](./vision.md) for what the project is and who it's for.

## Use it with an AI agent

Install the tonex skill, then just describe the theme you want — the agent drives the `tonex` CLI from one brand color and never hand-picks a hex:

```bash
npx skills add patrick-xin/tonex
```

In **Claude Code** or **Cursor**, install the `tonex` plugin from the marketplace instead — the skill auto-loads from [`skills/tonex/`](./skills/tonex/). The skill assumes the `tonex` CLI is on your `PATH`.

## Stack

- `@tonex/core` — engine. Source store (zustand) → `deriveTheme` → `applyDom` renderer + `exportCss` exporter. Pure colour math is grounded in [Material Color Utilities](https://github.com/material-foundation/material-color-utilities) (vendored as `@tonex/mcu`).
- `apps/www` — Next.js editor. Layer-segmented routes (`/theme`, `/theme/shadcn`); shared source store; route-controlled canvas.

Architectural commitments live in [`docs/adr/`](./docs/adr/).

## Local dev

```bash
pnpm install
pnpm --filter @tonex/www dev      # editor at http://localhost:3000
pnpm --filter @tonex/core test    # engine tests
pnpm typecheck                    # workspace typecheck
```

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md). Agent collaborators should start at [`docs/agents/working-style.md`](./docs/agents/working-style.md).

## License

MIT — see [`LICENSE`](./LICENSE).
