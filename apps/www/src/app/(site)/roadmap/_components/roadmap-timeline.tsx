import {
  HorizontalTimeline,
  HorizontalTimelineDate,
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
            <HorizontalTimelineTitle>{item.title}</HorizontalTimelineTitle>
            <HorizontalTimelineDate>{item.date}</HorizontalTimelineDate>
          </HorizontalTimelineItem>
        )
      })}
    </HorizontalTimeline>
  )
}

const milestones = [
  {
    title: 'Seed → full theme',
    date: 'Available',
  },
  {
    title: 'Presets & your brand',
    date: 'Available',
  },
  {
    title: 'Export anywhere',
    date: 'Available',
  },
  {
    title: 'Component registry',
    date: 'Next',
  },
  {
    title: 'Theme sharing',
    date: 'Next',
  },
  {
    title: 'CLI & SDK',
    date: 'Exploring',
  },
  {
    title: 'Editor color themes',
    date: 'Exploring',
  },
]
