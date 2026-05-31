# Surface system is a clean-bg escape valve, not a TW-flavored mode

MCU produces tinted neutrals (chromatic by design). Some users want clean, achromatic backgrounds while keeping MCU-generated chromatic components — that combination is what the surface system exists to enable.

**Decision:** Surface treatment touches **surface tokens only** — the chrome ramp (`surface`, `surface-container`, etc. on MD; `background`, `card`, `popover`, `sidebar` on shadcn). Component tokens (`muted`, `accent`, `border`, `secondary`, `ring`, `input` on shadcn; primary/secondary/tertiary families on MD) keep MCU-generated values unconditionally.

**Why:** "Clean chrome + MCU-tinted components, neutrally matched" is the wedge. Letting users pick TW-flavored components would force a symmetric ramp model and invite full "Radix mode" / "TW mode" demands — both of which dilute MCU as the engine (ADR-0001). The chrome/component asymmetry is intentional, not a missing feature.

**Consequence:**

- The neutral ramp can visibly disagree with itself (e.g. a clean background next to an MCU-neutral muted). This is accepted.
- The surface-only contract admits 1..N treatment knobs; the asymmetry is what's load-bearing, not the count.
- Mechanism is downstream and lives in its own ADR (ADR-0018). This ADR pins the asymmetry; ADR-0018 pins how it ships. Issue #5 holds the original decision trail.
