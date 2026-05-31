> **State:** Living. Edit when the invalid-interaction pattern changes.

# Invalid interactions — disable, don't warn after the fact

Governs input affordances across www features.

- **Disable the affordance when a state combination makes an input invalid** — grey it out with an explanation (tooltip, disabled input). Don't allow the action then emit a `warnings: string[]` entry after the fact.
- **One source-of-truth selector, consumed both sides.** e.g. `disabledReasonFor(input, source): string | null` — the engine skips the op and the UI greys out + shows the tooltip from the same reason.
- **Reserve `warnings` for genuinely runtime-only failures** the UI couldn't pre-empt.
- **Worked pattern:** the tertiary-palette override is disabled when `variant === 'cmf'` — CMF builds tertiary from a second source, so the override would half-apply.
