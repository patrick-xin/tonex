> **State:** Living rationale. Edit body when reality overtakes prose; the decision and rationale don't change without a new ADR.

# shadcn role override layer — literal pins above symbolic bindings

The shadcn layer today supports one user knob: `shadcnRoleBindings`, a per-mode map from each shadcn role to an MD token name. Editing a binding is symbolic — the role's value still flows through MCU; the binding just changes which md token it follows. Power users hit a wall when they want a literal commitment: "I picked `--ring` to be exactly this color, don't move it when I nudge the seed." The MD layer already has `md3TokenOverrides` for this exact pattern; the shadcn layer is missing the symmetric mechanism.

The two operations are conceptually distinct and the project benefits from naming them so:

- **Binding** = "I don't like your opinionated default — try `--card` against `--color-surface-container-highest` instead." Symbolic, still tracks the MCU pipeline (seed, variant, contrast level, palette overrides). The exploration knob.
- **Override** = "This is the color I want; keep it." Literal hex, detached from MCU. The commitment knob.

Conflating them — folding the override into the binding as a `kind: 'hex'` discriminator — is a coherent feature, but it's a *different* feature: it widens what "binding" means and breaks symmetry with `md3TokenOverrides`. This ADR keeps them separate.

**Decision:** seven commitments, organized from conceptual cut to UI shape.

## 1. Two axes: bindings symbolic, overrides literal

`PortableTheme` carries two parallel cross-layer fields: `shadcnRoleBindings` (unchanged) maps each shadcn role to an MD token name per mode; `shadcnRoleOverrides` (new) maps each shadcn role to a literal hex string per mode.

Bindings stay user-editable, symbolic, fully populated. Overrides are user-editable, literal hex, sparse — an entry's presence means "user pinned this role for this mode."

**Why:** symmetry with the MD layer's `md3TokenOverrides` is the win. The codebase carries one mental model for "pointer + literal override" — applied at the MD layer for `(token → hex)` pins, applied at the shadcn layer for `(role → hex)` pins. Resolver shapes match; reset UX matches; drift-guard discipline matches.

## 2. Binding domain stays `MdTokenName`-only

`shadcnRoleBindings`'s value type is unchanged — `MdTokenName`, the existing 49-name domain. Palette tones (`MD_PALETTE_TOKEN_NAMES`) and Tailwind palette swatches do **not** become binding kinds. They appear in the override picker as *value sources* — once selected, their current resolved hex is captured into `shadcnRoleOverrides`.

**Why:** the symbolic-tracking property is what justifies binding storage at all. An md-token binding tracks four dimensions (seed, variant, contrast level, paletteOverrides). A palette-tone binding would track two (seed, paletteOverrides). A tw-color binding tracks zero — it's a literal-with-a-name. Mixing kinds with different tracking semantics inside the binding union conflates them; routing palette/tw through the override picker keeps each concept clean. The "expose more bind targets" question (cmf memo's lifecycle target) remains open as a separate decision — if and when palette tones earn binding-kind status, that's a future ADR.

## 3. Override field shape mirrors `md3TokenOverrides`

Per-mode partial map of role → hex string. Empty default. Mode-keyed because users pin light and dark independently (light `--ring` pinned, dark `--ring` follows binding).

Setter action: `setShadcnRoleOverride(mode, role, hex | null)` — `null` deletes the entry. Hex format validated at the seam via `isValidHex`; malformed throws.

**Why:** identical shape to `md3TokenOverrides` modulo the key domain. One validator (`isValidHex`), one delete-on-null convention, one Partial-Record pattern. Sparse storage keeps the persisted blob lean and round-trips with `selectPortable` for free.

## 4. Resolution precedence

Per (mode, role), the resolved hex is computed in this order:

1. `shadcnRoleOverrides[mode][role]` — if present, this is the answer.
2. Else: resolve `shadcnRoleBindings[mode][role]` to its md token name; look up that token in the post-override md layer (which itself respects `md3TokenOverrides[mode]`).
3. If the binding pointer is malformed (token name not in the md layer): throw, same behavior as today's `bindShadcn`.

Override beats both binding and md-layer override. The two override axes operate on different scopes: `md3TokenOverrides` pins an MD token (and propagates through every shadcn role bound to it); `shadcnRoleOverrides` pins one shadcn role only.

