> **State:** Living rationale. Edit body when reality overtakes prose; the decision and rationale don't change without a new ADR.

# what a preset is — a seedful theme bundle, gated by touched-state

No ADR has governed presets; the model was set implicitly during curation, and it conflates two orthogonal things under one identity. A preset today bundles routing (the role→token bindings) with aesthetic treatment (variant + surface) and detects "active" by structural equality across the whole bundle — so a single binding edit and a variant swap each collapse the same identity. Worse for the original intent: the bundle deliberately excludes the seed, so the "editor's choice — give me something usable" promise can never actually reach the user, because the curated colors never travel with the preset.

The reframe rests on a property the pipeline already has. The faithful variants build every palette by scaling the seed's own hue and chroma — the cmf family derives primary, secondary, tertiary, and neutral directly from the seed, so the seed's chroma is the whole theme's chroma ceiling. A preset on that family has no color of its own: strip the seed and "warm" cannot be warm, and any of them collapses to grey on a grey seed. The detached variants (expressive, monochrome) manufacture their own chroma and barely consult the seed, but the model must serve the faithful majority. So a curated seed is load-bearing, not decoration.

**Decision:** six commitments, from the conceptual cut to the apply rule.

## 1. A preset adopts a whole theme; a routing shortcut is not a preset

The symbolic role→token map is ADR-0026's exploration knob. It is hard to author for someone who doesn't know the md-token vocabulary, so a named starting point in that map earns its place — but as a _convenience input to the knob_, not as a preset. Applying one stamps a set of bindings and leaves the user editing bindings, exactly as if they had typed them; it carries no identity, no source-side invariant, no switch confirmation. A preset, by contrast, is an adoptable identity for an entire theme.

**Why:** collapsing routing and aesthetic into one identity is what produced the ghost-action friction — a variant nudge silently dropping binding identity, and the reverse. Reserving "preset" for whole-theme adoption, and treating binding starting-points as convenience over an existing knob, keeps each concept's identity clean. This commitment is about _what is and isn't a preset_, not about how many preset kinds exist or what any surface calls them — those are convention and free to evolve.

## 2. A theme preset carries its curated source inputs, not only its recipe

A theme preset names a recipe (variant + surface treatment + the binding set it routes through) **and** the curated source inputs it was tuned against — seed and contrast level.

**Why:** see the chroma-ceiling property above. "Editor's choice" can only mean something if the preset can supply the color it was designed around; a recipe alone delivers the faithful presets as grey or off-temperature. The seed is part of the look, not an accessory to it.

## 3. Source inputs apply by per-field touched-state, not unconditionally

On applying a theme preset, each source input resolves independently:

- **Untouched** (still the app's boot default) → the preset's curated value supersedes it.
- **Touched** (the user chose it) → the user's value is preserved; the preset's curated value is dropped.

Seed and contrast are tracked separately.

**Why:** this preserves a user's owned inputs as sacred while still handing a no-color user a complete, usable starting point. Per-field because the two inputs are used independently — someone who tuned contrast for legibility but never picked a color should receive the curated color _and_ keep their contrast; an all-or-nothing gate would force one to lose.

## 4. The untouched default is not a user choice

Touched-state is a recorded signal, not a comparison against the default value. The app boots with a concrete seed and contrast, but a user sitting on those has expressed nothing — and a user may deliberately choose a value equal to the default, which a value comparison cannot tell apart from never having touched it.

**Why:** this is what lets commitment 3 supersede the default without violating the long-standing rule that a preset must not move the color the user chose. We only ever replace a value the user never set; the rule survives intact, scoped to genuine choices.

## 5. Curated source inputs apply but do not define preset identity

Active-preset detection compares the recipe only — variant, surface treatment, role bindings — never the seed or contrast.

**Why:** a user who adopted a preset's recipe and kept their own color is still meaningfully "on" that preset; the look is the preset's. Folding source inputs into identity would de-highlight every user who applied a preset against their own color — the intended, common case.

## 6. No confirmation gate on the source-input branch

A user who has chosen a color wants that color; keeping it is the right silent default, not a question. The rare user who wants to abandon their color for a preset's curated one resets their own input first — served by a reset affordance, not by the preset action.

**Why:** this is distinct from the existing recipe-switch confirmation, which still applies for its own reason — switching a preset overwrites binding, surface, and variant edits, and that destructive overwrite continues to warrant a confirm. The two "dirty" notions are orthogonal and must not be conflated: _recipe drift_ gates a confirmation; _source-input touched-state_ gates which value wins.

---

## Forward note — sharing (not decided here)

This is not part of the decision above; it records a conclusion from the design discussion so the question isn't relitigated if a shareable-link / copy-back feature is ever taken up.

If a theme is ever serialized into a shareable string, the format should be **by-value, not by-reference**: it encodes the resolved theme and decodes by re-running the pipeline locally, with no server resolution step. The rationale is the same property that motivates this ADR — the seed (arbitrary HCT / hex) and the role bindings (free-form per-role map) are open sets, so they cannot be encoded as a reference to a named preset the way a closed menu can.

The size cost of by-value is addressable: index-pack the closed-enum fields — variant, surface palette/algo, and the binding map's md-token targets — and quantize the continuous dials to fixed steps. Two disciplines make such a format durable and should be adopted from its first byte: a **version prefix**, and **append-only** ordering for every enum table an index points into (token names, role order, palette and variant names). Reordering or deleting an entry silently reinterprets every old string.
