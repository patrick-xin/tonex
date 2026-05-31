# Override layer — bindings vs overrides

Governs `theme/palette-override/`.

- **Two axes, never conflated.** Don't fold override into binding as a `kind: 'hex'` discriminator — bindings stay symbolic, overrides literal. _(ADR-0026 c.1)_
- **Binding domain stays `MdTokenName`-only.** Palette tones and TW swatches enter the *override* picker as value sources, not binding kinds. _(ADR-0026 c.2)_
- **Override storage is per-mode partial map of role → hex.** `shadcnRoleOverrides: { light: {...}, dark: {...} }`, empty default. _(ADR-0026 c.3)_
- **Setter: `setShadcnRoleOverride(mode, role, hex | null)`.** `null` deletes; hex validated via `isValidHex`, malformed throws. _(ADR-0026 c.3)_
- **Resolution precedence: override > binding-resolved md token,** per (mode, role); a malformed binding pointer throws (same as `bindShadcn`). _(ADR-0026 c.4)_
- **`bindShadcn` takes overrides as a third input** — one new parameter, one new branch. _(ADR-0026 c.5)_
- **Override picker is UI-side; storage is always hex.** May source from any combobox but persists one hex string. _(ADR-0026 c.6)_
- **Reset is two independent operations** — "reset override" clears the override; "reset binding" re-applies `DEFAULT_SHADCN_ROLE_BINDINGS`. Don't collapse. _(ADR-0026 c.7)_
- **Two scopes co-exist.** `md3TokenOverrides` pins an md token (propagates to every bound shadcn role); `shadcnRoleOverrides` pins one shadcn role. _(ADR-0026)_
- **md3 token pins land before `applyTreatment`.** A pin on a treated surface/outline token is then subject to the active treatment — the surgical-pin guarantee is "beats MCU + palette regen", never "beats the surface treatment". Escape hatch: a shadcn-layer override (runs after treatment) or lower the level. _(ADR-0018 Amendment 2026-05-21)_
