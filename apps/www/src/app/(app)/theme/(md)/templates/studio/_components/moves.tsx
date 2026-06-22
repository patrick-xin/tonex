import { MoveRight } from 'lucide-react'
import { cn } from 'tailwind-variants'
import { cardStyles } from '@/components/ui/card'
import { focusVisiblePrimaryRing } from '@/components/ui/styles'

interface MoveCardProps {
  number: string
  title: string
  description: string
  href: string
  actionText: string
  variant: 'highest' | 'high'
  numberClassName?: string
}

function MoveCard({
  number,
  title,
  description,
  href,
  actionText,
  variant,
  numberClassName,
}: MoveCardProps) {
  return (
    <div className={cardStyles({ variant, className: 'p-6' })}>
      <div className="space-y-4">
        <span
          className={cn(
            'font-mono text-xs tracking-wider block font-semibold text-on-surface-variant',
            numberClassName,
          )}
        >
          {number}
        </span>
        <h3 className="text-2xl md:text-3xl font-bold">{title}</h3>
        <p className="text-sm leading-relaxed pt-2 text-on-surface-variant">{description}</p>
      </div>

      <div className="mt-auto pt-4 border-t border-outline-variant/40 flex items-center justify-between">
        <a
          href={href}
          className={cn(
            'font-mono text-xs tracking-wider hover:underline inline-flex items-center gap-2 text-primary font-bold uppercase',
            focusVisiblePrimaryRing,
          )}
        >
          {actionText} <MoveRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  )
}

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
        <MoveCard
          number="01 — IDENTITY"
          title="Marks and systems that survive translation to material."
          description="We design identity as if it will be stamped onto metal before it appears on a screen. Type specimens, color tokens, photography rules — delivered as one documented system your team can extend without us."
          href="#capabilities-section"
          actionText="VIEW IDENTITY WORK"
          variant="highest"
        />

        <div className="border border-outline-variant bg-surface-container-low rounded-2xl flex flex-col overflow-hidden justify-between p-6">
          <div className="flex justify-between items-center pb-2 mb-2">
            {' '}
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

        <MoveCard
          number="02 — INTERFACE"
          title="Screens that behave like well-designed objects."
          description="We build configurators, dashboards, and internal tools for companies with complex workflows. Dense information, clear hierarchy, no decorative noise — the interface gets out of the way of the work."
          href="#pitch-section"
          actionText="Build with us"
          variant="highest"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <MoveCard
          number="03 — EDITORIAL"
          title="Documentation and content architecture, not content marketing."
          description="Technical documentation, product sites, and brand narratives — structured, typed, and built inside the same token system as your product. One voice, readable on a spec sheet or a landing page."
          href="#capabilities-section"
          actionText="READ THE JOURNAL"
          variant="high"
          numberClassName="font-bold text-tertiary"
        />

        <MoveCard
          number="04 — STUDIO"
          title="Six people. No growth plans."
          description="Every engagement is led by a principal and paired with one engineer. We don't hand off to a delivery team. The people you meet at the brief are the people who ship the work."
          href="#run-section"
          actionText="MEET THE TEAM"
          variant="highest"
          numberClassName="font-semibold text-secondary"
        />

        <MoveCard
          number="05 — TOOLS"
          title="Published token sets, typed components, zero lock-in."
          description="Every system we deliver includes a versioned token file, a typed component library in your stack, and a README your engineers can maintain without us. We leave, the system stays legible."
          href="#capabilities-section"
          actionText="SEE A SAMPLE SYSTEM"
          variant="high"
          numberClassName="font-semibold text-on-surface-variant"
        />
      </div>
    </section>
  )
}
