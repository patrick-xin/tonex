// why: features/<name>/index.tsx is the public surface of a feature
// (rule 2 of the www anti-rot rules). Routes import from here only.
//
// The preview pane is where the shadcn sub-scope lives — `<div class="shadcn">`
// flips the CSS variable resolution from md tokens to shadcn tokens within
// this subtree. ADR-0013.
//
// bg-primary / text-primary-foreground inside .shadcn resolve through the
// alias declared in globals.css (.shadcn { --color-primary: var(--primary) }).
// The visible color must match the md primary-container swatch — that is the
// mapping rule under verification. If they differ, drift.

export function Preview() {
  return (
    <div className="grid gap-3">
      <h2 className="text-lg font-medium">shadcn scope</h2>
      <div className="shadcn grid gap-3">
        <div className="bg-primary text-primary-foreground p-6 rounded-lg">
          <div className="font-medium">primary / primary-foreground</div>
          <div className="text-xs opacity-80 mt-1">
            utilities: bg-primary text-primary-foreground
          </div>
          <div className="text-xs opacity-80 mt-1">
            mapped from md primary-container / on-primary-container
          </div>
        </div>
      </div>
    </div>
  )
}
