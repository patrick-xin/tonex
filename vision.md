# Tonex — vision

Tonex is a **colour-authoring engine**: one seed colour in, a complete, perceptually-coherent, role-mapped token set out. The pipeline is HCT → MCU `DynamicScheme` → Material 3 tokens; shadcn tokens are derived by mapping the MD tokens through an active preset. Light and dark are co-derived, and what you preview is byte-for-byte what you export (ADR-0017). Perceptual colour science is the foundation, not the pitch.

## Core spirit — two ideas on one root

**Authored by intent, not inherited by default.** Authored does not mean hand-picking every value. It means the system has a declared source, explicit constraints, and traceable choices: a seed the user or agent meant to use, roles that give each colour a job, contrast rules that decide what is allowed, and light/dark palettes that are co-derived instead of patched later. The opposite is inherited colour — borrowed palettes, framework defaults, MCU's stock Material look, or an agent's throwaway output with no contract underneath.

**Tonex is the safety net; the agent is the painter.** Tonex guarantees coherence — contrast holds, roles map, light and dark behave — and ships the tokens *plus the rules for applying them*. The agent can make the creative and contextual calls because it knows the target surface. Tonex makes those calls durable by handing over the palette and the constraints, not the canvas.

## What it is

A seed — any colour, extracted from a logo, pasted as hex or OKLCH, or chosen by hand — produces a complete palette: 28 MD3 colour roles across light and dark, contrast-guaranteed. The role *names* are not prescriptive; bind them however the target needs (using the generated `secondary` as your UI primary is valid). On top of the raw role set, tonex offers exactly two things:

- **Sugar** — recipes that pre-bind the roles for popular consumers (shadcn, DESIGN.md, raw Material JSON), a convenience, not a boundary.
- **A contrast checker** — `check` proves any pairing you choose clears WCAG, so the raw role set is a universal palette any colour surface can consume.

## Surfaces

- **www — the front door.** The only surface with visible proof: a playground showing two preview lenses over one intent-authored system — byte-for-byte shadcn components, and MD tokens rendered through Base UI styled modern-shadcn-like (not Google/MUI). www authors and shows.
- **CLI — ships and hands off.** Built; ships three recipes — shadcn, DESIGN.md, raw Material JSON — and is consumable by agents through `SKILL.md`, with binding instructions that hand application to the agent (ADR-0039).

## Who it's for

- **Agents** needing a coherent, contrast-checked colour system for whatever surface they are building, without inventing hexes from vibes.
- **Designers** porting a brand colour to a component system and needing accessibility-aware light/dark behaviour without choosing each shade.
- **Developers and teams** running both Material 3 (e.g. on iOS) and shadcn (on web) who want one source of truth across both ecosystems.

## The 2026 landscape

The agent-design-system space now has *carriers* — DESIGN.md (Google's single portable file), SKILL.md (the Anthropic / Vercel-Labs on-demand route), DTCG token JSON. They transport and describe tokens, but their colour blocks still need an authored source and enforceable constraints. Tonex is that layer: the colour-authoring engine that **fills the block** (ADR-0033), not a competing format or linter.

## What makes it distinct — three tiers

- **Against HSL / scale generators:** they hand a ramp; tonex hands a coherent role-mapped system. The science is the gap.
- **Against MCU tools (e.g. Material Theme Builder):** same rigour, but tonex *refuses* MCU's Material defaults — Tailwind-native surfaces, tunable neutrals, pinned roles that rebalance. The resulting not-Material look is the one differentiator a stranger verifies cold in the previews.
- **Against the carriers:** they describe tokens; tonex supplies the authored source and guarantees coherence that survives the agent's binding. Format export is commoditizing; a safety net is not.

## Non-goals

- **No engine swap.** MCU is the engine; alternative palette generators (custom algorithms, linear lightness ramps) are out of scope (ADR-0001).
- **Not the canvas.** Tonex authors and checks colour; it does not bind tokens into the target or own the final layout — that is the agent's job.
- **Not a Material Design framework.** The Material connection is the colour layer only (MCU-derived MD3 roles + shadcn tokens) — no MD components, motion, elevation, or shape.
- **Not a carrier format.** Tonex fills DESIGN.md / SKILL.md / DTCG blocks; it does not compete with them as a transport.

## Decisions of record

This doc carries the *positioning*. Architectural commitments live in the ADR sets (`docs/adr/`, `packages/core/docs/adr/`):

- ADR-0001 — MCU is the fixed colour engine
- ADR-0013 — layer architecture: MD default, shadcn subscope
- ADR-0017 — WYSIWYG, no preview/export drift
- ADR-0033 — DESIGN.md is an export target, not a source
- ADR-0039 — the CLI is an agent-first contract over the engine

Read the ADR index for the full set.
