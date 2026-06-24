import { cx } from 'tailwind-variants'
import { milestones, type Status } from './data'
import {
  HorizontalTimeline,
  HorizontalTimelineItem,
  HorizontalTimelineTitle,
} from './horizontal-timeline'

export function RoadmapTimeline() {
  return (
    <HorizontalTimeline className="mx-auto">
      {milestones.map((item, index) => {
        const position = index % 2 === 0 ? 'bottom' : 'top'
        return (
          <HorizontalTimelineItem key={item.title} position={position}>
            <div className="flex gap-4 items-center mb-2">
              <HorizontalTimelineTitle>{item.title}</HorizontalTimelineTitle>
              <RoadmapBadge status={item.status} />
            </div>
            <p className="max-w-md text-on-surface-variant">{item.description}</p>
          </HorizontalTimelineItem>
        )
      })}
    </HorizontalTimeline>
  )
}

const statusDotClass: Record<Status, string> = {
  Planned: 'bg-tnx-info',
  'In progress': 'bg-tnx-warning',
  Done: 'bg-tnx-success',
  'Coming soon': 'bg-outline',
}

const RoadmapBadge = ({ status }: { status: Status }) => {
  return (
    <div className="px-2 py-1.5 border border-outline-variant inline-flex gap-1 items-center rounded-lg text-xs leading-none text-on-surface-variant">
      <div className={cx('size-2.5 rounded-full', statusDotClass[status])} />
      {status}
    </div>
  )
}
