import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { VariantName } from '../variants'
import {
  DEFAULT_INPUTS,
  type MdTokenName,
  type PortableTheme,
  SCHEMA_VERSION,
  type ShadcnRoleName,
  STORAGE_KEY,
} from './schema'

interface SourceActions {
  setSeedHex(seedHex: string): void
  setVariant(variant: VariantName): void
  setMd3PrimaryContainerOverride(mode: 'light' | 'dark', hex: string | null): void
  setShadcnRoleBinding(mode: 'light' | 'dark', role: ShadcnRoleName, mdToken: MdTokenName): void
  setSurfaceTintLevel(level: number): void
  setSurfaceDesaturateLevel(level: number): void
  setHydrated(): void
  reset(): void
}

export type SourceState = PortableTheme & SourceActions & { _hydrated: boolean }

// why: single projection from SourceState → PortableTheme. Used by:
//   - partialize (persistence write)
//   - applyDom (state.getState() → deriveTheme input)
//   - useResolvedTokens (subscription input via useShallow)
// Blacklist style: actions + _hydrated are the only non-portable bits, so as
// PortableTheme grows new fields flow through with no maintenance. Adding a
// new ACTION requires extending this destructure — TypeScript catches that
// because the rest type is checked against PortableTheme via the return type.
export function selectPortable(s: SourceState): PortableTheme {
  const {
    _hydrated: _h,
    setSeedHex: _ss,
    setVariant: _sv,
    setMd3PrimaryContainerOverride: _so,
    setShadcnRoleBinding: _sb,
    setSurfaceTintLevel: _sst,
    setSurfaceDesaturateLevel: _ssd,
    setHydrated: _sh,
    reset: _r,
    ...portable
  } = s
  return portable
}

export const useSource = create<SourceState>()(
  persist(
    (set) => ({
      ...DEFAULT_INPUTS,
      _hydrated: false,
      setSeedHex: (seedHex) => set({ seedHex }),
      setVariant: (variant) => set({ variant }),
      setMd3PrimaryContainerOverride: (mode, hex) =>
        set((s) => ({
          md3PrimaryContainerOverride: { ...s.md3PrimaryContainerOverride, [mode]: hex },
        })),
      setShadcnRoleBinding: (mode, role, mdToken) =>
        set((s) => ({
          shadcnRoleBindings: {
            ...s.shadcnRoleBindings,
            [mode]: { ...s.shadcnRoleBindings[mode], [role]: mdToken },
          },
        })),
      setSurfaceTintLevel: (surfaceTintLevel) => set({ surfaceTintLevel }),
      setSurfaceDesaturateLevel: (surfaceDesaturateLevel) => set({ surfaceDesaturateLevel }),
      setHydrated: () => set({ _hydrated: true }),
      reset: () => set({ ...DEFAULT_INPUTS }),
    }),
    {
      name: STORAGE_KEY,
      version: SCHEMA_VERSION,
      // why: pass `undefined` for storage on the server so persist becomes a
      // no-op during SSR — initial server render uses DEFAULT_INPUTS. On the
      // client, real localStorage is wired up and onRehydrateStorage fires
      // after the read completes, flipping _hydrated true.
      storage: typeof window === 'undefined' ? undefined : createJSONStorage(() => localStorage),
      // why: same blacklist as selectPortable — one source of truth for
      // "what's portable vs ephemeral." Persistence drift is no longer a
      // separate maintenance surface.
      partialize: selectPortable,
      // why: flip the _hydrated guard once persist completes. useResolvedTokens
      // returns null until this fires; applyDom only subscribes after this is
      // true. Structurally prevents Next.js hydration mismatches. ADR-0015.
      onRehydrateStorage: () => (state) => {
        state?.setHydrated()
      },
    },
  ),
)
