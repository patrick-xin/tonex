import { MoveRight } from 'lucide-react'
import { buttonStyles } from '@/components/ui/button'
import { cardStyles } from '@/components/ui/card'

export function Stats() {
  return (
    <section id="stats-section" className="grid grid-cols-1 md:grid-cols-12 gap-6">
      <div className={`${cardStyles()} md:col-span-5 aspect-square md:aspect-auto md:min-h-55 p-6`}>
        <div className="flex justify-between items-start">
          <span className="font-mono text-xs tracking-wider font-semibold">SINCE 2019</span>
          <span className="font-mono text-xs">COMPONENTS SHIPPED</span>
        </div>

        <div className="my-3">
          <span className="text-7xl font-display font-black tracking-tighter leading-none block">
            920+
          </span>
        </div>
        <p className="font-medium text-lg">
          Interface, system, and tooling — owned by the same six-person room, with no account
          managers in the chain.
        </p>
        <p className="font-mono text-xs leading-snug font-semibold mt-auto text-on-surface-variant ml-auto">
          TYPED COMPONENTS ACROSS ALL ACTIVE CLIENT SYSTEMS.
        </p>
      </div>
      <div className={`${cardStyles()} md:col-span-7 md:min-h-55 p-6`}>
        <div className="flex justify-between items-start border-b border-surface/10 pb-3">
          <span className="font-mono text-xs tracking-wider uppercase font-semibold">
            ONE SLOT OPEN · Q3 2026
          </span>
          <span className="w-2.5 h-2.5 rounded-full bg-primary" />
        </div>
        <div className="my-6">
          <span className="text-6xl font-display font-black tracking-tighter leading-none block">
            One engagement available. We don't take more than we can run well.
          </span>
        </div>
        <div className="flex justify-between items-end">
          <a href="#pitch-section" className={buttonStyles({ variant: 'secondary', size: 'sm' })}>
            Pitch your project <MoveRight className="w-3.5 h-3.5 ml-1.5 inline-block" />
          </a>
          <span className="font-mono text-xs text-on-surface-variant">
            AVG WORKFLOW START: 14 DAYS
          </span>
        </div>
      </div>
    </section>
  )
}
