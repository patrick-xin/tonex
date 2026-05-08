> **State:** Frozen. Append amendment blocks only — never rewrite the body. New decisions get new ADRs.

# Workflow vs surface features, and locate-test as the design metric

ADR-0014 set five rules for `apps/www/src/` based on legacy-prototype failure modes. Those rules were directional commitments made before real features existed. Three slices later (editor-rail, export, testbed in active use; md/shadcn rail split and shadcn token-override route on the near horizon), the rules have hit two failure modes of their own.

**Failure 1 — homelessness.** Rule 5 ("features are layer-agnostic; no `features/md/` or `features/shadcn/`") was correctly aimed at workflow features (don't fork "pick a seed" per layer). But it also blocks layer-keyed *surface* compositions like `features/md-rail/` and `features/shadcn-rail/`, which are not workflow forks — they're the layer-specific composition sites where layer-agnostic atoms get assembled. Forcing such compositions into route layouts hides them from the locate-test (see below) and orphans cross-layer workflows like `token-override` that need a home that *isn't* shadcn-only.

**Failure 2 — locate-test was implicit.** Pattern-gravity (ADR-0014's stated motive) is really an agent-locality property: when a prompt names X, an agent should know exactly which folder to open. The rules approximated this but never made it the design metric. Without it, "tweak the md rail" can ambiguously land on `features/editor-rail/`, a route layout, or a sub-folder.

**Decision:**

1. **Two classes of features, both named after what the prompt calls them.**
   - **Workflow features** (verbs/actions — "what the user does"): `features/token-override/`, `features/source-color/`, `features/scheme-variant/`, `features/custom-colors/`, `features/surface-adjustment/`, `features/palette-override/`, `features/export/`. **Layer-agnostic.** A workflow feature operates on whichever layer's data its consumption site supplies.
   - **Surface features** (nouns/places — "where the user is"): `features/md-rail/`, `features/shadcn-rail/`, `features/top-nav/`, `features/testbed/`. Layer-keyed names are **allowed and encouraged here** because a surface IS the layer-specific composition site. Surface features compose workflow features. They do not contain workflow logic of their own beyond layout and tab switching.

2. **Locate-test is the design metric.** A prompt of the form "do X to Y" must resolve to one folder under `features/<Y>/` (workflow or surface) or one primitive under `components/`. If neither home exists, the structure has missed a name — the response is to **create the named feature folder before writing code**, not to tuck the work inside an unrelated folder.

   Worked examples (these are the test):
   - "Enable token override for shadcn" → open `features/token-override/` (workflow body) and `features/shadcn-rail/index.tsx` (wire it as a tab). Two folders, both named in the prompt.
   - "Tweak the md rail" → `features/md-rail/`. One folder.
   - "Top nav settings menu" → `features/top-nav/`. One folder.
   - "Test surface in www" → `features/testbed/`. One folder.
   - "Add a contribution-history block" → `app/(app)/theme/(md)/components/_blocks/` (route-colocated; not a feature because it's page content, not workflow or surface). The route segment names the consumption site.

3. **Layer-aware behavior reads from a route-provided `<LayerContext>`, never from per-caller props.** A workflow feature that needs to know which layer's tokens to operate on consumes a context provided by the route layout (`app/(app)/theme/(md)/layout.tsx`, `app/(app)/theme/(shadcn)/layout.tsx`). This is **not** the runtime primitive-switching pattern banned by ADR-0019 — primitives are still chosen at the consumption site (md route imports `components/ui/`; shadcn route imports `components/shadcn/`). What the context carries is *behavior parameter*: which token list, which scheme, which scope.

4. **Canvas content is route-colocated under `_folder`.** Demos, blocks, dashboards, charts and similar composed-from-primitives content live as `app/(app)/theme/(<layer>)/<page>/_<bucket>/<name>.tsx`. They are not workflows, not surfaces, not primitives — they are page content. If a block gets imported by 2+ pages, promote it to `features/<block-name>/` (workflow-flavored: "render a contribution-history block").

5. **`components/svg/` retires; icons live under `components/ui/`.** Icons aren't styled by tokens, but they travel with chrome (always md). Putting them under `ui/` keeps rule 4 intact (only `ui/` and `shadcn/` under `components/`).

**Why:** Agent-locality is the real value of pattern-gravity. The locate-test makes it falsifiable: structure that fails the test is wrong, regardless of how clean the rules read on paper. The workflow/surface split resolves homelessness without weakening the prohibition that mattered (don't fork workflows per layer). Route-provided `<LayerContext>` separates *behavior parameterization* (legitimate, useful) from *runtime primitive switching* (still banned, ADR-0019), which the original rule 5 conflated.

**Consequence:**

- ADR-0014 rules 1–4 stand unchanged. Rule 5 is **superseded** by this ADR's commitment 1: workflow features remain layer-agnostic; surface features may be layer-keyed. Rule 6 (locate-test) is added by this ADR's commitment 2.
- ADR-0019's "no in-app layer toggle" stands. The route is still the layer label. `<LayerContext>` (commitment 3) provides layer info to features for behavior, not for primitive selection — primitive selection remains route-level per ADR-0019 commitments 4–5. See ADR-0019 amendment of this date for the matching note.
- `features/editor-rail/` decomposes: atomic workflows split into siblings; the composition root becomes `features/md-rail/`. `features/shadcn-rail/` is its layer sibling.
- `features/use-active-mode.ts` (bare file at `features/` root) retires; the hook moves to `lib/hooks/use-active-mode.ts`. ADR-0014 rule 2 ("no bare files at `features/` root") stands; the hook never qualified as a feature.
- `features/export/` gains an `index.ts` per ADR-0014 rule 2.
- `components/svg/` contents move into `components/ui/`. The single existing consumer (`tw-color-picker-combobox.tsx`'s import of the Tailwind icon) updates accordingly.
- `docs/agents/www-structure.md` (living) updates to match. ADR-0014's body is untouched per its own frozen-doc convention; an amendment block points here.

**Doc lifecycle note:** This ADR exists because the original (ADR-0014) was a *pre-feature* directional commitment, and the repo's policy is "frozen, append-only" — rewriting its body would erase the pre-feature reasoning that's still useful as audit trail. Future evolutions of these rules should follow the same shape: new ADR, amendment back-pointer, living doc updated, code follows.
