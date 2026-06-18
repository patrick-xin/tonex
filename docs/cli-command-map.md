# CLI Docs — Command Map

> Planning artifact for the `feat/docs` agent. **Not a published page.** It says, page
> by page, *which commands each CLI doc page should carry* — verified against the live
> binary, so prose-writing can proceed without re-deriving the surface or guessing flags.

## Source of truth

- Verified by **building and running the CLI** on `feat/adjust-hct` (`packages/cli`), the
  branch the docs site documents. Every command/output below was executed, not recalled.
- The canonical machine surface is **`tonex describe`** (JSON: commands, flags, contrast
  policy, exit codes). If any doc prose disagrees with `describe`, **`describe` wins** — it
  is generated from the same `FlagSpec` data the parser validates against.
- To regenerate these facts: `cd packages/cli && node build.mjs && node dist/cli.js describe`.
- Flag form is **`--flag value`** (or `--flag=value`), never `key=value`. Unknown/typo'd
  flags are a **loud** usage error with a did-you-mean (by design — silent drop once ran the
  default theme at exit 0).

---

## Ground-truth surface (the whole contract, verified)

### Commands
`generate` · `check` · `adjust` · `describe` — plus bare `tonex` / `tonex --help` / `tonex help` (prints usage, exit 0).

### Exit-code taxonomy (a contract — keep on the intro AND commands pages)
| Code | Meaning | Agent response |
|---|---|---|
| `0` | clean — gate passed, or output produced | proceed |
| `1` | contrast **gate** failure — the *artifact* is wrong | apply a color remedy (raise `--contrast`, re-pair) |
| `2` | usage/input error — the *call* is wrong | fix the flags/inputs |

### `generate` — full flag set (current docs are MISSING five flags)
| Flag | Values | Default | Notes |
|---|---|---|---|
| `--seed` | hex (`#6A9CFF`) **or** `oklch(L C H)` | required | the one irreplaceable input |
| `--variant` | cmf, tonalSpot, neutral, fidelity, content, vibrant, expressive, rainbow, fruitSalad, monochrome | `cmf` | |
| `--second-color` | hex or oklch | — | **cmf only.** reshapes tertiary palette + error hue; *not* the MD3 secondary role. usage error on non-cmf variants |
| `--to` | **colors**, shadcn, yaml, json | `shadcn` | ⚠️ docs omit `colors` — see corrections |
| `--binding` | default, clean, mixed, layered, seamless | `default` | **`--to shadcn` only.** role→md-token routing preset |
| `--soft-borders` | (boolean) | off | **`--to shadcn` only.** softens border/input/sidebar-border to outline-variant |
| `--mode` | light, dark | `light` | **`yaml` only** picks the projection; shadcn/json/colors co-emit both and ignore it |
| `--format` | oklch, hex | `oklch` | shadcn/json/colors honor it; yaml is always hex |
| `--extended` | (boolean) | off | core (28 roles) → core+extended (50). colors/yaml/json honor it; **no-op for shadcn** |
| `--contrast` | 0..1 | `0` | MCU palette contrast level — the palette-layer AAA remedy |
| `--tint` | 0..1 | — | surface tint; `0` = max neutral. exclusive with `--desaturate` |
| `--tint-palette` | slate, gray, zinc, neutral, stone, taupe, mauve, mist, olive | `zinc` | only when `--tint` is set |
| `--desaturate` | 0..1 | — | surface desaturate; `0` = no-op. exclusive with `--tint` |

### `check` — five forms (one overloaded command)
1. `check --seed <hex> [--variant] [--contrast] [--mode] [--aaa] [--json]` — gate the derived theme (both modes unless `--mode`)
2. `check --seed <hex> --find-contrast [--variant] [--mode] [--aaa] [--json]` — min `--contrast` that clears the level
3. `check <fg> <bg> [--aaa] [--large] [--json]` — one ad-hoc fg/bg **hex** pairing (theme-free)
4. `check --pairs '<json>' [--aaa] [--large] [--json]` — batch of `[fg,bg]` **hex** pairs (theme-free)
5. `check --seed <hex> --pairs '<json>' [--variant] [--mode] [--aaa] [--json]` — batch of `[fg,bg]` **token-name** pairs against the derived theme

### `adjust`
`adjust --seed <hex> [--variant] [--contrast] [--tint|--desaturate] --shifts '<json>' [--format] [--json]`
`--shifts` = JSON array of `{mode, token, dTone?, dChroma?}` (≥1 axis each). No `--mode` flag — mode is per-entry. Never gates contrast.

### Variant groups (from `describe.variants` — use to frame `--variant`)
- **cmf**: cmf (the default)
- **standard**: tonalSpot, fidelity, content
- **expressive**: vibrant, expressive, rainbow, fruitSalad
- **subdued**: neutral, monochrome

