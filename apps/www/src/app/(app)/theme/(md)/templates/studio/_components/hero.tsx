import { ArrowUpRight } from 'lucide-react'
import { buttonStyles } from '@/components/ui/button'

export function Hero() {
  return (
    <section
      id="hero-section"
      className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-14 items-stretch pt-8"
    >
      <div className="lg:col-span-7 flex flex-col space-y-8 pr-1">
        <div className="space-y-6">
          <span className="bg-tertiary-container text-on-tertiary-container text-xs p-1 rounded-md inline-block mb-4">
            CASE / 019 / 26
          </span>
          <h1
            id="hero-heading"
            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-none text-on-surface font-display"
          >
            Interfaces for companies that{' '}
            <span className="bg-primary-container text-on-primary-container px-3 py-1 rounded-md inline-block transform rotate-1">
              make
            </span>
            physical things.
          </h1>

          <p className="text-lg md:text-xl text-on-surface-variant leading-relaxed font-sans max-w-2xl">
            Fieldset is a product design studio in Berlin. We build screens, systems, and tools for
            manufacturers, architects, and craft-led companies — software that behaves like a
            well-made object.
          </p>
        </div>

        {/* Actions panel */}
        <div className="inline-flex flex-wrap gap-4 pt-4">
          <a href="#moves-section" className={buttonStyles({ variant: 'brand', size: 'lg' })}>
            See the work <ArrowUpRight className="w-4 h-4 ml-1 inline-block" />
          </a>

          <a href="#pitch-section" className={buttonStyles({ variant: 'outline', size: 'lg' })}>
            Book a call
          </a>
        </div>
      </div>
      <div className="lg:col-span-5 flex flex-col justify-between border border-outline-variant rounded-2xl p-6 bg-surface-container-low min-h-[450px] md:min-h-[580px]">
        <div className="flex items-center justify-between border-b border-outline-variant pb-4 mb-4">
          <span className="font-mono text-xs font-semibold tracking-wider text-on-surface-variant">
            FILE / 07 STUDIO KIT
          </span>
          <span className="font-mono text-xs text-on-surface-variant/80">Q3 RELEASE</span>
        </div>
        <div className="relative flex-1 rounded-sm overflow-hidden group border border-outline-variant/60">
          <img
            src="/studio.jpeg"
            alt="Chic Studio Monochrome Portrait"
            className="w-full h-full object-cover grayscale contrast-125 saturate-0 group-hover:scale-102 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-linear-to-t from-scrim/20 via-transparent to-transparent pointer-events-none" />
        </div>
        <div className="mt-4 pt-4 border-t border-outline-variant flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-tertiary">
            <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
            IN RESIDENCE
          </span>
          <span className="font-mono text-xs text-on-surface-variant">BERLIN & REMOTE</span>
        </div>
      </div>
    </section>
  )
}
