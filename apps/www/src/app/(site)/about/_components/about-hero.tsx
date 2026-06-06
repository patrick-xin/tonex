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
        <div className="space-y-6 mb-12">
          <h1 className="text-balance text-4xl font-medium sm:text-5xl lg:text-7xl font-display">
            Use your colors with confidence
          </h1>
          <p className="text-base sm:text-[1.2rem]">A color system you can trust.</p>
        </div>
      </div>
      <DottedBackground />
    </section>
  )
}
