// The "settings" trigger id must match the `id` on the inline PopoverTrigger so
// the handle can anchor the popup when opened imperatively (hotkey / command
// menu). PopoverHandle.open throws if no trigger with this id is registered.
const SETTINGS_TRIGGER_ID = 'settings'

// Structural slice of Base UI's PopoverHandle — just what toggling reads/calls.
// Keeps this pure helper testable with a fake (the concrete handle satisfies it).
interface ToggleablePopoverHandle {
  readonly isOpen: boolean
  open(triggerId: string): void
  close(): void
}

// why: the popover is handle-driven (the handle's singleton store is the single
// source of truth, shared across NavTabs remounts). Toggling must read the
// handle's live `isOpen`, not per-mount React state — that desync was the
// "sometimes can't open" bug after a route change.
export function toggleSettingsPopover(handle: ToggleablePopoverHandle) {
  if (handle.isOpen) {
    handle.close()
  } else {
    handle.open(SETTINGS_TRIGGER_ID)
  }
}
