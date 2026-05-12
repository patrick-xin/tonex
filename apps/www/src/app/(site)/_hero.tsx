import { HeroContent } from './_hero-content'
import { HeroVisual } from './_hero-visual'

export function Hero() {
  return (
    <section className="relative flex min-h-[calc(100dvh-3.5rem)] flex-col overflow-hidden px-4 md:px-12 lg:px-16">
      <div className="flex flex-1 min-h-0 items-center">
        <div className="grid w-full h-full grid-cols-1 gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16 items-center lg:items-stretch">
          <HeroContent />
          <HeroVisual />
        </div>
      </div>
      <div className="absolute inset-0 z-0 top-16 flex items-center justify-center pointer-events-none">
        <div
          className="w-[120%] h-[120%] opacity-[0.05] rotate-12"
          style={{
            backgroundImage:
              'linear-gradient(var(--color-outline-variant) 1px, transparent 1px), linear-gradient(90deg, var(--color-outline-variant) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>
    </section>
  )
}
