# tonex

Turn a single brand seed color into a complete **light + dark** theme with
**guaranteed WCAG contrast** — built on Google's
[Material Color Utilities](https://github.com/material-foundation/material-color-utilities).
Export paste-ready tokens for **shadcn/Tailwind**, **design.md**, **Material
Theme JSON**, or a canonical **colors.json**, and gate every text pair with a
real contrast check. Stop hand-picking hex.

## Install

```bash
npm i -g @tonex-dev/cli
# the global command is `tonex`:
tonex describe
# or run without installing:
npx @tonex-dev/cli describe
```

## Commands

```bash
tonex generate --seed "#3b82f6" --to shadcn   # seed → theme tokens (--to shadcn|design-md|json)
tonex check --seed "#3b82f6"                  # gate every text pair (exit 1 if any fail AA)
tonex check "#1d4ed8" "#ffffff"               # ad-hoc contrast of two colors
tonex adjust ...                              # shift one token family without re-seeding
tonex describe                                # machine-readable contract: flags, enums, exit codes
```

**Exit codes:** `0` clean · `1` a text pair failed contrast (fix the colors) ·
`2` usage/input error (fix the call). `describe` is the authoritative,
machine-readable surface — every flag, default, variant, target, and the
contrast policy.

## Use it with an AI agent

`tonex` is built to be driven by an agent that never hand-picks a hex — it
infers intent and lets the engine resolve the contrast-safe color. Install the
skill:

```bash
npx skills add patrick-xin/tonex
```

In **Claude Code** or **Cursor**, install the `tonex` plugin from the
marketplace instead. See the [repository](https://github.com/patrick-xin/tonex)
for the full skill and reference docs.

## License

Apache-2.0
