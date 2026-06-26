<a href="https://tonex.dev/">
  <img alt="Tonex" src="https://github.com/patrick-xin/tonex/blob/master/gh-image.png?raw=true">
</a>

# Tonex

Tonex turns one brand color into an authored color system: roles, constraints, light and dark behavior, and WCAG contrast from one seed. It exports to shadcn, DESIGN.md, Material, or your own token setup. The engine uses Google's [Material Color Utilities](https://github.com/material-foundation/material-color-utilities), but the output does not have to look like Material.

Most color tools stop at palette preview: drop in a color, see it on a page. Tonex takes on the hand-work after that. Your seed becomes a role-mapped system where backgrounds, foregrounds, borders, charts, and states are computed for their job and mode. You edit intent instead of hand-picking hex values.

That matters even more when agents are building UI. Defaults ship fast: safe neutrals, a purple glow, the same gradient again. Tonex gives the agent a color source with a point of view, so dark mode, elevated surfaces, charts, and the next feature keep using the same system.

You can use the same engine three ways:

- A [web editor](https://tonex.dev/) for working by hand.
- A [CLI](#cli) for the terminal.
- A [skill](#use-it-with-a-skill) that lets an agent drive the CLI for you.

Read the [full docs](https://tonex.dev/docs/cli/introduction).

## Web editor

The full editor lives at **[tonex.dev](https://tonex.dev/)**. Pick a seed, tune the authored layers, and audit every contrast pair live, including overrides, which are the one place generated contrast can slip. What you preview is what you export.

## Agent-first CLI

```bash
npx @tonex-dev/cli@latest generate --seed "#6750a4"
```

Point an agent at `npx @tonex-dev/cli@latest describe` first. It prints every command and flag the CLI exposes, so the agent can build a palette from a plain description without memorized syntax. Run `npx @tonex-dev/cli@latest --help` for the same list by hand, or read the [full CLI docs](https://tonex.dev/docs/cli/introduction).

### Use it with a skill

Install the skill, then describe the theme you want. The agent drives the `tonex` CLI from one brand color and never hand-picks a hex:

```bash
npx skills add patrick-xin/tonex
```

### Run it manually

```bash
npx @tonex-dev/cli@latest generate --seed "#6A9CFF" --to shadcn --format hex
```

See the available [commands](https://tonex.dev/docs/cli/commands).

## How this repo is built

Tonex is also an experiment in making a codebase an agent can navigate. It follows [Skills For Real Engineers](https://github.com/mattpocock/skills): Claude writes code; a human owns architecture and visual design. The test is whether an agent dropped into the repo cold can understand it and make changes without a long briefing. Comments explain why a decision exists and cite the ADR behind it instead of restating the code.

The product and the repo are making the same bet: humans choose the feeling and the constraints; agents do more of the labor. Tonex keeps the color decisions shaped enough to survive that handoff.

Architectural decisions live in three places:

- Root — [`docs/adr/`](./docs/adr/)
- Core — [`packages/core/docs/adr`](./packages/core/docs/adr)
- Web app — [`apps/www/docs/adr`](./apps/www/docs/adr)

## Structure

This is a pnpm + turbo monorepo.

- [`packages/core`](./packages/core) (`@tonex/core`) — the engine. Pure color math, grounded in Material Color Utilities.
- [`packages/mcu`](./packages/mcu) (`@tonex/mcu`) — vendored Material Color Utilities.
- [`packages/color-utils`](./packages/color-utils) (`@tonex/color-utils`) — the color conversion firewall.
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
