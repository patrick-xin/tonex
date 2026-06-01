import { DEFAULT_SHADCN_ROLE_BINDINGS, type ShadcnRoleBindings } from '@tonex/core/schema'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export const BINDING_BASELINE_STORAGE_KEY = 'tonex-binding-baseline'
export const BINDING_BASELINE_SCHEMA_VERSION = 1

type BindingPair = { light: ShadcnRoleBindings; dark: ShadcnRoleBindings }

interface BindingBaseline {
  // why: the last preset (theme tier or binding tier) the user actually applied,
  // stored by-value. The binding rail reads this as the FALLBACK baseline for its
  // "custom" dots / reset target / group highlight when the live bindings have
  // drifted off every catalog preset and detection can no longer name one — so
  // editing ONE role no longer makes every untouched sibling row read
  // default-relative ("I changed one field, why did the others change?").
  // Detection stays primary in resolveExpectedBindings; this is consulted only in
  // the drifted state. Lives in www, NOT core's PortableTheme, so it never
  // pollutes the portable wire shape — a future www/core split stays clean
  // (option 1.5, chosen over option 2's tracked core field for exactly this).
  baseline: BindingPair
}

const DEFAULT_BINDING_BASELINE: BindingBaseline = {
  baseline: DEFAULT_SHADCN_ROLE_BINDINGS,
}

interface BindingBaselineActions {
  setBaseline(baseline: BindingPair): void
  setHydrated(): void
  reset(): void
}

export type BindingBaselineState = BindingBaseline & {
  _hydrated: boolean
  actions: BindingBaselineActions
}

// why: two-key blacklist — anything that isn't _hydrated or actions is a
// persistable field by construction. Same maintenance-free pattern as
// selectUiPrefs / selectPortable (ADR-0023 commitment 5).
export function selectBindingBaseline(s: BindingBaselineState): BindingBaseline {
  const { _hydrated: _h, actions: _a, ...rest } = s
  return rest
}

// why: SSR guard — undefined on the server so persist is a no-op during server
// render; initial state uses DEFAULT_BINDING_BASELINE. Mirrors useUiPrefs.
const storage = typeof window === 'undefined' ? undefined : createJSONStorage(() => localStorage)

export const useBindingBaseline = create<BindingBaselineState>()(
  persist(
    (set) => ({
      ...DEFAULT_BINDING_BASELINE,
      _hydrated: false,
      actions: {
        setBaseline: (baseline) => set({ baseline }),
        setHydrated: () => set({ _hydrated: true }),
        reset: () => set({ ...DEFAULT_BINDING_BASELINE }),
      },
    }),
    {
      name: BINDING_BASELINE_STORAGE_KEY,
      version: BINDING_BASELINE_SCHEMA_VERSION,
      storage,
      partialize: selectBindingBaseline,
      // why: v1 is initial — no prior version to migrate from. A role-set change
      // pre-launch bumps this version; stale shapes pass through here and the
      // resolver degrades to default-relative (option 1) until the next apply.
      migrate: (persistedState, _version) => persistedState as BindingBaseline,
      onRehydrateStorage: () => (state, error) => {
        if (state === undefined || error !== undefined) return
        state.actions.setHydrated()
      },
    },
  ),
)
