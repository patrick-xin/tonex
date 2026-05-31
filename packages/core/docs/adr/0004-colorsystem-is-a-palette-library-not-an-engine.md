# ColorSystem is a palette library slot, not an engine

The type `ColorSystemDef` is named ambiguously — "system" reads like an engine. It is not: it is the slot for a curated **palette library** (Tailwind, Radix) that surfaces in two places — the surface choice and the color-picker swatches.

**Decision:** `ColorSystem` is the slot type for third-party palette libraries. An adapter declares its palettes — and optionally which neutral palettes are offerable as surfaces, and which palette shades map to which MD3 surface roles — so adding a library is one adapter file plus a registry entry, with no engine or spine change. The adapter's exact shape is code when the slot is built: this decision is **forward-looking**. The rewrite has no `color-systems/` directory today (`packages/core/src/` is `theme/` + `variants/`); the slot is built when the second adapter (Radix) is actually in scope, per the **two-adapters = real seam** test.

**Why:**
- An engine slot would violate ADR-0001 (MCU is the fixed engine). A palette-library slot does not — it feeds the picker and surface choice, never replaces MCU.
- A separate output-target slot (`shadcn` vs `radix-output` vs `tw-config`) is not warranted — shadcn is the only export format and that is uncontested.
- Two expected adapters (TW + Radix) clear the two-adapters = real seam bar; one speculative adapter would not.

**Consequence:** "Color system" in this codebase always means "palette library" — never engine, generator, or output format. An adapter without a surface-role map is picker-only; one with it is also offerable as a surface. That asymmetry is intentional.

**Code anchors:** none — forward-looking palette-library slot; no color-systems/ directory exists until the second (Radix) adapter clears the two-adapters bar.
