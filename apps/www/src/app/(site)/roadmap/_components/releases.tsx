import { ShimmerBorder } from '@/components/shared/shimmer-border'
import { Chip } from '@/components/ui/chip'
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
      {releases.map((item) => (
        <TimelineItem glowOnHover={true} key={item.title}>
          <TimelineCard className="border-0 ring-1 ring-primary/10">
            <ShimmerBorder />
            <TimelineHeader>
              <TimelineDate>{item.date}</TimelineDate>
              <TimelineTitle>
                {item.title}
                {item.latest && <Chip variant="outline">Latest</Chip>}
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

const releases = [
  {
    content: [
      'Start from any color — paste a hex or OKLCH value, or pick any Tailwind shade — and get a complete, coherent palette.',
      'Colors a screen can’t show are nudged to the nearest one it can, so what you export always works.',
    ],
    date: 'Jun 2026',
    latest: true,
    title: 'Start from any color',
  },
  {
    content: [
      'Open a hand-crafted preset and make it yours, or start from a considered baseline instead of a blank page.',
      'Lock an exact brand color that holds its place across light, dark, and every preset.',
      'Switch between soft and sharp edges in a single click.',
    ],
    date: 'Jun 2026',
    title: 'Presets & your own brand',
  },
  {
    content: [
      'Add a highlight, a category, or a seasonal accent, and tonex tunes it to sit naturally beside the rest, in both light and dark.',
      'Fine-tune any color by feel — the palette re-balances around your change to stay coherent.',
    ],
    date: 'May 2026',
    title: 'Bring your own colors',
  },
  {
    content: [
      'Every text-and-background pair is checked against WCAG as you work.',
      'Set contrast separately for light and dark when one mode needs a stricter bar.',
    ],
    date: 'May 2026',
    title: 'Readable in both modes',
  },
  {
    content: [
      'Copy your palette out as Tailwind, plain CSS, JSON, or Flutter — ready to drop into a project.',
      'Chart-ready color scales come along automatically.',
    ],
    date: 'May 2026',
    title: 'Export anywhere',
  },
]
