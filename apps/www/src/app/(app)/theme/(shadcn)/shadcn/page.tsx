import { ExportButton } from '../../../../../features/export/export-button'

// why: ADR-0021 commitment 8 — shadcn route owns its audience tabs. md
// audience uses 'Tailwind' as the primary tab; shadcn audience uses
// 'shadcn' so the active tab matches the layer the user adopted.
const SHADCN_EXPORT_TABS = ['shadcn', 'TS', 'JSON', 'Dart'] as const

export default function ShadcnPage() {
  return (
    <section className="flex flex-col gap-4">
      <div>ShadcnPage</div>
      <ExportButton tabs={SHADCN_EXPORT_TABS} />
    </section>
  )
}
