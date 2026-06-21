import { MoveRight } from 'lucide-react'
import { cn } from 'tailwind-variants'
import { cardStyles } from '@/components/ui/card'
import { focusVisiblePrimaryRing } from '@/components/ui/styles'

export function Moves() {
  return (
    <section id="moves-section" className="space-y-10 border-t border-outline-variant pt-14">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:items-end">
        <div>
          <h2 className="text-4xl md:text-5xl font-display font-black tracking-tight leading-tight">
            Three surfaces,{' '}
            <span className="text-tertiary py-0.5 rounded-xl font-sans uppercase">one</span> system.
          </h2>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className={cardStyles({ variant: 'highest', className: 'p-6' })}>
          <div className="space-y-4">
            <span className="font-mono text-xs tracking-wider font-semibold text-on-surface-variant block">
              01 — IDENTITY
            </span>
            <h3 className="text-2xl md:text-3xl font-display font-bold">
              Marks and systems that survive translation to material.
            </h3>
            <p className="text-sm text-on-surface-variant pt-2">
              We design identity as if it will be stamped onto metal before it appears on a screen.
              Type specimens, color tokens, photography rules — delivered as one documented system
              your team can extend without us.
            </p>
          </div>

          <div className="mt-8 pt-4 border-t border-outline-variant flex items-center justify-between">
            <a
              href="#capabilities-section"
              className={cn(
                'font-mono text-xs tracking-wider hover:underline inline-flex items-center gap-2 text-primary font-bold',
                focusVisiblePrimaryRing,
              )}
            >
              VIEW IDENTITY WORK <MoveRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        <div className="border border-outline-variant bg-surface-container-low rounded-2xl flex flex-col overflow-hidden justify-between p-6">
          <div className="flex justify-between items-center pb-2 mb-2">
            <span className="font-mono text-xs text-on-surface-variant font-semibold">
              PLATE — 02
            </span>
            <span className="font-mono text-xs text-on-surface-variant/80">STUDIO MONITOR</span>
          </div>

          <div className="relative flex-1 min-h-[180px] rounded-lg overflow-hidden my-3 border border-outline-variant/60">
            <img
              src="https://images.unsplash.com/photo-1632813985160-b0c2c88d1bc2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHN0dWRpbyUyMG9mZmljZXxlbnwwfDB8MHx8fDA%3D"
              alt="Minimalist computer display workspace design"
              className="size-full object-fill grayscale"
            />
          </div>
          <div className="pt-2 flex justify-between items-center text-on-surface-variant text-xs font-mono">
            <span>REPRESENTATIVE GRIDS</span>
            <span>SYSTEM RENDER</span>
          </div>
        </div>
        <div className={cardStyles({ variant: 'highest', className: 'p-6' })}>
          <div className="space-y-4">
            <span className="font-mono text-xs tracking-wider font-semibold block text-on-surface-variant">
              02 — INTERFACE
            </span>
            <h3 className="text-2xl md:text-3xl font-display font-black leading-snug">
              Screens that behave like well-designed objects.
            </h3>
            <p className="text-sm leading-relaxed pt-2">
              We build configurators, dashboards, and internal tools for companies with complex
              workflows. Dense information, clear hierarchy, no decorative noise — the interface
              gets out of the way of the work.
            </p>
          </div>

          <div className="mt-auto pt-4 border-t border-outline-variant flex items-center justify-between">
            <a
              href="#pitch-section"
              className={cn(
                'font-mono text-xs tracking-wider hover:underline inline-flex items-center gap-2 text-primary font-bold',
                focusVisiblePrimaryRing,
              )}
            >
              Build with us <MoveRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={cardStyles({ variant: 'high', className: 'p-6' })}>
          <div className="space-y-3">
            <span className="font-mono text-xs font-bold block text-tertiary">03 — EDITORIAL</span>
            <h4 className="text-xl font-display font-black">
              Documentation and content architecture, not content marketing.
            </h4>
            <p className="text-sm leading-relaxed">
              Technical documentation, product sites, and brand narratives — structured, typed, and
              built inside the same token system as your product. One voice, readable on a spec
              sheet or a landing page.
            </p>
          </div>
          <div className="pt-6 mt-4 border-t border-outline-variant">
            <a
              href="#capabilities-section"
              className={cn(
                'font-mono text-xs tracking-wider hover:underline inline-flex items-center gap-2 text-primary font-bold',
                focusVisiblePrimaryRing,
              )}
            >
              READ THE JOURNAL <MoveRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        <div className={cardStyles({ className: 'p-6', variant: 'high' })}>
          <div className="space-y-3">
            <span className="font-mono text-xs font-semibold text-secondary block">
              04 — STUDIO
            </span>
            <h4 className="text-xl font-display font-medium text-on-surface">
              Six people. No growth plans.
            </h4>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Every engagement is led by a principal and paired with one engineer. We don't hand off
              to a delivery team. The people you meet at the brief are the people who ship the work.
            </p>
          </div>
          <div className="pt-6 border-t border-outline-variant mt-auto">
            <a
              href="#run-section"
              className={cn(
                'font-mono text-xs tracking-wider hover:underline inline-flex items-center gap-2 text-primary font-bold',
                focusVisiblePrimaryRing,
              )}
            >
              MEET THE TEAM <MoveRight className="w-3.5 h-3.5 text-on-surface-variant" />
            </a>
          </div>
        </div>
        <div className={cardStyles({ variant: 'high', className: 'p-6' })}>
          <div className="space-y-3">
            <span className="font-mono text-xs font-semibold text-on-surface-variant block">
              05 — TOOLS
            </span>
            <h4 className="text-xl font-display font-medium text-on-surface">
              Published token sets, typed components, zero lock-in.
            </h4>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Every system we deliver includes a versioned token file, a typed component library in
              your stack, and a README your engineers can maintain without us. We leave, the system
              stays legible.
            </p>
          </div>
          <div className="pt-6 border-t border-outline-variant mt-auto">
            <a
              href="#capabilities-section"
              className={cn(
                'font-mono text-xs tracking-wider hover:underline inline-flex items-center gap-2 text-primary font-bold',
                focusVisiblePrimaryRing,
              )}
            >
              SEE A SAMPLE SYSTEM <MoveRight className="w-3.5 h-3.5 text-on-surface-variant" />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
