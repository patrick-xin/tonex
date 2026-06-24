# Contributing

Thanks for your interest in Tonex! Contributions of all kinds are welcome — bug reports, fixes, docs, and features.

## Getting started

This is a pnpm + turbo monorepo. You'll need Node 18+ and [pnpm](https://pnpm.io/).

```bash
git clone https://github.com/patrick-xin/tonex.git
cd tonex
pnpm install
```

Then, depending on what you're working on:

```bash
pnpm --filter @tonex/www dev      # run the web app at localhost:3000
pnpm --filter @tonex/core test    # run the color engine tests
pnpm test                         # run everything
pnpm typecheck
```

The codebase is split into a few packages:

- `@tonex/core` — the color engine (pure, framework-free).
- `@tonex/color-utils`, `@tonex/mcu`, `@tonex/core-react` — supporting libraries.
- `apps/www` — the Next.js web editor and docs.

## Reporting bugs and requesting features

Open an [issue](https://github.com/patrick-xin/tonex/issues). For bugs, include the seed color you used, what you expected, and what happened — a screenshot or the generated output helps a lot.

## Making changes

1. Fork the repo and create a branch.
2. Make your change. Keep pull requests focused — one logical change per PR is much easier to review than a large mixed one.
3. Add or update tests when you change behavior. The engine is test-first, so a behavior change without a test will usually be asked for one.
4. Run `pnpm check` (formatting + lint) and `pnpm test` before pushing.
5. If you change a published package (anything in `packages/` except the shared config), run `pnpm changeset` and describe the change — this drives the release notes.
6. Open the PR with a short description of *what* changed and *why*.

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/) (e.g. `fix: …`, `feat: …`) — this is checked automatically.

## A note on how Tonex is built

Most of Tonex is written with AI agents, and the repo carries a fair amount of structure to support that — architectural decisions live in [`docs/adr/`](./docs/adr/), and code is heavily commented with the reasoning behind it. You don't need to follow any of that to contribute; just write clear code and the maintainer will help fit it in. If you're curious, the conventions live in the `AGENTS.md` files throughout the tree.

## Security

Please don't open public issues for security problems — see [`SECURITY.md`](./SECURITY.md) for how to report them privately.
