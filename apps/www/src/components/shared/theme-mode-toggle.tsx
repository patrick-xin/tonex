'use client'

import { MoonIcon, SunIcon } from '@phosphor-icons/react/ssr'
import { cn } from 'tailwind-variants'
import { Toggle } from '@/components/ui/toggle'
import { useThemeToggle } from '@/features/theme-mode'

// why: the persistent visible light/dark switch (issue #124). The icon shows the
// *action* — Moon while light (click → dark), Sun while dark (click → light) —
// matching the command-menu's `isDark ? Sun : Moon` and this control's own
// action-phrased aria-label, so icon, label, and menu all agree. The data-pressed
// background is neutralised so it reads as a ghost icon button alongside its
// rail-footer siblings; the icon swap alone carries state (Base UI Toggle
// render-prop pattern), not a filled chip.
export function ThemeModeToggle({ className }: { className?: string }) {
  const { mode, isDark, label, toggle } = useThemeToggle()
  // why: mode is null until next-themes reconciles on the client (useActiveMode
  // contract). One Toggle, controlled the whole time — `pressed` stays defined
  // (isDark is false until mounted) so we never trip Base UI's uncontrolled→
  // controlled switch. While unresolved it renders disabled with an invisible,
  // same-footprint icon so we neither flash the wrong mode nor shift layout.
  const ready = mode !== null

  return (
    <Toggle
      aria-hidden={ready ? undefined : true}
      aria-label={ready ? label : undefined}
      tabIndex={ready ? undefined : -1}
      pressed={isDark}
      onPressedChange={toggle}
      size="sm"
      className={cn(
        'text-on-surface-variant hover:bg-primary/8',
        'data-pressed:bg-transparent data-pressed:text-on-surface-variant data-pressed:hover:bg-primary/8',
        className,
      )}
      render={(props, state) => (
        <button disabled={!ready} type="button" {...props}>
          {!ready ? (
            <MoonIcon weight="fill" className="size-5 opacity-0" />
          ) : state.pressed ? (
            <SunIcon weight="fill" className="size-5" />
          ) : (
            <MoonIcon weight="fill" className="size-5" />
          )}
        </button>
      )}
    />
  )
}
