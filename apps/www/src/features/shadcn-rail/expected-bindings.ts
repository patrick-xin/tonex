import {
  findActiveBindingPreset,
  findActivePreset,
  isSoftEdgeWeight,
  type PortableTheme,
  SHADCN_BINDING_PRESETS,
  SHADCN_PRESETS,
  type ShadcnRoleBindings,
  withSoftEdges,
} from '@tonex/core/schema'

type BindingPair = { light: ShadcnRoleBindings; dark: ShadcnRoleBindings }

// why: the binding rail's "custom" dot, per-row reset target, and group highlight
// must measure divergence against the ACTIVE preset's routing, not the fixed
// `DEFAULT_SHADCN_ROLE_BINDINGS`. Reading the default made every non-default
// preset light up false-custom dots on untouched rows AND made per-row reset
// restore the *default* preset's value — actively breaking the active preset
// (resetting --card on `stark` yanked it to default's --card). This resolves the
// one `expected` map all three faces share.
//
// Baseline resolution is layered, detection first: a detected theme preset
// (findActivePreset) carries the richest curated routing, so it wins; otherwise a
// detected binding preset (findActiveBindingPreset) supplies pure routing. Both
// detectors are edge-tolerant, so the edge roles never affect WHICH baseline is
// chosen.
//
// When neither detector matches — a non-edge role has drifted off every preset —
// option 1 (no tracked state) reverted to the fixed default, which lit up EVERY
// untouched sibling row as false-custom ("I changed one field, why did the others
// change?"). Option 1.5 closes that: the caller passes `fallbackBaseline` — the
// last preset the user actually applied, tracked in a www-local store
// (`useBindingBaseline`) — so the drifted state keeps measuring against that
// preset and only the genuinely-drifted role reads custom. Detection stays
// PRIMARY: when the bindings exactly match a preset the fallback is never read, so
// a missed/stale stamp degrades to default-relative (option 1), never to a WRONG
// preset. The baseline concept lives entirely in www — core's wire shape is
// untouched, keeping a future www/core split clean. ADR-0036 — the one expected
// map all three faces share (#1) with detection-primary resolution (#3).
//
// The soft-border modifier is layered on top: when the current edge weight is soft
// (isSoftEdgeWeight), the three edge roles in the expected map are forced soft so
// the edge rows read as expected, not custom. Hard/custom edges leave the
// baseline's curated edges in place, so a real edge divergence still reads custom.
export function resolveExpectedBindings(
  theme: PortableTheme,
  fallbackBaseline: BindingPair,
): BindingPair {
  const base = resolveBaseline(theme, fallbackBaseline)
  return isSoftEdgeWeight(theme.shadcnRoleBindings) ? withSoftEdges(base) : base
}

function resolveBaseline(theme: PortableTheme, fallbackBaseline: BindingPair): BindingPair {
  const themePreset = findActivePreset(theme)
  if (themePreset !== null) return SHADCN_PRESETS[themePreset].shadcnRoleBindings

  const bindingPreset = findActiveBindingPreset(theme)
  if (bindingPreset !== null) return SHADCN_BINDING_PRESETS[bindingPreset].shadcnRoleBindings

  return fallbackBaseline
}
