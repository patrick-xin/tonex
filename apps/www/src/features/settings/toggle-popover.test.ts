import { describe, expect, it, vi } from 'vitest'
import { toggleSettingsPopover } from './toggle-popover'

// why: the `S` hotkey must derive open/close from the handle's *live* state,
// not from per-mount React state. Reading component state desynced after a
// route remount was the "sometimes can't open" bug — the toggle flipped the
// stale phase and never changed the real popover. These tests pin the decision
// to `handle.isOpen`.
function fakeHandle(isOpen: boolean) {
  return {
    isOpen,
    open: vi.fn(),
    close: vi.fn(),
  }
}

describe('toggleSettingsPopover', () => {
  it('opens (anchored to the "settings" trigger) when currently closed', () => {
    const handle = fakeHandle(false)
    toggleSettingsPopover(handle)
    expect(handle.open).toHaveBeenCalledWith('settings')
    expect(handle.close).not.toHaveBeenCalled()
  })

  it('closes when currently open', () => {
    const handle = fakeHandle(true)
    toggleSettingsPopover(handle)
    expect(handle.close).toHaveBeenCalledTimes(1)
    expect(handle.open).not.toHaveBeenCalled()
  })
})
