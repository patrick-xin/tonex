# User guidance — three surfaces

Three non-overlapping guidance surfaces, each classified by the *kind* of help, not the control it explains. Depth lives in exactly one surface (reference); the others point at it. _(ADR-0030)_

**Adding guidance starts with a classification, not a component** — orientation (→ a tour stop), reference (→ a dialog section), or a reaction to live state (→ an inline cue). "Add a tooltip to this control" is not an available answer. _(ADR-0030)_

## Orientation — the tour (`features/onboarding-guide/`)
- **Add a tour stop as a `GuideStep` in `tour-steps.tsx`** — one sentence, with `layers`, `anchorKey`, and a `learnMore` pointing at a registered reference section; wrap the target control in `<GuideAnchor anchorKey="…">` at its own feature's call site. _(ADR-0030)_
- **One sentence per stop; never carry reference depth** — defer it via `learnMore`. `layers` must match the workspace the stop belongs to. Desktop-only — a mobile tour is a separate orientation of a separate layout, not the desktop tour reflowed. _(ADR-0030)_

## Reference — the help dialog (`features/help-dialog/`)
- **Canonical depth lives here and nowhere else** — prose in `key-concepts.tsx` + `qa.tsx`. Add a concept/Q&A block and register its id in `help-sections.ts`; the dialog covers both layers regardless of where it's opened. _(ADR-0030)_
- **Guidance that reads like reference routes into the dialog even when it's "about" a rail control** — putting it on the rail both clutters the rail and forks the canonical copy. _(ADR-0030)_

## Inline cue (`hints.ts` beside the reacting feature)
- **An inline cue is a pure `state → show/hide` predicate** (e.g. `features/scheme-variant/hints.ts`), rendered as muted microcopy next to the control, with a test. _(ADR-0030)_
- **No persistent tooltips, no per-control "?" buttons** — a cue not conditioned on live state isn't an inline cue. _(ADR-0030)_

## The one guarded coupling
- **Every tour `learnMore` must resolve to a registered reference section** — `help-sections.test.ts` fails a dangling deep-link rather than shipping. All other cross-surface overlap is intentional paraphrase, left to prose. _(ADR-0030)_
