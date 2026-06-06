import { ShimmerBorder } from '@/components/shared/shimmer-border'
import { Crosshair } from './micros'

export function Decoration() {
  return (
    <>
      <Crosshair
        className="absolute -right-2.25 -top-2.25 group"
        crossClassName="group-hover:bg-primary "
      />
      <Crosshair
        className="absolute -left-2.25 -bottom-2.25 group"
        crossClassName="group-hover:bg-primary "
      />
      <Crosshair
        className="absolute -left-2.25 -top-2.25 group"
        crossClassName="group-hover:bg-primary "
      />
      <Crosshair
        className="absolute -right-2.25 -bottom-2 group"
        crossClassName="group-hover:bg-primary "
      />
      <ShimmerBorder />
      <ShimmerBorder side="left" />
      <ShimmerBorder side="right" />
      <ShimmerBorder side="bottom" />{' '}
    </>
  )
}
