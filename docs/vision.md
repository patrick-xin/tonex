# Tonex — vision

Tonex is a **colour-authoring engine**: one seed colour in, a complete, perceptually-coherent, role-mapped token set out. The pipeline is HCT → MCU `DynamicScheme` → Material 3 tokens; shadcn tokens are derived by mapping the MD tokens through an active preset. Perceptual colour science is the foundation, not the pitch.

## Two ideas on one root

**Authored, not inherited.** Every value is a choice the user made, not a default they accepted — not borrowed colours, not the framework's tonal-spot defaults, not MCU's Material look, not an agent's throwaway output.

**Tonex is the safety net; the agent is the painter.** Tonex guarantees coherence — contrast holds, roles map, light and dark behave — and ships the tokens plus the rules for applying them. The agent binds those tokens into whatever colour system the user actually runs, because only it knows the target. Tonex hands over the palette and the constraints, not the canvas.

## Surfaces

- **www — the front door.** The only surface with visible proof: a playground showing two preview lenses over one authored system — byte-for-byte shadcn components, and MD tokens rendered through Base UI styled modern-shadcn-like (not Google/MUI).
- **CLI — ships and binds.** Three recipes — shadcn, DESIGN.md, raw Material JSON — consumable by agents through `SKILL.md`, with binding instructions that hand application to the agent.

## The 2026 landscape

The agent-design-system space now has *carriers* — DESIGN.md (Google's portable file), SKILL.md (the on-demand skill route), DTCG token JSON. They transport and describe tokens, but their colour blocks still have to be authored by something. Tonex is that something: the engine that **fills the block**, not a competing format or linter.

## What makes it distinct

- **Against HSL / scale generators:** they hand a ramp; tonex hands a coherent role-mapped system. The science is the gap.
- **Against MCU tools:** same rigour, but tonex *refuses* MCU's Material defaults — Tailwind-native surfaces, tunable neutrals, pinned roles that rebalance. The not-Material look is the differentiator a stranger verifies cold in the previews.
- **Against the carriers:** they describe tokens; tonex guarantees coherence that survives the agent's binding. Format export is commoditizing; a safety net is not.

## Decisions of record

This doc carries the *positioning*; architectural commitments live in the ADR sets (`docs/adr/`, `packages/core/docs/adr/`). Start with ADR-0001 (MCU is the fixed engine), ADR-0017 (WYSIWYG, no preview/export drift), ADR-0033 (DESIGN.md is an export target), and ADR-0039 (the CLI is an agent-first contract over the engine).
