'use client'

import { useSource } from '@tonex/core'
import { RotateCcwIcon } from 'lucide-react'
import { cn } from 'tailwind-variants'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

// why: ADR-0031 #6 — the reset-then-adopt affordance for the seed. Un-touches
// the seed (value → boot default + clears the recorded signal) so the next
// preset apply supplies its curated seed. Sibling to ColorLock in the seed
// control row. Shown only when the seed is touched and unlocked: an untouched
// seed has nothing to reset, and a locked seed must be unlocked first (the lock
// already blocks preset supersession), so resetting under a lock is incoherent.
export const SeedReset = ({ className }: { className?: string }) => {
  const seedTouched = useSource((s) => s.seedTouched)
  const seedHexLock = useSource((s) => s.seedHexLock)
  const untouchSeed = useSource((s) => s.actions.untouchSeed)

  if (!seedTouched || seedHexLock) return null

  return (
    <Tooltip>
      <TooltipTrigger
        delay={100}
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className={cn('size-7 group', className)}
            onClick={untouchSeed}
            aria-label="Reset color"
          >
            <RotateCcwIcon className="size-4 text-on-surface-variant group-hover:text-on-surface" />
          </Button>
        }
      />
      <TooltipContent>
        <p>Reset color</p>
      </TooltipContent>
    </Tooltip>
  )
}
