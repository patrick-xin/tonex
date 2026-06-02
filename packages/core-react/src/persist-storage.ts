// why: zustand's persist middleware writes the full PortableTheme blob to
// localStorage on every set(). A 60Hz slider drag means 60 synchronous
// localStorage.setItem calls per second on the main thread — each one a
// blocking IO write plus a cross-tab storage event broadcast. This wrapper
// sits at the StateStorage seam (between createJSONStorage and the real
// Storage) so the JSON.stringify still happens per tick (cheap, microseconds)
// but the IO call is coalesced. Issue #9.
//
// Trailing-edge debounce: every setItem replaces the pending value and
// resets the timer. After delayMs of quiet, the last value flushes. For a
// drag at 60Hz with delayMs=200, that's 12 ticks → 1 IO write.
//
// Lifecycle flush: a user dragging when they close the tab would otherwise
// lose the last <delayMs> of edits. pagehide is the modern lifecycle event
// (replaces beforeunload on mobile + matches bfcache); visibilitychange
// catches mobile background-app cases that pagehide misses on some browsers.
// Both are best-effort — the spec doesn't guarantee handler completion when
// the tab is force-killed, but in practice synchronous localStorage writes
// inside these handlers complete before unload finishes.
//
// Cross-tab consistency: another tab reading localStorage during the
// debounce window sees the previous value, not the in-flight one. This
// codebase is single-user; cross-tab races are tolerable. If a future
// multi-window mode appears, switch to a BroadcastChannel sync.

interface StateStorage {
  getItem: (name: string) => string | null | Promise<string | null>
  setItem: (name: string, value: string) => unknown | Promise<unknown>
  removeItem: (name: string) => unknown | Promise<unknown>
}

export interface DebouncedStorageOptions {
  storage: StateStorage
  delayMs: number
  // why: tests construct without lifecycle handlers so jsdom's window
  // isn't polluted across test cases. Production always opts in.
  attachLifecycleFlush?: boolean
}

export interface DebouncedStorage extends StateStorage {
  // why: explicit flush exposed so lifecycle handlers can call it (they
  // need a function reference for addEventListener) and tests can drive
  // the trailing edge without waiting on real timers. Underscore prefix
  // marks it as a power-user / test seam, not a routine call site.
  __flush: () => void
}

export function createDebouncedStorage(opts: DebouncedStorageOptions): DebouncedStorage {
  const { storage, delayMs, attachLifecycleFlush = true } = opts
  let pending: { key: string; value: string } | null = null
  let timer: ReturnType<typeof setTimeout> | null = null

  const flush = (): void => {
    if (timer !== null) {
      clearTimeout(timer)
      timer = null
    }
    if (pending === null) return
    const { key, value } = pending
    pending = null
    try {
      storage.setItem(key, value)
    } catch {
      // why: localStorage can throw on quota exceeded or in privacy modes
      // that disable storage. Swallow at the seam — the persist middleware
      // would otherwise propagate the error into the user's setter call,
      // and a slider drag is a poor place to surface a storage error. The
      // value lives in memory regardless; this just means it doesn't
      // survive reload, which matches the storage-disabled baseline.
    }
  }

  if (attachLifecycleFlush && typeof window !== 'undefined') {
    window.addEventListener('pagehide', flush)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') flush()
    })
  }

  return {
    // why: getItem reads through to the underlying storage without consulting
    // pending. In production zustand calls getItem exactly once on
    // rehydrate, before any setItem can fire (the _hydrated guard prevents
    // writes pre-rehydrate), so there's never an in-flight pending value to
    // shadow. Reading through also keeps the wrapper transparent for tests
    // and tools that mutate localStorage directly.
    getItem: (key) => storage.getItem(key),
    setItem: (key, value) => {
      pending = { key, value }
      if (timer !== null) clearTimeout(timer)
      timer = setTimeout(flush, delayMs)
    },
    removeItem: (key) => {
      // why: cancel any pending write for this key — otherwise the trailing
      // flush would resurrect the deleted entry. Keeps reset semantics
      // intact under streaming writes.
      if (pending !== null && pending.key === key) {
        pending = null
        if (timer !== null) {
          clearTimeout(timer)
          timer = null
        }
      }
      return storage.removeItem(key)
    },
    __flush: flush,
  }
}
