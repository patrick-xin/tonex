## Project domain

This is a tool that turns a logo or seed hex color into a copy-paste-ready shadcn theme via Material Color Utilities (MCU). See ADRs in `docs/adr/` for load-bearing decisions.

**Engine**:
The fixed color-generation library: Material Color Utilities (MCU). Produces palettes from a seed using HCT/CAM16. Not swappable — see ADR-0001.

**ColorSystem**:
A curated third-party palette library (Tailwind today, Radix planned). Surfaces in two places: the surface picker and the color-picker swatches. Defined by `ColorSystemDef` in `color-systems/types.ts`. NOT an engine and NOT an output target — see ADR-0004.
_Avoid_: "color engine," "color generator," "color provider"

**Source**:
The persisted state — only what the user picked, never what was computed. Hex seed, variant, contrast level, surface choice, tint levels, overrides. See ADR-0003 for the canonical seed representation.

**Derived**:
Pure functions of Source. The palettes, MD3 roles, shadcn tokens, CSS string. Never persisted. Currently scattered across multiple resolver files; being consolidated behind `deriveTheme`.

**Sink**:
A side-effect adapter that consumes Derived output. DOM (writes CSS variables), clipboard (writes shadcn CSS string). Each Sink is a pure function of `ResolvedTheme` plus one effect call.

**Spine**:
The single pure orchestrator: `deriveTheme(source) → { md, shadcn, css, warnings }`. Composes named pure transforms (palettes, surface, tokens, css). See ADR-0005 — there is no class facade around this.

**Chrome ramp** / **Component ramp**:
Two distinct token sets with independent tint controls. Chrome = surface roles (background, card, popover, sidebar). Component = soft-fill tokens (muted, accent, border, secondary, ring, input). The asymmetry is intentional — see ADR-0002.

**SurfaceProvider**:
The slot that turns `source.surface` into chrome-ramp role overrides. Two adapters today: MD3 chroma-scaled neutral, Tailwind-blended palette. Output is `Record<SurfaceRole, hex>` — never a full neutral palette.

## Agent skills

**Issue tracker**:
The tool that hosts a repo's issues — GitHub Issues, Linear, a local `.scratch/` markdown convention, or similar. Skills like `to-issues`, `to-prd`, `triage`, and `qa` read from and write to it.
_Avoid_: backlog manager, backlog backend, issue host

**Issue**:
A single tracked unit of work inside an **Issue tracker** — a bug, task, PRD, or slice produced by `to-issues`.
_Avoid_: ticket (use only when quoting external systems that call them tickets)

**Triage role**:
A canonical state-machine label applied to an **Issue** during triage (e.g. `needs-triage`, `ready-for-afk`). Each role maps to a real label string in the **Issue tracker** via `docs/agents/triage-labels.md`.

## Relationships

- An **Issue tracker** holds many **Issues**
- An **Issue** carries one **Triage role** at a time
