import { EnvelopeIcon, SpinnerIcon, XIcon } from '@phosphor-icons/react/ssr'
import { Button } from '@/components/ui/button'
import { Chip } from '@/components/ui/chip'

export function ButtonsDemo() {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-sm font-semibold tracking-wider uppercase">Buttons</h2>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="brand">Brand</Button>
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="tertiary">Tertiary</Button>
        <Button variant="danger">Danger</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
        <Button variant="fab">Fab</Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button size="icon-sm" variant="secondary">
          <EnvelopeIcon />
        </Button>
        <Button size="icon">
          <EnvelopeIcon />
        </Button>
        <Button size="icon-lg" variant="outline">
          <EnvelopeIcon />
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button isLoading>
          <SpinnerIcon className="animate-spin" />
          Loading
        </Button>
        <Button disabled variant="secondary">
          <EnvelopeIcon />
          Secondary
        </Button>
        <Button aria-invalid>Invalid</Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Chip>Chip</Chip>
        <Chip variant="vibrant">Chip</Chip>
        <Chip>
          <XIcon />
          Chip
        </Chip>
        <Chip variant="outline">Chip</Chip>
      </div>
    </section>
  )
}
