'use client'

import { useSource } from '@tonex/core'
import type { ShadcnPresetName } from '@tonex/core/schema'
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  createAlertDialogHandle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

// why: imperative handle threads the pending preset name (the payload) from
// the call site into the dialog without intermediate React state. Mirrors
// `deleteAlertDialogHandle` in data-table/dialogs/delete-account.tsx — one
// dialog component serves every preset chip via payload-typed handle + render
// prop.
export const presetSwitchAlertHandle = createAlertDialogHandle<ShadcnPresetName>()

// why: confirms a preset switch when the user has drifted off every shipped
// preset (predicate at ./predicate.ts). The Continue path is the standard
// setShadcnPreset call — preset semantics per ADR-0026 are unchanged. The
// description explicitly names what survives (hex overrides) vs. what resets
// (bundle scalars + bindings) so the user can decide without surprise.
export function PresetSwitchDialog() {
  const setShadcnPreset = useSource((s) => s.actions.setShadcnPreset)
  return (
    <AlertDialog handle={presetSwitchAlertHandle}>
      {({ payload }) => (
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Switch to {payload}?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved customizations to bindings, surface, or variant. Switching to{' '}
              <span className="font-medium text-on-surface">{payload}</span> will reset them. Color
              overrides (hex pins) are preserved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogClose render={<Button variant="ghost" />}>Cancel</AlertDialogClose>
            <AlertDialogClose
              onClick={() => {
                if (payload) setShadcnPreset(payload)
              }}
              render={<Button variant="primary" />}
            >
              Continue
            </AlertDialogClose>
          </AlertDialogFooter>
        </AlertDialogContent>
      )}
    </AlertDialog>
  )
}
