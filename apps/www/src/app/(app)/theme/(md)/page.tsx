import { Card } from '@/components/ui/card'

export default function MDPage() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      <Card variant="default" className="px-4">
        default
      </Card>
      <Card variant="lowest" className="px-4">
        lowest
      </Card>
      <Card variant="low" className="px-4">
        low
      </Card>
      <Card variant="high" className="px-4">
        high
      </Card>
      <Card variant="highest" className="px-4">
        highest
      </Card>
      <Card variant="dimmed" className="px-4">
        dimmed
      </Card>
      <Card variant="bright" className="px-4">
        bright
      </Card>
    </div>
  )
}
