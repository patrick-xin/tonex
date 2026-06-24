import { AiSlopPanel } from './ai-slop-panel'

export function StoryLandscape() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 relative border-t border-primary/20">
      <div className="p-6 md:p-14 space-y-4">
        <h2 className="text-3xl font-semibold">The landscape now</h2>
        <p>
          Now the color problem is louder, because more of it is automated. An agent can turn a
          prompt into working screens in seconds — but the colors usually arrive as defaults: safe
          neutrals, a purple glow, the same gradient on every product. Fast, and anonymous.
        </p>
        <p>
          It isn't that the agents are careless. Color is just the easiest part to leave on
          autopilot, because nothing forces the decision — a mood borrowed from the model ships as
          readily as one authored for the product.
        </p>
      </div>
      <AiSlopPanel />
    </div>
  )
}
