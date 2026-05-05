'use client'

import { useSource } from '@tonex/core'

export function ResetButton() {
  const reset = useSource((s) => s.reset)
  return (
    <button
      type="button"
      onClick={() => {
        if (typeof window !== 'undefined' && !confirm('Reset every source field to defaults?'))
          return
        reset()
      }}
      className="text-xs px-3 py-1.5 border rounded self-start"
    >
      reset to defaults
    </button>
  )
}
