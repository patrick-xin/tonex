import { ShimmerBorder } from '@/components/shared/shimmer-border'
import { Chip } from '@/components/ui/chip'
import { changelogs } from './data'
import {
  Timeline,
  TimelineCard,
  TimelineDate,
  TimelineHeader,
  TimelineItem,
  TimelineTitle,
} from './timeline'

export function Releases() {
  return (
    <Timeline>
      {changelogs.map((item) => (
        <TimelineItem glowOnHover={true} key={item.title}>
          <TimelineCard className="border-0 ring-1 ring-primary/10">
            <ShimmerBorder />
            <TimelineHeader>
              <TimelineDate>{item.date}</TimelineDate>
              <TimelineTitle>
                {item.title}
                {item.latest && (
                  <Chip variant="outline" size="sm">
                    Latest
                  </Chip>
                )}
              </TimelineTitle>
            </TimelineHeader>
            <ul className="list-disc pl-4 space-y-2 text-left">
              {item.content.map((content, index) => (
                <li className="text-base text-on-surface-variant" key={String(index)}>
                  {content}
                </li>
              ))}
            </ul>
          </TimelineCard>
        </TimelineItem>
      ))}
    </Timeline>
  )
}
