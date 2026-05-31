# Lift-vs-rewrite standard for legacy code (historical)

The legacy prototype was migrated into the rewritten tree under a four-verdict standard — lift verbatim / lift-JSX-rewrite-wiring / discard-reference-only / discard-outright — made mechanical by a pre-lift grep for engine imports. **That migration is complete; this is the record, not live how-to.**

The one durable lesson outlives the task: **pattern-gravity — the first lifted file is the template every later lift imitates**, so a stale field name or resolved abstraction dragged in once propagates (and parallel subagent lifts amplify it before review catches it). This ADR also stands as the precedent that a *blueprint slice* — ADR/doc updates with no code — is a legitimate slice shape, cited as such by `slice-strategy.md`.
