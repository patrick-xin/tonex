import Link from 'next/link'
import { ShimmerBorder } from '@/components/shared/shimmer-border'
import { DesignPalette } from './design-palette'

export function StoryMoment() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 relative">
      <ShimmerBorder side="bottom" />
      <div className="space-y-4 p-6 md:p-14 relative">
        <h3 className="text-2xl font-semibold">The moment</h3>
        <p>
          There's a moment in every project I quietly dread: the logic works, the layout's in place,
          and then it's time to pick the colors. As a frontend dev, I can hand-pick a palette, tune
          every token, check contrast pair by pair. It works. It just eats an afternoon I'd rather
          spend on the product itself.
        </p>
        <p>
          And it's not a trivial afternoon. Color and typography are the first thing anyone sees.
        </p>
        <p>
          <Link
            rel="noreferrer"
            target="_blank"
            className="underline decoration-primary"
            href="https://x.com/juxtopposed"
          >
            @Juxtopposed{' '}
          </Link>
          puts it plainly:{' '}
        </p>
        <blockquote className="text-on-surface-variant italic">
          Colors and fonts are two of the most important parts of web design. We spend a lot of time
          trying to figure them out.
        </blockquote>
      </div>
      <DesignPalette />
    </div>
  )
}
