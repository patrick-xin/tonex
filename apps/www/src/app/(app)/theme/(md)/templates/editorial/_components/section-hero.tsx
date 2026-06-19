export default function SectionHero() {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 border border-outline-variant">
      <div className="lg:col-span-4 p-6 md:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-outline-variant min-h-75 lg:min-h-110">
        <div className="flex justify-between items-start text-xs font-mono text-on-surface-variant uppercase">
          <span>tonex°</span>
          <span>LA</span>
        </div>
        <div className="my-auto py-8">
          <h1 className="font-sans text-8xl md:text-9xl font-bold tracking-tighter text-on-surface leading-none select-none lowercase">
            tonex<span className="font-light text-primary">°</span>
          </h1>
        </div>

        <div className="flex justify-between items-end text-sm font-mono text-on-surface-variant uppercase">
          <span>Print · Identity · Digital</span>
          <span>EST. 2014 • LA</span>
        </div>
      </div>
      <div className="lg:col-span-4 p-6 md:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-outline-variant min-h-75">
        <div className="flex justify-between items-start text-xs font-mono text-on-surface-variant uppercase">
          <span>MANIFEST 1</span>
          <span className="italic normal-case text-primary font-medium">Index 01</span>
        </div>
        <div className="grid grid-cols-2 gap-3 my-6">
          <div className="aspect-3/4 overflow-hidden rounded-sm bg-surface-container border border-outline-variant">
            <img
              src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop"
              alt="Moody warm editorial portrait"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover grayscale contrast-110"
            />
          </div>
          <div className="aspect-3/4 overflow-hidden rounded-sm bg-surface-container border border-outline-variant">
            <img
              src="https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=600&auto=format&fit=crop"
              alt="Minimalist sand dunes silhouette scene"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover grayscale contrast-115"
            />
          </div>
        </div>

        <div className="flex justify-between items-end text-xs font-mono text-on-surface-variant uppercase">
          <span>PORTFOLIO ENTRY 1L</span>
          <span>ARTE CONCEPT</span>
        </div>
      </div>

      <div className="lg:col-span-4 p-6 md:p-8 flex flex-col justify-between min-h-75">
        <div className="flex justify-between items-start text-xs font-mono text-on-surface-variant uppercase">
          <span>AESTHETIC ROOT</span>
          <span>NO. 14</span>
        </div>

        <div className="my-auto py-6">
          <h2 className="font-sans text-3xl md:text-4xl font-bold tracking-tight text-on-surface uppercase leading-snug">
            THE{' '}
            <span className="font-display italic font-medium normal-case text-primary md:text-5xl">
              slowest
            </span>{' '}
            THINGS{' '}
            <span className="font-display italic font-medium normal-case md:text-5xl">are</span>{' '}
            ALWAYS THE ONES WORTH{' '}
            <span className="font-display italic font-medium normal-case text-primary md:text-5xl">
              keeping
            </span>
          </h2>
        </div>

        <div className="flex justify-between items-end border-t border-outline-variant pt-4">
          <span className="text-sm font-mono text-on-surface-variant uppercase">
            • a note from the studio, no. 14
          </span>
          <button
            type="button"
            className="text-xs font-mono font-bold tracking-widest text-primary hover:text-on-surface transition-colors cursor-pointer"
          >
            READ
          </button>
        </div>
      </div>
    </section>
  )
}
