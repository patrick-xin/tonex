# Workflow vs surface features, and locate-test as the design metric

ADR-0014 set five rules for `apps/www/src/` based on legacy-prototype failure modes. Those rules were directional commitments made before real features existed. Three slices later (editor-rail, export, testbed in active use; md/shadcn rail split and shadcn token-override route on the near horizon), the rules have hit two failure modes of their own.

**Failure 1 — homelessness.** Rule 5 ("features are layer-agnostic; no `features/md/` or `features/shadcn/`") was correctly aimed at workflow features (don't fork "pick a seed" per layer). But it also blocks layer-keyed *surface* compositions like `features/md-rail/` and `features/shadcn-rail/`, which are not workflow forks — they're the layer-specific composition sites where layer-agnostic atoms get assembled. Forcing such compositions into route layouts hides them from the locate-test (see below) and orphans cross-layer workflows like `token-override` that need a home that *isn't* shadcn-only.

**Failure 2 — locate-test was implicit.** Pattern-gravity (ADR-0014's stated motive) is really an agent-locality property: when a prompt names X, an agent should know exactly which folder to open. The rules approximated this but never made it the design metric. Without it, "tweak the md rail" can ambiguously land on `features/editor-rail/`, a route layout, or a sub-folder.

**Decision:**

1. **Two classes of features, both named after what the prompt calls them.**
   - **Workflow features** (verbs/actions — "what the user does"). **Layer-agnostic.** A workflow feature operates on whichever layer's data its consumption site supplies.
   - **Surface features** (nouns/places — "where the user is"). Layer-keyed names are **allowed and encouraged here** because a surface IS the layer-specific composition site. Surface features compose workflow features. They do not contain workflow logic of their own beyond layout and tab switching.

2. **Locate-test is the design metric.** A prompt of the form "do X to Y" must resolve to one folder under `features/<Y>/` (workflow or surface) or one primitive under `components/`. If neither home exists, the structure has missed a name — the response is to **create the named feature folder before writing code**, not to tuck the work inside an unrelated folder. Page content (blocks, demos, dashboards) is route-colocated under `_folder/` instead — the route segment names the consumption site (see commitment 4).

3. **Layer-aware behavior reads from a route-provided `<LayerContext>`, never from per-caller props.** A workflow feature that needs to know which layer's tokens to operate on consumes a context provided by the route layout (`app/(app)/theme/(md)/layout.tsx`, `app/(app)/theme/(shadcn)/layout.tsx`). This is **not** the runtime primitive-switching pattern banned by ADR-0019 — primitives are still chosen at the consumption site (md route imports `components/ui/`; shadcn route imports `components/shadcn/`). What the context carries is *behavior parameter*: which token list, which scheme, which scope.

4. **Canvas content is route-colocated under `_folder`.** Demos, blocks, dashboards, charts and similar composed-from-primitives content live as `app/(app)/theme/(<layer>)/<page>/_<bucket>/<name>.tsx`. They are not workflows, not surfaces, not primitives — they are page content. If a block gets imported by 2+ pages, promote it to `features/<block-name>/` (workflow-flavored: "render a contribution-history block").

5. **`components/svg/` retires.** Icons aren't styled by tokens, but they travel with chrome (always md). They live in their own folder under `components/`, distinct from layer-keyed primitives — the `svg/` folder was the failure mode this commitment retires.

**Why:** Agent-locality is the real value of pattern-gravity. The locate-test makes it falsifiable: structure that fails the test is wrong, regardless of how clean the rules read on paper. The workflow/surface split resolves homelessness without weakening the prohibition that mattered (don't fork workflows per layer). Route-provided `<LayerContext>` separates *behavior parameterization* (legitimate, useful) from *runtime primitive switching* (still banned, ADR-0019), which the original rule 5 conflated.

**Consequence:**

- ADR-0014 rules 1–4 stand unchanged. Rule 5 is **superseded** by this ADR's commitment 1: workflow features remain layer-agnostic; surface features may be layer-keyed. Rule 6 (locate-test) is added by this ADR's commitment 2.
- ADR-0019's "no in-app layer toggle" stands. The route is still the layer label. `<LayerContext>` (commitment 3) provides layer info to features for behavior, not for primitive selection — primitive selection remains route-level per ADR-0019 commitments 4–5. See ADR-0019 amendment of this date for the matching note.
- `apps/www/CLAUDE.md` (living) updates to match; it holds the worked examples that resolve the locate-test for current surfaces.

**Doc lifecycle — superseded by ADR-0034 Part B (Decisions 6–7).** A new decision still gets a new ADR with a supersession redirect; the `ADR-0014 → ADR-0022` chain stands. What changed is the rest of the original shape: a rule's *current statement* now lives as current truth in the owning ADR's body (rules 5–6 here), not reconstructed from a frozen original plus an amendment chain. ADR-0014's pre-feature reasoning is preserved as the rejected alternative beside the current rule, not as an audit trail the reader replays.

**Code anchors:** `apps/www/src/lib/layer-context.tsx` — workflow/surface split + route-provided LayerContext.
