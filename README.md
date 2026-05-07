# tonex

Edit one source colour, export coherent themes for both **Material 3** and **shadcn**. Light and dark are co-derived; preview and export never drift.

See [`docs/vision.md`](./docs/vision.md) for what the project is and who it's for.

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

See [`CONTRIBUTING.md`](./CONTRIBUTING.md). Agent collaborators should start at [`docs/agents/session-flow.md`](./docs/agents/session-flow.md).

## License

MIT — see [`LICENSE`](./LICENSE).
