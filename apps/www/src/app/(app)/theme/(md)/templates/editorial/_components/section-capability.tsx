import CapabilitySlider from './capability-slider'
import { ScrollToContactButton } from './scroll-to-contact'

export function SectionCapability() {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 border-l border-r border-b border-outline-variant">
      <div className="lg:col-span-4 p-6 md:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-outline-variant min-h-75">
        <div className="text-sm font-mono text-on-surface-variant uppercase">NEXT BLOCK INTAKE</div>
        <div className="my-auto py-6">
          <h2 className="font-sans text-4xl md:text-5xl font-extrabold tracking-tighter uppercase text-on-surface leading-tight">
            let's{' '}
            <span className="font-display italic font-medium normal-case text-primary block my-1">
              create something
            </span>{' '}
            awesome
          </h2>
        </div>
        <div className="flex justify-between items-center border-t border-outline-variant pt-4">
          <span className="text-sm font-mono text-on-surface-variant">— next intake July 2026</span>
          <ScrollToContactButton className="px-4 py-1.5 bg-primary text-on-primary font-mono text-xs tracking-wider rounded-sm font-bold uppercase">
            START BRIEF
          </ScrollToContactButton>
        </div>
      </div>
      <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-outline-variant min-h-[380px]">
        <CapabilitySlider />
      </div>
      <div className="lg:col-span-4 p-6 md:p-8 flex flex-col justify-between min-h-75">
        <div className="text-sm font-mono text-on-surface-variant uppercase">FINE ART INDEX</div>
        <div className="flex items-center justify-center my-auto py-4">
          <span className="font-display italic font-medium text-7xl md:text-8xl text-on-surface-variant select-none mr-3 inline-block">
            4
          </span>
          <div className="w-32 aspect-3/4 overflow-hidden rounded-sm bg-surface-container-high border border-outline-variant mx-4 shadow-md">
            <img
              src="https://images.unsplash.com/photo-1580136579312-94651dfd596d?q=80&w=600&auto=format&fit=crop"
              alt="Fine art classical renaissance oil painting representation"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover grayscale contrast-110"
            />
          </div>
          <span className="font-display italic font-medium text-7xl md:text-8xl text-on-surface-variant select-none">
            4
          </span>
        </div>

        <div className="flex justify-between items-end text-xs font-mono text-on-surface-variant uppercase border-t border-outline-variant pt-4">
          <span>FORTY FOUR monographs</span>
          <span>LA / NYC</span>
        </div>
      </div>
    </section>
  )
}
