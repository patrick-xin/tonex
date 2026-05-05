> **State:** Frozen. Append amendment blocks only — never rewrite the body. New decisions get new ADRs.

# ColorSystem is a palette library slot, not an engine

The existing type `ColorSystemDef` (in `color-systems/types.ts`) is named ambiguously — "system" reads like an engine. It is not. It is a curated palette library (Tailwind today, Radix tomorrow) that surfaces in two places in the app: the **surface choice** and the **color picker swatches**.

**Decision:** `ColorSystem` is the slot type for third-party palette libraries. Each adapter declares: a list of `ColorPalette` entries (palettes and their shades), an optional `neutralPalettes` subset (offerable as surfaces), and an optional `surfaceShadeMap` (which palette shades to use as which MD3 surface roles in light/dark). Adding Radix is **one file** — `color-systems/radix.ts` — registered through `color-systems/registry.ts`. No spine changes required.

**Why:**
- The slot already exists in code; previously framed as `ColorSystemDef`. Renaming/abstracting it would be churn.
- The two adapters expected (TW + Radix) plus the existing TW registration satisfy the **two adapters = real seam** test.
- An engine slot would violate ADR-0001 (MCU is fixed). A target slot (`shadcn` vs `radix-output` vs `tw-config`) is not currently warranted — shadcn is the only export format and that's not contested.

**Consequence:**
- "Color system" in this codebase always means "palette library." Future readers (and Claude) should not interpret it as engine, generator, or output format.
- A ColorSystem without a `surfaceShadeMap` is picker-only. A ColorSystem with one is also offerable as a surface. This asymmetry is intentional.
