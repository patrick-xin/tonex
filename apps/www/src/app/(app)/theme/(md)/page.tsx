import { Card } from '@/components/ui/card'

export default function MDPage() {
  return (
    <section className="flex flex-col gap-4">
      <Card variant="default">default</Card>
      <Card variant="lowest">lowest</Card>
      <Card variant="low">low</Card>
      <Card variant="high">high</Card>
      <Card variant="highest">highest</Card>
      <Card variant="dimmed">dimmed</Card>
      <Card variant="bright">bright</Card>
    </section>
  )
}
