import dynamic from 'next/dynamic'
import { DottedBackground } from '../../_landing/dots'

const LandingLogo = dynamic(() => import('../../_landing/landing-logo'))

export function AboutHero() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-20 text-center h-svh isolate relative flex flex-col justify-center items-center">
      <div className="flex justify-center w-40 h-40">
        <LandingLogo />
      </div>
      <div className="mx-auto max-w-6xl px-6 text-center py-12">
        <div className="space-y-6 mb-12 relative">
          <h1 className="text-balance text-4xl font-medium sm:text-5xl lg:text-7xl font-display">
            Use your colors with confidence
          </h1>
          <p className="text-base sm:text-[1.2rem]">A color system you can trust.</p>
          <div
            className="absolute bottom-0 inset-x-0 translate-x-1/2 w-1/2 blur-2xl h-56"
            style={{
              backgroundImage:
                'linear-gradient(135deg, #ff007f33 20%, #0086f032 40%, #6e00ff25 60%, #00f0ff32 80%, #70e00032 40%)',
            }}
          />
        </div>
      </div>
      <DottedBackground />
    </section>
  )
}
