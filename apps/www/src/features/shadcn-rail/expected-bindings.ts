import {
  DEFAULT_SHADCN_ROLE_BINDINGS,
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
// Baseline detection is layered, theme tier first: a detected theme preset
// (findActivePreset) carries the richest curated routing, so it wins; otherwise a
// detected binding preset (findActiveBindingPreset) supplies pure routing; if
// neither matches — a non-edge role has drifted off every preset — we fall back
// to the fixed default ("custom routing"). This is option 1 (detection-based, no
// tracked baseline field): cheap and by-value-clean, with one residual gap — a
// hand-edit to a non-edge role reverts the baseline to default-relative until the
// user lands back on a preset. Both detectors are edge-tolerant, so the edge
// roles never affect WHICH baseline is chosen.
//
// The soft-border modifier is layered on top: when the current edge weight is soft
// (isSoftEdgeWeight), the three edge roles in the expected map are forced soft so
// the edge rows read as expected, not custom. Hard/custom edges leave the
// baseline's curated edges in place, so a real edge divergence still reads custom.
export function resolveExpectedBindings(theme: PortableTheme): BindingPair {
  const base = resolveBaseline(theme)
  return isSoftEdgeWeight(theme.shadcnRoleBindings) ? withSoftEdges(base) : base
}

function resolveBaseline(theme: PortableTheme): BindingPair {
  const themePreset = findActivePreset(theme)
  if (themePreset !== null) return SHADCN_PRESETS[themePreset].shadcnRoleBindings

  const bindingPreset = findActiveBindingPreset(theme)
  if (bindingPreset !== null) return SHADCN_BINDING_PRESETS[bindingPreset].shadcnRoleBindings

  return DEFAULT_SHADCN_ROLE_BINDINGS
}
