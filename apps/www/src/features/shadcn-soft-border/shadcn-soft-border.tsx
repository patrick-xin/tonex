'use client'

import { Switch } from '@/components/ui/switch'
import { useSoftBorder } from './toggle'

// why: shadcn-side ergonomic toggle. The persisted bindings ARE the truth —
// `useSoftBorder` derives the checked state and writes both modes' --border /
// --input on change. No new core field, no migration. Layout is intentionally
// minimal here (label + switch) because the testbed leaf is the small-loop
// verification surface; production placement (e.g. inside shadcn-rail) wraps
// the same hook with whatever container chrome that surface provides.
export function ShadcnSoftBorder() {
  const { enabled, setEnabled } = useSoftBorder()
  return (
    <fieldset className="grid gap-2 border rounded-lg p-3">
      <legend className="text-xs px-2 opacity-70">shadcn — soft border</legend>
      <div className="flex items-center gap-3">
        <Switch checked={enabled} onCheckedChange={setEnabled} aria-label="enable soft border" />
        <span className="text-sm">
          bind <code className="text-xs">--border</code> + <code className="text-xs">--input</code>{' '}
          to <code className="text-xs">--color-outline-variant</code>
        </span>
      </div>
      <p className="text-xs opacity-60">
        Off restores both roles to <code>--color-outline</code>; custom bindings on those two roles
        are not preserved across the switch.
      </p>
    </fieldset>
  )
}
