import { StoryMesh } from './story-mesh'

export function StorySolution() {
  return (
    <div className="space-y-4 border-t border-primary/20 grid grid-cols-1 relative">
      <StoryMesh />
      <div className="p-6 md:p-14 space-y-4">
        <h3 className="text-3xl font-semibold">What Tonex does</h3>
        <p>
          That's the part Tonex takes on. You give it one color — the one your product actually is —
          and it derives a coherent system around it: light and dark, every surface, contrast
          checked as you build. It runs on the same color engine behind Material Design You, so the
          whole palette holds together from one seed. But it's not a black box — re-point any role,
          pin any value, and it rebalances around your choice instead of locking you out. A safety
          net under your judgment, not a replacement for it.
        </p>
      </div>
    </div>
  )
}
