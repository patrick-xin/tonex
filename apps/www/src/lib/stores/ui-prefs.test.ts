// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  selectUiPrefs,
  UI_PREFS_SCHEMA_VERSION,
  UI_PREFS_STORAGE_KEY,
  useUiPrefs,
} from './ui-prefs'

describe('useUiPrefs', () => {
  beforeEach(() => {
    localStorage.clear()
    useUiPrefs.setState({
      showExtended: false,
      twPickerEnabled: true,
      brandEnabled: false,
      tabGroupValues: {},
      _hydrated: false,
    })
  })

  afterEach(() => {
    localStorage.clear()
    useUiPrefs.setState({
      showExtended: false,
      twPickerEnabled: true,
      brandEnabled: false,
      tabGroupValues: {},
      _hydrated: false,
    })
  })

  it('default state: showExtended false, twPickerEnabled true, brandEnabled false, _hydrated false, actions defined', () => {
    const s = useUiPrefs.getState()
    expect(s.showExtended).toBe(false)
    expect(s.twPickerEnabled).toBe(true)
    expect(s.brandEnabled).toBe(false)
    expect(s.tabGroupValues).toEqual({})
    expect(s._hydrated).toBe(false)
    expect(typeof s.actions.setShowExtended).toBe('function')
    expect(typeof s.actions.setTwPickerEnabled).toBe('function')
    expect(typeof s.actions.setBrandEnabled).toBe('function')
    expect(typeof s.actions.setTabGroupValue).toBe('function')
    expect(typeof s.actions.reset).toBe('function')
  })

  it('setBrandEnabled(true) updates brandEnabled; false restores it', () => {
    useUiPrefs.getState().actions.setBrandEnabled(true)
    expect(useUiPrefs.getState().brandEnabled).toBe(true)
    useUiPrefs.getState().actions.setBrandEnabled(false)
    expect(useUiPrefs.getState().brandEnabled).toBe(false)
  })

  it('setShowExtended(true) updates showExtended', () => {
    useUiPrefs.getState().actions.setShowExtended(true)
    expect(useUiPrefs.getState().showExtended).toBe(true)
  })

  it('setShowExtended(false) after true restores showExtended', () => {
    useUiPrefs.getState().actions.setShowExtended(true)
    useUiPrefs.getState().actions.setShowExtended(false)
    expect(useUiPrefs.getState().showExtended).toBe(false)
  })

  it('setTwPickerEnabled(false) updates twPickerEnabled', () => {
    useUiPrefs.getState().actions.setTwPickerEnabled(false)
    expect(useUiPrefs.getState().twPickerEnabled).toBe(false)
  })

  it('setTwPickerEnabled(true) after false restores twPickerEnabled', () => {
    useUiPrefs.getState().actions.setTwPickerEnabled(false)
    useUiPrefs.getState().actions.setTwPickerEnabled(true)
    expect(useUiPrefs.getState().twPickerEnabled).toBe(true)
  })

  it('reset() restores showExtended false, twPickerEnabled true, brandEnabled false', () => {
    useUiPrefs.getState().actions.setShowExtended(true)
    useUiPrefs.getState().actions.setTwPickerEnabled(false)
    useUiPrefs.getState().actions.setBrandEnabled(true)
    useUiPrefs.getState().actions.reset()
    expect(useUiPrefs.getState().showExtended).toBe(false)
    expect(useUiPrefs.getState().twPickerEnabled).toBe(true)
    expect(useUiPrefs.getState().brandEnabled).toBe(false)
  })

  it('selectUiPrefs returns only pref fields — no _hydrated, no actions', () => {
    useUiPrefs.getState().actions.setShowExtended(true)
    useUiPrefs.getState().actions.setTwPickerEnabled(false)
    useUiPrefs.getState().actions.setBrandEnabled(true)
    const prefs = selectUiPrefs(useUiPrefs.getState())
    expect(prefs).toEqual({
      showExtended: true,
      twPickerEnabled: false,
      brandEnabled: true,
      tabGroupValues: {},
    })
    expect('_hydrated' in prefs).toBe(false)
    expect('actions' in prefs).toBe(false)
  })

  it('setTabGroupValue sets and updates a keyed entry in tabGroupValues', () => {
    useUiPrefs.getState().actions.setTabGroupValue('package-manager', 'pnpm')
    expect(useUiPrefs.getState().tabGroupValues['package-manager']).toBe('pnpm')
    useUiPrefs.getState().actions.setTabGroupValue('package-manager', 'bun')
    expect(useUiPrefs.getState().tabGroupValues['package-manager']).toBe('bun')
  })

  it('setTabGroupValue does not clobber unrelated group entries', () => {
    useUiPrefs.getState().actions.setTabGroupValue('package-manager', 'pnpm')
    useUiPrefs.getState().actions.setTabGroupValue('other-group', 'b')
    expect(useUiPrefs.getState().tabGroupValues['package-manager']).toBe('pnpm')
    expect(useUiPrefs.getState().tabGroupValues['other-group']).toBe('b')
  })

  it('reset() clears tabGroupValues back to empty object', () => {
    useUiPrefs.getState().actions.setTabGroupValue('package-manager', 'pnpm')
    useUiPrefs.getState().actions.reset()
    expect(useUiPrefs.getState().tabGroupValues).toEqual({})
  })

  it('partialize excludes _hydrated and actions from persisted state', () => {
    useUiPrefs.getState().actions.setShowExtended(true)
    useUiPrefs.getState().actions.setTwPickerEnabled(false)
    const stored = localStorage.getItem(UI_PREFS_STORAGE_KEY)
    if (stored === null) throw new Error('expected localStorage to contain persisted state')
    const raw = JSON.parse(stored) as { state: Record<string, unknown>; version: number }
    expect(raw.version).toBe(UI_PREFS_SCHEMA_VERSION)
    expect(raw.state.showExtended).toBe(true)
    expect(raw.state.twPickerEnabled).toBe(false)
    expect('_hydrated' in raw.state).toBe(false)
    expect('actions' in raw.state).toBe(false)
  })

  it('rehydrate round-trips showExtended and twPickerEnabled', async () => {
    localStorage.setItem(
      UI_PREFS_STORAGE_KEY,
      JSON.stringify({
        state: { showExtended: true, twPickerEnabled: false },
        version: UI_PREFS_SCHEMA_VERSION,
      }),
    )
    await useUiPrefs.persist.rehydrate()
    expect(useUiPrefs.getState().showExtended).toBe(true)
    expect(useUiPrefs.getState().twPickerEnabled).toBe(false)
    expect(useUiPrefs.getState()._hydrated).toBe(true)
  })

  it('rehydrate from older persisted state without twPickerEnabled falls back to default true', async () => {
    localStorage.setItem(
      UI_PREFS_STORAGE_KEY,
      JSON.stringify({ state: { showExtended: true }, version: UI_PREFS_SCHEMA_VERSION }),
    )
    await useUiPrefs.persist.rehydrate()
    expect(useUiPrefs.getState().showExtended).toBe(true)
    expect(useUiPrefs.getState().twPickerEnabled).toBe(true)
  })
})
