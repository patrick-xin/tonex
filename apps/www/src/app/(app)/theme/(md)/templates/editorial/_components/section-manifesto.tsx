import BriefChecklist from './brief-checklist'
import { ScrollToContactButton } from './scroll-to-contact'

export default function SectionManifesto() {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 border-l border-r border-b border-outline-variant">
      <div className="lg:col-span-4 aspect-4/3 lg:aspect-auto overflow-hidden bg-surface-container border-b lg:border-b-0 lg:border-r border-outline-variant relative">
        <img
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800&auto=format&fit=crop"
          alt="Monolithic architectural workspace of Tonex Studio"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover grayscale contrast-120"
        />
        <div className="absolute bottom-4 left-4 bg-surface-container-lowest/80 backdrop-blur-sm p-3 border border-outline-variant rounded-sm text-[9px] font-mono text-on-surface uppercase">
          <div>STUDIO ENVIRONMENT</div>
          <div className="text-primary mt-0.5 font-bold">OFF RUA DOS ANJOS</div>
        </div>
      </div>
      <div className="lg:col-span-4 p-6 md:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-outline-variant min-h-75 bg-surface-container-high">
        <div className="text-sm font-mono text-on-surface-variant uppercase">STUDIO COGNITION</div>

        <div className="my-auto py-6">
          <p className="font-sans text-xl md:text-2xl font-bold leading-snug uppercase text-on-surface">
            <span className="font-display italic font-medium normal-case text-primary block mb-1 md:text-4xl">
              we believe
            </span>{' '}
            WORK SHOULD CARRY{' '}
            <span className="font-display italic font-medium normal-case text-primary">the</span>{' '}
            WEIGHT <span className="font-display italic font-medium normal-case">of</span> ITS MAKER
            —{' '}
            <span className="block text-on-surface-variant font-display italic font-medium normal-case my-2 text-lg md:text-xl">
              never the fingerprint of a template.
            </span>
          </p>
        </div>

        <div className="flex justify-between items-end border-t border-outline-variant pt-4">
          <span className="text-sm font-mono text-on-surface-variant uppercase">
            — manifesto, line iv
          </span>
          <button
            type="button"
            className="text-xs font-mono font-bold text-primary hover:text-on-surface transition-colors cursor-pointer"
          >
            READ ALL 12 LINES
          </button>
        </div>
      </div>
      <div className="lg:col-span-4 p-6 md:p-8 flex flex-col justify-between min-h-75">
        <div>
          <div className="text-sm font-mono text-on-surface-variant uppercase mb-4">
            SYSTEM CONSTANTS
          </div>
          <h4 className="font-sans text-xl font-bold uppercase text-on-surface mb-6 leading-tight">
            four THINGS WE BRING{' '}
            <span className="font-display italic font-semibold normal-case text-primary text-lg block my-1">
              to every brief
            </span>
          </h4>
          <BriefChecklist />
        </div>

        <div className="flex justify-between items-center border-t border-outline-variant pt-4 mt-8">
          <ScrollToContactButton className="text-xs font-mono font-bold text-primary hover:text-on-surface transition-colors cursor-pointer uppercase decoration-solid underline">
            See full process →
          </ScrollToContactButton>
          <span className="text-sm font-mono text-on-surface-variant uppercase">
            VII / X MATRIX
          </span>
        </div>
      </div>
    </section>
  )
}
