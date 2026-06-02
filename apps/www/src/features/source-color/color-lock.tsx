'use client'

import { useHotkey } from '@tanstack/react-hotkeys'
import { useSource } from '@tonex/core-react'
import { LockIcon, UnlockIcon } from 'lucide-react'
import { cn } from 'tailwind-variants'
import { Button } from '@/components/ui/button'
import { Kbd, KbdGroup } from '@/components/ui/kbd'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

export const ColorLock = ({ className }: { className?: string }) => {
  const seedHexLock = useSource((s) => s.seedHexLock)
  const setSeedHexLock = useSource((s) => s.actions.setSeedHexLock)

  const toggle = () => setSeedHexLock(!seedHexLock)

  useHotkey('Mod+L', toggle, {
    ignoreInputs: true,
    requireReset: false,
    conflictBehavior: 'replace',
    meta: {
      name: 'Lock current seed',
      description: 'Press L to lock current color',
    },
  })

  return (
    <Tooltip>
      <TooltipTrigger
        delay={100}
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className={cn('size-7 group', className)}
            onClick={toggle}
            aria-label={seedHexLock ? 'Unlock seed' : 'Lock seed'}
          >
            {seedHexLock ? (
              <LockIcon className="size-4 text-on-surface-variant group-hover:text-on-surface" />
            ) : (
              <UnlockIcon className="size-4 text-on-surface-variant group-hover:text-on-surface" />
            )}
          </Button>
        }
      />
      <TooltipContent>
        <p>{seedHexLock ? 'Unlock seed' : 'Lock seed'}</p>
        <KbdGroup className="mt-1">
          <Kbd className="h-4 min-w-4">⌘</Kbd>
          <Kbd className="h-4 min-w-4">L</Kbd>
        </KbdGroup>
      </TooltipContent>
    </Tooltip>
  )
}
