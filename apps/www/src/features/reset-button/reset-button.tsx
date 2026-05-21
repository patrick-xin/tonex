'use client'

import { useSource } from '@tonex/core'
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
  const reset = useSource((s) => s.actions.reset)
  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant={variant} size={size} />}>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reset to defaults?</AlertDialogTitle>
          <AlertDialogDescription>
            This restores every source field to its default value. Your current customizations will
            be cleared.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogClose render={<Button variant="ghost" />}>Cancel</AlertDialogClose>
          <AlertDialogClose
            onClick={() => {
              reset()
              onConfirm?.()
            }}
            render={<Button variant="primary" />}
          >
            Reset
          </AlertDialogClose>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