**Why:** explicit precedence keeps the four-source resolution (override, binding, md-override, MCU) deterministic and testable. Override dominance reflects user intent — a literal pin is a stronger statement than a symbolic re-map, and the user invoked the more-specific surface (shadcn role) over the more-general one (md token).

## 5. `bindShadcn` becomes two-step

The resolver takes overrides as a third input alongside md-layer tokens and bindings. Per role, override-presence beats binding-resolution; hex is parsed at resolve time. The post-override md layer is built upstream by the md-override pass (current pipeline order preserved).

**Why:** the seam is one new function parameter and one new branch — no surgery to the rest of derive. Preserves ADR-0017's "deriveTheme is the single source of truth" — overrides resolve inside derive, every consumer sees the resolved value through the existing `DerivedTheme` shape.

## 6. Override picker is UI-side; storage is always hex

The override editor surface is a separate feature directory. Its picker can source values from any combination of: an MD-token combobox (capture the token's *current resolved hex*), an MD-palette-tone combobox (capture the tone's hex), a TW palette swatch picker, a native color picker, a hex text input. Whatever the source, storage is a single hex string.

**Why:** decoupling picker affordances from storage shape lets the UI evolve (add or remove sources, restructure groupings) without schema churn. The only invariant the schema cares about: hex format. Sources that resolve to a hex can grow or shrink freely; sources that don't resolve to a hex (a hypothetical "track this token symbolically" picker) would be a binding feature, not an override feature, and earn their own ADR.

## 7. Reset is two independent operations

Two distinct affordances, never collapsed:

- **Reset override** — `setShadcnRoleOverride(mode, role, null)`. Clears the override; the role falls back to its binding-resolved value.
- **Reset binding** — re-applies `DEFAULT_SHADCN_ROLE_BINDINGS[mode][role]` to that role's binding entry. The override (if any) is untouched.

A "reset everything for this role" affordance, if surfaced, composes the two — it doesn't replace either.

**Why:** the two axes have independent state. Collapsing reset into a single button forces a choice (reset which axis?) and loses partial state. Two atomic operations match the two-axis storage shape and let UI compose them as needed (group-level "reset to defaults," row-level "reset override only," etc).

## Consequences

- `DEFAULT_INPUTS.shadcnRoleOverrides = { light: {}, dark: {} }` keeps the drift-guard baseline byte-identical: an empty override default means `bindShadcn` takes the binding branch for every role, identical to today's emission. `globals.css` does not require rebake; the `applyDom.test.ts` drift-guard continues passing as-is.
- No `SCHEMA_VERSION` bump. The new field is added to `PortableThemeSchema` directly; persisted-state shapes that lack it fall through the existing rehydrate-failure path (reset to `DEFAULT_INPUTS`), consistent with ADR-0009's all-or-nothing recovery and the project's pre-release "no released-user contract to preserve" stance from `theme/schema.ts`.
- The cmf-vs-2025 spec memo's lifecycle target (a future "shadcn binding domain expansion" ADR for palette tones, fixed family, dim family as binding kinds) is **not** discharged here. This ADR leaves the binding domain unchanged per c.2; the memo's caveat about cmf-collapse in `*-dim` tokens still applies to its current binding-target subset.
- `evaluateThemeContrast` (per ADR-0025 c.8) reads `theme.shadcn[mode][role]` which is now post-override. `CONTRAST_PAIRS` unchanged. A user who pins `--ring` to a literal hex that fails 3:1 against `--background` will see slice contrast-3's non-text pair surface the warning automatically.
- `md3TokenOverrides` retains its scope (md-layer pin, propagates through bindings). Two scopes co-exist: pin the md-layer if you want every shadcn role bound to that token to track the same hex; pin the shadcn role if you want only that role affected. Same mental model, different surfaces.
- ADR-0017's "preview === export" contract holds: overrides resolve inside `deriveTheme`, the same single source the export pipeline consumes. The export's `:root + .dark` blocks reflect post-override values byte-for-byte.
- ADR-0023's UI-prefs scope is unaffected — the override layer is portable theme state (round-trips with the seed, persists to localStorage under STORAGE_KEY), not a display preference.
- A "snapshot from binding to override" affordance — pick the role, capture its currently-bound resolved hex, write it to overrides — falls out of the picker design naturally (it's just "MD-token combobox" applied to the role's current binding). Whether to expose this as a one-click button or require the user to walk the combobox is a UX call deferred to slice override-2.