### shadcn bindings (from `describe.bindings` — for `--binding`)
- `default` — balanced neutral surface mapping
- `clean` — flat surfaces (card, popover, background share one layer)
- `mixed` — mode-aware (light/dark route to different layers)
- `layered` — stacked depth (each surface on its own elevation tier)
- `seamless` — subtle depth (cards lift gently, popovers blend into the page)

### Contrast thresholds (from `describe.contrast`)
| | text | large/non-text |
|---|---|---|
| AA (default) | 4.5 | 3 |
| AAA (`--aaa`) | 7 | 4.5 |
Policy: **text pair = block (exit 1)** · non-text = warn (advisory) · decorative = exempt.

---

## ⚠️ CRITICAL CORRECTIONS — current docs have examples that FAIL

These run today and **error against the live CLI**. Fix before publish.

1. **Token-name form needs the `--color-` prefix.** In `check --pairs` (form 5) and in
   `adjust --shifts`, a token is named **`--color-surface`**, not `surface`. This is the
   skill's documented "#1 trap." Verified:
   - `check --seed … --pairs '[["on-surface","surface"]]'` → `"on-surface" is not a known token`, **exit 2**.
   - `check --seed … --pairs '[["--color-on-surface","--color-surface"]]'` → `PASS … 1 named pair(s) clear`, **exit 0**.
   - `adjust … "token":"surface"` → `unknown token: surface`.
   - `adjust … "token":"--color-surface"` → works.
   - The three naming surfaces (worth a small table on the commands page):
     | where | name for `primary` |
     |---|---|
     | `--to colors` JSON keys | `primary` |
     | `--to shadcn` output | `--primary` |
     | `adjust` / `check --pairs` | `--color-primary` |

2. **`--to` is missing the `colors` value** in `commands.mdx` (generate table) and
   `targets-formats.mdx`. Live values: **`colors`, shadcn, yaml, json**. `colors` is the
   role-set the agent *reads while mapping roles→slots* (transient, not a delivered file) —
   it is the linchpin of the "Mapping to other tools" page and must be documented.

3. **Five generate flags are undocumented**: `--second-color`, `--binding`, `--soft-borders`,
   `--extended`, `--tint-palette`. Decide per page whether to surface or defer (see below) —
   but they exist and `describe` lists them, so silence reads as "doesn't exist."

