import dynamic from 'next/dynamic'
import { DottedBackground } from '../../landing/dots'

const LandingLogo = dynamic(() => import('../../landing/landing-logo'))

export function RoadmapHero() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-20 text-center h-svh isolate relative flex flex-col justify-center items-center">
      <div className="flex justify-center w-40 h-40">
        <LandingLogo />
      </div>
      <div className="mx-auto max-w-6xl px-6 text-center py-12 relative">
        <div className="space-y-6 mb-12">
          <h1 className="text-balance text-4xl font-medium sm:text-5xl lg:text-7xl font-display">
            Roadmap
          </h1>
          <p className="text-base sm:text-[1.2rem] max-w-md mx-auto text-pretty">
            A clear path forward, outlining what’s next, what’s evolving, and where Tonex is headed.
          </p>
        </div>
        <div
          className="absolute bottom-0 inset-x-0 w-full blur-2xl h-56 -translate-y-12"
          style={{
            backgroundImage:
              'linear-gradient(135deg, #ef5f0033 20%, #c2007a28 40%, #53009e25 60%, #0086f032 80%)',
          }}
        />
      </div>
      <DottedBackground />
    </section>
  )
}
