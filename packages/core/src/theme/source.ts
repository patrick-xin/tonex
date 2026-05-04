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
  setHydrated(): void
  reset(): void
}

export type SourceState = PortableTheme & SourceActions & { _hydrated: boolean }

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
      // why: blacklist actions + _hydrated rather than whitelisting persisted
      // fields. As PortableTheme grows, new fields persist automatically.
      // Whitelist drifted in legacy by forgetting to add new fields.
      partialize: ({
        _hydrated: _h,
        setSeedHex: _ss,
        setVariant: _sv,
        setMd3PrimaryContainerOverride: _so,
        setShadcnRoleBinding: _sb,
        setHydrated: _sh,
        reset: _r,
        ...persisted
      }) => persisted,
      // why: flip the _hydrated guard once persist completes. useResolvedTokens
      // returns null until this fires; applyDom only subscribes after this is
      // true. Structurally prevents Next.js hydration mismatches. ADR-0015.
      onRehydrateStorage: () => (state) => {
        state?.setHydrated()
      },
    },
  ),
)
