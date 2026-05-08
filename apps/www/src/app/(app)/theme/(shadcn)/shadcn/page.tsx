import { ExportButton } from '@/features/export/export-button'
import { ShadcnComponentsDemo } from './_components'

const SHADCN_EXPORT_TABS = ['shadcn'] as const

export default function ShadcnPage() {
  return (
    <section className="flex flex-col gap-4">
      <ShadcnComponentsDemo />
      <ExportButton tabs={SHADCN_EXPORT_TABS} />
    </section>
  )
}
