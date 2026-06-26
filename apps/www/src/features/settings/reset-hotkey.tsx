'use client'

import { useHotkey } from '@tanstack/react-hotkeys'
import { AlertDialog } from '@/components/ui/alert-dialog'
import { ResetDialogContent } from '@/features/reset-button'
import { resetDialogHandle } from '@/lib/handles'

// why: the `R` hotkey opens the reset confirm window directly, without first
// opening the Settings surface that hosts the ResetButton. That button's dialog
// only mounts while its popover/drawer is open, so this mounts a second,
// handle-driven copy of the same confirm window (ResetDialogContent) that's
// always reachable. Mounted by the always-on Settings component (desktop nav)
// alongside the `S` hotkey, so the binding stays alive across NavTabs remounts.
export function ResetHotkey() {
  useHotkey('R', () => resetDialogHandle.open(null), {
    ignoreInputs: true,
    requireReset: true,
    meta: { name: 'Reset', description: 'Press R to reset to defaults' },
  })
  return (
    <AlertDialog handle={resetDialogHandle}>
      <ResetDialogContent />
    </AlertDialog>
  )
}
