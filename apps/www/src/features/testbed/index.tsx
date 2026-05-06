// why: testbed is the small-loop verification surface — every editing
// control + every preview slot the slice is exercising lives here as a
// flat set of leaves. The composition root is a server component (no
// hooks); each leaf carries its own 'use client'. Splitting like this
// pushes the client boundary down to the actual store consumers, so the
// route shell stays server-renderable.
//
// All current testing UIs collapse here — surface treatments are no longer
// at /sink/tint, the home shadcn preview is no longer a separate feature.
// One feature, one composition root, one consumer route (/sink). When
// production UI ships, /  diverges from /sink and testbed survives as the
// dev-only surface.

import { ContrastLevel } from './contrast-level'
import { CustomColors } from './custom-colors'
import { ExportPanels } from './export-panels'
import { MdSwatches } from './md-swatches'
import { PrimaryContainerOverride } from './primary-container-override'
import { PrimitivesDemo } from './primitives-demo'
import { ResetButton } from './reset-button'
import { SeedInput } from './seed-input'
import { ShadcnBindings } from './shadcn-bindings'
import { ShadcnPreview } from './shadcn-preview'
import { SurfaceTint } from './surface-tint'
import { VariantPicker } from './variant-picker'

export function Testbed() {
  return (
    <main className="grid gap-6 p-6 max-w-[960px]">
      <header>
        <h1 className="text-2xl font-semibold">sink — testbed</h1>
        <p className="opacity-70 text-sm">
          small-loop testing surface — every editor + preview pane the current slice exercises.
        </p>
      </header>

      <SeedInput />
      <VariantPicker />
      <ContrastLevel />
      <PrimaryContainerOverride />
      <ShadcnBindings />
      <SurfaceTint />
      <CustomColors />

      <MdSwatches />
      <ShadcnPreview />

      <PrimitivesDemo />

      <ExportPanels />

      <ResetButton />
    </main>
  )
}
