'use client'

import { useSource } from '@tonex/core'
import { Button } from '@/components/ui/button'

export function ResetButton() {
  const reset = useSource((s) => s.actions.reset)
  return (
    <Button
      size="sm"
      onClick={() => {
        if (typeof window !== 'undefined' && !confirm('Reset every source field to defaults?'))
          return
        reset()
      }}
    >
      reset to defaults
    </Button>
  )
}
