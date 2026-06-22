import { cn } from 'tailwind-variants'
import { Button } from '@/components/ui/button'
import { focusVisiblePrimaryRing } from '@/components/ui/styles'
import { ContactBuilder } from './contact-builder'
import { CONTACT_ANCHOR_ID } from './scroll-to-contact'

export function SectionBeliefs() {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 border-l border-r border-b border-outline-variant">
      <div className="lg:col-span-4 p-6 md:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-outline-variant min-h-75">
        <div className="text-xs font-mono text-on-surface-variant uppercase">
          THE NATURE OF THE EYE
        </div>
        <div className="my-auto py-6">
          <p className="font-sans text-lg md:text-3xl font-medium leading-tight uppercase text-on-surface">
            AT TONEX STUDIO,{' '}
            <span className="font-display italic font-semibold normal-case text-primary md:text-4xl">
              we
            </span>{' '}
            BELIEVE <span className="font-display italic font-semibold normal-case">in the</span>{' '}
            POWER <span className="font-display italic font-semibold normal-case">of</span> SLOW,
            EDITORIAL DESIGN{' '}
            <span className="font-display italic font-semibold normal-case text-secondary md:text-4xl">
              and
            </span>{' '}
            HANDSET TYPOGRAPHY. WE BRING TOGETHER A TEAM{' '}
            <span className="font-display italic font-semibold normal-case">of</span>—
          </p>
        </div>

        <div className="flex justify-between items-end text-xs font-mono text-on-surface-variant uppercase mt-auto">
          <span>continued overleaf</span>
          <span>P. 02 / 09</span>
        </div>
      </div>
      <div className="lg:col-span-4 p-6 md:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-outline-variant min-h-75">
        <div className="text-xs font-mono text-on-surface-variant uppercase">DIRECT CONNECTION</div>
        <div className="my-auto py-6">
          <h3 className="font-sans text-3xl font-extrabold tracking-tight uppercase text-on-surface mb-3">
            <span className="font-display italic font-medium normal-case text-primary md:text-4xl mr-1">
              every project
            </span>{' '}
            BEGINS WITH AN HONEST{' '}
            <span className="font-display italic font-medium normal-case block mt-1">
              conversation →
            </span>
          </h3>
          <p className="text-base text-on-surface-variant max-w-xs leading-relaxed">
            We take on two briefs per quarter. A 30-minute call is where we decide if the work is
            right for both of us — no pitch decks, no proposals before that.
          </p>
        </div>
        <div className="flex justify-between items-center mt-auto">
          <Button
            variant="unstyled"
            type="button"
            className={cn(
              'text-xs font-mono font-bold transition-all uppercase text-left decoration-solid underline cursor-pointer p-0 h-fit',
              focusVisiblePrimaryRing,
            )}
          >
            book a 30-minute chat
          </Button>
          <span className="text-sm font-mono text-on-surface-variant">MON-THU 10:00–16:00</span>
        </div>
      </div>
      <div id={CONTACT_ANCHOR_ID} className="lg:col-span-4 min-h-110">
        <ContactBuilder />
      </div>
    </section>
  )
}
