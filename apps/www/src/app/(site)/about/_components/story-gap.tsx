import { MondrianGrid } from './mondrian-grid'

export function StoryGap() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 relative">
      <MondrianGrid />
      <div className="space-y-4 p-6 md:p-14">
        <h2 className="text-3xl font-semibold">The gap</h2>
        <p>
          The tools that exist get you partway — drop in a color, watch it live on a real page. That
          part is genuinely solved, and it's the hard, visible part. But a color on a page isn't a
          system yet. Modern apps need light and dark palettes, every surface and state, contrast
          that holds, all of it wired into the stack you actually build in. That last stretch — from
          a color you like to a system you can ship — is still mostly hand-work.
        </p>
        <p>
          It's tempting to read this as bold versus safe — pick a vivid brand color, or fall back on
          natural colors. But that's a false split. A neutral can be every bit as deliberate as a
          bright one; pure black, a single gray — those are real choices, not a retreat. What makes
          a color hard isn't how loud it is. It's turning it into a system, a coherent one.
        </p>
      </div>
    </div>
  )
}
