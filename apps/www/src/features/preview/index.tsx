// why: features/<name>/index.tsx is the public surface of a feature
// (rule 2 of the www anti-rot rules). Routes import from here only.
//
// The preview pane is where the shadcn sub-scope lives — `<div class="shadcn">`
// flips the CSS variable resolution from md tokens to shadcn tokens within
// this subtree. ADR-0013.
//
// bg-primary / text-primary-foreground inside .shadcn resolve through the
// alias declared in globals.css (.shadcn { --color-primary: var(--primary) }).
// The hex printed on the swatch must match the rendered color — visible drift
// is the failure mode under verification.

'use client'

import { useResolvedTokens } from '@tonex/core'
import { useTheme } from 'next-themes'

export function Preview() {
  const theme = useResolvedTokens()
  const { resolvedTheme } = useTheme()
  const mode = resolvedTheme === 'light' || resolvedTheme === 'dark' ? resolvedTheme : null

  return (
    <div className="grid gap-3">
      <h2 className="text-lg font-medium">shadcn scope{mode ? ` (${mode})` : ''}</h2>
      <div className="shadcn grid gap-3">
        <div className="bg-primary text-primary-foreground p-6 rounded-lg">
          <div className="font-medium">primary / primary-foreground</div>
          {theme && mode && (
            <div className="text-xs opacity-80 mt-1 font-mono">
              {theme.shadcn[mode]['--primary']} / {theme.shadcn[mode]['--primary-foreground']}
            </div>
          )}
          <div className="text-xs opacity-80 mt-1">
            utilities: bg-primary text-primary-foreground
          </div>
        </div>
      </div>
    </div>
  )
}
