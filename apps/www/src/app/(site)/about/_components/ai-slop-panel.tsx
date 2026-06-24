const chips = ['#7c3aed', '#9333ea', '#c084fc', '#f9fafb', '#111827']

export function AiSlopPanel() {
  return (
    <div className="relative min-h-120 overflow-hidden bg-[#f8fafc] p-5 text-slate-950 dark:bg-[#111827] dark:text-white">
      <div className="absolute inset-0 bg-linear-to-br from-purple-500 via-fuchsia-400 to-blue-400 opacity-55" />
      <div className="absolute left-6 top-7 h-40 w-40 rounded-full bg-purple-400 blur-3xl" />
      <div className="absolute right-3 bottom-8 h-56 w-56 rounded-full bg-blue-300 blur-3xl" />
      <div className="relative h-full min-h-108 rounded-3xl border border-white/50 bg-white/70 p-5 shadow-xl backdrop-blur-sm dark:bg-slate-950/55">
        <div className="mb-5 flex items-center justify-between">
          <div className="rounded-full bg-purple-600 px-4 py-1.5 text-xs font-bold text-white shadow-lg">
            DEFAULT COLORS
          </div>
          <div className="flex gap-1.5">
            {chips.map((chip) => (
              <span
                key={chip}
                className="size-5 rounded-full border-2 border-white shadow-md"
                style={{ backgroundColor: chip }}
              />
            ))}
          </div>
        </div>
        <div className="grid gap-4">
          <div className="rounded-3xl border border-purple-200/60 bg-white p-4 shadow-xl dark:border-purple-300/30 dark:bg-slate-900">
            <div className="mb-4 h-28 rounded-2xl bg-linear-to-r from-purple-600 via-fuchsia-500 to-indigo-500" />
            <div className="h-5 w-56 rounded-full bg-slate-200 dark:bg-white/20 mb-2" />
            <div className="h-3 w-44 rounded-full bg-slate-200 dark:bg-white/20" />
            <div className="mt-2 h-3 w-32 rounded-full bg-slate-200 dark:bg-white/20" />
          </div>
          <div className="ml-10 -mt-2 rounded-3xl border border-white/40 bg-white/90 p-4 shadow-2xl rotate-3 dark:bg-slate-900/90">
            <div className="flex items-center gap-3">
              <div className="size-14 rounded-2xl bg-purple-500 shadow-[0_0_36px_rgba(168,85,247,0.9)]" />
              <div className="space-y-1 text-sm">
                <span>colors: random</span>
                <br />
                <span>tokens: none</span>
                <br />
                <span>contrast: maybe</span>
              </div>
            </div>
          </div>
          <div className="-mt-1 mr-8 rounded-3xl border border-purple-100/40 bg-white/95 p-4 shadow-xl -rotate-2 dark:bg-slate-900/90">
            <div className="mb-3 flex gap-2">
              <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                modern
              </span>
              <span className="rounded-full bg-fuchsia-100 px-3 py-1 text-xs font-semibold text-fuchsia-700">
                sleek
              </span>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                magic
              </span>
            </div>
            <div className="rounded-2xl bg-linear-to-br from-white to-purple-100 p-4 text-sm text-slate-600 dark:from-slate-800 dark:to-purple-950 dark:text-white/70">
              vibrant gradient • glassmorphism • futuristic experience
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
