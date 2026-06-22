import { cn } from 'tailwind-variants'
import { focusVisiblePrimaryRing } from '@/components/ui/styles'
import { HONORS } from '../data'

export function SectionStrategy() {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 border-l border-r border-b border-outline-variant">
      <div className="lg:col-span-4 p-6 md:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-outline-variant min-h-75">
        <div>
          <div className="text-sm font-mono text-on-surface-variant uppercase mb-4">
            COLLABORATIVE MODES
          </div>
          <h4 className="font-sans text-xl font-bold uppercase text-on-surface mb-6 leading-tight">
            FIVE WAYS{' '}
            <span className="font-display italic font-semibold normal-case text-primary text-2xl block my-1">
              we can work together this
            </span>{' '}
            SEASON
          </h4>
          <div className="space-y-3.5 text-xs">
            <div className="flex justify-between items-baseline border-b border-outline-variant/40 pb-1.5">
              <span className="font-mono text-sm text-primary">01</span>
              <span className="font-semibold uppercase text-on-surface">
                BRAND & IDENTITY SYSTEMS
              </span>
              <span className="font-mono text-on-surface-variant text-sm">6 wk</span>
            </div>
            <div className="flex justify-between items-baseline border-b border-outline-variant/40 pb-1.5">
              <span className="font-mono text-sm text-primary">02</span>
              <span className="font-semibold uppercase text-on-surface">
                EDITORIAL & PRINT BOOKS
              </span>
              <span className="font-mono text-on-surface-variant text-sm">8 wk</span>
            </div>
            <div className="flex justify-between items-baseline border-b border-outline-variant/40 pb-1.5">
              <span className="font-mono text-sm text-primary">03</span>
              <span className="font-semibold uppercase text-on-surface">WEBSITES & MICROSITES</span>
              <span className="font-mono text-on-surface-variant text-sm">10 wk</span>
            </div>
            <div className="flex justify-between items-baseline border-b border-outline-variant/40 pb-1.5">
              <span className="font-mono text-sm text-primary">04</span>
              <span className="font-semibold uppercase text-on-surface">CUSTOM & DISPLAY TYPE</span>
              <span className="font-mono text-on-surface-variant text-sm">12 wk</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="font-mono text-sm text-primary">05</span>
              <span className="font-semibold uppercase text-on-surface">
                ART DIRECTION & IMAGES
              </span>
              <span className="font-mono text-on-surface-variant text-sm">4 wk</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center border-t border-outline-variant pt-4 mt-8">
          <span className="text-sm font-mono text-on-surface-variant uppercase">
            2 briefs per quarter
          </span>
          <button
            type="button"
            className={cn(
              'text-xs font-mono font-bold text-primary hover:text-on-surface transition-colors cursor-pointer uppercase underline',
              focusVisiblePrimaryRing,
            )}
          >
            DOWNLOAD MENU
          </button>
        </div>
      </div>
      <div className="lg:col-span-4 p-6 md:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-outline-variant min-h-75">
        <div className="text-sm font-mono text-on-surface-variant uppercase">
          HISTORICAL FOOTPRINT
        </div>

        <div className="my-auto py-6">
          <div className="font-display italic text-6xl md:text-7xl font-bold text-secondary leading-none select-none mb-2">
            '14
          </div>
          <h4 className="font-sans text-xl font-bold uppercase text-on-surface mb-3 leading-tight">
            TWELVE{' '}
            <span className="font-display italic font-semibold normal-case text-primary text-lg md:text-3xl mr-1">
              quiet
            </span>{' '}
            YEARS{' '}
            <span className="font-display italic font-semibold normal-case text-primary text-lg md:text-3xl mr-1">
              of
            </span>{' '}
            CRAFT
          </h4>
          <p className="text-on-surface-variant leading-relaxed max-w-xs">
            A small studio in LA, opened the autumn after the Bienal. Eight people, two rooms, one
            shared physical monograph archive.
          </p>
        </div>

        <div className="flex justify-between items-end border-t border-outline-variant pt-4">
          <span className="text-sm font-mono text-on-surface-variant uppercase">
            — note from structural lead
          </span>
          <button
            type="button"
            className={cn(
              'text-xs font-mono font-bold text-primary hover:text-on-surface transition-colors cursor-pointer',
              focusVisiblePrimaryRing,
            )}
          >
            READ
          </button>
        </div>
      </div>

      <div className="lg:col-span-4 p-6 md:p-8 flex flex-col justify-between min-h-75">
        <div>
          <div className="text-sm font-mono text-on-surface-variant uppercase mb-4">
            FIELD RECOGNITION
          </div>
          <h4 className="font-sans text-xl font-bold uppercase text-on-surface mb-6 leading-tight">
            SHELF{' '}
            <span className="font-display italic font-semibold normal-case text-primary text-lg">
              of
            </span>{' '}
            SMALL HONOURS
          </h4>
          <div className="space-y-4">
            {HONORS.map((hon) => (
              <div key={hon.id} className="flex justify-between items-baseline text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span className="font-semibold text-on-surface uppercase">{hon.award}</span>
                  <span className="text-sm text-on-surface-variant uppercase">
                    / {hon.category}
                  </span>
                </div>
                <span className="font-mono text-on-surface-variant font-medium text-sm">
                  '{hon.year}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-end border-t border-outline-variant pt-4 mt-8 text-xs font-mono text-on-surface-variant uppercase">
          <span>— selected history</span>
          <span>ALL PRESS</span>
        </div>
      </div>
    </section>
  )
}
