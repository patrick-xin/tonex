export function StoryFuture() {
  return (
    <div className="space-y-4 border-t border-primary/20 grid grid-cols-1 relative">
      <div className="p-6 md:p-14 space-y-4">
        <h3 className="text-3xl font-semibold">Looking into the future</h3>
        <p>
          AI is making the design gap louder, not smaller. Agents can turn a prompt into screens in
          seconds, but the color decisions often come along for the ride: soft blur, purple
          gradients, safe neutrals, the same glow wrapped around every product. Speed is useful. A
          default mood is not a design system.
        </p>
        <p>
          If an agent picks colors, those colors still need to hold up in the places real apps
          break: contrast, light and dark mode, disabled states, elevated surfaces, charts, docs,
          the next feature someone ships three weeks later. Otherwise the work looks done right up
          until it has to be maintained.
        </p>
        <p>
          That’s the future Tonex is built for:{' '}
          <span className="font-semibold text-primary">
            humans choosing the feeling, agents helping with the labor, and a color system
            underneath both so fast work can still have a point of view.
          </span>
        </p>
      </div>
    </div>
  )
}
