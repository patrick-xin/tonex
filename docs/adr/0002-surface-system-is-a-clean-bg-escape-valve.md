> **State:** Frozen. Append amendment blocks only — never rewrite the body. New decisions get new ADRs.

# Surface system is a clean-bg escape valve, not a TW-flavored mode

MCU produces tinted neutrals (chromatic by design). Some users want clean, achromatic backgrounds while keeping MCU-generated chromatic components — that combination is what the surface system exists to enable.

**Decision:** When the user picks `surface.system: "tailwind"` (or future `"radix"`), only the **surface-role tokens** get sourced from the chosen palette.

- For MD, this only applies neutral palette(`surface`, `surface-container`, etc..).
- For Shadcn, this applies to (`background`, `card`, `popover`, `sidebar`)
  Components (`muted`, `accent`, `border`, `secondary`, `ring`, `input`) continue to sample the MCU-generated neutral palette unconditionally(mapping is not finalized, adjust when needed).

**Why:** "Clean chrome + MCU-tinted components, neutrally matched" is the wedge. Letting users pick TW-flavored components would force a symmetric ramp model and invite full "Radix mode" / "TW mode" demands — both of which dilute MCU as the engine (ADR-0001). The chrome/component asymmetry is intentional, not a missing feature.

**Consequence:**

- The neutral ramp can visibly disagree with itself (e.g. slate `background` next to MCU-neutral `muted`). This is accepted.
- `SurfaceProvider` produces only `Record<SurfaceRole, hex>`, never a full neutral palette.
- There are exactly two source-level tint controls: `source.surface.tintLevel` (chrome ramp) and `source.componentTintLevel` (component ramp). They are not symmetric and cannot be unified.
