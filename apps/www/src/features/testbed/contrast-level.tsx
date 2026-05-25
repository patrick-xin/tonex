'use client'

import { useSource } from '@tonex/core'
import { useActiveMode } from '@/features/theme-mode'

// why: MCU's contrastLevel input shifts tone offsets across every dynamic
// color in lockstep. 0=baseline, 1=maximum contrast. Range [0, 1] aligns
// with the source-state contract (issue #33) — MCU's spec [-1, 1] is
// nominal but the 2025/2026 curves treat anything <0 as identical to 0.
// Written straight to source so applyDom + formatCss reflect the same
// recomputed scheme by construction. Per-mode since #123 — edits the active
// mode's level.
export function ContrastLevel() {
  const contrastLevel = useSource((s) => s.contrastLevel)
  const setContrastLevel = useSource((s) => s.actions.setContrastLevel)
  const resolvedMode = useActiveMode() ?? 'light'
  const level = contrastLevel[resolvedMode]

  return (
    <label className="flex gap-3 items-center">
      <span className="text-sm w-16">contrast</span>
      <input
        type="range"
        min={0}
        max={1}
        step={0.1}
        value={level}
        onChange={(e) => setContrastLevel(resolvedMode, Number(e.target.value))}
        className="flex-1"
        aria-label="contrast level"
      />
      <code className="text-xs font-mono w-12">{level.toFixed(1)}</code>
    </label>
  )
}
