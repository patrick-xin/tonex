import { ExportButton } from '@/features/export/export-button'

const SHADCN_EXPORT_TABS = ['shadcn'] as const

export default function ShadcnPage() {
  return (
    <section className="flex flex-col gap-4">
      <div>ShadcnPage</div>
      <ExportButton tabs={SHADCN_EXPORT_TABS} />
    </section>
  )
}
