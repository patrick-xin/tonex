import { ShimmerBorder } from '@/components/shared/shimmer-border'
import { Crosshair } from './micros'

export function Decorations() {
  return (
    <>
      <Crosshair className="absolute -right-2.25 -top-2.25 group" crossClassName="bg-primary " />
      <Crosshair className="absolute -left-2.25 -bottom-2.25 group" crossClassName="bg-primary " />
      <Crosshair className="absolute -left-2.25 -top-2.25 group" crossClassName="bg-primary " />
      <Crosshair className="absolute -right-2.25 -bottom-2 group" crossClassName="bg-primary " />
      <ShimmerBorder />
      <ShimmerBorder side="left" />
      <ShimmerBorder side="right" />
      <ShimmerBorder side="bottom" />{' '}
    </>
  )
}