4. **Recipe embedding is undocumented.** Every *delivered* projection carries its own runnable
   recipe so a later agent can reproduce it (not mentioned anywhere yet):
   - `--to shadcn` → leading `/* tonex generate --seed '#…' --variant cmf --to shadcn */`
   - `--to yaml` → leading `# tonex generate --seed '#…' --variant cmf --to yaml --mode light`
   - `--to json` → `"description": "TYPE: CUSTOM\ntonex generate --seed '#…' …"`
   - `--to colors` → its own structured header (`seed`/`variant`/`contrast`/`surface`/`format`), no embedded comment (it's the transient read, not a delivery).

---

## Page-by-page command map

### 1. `cli/introduction.mdx` — Intro
**Role:** what the CLI is, the four subcommands, the agent contract. Conceptual — minimal runnable commands.
**Commands to show (one-liners only, no output):**
- `npx tonex <command> [options]` (the shape)
- `npx tonex` / `npx tonex --help` (usage at any time, exit 0)
- `npx tonex describe` (the JSON contract — name it here as the agent's entry point)
**Keep:** the exit-code triple (already present and correct).
**Fix:** the four-subcommand bullet for `generate` says "(shadcn, DESIGN.md YAML, or Material Theme JSON)" — add **colors** (the role-set read target), or soften to "and a raw role set."
**Note:** it links to `/docs/cli/installation`, which **does not exist yet** — see page 2.

### 2. `cli/installation.mdx` — Installation *(MISSING — create it)*
**Role:** how a human/agent gets the CLI and the skill onto their machine.
**Commands to show:**
- **No-install run:** `npx tonex@latest <command>` — the zero-setup path (the CLI is a single zero-dep bundle; `npx` needs no global install).
- **Global (optional):** `npm i -g tonex` then `tonex <command>`.
- **Verify:** `tonex --help` / `tonex describe`.
- **The skill (the driver):** the CLI is the engine; the `tonex` *skill* carries the judgment.
  Install it with: `npx skills add patrick-xin/tonex --skill tonex`
  ⚠️ **Do not use `--all`** — it would also install the repo's internal maintainer skills
  (`adr`/`slice`/`sweep` live in `.claude/skills/`). Scope to `--skill tonex`.
**Gating / honesty flags for the docs agent:**
- The npm name `tonex` is **unverified/unclaimed** and the repo is **not yet public** — both
  block real `npx tonex` / `npx skills add`. Write the page so it's correct *once published*,
  but coordinate before publishing install instructions that don't work yet.
- A `tonex init` command (that runs `npx skills add` for the user) is **planned but unbuilt**
  — do **not** document it as existing. (See the CLI distribution plan.)

### 3. `cli/commands.mdx` — Commands
**Role:** the full per-command reference. Already the most complete page; needs the corrections above folded in.
**`generate` — show:**
- `npx tonex generate --seed "#6A9CFF" > globals.css` (default = shadcn)
- `npx tonex generate --seed "#6A9CFF" --variant expressive --desaturate 0.5`
- `npx tonex generate --seed "#6A9CFF" --to yaml --mode dark`
- `npx tonex generate --seed "#6A9CFF" --to json --format hex`
- **Add** `npx tonex generate --seed "#6A9CFF" --to colors` (the role-set read)
- **Expand the flag table** to the full 13-flag set above (add second-color, binding, soft-borders, extended, tint-palette). At minimum add `colors` to `--to`.
- **Add a recipe callout:** the emitted file's first line is its own regenerate command.
**`check` — show all five forms** (already listed correctly), with these *verified outputs*:
- pass: `PASS — AA contrast — 134 pairs clear` (exit 0)
- ad-hoc fail: `npx tonex check "#ffffff" "#3b82f6"` → `FAIL — 3.68:1 below AA text (4.5)` (exit 1)
- find-contrast remedy (real): `npx tonex check --seed "#6A9CFF" --aaa --find-contrast` →
  `FOUND — AAA clears at --contrast 0.9` + a `re-derive: generate --seed #6A9CFF --variant cmf --contrast 0.9` line
- token-name form: **fix to** `--pairs '[["--color-on-surface","--color-surface"]]'` (the current `[["on-surface","surface"]]` errors with exit 2)
- unknown token → exit 2 with did-you-mean (keep).
**`adjust` — fix the example token** to `--color-surface`:
- `npx tonex adjust --seed "#6A9CFF" --shifts '[{"mode":"light","token":"--color-surface","dTone":-4,"dChroma":2}]'`
- verified output line: `light --color-surface  oklch(…) → oklch(…)   req t-4 c+2   got t-3.9 c+2.16`
**`describe`:** `npx tonex describe` (keep). Optionally show the top-level JSON keys: `tool, exitCodes, commands, contrast, variants, targets, bindings`.
**Add the token-naming table** (from correction 1) right where `--pairs`/`adjust` are introduced.

### 4. `cli/targets-formats.mdx` — Targets & Formats
**Role:** the two orthogonal `generate` axes — `--to` (which document) × `--format` (encoding).
**Fix the target table to four rows:**
| Target | Output |
|---|---|
| `colors` | the raw role set (both modes) an agent **reads while mapping roles→slots**; transient, carries no delivered recipe |
| `shadcn` | paste-ready `:root`/`.dark` block, both modes (default) |
| `yaml` | single-mode DESIGN.md `colors:` block (hex) |
| `json` | Material Theme JSON export |
**Commands to show:**
- `npx tonex generate --seed "#6A9CFF" --to colors`
- `npx tonex generate --seed "#6A9CFF" --to shadcn --format hex`
- `npx tonex generate --seed "#6A9CFF" --to yaml --mode dark`
- `npx tonex generate --seed "#6A9CFF" --to json`
**Keep:** "shadcn/json co-emit both modes; yaml reads `--mode`." **Add:** `colors` also co-emits both modes.
**Add:** the per-target recipe-embedding note (correction 4).

### 5. `cli/other-tools.mdx` — Mapping to Other Tools
**Role:** how a tool *without* a native exporter gets a faithful mapping. This page is where
`--to colors` earns its place.
**Reframe around the two read targets:**
- `npx tonex generate --seed "#6A9CFF" --to colors` — the agent reads this role set and maps each role onto the foreign tool's slots **by intent** (role *names* are a default, not a contract — binding `secondary` as a UI primary is fair game).
- `npx tonex generate --seed "#6A9CFF" --to yaml` — the DESIGN.md `colors:` block as the portable semantic contract.
**Then verify every custom pairing:**
- `npx tonex check --seed "#6A9CFF" --pairs '[["--color-on-surface","--color-surface"]]'`
  (the contrast guarantee follows the *pairing you check*, not the name you keep).
**Keep:** the discipline paragraph (faithfulness / roles mean the same thing). **Add:** the
explicit "generate `--to colors` → map by intent → `check --pairs` to prove it" loop, since
that is the actual command sequence this page is about.

---

## Open questions for the docs agent
- **Installation scope:** does the install page assume the repo is already public + npm name
  claimed? Both are currently unresolved — confirm before shipping copy-paste install lines.
- **Flag depth on `commands.mdx`:** surface all 13 generate flags, or keep the table lean and
  push `--binding`/`--soft-borders`/`--tint-palette`/`--second-color`/`--extended` to a
  "web-app/shadcn" or advanced section? They are real; pick deliberately, don't omit silently.
- **`/docs/how-tonex-thinks` link** in targets/other-tools points at a file that was **deleted**
  in this branch (`how-tonex-thinks.mdx` shows as `D` in git status) — repoint or restore.
