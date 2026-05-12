import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { ShadcnIcon } from '@/components/icons/shadcn'
import { Button } from '@/components/ui/button'

export function HeroContent() {
  return (
    <div className="flex flex-col items-start justify-center animate-rise">
      <span className="landing-kicker mb-8 animate-rise-small">2026 spec · Open source</span>

      <h1 className="text-[clamp(54px,6vw,104px)] font-semibold leading-[0.92] tracking-[-0.045em] text-on-surface mb-8">
        The MD3 engine.
        <br />
        <span className="inline bg-linear-to-r from-primary via-secondary to-tertiary bg-clip-text text-transparent pb-1">
          With dials.
        </span>
      </h1>

      <p className="text-[17px] text-on-surface-variant leading-normal max-w-[54ch] mb-10 text-pretty tracking-[-0.005em]">
        Real HCT math, not an approximation. Per-role pins layered on top. Contrast audited across
        every token pair the page uses.{' '}
        <strong className="text-on-surface font-medium">
          shadcn tokens emit alongside the MD3 theme — no second pass.
        </strong>
      </p>

      <div className="flex items-center gap-4">
        <Button
          nativeButton={false}
          render={<Link href="/theme" />}
          size="lg"
          className="rounded-xl px-8 h-12 text-base font-semibold shadow-2xl"
        >
          Try tonex
          <ArrowRight className="ml-2 size-5" />
        </Button>
        <Button
          nativeButton={false}
          variant="outline"
          size="lg"
          className="rounded-xl px-8 h-12 text-base font-medium"
          render={<Link href="/theme/shadcn" />}
        >
          shadcn mode
          <ShadcnIcon className="ml-2 size-5" />
        </Button>
      </div>

      <div className="mt-10 flex items-center gap-4 text-xs font-mono text-on-surface/80 flex-wrap">
        <span>No signup</span>
        <div className="size-1 rounded-full bg-outline mt-0.5" />
        <span>MIT licensed</span>
      </div>
    </div>
  )
}
