'use client'

import { useSource } from '@tonex/core-react'
import type { ComponentProps, ReactNode } from 'react'
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { useBindingBaseline } from '@/lib/stores/binding-baseline'

type ButtonProps = ComponentProps<typeof Button>

interface ResetButtonProps {
  variant?: ButtonProps['variant']
  size?: ButtonProps['size']
  children?: ReactNode
  onConfirm?: () => void
}

export function ResetButton({
  variant,
  size = 'sm',
  children = 'Reset to defaults',
  onConfirm,
}: ResetButtonProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant={variant} size={size} />}>
        {children}
      </AlertDialogTrigger>
      <ResetDialogContent onConfirm={onConfirm} />
    </AlertDialog>
  )
}

// The confirm window itself, shared by the button-triggered reset (inside the
// Settings popover/drawer) and the `R` hotkey's handle-driven dialog. Render it
// inside an <AlertDialog> — either trigger-anchored (ResetButton) or
// handle-driven (ResetHotkey). The dialog body and the reset action live here
// once so the two entry points can't drift.
export function ResetDialogContent({ onConfirm }: { onConfirm?: () => void }) {
  const reset = useSource((s) => s.actions.reset)
  // why: "Reset to defaults" clears every customization, so the binding rail's
  // tracked baseline (option 1.5) resets to the default routing too — otherwise a
  // post-reset hand-edit would measure "custom" against the stale last-applied
  // preset. Detection stays primary, so the immediate post-reset state is correct
  // regardless; this keeps the subsequent drift correct as well.
  const resetBaseline = useBindingBaseline((s) => s.actions.reset)
  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Reset to defaults?</AlertDialogTitle>
        <AlertDialogDescription>
          This restores every source field to its default value. Your current customizations will be
          cleared.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogClose render={<Button variant="ghost" />}>Cancel</AlertDialogClose>
        <AlertDialogClose
          onClick={() => {
            reset()
            resetBaseline()
            onConfirm?.()
          }}
          render={<Button variant="primary" />}
        >
          Reset
        </AlertDialogClose>
      </AlertDialogFooter>
    </AlertDialogContent>
  )
}
