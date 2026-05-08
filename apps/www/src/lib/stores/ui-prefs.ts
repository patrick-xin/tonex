import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export const UI_PREFS_STORAGE_KEY = 'tonex-ui-prefs'
export const UI_PREFS_SCHEMA_VERSION = 1

interface UiPrefs {
  showExtended: boolean
}

const DEFAULT_UI_PREFS: UiPrefs = { showExtended: false }

interface UiPrefsActions {
  setShowExtended(next: boolean): void
  setHydrated(): void
  reset(): void
}

export type UiPrefsState = UiPrefs & {
  _hydrated: boolean
  actions: UiPrefsActions
}

// why: two-key blacklist — anything that isn't _hydrated or actions is, by
// definition, a persistable pref. New prefs at the top level flow through
// automatically; new actions stay bundled and auto-stay out. Same maintenance-
// free pattern as selectPortable in useSource (ADR-0023 commitment 5).
export function selectUiPrefs(s: UiPrefsState): UiPrefs {
  const { _hydrated: _h, actions: _a, ...prefs } = s
  return prefs
}

// why: no debounce — display prefs flip one at a time on user click, not
// streamed at 60Hz like theme sliders. createDebouncedStorage would import
// complexity without value. ADR-0023 commitment 7.
// why: SSR guard — pass undefined on the server so persist becomes a no-op
// during server render; initial state uses DEFAULT_UI_PREFS. Same pattern as
// useSource. ADR-0023 commitment 7.
const storage = typeof window === 'undefined' ? undefined : createJSONStorage(() => localStorage)

export const useUiPrefs = create<UiPrefsState>()(
  persist(
    (set) => ({
      ...DEFAULT_UI_PREFS,
      _hydrated: false,
      actions: {
        setShowExtended: (next) => set({ showExtended: next }),
        setHydrated: () => set({ _hydrated: true }),
        reset: () => set({ ...DEFAULT_UI_PREFS }),
      },
    }),
    {
      name: UI_PREFS_STORAGE_KEY,
      version: UI_PREFS_SCHEMA_VERSION,
      storage,
      // why: selectUiPrefs excludes _hydrated + actions; everything else is
      // a persistable pref by construction. ADR-0023 commitment 5.
      partialize: selectUiPrefs,
      // why: v1 is initial — no prior version to migrate from. Future versions
      // append ladder entries per ADR-0009.
      migrate: (persistedState, _version) => persistedState as UiPrefs,
      // why: type assertion sufficient for v1; the schema is one boolean.
      // Add Zod validation when the schema gains complexity (per useSource
      // pattern). ADR-0023 commitment 7.
      onRehydrateStorage: () => (state, error) => {
        if (state === undefined || error !== undefined) return
        state.actions.setHydrated()
      },
    },
  ),
)
