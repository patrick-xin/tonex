'use client'

// why: features/<name>/index.tsx is the public surface of a feature
// (rule 2 of the www anti-rot rules). Routes import from here only.
//
// The preview pane is where the shadcn sub-scope lives — `<div class="shadcn">`
// flips the CSS variable resolution from md tokens to shadcn tokens within
// this subtree. ADR-0013.

export function Preview() {
  return (
    <section style={{ display: 'grid', gap: 12 }}>
      <h2>preview pane (shadcn scope)</h2>
      <div className="shadcn">
        <div
          style={{
            padding: 24,
            background: 'var(--primary)',
            color: 'white',
            borderRadius: 8,
          }}
        >
          shadcn element — reads <code>var(--primary)</code>
        </div>
      </div>
    </section>
  )
}
