> **State:** Living. Edit when domain vocabulary changes in code. Vocabulary for unbuilt features does not belong here.

## Project domain

This is a tool that turns a logo or seed hex color into a copy-paste-ready theme via Material Color Utilities (MCU). See ADRs in `docs/adr/` for load-bearing decisions.

**Engine**:
The fixed color-generation library: Material Color Utilities (MCU). Produces palettes from a seed using HCT/CAM16. Not swappable — see ADR-0001.

**Source**:
The persisted state — only what the user picked, never what was computed. `PortableTheme` in `packages/core/src/theme/schema.ts` is the wire shape; `SourceState` adds `_hydrated` and actions. HCT is the canonical seed representation, with the user's pasted hex preserved verbatim in `seed.exactHex` until they touch an HCT axis — see ADR-0028 (supersedes ADR-0003).

**Derived**:
Pure function of Source. `deriveTheme(source) → { md, shadcn, warnings }` in `packages/core/src/theme/derive.ts`. Both modes co-derive in one call. Never persisted. See ADR-0017.

**Sink**:
A consumer of Derived output. Today: `applyDom` (runtime renderer). Future: exporters in `packages/core/src/theme/exporters/` (slice 4). Each Sink only formats what `deriveTheme` returned — never recomputes. See ADR-0017.

**Spine**:
The single pure orchestrator: `deriveTheme(source) → { md, shadcn, warnings }`. See ADR-0005 (no facade) and ADR-0017 (lean spine).

**Variant**:
A named MCU scheme strategy (cmf, tonalSpot, etc.) registered in `packages/core/src/variants/`. Each entry implements `VariantStrategy` and feeds `deriveTheme` via a registry lookup.

**Surface treatment**:
A post-MCU transform on the neutral ramp. `surfaceAlgo: 'none' | 'tint' | 'desaturate'` selects at most one transform. Runs inside `deriveTheme` between md emit and shadcn bind so all consumers see the treated values.

**Lock**:
A boolean gate on a Source field that no-ops the corresponding setter while true. Today there is one: `seedHexLock` blocks every seed-write pathway (hex input, image extraction) at the store seam. Pinning a token to an exact hex is a separate concept — see `md3TokenOverrides` in `packages/core/src/theme/schema.ts`.

## Agent skills

**Issue tracker**:
GitHub Issues at `patrick-xin/tonex`. Skills like `to-issues`, `to-prd`, `triage` read from and write to it.
_Avoid_: backlog manager. Use "ticket" only when quoting external systems that call them tickets.

**Issue**:
A single tracked unit of work inside an Issue tracker — a bug, task, PRD, or slice produced by `to-issues`.

**Triage role**:
A canonical state-machine label applied to an Issue during triage (e.g. `needs-triage`, `ready-for-agent`). See `docs/agents/triage-labels.md`.

## Relationships

- An Issue tracker holds many Issues
- An Issue carries one Triage role at a time
