# Contributing

Thanks for wanting to help. Tonex is a small project with strong conventions — the docs below are the source of truth.

## Reading order

1. [`vision.md`](./vision.md) — what the project is.
2. [`docs/agents/working-style.md`](./docs/agents/working-style.md) — working norms for agents.
3. Code rules — live in the nearest `AGENTS.md` (the sibling `CLAUDE.md` auto-loads and imports it via `@AGENTS.md`): [`packages/core/AGENTS.md`](./packages/core/AGENTS.md) (engine) and [`apps/www/AGENTS.md`](./apps/www/AGENTS.md) (app).
4. [`docs/adr/`](./docs/adr/) — architectural decisions of record. ADRs hold living rationale: the decision and its why don't change without a new ADR (or an append-only amendment); bodies may be cleaned as code moves.

## Dev setup

```bash
pnpm install
pnpm --filter @tonex/core test
pnpm typecheck
pnpm --filter @tonex/www dev
```

## Issues

Issues live in GitHub Issues at [`patrick-xin/tonex`](https://github.com/patrick-xin/tonex/issues). See [`docs/agents/triage-labels.md`](./docs/agents/triage-labels.md) for the canonical triage label vocabulary.

## Pull requests

- Small, vertically-sliced changes per [`docs/agents/slice-strategy.md`](./docs/agents/slice-strategy.md).
- Tests required for behaviour changes. The drift-guard test pins `globals.css === formatCss(deriveTheme(DEFAULT_INPUTS))`; a baseline change requires regenerating the bake.
- New constraints with no in-code home → `AGENTS.md`. New decisions → an ADR.
- Changes to a publishable package (`packages/*` except `typescript-config`) need a changeset — run `pnpm changeset`; `apps/www` and config don't. CI's `changeset status` enforces it. A deliberate no-release change → `pnpm changeset --empty`.

## Security

See [`SECURITY.md`](./SECURITY.md).
