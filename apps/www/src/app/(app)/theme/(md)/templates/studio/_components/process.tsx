import { Button } from '@/components/ui/button'

export function Process() {
  return (
    <section id="run-section" className="border-t border-outline-variant pt-14 space-y-10">
      <div className="space-y-2">
        <span className="text-xs p-1 text-on-tertiary-container bg-tertiary-container rounded-md mb-4 inline-block">
          DELIVERY ROADMAP
        </span>
        <div className="flex justify-between items-center">
          <h2 className="text-3xl md:text-5xl font-display font-black tracking-tight">
            How a project runs here.
          </h2>
          <span className="font-mono text-xs text-on-surface-variant font-medium">PLATE · 86</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch font-sans">
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-surface-container-low border border-outline-variant/60 rounded-xl p-6 transition-all hover:bg-surface-container hover:border-outline flex items-start gap-4">
            <span className="font-mono text-xs font-bold text-on-surface bg-surface-container-highest px-2.5 py-1 rounded-sm">
              01
            </span>
            <div className="space-y-2 w-full">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-display font-bold text-on-surface">Brief & intake</h3>
                <span className="font-mono text-xs text-on-surface-variant font-bold">WEEK 0</span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                One 60-minute call, a written scope, and a fixed price before any contract exists.
                If we're not the right studio for the project, we say so in that call.
              </p>
            </div>
          </div>
          <div className="bg-surface-container-low border border-outline-variant/60 rounded-xl p-6 transition-all hover:bg-surface-container hover:border-outline flex items-start gap-4">
            <span className="font-mono text-xs font-bold text-on-surface bg-surface-container-highest px-2.5 py-1 rounded-sm">
              02
            </span>
            <div className="space-y-2 w-full">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-display font-bold text-on-surface">
                  Reference & direction
                </h3>
                <span className="font-mono text-xs text-on-surface-variant font-bold">
                  WK 1 - 2
                </span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                A single direction, not two. We do the research, form a point of view, and present
                it with reasoning. Feedback rounds from there — no false optionality.
              </p>
            </div>
          </div>
          <div className="bg-surface-container-low border border-outline-variant/60 rounded-xl p-6 transition-all hover:bg-surface-container hover:border-outline flex items-start gap-4">
            <span className="font-mono text-xs font-bold text-on-surface bg-surface-container-highest px-2.5 py-1 rounded-sm">
              03
            </span>
            <div className="space-y-2 w-full">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-display font-bold text-on-surface">System build</h3>
                <span className="font-mono text-xs text-on-surface-variant font-bold">
                  WK 3 - 6
                </span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Token configuration, typed component library, content schema. Built in a shared repo
                from day one — your engineers can read the diff of every decision we make.
              </p>
            </div>
          </div>
          <div className="bg-surface-container-low border border-outline-variant/60 rounded-xl p-6 transition-all hover:bg-surface-container hover:border-outline flex items-start gap-4">
            <span className="font-mono text-xs font-bold text-on-surface bg-surface-container-highest px-2.5 py-1 rounded-sm">
              04
            </span>
            <div className="space-y-2 w-full">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-display font-bold text-on-surface">Launch & care</h3>
                <span className="font-mono text-xs text-on-surface-variant font-bold">
                  WK 7 - 9
                </span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Production deployment, a recorded walkthrough of every system decision, and 30 days
                of async support. After that, you own the keys and the codebase.
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 border border-transparent rounded-2xl flex flex-col justify-between p-6 md:p-8 bg-tertiary text-on-tertiary shadow-lg">
          <div className="flex justify-between items-center pb-4 mb-4 border-b border-on-tertiary/10">
            <span className="text-xs p-1 text-on-tertiary-container bg-tertiary-container rounded-md inline-block">
              HOW WE WORK
            </span>
            <span className="font-mono text-xs text-on-tertiary">STUDIO POSITION</span>
          </div>
          <div className="my-6 space-y-4">
            <span className="text-4xl sm:text-5xl font-display font-black tracking-tight leading-none block text-on-tertiary">
              We take two projects per quarter. Not three. Not four.
            </span>
            <p className="text-sm text-on-tertiary leading-relaxed font-mono mt-6">
              Every brief gets a principal and a paired engineer. That constraint is not a pitch —
              it is the actual structure. Quality is a function of attention, not headcount.
            </p>
          </div>
          <div className="pt-4 border-t border-on-tertiary/10">
            <Button type="button">Read our working principles</Button>
          </div>
        </div>
      </div>
    </section>
  )
}
