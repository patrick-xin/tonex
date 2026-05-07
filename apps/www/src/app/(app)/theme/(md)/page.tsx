import { ButtonsDemo } from '@/components/demos/buttons'
import { Card } from '@/components/ui/card'
import { ExportButton } from '../../../../features/export/export-button'

// why: ADR-0021 commitment 8 — md route owns its audience tabs. The shadcn
// route would pass a different tab set; this composition keeps ExportButton
// route-agnostic.
const MD_EXPORT_TABS = ['Tailwind', 'TS', 'JSON', 'Dart'] as const

export default function MD3Page() {
  return (
    <section className="flex flex-col gap-4">
      <ButtonsDemo />
      <Card variant="default">default</Card>
      <Card variant="lowest">lowest</Card>
      <Card variant="low">low</Card>
      <Card variant="high">high</Card>
      <Card variant="highest">highest</Card>
      <Card variant="dimmed">dimmed</Card>
      <Card variant="bright">bright</Card>
      <ExportButton tabs={MD_EXPORT_TABS} />
    </section>
  )
}
