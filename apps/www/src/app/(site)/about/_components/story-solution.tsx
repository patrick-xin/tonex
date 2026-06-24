import Link from 'next/link'
import { StoryMesh } from './story-mesh'

export function StorySolution() {
  return (
    <div className="space-y-4 border-t border-primary/20 grid grid-cols-1 relative">
      <StoryMesh />
      <div className="p-6 md:p-14 space-y-4">
        <h2 className="text-3xl font-semibold">What Tonex does</h2>
        <p>
          That's the part Tonex takes on. You give it one color — the one your product actually is —
          and it derives a complete, coherent system around it: every role mapped, light and dark
          co-derived, contrast guaranteed, and what you preview is exactly what you export.
        </p>
        <p>
          Underneath is real color science — the same engine{' '}
          <Link
            rel="noreferrer"
            target="_blank"
            className="underline decoration-primary"
            href="https://m3.material.io/blog/announcing-material-you"
          >
            Material You
          </Link>{' '}
          is built on — but Tonex refuses the Material look that usually comes with it. Surfaces
          stay Tailwind-native, neutrals are yours to tune, and every value is a choice you made,
          not a default you inherited. Re-point any role, pin any color, and the system rebalances
          around your choice instead of locking you out.
        </p>
        <p>
          That's the whole stance: Tonex is the safety net, not the canvas. It guarantees the
          palette holds together — contrast, roles, light and dark — and hands you the colors plus
          the rules for using them. Where they land is still yours to decide.
        </p>
      </div>
    </div>
  )
}
